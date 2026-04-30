import fs from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();

const SOURCE_DIRS = [
  path.join(repoRoot, "admin", "src"),
  path.join(repoRoot, "client", "src"),
];

const ROUTES_DIR = path.join(repoRoot, "admin", "src", "app", "api");

const TEXT_FILE_RE = /\.(ts|tsx|js|jsx|mjs|cjs)$/i;

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function walk(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === ".next" || e.name.startsWith(".")) {
        continue;
      }
      out.push(...(await walk(full)));
    } else if (e.isFile()) {
      if (TEXT_FILE_RE.test(e.name)) out.push(full);
    }
  }
  return out;
}

function toPosix(p) {
  return p.split(path.sep).join("/");
}

function addCall(map, { method, urlPath, file, line, raw }) {
  const key = `${method.toUpperCase()} ${urlPath}`;
  if (!map.has(key)) map.set(key, []);
  map.get(key).push({ file: toPosix(path.relative(repoRoot, file)), line, raw });
}

function extractApiCallsFromText(text, file) {
  const calls = [];
  const lines = text.split(/\r?\n/);

  // axios-style: apiClient.get("/api/..."), apiClient.post(`...`)
  const axiosRe =
    /\bapiClient\s*\.\s*(get|post|put|patch|delete)\s*\(\s*([`'"])(\/api\/[^`'"]+)\2/g;

  // generic fetch: fetch("/api/...", { method: "POST" })
  const fetchUrlRe =
    /\bfetch\s*\(\s*([`'"])(\/api\/[^`'"]+)\1\s*(?:,\s*([^)]*))?\)/g;

  // swr key usage like useSWR("/api/...", ...)
  const swrRe = /\buseSWR\s*\(\s*([`'"])(\/api\/[^`'"]+)\1/g;

  // fetchWrapper(url) where url built directly as "/api/..."
  const fetchWrapperRe = /\bfetchWrapper\s*\(\s*([`'"])(\/api\/[^`'"]+)\1/g;

  // A looser matcher for URL substrings that include /api/ but not starting with it.
  // e.g. `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/change-name/${id}`
  const embeddedApiRe = /\/api\/[a-zA-Z0-9_\-\/\[\]\:\.]+/g;

  // axios
  for (const match of text.matchAll(axiosRe)) {
    const method = match[1];
    const urlPath = match[3];
    const idx = match.index ?? 0;
    const line = text.slice(0, idx).split(/\r?\n/).length;
    calls.push({
      method: method.toUpperCase(),
      urlPath,
      file,
      line,
      raw: lines[line - 1]?.trim() ?? "",
    });
  }

  // fetch
  for (const match of text.matchAll(fetchUrlRe)) {
    const urlPath = match[2];
    const options = match[3] ?? "";
    let method = "GET";
    const m = options.match(/method\s*:\s*([`'"])(GET|POST|PUT|PATCH|DELETE)\1/i);
    if (m) method = m[2].toUpperCase();
    const idx = match.index ?? 0;
    const line = text.slice(0, idx).split(/\r?\n/).length;
    calls.push({
      method,
      urlPath,
      file,
      line,
      raw: lines[line - 1]?.trim() ?? "",
    });
  }

  // useSWR keys are cache identifiers; not necessarily network calls.
  for (const match of text.matchAll(swrRe)) {
    const urlPath = match[2];
    const idx = match.index ?? 0;
    const line = text.slice(0, idx).split(/\r?\n/).length;
    calls.push({
      method: "UNKNOWN",
      urlPath,
      file,
      line,
      raw: lines[line - 1]?.trim() ?? "",
    });
  }

  // fetchWrapper keys (method unknown; mark as GET unless options show otherwise elsewhere)
  for (const match of text.matchAll(fetchWrapperRe)) {
    const urlPath = match[2];
    const idx = match.index ?? 0;
    const line = text.slice(0, idx).split(/\r?\n/).length;
    calls.push({
      method: "GET",
      urlPath,
      file,
      line,
      raw: lines[line - 1]?.trim() ?? "",
    });
  }

  // embedded /api/ occurrences (method unknown)
  for (const match of text.matchAll(embeddedApiRe)) {
    const urlPath = match[0];
    // skip duplicates already captured
    if (calls.some((c) => c.urlPath === urlPath)) continue;
    const idx = match.index ?? 0;
    const line = text.slice(0, idx).split(/\r?\n/).length;
    calls.push({
      method: "UNKNOWN",
      urlPath,
      file,
      line,
      raw: lines[line - 1]?.trim() ?? "",
    });
  }

  return calls;
}

function normalizeCalledPath(urlPath) {
  // Drop query string for route matching
  const noQuery = urlPath.split("?")[0];
  // Convert express-style params and template placeholders to Next segment form
  const normalized = noQuery
    .replace(/:([a-zA-Z_]\w*)/g, "[$1]")
    .replace(/\$\{([a-zA-Z_]\w*)\}/g, "[$1]");
  // If a path is built by appending a variable that isn't a segment (e.g. `${q}`),
  // strip trailing bracket tokens like `[q]` only when appended without a slash.
  return normalized.replace(/]\[[a-zA-Z_]\w*\]$/g, "]").replace(/\]\]$/g, "]");
}

function routeFileToUrl(routeFile) {
  // routeFile: .../admin/src/app/api/admin/foo/[id]/route.ts -> /api/admin/foo/[id]
  const rel = path.relative(ROUTES_DIR, routeFile);
  const parts = rel.split(path.sep);
  parts.pop(); // remove route.ts
  return `/api/${toPosix(parts.join("/"))}`;
}

function canonicalizeForMatch(urlPath) {
  // Treat dynamic segment names as equivalent for matching purposes.
  return urlPath.replace(/\[[^\]]+\]/g, "[]");
}

async function extractExportedMethods(routeFile, text) {
  const methods = new Set();
  const methodRe = /export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\b/g;
  for (const m of text.matchAll(methodRe)) {
    methods.add(m[1]);
  }
  return methods;
}

async function main() {
  const called = new Map(); // key -> evidence[]

  for (const dir of SOURCE_DIRS) {
    if (!(await exists(dir))) continue;
    const files = await walk(dir);
    for (const f of files) {
      const text = await fs.readFile(f, "utf8").catch(() => "");
      if (!text) continue;
      const calls = extractApiCallsFromText(text, f);
      for (const c of calls) {
        const normPath = normalizeCalledPath(c.urlPath);
        addCall(called, {
          method: c.method,
          urlPath: normPath,
          file: c.file,
          line: c.line,
          raw: c.raw,
        });
      }
    }
  }

  // implemented routes
  const implemented = new Map(); // canonicalUrlPath -> { file, methods:Set, urlPath }
  if (await exists(ROUTES_DIR)) {
    const routeFiles = (await walk(ROUTES_DIR)).filter((f) =>
      f.endsWith(`${path.sep}route.ts`) || f.endsWith(`${path.sep}route.js`)
    );
    for (const rf of routeFiles) {
      const text = await fs.readFile(rf, "utf8").catch(() => "");
      const urlPath = routeFileToUrl(rf);
      const methods = await extractExportedMethods(rf, text);
      implemented.set(canonicalizeForMatch(urlPath), {
        file: toPosix(path.relative(repoRoot, rf)),
        urlPath,
        methods: Array.from(methods).sort(),
      });
    }
  }

  // diff
  const missingRoute = [];
  const missingMethod = [];
  const unknownMethod = [];

  for (const [key, evidence] of called.entries()) {
    const [method, urlPath] = key.split(" ", 2);
    if (method === "UNKNOWN") {
      unknownMethod.push({ urlPath, evidence });
      continue;
    }
    const impl = implemented.get(canonicalizeForMatch(urlPath));
    if (!impl) {
      missingRoute.push({ method, urlPath, evidence });
      continue;
    }
    if (!impl.methods.includes(method)) {
      missingMethod.push({ method, urlPath, implementedFile: impl.file, implementedMethods: impl.methods, evidence });
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    counts: {
      called: called.size,
      implemented: implemented.size,
      missingRoute: missingRoute.length,
      missingMethod: missingMethod.length,
      unknownMethod: unknownMethod.length,
    },
    missingRoute,
    missingMethod,
    unknownMethod,
  };

  const outPath = path.join(repoRoot, "scripts", "api-audit.report.json");
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(report, null, 2), "utf8");

  console.log(`Wrote report: ${toPosix(path.relative(repoRoot, outPath))}`);
  console.log(JSON.stringify(report.counts, null, 2));
}

await main();

