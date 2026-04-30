import type { SupabaseClient } from "@supabase/supabase-js";
import { ServiceError } from "@/server/errors/serviceError";

export type EventSeasonRow = {
  id: number;
  name: string;
  year: number;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  is_active: boolean;
  competition_type: string | null;
  created_at: string | null;
};

export interface IEventSeasonRepository {
  list(): Promise<EventSeasonRow[]>;
  create(payload: Omit<EventSeasonRow, "id" | "created_at">): Promise<EventSeasonRow>;
  update(
    id: number,
    payload: Partial<Omit<EventSeasonRow, "id" | "created_at">>
  ): Promise<EventSeasonRow>;
  delete(id: number): Promise<void>;
}

export class EventSeasonSupabaseRepository implements IEventSeasonRepository {
  constructor(private readonly db: SupabaseClient) {}

  async list(): Promise<EventSeasonRow[]> {
    const { data, error } = await this.db
      .from("event_seasons")
      .select("*")
      .order("year", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw new ServiceError(error.message, 500);
    return (data ?? []) as EventSeasonRow[];
  }

  async create(
    payload: Omit<EventSeasonRow, "id" | "created_at">
  ): Promise<EventSeasonRow> {
    const { data, error } = await this.db
      .from("event_seasons")
      .insert(payload)
      .select("*")
      .single();
    if (error) throw new ServiceError(error.message, 500);
    return data as EventSeasonRow;
  }

  async update(
    id: number,
    payload: Partial<Omit<EventSeasonRow, "id" | "created_at">>
  ): Promise<EventSeasonRow> {
    const { data, error } = await this.db
      .from("event_seasons")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new ServiceError(error.message, 500);
    return data as EventSeasonRow;
  }

  async delete(id: number): Promise<void> {
    const { error } = await this.db.from("event_seasons").delete().eq("id", id);
    if (error) throw new ServiceError(error.message, 500);
  }
}

