"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import SearchInput from "@/reusables/SearchInput";
import Filter from "@/reusables/Filter";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, MoreVertical } from "lucide-react";
import { Player } from "@/types/players";
import AddPlayerModal from "./AddPlayerModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getImageUrl } from "@/lib/api";
import Image from "next/image";
import { deletePlayer, fetchAllPlayers } from "@/actions/players";
import { PlayersResponse } from "@/types/players";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/providers/query-provider";
import ImportPlayerStatsModal from "./ImportStatsModal";
import { ensureArray } from "@/lib/normalize";
import ImportLegacyBioDataModal from "./ImportLegacyBioDataModal";

interface PlayersTableProps {
  initialResponse: PlayersResponse;
}

export default function PlayersTable({ initialResponse }: PlayersTableProps) {
  const [currentPage, setCurrentPage] = useState(initialResponse.current_page);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("All");
  const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState(false);
  const [isImportStatsModalOpen, setIsImportStatsModalOpen] = useState(false);
  const [isImportLegacyModalOpen, setIsImportLegacyModalOpen] = useState(false);
  const [deletingPlayerId, setDeletingPlayerId] = useState<string | null>(null);

  const {
    data: playersData,
    isLoading: isPlayersLoading,
    isFetching: isPlayersFetching,
  } = useQuery({
    queryKey: ["players", currentPage],
    queryFn: () => fetchAllPlayers(currentPage),
    initialData: initialResponse,
  });

  const router = useRouter();
  const positions = ["All", "Goalkeeper", "Defender", "Midfielder", "Forward"];

  const displayPlayers = ensureArray<Player>(playersData?.data).filter(
    (player: Player) =>
      player.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedPosition === "All" ||
        player.position.toLowerCase() === selectedPosition.toLowerCase())
  );

  const goToPage = (page: number) => {
    if (page >= 1 && page <= (playersData?.last_page ?? 1) && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    setDeletingPlayerId(playerId);
    try {
      const response = await deletePlayer(playerId);
      if (response && "error" in response) {
        toast.error(response.error);
        return;
      }
      queryClient.invalidateQueries({
        queryKey: ["players"],
      });
      toast.success("Player deleted successfully!");
    } catch (error) {
      console.error("Error deleting player:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred while deleting the player"
      );
    } finally {
      setDeletingPlayerId(null);
    }
  };

  // Handle row click to navigate to player detail page
  const handleRowClick = (playerId: string) => {
    router.push(`/players/${playerId}`);
  };

  const handleImportComplete = () => {
    console.log("Import completed successfully!")
  }
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4 gap-2">
        <div className="flex items-center md:space-x-4">
          <SearchInput
            placeholder="Search by player name"
            onSearch={(query) => setSearchQuery(query)}
          />
          <Filter
            options={positions}
            placeholder="Filter by position"
            onValueChange={(value) => setSelectedPosition(value)}
          />
        </div>
        <div className="flex items-center space-x-4">
          {/* added import stats button */}
          <Button
          onClick={() => setIsImportStatsModalOpen(true)}
          className="text-black bg-white border-2 font-evogria border-gray-300"
        >
          Import Stats
        </Button>
        <Button
          onClick={() => setIsImportLegacyModalOpen(true)}
          className="text-black bg-white border-2 font-evogria border-gray-300"
        >
          Import Legacy
        </Button>
        <Button
          onClick={() => setIsAddPlayerModalOpen(true)}
          className="bg-[#302464] text-white hover:bg-[#302464] hover:text-white font-evogria"
        >
          Add Player
        </Button>
        </div>
      </div>

      {isPlayersLoading && !playersData ? (
        <div className="bg-white w-full rounded-lg shadow-md border border-[#e9e9e9] p-12 mt-4">
          <p className="text-center mt-4 font-evogria text-[17px] text-[#302464]">
            Loading players...
          </p>
        </div>
      ) : displayPlayers.length === 0 ? (
        <div className="bg-white w-full rounded-lg shadow-md border border-[#e9e9e9] p-12 mt-4">
          <p className="text-center mt-4 font-evogria text-[17px] text-[#302464]">
            {searchQuery && !playersData?.data.length
              ? "No players found."
              : searchQuery
                ? `No players found for "${searchQuery}"`
                : selectedPosition !== "All"
                  ? "No players found for the selected position"
                  : "No players found."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-[#e9e9e9]">
          <Table className="rounded-md w-[100%]">
            <TableHeader>
              <TableRow>
                <TableHead>Players ({displayPlayers.length})</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Date Joined</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayPlayers.map((player: Player) => (
                <TableRow
                  key={player.id}
                  onClick={() => handleRowClick(player.id)}
                  className="cursor-pointer hover:bg-gray-100"
                >
                  <TableCell>
                    <div className="flex items-center">
                      <Image
                        src={
                          getImageUrl(player.profile_picture) || "/Avatar.svg"
                        }
                        alt={player.name}
                        height={40}
                        width={40}
                        className="w-8 h-8 object-cover rounded-full mr-2"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/Avatar.svg";
                        }}
                      />
                      <span>{player.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{player.position}</TableCell>
                  <TableCell>
                    {new Date(player.created_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4 text-[#98A2B3]" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="font-inter hover:font-semibold"
                          disabled={deletingPlayerId === player.id}
                          onClick={() => {
                            handleDeletePlayer(player.id);
                          }}
                        >
                          <span style={{ color: "#D92D20" }}>
                            {deletingPlayerId === player.id
                              ? "Removing..."
                              : "Remove Player"}
                          </span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {playersData?.last_page > 1 && (
            <>
              <hr />
              <div className="flex justify-between items-center mt-4 px-4 pb-4">
                <Button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1 || isPlayersFetching}
                  className="bg-white text-black font-bold border border-gray-600 flex items-center gap-1 hover:text-white hover:bg-[#332579]"
                >
                  <ArrowLeft className="h-4 w-4" /> Previous
                </Button>
                <div className="flex gap-1">
                  {Array.from(
                    { length: playersData.last_page },
                    (_, i) => i + 1
                  ).map((page) => (
                    <Button
                      key={page}
                      onClick={() => goToPage(page)}
                      disabled={isPlayersFetching}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      className={
                        page === currentPage
                          ? "bg-[#F9F5FF] text-[#302464] hover:bg-[#EDE9FE]"
                          : "bg-white text-[#302464] border-gray-300 hover:bg-gray-100"
                      }
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === playersData?.last_page || isPlayersFetching}
                  className="bg-white text-black font-bold border border-gray-600 flex items-center gap-1 hover:text-white hover:bg-[#332579]"
                >
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {isAddPlayerModalOpen && (
        <AddPlayerModal
          isOpen={isAddPlayerModalOpen}
          onClose={() => setIsAddPlayerModalOpen(false)}
          onPlayerAdded={() => {
            queryClient.invalidateQueries({
              queryKey: ["players"],
            });
            setIsAddPlayerModalOpen(false);
          }}
        />
      )}

      {isImportStatsModalOpen && (
         <ImportPlayerStatsModal
          isOpen={isImportStatsModalOpen}
          onClose={() => setIsImportStatsModalOpen(false)}
          onImportComplete={handleImportComplete}
        />
      )}

      {isImportLegacyModalOpen && (
        <ImportLegacyBioDataModal
          isOpen={isImportLegacyModalOpen}
          onClose={() => setIsImportLegacyModalOpen(false)}
          onImported={() => {
            queryClient.invalidateQueries({ queryKey: ["players"] });
            queryClient.invalidateQueries({ queryKey: ["legacy-bio-data"] });
          }}
        />
      )}
    </div>
  );
}
