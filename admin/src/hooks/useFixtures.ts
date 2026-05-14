import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Fixture,
  Team,
  Stage,
  FixtureFormData,
  Group,
  GroupStanding,
} from "@/types/fixtures";
import { getAllTeamsForCompetition } from "@/actions/teams";
import { fetchGroups, fetchStandings } from "@/actions/groups";
import { getFixtures, createFixture } from "@/actions/fixtures";
import { fetchStages } from "@/actions/stages";

interface UseFixturesReturn {
  fixtures: { [date: string]: Fixture[] };
  teams: Team[];
  stages: Stage[];
  groups: Group[];
  standings: GroupStanding[];
  isLoading: boolean;
  formData: FixtureFormData;
  setFormData: (data: FixtureFormData) => void;
  handleCreateMatch: () => Promise<void>;
}

export const useFixtures = (competitionId: string): UseFixturesReturn => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<FixtureFormData>({
    stage_id: "",
    home_team_id: "",
    away_team_id: "",
    match_date: "",
    time: "00:00",
    location: "",
  });

  const { data: teams = [] } = useQuery({
    queryKey: ["teams", competitionId],
    queryFn: () => getAllTeamsForCompetition(competitionId),
  });

  const { data: groups = [] } = useQuery({
    queryKey: ["groups", competitionId],
    queryFn: () => fetchGroups(competitionId),
  });

  const { data: stages = [] } = useQuery({
    queryKey: ["stages"],
    queryFn: async () => {
      const result = await fetchStages();
      const allStages = Array.isArray(result) ? result : [];

      return allStages;
    },
  });

  // Log stage information for debugging
  useEffect(() => {
    if (Array.isArray(groups) && groups.length > 0 && Array.isArray(stages) && stages.length > 0) {
      const groupStageIds = new Set(
        groups
          .map((g) => g.stage_id)
          .filter((id): id is string => !!id)
      );
      
      if (groupStageIds.size > 0) {
        console.log("🔍 Stage Debug Info:");
        console.log("  - Stage IDs from groups:", Array.from(groupStageIds));
        console.log("  - Available stages:", stages.map((s) => ({ id: s.id, name: s.name })));
        console.log("  - Matching stages:", stages.filter((s) => groupStageIds.has(s.id)));
      }
    }
  }, [groups, stages]);

  const { data: fixturesData = {}, isLoading: isFixturesLoading } = useQuery({
    queryKey: ["fixtures", competitionId],
    queryFn: async () => {
      const data = await getFixtures(competitionId);
      return Object.fromEntries(
        Object.entries(data || {}).map(([date, matches]) => [
          new Date(date).toISOString().split("T")[0],
          Array.isArray(matches)
            ? matches.map((match) => ({
                ...match,
                match_date: new Date(match.match_date)
                  .toISOString()
                  .split("T")[0],
              }))
            : [],
        ])
      );
    },
  });

  const { data: standingsData } = useQuery({
    queryKey: ["standings", competitionId],
    queryFn: () => fetchStandings(competitionId),
  });

  const createMatchMutation = useMutation({
    mutationFn: async () => {
      return createFixture(competitionId, formData);
    },
    onSuccess: async (data) => {
      toast.success(data.message || "Fixture created successfully");
      setFormData({
        stage_id: "",
        home_team_id: "",
        away_team_id: "",
        match_date: "",
        time: "00:00",
        location: "",
      });

      await queryClient.invalidateQueries({
        queryKey: ["fixtures", competitionId],
      });
    },
    onError: (error) => {
      console.error("Error creating match:", error);
      toast.error("Failed to create match");
      throw error;
    },
  });

  const handleCreateMatch = async () => {
    await createMatchMutation.mutateAsync();
  };

  // TODO: Add type for stages
  return {
    fixtures: fixturesData,
    teams,
    stages,
    groups,
    standings:
      standingsData && "groups" in standingsData ? standingsData.groups : [],
    isLoading: isFixturesLoading || createMatchMutation.isPending,
    formData,
    setFormData,
    handleCreateMatch,
  };
};
