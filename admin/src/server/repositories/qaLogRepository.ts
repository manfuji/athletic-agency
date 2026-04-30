import type { SupabaseClient } from "@supabase/supabase-js";
import { ServiceError } from "@/server/errors/serviceError";

export type QaLogInsert = {
  table_name: string;
  record_id: string;
  issue_description: string;
  old_value?: string | null;
  new_value?: string | null;
  corrected_by?: string | null;
  approved_by?: string | null;
  evidence_reference?: string | null;
};

export interface IQaLogRepository {
  insert(row: QaLogInsert): Promise<void>;
  list(params: {
    page: number;
    perPage: number;
    tableName?: string | null;
    recordId?: string | null;
  }): Promise<{
    current_page: number;
    data: Record<string, unknown>[];
    per_page: number;
    total: number;
    last_page: number;
  }>;
}

export class QaLogSupabaseRepository implements IQaLogRepository {
  constructor(private readonly db: SupabaseClient) {}

  async insert(row: QaLogInsert): Promise<void> {
    const { error } = await this.db.from("qa_log").insert({
      ...row,
      corrected_at: new Date().toISOString(),
    });
    if (error) throw new ServiceError(error.message, 500);
  }

  async list(params: {
    page: number;
    perPage: number;
    tableName?: string | null;
    recordId?: string | null;
  }): Promise<{
    current_page: number;
    data: Record<string, unknown>[];
    per_page: number;
    total: number;
    last_page: number;
  }> {
    const from = (params.page - 1) * params.perPage;
    const to = from + params.perPage - 1;

    let q = this.db.from("qa_log").select("*", { count: "exact" });
    if (params.tableName) q = q.eq("table_name", params.tableName);
    if (params.recordId) q = q.eq("record_id", params.recordId);

    const { data, error, count } = await q
      .order("corrected_at", { ascending: false })
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

