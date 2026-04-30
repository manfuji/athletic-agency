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
import { addExistingPlayers, fetchPlayers } from "@/actions/players";
import { getImageUrl } from "@/lib/api";

interface ExistingPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  onPlayersAdded?: () => void;
}

interface Player {
  id: string;
  name: string;
  profile_picture: string | null;
  team_id: string | null;
}

export default function ExistingPlayer({
  isOpen,
  onClose,
  teamId,
  onPlayersAdded,
}: ExistingPlayerModalProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const loadPlayers = async () => {
      try {
        setLoading(true);
        const data = await fetchPlayers();
        const availablePlayers = data
          .filter((player: Player) => !player.team_id)
          .map((player: Player) => ({
            id: player.id,
            name: player.name,
            profile_picture: player.profile_picture,
            team_id: player.team_id,
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
  }, [isOpen]);

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
      toast.success("Players Added Successfully", {
        description: `${selectedPlayerIds.length} player(s) added to the team.`,
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
            ADD EXISTING PLAYERS
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <p className="text-center">Loading players...</p>
        ) : players.length === 0 ? (
          <div className="text-center p-6 bg-gray-100 border border-gray-300 rounded-lg">
            <p className="text-lg text-gray-600 font-semibold font-inter">
              There are currently no players with no team.
            </p>
          </div>
        ) : (
          <ExistingDataTable
            columns={cols}
            data={players.map((player) => ({
              id: player.id,
              name: player.name,
              icon: getImageUrl(player.profile_picture) || "/Avatar.svg",
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
            text="ADD PLAYERS"
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
