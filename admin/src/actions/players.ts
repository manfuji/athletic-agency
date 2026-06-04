"use server";

import apiClient from "@/lib/axios";
import { AxiosError } from "axios";
import { PlayerDetails } from "@/types/players";
import { fetchTeamDetails } from "@/actions/teams";
import { unwrapApi } from "@/lib/unwrapApi";
import { ensureArray, ensureNumber } from "@/lib/normalize";
import type { PlayersResponse, Player } from "@/types/players";

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export async function fetchPlayers(page: number = 1) {
  try {
    const res = await apiClient.get(
      `/api/admin/players/without-team?page=${page}`
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching players:", error);
    return {
      error: "Error fetching players",
    };
  }
}

export async function fetchPlayer(playerId: string, competitionId?: string) {
  try {
    // Build URL with optional competition_id query parameter
    let url = `/api/admin/players/${playerId}`;
    if (competitionId) {
      url += `?competition_id=${competitionId}`;
    }

    const res = await apiClient.get(url);
    const playerData = res.data.data;

    // Handle both old format (stats array) and new format (statistics object)
    let statsArray: { title: string; value: string | number }[] = [];
    let statsMap = new Map<string, string | number>();

    if (playerData.statistics) {
      // New format: statistics object
      const statistics = playerData.statistics;

      // Convert statistics object to stats array format
      // Include all fields from the API response
      statsArray = [
        { title: "matches", value: statistics.matches || 0 },
        { title: "goals", value: statistics.goals || 0 },
        { title: "assists", value: statistics.assists || 0 },
        { title: "yellow cards", value: statistics.yellow_cards || statistics.yellow_card || 0 },
        { title: "red cards", value: statistics.red_cards || statistics.red_card || 0 },
        { title: "shots on target", value: statistics.shots_on_target || 0 },
        { title: "shots off target", value: statistics.shots_off_target || 0 },
        { title: "shots blocked", value: statistics.shots_blocked || 0 },
        { title: "shot accuracy", value: statistics.shot_accuracy || 0 },
        { title: "attempted pass", value: statistics.attempted_pass || 0 },
        { title: "completed pass", value: statistics.completed_pass || 0 },
        { title: "key passes", value: statistics.key_passes || 0 },
        { title: "pass accuracy", value: statistics.pass_accuracy || 0 },
        { title: "successful dribble", value: statistics.successful_dribble || 0 },
        { title: "unsuccessful dribble", value: statistics.unsuccessful_dribble || 0 },
        { title: "dribble success rate", value: statistics.dribble_success_rate || 0 },
        { title: "foul won", value: statistics.foul_won || 0 },
        { title: "foul commited", value: statistics.foul_commited || 0 },
        { title: "tackle won", value: statistics.tackle_won || 0 },
        { title: "interception", value: statistics.interception || 0 },
        { title: "block", value: statistics.block || 0 },
        { title: "clearance", value: statistics.clearance || 0 },
        { title: "saves", value: statistics.saves || 0 },
        { title: "total distance", value: statistics.total_distance || 0 },
        { title: "max speed", value: statistics.max_speed || 0 },
        { title: "high speed running", value: statistics.high_speed_running || 0 },
        { title: "sprint distance", value: statistics.sprint_distance || 0 },
        { title: "no of sprints", value: statistics.no_of_sprints || 0 },
        { title: "accelerations", value: statistics.accelerations || 0 },
        { title: "decelerations", value: statistics.decelerations || 0 },
        { title: "impacts", value: statistics.impacts || 0 },
        { title: "calories", value: statistics.calories || 0 },
        { title: "time in red zone", value: statistics.time_in_red_zone || 0 },
        { title: "distance per min", value: statistics.distance_per_min || 0 },
        { title: "dsl", value: statistics.dsl || 0 },
        { title: "hid per min", value: statistics.hid_per_min || 0 },
        { title: "high intensity distance", value: statistics.high_intensity_distance || 0 },
        { title: "hsr per min", value: statistics.hsr_per_min || 0 },
        { title: "sprint distance per min", value: statistics.sprint_distance_per_min || 0 },
        { title: "step balance l", value: statistics.step_balance_l || 0 },
        { title: "step balance r", value: statistics.step_balance_r || 0 },
      ];

      // Also create statsMap for backward compatibility
      statsArray.forEach((stat) => {
        statsMap.set(stat.title.toLowerCase(), stat.value);
      });
    } else if (playerData.stats && Array.isArray(playerData.stats)) {
      // Old format: stats array
      statsArray = playerData.stats;
      statsMap = new Map(
        playerData.stats.map(
          (stat: { title: string; value: string | number }) => [
            stat.title.toLowerCase(),
            stat.value,
          ]
        )
      );
    }

    // Enrich with team name if we have a team_id
    let teamName: string | null = null;
    if (playerData.team_id) {
      try {
        const teamResponse = await fetchTeamDetails(playerData.team_id);
        if (!("error" in teamResponse)) {
          teamName = teamResponse.name ?? null;
        }
      } catch {
        // Silently fail - team name will remain null
      }
    }

    const player: PlayerDetails = {
      id: playerData.id,
      team_id: playerData.team_id,
      // Prefer explicit team_name or nested team.name if API adds it, else use resolved teamName
      team: playerData.team_name || playerData.team?.name || teamName,
      profile_picture: playerData.profile_picture,
      name: playerData.name,
      nationality: playerData.nationality,
      dob: playerData.dob,
      weight: String(statsMap.get("weight") || playerData.weight || ""),
      height: String(statsMap.get("height") || playerData.height || ""),
      bio:
        playerData.sections?.find(
          (s: { title: string; content: string }) => s.title === "bio"
        )?.content || null,
      position: String(statsMap.get("position") || playerData.position || ""),
      preferred_foot: (statsMap.get("preferred foot") as string) || playerData.preferred_foot || "",
      previous_experience:
        playerData.sections?.find(
          (s: { title: string; content: string }) =>
            s.title === "previous experience"
        )?.content || null,
      reason_for_joining:
        playerData.sections?.find(
          (s: { title: string; content: string }) =>
            s.title === "reason for joining"
        )?.content || null,
      created_at: playerData.created_at,
      updated_at: playerData.updated_at,
      stats: statsArray,
    };

    return player;
  } catch (error) {
    console.error("Error fetching player:", error);
    return {
      error: "Error fetching player",
    };
  }
}

export async function createPlayer(teamId: string, formData: FormData) {
  try {
    const res = await apiClient.post(
      `/api/admin/create/teams/${teamId}/players`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return res.data
  } catch (error) {
    console.error("Error creating player:", error);
    return {
      error:
        error instanceof AxiosError
          ? error.response?.data?.message
          : "Failed to create player",
    };
  }
}

export async function updateTeamPlayer(
  teamId: string,
  playerId: string,
  formData: FormData
) {
  try {
    const res = await apiClient.post(
      `/api/admin/update/teams/${teamId}/players/${playerId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error("Error updating player:", error);
    return {
      error:
        error instanceof AxiosError
          ? error.response?.data?.message
          : "Failed to update player",
    };
  }
}

export async function updatePlayer(playerId: string, formData: FormData) {
  try {
    const res = await apiClient.post(
      `/api/admin/update/players/${playerId}`,
      formData
    );
    return res.data;
  } catch (error) {
    console.error("Error updating player:", error);
    return {
      error:
        error instanceof AxiosError
          ? error.response?.data?.message
          : "Failed to update player",
    };
  }
}

export async function addExistingPlayers(teamId: string, playerIds: string[]) {
  try {
    const responses = await Promise.all(
      playerIds.map(
        (playerId) =>
          apiClient
            .patch(`/api/admin/create/teams/${teamId}/players/${playerId}`)
            .then((response) => response.data) // Only take the data we need
      )
    );
    return { success: true, data: responses };
  } catch (error) {
    console.error("Error adding existing players:", error);
    return {
      error:
        error instanceof AxiosError
          ? error.response?.data?.message
          : "Failed to add players",
    };
  }
}

export async function removePlayerFromTeam(playerId: string, teamId: string) {
  try {
    const res = await apiClient.patch(`/api/admin/remove/players/${playerId}`, {
      team_id: teamId || null,
    });
    return res?.data;
  } catch (error) {
    console.error("Error removing player from team:", error);
    return {
      error:
        error instanceof AxiosError
          ? error.response?.data?.message
          : "Failed to remove player from team",
    };
  }
}

export async function deletePlayer(playerId: string) {
  try {
    const res = await apiClient.delete(`/api/admin/delete/player/${playerId}`);
    return res?.data;
  } catch (error) {
    console.error("Error deleting player:", error);
    return {
      error:
        error instanceof AxiosError
          ? error.response?.data?.message
          : "Failed to delete player",
    };
  }
}

export async function createStandalonePlayer(formData: FormData) {
  try {
    const res = await apiClient.post("/api/admin/create/players", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("res", res);
    return res.data;
  } catch (error) {
    console.error("Error creating standalone player:", error);
    return {
      error:
        error instanceof AxiosError
          ? error.response?.data?.message
          : "Error creating standalone player",
    };
  }
}

export async function fetchAllPlayers(page: number = 1) {
  // try {
  //   const res = await apiClient.get(`/api/admin/players?page=${page}`);
  //   return res.data;
  // } catch (error) {
  //   console.error("Error fetching all players:", error);
  //   throw new Error(
  //     error instanceof Error ? error.message : "Failed to fetch all players"
  //   );
  // }
  return await apiClient
    .get(`/api/admin/players?page=${page}`)
    .then((res) => {
      const unwrapped = unwrapApi<unknown>(res.data);
      const body = isRecord(unwrapped) ? unwrapped : {};
      const dataVal = body["data"];
      const pageObj = isRecord(dataVal) ? dataVal : body;

      const normalized: PlayersResponse = {
        current_page: ensureNumber(pageObj["current_page"], 1),
        data: ensureArray<Player>(pageObj["data"]),
        first_page_url: String(pageObj["first_page_url"] ?? ""),
        from: ensureNumber(pageObj["from"], 0),
        last_page: ensureNumber(pageObj["last_page"], 1),
        last_page_url: String(pageObj["last_page_url"] ?? ""),
        links: ensureArray(pageObj["links"]),
        next_page_url: (pageObj["next_page_url"] as string | null | undefined) ?? null,
        path: String(pageObj["path"] ?? ""),
        per_page: ensureNumber(pageObj["per_page"], 10),
        prev_page_url: (pageObj["prev_page_url"] as string | null | undefined) ?? null,
        to: ensureNumber(pageObj["to"], 0),
        total: ensureNumber(pageObj["total"], 0),
      };

      return normalized;
    })
    .catch((error) => {
      console.error("Error fetching all players:", error);
      const empty: PlayersResponse = {
        current_page: 1,
        data: [],
        first_page_url: "",
        from: 0,
        last_page: 1,
        last_page_url: "",
        links: [],
        next_page_url: null,
        path: "",
        per_page: 10,
        prev_page_url: null,
        to: 0,
        total: 0,
      };
      return empty;
    });
}
