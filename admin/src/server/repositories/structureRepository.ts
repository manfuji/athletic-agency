import type { SupabaseClient } from "@supabase/supabase-js";
import { ServiceError } from "@/server/errors/serviceError";

export interface StructureRow {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface IStructureRepository {
  listAll(): Promise<unknown[]>;
  insert(row: { name: string; description: string }): Promise<StructureRow>;
}

export class StructureSupabaseRepository implements IStructureRepository {
  constructor(private readonly db: SupabaseClient) {}

  async listAll(): Promise<unknown[]> {
    const { data, error } = await this.db
      .from("structures")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw new ServiceError(error.message, 500);
    return data ?? [];
  }

  async insert(row: { name: string; description: string }): Promise<StructureRow> {
    const { data, error } = await this.db
      .from("structures")
      .insert({
        name: row.name,
        description: row.description,
      })
      .select("id, name, description, created_at")
      .single();

    if (error) throw new ServiceError(error.message, 500);
    if (!data) throw new ServiceError("Failed to create structure", 500);
    return data as StructureRow;
  }
}
