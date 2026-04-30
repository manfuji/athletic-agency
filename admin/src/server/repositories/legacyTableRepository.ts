import type { SupabaseClient } from "@supabase/supabase-js";
import { ServiceError } from "@/server/errors/serviceError";
import type { LegacyTableName } from "@/server/schemas/legacyTable";

export type LegacyTablePage = {
  current_page: number;
  data: Record<string, unknown>[];
  per_page: number;
  total: number;
  last_page: number;
};

export interface ILegacyTableRepository {
  list(params: {
    table: LegacyTableName;
    page: number;
    perPage: number;
    matchId?: string | null;
  }): Promise<LegacyTablePage>;
  getById(table: LegacyTableName, id: string): Promise<Record<string, unknown> | null>;
  update(
    table: LegacyTableName,
    id: string,
    patch: Record<string, unknown>
  ): Promise<void>;
}

export class LegacyTableSupabaseRepository implements ILegacyTableRepository {
  constructor(private readonly db: SupabaseClient) {}

  private async hydrateLabels(table: LegacyTableName, rows: Record<string, unknown>[]) {
    if (table === "matches") {
      const seasonIds = Array.from(
        new Set(
          rows
            .map((r) => (r as Record<string, unknown>).season_id)
            .filter((v): v is number => typeof v === "number")
        )
      );
      const teamIds = Array.from(
        new Set(
          rows
            .flatMap((r) => [
              String((r as Record<string, unknown>).home_team_id ?? ""),
              String((r as Record<string, unknown>).away_team_id ?? ""),
            ])
            .filter(Boolean)
        )
      );

      const [seasonsRes, teamsRes] = await Promise.all([
        seasonIds.length
          ? this.db.from("event_seasons").select("id,name,year").in("id", seasonIds)
          : Promise.resolve({ data: [], error: null }),
        teamIds.length
          ? this.db.from("teams").select("id,name,short_code").in("id", teamIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (seasonsRes.error) throw new ServiceError(seasonsRes.error.message, 500);
      if (teamsRes.error) throw new ServiceError(teamsRes.error.message, 500);

      const seasonMap = new Map<string, string>();
      for (const s of (seasonsRes.data ?? []) as Record<string, unknown>[]) {
        seasonMap.set(
          String(s.id),
          `${String(s.name ?? "")} ${String(s.year ?? "")}`.trim()
        );
      }

      const teamMap = new Map<string, string>();
      for (const t of (teamsRes.data ?? []) as Record<string, unknown>[]) {
        const short = t.short_code ? String(t.short_code) : "";
        const name = t.name ? String(t.name) : "";
        teamMap.set(String(t.id), short ? `${name} (${short})` : name);
      }

      return rows.map((r) => {
        const rr = r as Record<string, unknown>;
        const date = rr.Date ? String(rr.Date) : "";
        const event = rr.Event ? String(rr.Event) : "";
        const teams = rr.Teams ? String(rr.Teams) : "";
        const score =
          rr.home_score != null && rr.away_score != null
            ? `${String(rr.home_score)}-${String(rr.away_score)}`
            : "";

        const homeTeam = rr.home_team_id ? teamMap.get(String(rr.home_team_id)) ?? null : null;
        const awayTeam = rr.away_team_id ? teamMap.get(String(rr.away_team_id)) ?? null : null;
        const season = typeof rr.season_id === "number" ? seasonMap.get(String(rr.season_id)) ?? null : null;

        return {
          ...rr,
          __labels: {
            match: [date, teams, score ? `(${score})` : ""].filter(Boolean).join(" • ") || null,
            team: [homeTeam, awayTeam].filter(Boolean).join(" vs ") || null,
            player: null,
            season,
            event: event || null,
          },
        };
      });
    }

    const matchIds = Array.from(
      new Set(rows.map((r) => String((r as Record<string, unknown>).match_id ?? "")).filter(Boolean))
    );
    const teamIds = Array.from(
      new Set(rows.map((r) => String((r as Record<string, unknown>).team_id ?? "")).filter(Boolean))
    );
    const bioIds = Array.from(
      new Set(rows.map((r) => String((r as Record<string, unknown>).player_id ?? "")).filter(Boolean))
    );

    const [matchesRes, teamsRes, bioRes] = await Promise.all([
      matchIds.length
        ? this.db
            .from("matches")
            .select(`id,Date,Teams,home_score,away_score`)
            .in("id", matchIds)
        : Promise.resolve({ data: [], error: null }),
      teamIds.length
        ? this.db.from("teams").select(`id,name,short_code`).in("id", teamIds)
        : Promise.resolve({ data: [], error: null }),
      bioIds.length
        ? this.db
            .from("v_bio_data_normalized")
            .select(`bio_data_id,player_name,player_code`)
            .in("bio_data_id", bioIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (matchesRes.error) throw new ServiceError(matchesRes.error.message, 500);
    if (teamsRes.error) throw new ServiceError(teamsRes.error.message, 500);
    if (bioRes.error) throw new ServiceError(bioRes.error.message, 500);

    const matchMap = new Map<string, string>();
    for (const m of (matchesRes.data ?? []) as Record<string, unknown>[]) {
      const date = m.Date ? String(m.Date) : "";
      const teams = m.Teams ? String(m.Teams) : "";
      const score =
        m.home_score != null && m.away_score != null
          ? ` (${String(m.home_score)}-${String(m.away_score)})`
          : "";
      matchMap.set(String(m.id), [date, teams].filter(Boolean).join(" • ") + score);
    }

    const teamMap = new Map<string, string>();
    for (const t of (teamsRes.data ?? []) as Record<string, unknown>[]) {
      const short = t.short_code ? String(t.short_code) : "";
      const name = t.name ? String(t.name) : "";
      teamMap.set(String(t.id), short ? `${name} (${short})` : name);
    }

    const bioMap = new Map<string, string>();
    for (const b of (bioRes.data ?? []) as Record<string, unknown>[]) {
      const code = b.player_code ? String(b.player_code) : "";
      const name = b.player_name ? String(b.player_name) : "";
      bioMap.set(String(b.bio_data_id), code ? `${name} (${code})` : name);
    }

    return rows.map((r) => {
      const rr = r as Record<string, unknown>;
      const matchId = String(rr.match_id ?? "");
      const teamId = String(rr.team_id ?? "");
      const bioId = String(rr.player_id ?? "");
      return {
        ...rr,
        __labels: {
          match: matchId ? matchMap.get(matchId) ?? null : null,
          team: teamId ? teamMap.get(teamId) ?? null : null,
          player: bioId ? bioMap.get(bioId) ?? null : null,
        },
      };
    });
  }

  async list(params: {
    table: LegacyTableName;
    page: number;
    perPage: number;
    matchId?: string | null;
  }): Promise<LegacyTablePage> {
    const from = (params.page - 1) * params.perPage;
    const to = from + params.perPage - 1;

    let q = this.db.from(params.table).select("*", { count: "exact" });
    if (params.matchId) {
      // Most legacy stat tables use match_id; safe to attempt.
      q = q.eq("match_id", params.matchId);
    }

    const { data, error, count } = await q
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw new ServiceError(error.message, 500);

    const total = count ?? 0;
    const hydrated = await this.hydrateLabels(
      params.table,
      (data ?? []) as Record<string, unknown>[]
    );
    return {
      current_page: params.page,
      data: hydrated,
      per_page: params.perPage,
      total,
      last_page: total ? Math.max(1, Math.ceil(total / params.perPage)) : 1,
    };
  }

  async getById(
    table: LegacyTableName,
    id: string
  ): Promise<Record<string, unknown> | null> {
    const { data, error } = await this.db
      .from(table)
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new ServiceError(error.message, 500);
    return (data as Record<string, unknown> | null) ?? null;
  }

  async update(
    table: LegacyTableName,
    id: string,
    patch: Record<string, unknown>
  ): Promise<void> {
    const { error } = await this.db.from(table).update(patch).eq("id", id);
    if (error) throw new ServiceError(error.message, 500);
  }
}

