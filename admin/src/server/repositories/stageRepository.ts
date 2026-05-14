import type { SupabaseClient } from "@supabase/supabase-js";
import { ServiceError } from "@/server/errors/serviceError";

export interface StageRow {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface IStageRepository {
  listAll(): Promise<unknown[]>;
  insert(row: { name: string }): Promise<StageRow>;
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

  async insert(row: { name: string }): Promise<StageRow> {
    const { data, error } = await this.db
      .from("stages")
      .insert({ name: row.name })
      .select("id, name, created_at, updated_at")
      .single();

    if (error) throw new ServiceError(error.message, 500);
    if (!data) throw new ServiceError("Failed to create stage", 500);
    return data as StageRow;
  }
}
