"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CustomButton from "@/reusables/CustomButton";
import { cols } from "@/lib/player/player-columns";
import { ExistingDataTable } from "@/lib/player/player-data-table";
import { toast } from "sonner";
import {
  addExistingPlayers,
  fetchAllPlayersAcrossPages,
} from "@/actions/players";
import { fetchAllTeams } from "@/actions/teams";
import { getImageUrl } from "@/lib/api";

interface ExistingPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  onPlayersAdded?: () => void;
}

interface PlayerRow {
  id: string;
  name: string;
  profile_picture: string | null;
  team_id: string | null;
  currentTeam: string | null;
}

export default function ExistingPlayer({
  isOpen,
  onClose,
  teamId,
  onPlayersAdded,
}: ExistingPlayerModalProps) {
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const loadPlayers = async () => {
      try {
        setLoading(true);
        setSelectedPlayerIds([]);
        const [allPlayers, teams] = await Promise.all([
          fetchAllPlayersAcrossPages(),
          fetchAllTeams(),
        ]);
        const teamNameById = new Map(
          teams.map((team) => [team.id, team.name] as const)
        );

        // Include unassigned players and players on other teams (for move/reassign).
        const availablePlayers = allPlayers
          .filter((player) => player.team_id !== teamId)
          .map((player) => ({
            id: player.id,
            name: player.name,
            profile_picture: player.profile_picture,
            team_id: player.team_id,
            currentTeam: player.team_id
              ? teamNameById.get(player.team_id) ?? "Unknown team"
              : null,
          }));
        setPlayers(availablePlayers);
      } catch {
        setPlayers([]);
        toast.error("Failed to load available players");
      } finally {
        setLoading(false);
      }
    };
    loadPlayers();
  }, [isOpen, teamId]);

  const handleRowSelectionChange = (rowSelection: Record<string, boolean>) => {
    const selectedIds = Object.keys(rowSelection)
      .filter((key) => rowSelection[key])
      .map((index) => players[parseInt(index)].id);
    setSelectedPlayerIds(selectedIds);
  };

  const handleSubmit = async () => {
    if (selectedPlayerIds.length === 0) {
      toast.error("Please select at least one player.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await addExistingPlayers(teamId, selectedPlayerIds);
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      const movingCount = selectedPlayerIds.filter((id) => {
        const player = players.find((p) => p.id === id);
        return Boolean(player?.team_id);
      }).length;
      const addingCount = selectedPlayerIds.length - movingCount;

      const parts: string[] = [];
      if (addingCount > 0) parts.push(`${addingCount} added`);
      if (movingCount > 0) parts.push(`${movingCount} moved`);

      toast.success("Players updated", {
        description: `${parts.join(", ")} to this team.`,
      });
      onPlayersAdded?.();
      onClose();
    } catch (error) {
      console.error("Failed to add players:", error);
      toast.error("Failed to add players");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isButtonDisabled =
    selectedPlayerIds.length === 0 ||
    loading ||
    players.length === 0 ||
    isSubmitting;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[95vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="text-[24px] font-evogria font-normal text-[#000000] dark:text-white">
            ADD OR MOVE PLAYERS
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <p className="text-center">Loading players...</p>
        ) : players.length === 0 ? (
          <div className="text-center p-6 bg-gray-100 border border-gray-300 rounded-lg">
            <p className="text-lg text-gray-600 font-semibold font-inter">
              There are no other players available to add or move.
            </p>
          </div>
        ) : (
          <ExistingDataTable
            columns={cols}
            data={players.map((player) => ({
              id: player.id,
              name: player.name,
              icon: getImageUrl(player.profile_picture) || "/Avatar.svg",
              currentTeam: player.currentTeam,
            }))}
            onRowSelectionChange={handleRowSelectionChange}
          />
        )}
        <DialogFooter className="flex justify-end space-x-6 mt-6 w-full">
          <CustomButton
            text="CANCEL"
            type="button"
            onClick={onClose}
            bgColor="bg-transparent"
            color="text-[#344054]"
            className="hover:bg-white"
          />
          <CustomButton
            text="ADD / MOVE PLAYERS"
            bgColor={isButtonDisabled ? "bg-gray-400" : "bg-[#302464]"}
            className={`text-white ${
              isButtonDisabled
                ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
                : "bg-[#302464] hover:bg-[#1f1656]"
            }`}
            onClick={handleSubmit}
            disabled={isButtonDisabled}
            isLoading={isSubmitting}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
