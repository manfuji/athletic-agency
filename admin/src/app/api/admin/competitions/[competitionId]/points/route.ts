import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import { pointsConfigCreateSchema } from "@/server/schemas/points";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ competitionId: string }> }
) {
  const { competitionId } = await params;
  return runAdminApi(async () =>
    getAdminServices().pointsService.getForCompetition(competitionId)
  );
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ competitionId: string }> }
) {
  const { competitionId } = await params;
  const body = await req.json();
  const parsed = pointsConfigCreateSchema.parse(body);

  return runAdminApi(async () =>
    getAdminServices().pointsService.createForCompetition(competitionId, parsed)
  );
}
