import type { SupabaseClient } from "@supabase/supabase-js";
import { ServiceError } from "@/server/errors/serviceError";

export interface ICollatorRepository {
  listCollators(status?: string | null): Promise<unknown[]>;
  collatorEmailExists(normalizedEmail: string): Promise<boolean>;
  registerCollator(row: Record<string, unknown>): Promise<{ id: string }>;
  deleteCollator(id: string): Promise<void>;
  listForCompetition(competitionId: string): Promise<unknown[]>;
  assignToCompetition(competitionId: string, collatorId: string): Promise<void>;
  assignManyToCompetition(
    competitionId: string,
    collatorIds: string[]
  ): Promise<void>;
  removeFromCompetition(
    competitionId: string,
    collatorId: string
  ): Promise<void>;
}

export class CollatorSupabaseRepository implements ICollatorRepository {
  constructor(private readonly db: SupabaseClient) {}

  async collatorEmailExists(normalizedEmail: string): Promise<boolean> {
    const { data, error } = await this.db
      .from("collators")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (error) throw new ServiceError(error.message, 500);
    return data != null;
  }

  async listCollators(status?: string | null): Promise<unknown[]> {
    let q = this.db.from("collators").select("*").order("created_at", {
      ascending: false,
    });
    if (status === "1") q = q.eq("status", 1);
    else if (status) q = q.eq("status", status);
    const { data, error } = await q;
    if (error) throw new ServiceError(error.message, 500);
    return data ?? [];
  }

  async registerCollator(row: Record<string, unknown>): Promise<{ id: string }> {
    const { data, error } = await this.db
      .from("collators")
      .insert({ ...row, status: 1 })
      .select("id")
      .single();

    if (error) throw new ServiceError(error.message, 500);
    return { id: (data as { id: string }).id };
  }

  async deleteCollator(id: string): Promise<void> {
    const { error } = await this.db.from("collators").delete().eq("id", id);
    if (error) throw new ServiceError(error.message, 500);
  }

  async listForCompetition(competitionId: string): Promise<unknown[]> {
    const { data, error } = await this.db
      .from("competition_collators")
      .select("collator_id, collators (*)")
      .eq("competition_id", competitionId);

    if (error) throw new ServiceError(error.message, 500);
    return (data ?? []).map((r: { collators: unknown }) => r.collators);
  }

  async assignToCompetition(
    competitionId: string,
    collatorId: string
  ): Promise<void> {
    const { error } = await this.db.from("competition_collators").upsert(
      {
        competition_id: competitionId,
        collator_id: collatorId,
      },
      {
        onConflict: "competition_id,collator_id",
        ignoreDuplicates: true,
      }
    );
    if (error) throw new ServiceError(error.message, 500);
  }

  async assignManyToCompetition(
    competitionId: string,
    collatorIds: string[]
  ): Promise<void> {
    const rows = collatorIds.map((collator_id) => ({
      competition_id: competitionId,
      collator_id,
    }));
    const { error } = await this.db
      .from("competition_collators")
      .upsert(rows, {
        onConflict: "competition_id,collator_id",
        ignoreDuplicates: true,
      });
    if (error) throw new ServiceError(error.message, 500);
  }

  async removeFromCompetition(
    competitionId: string,
    collatorId: string
  ): Promise<void> {
    const { error } = await this.db
      .from("competition_collators")
      .delete()
      .eq("competition_id", competitionId)
      .eq("collator_id", collatorId);

    if (error) throw new ServiceError(error.message, 500);
  }
}
