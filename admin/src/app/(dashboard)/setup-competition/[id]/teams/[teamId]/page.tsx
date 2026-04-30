import { fetchTeamDetails } from "@/actions/teams";
import TeamProfileClient from "@/app/(dashboard)/setup-competition/[id]/teams/[teamId]/TeamProfileClient";
interface TeamPageProps {
  params: Promise<{ teamId: string }>;
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { teamId } = await params;
  const team = await fetchTeamDetails(teamId);
  return (
    <TeamProfileClient
      competitionId=""
      teamId={teamId}
      team={team}
    />
  );
}
