"use server";

import apiClient from "@/lib/axios";
import { unwrapApi } from "@/lib/unwrapApi";
import { ensureArray, ensureNumber } from "@/lib/normalize";

export type QaLogPage = {
  current_page: number;
  data: Record<string, unknown>[];
  per_page: number;
  total: number;
  last_page: number;
};

export async function fetchQaLog(params: {
  page?: number;
  table_name?: string;
  record_id?: string;
}): Promise<QaLogPage> {
  const page = params.page ?? 1;
  const qs = new URLSearchParams();
  qs.set("page", String(page));
  if (params.table_name) qs.set("table_name", params.table_name);
  if (params.record_id) qs.set("record_id", params.record_id);

  return apiClient
    .get(`/api/admin/qa-log?${qs.toString()}`)
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

