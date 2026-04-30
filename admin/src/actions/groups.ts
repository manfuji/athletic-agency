"use server";

import apiClient from "@/lib/axios";
import { unwrapApi } from "@/lib/unwrapApi";
import { Group, GroupStanding } from "@/types/fixtures";
import { ensureArray } from "@/lib/normalize";

interface GroupResponse {
  id: string;
  group_name: string;
  competition_id: string;
  stage_id: string;
  created_at: string;
  updated_at: string;
  teams: {
    id: string;
    name: string;
    pivot: unknown;
  }[];
}

export async function saveGroupSetup(competitionId: string, group: Group) {
  const validTeams = group.teams
    .filter((team) => team !== null)
    .map((team) => (typeof team === "string" ? team : team!.id));

  if (validTeams.length === 0) return;

  // Import fetchStages to get valid stage_id
  const { fetchStages } = await import("@/actions/stages");

  return await fetchGroups(competitionId)
    .then(async (existingGroups) => {
      // Handle case where fetchGroups returns an error object
      const groupsArray = Array.isArray(existingGroups) ? existingGroups : [];
      
      const groupNames = groupsArray
        .filter((g: Group) => typeof g.title === "string")
        .map((g: Group) => g.title.toLowerCase());

      if (groupNames.includes(group.title.toLowerCase())) {
        return {
          error: `Duplicate group name: ${group.title}`,
        };
      }

      // Get valid stage_id - use group.stage_id if available, otherwise fetch stages
      let stageId = group.stage_id;
      
      if (!stageId || stageId.trim() === "") {
        // Fetch available stages and use the first one
        const stages = await fetchStages();
        if (Array.isArray(stages) && stages.length > 0) {
          stageId = stages[0].id;
          console.log(`Using first available stage: ${stages[0].name} (${stageId})`);
        } else {
          console.error("No stages available. Cannot create group without a valid stage_id.");
          return {
            error: "No stages available. Please ensure stages are set up for this competition.",
          };
        }
      }

      console.log(`Creating group "${group.title}" with stage_id: ${stageId}`);

      const payload = {
        group_name: group.title,
        team_id: validTeams,
        competition_id: competitionId,
        stage_id: stageId,
      };

      return apiClient
        .post("/api/admin/create/group-setup", payload)
        .then((res) => unwrapApi(res.data))
        .catch((error) => {
          console.error("Error in API request:", error.response?.data || error.message);
          throw error;
        });
    })
    .catch((error) => {
      console.error("Error saving group setup:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Error saving group setup";
      const errorDetails = error.response?.data?.errors || {};
      
      console.error("Error details:", {
        message: errorMessage,
        errors: errorDetails,
      });
      
      return {
        error: errorMessage,
        details: errorDetails,
      };
    });
}

export async function fetchGroups(competitionId: string): Promise<Group[]> {
  return await apiClient
    .get(`/api/admin/competitions/${competitionId}/groups`)
    .then((res) => {
      const raw = unwrapApi<GroupResponse[] | undefined>(res.data);
      const list = Array.isArray(raw) ? raw : [];
      return list.map((group: GroupResponse) => ({
        id: group.id,
        title: group.group_name,
        competition_id: group.competition_id,
        stage_id: group.stage_id,
        created_at: group.created_at,
        updated_at: group.updated_at,
        teams: ensureArray<GroupResponse["teams"][number]>(group.teams).map(
          (team) => ({
          id: team.id,
          name: team.name,
          pivot: team.pivot,
        })
        ),
        isSaved: true,
      }));
    })
    .catch((error) => {
      console.error("Error fetching groups:", error);
      return [] as Group[];
    });
}

export async function fetchStandings(competitionId: string) {
  return await apiClient
    .get<{
      competition_id: string;
      groups: GroupStanding[];
    }>(`/api/admin/competition_teams/${competitionId}`)
    .then((res) => {
      return unwrapApi<{ competition_id: string; groups: GroupStanding[] }>(
        res.data
      );
    })
    .catch((error) => {
      console.error("Error fetching standings:", error);
      return {
        error: "Error fetching standings",
      };
    });
}

export async function updateGroupSetup(
  competitionId: string,
  groupId: string,
  group: Group
) {
  const validTeams = group.teams
    .filter((team) => team !== null)
    .map((team) => (typeof team === "string" ? team : team!.id));

  if (validTeams.length === 0) {
    return { error: "At least one team is required" };
  }

  const payload = {
    group_name: group.title,
    team_id: validTeams,
    stage_id: group.stage_id,
  };

  return await apiClient
    .patch(`/api/admin/competitions/${competitionId}/groups/${groupId}`, payload)
    .then((res) => unwrapApi(res.data))
    .catch((error) => {
      console.error("Error updating group setup:", error);
      return {
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Error updating group setup",
      };
    });
}

export async function deleteGroupSetup(competitionId: string, groupId: string) {
  return await apiClient
    .delete(`/api/admin/competitions/${competitionId}/groups/${groupId}`)
    .then((res) => unwrapApi(res.data))
    .catch((error) => {
      console.error("Error deleting group setup:", error);
      return {
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Error deleting group setup",
      };
    });
}
