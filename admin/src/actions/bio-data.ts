"use server";

import apiClient from "@/lib/axios";
import { unwrapApi } from "@/lib/unwrapApi";
import { ensureArray, ensureNumber } from "@/lib/normalize";

export type BioDataRow = {
  bio_data_id: string;
  player_code: string | null;
  player_name: string;
  aa_stats_email: string | null;
  dob: string | null;
  position: string | null;
  nationality: string | null;
  season_id: number | null;
  team_id: string | null;
  jersey_number: number | null;
  photo_url: string | null;
  created_at: string | null;
  updated_at: string | null;
  mapping?: {
    player_id: string;
    player?: { id: string; name: string } | null;
  } | null;
};

export type BioDataPage = {
  current_page: number;
  data: BioDataRow[];
  per_page: number;
  total: number;
  last_page: number;
};

export async function fetchBioData(params: {
  page?: number;
  q?: string;
  season_id?: number | null;
  team_id?: string | null;
}): Promise<BioDataPage> {
  const page = params.page ?? 1;
  const search = new URLSearchParams();
  search.set("page", String(page));
  if (params.q) search.set("q", params.q);
  if (params.season_id != null) search.set("season_id", String(params.season_id));
  if (params.team_id) search.set("team_id", params.team_id);

  return apiClient
    .get(`/api/admin/bio-data?${search.toString()}`)
    .then((res) => {
      const unwrapped = unwrapApi<unknown>(res.data);
      const body =
        unwrapped && typeof unwrapped === "object" ? (unwrapped as Record<string, unknown>) : {};
      return {
        current_page: ensureNumber(body.current_page, page),
        data: ensureArray<BioDataRow>(body.data),
        per_page: ensureNumber(body.per_page, 25),
        total: ensureNumber(body.total, 0),
        last_page: ensureNumber(body.last_page, 1),
      };
    })
    .catch(() => ({
      current_page: page,
      data: [],
      per_page: 25,
      total: 0,
      last_page: 1,
    }));
}

export async function updateBioData(
  bioDataId: string,
  patch: Partial<{
    player_name: string;
    aa_stats_email: string | null;
    dob: string | null;
    position: string | null;
    nationality: string | null;
    season_id: number | null;
    team_id: string | null;
    jersey_number: number | null;
    photo_url: string | null;
    issue_description: string | null;
    evidence_reference: string | null;
  }>
) {
  return apiClient
    .put(`/api/admin/bio-data/${bioDataId}`, patch)
    .then((res) => res.data)
    .catch((error) => ({
      error: error.response?.data?.message || "Error updating bio data",
    }));
}

