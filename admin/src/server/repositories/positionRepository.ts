import type { SupabaseClient } from "@supabase/supabase-js";
import { ServiceError } from "@/server/errors/serviceError";

export type PositionRow = {
  id: number;
  code: string;
  name: string;
};

export interface IPositionRepository {
  list(): Promise<PositionRow[]>;
  create(payload: Omit<PositionRow, "id">): Promise<PositionRow>;
  update(id: number, payload: Partial<Omit<PositionRow, "id">>): Promise<PositionRow>;
  delete(id: number): Promise<void>;
}

export class PositionSupabaseRepository implements IPositionRepository {
  constructor(private readonly db: SupabaseClient) {}

  async list(): Promise<PositionRow[]> {
    const { data, error } = await this.db
      .from("positions")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw new ServiceError(error.message, 500);
    return (data ?? []) as PositionRow[];
  }

  async create(payload: Omit<PositionRow, "id">): Promise<PositionRow> {
    const { data, error } = await this.db
      .from("positions")
      .insert(payload)
      .select("*")
      .single();
    if (error) throw new ServiceError(error.message, 500);
    return data as PositionRow;
  }

  async update(
    id: number,
    payload: Partial<Omit<PositionRow, "id">>
  ): Promise<PositionRow> {
    const { data, error } = await this.db
      .from("positions")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new ServiceError(error.message, 500);
    return data as PositionRow;
  }

  async delete(id: number): Promise<void> {
    const { error } = await this.db.from("positions").delete().eq("id", id);
    if (error) throw new ServiceError(error.message, 500);
  }
}

