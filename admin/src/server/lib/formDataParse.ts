export function formString(fd: FormData, key: string): string | null {
  const v = fd.get(key);
  if (v == null) return null;
  if (typeof v === "string") return v;
  return null;
}

export function formFile(fd: FormData, key: string): File | null {
  const v = fd.get(key);
  if (v instanceof File && v.size > 0) return v;
  return null;
}

export function slugifyBase(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function uniqueSlug(name: string): string {
  const base = slugifyBase(name) || "team";
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}
