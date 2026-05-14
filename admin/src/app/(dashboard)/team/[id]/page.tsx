import { fetchTeamDetails } from "@/actions/teams";
import TeamProfileClient from "@/app/(dashboard)/setup-competition/[id]/teams/[teamId]/TeamProfileClient";
import { notFound } from "next/navigation";

interface TeamPageProps {
  params: Promise<{ id: string }>;
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { id } = await params;
  const result = await fetchTeamDetails(id);
  if ("error" in result) {
    notFound();
  }

  return (
    <TeamProfileClient
      competitionId=""
      teamId={id}
      team={result}
    />
  );
}
