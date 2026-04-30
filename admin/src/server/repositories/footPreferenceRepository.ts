import type { SupabaseClient } from "@supabase/supabase-js";
import { ServiceError } from "@/server/errors/serviceError";

export type FootPreferenceRow = {
  id: number;
  code: string;
  description: string | null;
};

export interface IFootPreferenceRepository {
  list(): Promise<FootPreferenceRow[]>;
  create(payload: Omit<FootPreferenceRow, "id">): Promise<FootPreferenceRow>;
  update(
    id: number,
    payload: Partial<Omit<FootPreferenceRow, "id">>
  ): Promise<FootPreferenceRow>;
  delete(id: number): Promise<void>;
}

export class FootPreferenceSupabaseRepository implements IFootPreferenceRepository {
  constructor(private readonly db: SupabaseClient) {}

  async list(): Promise<FootPreferenceRow[]> {
    const { data, error } = await this.db
      .from("foot_preference")
      .select("*")
      .order("code", { ascending: true });
    if (error) throw new ServiceError(error.message, 500);
    return (data ?? []) as FootPreferenceRow[];
  }

  async create(payload: Omit<FootPreferenceRow, "id">): Promise<FootPreferenceRow> {
    const { data, error } = await this.db
      .from("foot_preference")
      .insert(payload)
      .select("*")
      .single();
    if (error) throw new ServiceError(error.message, 500);
    return data as FootPreferenceRow;
  }

  async update(
    id: number,
    payload: Partial<Omit<FootPreferenceRow, "id">>
  ): Promise<FootPreferenceRow> {
    const { data, error } = await this.db
      .from("foot_preference")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new ServiceError(error.message, 500);
    return data as FootPreferenceRow;
  }

  async delete(id: number): Promise<void> {
    const { error } = await this.db.from("foot_preference").delete().eq("id", id);
    if (error) throw new ServiceError(error.message, 500);
  }
}

