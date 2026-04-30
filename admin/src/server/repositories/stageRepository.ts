import type { SupabaseClient } from "@supabase/supabase-js";
import { ServiceError } from "@/server/errors/serviceError";

export interface IStageRepository {
  listAll(): Promise<unknown[]>;
}

export class StageSupabaseRepository implements IStageRepository {
  constructor(private readonly db: SupabaseClient) {}

  async listAll(): Promise<unknown[]> {
    const { data, error } = await this.db
      .from("stages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new ServiceError(error.message, 500);
    return data ?? [];
  }
}
