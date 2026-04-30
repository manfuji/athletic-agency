import { fetchPlayer } from "@/actions/players";
import { notFound } from "next/navigation";
import PlayerDetailClient from "../../setup-competition/[id]/teams/[teamId]/players/[playerId]/PlayerDetailClient";
import { PlayerDetails } from "@/types/players";

interface PlayerPageProps {
  params: Promise<{ id: string }>;
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { id } = await params;
  const player = (await fetchPlayer(id)) as PlayerDetails;

  if (!player) {
    return notFound();
  }

  return (
    <PlayerDetailClient
      player={player}
      teamId={player.team_id || ""}
      playerId={player.id || ""}
      competitionId=""
    />
  );
}
