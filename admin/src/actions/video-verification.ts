"use server";

import apiClient from "@/lib/axios";
import { unwrapApi } from "@/lib/unwrapApi";
import { ensureArray, ensureNumber } from "@/lib/normalize";

export type VideoVerificationPage = {
  current_page: number;
  data: Record<string, unknown>[];
  per_page: number;
  total: number;
  last_page: number;
};

export async function fetchVideoVerification(params: {
  page?: number;
  match_id?: string;
  player_id?: string;
  stat_table?: string;
}): Promise<VideoVerificationPage> {
  const page = params.page ?? 1;
  const qs = new URLSearchParams();
  qs.set("page", String(page));
  if (params.match_id) qs.set("match_id", params.match_id);
  if (params.player_id) qs.set("player_id", params.player_id);
  if (params.stat_table) qs.set("stat_table", params.stat_table);

  return apiClient
    .get(`/api/admin/video-verification?${qs.toString()}`)
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

