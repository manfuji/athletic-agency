import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Team, Group, KnockoutGame, Stage } from "@/types/fixtures";
// import { fetchTeams, saveGroupSetup, fetchGroups } from '@/lib/api';
import {
  deleteGroupSetup,
  fetchGroups,
  saveGroupSetup,
  updateGroupSetup,
} from "@/actions/groups";
import { fetchTeams } from "@/actions/teams";
import { fetchStages } from "@/actions/stages";
import { ensureArray } from "@/lib/normalize";

interface UseGroupsReturn {
  groups: Group[];
  knockoutGames: KnockoutGame[];
  teams: Team[];
  stages: Stage[];
  isStagesLoading: boolean;
  isLoading: boolean;
  isSaving: boolean;
  isAddingGroup: boolean;
  isAddingKnockoutGame: boolean;
  addGroup: () => Promise<void>;
  updateGroupTitle: (id: string, title: string) => void;
  addGroupTeam: (groupId: string) => void;
  updateGroupTeam: (groupId: string, index: number, teamId: string) => void;
  removeGroupTeam: (groupId: string, index: number) => void;
  addKnockoutGame: () => Promise<void>;
  updateKnockoutTitle: (id: string, title: string) => void;
  addKnockoutTeam: (gameId: string) => void;
  updateKnockoutTeam: (gameId: string, index: number, teamId: string) => void;
  removeKnockoutTeam: (gameId: string, index: number) => void;
  deleteGroup: (groupId: string) => Promise<void>;
  deleteKnockoutGame: (gameId: string) => Promise<void>;
  getAvailableTeamsForGroup: () => Team[];
  getAvailableTeamsForKnockout: () => Team[];
  saveFixtures: () => Promise<void>;
}

