"use server";

import apiClient from "@/lib/axios";
import { unwrapApi } from "@/lib/unwrapApi";
import { ResultsResponse } from "@/types/fixtures";
import type { StatRecord } from "@/types/playerStats";

export interface SubmitResultPayload {
  fixture_id: string;
  home_team_score: string;
  away_team_score: string;
  winner_team_id?: string;
}

export type MatchLogsOk = {
  logs: {
    current_page: number;
    data: Array<Record<string, unknown>>;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: { url: string | null; label: string; active: boolean }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
};

export type PlayerStatsFetchResponse =
  | { Results?: StatRecord[]; Result?: StatRecord[] }
  | { error: string };

export async function fetchResults(
  competitionId: string
): Promise<ResultsResponse> {
  return await apiClient
    .get<ResultsResponse>(`/api/admin/result/${competitionId}`)
    .then((res) => unwrapApi<ResultsResponse>(res.data))
    .catch((error) => {
      console.error("Error fetching results:", error);
      return { Results: {} };
    });
}

export async function submitResult(
  payload: SubmitResultPayload
): Promise<Record<string, unknown> | { error: string }> {
  return await apiClient
    .post("/api/admin/create/result", payload)
    .then((res) => unwrapApi(res.data) as Record<string, unknown>)
    .catch((error) => {
      console.error("Error submitting result:", error);
      return {
        error: error.response?.data?.message || "Error submitting result",
      };
    });
}

export async function createGoal(payload: {
  fixture_id: string;
  scorer_id: string;
  assist_player_id?: string | null;
  goal_type: string;
}): Promise<Record<string, unknown> | { error: string }> {
  return await apiClient
    .post("/api/admin/create/goal", payload)
    .then((res) => unwrapApi(res.data) as Record<string, unknown>)
    .catch((error) => {
      console.error("Error creating goal:", error);
      return {
        error: "Error creating goal",
      };
    });
}

export async function createCard(payload: {
  fixture_id: string;
  player_id: string;
  card_type: string;
}): Promise<Record<string, unknown> | { error: string }> {
  return await apiClient
    .post("/api/admin/create/card", payload)
    .then((res) => unwrapApi(res.data) as Record<string, unknown>)
    .catch((error) => {
      console.error("Error creating card:", error);
      return {
        error: "Error creating card",
      };
    });
}

export async function createSubstitution(payload: {
  fixture_id: string;
  player_out_id: string;
  player_in_id: string;
  team_id: string;
}): Promise<Record<string, unknown> | { error: string }> {
  return await apiClient
    .post("/api/admin/create/subs", payload)
    .then((res) => unwrapApi(res.data) as Record<string, unknown>)
    .catch((error) => {
      console.error("Error creating substitution:", error);
      return {
        error: "Error creating substitution",
      };
    });
}

export async function fetchMatchLogs(
  fixtureId: string,
  page: number = 1
): Promise<MatchLogsOk | { error: string }> {
  return await apiClient
    .get(`/api/admin/match_log/${fixtureId}?page=${page}`)
    .then((res) => unwrapApi(res.data) as MatchLogsOk)
    .catch((error) => {
      console.error("Error fetching match logs:", error);
      return {
        error: "Error fetching match logs",
      };
    });
}

export async function deleteMatchLog(
  logId: string
): Promise<Record<string, unknown> | { error: string }> {
  return await apiClient
    .delete(`/api/admin/delete/match_log/${logId}`)
    .then((res) => unwrapApi(res.data) as Record<string, unknown>)
    .catch((error) => {
      console.error("Error deleting match log:", error);
      console.log(error.response?.data?.message);
      return {
        error: error.response?.data?.message || "Error deleting match log",
      };
    });
}

export async function fetchPlayerStats(
  playerId: string,
  fixtureId?: string
): Promise<PlayerStatsFetchResponse> {
  const q = fixtureId
    ? `?fixture_id=${encodeURIComponent(fixtureId)}`
    : "";
  return await apiClient
    .get(`/api/admin/player/stat/${playerId}${q}`)
    .then(
      (res) =>
        unwrapApi(res.data) as Exclude<PlayerStatsFetchResponse, { error: string }>
    )
    .catch((error) => {
      console.error("Error fetching player stats:", error);
      return {
        error: "Error fetching player stats",
      };
    });
}

export async function createPlayerStat(
  payload: Record<string, string | number>
): Promise<Record<string, unknown> | { error: string }> {
  return await apiClient
    .post("/api/admin/create/stats", payload)
    .then((res) => unwrapApi(res.data) as Record<string, unknown>)
    .catch((error) => {
      console.error("Error creating player stat:", error);
      return {
        error: "Error creating player stat",
      };
    });
}
