import type { SupabaseClient } from "@supabase/supabase-js";
import { ServiceError } from "@/server/errors/serviceError";

export interface ICompetitionTypeRepository {
  listAll(): Promise<unknown[]>;
  insert(payload: { name: string; description?: string }): Promise<Record<string, unknown>>;
  updateById(
    id: string,
    payload: { name?: string; description?: string }
  ): Promise<Record<string, unknown>>;
  deleteById(id: string): Promise<void>;
}

export class CompetitionTypeSupabaseRepository
  implements ICompetitionTypeRepository
{
  constructor(private readonly db: SupabaseClient) {}

  async listAll(): Promise<unknown[]> {
    const { data, error } = await this.db
      .from("competition_types")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw new ServiceError(error.message, 500);
    return data ?? [];
  }

  async insert(payload: {
    name: string;
    description?: string;
  }): Promise<Record<string, unknown>> {
    const slug = payload.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    const { data, error } = await this.db
      .from("competition_types")
      .insert({
        name: payload.name,
        description: payload.description ?? "",
        slug,
      })
      .select("*")
      .single();

    if (error) throw new ServiceError(error.message, 500);
    return data as Record<string, unknown>;
  }

  async updateById(
    id: string,
    payload: { name?: string; description?: string }
  ): Promise<Record<string, unknown>> {
    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof payload.name === "string" && payload.name.trim().length > 0) {
      patch.name = payload.name.trim();
      patch.slug = payload.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
    }

    if (typeof payload.description === "string") {
      patch.description = payload.description;
    }

    const { data, error } = await this.db
      .from("competition_types")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new ServiceError(error.message, 500);
    return data as Record<string, unknown>;
  }

  async deleteById(id: string): Promise<void> {
    const { error } = await this.db
      .from("competition_types")
      .delete()
      .eq("id", id);
    if (error) throw new ServiceError(error.message, 500);
  }
}