export const useGroups = (competitionId: string): UseGroupsReturn => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [knockoutGames, setKnockoutGames] = useState<KnockoutGame[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [isAddingKnockoutGame, setIsAddingKnockoutGame] = useState(false);

  const { data: stages = [], isLoading: isStagesLoading } = useQuery({
    queryKey: ["stages"],
    queryFn: fetchStages,
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [teamsData, groupsData] = await Promise.all([
          fetchTeams(competitionId) as Promise<{ data: Team[] }>,
          fetchGroups(competitionId) as Promise<Group[]>,
        ]);
        setTeams(teamsData.data);

        const groupStages = groupsData
          .filter((group) => group.title.toLowerCase().includes("group"))
          .map((group) => ({
            id: group.id,
            title: group.title,
            competition_id: group.competition_id,
            stage_id: group.stage_id,
            created_at: group.created_at,
            updated_at: group.updated_at,
            teams: ensureArray<Group["teams"][number]>(group.teams).length
              ? ensureArray<Group["teams"][number]>(group.teams).map((team) => ({
                  id: team?.id || "",
                  name: team?.name || "",
                }))
              : [null],
            isSaved: true,
          }));

        const knockoutStages = groupsData
          .filter((group) => !group.title.toLowerCase().includes("group"))
          .map((group) => ({
            id: group.id,
            title: group.title,
            stage_id: group.stage_id,
            teams: ensureArray<Group["teams"][number]>(group.teams).length
              ? ensureArray<Group["teams"][number]>(group.teams).map((team) => ({
                  id: team?.id || "",
                  name: team?.name || "",
                }))
              : [null],
            isSaved: true,
          }));

        setGroups(groupStages);
        setKnockoutGames(knockoutStages);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [competitionId]);

  const addGroup = async () => {
    setIsAddingGroup(true);
    try {
      const stageId = stages[0]?.id ?? "";
      if (!stageId) {
        return;
      }

      setGroups((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          title: `Group ${prev.length + 1}`,
          competition_id: competitionId,
          stage_id: stageId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          teams: [null],
          isSaved: false,
        },
      ]);
    } finally {
      setIsAddingGroup(false);
    }
  };

  const updateGroupTitle = (id: string, title: string) => {
    setGroups((prev) =>
      prev.map((group) => (group.id === id ? { ...group, title } : group))
    );
  };

  const addGroupTeam = (groupId: string) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === groupId &&
        ensureArray<Group["teams"][number]>(group.teams).length < 4
          ? { ...group, teams: [...group.teams, null] }
          : group
      )
    );
  };

  const updateGroupTeam = (groupId: string, index: number, teamId: string) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
              ...group,
              teams: group.teams.map((team, i) =>
                i === index
                  ? {
                      id: teamId,
                      name: teams.find((t) => t.id === teamId)?.name || "",
                    }
                  : team
              ),
            }
          : group
      )
    );
  };

  const removeGroupTeam = (groupId: string, index: number) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? { ...group, teams: group.teams.filter((_, i) => i !== index) }
          : group
      )
    );
  };

  const addKnockoutGame = async () => {
    setIsAddingKnockoutGame(true);
    try {
      const fallbackStageId =
        groups[0]?.stage_id ?? stages[0]?.id ?? "";

      if (!fallbackStageId) {
        return;
      }

      setKnockoutGames((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          title: `Match ${prev.length + 1}`,
          stage_id: fallbackStageId,
          teams: [null],
          isSaved: false,
        },
      ]);
    } finally {
      setIsAddingKnockoutGame(false);
    }
  };

  const updateKnockoutTitle = (id: string, title: string) => {
    setKnockoutGames((prev) =>
      prev.map((game) => (game.id === id ? { ...game, title } : game))
    );
  };

  const addKnockoutTeam = (gameId: string) => {
    setKnockoutGames((prev) =>
      prev.map((game) =>
        game.id === gameId && game.teams.length < 2
          ? { ...game, teams: [...game.teams, null] }
          : game
      )
    );
  };

  const updateKnockoutTeam = (
    gameId: string,
    index: number,
    teamId: string
  ) => {
    setKnockoutGames((prev) =>
      prev.map((game) =>
        game.id === gameId
          ? {
              ...game,
              teams: game.teams.map((team, i) =>
                i === index
                  ? {
                      id: teamId,
                      name: teams.find((t) => t.id === teamId)?.name || "",
                    }
                  : team
              ),
            }
          : game
      )
    );
  };

  const removeKnockoutTeam = (gameId: string, index: number) => {
    setKnockoutGames((prev) =>
      prev.map((game) =>
        game.id === gameId
          ? { ...game, teams: game.teams.filter((_, i) => i !== index) }
          : game
      )
    );
  };

  const deleteGroup = async (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;

    if (group.isSaved) {
      const res = await deleteGroupSetup(competitionId, groupId);
      if (res && typeof res === "object" && "error" in res) {
        toast.error(String(res.error));
        return;
      }
    }
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
  };

  const deleteKnockoutGame = async (gameId: string) => {
    const game = knockoutGames.find((g) => g.id === gameId);
    if (!game) return;
    if (game.isSaved) {
      const res = await deleteGroupSetup(competitionId, gameId);
      if (res && typeof res === "object" && "error" in res) {
        toast.error(String(res.error));
        return;
      }
    }
    setKnockoutGames((prev) => prev.filter((g) => g.id !== gameId));
  };

  const getAvailableTeamsForGroup = (): Team[] => {
    const selectedTeamIds = groups
      .flatMap((group) => group.teams)
      .filter((team): team is { id: string; name: string } => team !== null)
      .map((team) => team.id);
    return teams.filter((team) => !selectedTeamIds.includes(team.id));
  };

  const getAvailableTeamsForKnockout = (): Team[] => {
    const selectedTeamIds = knockoutGames
      .flatMap((game) => game.teams)
      .filter((team): team is { id: string; name: string } => team !== null)
      .map((team) => team.id);
    return teams.filter((team) => !selectedTeamIds.includes(team.id));
  };

  const saveFixtures = async () => {
    if (!competitionId) {
      toast.error("Cannot save: Competition ID is missing");
      return;
    }

    const allItems = [...groups, ...knockoutGames];
    const persistableItems = allItems.filter((item) =>
      item.teams.some((team) => team !== null)
    );

    if (persistableItems.length === 0) {
      toast.error("No new fixtures to save");
      return;
    }

    setIsSaving(true);
    try {
      const savePromises = persistableItems.map((item) => {
        const validTeams = item.teams
          .filter((team): team is { id: string; name: string } => team !== null)
          .map((team) => team.id);
        const createdAt =
          "created_at" in item && typeof item.created_at === "string"
            ? item.created_at
            : new Date().toISOString();

        const payload: Group = {
          ...item,
          competition_id: competitionId,
          stage_id: item.stage_id || groups[0]?.stage_id || "",
          created_at: createdAt,
          updated_at: new Date().toISOString(),
          teams: validTeams.map((teamId) => ({
            id: teamId,
            name: teams.find((team) => team.id === teamId)?.name || "",
          })),
          isSaved: item.isSaved,
        };

        if (item.isSaved) {
          return updateGroupSetup(competitionId, item.id, payload);
        }

        return saveGroupSetup(competitionId, payload);
      });

      const results = await Promise.all(savePromises);
      const firstError = results.find(
        (r) => r && typeof r === "object" && "error" in r
      ) as { error?: unknown } | undefined;
      if (firstError?.error) {
        throw new Error(String(firstError.error));
      }

      const groupsData = await fetchGroups(competitionId);
      const groupStages = groupsData
        .filter((group: Group) => group.title.toLowerCase().includes("group"))
        .map((group: Group) => ({
          id: group.id,
          title: group.title,
          competition_id: group.competition_id,
          stage_id: group.stage_id,
          created_at: group.created_at,
          updated_at: group.updated_at,
          teams: group.teams.length
            ? group.teams
                .filter(
                  (team): team is { id: string; name: string } => team !== null
                )
                .map((team) => ({ id: team.id, name: team.name }))
            : [null],
          isSaved: true,
        }));
      const knockoutStages = groupsData
        .filter((group: Group) => !group.title.toLowerCase().includes("group"))
        .map((group: Group) => ({
          id: group.id,
          title: group.title,
          stage_id: group.stage_id,
          teams: group.teams.length
            ? group.teams
                .filter(
                  (team): team is { id: string; name: string } => team !== null
                )
                .map((team) => ({ id: team.id, name: team.name }))
            : [null],
          isSaved: true,
        }));

      setGroups(groupStages);
      setKnockoutGames(knockoutStages);
      toast.success("Fixtures saved successfully");
    } catch (error) {
      toast.error("Failed to save fixtures");
      console.error("Error saving fixtures:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    groups,
    knockoutGames,
    teams,
    stages,
    isStagesLoading,
    isLoading,
    isSaving,
    isAddingGroup,
    isAddingKnockoutGame,
    addGroup,
    updateGroupTitle,
    addGroupTeam,
    updateGroupTeam,
    removeGroupTeam,
    addKnockoutGame,
    updateKnockoutTitle,
    addKnockoutTeam,
    updateKnockoutTeam,
    removeKnockoutTeam,
    deleteGroup,
    deleteKnockoutGame,
    getAvailableTeamsForGroup,
    getAvailableTeamsForKnockout,
    saveFixtures,
  };
};
