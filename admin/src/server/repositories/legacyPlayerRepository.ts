import type { SupabaseClient } from "@supabase/supabase-js";
import { ServiceError } from "@/server/errors/serviceError";

export type LegacyBioDataRow = {
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
};

export type LegacyBioDataPage = {
  current_page: number;
  data: LegacyBioDataRow[];
  per_page: number;
  total: number;
  last_page: number;
};

export interface ILegacyPlayerRepository {
  listUnmappedBioData(page: number, perPage: number): Promise<LegacyBioDataPage>;
  linkPlayerToBioData(playerId: string, bioDataId: string): Promise<void>;
  createPlayerFromBioData(bioDataId: string): Promise<{ player_id: string }>;
  unlinkBioData(bioDataId: string): Promise<void>;
}

export class LegacyPlayerSupabaseRepository implements ILegacyPlayerRepository {
  constructor(private readonly db: SupabaseClient) {}

  async listUnmappedBioData(
    page: number,
    perPage: number
  ): Promise<LegacyBioDataPage> {
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const { data, error, count } = await this.db
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
        map:player_legacy_map!left(bio_data_id)
      `,
        { count: "exact" }
      )
      .is("map.bio_data_id", null)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw new ServiceError(error.message, 500);

    const total = count ?? 0;
    const rows = (data ?? []).map((row: Record<string, unknown>) => {
      const r = row as Record<string, unknown>;
      return {
        bio_data_id: String(r.bio_data_id ?? ""),
        player_code: (r.player_code as string | null) ?? null,
        player_name: String(r.player_name ?? ""),
        aa_stats_email: (r.aa_stats_email as string | null) ?? null,
        dob: (r.dob as string | null) ?? null,
        position: (r.position as string | null) ?? null,
        nationality: (r.nationality as string | null) ?? null,
        season_id:
          typeof r.season_id === "number"
            ? r.season_id
            : r.season_id == null
              ? null
              : Number(r.season_id),
        team_id: (r.team_id as string | null) ?? null,
        jersey_number:
          typeof r.jersey_number === "number"
            ? r.jersey_number
            : r.jersey_number == null
              ? null
              : Number(r.jersey_number),
        photo_url: (r.photo_url as string | null) ?? null,
        created_at: (r.created_at as string | null) ?? null,
        updated_at: (r.updated_at as string | null) ?? null,
      } satisfies LegacyBioDataRow;
    });

    return {
      current_page: page,
      data: rows,
      per_page: perPage,
      total,
      last_page: total ? Math.max(1, Math.ceil(total / perPage)) : 1,
    };
  }

  async linkPlayerToBioData(playerId: string, bioDataId: string): Promise<void> {
    const { error } = await this.db.from("player_legacy_map").insert({
      player_id: playerId,
      bio_data_id: bioDataId,
    });
    if (error) throw new ServiceError(error.message, 500);
  }

  async unlinkBioData(bioDataId: string): Promise<void> {
    const { error } = await this.db
      .from("player_legacy_map")
      .delete()
      .eq("bio_data_id", bioDataId);
    if (error) throw new ServiceError(error.message, 500);
  }

  async createPlayerFromBioData(
    bioDataId: string
  ): Promise<{ player_id: string }> {
    const { data: bio, error: e1 } = await this.db
      .from("v_bio_data_normalized")
      .select("*")
      .eq("bio_data_id", bioDataId)
      .maybeSingle();
    if (e1) throw new ServiceError(e1.message, 500);
    if (!bio) throw new ServiceError("Bio data not found", 404);

    const row = bio as Record<string, unknown>;
    const name = String(row.player_name ?? "").trim();
    if (!name) throw new ServiceError("Bio data is missing player_name", 400);

    // Leave team unassigned so admins can place players onto teams they create.
    const insertRow: Record<string, unknown> = {
      name,
      team_id: null,
      dob: (row.dob as string | null) ?? null,
      position: (row.position as string | null) ?? null,
      nationality: (row.nationality as string | null) ?? null,
      profile_picture: (row.photo_url as string | null) ?? null,
      sections: [],
    };

    const { data: created, error: e2 } = await this.db
      .from("players")
      .insert(insertRow)
      .select("id")
      .single();
    if (e2) throw new ServiceError(e2.message, 500);

    const playerId = (created as { id: string }).id;
    await this.linkPlayerToBioData(playerId, bioDataId);
    return { player_id: playerId };
  }
}

