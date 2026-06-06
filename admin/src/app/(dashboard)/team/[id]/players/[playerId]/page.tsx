import { fetchPlayer } from "@/actions/players";
import PlayerDetailClient from "@/app/(dashboard)/setup-competition/[id]/teams/[teamId]/players/[playerId]/PlayerDetailClient";
import { PlayerDetails } from "@/types/players";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; playerId: string }>;
}) {
  const { id: teamId, playerId } = await params;
  const result = await fetchPlayer(playerId);
  const data = result && !("error" in result) ? (result as PlayerDetails) : null;

  return (
    <>
      {data && (
        <PlayerDetailClient
          player={data}
          competitionId=""
          teamId={teamId}
          playerId={playerId}
        />
      )}
      {!data && (
        <div className="w-[85%] px-4 py-6 ml-0 mr-auto">
          <h1 className="font-evogria text-[#1D2939] text-[25px] font-normal">
            Player Not Found
          </h1>
          <p className="font-inter text-[16px] text-[#475467] font-normal">
            The requested player could not be found.
          </p>
        </div>
      )}
    </>
  );
}
