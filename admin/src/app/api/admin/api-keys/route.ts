import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import { z } from "zod";

const createSchema = z.object({ label: z.string().nullable().optional() });
const updateSchema = z.object({
  id: z.string().uuid(),
  label: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
});

export async function GET() {
  return runAdminApi(async () => getAdminServices().apiKeyService.list(), {
    roles: ["admin"],
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = createSchema.parse(body);
  return runAdminApi(async () => getAdminServices().apiKeyService.create(parsed.label ?? null), {
    roles: ["admin"],
  });
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const parsed = updateSchema.parse(body);

  return runAdminApi(async () => {
    if (typeof parsed.is_active === "boolean") {
      return getAdminServices().apiKeyService.setActive(parsed.id, parsed.is_active);
    }
    if ("label" in parsed) {
      return getAdminServices().apiKeyService.rename(parsed.id, parsed.label ?? null);
    }
    return { message: "No changes" };
  }, { roles: ["admin"] });
}

export async function DELETE(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const id = String(body.id ?? "");
  return runAdminApi(async () => getAdminServices().apiKeyService.delete(id), {
    roles: ["admin"],
  });
}

