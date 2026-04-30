import type { SupabaseClient } from "@supabase/supabase-js";
import { ServiceError } from "@/server/errors/serviceError";

export interface ICategoryRepository {
  listAll(): Promise<unknown[]>;
  insert(row: { name: string; slug: string }): Promise<Record<string, unknown>>;
  update(
    id: string,
    row: { name: string; slug: string }
  ): Promise<Record<string, unknown> | null>;
  deleteById(id: string): Promise<void>;
}

export class CategorySupabaseRepository implements ICategoryRepository {
  constructor(private readonly db: SupabaseClient) {}

  async listAll(): Promise<unknown[]> {
    const { data, error } = await this.db
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new ServiceError(error.message, 500);
    return data ?? [];
  }

  async insert(row: {
    name: string;
    slug: string;
  }): Promise<Record<string, unknown>> {
    const { data, error } = await this.db
      .from("categories")
      .insert(row)
      .select("*")
      .single();

    if (error) throw new ServiceError(error.message, 500);
    return data as Record<string, unknown>;
  }

  async update(
    id: string,
    row: { name: string; slug: string }
  ): Promise<Record<string, unknown> | null> {
    const { data, error } = await this.db
      .from("categories")
      .update({ ...row, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) throw new ServiceError(error.message, 500);
    return data as Record<string, unknown> | null;
  }

  async deleteById(id: string): Promise<void> {
    const { error } = await this.db.from("categories").delete().eq("id", id);
    if (error) throw new ServiceError(error.message, 500);
  }
}
