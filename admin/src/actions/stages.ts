"use server";

import apiClient from "@/lib/axios";
import { unwrapApi } from "@/lib/unwrapApi";
import { Stage } from "@/types/fixtures";
import { AxiosError } from "axios";

export async function fetchStages(): Promise<Stage[]> {
  return await apiClient
    .get("/api/admin/stage")
    .then((res) => {
      const raw = unwrapApi<unknown>(res.data);
      if (Array.isArray(raw)) {
        return raw as Stage[];
      }
      console.warn("Unexpected stages API response after unwrap:", raw);
      return [];
    })
    .catch((error) => {
      console.error("Error fetching stages:", error);
      return [];
    });
}

export async function createStage(input: { name: string }) {
  return await apiClient
    .post("/api/admin/stage", { name: input.name })
    .then((res) => unwrapApi<Stage>(res.data))
    .catch((error) => {
      console.error("Error creating stage:", error);
      return {
        error:
          error instanceof AxiosError
            ? (error.response?.data as { message?: string })?.message ||
              (error.response?.data as { error?: string })?.error ||
              error.message ||
              "Error creating stage"
            : "Error creating stage",
      };
    });
}
