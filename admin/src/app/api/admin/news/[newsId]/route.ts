import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import { newsUpdateSchema } from "@/server/schemas/news";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ newsId: string }> }
) {
  const { newsId } = await params;
  return runAdminApi(async () => getAdminServices().newsService.getById(newsId));
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ newsId: string }> }
) {
  const body = await req.json();
  const parsed = newsUpdateSchema.parse(body);
  const { newsId } = await params;
  return runAdminApi(
    async () => getAdminServices().newsService.update(newsId, parsed),
    { roles: ["admin"] }
  );
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ newsId: string }> }
) {
  const { newsId } = await params;
  return runAdminApi(
    async () => getAdminServices().newsService.deleteNews(newsId),
    { roles: ["admin"] }
  );
}
