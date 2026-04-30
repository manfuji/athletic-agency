import type { SupabaseClient } from "@supabase/supabase-js";
import { ServiceError } from "@/server/errors/serviceError";

export type AffiliationRow = {
  id: number;
  name: string;
};

export interface IAffiliationRepository {
  list(): Promise<AffiliationRow[]>;
  create(payload: Omit<AffiliationRow, "id">): Promise<AffiliationRow>;
  update(id: number, payload: Partial<Omit<AffiliationRow, "id">>): Promise<AffiliationRow>;
  delete(id: number): Promise<void>;
}

export class AffiliationSupabaseRepository implements IAffiliationRepository {
  constructor(private readonly db: SupabaseClient) {}

  async list(): Promise<AffiliationRow[]> {
    const { data, error } = await this.db
      .from("affiliations")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw new ServiceError(error.message, 500);
    return (data ?? []) as AffiliationRow[];
  }

  async create(payload: Omit<AffiliationRow, "id">): Promise<AffiliationRow> {
    const { data, error } = await this.db
      .from("affiliations")
      .insert(payload)
      .select("*")
      .single();
    if (error) throw new ServiceError(error.message, 500);
    return data as AffiliationRow;
  }

  async update(
    id: number,
    payload: Partial<Omit<AffiliationRow, "id">>
  ): Promise<AffiliationRow> {
    const { data, error } = await this.db
      .from("affiliations")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new ServiceError(error.message, 500);
    return data as AffiliationRow;
  }

  async delete(id: number): Promise<void> {
    const { error } = await this.db.from("affiliations").delete().eq("id", id);
    if (error) throw new ServiceError(error.message, 500);
  }
}

