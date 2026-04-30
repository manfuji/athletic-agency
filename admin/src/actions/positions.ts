"use server";

import { revalidatePath } from "next/cache";
import apiClient from "@/lib/axios";
import { unwrapApi } from "@/lib/unwrapApi";

export type Position = { id: number; code: string; name: string };

export async function fetchPositions(): Promise<Position[]> {
  return apiClient
    .get("/api/admin/positions")
    .then((res) => {
      const rows = unwrapApi<Position[]>(res.data);
      return Array.isArray(rows) ? rows : [];
    })
    .catch(() => []);
}

export async function createPosition(payload: Omit<Position, "id">) {
  return apiClient
    .post("/api/admin/create/positions", payload)
    .then(() => revalidatePath("/positions"))
    .catch((error) => ({
      error: error.response?.data?.message || "Error creating position",
    }));
}

export async function updatePosition(id: number, payload: Partial<Omit<Position, "id">>) {
  return apiClient
    .put(`/api/admin/update/positions/${id}`, payload)
    .then(() => revalidatePath("/positions"))
    .catch((error) => ({
      error: error.response?.data?.message || "Error updating position",
    }));
}

export async function deletePosition(id: number) {
  return apiClient
    .delete(`/api/admin/delete/positions/${id}`)
    .then(() => revalidatePath("/positions"))
    .catch((error) => ({
      error: error.response?.data?.message || "Error deleting position",
    }));
}

