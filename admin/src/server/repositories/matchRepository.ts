import type { SupabaseClient } from "@supabase/supabase-js";
import { ServiceError } from "@/server/errors/serviceError";

const PER_PAGE_LOGS = 20;

function groupFixturesByDate(
  rows: Record<string, unknown>[]
): Record<string, Record<string, unknown>[]> {
  const out: Record<string, Record<string, unknown>[]> = {};
  for (const r of rows) {
    const d = String(r.match_date || "").slice(0, 10);
    const key = d || "unknown";
    if (!out[key]) out[key] = [];
    out[key].push(r);
  }
  return out;
}

export interface IMatchRepository {
  listFixturesGrouped(competitionId: string): Promise<Record<string, unknown[]>>;
  getFixture(fixtureId: string): Promise<Record<string, unknown> | null>;
  insertFixture(row: Record<string, unknown>): Promise<Record<string, unknown>>;
  deleteFixture(fixtureId: string): Promise<void>;
  listResultsGrouped(
    competitionId: string
  ): Promise<Record<string, unknown[]>>;
  insertResult(row: Record<string, unknown>): Promise<Record<string, unknown>>;
  insertGoal(row: Record<string, unknown>): Promise<void>;
  insertCard(row: Record<string, unknown>): Promise<void>;
  insertSub(row: Record<string, unknown>): Promise<void>;
  listMatchLogs(
    fixtureId: string,
    page: number
  ): Promise<{ data: unknown[]; last_page: number; total: number }>;
  deleteMatchLog(logId: string): Promise<void>;
  getPlayerStatAggregate(
    playerId: string,
    fixtureId: string | null
  ): Promise<Record<string, unknown>>;
  upsertPlayerStats(row: Record<string, unknown>): Promise<void>;
  aggregateStandingsByTeam(
    competitionId: string,
    points?: { win: number; draw: number; loss: number }
  ): Promise<
    Record<
      string,
      {
        played: number;
        won: number;
        draw: number;
        lost: number;
        goals_for: number;
        goals_against: number;
        point: number;
      }
    >
  >;
}

export class MatchSupabaseRepository implements IMatchRepository {
  constructor(private readonly db: SupabaseClient) {}

  async listFixturesGrouped(
    competitionId: string
  ): Promise<Record<string, unknown[]>> {
    const { data, error } = await this.db
      .from("fixtures")
      .select("*")
      .eq("competition_id", competitionId)
      .order("match_date", { ascending: true });

    if (error) throw new ServiceError(error.message, 500);
    return groupFixturesByDate((data ?? []) as Record<string, unknown>[]);
  }

  async getFixture(
    fixtureId: string
  ): Promise<Record<string, unknown> | null> {
    const { data, error } = await this.db
      .from("fixtures")
      .select("*")
      .eq("id", fixtureId)
      .maybeSingle();

    if (error) throw new ServiceError(error.message, 500);
    return data as Record<string, unknown> | null;
  }

  async insertFixture(
    row: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const { data, error } = await this.db
      .from("fixtures")
      .insert(row)
      .select("*")
      .single();

    if (error) throw new ServiceError(error.message, 500);
    return data as Record<string, unknown>;
  }

  async deleteFixture(fixtureId: string): Promise<void> {
    const { error } = await this.db
      .from("fixtures")
      .delete()
      .eq("id", fixtureId);
    if (error) throw new ServiceError(error.message, 500);
  }

  async listResultsGrouped(
    competitionId: string
  ): Promise<Record<string, unknown[]>> {
    const { data: fx, error: e1 } = await this.db
      .from("fixtures")
      .select("id")
      .eq("competition_id", competitionId);
    if (e1) throw new ServiceError(e1.message, 500);
    const ids = (fx ?? []).map((f: { id: string }) => f.id);
    if (ids.length === 0) return { all: [] };

    const { data, error } = await this.db
      .from("results")
      .select("*")
      .in("fixture_id", ids);

    if (error) throw new ServiceError(error.message, 500);
    return { all: data ?? [] };
  }

  async insertResult(
    row: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const fixtureId = row.fixture_id as string;
    const { data: existing } = await this.db
      .from("results")
      .select("id")
      .eq("fixture_id", fixtureId)
      .maybeSingle();

    if (existing) {
      const { data, error } = await this.db
        .from("results")
        .update(row)
        .eq("fixture_id", fixtureId)
        .select("*")
        .single();
      if (error) throw new ServiceError(error.message, 500);
      return data as Record<string, unknown>;
    }

    const { data, error } = await this.db
      .from("results")
      .insert(row)
      .select("*")
      .single();

    if (error) throw new ServiceError(error.message, 500);
    return data as Record<string, unknown>;
  }

