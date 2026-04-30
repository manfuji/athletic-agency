"use server";

import apiClient from "@/lib/axios";
import { unwrapApi } from "@/lib/unwrapApi";

export type ApiKeyRow = {
  id: string;
  key_hash: string;
  label: string | null;
  is_active: boolean;
  created_at: string;
  api_key?: string; // only returned on create
};

export async function fetchApiKeys(): Promise<ApiKeyRow[]> {
  return apiClient
    .get("/api/admin/api-keys")
    .then((res) => {
      const rows = unwrapApi<ApiKeyRow[]>(res.data);
      return Array.isArray(rows) ? rows : [];
    })
    .catch(() => []);
}

export async function createApiKey(label?: string | null): Promise<ApiKeyRow | { error: string }> {
  return apiClient
    .post("/api/admin/api-keys", { label: label ?? null })
    .then((res) => unwrapApi<ApiKeyRow>(res.data))
    .catch((error) => ({
      error: error.response?.data?.message || "Error creating API key",
    }));
}

export async function setApiKeyActive(id: string, is_active: boolean) {
  return apiClient
    .patch("/api/admin/api-keys", { id, is_active })
    .then((res) => res.data)
    .catch((error) => ({
      error: error.response?.data?.message || "Error updating API key",
    }));
}

export async function renameApiKey(id: string, label: string | null) {
  return apiClient
    .patch("/api/admin/api-keys", { id, label })
    .then((res) => res.data)
    .catch((error) => ({
      error: error.response?.data?.message || "Error renaming API key",
    }));
}

export async function deleteApiKey(id: string) {
  return apiClient
    .delete("/api/admin/api-keys", { data: { id } })
    .then((res) => res.data)
    .catch((error) => ({
      error: error.response?.data?.message || "Error deleting API key",
    }));
}

