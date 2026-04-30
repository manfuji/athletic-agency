import { ServiceError } from "@/server/errors/serviceError";
import type { IGroupRepository } from "@/server/repositories/groupRepository";
import type { IMatchRepository } from "@/server/repositories/matchRepository";
import type { IPointsRepository } from "@/server/repositories/pointsRepository";

function emptyAgg() {
  return {
    played: 0,
    won: 0,
    draw: 0,
    lost: 0,
    goals_for: 0,
    goals_against: 0,
    point: 0,
  };
}

function sortStandings(
  rows: Array<{
    played: number;
    won: number;
    draw: number;
    lost: number;
    goals_for: number;
    goals_against: number;
    goal_difference: number;
    point: number;
  }>,
  order: string[]
) {
  const keys = order.length ? order : ["points", "goal_difference", "goals_for"];
  return rows.sort((a, b) => {
    for (const k of keys) {
      const key = k === "points" ? "point" : k;
      const av = Number((a as Record<string, unknown>)[key] ?? 0);
      const bv = Number((b as Record<string, unknown>)[key] ?? 0);
      if (bv !== av) return bv - av;
    }
    return 0;
  });
}

export class GroupService {
  constructor(
    private readonly groups: IGroupRepository,
    private readonly matches: IMatchRepository,
    private readonly points: IPointsRepository
  ) {}

  async createGroupSetup(body: {
    group_name: string;
    team_id: string[];
    competition_id: string;
    stage_id: string;
  }) {
    if (!body.team_id?.length) {
      throw new ServiceError("At least one team is required", 400);
    }
    const { id } = await this.groups.createGroupWithTeams({
      group_name: body.group_name,
      competition_id: body.competition_id,
      stage_id: body.stage_id,
      team_ids: body.team_id,
    });
    return { message: "Group created", id };
  }

  async updateGroupSetup(
    groupId: string,
    body: {
      group_name: string;
      team_id: string[];
      stage_id: string;
    }
  ) {
    if (!body.team_id?.length) {
      throw new ServiceError("At least one team is required", 400);
    }
    const { id } = await this.groups.updateGroupWithTeams(groupId, {
      group_name: body.group_name,
      stage_id: body.stage_id,
      team_ids: body.team_id,
    });
    return { message: "Group updated", id };
  }

  async deleteGroup(groupId: string) {
    await this.groups.deleteGroup(groupId);
    return { message: "Group deleted" };
  }

  listGroups(competitionId: string) {
    return this.groups.listGroupsWithTeams(competitionId);
  }

  async getStandings(competitionId: string) {
    const groups = (await this.groups.listGroupsWithTeams(
      competitionId
    )) as Array<{
      id: string;
      group_name: string;
      teams: { id: string; name: string; logo?: string | null }[];
    }>;
    const pointsConfig = await this.points.getByCompetition(competitionId);
    const tieBreakOrder = Array.isArray(pointsConfig?.tie_break_order)
      ? (pointsConfig?.tie_break_order as string[])
      : ["points", "goal_difference", "goals_for"];
    const stats = await this.matches.aggregateStandingsByTeam(competitionId, {
      win: Number(pointsConfig?.win_points ?? 3),
      draw: Number(pointsConfig?.draw_points ?? 1),
      loss: Number(pointsConfig?.loss_points ?? 0),
    });

    const groupsOut = groups.map((g) => ({
      group_id: g.id,
      group_name: String(g.group_name),
      standings: sortStandings(
        g.teams.map((t) => {
          const s = stats[t.id] ?? emptyAgg();
          return {
            id: t.id,
            team: {
              id: t.id,
              name: t.name,
              logo: t.logo ?? "",
            },
            played: s.played,
            won: s.won,
            draw: s.draw,
            lost: s.lost,
            goals_for: s.goals_for,
            goals_against: s.goals_against,
            goal_difference: s.goals_for - s.goals_against,
            point: s.point,
          };
        }),
        tieBreakOrder
      ),
    }));

    return { competition_id: competitionId, groups: groupsOut };
  }
}
