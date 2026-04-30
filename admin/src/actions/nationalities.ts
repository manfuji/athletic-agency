"use server";

import { revalidatePath } from "next/cache";
import apiClient from "@/lib/axios";
import { unwrapApi } from "@/lib/unwrapApi";

export type Nationality = { id: number; code: string; name: string };

export async function fetchNationalities(): Promise<Nationality[]> {
  return apiClient
    .get("/api/admin/nationalities")
    .then((res) => {
      const rows = unwrapApi<Nationality[]>(res.data);
      return Array.isArray(rows) ? rows : [];
    })
    .catch(() => []);
}

export async function createNationality(payload: Omit<Nationality, "id">) {
  return apiClient
    .post("/api/admin/create/nationalities", payload)
    .then(() => revalidatePath("/nationalities"))
    .catch((error) => ({
      error: error.response?.data?.message || "Error creating nationality",
    }));
}

export async function updateNationality(
  id: number,
  payload: Partial<Omit<Nationality, "id">>
) {
  return apiClient
    .put(`/api/admin/update/nationalities/${id}`, payload)
    .then(() => revalidatePath("/nationalities"))
    .catch((error) => ({
      error: error.response?.data?.message || "Error updating nationality",
    }));
}

export async function deleteNationality(id: number) {
  return apiClient
    .delete(`/api/admin/delete/nationalities/${id}`)
    .then(() => revalidatePath("/nationalities"))
    .catch((error) => ({
      error: error.response?.data?.message || "Error deleting nationality",
    }));
}

