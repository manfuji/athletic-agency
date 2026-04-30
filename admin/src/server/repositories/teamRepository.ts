import type { SupabaseClient } from "@supabase/supabase-js";
import { ServiceError } from "@/server/errors/serviceError";

function toTeamSummaryRow(
  row: Record<string, unknown>,
  overrides?: Partial<Pick<TeamSummaryRow, "logo" | "slug">>
): TeamSummaryRow {
  return {
    id: String(row.id ?? ""),
    name: String(row.name ?? ""),
    shortCode: String(row.shortCode ?? ""),
    logo: typeof row.logo === "string" ? row.logo : null,
    created_at: String(row.created_at ?? ""),
    slug: String(row.slug ?? ""),
    ...(overrides ?? {}),
  };
}

function toDbTeamPatch(patch: Partial<TeamInsert>): Record<string, unknown> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.name !== undefined) dbPatch["name"] = patch.name;
  if (patch.shortCode !== undefined) dbPatch["short_code"] = patch.shortCode;
  if (patch.slug !== undefined) dbPatch["slug"] = patch.slug;
  if (patch.category_id !== undefined) dbPatch["category_id"] = patch.category_id;
  if (patch.description !== undefined) dbPatch["description"] = patch.description;
  if (patch.logo !== undefined) dbPatch["logo"] = patch.logo;
  if (patch.coverPhoto !== undefined) dbPatch["cover_photo"] = patch.coverPhoto;
  if (patch.isDeleted !== undefined) dbPatch["is_deleted"] = patch.isDeleted;
  return dbPatch;
}

export type TeamSummaryRow = {
  id: string;
  name: string;
  shortCode: string;
  logo: string | null;
  created_at: string;
  slug: string;
};

export type TeamInsert = {
  name: string;
  shortCode: string;
  slug: string;
  category_id: string;
  description?: string | null;
  logo?: string | null;
  coverPhoto?: string | null;
  isDeleted?: boolean;
};

export interface ITeamRepository {
  listSummary(): Promise<TeamSummaryRow[]>;
  findByIdWithPlayers(teamId: string): Promise<Record<string, unknown> | null>;
  insertTeam(row: TeamInsert): Promise<{ id: string }>;
  updateTeam(
    teamId: string,
    patch: Partial<TeamInsert>
  ): Promise<Record<string, unknown> | null>;
  deleteTeam(teamId: string): Promise<void>;
  listPlayersForTeam(teamId: string): Promise<unknown[]>;
}

export class TeamSupabaseRepository implements ITeamRepository {
  constructor(private readonly db: SupabaseClient) {}

  async listSummary(): Promise<TeamSummaryRow[]> {
    const { data, error } = await this.db
      .from("teams")
      .select("id,name,shortCode:short_code,logo,created_at,slug")
      .order("created_at", { ascending: false });

    if (error) throw new ServiceError(error.message, 500);
    return (data ?? []).map((row) => toTeamSummaryRow(row as Record<string, unknown>));
  }

  async findByIdWithPlayers(
    teamId: string
  ): Promise<Record<string, unknown> | null> {
    const selectClause =
      "id,category_id,logo,coverPhoto:cover_photo,name,shortCode:short_code,description,slug,isDeleted:is_deleted,created_at,updated_at,players:players(id,team_id,profile_picture,name,position,created_at,nationality,dob,weight,height,bio,preferred_foot,previous_experience,reason_for_joining)";

    const { data, error } = await this.db
      .from("teams")
      .select(selectClause)
      .eq("id", teamId)
      .maybeSingle();

    if (error) throw new ServiceError(error.message, 500);
    return (data as Record<string, unknown> | null) ?? null;
  }

  async insertTeam(row: TeamInsert): Promise<{ id: string }> {
    const { data, error } = await this.db
      .from("teams")
      .insert({ ...toDbTeamPatch(row) })
      .select("id")
      .single();

    if (error) throw new ServiceError(error.message, 500);

    return { id: (data as { id: string }).id };
  }

  async updateTeam(
    teamId: string,
    patch: Partial<TeamInsert>
  ): Promise<Record<string, unknown> | null> {
    const dbPatch = toDbTeamPatch(patch);
    const { data, error } = await this.db
      .from("teams")
      .update({ ...dbPatch, updated_at: new Date().toISOString() })
      .eq("id", teamId)
      .select("*")
      .maybeSingle();

    if (error) throw new ServiceError(error.message, 500);

    return data as Record<string, unknown> | null;
  }

  async deleteTeam(teamId: string): Promise<void> {
    const { error } = await this.db.from("teams").delete().eq("id", teamId);
    if (error) throw new ServiceError(error.message, 500);
  }

  async listPlayersForTeam(teamId: string): Promise<unknown[]> {
    const { data, error } = await this.db
      .from("players")
      .select(
        "id,team_id,profile_picture,name,position,created_at,nationality,dob,weight,height,bio,preferred_foot,previous_experience,reason_for_joining"
      )
      .eq("team_id", teamId)
      .order("created_at", { ascending: false });

    if (error) throw new ServiceError(error.message, 500);
    return data ?? [];
  }
}
