import type { SupabaseClient } from "@supabase/supabase-js";
import { ServiceError } from "@/server/errors/serviceError";

export interface IVideoVerificationRepository {
  list(params: {
    page: number;
    perPage: number;
    matchId?: string | null;
    playerId?: string | null;
    statTable?: string | null;
  }): Promise<{
    current_page: number;
    data: Record<string, unknown>[];
    per_page: number;
    total: number;
    last_page: number;
  }>;
}

export class VideoVerificationSupabaseRepository
  implements IVideoVerificationRepository
{
  constructor(private readonly db: SupabaseClient) {}

  async list(params: {
    page: number;
    perPage: number;
    matchId?: string | null;
    playerId?: string | null;
    statTable?: string | null;
  }): Promise<{
    current_page: number;
    data: Record<string, unknown>[];
    per_page: number;
    total: number;
    last_page: number;
  }> {
    const from = (params.page - 1) * params.perPage;
    const to = from + params.perPage - 1;

    let q = this.db
      .from("video_verification_log")
      .select("*", { count: "exact" });

    if (params.matchId) q = q.eq("match_id", params.matchId);
    if (params.playerId) q = q.eq("player_id", params.playerId);
    if (params.statTable) q = q.eq("stat_table", params.statTable);

    const { data, error, count } = await q
      .order("verified_at", { ascending: false })
      .range(from, to);
    if (error) throw new ServiceError(error.message, 500);

    const total = count ?? 0;
    return {
      current_page: params.page,
      data: (data ?? []) as Record<string, unknown>[],
      per_page: params.perPage,
      total,
      last_page: total ? Math.max(1, Math.ceil(total / params.perPage)) : 1,
    };
  }
}

