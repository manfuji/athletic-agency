import type { SupabaseClient } from "@supabase/supabase-js";
import { ServiceError } from "@/server/errors/serviceError";

export type BioDataRow = {
  bio_data_id: string;
  player_code: string | null;
  player_name: string;
  aa_stats_email: string | null;
  dob: string | null;
  position: string | null;
  nationality: string | null;
  season_id: number | null;
  team_id: string | null;
  jersey_number: number | null;
  photo_url: string | null;
  created_at: string | null;
  updated_at: string | null;
  mapping?: {
    player_id: string;
    player?: { id: string; name: string } | null;
  } | null;
};

export type BioDataPage = {
  current_page: number;
  data: BioDataRow[];
  per_page: number;
  total: number;
  last_page: number;
};

export type BioDataUpdatePatch = Partial<{
  player_name: string;
  aa_stats_email: string | null;
  dob: string | null;
  position: string | null;
  nationality: string | null;
  season_id: number | null;
  team_id: string | null;
  jersey_number: number | null;
  photo_url: string | null;
}>;

export interface IBioDataRepository {
  listPaged(params: {
    page: number;
    perPage: number;
    q?: string | null;
    seasonId?: number | null;
    teamId?: string | null;
  }): Promise<BioDataPage>;
  getById(bioDataId: string): Promise<BioDataRow | null>;
  update(bioDataId: string, patch: BioDataUpdatePatch): Promise<void>;
}

export class BioDataSupabaseRepository implements IBioDataRepository {
  constructor(private readonly db: SupabaseClient) {}

  async listPaged(params: {
    page: number;
    perPage: number;
    q?: string | null;
    seasonId?: number | null;
    teamId?: string | null;
  }): Promise<BioDataPage> {
    const { page, perPage } = params;
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let q = this.db
      .from("v_bio_data_normalized")
      .select(
        `
        bio_data_id,
        player_code,
        player_name,
        aa_stats_email,
        dob,
        position,
        nationality,
        season_id,
        team_id,
        jersey_number,
        photo_url,
        created_at,
        updated_at,
        mapping:player_legacy_map!left(bio_data_id)(
          player_id,
          player:players(id,name)
        )
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false });

    const term = (params.q ?? "").trim();
    if (term) {
      // PostgREST OR filter
      q = q.or(
        `player_name.ilike.%${term}%,aa_stats_email.ilike.%${term}%,player_code.ilike.%${term}%`
      );
    }

    if (params.seasonId != null) q = q.eq("season_id", params.seasonId);
    if (params.teamId) q = q.eq("team_id", params.teamId);

    const { data, error, count } = await q.range(from, to);
    if (error) throw new ServiceError(error.message, 500);

    const total = count ?? 0;
    return {
      current_page: page,
      data: (data ?? []) as BioDataRow[],
      per_page: perPage,
      total,
      last_page: total ? Math.max(1, Math.ceil(total / perPage)) : 1,
    };
  }

  async getById(bioDataId: string): Promise<BioDataRow | null> {
    const { data, error } = await this.db
      .from("v_bio_data_normalized")
      .select(
        `
        bio_data_id,
        player_code,
        player_name,
        aa_stats_email,
        dob,
        position,
        nationality,
        season_id,
        team_id,
        jersey_number,
        photo_url,
        created_at,
        updated_at,
        mapping:player_legacy_map!left(bio_data_id)(
          player_id,
          player:players(id,name)
        )
      `
      )
      .eq("bio_data_id", bioDataId)
      .maybeSingle();

    if (error) throw new ServiceError(error.message, 500);
    return (data as BioDataRow | null) ?? null;
  }

  async update(bioDataId: string, patch: BioDataUpdatePatch): Promise<void> {
    // Update raw legacy table with quoted-column identifiers.
    const dbPatch: Record<string, unknown> = {};
    if (patch.player_name !== undefined) dbPatch["Player Name"] = patch.player_name;
    if (patch.aa_stats_email !== undefined) dbPatch["AA STATS EMAIL"] = patch.aa_stats_email;
    if (patch.dob !== undefined) dbPatch["DOB"] = patch.dob;
    if (patch.position !== undefined) dbPatch["Position"] = patch.position;
    if (patch.nationality !== undefined) dbPatch["Nationality"] = patch.nationality;
    if (patch.season_id !== undefined) dbPatch["season_id"] = patch.season_id;
    if (patch.team_id !== undefined) dbPatch["team_id"] = patch.team_id;
    if (patch.jersey_number !== undefined) dbPatch["jersey_number"] = patch.jersey_number;
    if (patch.photo_url !== undefined) dbPatch["photo_url"] = patch.photo_url;
    dbPatch["updated_at"] = new Date().toISOString();

    const { error } = await this.db.from("bio_data").update(dbPatch).eq("id", bioDataId);
    if (error) throw new ServiceError(error.message, 500);
  }
}

