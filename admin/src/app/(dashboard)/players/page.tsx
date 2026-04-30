export const dynamic = 'force-dynamic'

import PlayersHeader from "@/components/homepage/players/PlayersHeader";
import PlayersTable from "@/components/homepage/players/PlayersTable";
import { fetchAllPlayers } from "@/actions/players";

export default async function Players() {
  const initialPage = 1;
  const playersData = await fetchAllPlayers(initialPage);

  return (
    <div className="w-[100%] px-4 py-6 ml-0 mr-auto">
      <PlayersHeader />
      {playersData && (
        <PlayersTable
          initialResponse={playersData}
          // initialPage={playersData.current_page}
          // totalPages={playersData.last_page}
          // totalPlayers={playersData.total}
        />
      )}
    </div>
  );
}
