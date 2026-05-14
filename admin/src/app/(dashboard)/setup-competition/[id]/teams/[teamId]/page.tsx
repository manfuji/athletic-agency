import { fetchTeamDetails } from "@/actions/teams";
import TeamProfileClient from "@/app/(dashboard)/setup-competition/[id]/teams/[teamId]/TeamProfileClient";
import { notFound } from "next/navigation";

interface TeamPageProps {
  params: Promise<{ teamId: string }>;
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { teamId } = await params;
  const result = await fetchTeamDetails(teamId);
  if ("error" in result) {
    notFound();
  }
  return (
    <TeamProfileClient
      competitionId=""
      teamId={teamId}
      team={result}
    />
  );
}
