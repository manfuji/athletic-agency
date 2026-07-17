"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Camera, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SearchInput from "@/reusables/SearchInput";
import CreatePlayer from "@/components/players/CreatePlayer";
import ExistingPlayer from "@/components/players/ExistingPlayer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/lib/player/data-table";
import { columns } from "@/lib/player/columns";
import CreateTeams from "@/components/teams/CreateTeams";
import { getImageUrl } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Team } from "@/types/teams";
import { fetchTeamDetails, fetchTeamPlayers, updateTeam } from "@/actions/teams";
import { ensureArray } from "@/lib/normalize";
import { Player } from "@/types/players";
import { queryClient } from "@/providers/query-provider";
import { toBase64 } from "@/lib/to-base-64";
import { shimmer } from "@/components/common/shimmer";
import { motion } from "framer-motion";
interface TeamProfileClientProps {
  competitionId: string;
  teamId: string;
  team: Team;
}

export default function TeamProfileClient({
  competitionId,
  teamId,
  team,
}: TeamProfileClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState<string>("All");
  const [isNewPlayerModalOpen, setIsNewPlayerModalOpen] = useState(false);
  const [isExistingPlayerModalOpen, setIsExistingPlayerModalOpen] =
    useState(false);
  const [isEditTeamModalOpen, setIsEditTeamModalOpen] = useState(false);
  const router = useRouter();
  const coverPhotoInputRef = useRef<HTMLInputElement>(null);
  const { data: teamDetails } = useQuery<Team>({
    queryKey: ["team", teamId],
    queryFn: async () => {
      const result = await fetchTeamDetails(teamId);
      if ("error" in result) {
        throw new Error(result.error);
      }
      let players = ensureArray<NonNullable<Team["players"]>[number]>(
        result.players
      );
      if (players.length === 0) {
        const fallback = await fetchTeamPlayers(teamId);
        if (Array.isArray(fallback) && fallback.length > 0) {
          players = fallback as NonNullable<Team["players"]>;
        }
      }
      return { ...result, players };
    },
    initialData: team,
    staleTime: 30_000,
    refetchOnMount: false,
  });

  const filteredPlayers = teamDetails?.players
    ? teamDetails?.players
        .filter((player) =>
          player.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .filter(
          (player) =>
            positionFilter === "All" || player.position === positionFilter
        )
    : [];

  const positions = [
    "All",
    ...new Set((teamDetails?.players ?? []).map((p) => p.position)),
  ];

  const handleRowClick = (player: Player) => {
    const basePath = competitionId
      ? `/setup-competition/${competitionId}/teams/${teamId}`
      : `/team/${teamId}`;
    router.push(`${basePath}/players/${player.id}`);
  };

  const handleEditCoverClick = () => {
    if (coverPhotoInputRef.current) {
      coverPhotoInputRef.current.click();
    }
  };

  const handleCoverPhotoChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Only PNG and JPG are supported.");
      return;
    }

    const formData = new FormData();
    formData.append("coverPhoto", file);

    try {
      await updateTeam(teamId, formData);
      queryClient.invalidateQueries({
        queryKey: ["team"],
      });
      queryClient.invalidateQueries({
        queryKey: ["team", teamId],
      });
      toast.success("Cover photo updated successfully");
      if (coverPhotoInputRef.current) coverPhotoInputRef.current.value = "";
    } catch (error) {
      console.error("Error updating cover photo:", error);
      toast.error("Failed to update cover photo");
    }
  };

  return (
    <div className="w-full">
      <div className="relative w-full h-[250px] mx-0 px-0">
        {teamDetails?.coverPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full"
          >
            <Image
              key={teamDetails?.coverPhoto || "no-cover"}
              src={
                getImageUrl(teamDetails?.coverPhoto) ||
                "https://ui-avatars.com/api/?name=Team+Cover"
              }
              alt="Team Cover"
              width={100}
              height={100}
              sizes="100vw"
              placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </motion.div>
        )}
        <div className="absolute bottom-2 right-2">
          <Button
            className="border-[0.1rem] border-[#bbc0c7] text-blue-950 bg-white hover:bg-blue-950 hover:text-white font-evogria text-[16px]"
            onClick={handleEditCoverClick}
          >
            <Camera className="mr-2" /> EDIT COVER
          </Button>
          <input
            type="file"
            ref={coverPhotoInputRef}
            className="hidden"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleCoverPhotoChange}
          />
        </div>
      </div>
      <div className="w-[85%] px-4 pb-6 pt-3 ml-0 mr-auto">
        <div className="relative flex gap-2 mb-10">
          <div className="absolute -top-[4rem] left-4">
            {teamDetails?.logo && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Image
                  src={
                    getImageUrl(teamDetails?.logo) ||
                    `https://ui-avatars.com/api/?name=${teamDetails?.name}`
                  }
                  alt={teamDetails?.name}
                  width={150}
                  height={150}
                  className="rounded-full object-cover w-[150px] h-[150px]"
                />
              </motion.div>
            )}
          </div>
          <div className="flex flex-col items-start justify-between gap-3 pl-48">
            <span className="bg-gray-200 rounded-full py-1 px-3 font-medium font-inter">
              {teamDetails?.category?.name}
            </span>
            <h1 className="text-2xl font-evogria">{teamDetails?.name}</h1>
            <p className="text-gray-700 font-inter">
              {teamDetails?.description}
            </p>
            <Button
              className="z-50 text-blue-950 mt-4 border-[0.1rem] border-[#bbc0c7] text-[16px] font-evogria bg-white hover:bg-blue-950 hover:text-white"
              onClick={() => setIsEditTeamModalOpen(true)}
            >
              EDIT TEAM DETAILS
            </Button>
          </div>
        </div>
        <div className="mt-6 ml-4 mr-auto">
          <div className="flex items-center justify-between mb-4 mt-6">
            <div className="flex items-center justify-center">
              <SearchInput
                placeholder="Search player by name"
                onSearch={setSearchQuery}
              />
              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue className="font-inter">
                    {positionFilter === "All"
                      ? "Filter by position"
                      : positionFilter}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {positions.map((pos) => (
                    <SelectItem key={pos} value={pos}>
                      {pos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="flex items-center gap-2 bg-[#302464] font-evogria text-white hover:bg-[#1f1656]">
                    ADD PLAYER
                    <ChevronDown size={20} className="text-white" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuItem
                    onClick={() => setIsNewPlayerModalOpen(true)}
                    className="font-inter text-[14px] font-medium text-[#344054]"
                  >
                    Add new player
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsExistingPlayerModalOpen(true)}
                    className="font-inter text-[14px] font-medium text-[#344054]"
                  >
                    Add or move player
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <DataTable
            columns={columns}
            data={filteredPlayers as Player[]}
            meta={{ teamId, playerCount: teamDetails?.players?.length || 0 }}
            onRowClick={handleRowClick}
          />
          {isNewPlayerModalOpen && (
            <CreatePlayer
              isOpen={isNewPlayerModalOpen}
              onClose={() => setIsNewPlayerModalOpen(false)}
              teamId={teamId}
            />
          )}
          {isExistingPlayerModalOpen && (
            <ExistingPlayer
              isOpen={isExistingPlayerModalOpen}
              onClose={() => setIsExistingPlayerModalOpen(false)}
              teamId={teamId}
              onPlayersAdded={() => {
                queryClient.invalidateQueries({
                  queryKey: ["team", teamId],
                });
                queryClient.invalidateQueries({
                  queryKey: ["team"],
                });
              }}
            />
          )}
          {isEditTeamModalOpen && (
            <CreateTeams
              isOpen={isEditTeamModalOpen}
              onClose={() => setIsEditTeamModalOpen(false)}
              competitionId={competitionId}
              onTeamAdded={() => {
                queryClient.invalidateQueries({
                  queryKey: ["team"],
                });
                queryClient.invalidateQueries({
                  queryKey: ["team", teamId],
                });
              }}
              isEditMode={true}
              teamId={teamId}
              initialData={{
                logo: getImageUrl(teamDetails?.logo),
                name: teamDetails?.name || "",
                shortCode: teamDetails?.shortCode || "",
                category: teamDetails?.category_id || "",
                description: teamDetails?.description || "",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
