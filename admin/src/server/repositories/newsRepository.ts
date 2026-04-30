import type { SupabaseClient } from "@supabase/supabase-js";
import { ServiceError } from "@/server/errors/serviceError";

export interface INewsRepository {
  list(): Promise<unknown[]>;
  findById(id: string): Promise<Record<string, unknown> | null>;
  findBySlug(slug: string): Promise<Record<string, unknown> | null>;
  insert(payload: Record<string, unknown>): Promise<Record<string, unknown>>;
  update(id: string, payload: Record<string, unknown>): Promise<Record<string, unknown>>;
  deleteById(id: string): Promise<void>;
}

export class NewsSupabaseRepository implements INewsRepository {
  constructor(private readonly db: SupabaseClient) {}

  private readonly selectClause = `
    id,title,slug,summary,content,cover_image,youtube_url,is_featured,
    competition_id,category_id,meta_title,meta_description,published_at,created_at,updated_at,
    competition:competitions(id,title,slug),
    category:categories(id,name)
  `;

  async list(): Promise<unknown[]> {
    const { data, error } = await this.db
      .from("news_posts")
      .select(this.selectClause)
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) throw new ServiceError(error.message, 500);
    return data ?? [];
  }

  async findById(id: string): Promise<Record<string, unknown> | null> {
    const { data, error } = await this.db
      .from("news_posts")
      .select(this.selectClause)
      .eq("id", id)
      .maybeSingle();

    if (error) throw new ServiceError(error.message, 500);
    return (data as Record<string, unknown> | null) ?? null;
  }

  async findBySlug(slug: string): Promise<Record<string, unknown> | null> {
    const { data, error } = await this.db
      .from("news_posts")
      .select(this.selectClause)
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw new ServiceError(error.message, 500);
    return (data as Record<string, unknown> | null) ?? null;
  }

  async insert(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { data, error } = await this.db
      .from("news_posts")
      .insert(payload)
      .select(this.selectClause)
      .single();

    if (error) throw new ServiceError(error.message, 500);
    return data as Record<string, unknown>;
  }

  async update(id: string, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { data, error } = await this.db
      .from("news_posts")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select(this.selectClause)
      .single();

    if (error) throw new ServiceError(error.message, 500);
    return data as Record<string, unknown>;
  }

  async deleteById(id: string): Promise<void> {
    const { error } = await this.db.from("news_posts").delete().eq("id", id);
    if (error) throw new ServiceError(error.message, 500);
  }
}
