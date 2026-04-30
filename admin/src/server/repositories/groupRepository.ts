import type { SupabaseClient } from "@supabase/supabase-js";
import { ServiceError } from "@/server/errors/serviceError";

export interface IGroupRepository {
  createGroupWithTeams(payload: {
    group_name: string;
    competition_id: string;
    stage_id: string;
    team_ids: string[];
  }): Promise<{ id: string }>;
  updateGroupWithTeams(
    groupId: string,
    payload: {
      group_name: string;
      stage_id: string;
      team_ids: string[];
    }
  ): Promise<{ id: string }>;
  deleteGroup(groupId: string): Promise<void>;
  listGroupsWithTeams(competitionId: string): Promise<unknown[]>;
}

export class GroupSupabaseRepository implements IGroupRepository {
  constructor(private readonly db: SupabaseClient) {}

  async createGroupWithTeams(payload: {
    group_name: string;
    competition_id: string;
    stage_id: string;
    team_ids: string[];
  }): Promise<{ id: string }> {
    const { data: group, error: e1 } = await this.db
      .from("competition_groups")
      .insert({
        group_name: payload.group_name,
        competition_id: payload.competition_id,
        stage_id: payload.stage_id,
      })
      .select("id")
      .single();

    if (e1) throw new ServiceError(e1.message, 500);
    const groupId = (group as { id: string }).id;

    const rows = payload.team_ids.map((team_id) => ({
      group_id: groupId,
      team_id,
    }));

    const { error: e2 } = await this.db.from("group_teams").insert(rows);
    if (e2) throw new ServiceError(e2.message, 500);

    return { id: groupId };
  }

  async listGroupsWithTeams(competitionId: string): Promise<unknown[]> {
    const { data: groups, error } = await this.db
      .from("competition_groups")
      .select("*")
      .eq("competition_id", competitionId)
      .order("created_at", { ascending: true });

    if (error) throw new ServiceError(error.message, 500);
    if (!groups?.length) return [];

    const groupIds = groups.map((g: { id: string }) => g.id);
    const { data: pivots, error: e2 } = await this.db
      .from("group_teams")
      .select("group_id, team_id")
      .in("group_id", groupIds);

    if (e2) throw new ServiceError(e2.message, 500);

    const teamIds = [...new Set((pivots ?? []).map((p: { team_id: string }) => p.team_id))];
    const { data: teams } = await this.db
      .from("teams")
      .select("id,name,logo")
      .in("id", teamIds);

    const teamMap = new Map(
      (teams ?? []).map((t: { id: string; name: string; logo?: string | null }) => [
        t.id,
        t,
      ])
    );

    return groups.map((g: Record<string, unknown>) => {
      const gt =
        (pivots ?? []).filter(
          (p: { group_id: string }) => p.group_id === g.id
        ) ?? [];
      return {
        id: g.id,
        group_name: g.group_name,
        competition_id: g.competition_id,
        stage_id: g.stage_id,
        created_at: g.created_at,
        updated_at: g.updated_at,
        teams: gt.map((x: { team_id: string }) => {
          const t = teamMap.get(x.team_id);
          return {
            id: x.team_id,
            name: t?.name ?? "Team",
            logo: t?.logo ?? null,
            pivot: { group_id: g.id, team_id: x.team_id },
          };
        }),
      };
    });
  }

  async updateGroupWithTeams(
    groupId: string,
    payload: { group_name: string; stage_id: string; team_ids: string[] }
  ): Promise<{ id: string }> {
    const { error: e1 } = await this.db
      .from("competition_groups")
      .update({
        group_name: payload.group_name,
        stage_id: payload.stage_id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", groupId);
    if (e1) throw new ServiceError(e1.message, 500);

    const { error: e2 } = await this.db
      .from("group_teams")
      .delete()
      .eq("group_id", groupId);
    if (e2) throw new ServiceError(e2.message, 500);

    if (payload.team_ids.length > 0) {
      const rows = payload.team_ids.map((team_id) => ({
        group_id: groupId,
        team_id,
      }));
      const { error: e3 } = await this.db.from("group_teams").insert(rows);
      if (e3) throw new ServiceError(e3.message, 500);
    }

    return { id: groupId };
  }

  async deleteGroup(groupId: string): Promise<void> {
    const { error } = await this.db
      .from("competition_groups")
      .delete()
      .eq("id", groupId);
    if (error) throw new ServiceError(error.message, 500);
  }
}
