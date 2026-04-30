import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import { bioDataUpdateBodySchema } from "@/server/schemas/bioData";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return runAdminApi(async () => getAdminServices().bioDataService.getById(id), {
    roles: ["admin"],
  });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = bioDataUpdateBodySchema.parse(body);

  return runAdminApi(
    async (session) =>
      getAdminServices().bioDataService.update(
        session,
        id,
        {
          player_name: parsed.player_name,
          aa_stats_email: parsed.aa_stats_email,
          dob: parsed.dob,
          position: parsed.position,
          nationality: parsed.nationality,
          season_id: parsed.season_id,
          team_id: parsed.team_id,
          jersey_number: parsed.jersey_number,
          photo_url: parsed.photo_url,
        },
        {
          issue_description: parsed.issue_description,
          evidence_reference: parsed.evidence_reference,
        }
      ),
    { roles: ["admin"] }
  );
}

