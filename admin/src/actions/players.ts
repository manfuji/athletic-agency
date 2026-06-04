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

function statValue(value: unknown): string | number {
  if (typeof value === "string" || typeof value === "number") return value;
  return 0;
}

function normalizePlayersPage(unwrapped: unknown): PlayersResponse {
  const body = isRecord(unwrapped) ? unwrapped : {};
  const dataVal = body["data"];
  const pageObj = isRecord(dataVal) ? dataVal : body;

  return {
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
}

export async function fetchPlayers(
  page: number = 1
): Promise<PlayersResponse | { error: string }> {
  try {
    const res = await apiClient.get(
      `/api/admin/players/without-team?page=${page}`
    );
    return normalizePlayersPage(unwrapApi<unknown>(res.data));
  } catch (error) {
    console.error("Error fetching players:", error);
    return {
      error: "Error fetching players",
    };
  }
}

export async function fetchAllPlayersWithoutTeam(): Promise<Player[]> {
  let page = 1;
  let lastPage = 1;
  const all: Player[] = [];

  while (page <= lastPage) {
    const result = await fetchPlayers(page);
    if ("error" in result) break;
    all.push(...result.data);
    lastPage = result.last_page;
    page += 1;
  }

  return all;
}

export async function fetchPlayer(playerId: string, competitionId?: string) {
  try {
    // Build URL with optional competition_id query parameter
    let url = `/api/admin/players/${playerId}`;
    if (competitionId) {
      url += `?competition_id=${competitionId}`;
    }

    const res = await apiClient.get(url);
    const playerData = unwrapApi<Record<string, unknown>>(res.data);

    // Handle both old format (stats array) and new format (statistics object)
    let statsArray: { title: string; value: string | number }[] = [];
    let statsMap = new Map<string, string | number>();

    const statisticsRaw = playerData["statistics"];
    if (isRecord(statisticsRaw)) {
      const statistics = statisticsRaw;

      // Convert statistics object to stats array format
      // Include all fields from the API response
      statsArray = [
        { title: "matches", value: statValue(statistics["matches"]) },
        { title: "goals", value: statValue(statistics["goals"]) },
        { title: "assists", value: statValue(statistics["assists"]) },
        {
          title: "yellow cards",
          value: statValue(
            statistics["yellow_cards"] ?? statistics["yellow_card"]
          ),
        },
        {
          title: "red cards",
          value: statValue(statistics["red_cards"] ?? statistics["red_card"]),
        },
        { title: "shots on target", value: statValue(statistics["shots_on_target"]) },
        { title: "shots off target", value: statValue(statistics["shots_off_target"]) },
        { title: "shots blocked", value: statValue(statistics["shots_blocked"]) },
        { title: "shot accuracy", value: statValue(statistics["shot_accuracy"]) },
        { title: "attempted pass", value: statValue(statistics["attempted_pass"]) },
        { title: "completed pass", value: statValue(statistics["completed_pass"]) },
        { title: "key passes", value: statValue(statistics["key_passes"]) },
        { title: "pass accuracy", value: statValue(statistics["pass_accuracy"]) },
        { title: "successful dribble", value: statValue(statistics["successful_dribble"]) },
        { title: "unsuccessful dribble", value: statValue(statistics["unsuccessful_dribble"]) },
        { title: "dribble success rate", value: statValue(statistics["dribble_success_rate"]) },
        { title: "foul won", value: statValue(statistics["foul_won"]) },
        { title: "foul commited", value: statValue(statistics["foul_commited"]) },
        { title: "tackle won", value: statValue(statistics["tackle_won"]) },
        { title: "interception", value: statValue(statistics["interception"]) },
        { title: "block", value: statValue(statistics["block"]) },
        { title: "clearance", value: statValue(statistics["clearance"]) },
        { title: "saves", value: statValue(statistics["saves"]) },
        { title: "total distance", value: statValue(statistics["total_distance"]) },
        { title: "max speed", value: statValue(statistics["max_speed"]) },
        { title: "high speed running", value: statValue(statistics["high_speed_running"]) },
        { title: "sprint distance", value: statValue(statistics["sprint_distance"]) },
        { title: "no of sprints", value: statValue(statistics["no_of_sprints"]) },
        { title: "accelerations", value: statValue(statistics["accelerations"]) },
        { title: "decelerations", value: statValue(statistics["decelerations"]) },
        { title: "impacts", value: statValue(statistics["impacts"]) },
        { title: "calories", value: statValue(statistics["calories"]) },
        { title: "time in red zone", value: statValue(statistics["time_in_red_zone"]) },
        { title: "distance per min", value: statValue(statistics["distance_per_min"]) },
        { title: "dsl", value: statValue(statistics["dsl"]) },
        { title: "hid per min", value: statValue(statistics["hid_per_min"]) },
        { title: "high intensity distance", value: statValue(statistics["high_intensity_distance"]) },
        { title: "hsr per min", value: statValue(statistics["hsr_per_min"]) },
        { title: "sprint distance per min", value: statValue(statistics["sprint_distance_per_min"]) },
        { title: "step balance l", value: statValue(statistics["step_balance_l"]) },
        { title: "step balance r", value: statValue(statistics["step_balance_r"]) },
      ];

      // Also create statsMap for backward compatibility
      statsArray.forEach((stat) => {
        statsMap.set(stat.title.toLowerCase(), stat.value);
      });
    } else if (Array.isArray(playerData["stats"])) {
      // Old format: stats array
      statsArray = playerData["stats"] as {
        title: string;
        value: string | number;
      }[];
      statsMap = new Map(
        statsArray.map(
          (stat: { title: string; value: string | number }) => [
            stat.title.toLowerCase(),
            stat.value,
          ]
        )
      );
    }

    // Enrich with team name if we have a team_id
    let teamName: string | null = null;
    const teamId = playerData["team_id"];
    if (typeof teamId === "string" && teamId) {
      try {
        const teamResponse = await fetchTeamDetails(teamId);
        if (!("error" in teamResponse)) {
          teamName = teamResponse.name ?? null;
        }
      } catch {
        // Silently fail - team name will remain null
      }
    }

    const sections = Array.isArray(playerData["sections"])
      ? (playerData["sections"] as { title: string; content: string }[])
      : [];
    const teamNested = isRecord(playerData["team"])
      ? playerData["team"]
      : null;

    const player: PlayerDetails = {
      id: String(playerData["id"] ?? ""),
      team_id: (playerData["team_id"] as string | null) ?? null,
      team:
        (playerData["team_name"] as string) ||
        (teamNested?.["name"] as string) ||
        teamName,
      profile_picture: (playerData["profile_picture"] as string | null) ?? null,
      name: String(playerData["name"] ?? ""),
      nationality: String(playerData["nationality"] ?? ""),
      dob: String(playerData["dob"] ?? ""),
      weight: String(statsMap.get("weight") || playerData["weight"] || ""),
      height: String(statsMap.get("height") || playerData["height"] || ""),
      bio: sections.find((s) => s.title === "bio")?.content || null,
      position: String(statsMap.get("position") || playerData["position"] || ""),
      preferred_foot:
        (statsMap.get("preferred foot") as string) ||
        String(playerData["preferred_foot"] ?? ""),
      previous_experience:
        sections.find((s) => s.title === "previous experience")?.content ||
        null,
      reason_for_joining:
        sections.find((s) => s.title === "reason for joining")?.content ||
        null,
      created_at: String(playerData["created_at"] ?? ""),
      updated_at: String(playerData["updated_at"] ?? ""),
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
    .then((res) => normalizePlayersPage(unwrapApi<unknown>(res.data)))
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
