"use server";

import apiClient from "@/lib/axios";
import { unwrapApi } from "@/lib/unwrapApi";
import { ensureArray, ensureNumber } from "@/lib/normalize";

export type LegacyBioDataRow = {
  bio_data_id: string;
  player_name: string;
  position: string | null;
  nationality: string | null;
  dob: string | null;
  team_id: string | null;
  photo_url: string | null;
  created_at: string | null;
};

export type LegacyBioDataPage = {
  current_page: number;
  data: LegacyBioDataRow[];
  per_page: number;
  total: number;
  last_page: number;
};

export async function fetchUnmappedBioData(
  page: number = 1
): Promise<LegacyBioDataPage> {
  return apiClient
    .get(`/api/admin/legacy/bio-data?page=${page}`)
    .then((res) => {
      const unwrapped = unwrapApi<unknown>(res.data);
      const body =
        unwrapped && typeof unwrapped === "object" ? (unwrapped as Record<string, unknown>) : {};

      return {
        current_page: ensureNumber(body.current_page, page),
        data: ensureArray<LegacyBioDataRow>(body.data),
        per_page: ensureNumber(body.per_page, 20),
        total: ensureNumber(body.total, 0),
        last_page: ensureNumber(body.last_page, 1),
      };
    })
    .catch(() => ({
      current_page: page,
      data: [],
      per_page: 20,
      total: 0,
      last_page: 1,
    }));
}

export async function importBioDataToPlayer(bioDataId: string) {
  return apiClient
    .post("/api/admin/legacy/import", { bio_data_id: bioDataId })
    .then((res) => res.data)
    .catch((error) => ({
      error: error?.response?.data?.message || "Failed to import bio data",
    }));
}

export async function unlinkBioData(bioDataId: string) {
  return apiClient
    .post("/api/admin/legacy/unlink", { bio_data_id: bioDataId })
    .then((res) => res.data)
    .catch((error) => ({
      error: error?.response?.data?.message || "Failed to unlink bio data",
    }));
}

export async function linkBioDataToPlayer(bioDataId: string, playerId: string) {
  return apiClient
    .post("/api/admin/legacy/link", { bio_data_id: bioDataId, player_id: playerId })
    .then((res) => res.data)
    .catch((error) => ({
      error: error?.response?.data?.message || "Failed to link bio data",
    }));
}

