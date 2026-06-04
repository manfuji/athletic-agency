import type { SupabaseClient } from "@supabase/supabase-js";
import { ServiceError } from "@/server/errors/serviceError";

export type ImportJobStatus = "pending" | "processing" | "success" | "failed";

export type ImportJobRow = {
  competition_id: string;
  status: ImportJobStatus;
  progress: number;
  message: string | null;
  error_file_path: string | null;
  updated_at: string;
};

export interface ICompetitionImportRepository {
  get(competitionId: string): Promise<ImportJobRow | null>;
  upsert(
    competitionId: string,
    patch: Partial<
      Pick<ImportJobRow, "status" | "progress" | "message" | "error_file_path">
    >
  ): Promise<ImportJobRow>;
}

export class CompetitionImportSupabaseRepository
  implements ICompetitionImportRepository
{
  constructor(private readonly db: SupabaseClient) {}

  async get(competitionId: string): Promise<ImportJobRow | null> {
    const { data, error } = await this.db
      .from("competition_import_jobs")
      .select("*")
      .eq("competition_id", competitionId)
      .maybeSingle();

    if (error) throw new ServiceError(error.message, 500);
    return (data as ImportJobRow | null) ?? null;
  }

  async upsert(
    competitionId: string,
    patch: Partial<
      Pick<ImportJobRow, "status" | "progress" | "message" | "error_file_path">
    >
  ): Promise<ImportJobRow> {
    const row = {
      competition_id: competitionId,
      status: patch.status ?? "pending",
      progress: patch.progress ?? 0,
      message: patch.message ?? null,
      error_file_path: patch.error_file_path ?? null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.db
      .from("competition_import_jobs")
      .upsert(row, { onConflict: "competition_id" })
      .select("*")
      .single();

    if (error) throw new ServiceError(error.message, 500);
    return data as ImportJobRow;
  }
}
