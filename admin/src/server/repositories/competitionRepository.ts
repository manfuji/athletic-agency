import type { SupabaseClient } from "@supabase/supabase-js";
import { ServiceError } from "@/server/errors/serviceError";

export type CompetitionRow = Record<string, unknown>;

export interface ICompetitionRepository {
  listAll(): Promise<unknown[]>;
  findById(competitionId: string): Promise<Record<string, unknown> | null>;
  insert(row: CompetitionRow): Promise<Record<string, unknown>>;
  update(
    competitionId: string,
    patch: CompetitionRow
  ): Promise<Record<string, unknown> | null>;
  deleteById(competitionId: string): Promise<void>;
  updateStatus(
    competitionId: string,
    status: string
  ): Promise<Record<string, unknown> | null>;
  setPublished(
    competitionId: string,
    isPublished: boolean
  ): Promise<Record<string, unknown> | null>;
}

export class CompetitionSupabaseRepository implements ICompetitionRepository {
  constructor(private readonly db: SupabaseClient) {}

  async listAll(): Promise<unknown[]> {
    const { data, error } = await this.db
      .from("competitions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new ServiceError(error.message, 500);
    return data ?? [];
  }

  async findById(
    competitionId: string
  ): Promise<Record<string, unknown> | null> {
    const { data, error } = await this.db
      .from("competitions")
      .select("*")
      .eq("id", competitionId)
      .maybeSingle();

    if (error) throw new ServiceError(error.message, 500);
    return data as Record<string, unknown> | null;
  }

  async insert(row: CompetitionRow): Promise<Record<string, unknown>> {
    const { data, error } = await this.db
      .from("competitions")
      .insert({
        ...row,
        status: row.status ?? "draft",
        is_published: row.is_published ?? false,
      })
      .select("*")
      .single();

    if (error) throw new ServiceError(error.message, 500);
    return data as Record<string, unknown>;
  }

  async update(
    competitionId: string,
    patch: CompetitionRow
  ): Promise<Record<string, unknown> | null> {
    const { data, error } = await this.db
      .from("competitions")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", competitionId)
      .select("*")
      .maybeSingle();

    if (error) throw new ServiceError(error.message, 500);
    return data as Record<string, unknown> | null;
  }

  async deleteById(competitionId: string): Promise<void> {
    const { error } = await this.db
      .from("competitions")
      .delete()
      .eq("id", competitionId);
    if (error) throw new ServiceError(error.message, 500);
  }

  async updateStatus(
    competitionId: string,
    status: string
  ): Promise<Record<string, unknown> | null> {
    return this.update(competitionId, { status });
  }

  async setPublished(
    competitionId: string,
    isPublished: boolean
  ): Promise<Record<string, unknown> | null> {
    return this.update(competitionId, { is_published: isPublished });
  }
}

export type CompetitionTeamsPage = {
  current_page: number;
  data: unknown[];
  per_page: number;
  total: number;
  last_page: number;
};

export interface ICompetitionTeamRepository {
  listTeamsPaginated(
    competitionId: string,
    page: number,
    perPage: number
  ): Promise<CompetitionTeamsPage>;
  listTeamIdsInCompetition(competitionId: string): Promise<string[]>;
  listTeamsNotInCompetition(competitionId: string): Promise<unknown[]>;
  addTeamToCompetition(competitionId: string, teamId: string): Promise<void>;
  removeTeamFromCompetition(
    competitionId: string,
    teamId: string
  ): Promise<void>;
}

export class CompetitionTeamSupabaseRepository
  implements ICompetitionTeamRepository
{
  constructor(private readonly db: SupabaseClient) {}

  async listTeamsPaginated(
    competitionId: string,
    page: number,
    perPage: number
  ): Promise<CompetitionTeamsPage> {
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const { data, error, count } = await this.db
      .from("competition_teams")
      .select("team:teams(*)", { count: "exact" })
      .eq("competition_id", competitionId)
      .range(from, to);

    if (error) throw new ServiceError(error.message, 500);

    const teams = (data ?? [])
      .map((row: { team?: unknown }) => row.team)
      .filter(Boolean);
    const total = count ?? teams.length;

    return {
      current_page: page,
      data: teams,
      per_page: perPage,
      total,
      last_page: total ? Math.max(1, Math.ceil(total / perPage)) : 1,
    };
  }

  async listTeamIdsInCompetition(competitionId: string): Promise<string[]> {
    const { data, error } = await this.db
      .from("competition_teams")
      .select("team_id")
      .eq("competition_id", competitionId);

    if (error) throw new ServiceError(error.message, 500);
    return (data ?? []).map((r: { team_id: string }) => r.team_id);
  }

  async listTeamsNotInCompetition(competitionId: string): Promise<unknown[]> {
    const ids = await this.listTeamIdsInCompetition(competitionId);
    let q = this.db
      .from("teams")
      .select("id,name,logo,shortCode:short_code")
      .order("name", { ascending: true });

    if (ids.length > 0) {
      q = q.not("id", "in", `(${ids.join(",")})`);
    }

    const { data, error } = await q;
    if (error) throw new ServiceError(error.message, 500);
    return data ?? [];
  }

  async addTeamToCompetition(
    competitionId: string,
    teamId: string
  ): Promise<void> {
    const { error } = await this.db.from("competition_teams").insert({
      competition_id: competitionId,
      team_id: teamId,
    });

    if (error) throw new ServiceError(error.message, 500);
  }

  async removeTeamFromCompetition(
    competitionId: string,
    teamId: string
  ): Promise<void> {
    const { error } = await this.db
      .from("competition_teams")
      .delete()
      .eq("competition_id", competitionId)
      .eq("team_id", teamId);

    if (error) throw new ServiceError(error.message, 500);
  }
}
