import type { SupabaseClient } from "@supabase/supabase-js";
import { ServiceError } from "@/server/errors/serviceError";
import type { OpsTableName } from "@/server/schemas/opsTable";

export interface IOpsTableRepository {
  list(params: {
    table: OpsTableName;
    page: number;
    perPage: number;
  }): Promise<{
    current_page: number;
    data: Record<string, unknown>[];
    per_page: number;
    total: number;
    last_page: number;
  }>;
  getById(table: OpsTableName, id: string): Promise<Record<string, unknown> | null>;
  update(table: OpsTableName, id: string, patch: Record<string, unknown>): Promise<void>;
}

export class OpsTableSupabaseRepository implements IOpsTableRepository {
  constructor(private readonly db: SupabaseClient) {}

  private async hydrateLabels(
    table: OpsTableName,
    rows: Record<string, unknown>[]
  ): Promise<Record<string, unknown>[]> {
    const ids = (key: string) =>
      Array.from(
        new Set(
          rows
            .map((r) => {
              const v = (r as Record<string, unknown>)[key];
              return v == null ? "" : String(v);
            })
            .filter(Boolean)
        )
      );

    const playerIds = ids("player_id");
    const evaluatorIds = ids("evaluator_id");
    const sessionIds = ids("session_id");
    const seasonIds = Array.from(
      new Set(
        rows
          .map((r) => (r as Record<string, unknown>).season_id)
          .filter((v): v is number => typeof v === "number")
      )
    );
    const teamIds = ids("team_id");
    const draftEventIds = ids("draft_event_id");

    const [bioRes, evalRes, sessionRes, seasonRes, teamRes, draftRes] = await Promise.all([
      playerIds.length
        ? this.db
            .from("v_bio_data_normalized")
            .select("bio_data_id,player_name,player_code")
            .in("bio_data_id", playerIds)
        : Promise.resolve({ data: [], error: null }),
      evaluatorIds.length
        ? this.db.from("evaluators").select("id,full_name").in("id", evaluatorIds)
        : Promise.resolve({ data: [], error: null }),
      sessionIds.length
        ? this.db
            .from("evaluation_sessions")
            .select("id,session_type,session_date,location")
            .in("id", sessionIds)
        : Promise.resolve({ data: [], error: null }),
      seasonIds.length
        ? this.db.from("event_seasons").select("id,name,year").in("id", seasonIds)
        : Promise.resolve({ data: [], error: null }),
      teamIds.length
        ? this.db.from("teams").select("id,name,short_code").in("id", teamIds)
        : Promise.resolve({ data: [], error: null }),
      draftEventIds.length
        ? this.db.from("draft_events").select("id,draft_date,season_id").in("id", draftEventIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    for (const r of [bioRes, evalRes, sessionRes, seasonRes, teamRes, draftRes]) {
      if (r.error) throw new ServiceError(r.error.message, 500);
    }

    const bioMap = new Map<string, string>();
    for (const b of (bioRes.data ?? []) as Record<string, unknown>[]) {
      const code = b.player_code ? String(b.player_code) : "";
      const name = b.player_name ? String(b.player_name) : "";
      bioMap.set(String(b.bio_data_id), code ? `${name} (${code})` : name);
    }

    const evaluatorMap = new Map<string, string>();
    for (const e of (evalRes.data ?? []) as Record<string, unknown>[]) {
      evaluatorMap.set(String(e.id), String(e.full_name ?? ""));
    }

    const sessionMap = new Map<string, string>();
    for (const s of (sessionRes.data ?? []) as Record<string, unknown>[]) {
      const date = s.session_date ? String(s.session_date) : "";
      const type = s.session_type ? String(s.session_type) : "";
      const loc = s.location ? String(s.location) : "";
      sessionMap.set(String(s.id), [date, type, loc].filter(Boolean).join(" • "));
    }

    const seasonMap = new Map<string, string>();
    for (const s of (seasonRes.data ?? []) as Record<string, unknown>[]) {
      seasonMap.set(String(s.id), `${String(s.name ?? "")} ${String(s.year ?? "")}`.trim());
    }

    const teamMap = new Map<string, string>();
    for (const t of (teamRes.data ?? []) as Record<string, unknown>[]) {
      const short = t.short_code ? String(t.short_code) : "";
      const name = t.name ? String(t.name) : "";
      teamMap.set(String(t.id), short ? `${name} (${short})` : name);
    }

    const draftMap = new Map<string, string>();
    for (const d of (draftRes.data ?? []) as Record<string, unknown>[]) {
      const date = d.draft_date ? String(d.draft_date) : "";
      const season =
        typeof d.season_id === "number" ? seasonMap.get(String(d.season_id)) : null;
      draftMap.set(String(d.id), [date, season].filter(Boolean).join(" • "));
    }

    return rows.map((row) => {
      const r = row as Record<string, unknown>;
      const playerId = r.player_id == null ? "" : String(r.player_id);
      const evaluatorId = r.evaluator_id == null ? "" : String(r.evaluator_id);
      const sessionId = r.session_id == null ? "" : String(r.session_id);
      const seasonId = typeof r.season_id === "number" ? String(r.season_id) : "";
      const teamId = r.team_id == null ? "" : String(r.team_id);
      const draftEventId = r.draft_event_id == null ? "" : String(r.draft_event_id);

      const summaryParts: string[] = [];
      if (table === "player_evaluations") {
        if (playerId) summaryParts.push(bioMap.get(playerId) ?? playerId);
        if (evaluatorId) summaryParts.push(evaluatorMap.get(evaluatorId) ?? evaluatorId);
        if (sessionId) summaryParts.push(sessionMap.get(sessionId) ?? sessionId);
      } else if (table === "draft_picks") {
        if (draftEventId) summaryParts.push(draftMap.get(draftEventId) ?? draftEventId);
        if (teamId) summaryParts.push(teamMap.get(teamId) ?? teamId);
        if (playerId) summaryParts.push(bioMap.get(playerId) ?? playerId);
      } else if (table === "draft_events") {
        if (seasonId) summaryParts.push(seasonMap.get(seasonId) ?? seasonId);
      } else if (table === "evaluators") {
        const name = typeof r.full_name === "string" ? r.full_name : "";
        if (name) summaryParts.push(name);
        if (seasonId) summaryParts.push(seasonMap.get(seasonId) ?? seasonId);
      } else if (table === "evaluation_sessions") {
        if (seasonId) summaryParts.push(seasonMap.get(seasonId) ?? seasonId);
        const date = r.session_date == null ? "" : String(r.session_date);
        const type = r.session_type == null ? "" : String(r.session_type);
        summaryParts.push([date, type].filter(Boolean).join(" • "));
      }

      return {
        ...r,
        __labels: {
          player: playerId ? bioMap.get(playerId) ?? null : null,
          evaluator: evaluatorId ? evaluatorMap.get(evaluatorId) ?? null : null,
          session: sessionId ? sessionMap.get(sessionId) ?? null : null,
          season: seasonId ? seasonMap.get(seasonId) ?? null : null,
          team: teamId ? teamMap.get(teamId) ?? null : null,
          draft_event: draftEventId ? draftMap.get(draftEventId) ?? null : null,
          summary: summaryParts.filter(Boolean).join(" — ") || null,
        },
      };
    });
  }

  async list(params: { table: OpsTableName; page: number; perPage: number }) {
    const from = (params.page - 1) * params.perPage;
    const to = from + params.perPage - 1;

    const { data, error, count } = await this.db
      .from(params.table)
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw new ServiceError(error.message, 500);
    const total = count ?? 0;
    const hydrated = await this.hydrateLabels(params.table, (data ?? []) as Record<string, unknown>[]);
    return {
      current_page: params.page,
      data: hydrated,
      per_page: params.perPage,
      total,
      last_page: total ? Math.max(1, Math.ceil(total / params.perPage)) : 1,
    };
  }

  async getById(table: OpsTableName, id: string) {
    const { data, error } = await this.db
      .from(table)
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new ServiceError(error.message, 500);
    return (data as Record<string, unknown> | null) ?? null;
  }

  async update(table: OpsTableName, id: string, patch: Record<string, unknown>) {
    const { error } = await this.db.from(table).update(patch).eq("id", id);
    if (error) throw new ServiceError(error.message, 500);
  }
}

