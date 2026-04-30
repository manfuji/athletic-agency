import type { SupabaseClient } from "@supabase/supabase-js";
import { ServiceError } from "@/server/errors/serviceError";

export type NationalityRow = {
  id: number;
  code: string;
  name: string;
};

export interface INationalityRepository {
  list(): Promise<NationalityRow[]>;
  create(payload: Omit<NationalityRow, "id">): Promise<NationalityRow>;
  update(id: number, payload: Partial<Omit<NationalityRow, "id">>): Promise<NationalityRow>;
  delete(id: number): Promise<void>;
}

export class NationalitySupabaseRepository implements INationalityRepository {
  constructor(private readonly db: SupabaseClient) {}

  async list(): Promise<NationalityRow[]> {
    const { data, error } = await this.db
      .from("nationalities")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw new ServiceError(error.message, 500);
    return (data ?? []) as NationalityRow[];
  }

  async create(payload: Omit<NationalityRow, "id">): Promise<NationalityRow> {
    const { data, error } = await this.db
      .from("nationalities")
      .insert(payload)
      .select("*")
      .single();
    if (error) throw new ServiceError(error.message, 500);
    return data as NationalityRow;
  }

  async update(
    id: number,
    payload: Partial<Omit<NationalityRow, "id">>
  ): Promise<NationalityRow> {
    const { data, error } = await this.db
      .from("nationalities")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new ServiceError(error.message, 500);
    return data as NationalityRow;
  }

  async delete(id: number): Promise<void> {
    const { error } = await this.db.from("nationalities").delete().eq("id", id);
    if (error) throw new ServiceError(error.message, 500);
  }
}

