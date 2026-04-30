"use server";

import apiClient from "@/lib/axios";
import { unwrapApi } from "@/lib/unwrapApi";

export interface CollatorRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  contact?: string | null;
  email_verified_at?: string | null;
  created_at: string;
  updated_at?: string;
  role?: string;
  deleted_at?: string | null;
  status?: number;
  assigned_competitions_count?: number;
}

export async function fetchAllCollators(status?: string): Promise<CollatorRow[]> {
  return await apiClient
    .get("/api/admin/collators", {
      params: {
        status,
      },
    })
    .then((res) => {
      const data = unwrapApi<unknown[]>(res.data);
      return (Array.isArray(data) ? data : []) as CollatorRow[];
    })
    .catch((error) => {
      console.error("Error fetching collators:", error);
      return [];
    });
}

export async function fetchCompetitionCollators(
  competitionId: string
): Promise<CollatorRow[]> {
  return await apiClient
    .get(`/api/admin/competitions/${competitionId}/collators`)
    .then((res) => {
      const data = unwrapApi<unknown[]>(res.data);
      return (Array.isArray(data) ? data : []) as CollatorRow[];
    })
    .catch((error) => {
      console.error("Error fetching collators:", error);
      return [];
    });
}

export async function assignCollators(
  competitionId: string,
  collatorIds: string[]
): Promise<Record<string, unknown> | { error: string }> {
  return await apiClient
    .post(`/api/admin/assign-collator/${competitionId}`, {
      collators: collatorIds,
    })
    .then((res) => unwrapApi(res.data) as Record<string, unknown>)
    .catch((error) => {
      console.error("Error assigning collators:", error);
      return {
        error: error.response?.data?.message || "Failed to assign collators",
      };
    });
}

export async function assignCollator(
  competitionId: string,
  collatorId: string
): Promise<Record<string, unknown> | { error: string }> {
  return await apiClient
    .post(`/api/admin/competitions/${competitionId}/collators`, {
      collator_id: collatorId,
    })
    .then((res) => unwrapApi(res.data) as Record<string, unknown>)
    .catch((error) => {
      console.error("Error assigning collator:", error);
      return {
        error: error.response?.data?.message || "Error assigning collator",
      };
    });
}

export async function removeCollatorFromCompetition(
  competitionId: string,
  collatorId: string
): Promise<Record<string, unknown> | { error: string }> {
  return await apiClient
    .delete(`/api/admin/remove/collator/${competitionId}`, {
      data: {
        collator_id: collatorId,
      },
    })
    .then((res) => unwrapApi(res.data) as Record<string, unknown>)
    .catch((error) => {
      console.error("Error removing collator:", error);
      return {
        error: error.response?.data?.message || "Error removing collator",
      };
    });
}

export async function deleteCollator(
  collatorId: string
): Promise<Record<string, unknown> | { error: string }> {
  return await apiClient
    .delete(`/api/admin/delete/collator/${collatorId}`)
    .then((res) => unwrapApi(res.data) as Record<string, unknown>)
    .catch((error) => {
      console.error("Error deleting collator:", error);
      return {
        error: error.response?.data?.message || "Failed to delete collator",
      };
    });
}

export async function addCollator(collator: {
  first_name: string;
  last_name: string;
  email: string;
  contact: string;
}): Promise<Record<string, unknown> | { error: unknown }> {
  return await apiClient
    .post("/api/admin/register/collator", collator)
    .then((res) => unwrapApi(res.data) as Record<string, unknown>)
    .catch((error) => {
      console.error("Error adding collator:", error);
      if (error.response?.data?.errors) {
        return {
          error: error.response?.data || "Error adding collator",
        };
      }
      return {
        error: error.response?.data?.message || "Error adding collator",
      };
    });
}
