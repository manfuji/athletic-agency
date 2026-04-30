"use server";

import apiClient from "@/lib/axios";
import { unwrapApi } from "@/lib/unwrapApi";
import { CompetitionPointsConfig } from "@/types/points";

export async function fetchCompetitionPoints(
  competitionId: string
): Promise<CompetitionPointsConfig> {
  return await apiClient
    .get(`/api/admin/competitions/${competitionId}/points`)
    .then((res) => unwrapApi<CompetitionPointsConfig>(res.data))
    .catch((error) => {
      console.error("Error fetching competition points:", error);
      return {
        id: null,
        competition_id: competitionId,
        win_points: 3,
        draw_points: 1,
        loss_points: 0,
        tie_break_order: ["points", "goal_difference", "goals_for"],
        is_active: true,
      };
    });
}

export async function saveCompetitionPoints(
  competitionId: string,
  payload: {
    win_points: number;
    draw_points: number;
    loss_points: number;
    tie_break_order: string[];
    is_active?: boolean;
  }
) {
  return await apiClient
    .post(`/api/admin/competitions/${competitionId}/points`, payload)
    .then((res) => unwrapApi(res.data))
    .catch((error) => {
      console.error("Error saving competition points:", error);
      return {
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Error saving competition points",
      };
    });
}

export async function updateCompetitionPoints(
  competitionId: string,
  configId: string,
  payload: {
    win_points?: number;
    draw_points?: number;
    loss_points?: number;
    tie_break_order?: string[];
    is_active?: boolean;
  }
) {
  return await apiClient
    .patch(`/api/admin/competitions/${competitionId}/points/${configId}`, payload)
    .then((res) => unwrapApi(res.data))
    .catch((error) => {
      console.error("Error updating competition points:", error);
      return {
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Error updating competition points",
      };
    });
}

export async function deleteCompetitionPoints(
  competitionId: string,
  configId: string
) {
  return await apiClient
    .delete(`/api/admin/competitions/${competitionId}/points/${configId}`)
    .then((res) => unwrapApi(res.data))
    .catch((error) => {
      console.error("Error deleting competition points:", error);
      return {
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Error deleting competition points",
      };
    });
}
