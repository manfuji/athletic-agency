export const dynamic = "force-dynamic";

import { getTeams } from "@/actions/competition";
import Teams from "@/components/competitions/teams";

export default async function TeamsPage({
  searchParams,
  params,
}: {
  searchParams: Promise<{ page: number }>;
  params: Promise<{ competitionSlug: string }>;
}) {
  const { page } = await searchParams;
  const { competitionSlug } = await params;
  const teams = await getTeams(page ? page : 1, competitionSlug);

  return (
    <div>
      <Teams teams={teams} />
    </div>
  );
}
