"use server";

import apiClient from "@/lib/axios";
import { unwrapApi } from "@/lib/unwrapApi";
import { ensureArray, ensureNumber } from "@/lib/normalize";

export type LegacyTableName =
  | "matches"
  | "match_lineups"
  | "passes"
  | "shots"
  | "defensive"
  | "dribbles_and_fouls"
  | "goalkeeper_stats"
  | "physical_data";

export type LegacyTablePage = {
  current_page: number;
  data: Record<string, unknown>[];
  per_page: number;
  total: number;
  last_page: number;
};

export async function fetchLegacyTable(params: {
  table: LegacyTableName;
  page?: number;
  match_id?: string;
}): Promise<LegacyTablePage> {
  const page = params.page ?? 1;
  const qs = new URLSearchParams();
  qs.set("page", String(page));
  if (params.match_id) qs.set("match_id", params.match_id);

  return apiClient
    .get(`/api/admin/legacy/table/${params.table}?${qs.toString()}`)
    .then((res) => {
      const unwrapped = unwrapApi<unknown>(res.data);
      const body =
        unwrapped && typeof unwrapped === "object" ? (unwrapped as Record<string, unknown>) : {};
      return {
        current_page: ensureNumber(body.current_page, page),
        data: ensureArray<Record<string, unknown>>(body.data),
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

export async function updateLegacyRow(params: {
  table: LegacyTableName;
  id: string;
  patch: Record<string, unknown>;
  issue_description?: string | null;
  evidence_reference?: string | null;
}) {
  return apiClient
    .put(`/api/admin/legacy/table/${params.table}`, {
      id: params.id,
      patch: params.patch,
      issue_description: params.issue_description ?? null,
      evidence_reference: params.evidence_reference ?? null,
    })
    .then((res) => res.data)
    .catch((error) => ({
      error: error.response?.data?.message || "Error updating legacy row",
    }));
}