  async insertGoal(row: Record<string, unknown>): Promise<void> {
    const { error } = await this.db.from("match_goals").insert(row);
    if (error) throw new ServiceError(error.message, 500);
  }

  async insertCard(row: Record<string, unknown>): Promise<void> {
    const { error } = await this.db.from("match_cards").insert(row);
    if (error) throw new ServiceError(error.message, 500);
  }

  async insertSub(row: Record<string, unknown>): Promise<void> {
    const { error } = await this.db.from("match_substitutions").insert(row);
    if (error) throw new ServiceError(error.message, 500);
  }

  async listMatchLogs(
    fixtureId: string,
    page: number
  ): Promise<{ data: unknown[]; last_page: number; total: number }> {
    const from = (page - 1) * PER_PAGE_LOGS;
    const to = from + PER_PAGE_LOGS - 1;

    const { data, error, count } = await this.db
      .from("match_logs")
      .select("*, players ( id, name )", { count: "exact" })
      .eq("fixture_id", fixtureId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw new ServiceError(error.message, 500);
    const total = count ?? 0;
    return {
      data: data ?? [],
      last_page: total ? Math.max(1, Math.ceil(total / PER_PAGE_LOGS)) : 1,
      total,
    };
  }

  async deleteMatchLog(logId: string): Promise<void> {
    const { error } = await this.db
      .from("match_logs")
      .delete()
      .eq("id", logId);
    if (error) throw new ServiceError(error.message, 500);
  }

  async getPlayerStatAggregate(
    playerId: string,
    fixtureId: string | null
  ): Promise<Record<string, unknown>> {
    let q = this.db
      .from("player_statistics")
      .select("*")
      .eq("player_id", playerId);
    if (fixtureId) q = q.eq("fixture_id", fixtureId);
    else q = q.is("fixture_id", null);
    const { data, error } = await q.maybeSingle();

    if (error) throw new ServiceError(error.message, 500);
    return (data as Record<string, unknown>) ?? {};
  }

  async upsertPlayerStats(row: Record<string, unknown>): Promise<void> {
    const player_id = row.player_id as string;
    const fixture_id = row.fixture_id as string | undefined;
    if (!player_id || !fixture_id) {
      throw new ServiceError("player_id and fixture_id are required", 400);
    }

    const { data: existing, error: e0 } = await this.db
      .from("player_statistics")
      .select("id")
      .eq("player_id", player_id)
      .eq("fixture_id", fixture_id)
      .maybeSingle();

    if (e0) throw new ServiceError(e0.message, 500);

    const patch = { ...row, updated_at: new Date().toISOString() };

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

  async aggregateStandingsByTeam(
    competitionId: string,
    points?: { win: number; draw: number; loss: number }
  ): Promise<
    Record<
      string,
      {
        played: number;
        won: number;
        draw: number;
        lost: number;
        goals_for: number;
        goals_against: number;
        point: number;
      }
    >
  > {
    type Agg = {
      played: number;
      won: number;
      draw: number;
      lost: number;
      goals_for: number;
      goals_against: number;
      point: number;
    };
    const { data: rows, error } = await this.db
      .from("fixtures")
      .select(
        `
        home_team_id,
        away_team_id,
        results (
          home_team_score,
          away_team_score
        )
      `
      )
      .eq("competition_id", competitionId);

    if (error) throw new ServiceError(error.message, 500);

    const acc: Record<string, Agg> = {};
    const bump = (id: string): Agg => {
      if (!acc[id]) {
        acc[id] = {
          played: 0,
          won: 0,
          draw: 0,
          lost: 0,
          goals_for: 0,
          goals_against: 0,
          point: 0,
        };
      }
      return acc[id];
    };

    for (const row of (rows ?? []) as Record<string, unknown>[]) {
      const raw = row.results;
      const res = Array.isArray(raw) ? raw[0] : raw;
      if (!res || typeof res !== "object") continue;
      const r = res as Record<string, unknown>;
      const h = row.home_team_id as string;
      const a = row.away_team_id as string;
      const hs = Number(r.home_team_score ?? 0);
      const as = Number(r.away_team_score ?? 0);
      const th = bump(h);
      const ta = bump(a);
      th.played++;
      ta.played++;
      th.goals_for += hs;
      th.goals_against += as;
      ta.goals_for += as;
      ta.goals_against += hs;
      if (hs === as) {
        th.draw++;
        ta.draw++;
        th.point += points?.draw ?? 1;
        ta.point += points?.draw ?? 1;
      } else if (hs > as) {
        th.won++;
        th.point += points?.win ?? 3;
        ta.lost++;
        ta.point += points?.loss ?? 0;
      } else {
        ta.won++;
        ta.point += points?.win ?? 3;
        th.lost++;
        th.point += points?.loss ?? 0;
      }
    }
    return acc;
  }
}
