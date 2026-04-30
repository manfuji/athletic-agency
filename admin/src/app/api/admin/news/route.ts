import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import { newsCreateSchema } from "@/server/schemas/news";

export async function GET() {
  return runAdminApi(async () => getAdminServices().newsService.list());
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = newsCreateSchema.parse(body);
  return runAdminApi(
    async () => getAdminServices().newsService.create(parsed),
    { roles: ["admin"] }
  );
}
