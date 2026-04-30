import type { SupabaseClient } from "@supabase/supabase-js";
import { ServiceError } from "@/server/errors/serviceError";

export type ApiKeyRow = {
  id: string;
  key_hash: string;
  label: string | null;
  is_active: boolean;
  created_at: string;
};

export interface IApiKeyRepository {
  list(): Promise<ApiKeyRow[]>;
  insert(payload: { key_hash: string; label?: string | null; is_active?: boolean }): Promise<ApiKeyRow>;
  update(id: string, patch: Partial<Pick<ApiKeyRow, "label" | "is_active">>): Promise<ApiKeyRow>;
  delete(id: string): Promise<void>;
}

export class ApiKeySupabaseRepository implements IApiKeyRepository {
  constructor(private readonly db: SupabaseClient) {}

  async list(): Promise<ApiKeyRow[]> {
    const { data, error } = await this.db
      .from("api_keys")
      .select("id,key_hash,label,is_active,created_at")
      .order("created_at", { ascending: false });
    if (error) throw new ServiceError(error.message, 500);
    return (data ?? []) as ApiKeyRow[];
  }

  async insert(payload: { key_hash: string; label?: string | null; is_active?: boolean }): Promise<ApiKeyRow> {
    const { data, error } = await this.db
      .from("api_keys")
      .insert({
        key_hash: payload.key_hash,
        label: payload.label ?? null,
        is_active: payload.is_active ?? true,
      })
      .select("id,key_hash,label,is_active,created_at")
      .single();
    if (error) throw new ServiceError(error.message, 500);
    return data as ApiKeyRow;
  }

  async update(
    id: string,
    patch: Partial<Pick<ApiKeyRow, "label" | "is_active">>
  ): Promise<ApiKeyRow> {
    const { data, error } = await this.db
      .from("api_keys")
      .update(patch)
      .eq("id", id)
      .select("id,key_hash,label,is_active,created_at")
      .single();
    if (error) throw new ServiceError(error.message, 500);
    return data as ApiKeyRow;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.db.from("api_keys").delete().eq("id", id);
    if (error) throw new ServiceError(error.message, 500);
  }
}

