import type { SupabaseClient } from "@supabase/supabase-js";
import { ServiceError } from "@/server/errors/serviceError";

export type PlayersWithoutTeamPage = {
  current_page: number;
  data: unknown[];
  per_page: number;
  total: number;
  last_page: number;
};

export type PlayerRowInsert = Record<string, unknown>;

export interface IPlayerRepository {
  listWithoutTeam(page: number, perPage: number): Promise<PlayersWithoutTeamPage>;
  listAll(page: number, perPage: number): Promise<PlayersWithoutTeamPage>;
  findByIdWithOptionalStats(
    playerId: string,
    competitionId: string | null
  ): Promise<Record<string, unknown>>;
  insertPlayer(row: PlayerRowInsert): Promise<{ id: string }>;
  updatePlayer(
    playerId: string,
    patch: PlayerRowInsert
  ): Promise<Record<string, unknown> | null>;
  deletePlayer(playerId: string): Promise<void>;
  setTeamId(playerId: string, teamId: string | null): Promise<void>;
  listByTeamIds(teamIds: string[]): Promise<unknown[]>;
  listCompetitionStatsForExport(
    competitionId: string
  ): Promise<Map<string, Record<string, unknown>>>;
  upsertCompetitionPlayerStats(
    playerId: string,
    competitionId: string,
    stats: Record<string, number | null>
  ): Promise<void>;
}

export class PlayerSupabaseRepository implements IPlayerRepository {
  constructor(private readonly db: SupabaseClient) {}

  async listWithoutTeam(
    page: number,
    perPage: number
  ): Promise<PlayersWithoutTeamPage> {
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const { data, error, count } = await this.db
      .from("players")
      .select("id,name,profile_picture,team_id,position,created_at", {
        count: "exact",
      })
      .is("team_id", null)
      .range(from, to)
      .order("created_at", { ascending: false });

    if (error) throw new ServiceError(error.message, 500);

    const total = count ?? 0;
    return {
      current_page: page,
      data: data ?? [],
      per_page: perPage,
      total,
      last_page: total ? Math.max(1, Math.ceil(total / perPage)) : 1,
    };
  }

  async listAll(
    page: number,
    perPage: number
  ): Promise<PlayersWithoutTeamPage> {
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const { data, error, count } = await this.db
      .from("players")
      .select("id,name,profile_picture,team_id,position,created_at", {
        count: "exact",
      })
      .range(from, to)
      .order("created_at", { ascending: false });

    if (error) throw new ServiceError(error.message, 500);

    const total = count ?? 0;
    return {
      current_page: page,
      data: data ?? [],
      per_page: perPage,
      total,
      last_page: total ? Math.max(1, Math.ceil(total / perPage)) : 1,
    };
  }

  async findByIdWithOptionalStats(
    playerId: string,
    competitionId: string | null
  ): Promise<Record<string, unknown>> {
    const { data: player, error } = await this.db
      .from("players")
      .select("*")
      .eq("id", playerId)
      .maybeSingle();

    if (error) throw new ServiceError(error.message, 500);
    if (!player) throw new ServiceError("Player not found", 404);

    let statistics: Record<string, unknown> | null = null;
    let statisticsCompetitionId: string | null = null;

    if (competitionId) {
      const { data: statsRow } = await this.db
        .from("player_statistics")
        .select("*")
        .eq("player_id", playerId)
        .eq("competition_id", competitionId)
        .is("fixture_id", null)
        .maybeSingle();
      if (statsRow) {
        statistics = statsRow as Record<string, unknown>;
        statisticsCompetitionId = competitionId;
      }
    } else {
      const { data: statsRow } = await this.db
        .from("player_statistics")
        .select("*")
        .eq("player_id", playerId)
        .not("competition_id", "is", null)
        .is("fixture_id", null)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (statsRow) {
        const row = statsRow as Record<string, unknown>;
        statistics = row;
        statisticsCompetitionId =
          typeof row.competition_id === "string" ? row.competition_id : null;
      }
    }

    const row = player as Record<string, unknown>;
    return {
      ...row,
      ...(statistics ? { statistics } : {}),
      ...(statisticsCompetitionId
        ? { statistics_competition_id: statisticsCompetitionId }
        : {}),
      sections: row.sections ?? [],
    };
  }

  async insertPlayer(row: PlayerRowInsert): Promise<{ id: string }> {
    const { data, error } = await this.db
      .from("players")
      .insert(row)
      .select("id")
      .single();

    if (error) throw new ServiceError(error.message, 500);
    return { id: (data as { id: string }).id };
  }

  async updatePlayer(
    playerId: string,
    patch: PlayerRowInsert
  ): Promise<Record<string, unknown> | null> {
    const { data, error } = await this.db
      .from("players")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", playerId)
      .select("*")
      .maybeSingle();

    if (error) throw new ServiceError(error.message, 500);
    return data as Record<string, unknown> | null;
  }

  async deletePlayer(playerId: string): Promise<void> {
    const { error } = await this.db.from("players").delete().eq("id", playerId);
    if (error) throw new ServiceError(error.message, 500);
  }

  async setTeamId(playerId: string, teamId: string | null): Promise<void> {
    const { error } = await this.db
      .from("players")
      .update({ team_id: teamId, updated_at: new Date().toISOString() })
      .eq("id", playerId);

    if (error) throw new ServiceError(error.message, 500);
  }

  async listByTeamIds(teamIds: string[]): Promise<unknown[]> {
    if (teamIds.length === 0) return [];
    const { data, error } = await this.db
      .from("players")
      .select("id,name,team_id,position,nationality,dob,profile_picture")
      .in("team_id", teamIds)
      .order("name", { ascending: true });

    if (error) throw new ServiceError(error.message, 500);
    return data ?? [];
  }

  async listCompetitionStatsForExport(
    competitionId: string
  ): Promise<Map<string, Record<string, unknown>>> {
    const { data, error } = await this.db
      .from("player_statistics")
      .select("*")
      .eq("competition_id", competitionId)
      .is("fixture_id", null);

    if (error) throw new ServiceError(error.message, 500);

    const map = new Map<string, Record<string, unknown>>();
    for (const row of data ?? []) {
      const playerId = (row as { player_id?: string }).player_id;
      if (playerId) map.set(playerId, row as Record<string, unknown>);
    }
    return map;
  }

  async upsertCompetitionPlayerStats(
    playerId: string,
    competitionId: string,
    stats: Record<string, number | null>
  ): Promise<void> {
    const { data: existing, error: e0 } = await this.db
      .from("player_statistics")
      .select("id")
      .eq("player_id", playerId)
      .eq("competition_id", competitionId)
      .is("fixture_id", null)
      .maybeSingle();

    if (e0) throw new ServiceError(e0.message, 500);

    const patch = {
      ...stats,
      player_id: playerId,
      competition_id: competitionId,
      fixture_id: null,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      const { error } = await this.db
        .from("player_statistics")
        .update(patch)
        .eq("id", (existing as { id: string }).id);
      if (error) throw new ServiceError(error.message, 500);
      return;
    }

    const { error } = await this.db.from("player_statistics").insert({
      ...patch,
      created_at: new Date().toISOString(),
    });
    if (error) throw new ServiceError(error.message, 500);
  }
}
