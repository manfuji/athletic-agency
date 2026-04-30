"use server";

import apiClient from "@/lib/axios";
import { unwrapApi } from "@/lib/unwrapApi";
import type { CompetitionType } from "@/types/competition-types";

export async function fetchCompetitionTypes(): Promise<CompetitionType[]> {
  return await apiClient
    .get("/api/admin/competition-types")
    .then((res) => {
      const data = unwrapApi<unknown[]>(res.data);
      return (Array.isArray(data) ? data : []) as CompetitionType[];
    })
    .catch((error) => {
      console.error("Error fetching competition types:", error);
      return [] as CompetitionType[];
    });
}

export async function createCompetitionType(data: {
  name: string;
  description?: string;
}): Promise<
  Record<string, unknown> | { error: string }
> {
  return await apiClient
    .post("/api/admin/create/competition-types", data)
    .then((res) => unwrapApi(res.data) as Record<string, unknown>)
    .catch((error) => {
      console.error("Error creating competition type:", error);
      return {
        error:
          error.response?.data?.message || "Error creating competition type",
      };
    });
}

export async function updateCompetitionType(
  id: string,
  data: { name?: string; description?: string }
): Promise<Record<string, unknown> | { error: string }> {
  return await apiClient
    .patch(`/api/admin/update/competition-types/${id}`, data)
    .then((res) => unwrapApi(res.data) as Record<string, unknown>)
    .catch((error) => {
      console.error("Error updating competition type:", error);
      return {
        error:
          error.response?.data?.message || "Error updating competition type",
      };
    });
}

export async function deleteCompetitionType(
  id: string
): Promise<Record<string, unknown> | { error: string }> {
  return await apiClient
    .delete(`/api/admin/delete/competition-types/${id}`)
    .then((res) => unwrapApi(res.data) as Record<string, unknown>)
    .catch((error) => {
      console.error("Error deleting competition type:", error);
      return {
        error:
          error.response?.data?.message || "Error deleting competition type",
      };
    });
}
