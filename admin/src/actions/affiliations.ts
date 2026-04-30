"use server";

import { revalidatePath } from "next/cache";
import apiClient from "@/lib/axios";
import { unwrapApi } from "@/lib/unwrapApi";

export type Affiliation = { id: number; name: string };

export async function fetchAffiliations(): Promise<Affiliation[]> {
  return apiClient
    .get("/api/admin/affiliations")
    .then((res) => {
      const rows = unwrapApi<Affiliation[]>(res.data);
      return Array.isArray(rows) ? rows : [];
    })
    .catch(() => []);
}

export async function createAffiliation(payload: Omit<Affiliation, "id">) {
  return apiClient
    .post("/api/admin/create/affiliations", payload)
    .then(() => revalidatePath("/affiliations"))
    .catch((error) => ({
      error: error.response?.data?.message || "Error creating affiliation",
    }));
}

export async function updateAffiliation(
  id: number,
  payload: Partial<Omit<Affiliation, "id">>
) {
  return apiClient
    .put(`/api/admin/update/affiliations/${id}`, payload)
    .then(() => revalidatePath("/affiliations"))
    .catch((error) => ({
      error: error.response?.data?.message || "Error updating affiliation",
    }));
}

export async function deleteAffiliation(id: number) {
  return apiClient
    .delete(`/api/admin/delete/affiliations/${id}`)
    .then(() => revalidatePath("/affiliations"))
    .catch((error) => ({
      error: error.response?.data?.message || "Error deleting affiliation",
    }));
}

