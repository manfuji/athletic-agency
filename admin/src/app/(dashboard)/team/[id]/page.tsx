import { fetchTeamDetails } from "@/actions/teams";
import TeamProfileClient from "@/app/(dashboard)/setup-competition/[id]/teams/[teamId]/TeamProfileClient";
interface TeamPageProps {
  params: Promise<{ id: string }>;
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { id } = await params;
  const team = await fetchTeamDetails(id);

  return (
    <TeamProfileClient
      competitionId=""
      teamId={id}
      team={team}
    />
  );
}
