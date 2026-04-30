import type { SupabaseClient } from "@supabase/supabase-js";
import { ServiceError } from "@/server/errors/serviceError";

export interface IStructureRepository {
  listAll(): Promise<unknown[]>;
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
}
