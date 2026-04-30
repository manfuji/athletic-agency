"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchPlayerStats, createPlayerStat } from "@/actions/results";
import { StatRecord, PlayerStats } from "@/types/playerStats";
import { useQuery } from "@tanstack/react-query";

interface Player {
  id: string;
  name: string;
  teamName: string;
}

interface MatchStatsProps {
  fixtureId: string;
  players: Player[];
}

const statFields: (keyof PlayerStats)[] = [
  "total_shots",
  "shots_on_target",
  "shots_off_target",
  "dribbles_successful",
  "dribbles_attempted",
  "times_fouled",
  "dispossessed",
  "offsides",
  "tackles",
  "interceptions",
  "fouls_committed",
  "clearances",
  "dribbles_defended",
  "blocks",
  "own_goals",
  "minutes_played",
];

const emptyStats: PlayerStats = {
  total_shots: "",
  shots_on_target: "",
  shots_off_target: "",
  dribbles_successful: "",
  dribbles_attempted: "",
  times_fouled: "",
  dispossessed: "",
  offsides: "",
  tackles: "",
  interceptions: "",
  fouls_committed: "",
  clearances: "",
  dribbles_defended: "",
  blocks: "",
  own_goals: "",
  minutes_played: "",
};

export default function MatchStats({ fixtureId, players }: MatchStatsProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [stats, setStats] = useState<PlayerStats>({ ...emptyStats });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isLoading } = useQuery({
    queryKey: ["playerStats", selectedPlayerId, fixtureId],
    queryFn: async () => {
      if (!selectedPlayerId) return null;

      try {
        const response = await fetchPlayerStats(selectedPlayerId, fixtureId);
        if ("error" in response) {
          toast.error(response.error);
          setStats({ ...emptyStats });
          return null;
        }
        const results = Array.isArray(response.Results)
          ? response.Results
          : Array.isArray(response.Result)
            ? response.Result
            : [];

        if (results.length === 0) {
          console.warn(
            `No stats found for player ${selectedPlayerId} and fixture ${fixtureId}`
          );
          toast.info("No stats available for this player in this fixture.");
          setStats({ ...emptyStats });
          return null;
        }

        const relevantStats = results.filter(
          (stat: StatRecord) =>
            stat.fixture_id === fixtureId || !stat.fixture_id
        );

        const mergedStats = relevantStats.reduce(
          (acc: Partial<PlayerStats>, stat: StatRecord) => {
            statFields.forEach((key) => {
              if (stat[key] !== undefined) {
                acc[key] = stat[key].toString();
              }
            });
            return acc;
          },
          {} as Partial<PlayerStats>
        );

        const newStats = statFields.reduce(
          (acc, key) => ({
            ...acc,
            [key]: mergedStats[key] || "",
          }),
          {} as PlayerStats
        );

        setStats(newStats);
        return results;
      } catch (error) {
        console.error("Error fetching player stats:", error);
        toast.error("Failed to fetch player stats");
        setStats({ ...emptyStats });
        throw error;
      }
    },
    enabled: !!selectedPlayerId,
  });

  const handleStatChange = (field: keyof PlayerStats, value: string) => {
    if (value === "" || /^\d*$/.test(value)) {
      setStats((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!selectedPlayerId) {
      toast.error("Please select a player");
      return;
    }

    const isAnyFieldInvalid = Object.entries(stats).some(([, value]) => {
      return value !== "" && isNaN(Number(value));
    });
    if (isAnyFieldInvalid) {
      toast.error("Please ensure all filled fields contain valid numbers");
      return;
    }

    setIsSubmitting(true);
    const payloadStats = Object.fromEntries(
      Object.entries(stats)
        .filter(([, value]) => value !== "")
        .map(([key, value]) => [key, Number(value)])
    );

    const payload = {
      fixture_id: fixtureId,
      player_id: selectedPlayerId,
      ...payloadStats,
    };

    try {
      const response = await createPlayerStat(payload);
      if ("error" in response) {
        throw new Error(String(response.error));
      }
      toast.success("Player stats recorded successfully");
      setSelectedPlayerId("");
      setStats({ ...emptyStats });
    } catch (error) {
      console.error("Error recording player stats:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to record player stats"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 mt-6 rounded-lg">
      <div className="mb-6 flex gap-6">
        <div className="flex-1 flex justify-start">
          <Select
            value={selectedPlayerId}
            onValueChange={setSelectedPlayerId}
            disabled={isLoading}
          >
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select player" />
            </SelectTrigger>
            <SelectContent>
              {players.map((player) => (
                <SelectItem key={player.id} value={player.id}>
                  ({player.teamName}) {player.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 flex justify-start">
          <Button
            onClick={handleSubmit}
            className="bg-[#302464] hover:bg-[#332579] text-white font-evogria"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? "Submitting..." : "Record Player stats"}
          </Button>
        </div>
      </div>
      <div className="flex gap-6">
        <div className="flex-1 bg-[#F2F4F7] p-6 rounded-md">
          <h3 className="text-lg font-medium mb-4 font-evogria text-[#000000] text-[16px]">
            Defensive Stats
          </h3>
          {[
            { label: "Minutes played", key: "minutes_played" },
            { label: "Tackles", key: "tackles" },
            { label: "Interceptions", key: "interceptions" },
            { label: "Fouls Committed", key: "fouls_committed" },
            { label: "Offsides", key: "offsides" },
            { label: "Clearances", key: "clearances" },
            { label: "Dribbles defended", key: "dribbles_defended" },
            { label: "Blocks", key: "blocks" },
            { label: "Own goals", key: "own_goals" },
          ].map(({ label, key }) => (
            <div key={key} className="flex items-center mb-2">
              <label className="w-1/2 font-inter mb-3 font-normal text-[14px] text-[#000000]">
                {label}
              </label>
              <Input
                type="number"
                value={stats[key as keyof PlayerStats]}
                onChange={(e) =>
                  handleStatChange(key as keyof PlayerStats, e.target.value)
                }
                className="w-1/2 mb-3"
                min={0}
                step={1}
                disabled={isSubmitting || isLoading}
              />
            </div>
          ))}
        </div>
        <div className="flex-1 bg-[#F2F4F7] p-6 rounded-md">
          <h3 className="text-lg font-medium mb-4 font-evogria text-[#000000] text-[16px]">
            Offensive Stats
          </h3>
          {[
            { label: "Total shots", key: "total_shots" },
            { label: "Shots on Target", key: "shots_on_target" },
            { label: "Shots off Target", key: "shots_off_target" },
            { label: "Dribbles Successful", key: "dribbles_successful" },
            { label: "Dribbles attempted", key: "dribbles_attempted" },
            { label: "Times fouled", key: "times_fouled" },
            { label: "Dispossessed", key: "dispossessed" },
          ].map(({ label, key }) => (
            <div key={key} className="flex items-center mb-2">
              <label className="w-1/2 font-inter text-[14px] mb-3 font-normal text-[#000000]">
                {label}
              </label>
              <Input
                type="number"
                value={stats[key as keyof PlayerStats]}
                onChange={(e) =>
                  handleStatChange(key as keyof PlayerStats, e.target.value)
                }
                className="w-1/2 mb-3"
                min={0}
                step={1}
                disabled={isSubmitting || isLoading}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
