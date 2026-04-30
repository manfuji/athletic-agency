"use server";

import { revalidatePath } from "next/cache";
import apiClient from "@/lib/axios";
import { unwrapApi } from "@/lib/unwrapApi";

export type FootPreference = {
  id: number;
  code: string;
  description: string | null;
};

export async function fetchFootPreferences(): Promise<FootPreference[]> {
  return apiClient
    .get("/api/admin/foot-preferences")
    .then((res) => {
      const rows = unwrapApi<FootPreference[]>(res.data);
      return Array.isArray(rows) ? rows : [];
    })
    .catch(() => []);
}

export async function createFootPreference(payload: Omit<FootPreference, "id">) {
  return apiClient
    .post("/api/admin/create/foot-preferences", payload)
    .then(() => revalidatePath("/foot-preferences"))
    .catch((error) => ({
      error: error.response?.data?.message || "Error creating foot preference",
    }));
}

export async function updateFootPreference(
  id: number,
  payload: Partial<Omit<FootPreference, "id">>
) {
  return apiClient
    .put(`/api/admin/update/foot-preferences/${id}`, payload)
    .then(() => revalidatePath("/foot-preferences"))
    .catch((error) => ({
      error: error.response?.data?.message || "Error updating foot preference",
    }));
}

export async function deleteFootPreference(id: number) {
  return apiClient
    .delete(`/api/admin/delete/foot-preferences/${id}`)
    .then(() => revalidatePath("/foot-preferences"))
    .catch((error) => ({
      error: error.response?.data?.message || "Error deleting foot preference",
    }));
}

