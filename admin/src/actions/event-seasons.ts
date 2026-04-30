"use server";

import { revalidatePath } from "next/cache";
import apiClient from "@/lib/axios";
import { unwrapApi } from "@/lib/unwrapApi";

export type EventSeason = {
  id: number;
  name: string;
  year: number;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  is_active: boolean;
  competition_type: string | null;
  created_at: string | null;
};

export async function fetchEventSeasons(): Promise<EventSeason[]> {
  return apiClient
    .get("/api/admin/event-seasons")
    .then((res) => {
      const rows = unwrapApi<EventSeason[]>(res.data);
      return Array.isArray(rows) ? rows : [];
    })
    .catch(() => []);
}

export async function createEventSeason(payload: Omit<EventSeason, "id" | "created_at">) {
  return apiClient
    .post("/api/admin/create/event-seasons", payload)
    .then(() => revalidatePath("/event-seasons"))
    .catch((error) => ({
      error: error.response?.data?.message || "Error creating season",
    }));
}

export async function updateEventSeason(
  id: number,
  payload: Partial<Omit<EventSeason, "id" | "created_at">>
) {
  return apiClient
    .put(`/api/admin/update/event-seasons/${id}`, payload)
    .then(() => revalidatePath("/event-seasons"))
    .catch((error) => ({
      error: error.response?.data?.message || "Error updating season",
    }));
}

export async function deleteEventSeason(id: number) {
  return apiClient
    .delete(`/api/admin/delete/event-seasons/${id}`)
    .then(() => revalidatePath("/event-seasons"))
    .catch((error) => ({
      error: error.response?.data?.message || "Error deleting season",
    }));
}

