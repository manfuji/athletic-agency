import type { SupabaseClient } from "@supabase/supabase-js";
import { ServiceError } from "@/server/errors/serviceError";

export interface IPointsRepository {
  getByCompetition(competitionId: string): Promise<Record<string, unknown> | null>;
  upsertForCompetition(
    competitionId: string,
    payload: {
      win_points: number;
      draw_points: number;
      loss_points: number;
      tie_break_order: string[];
      is_active?: boolean;
    }
  ): Promise<Record<string, unknown>>;
  updateById(
    configId: string,
    payload: Record<string, unknown>
  ): Promise<Record<string, unknown>>;
  deleteById(configId: string): Promise<void>;
}

export class PointsSupabaseRepository implements IPointsRepository {
  constructor(private readonly db: SupabaseClient) {}

  async getByCompetition(
    competitionId: string
  ): Promise<Record<string, unknown> | null> {
    const { data, error } = await this.db
      .from("competition_points_config")
      .select("*")
      .eq("competition_id", competitionId)
      .maybeSingle();

    if (error) throw new ServiceError(error.message, 500);
    return (data as Record<string, unknown> | null) ?? null;
  }

  async upsertForCompetition(
    competitionId: string,
    payload: {
      win_points: number;
      draw_points: number;
      loss_points: number;
      tie_break_order: string[];
      is_active?: boolean;
    }
  ): Promise<Record<string, unknown>> {
    const { data, error } = await this.db
      .from("competition_points_config")
      .upsert(
        {
          competition_id: competitionId,
          win_points: payload.win_points,
          draw_points: payload.draw_points,
          loss_points: payload.loss_points,
          tie_break_order: payload.tie_break_order,
          is_active: payload.is_active ?? true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "competition_id" }
      )
      .select("*")
      .single();

    if (error) throw new ServiceError(error.message, 500);
    return data as Record<string, unknown>;
  }

  async updateById(
    configId: string,
    payload: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const { data, error } = await this.db
      .from("competition_points_config")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", configId)
      .select("*")
      .single();

    if (error) throw new ServiceError(error.message, 500);
    return data as Record<string, unknown>;
  }

  async deleteById(configId: string): Promise<void> {
    const { error } = await this.db
      .from("competition_points_config")
      .delete()
      .eq("id", configId);

    if (error) throw new ServiceError(error.message, 500);
  }
}
