import type { IPointsRepository } from "@/server/repositories/pointsRepository";

const DEFAULT_TIE_BREAK = ["points", "goal_difference", "goals_for"];

export class PointsService {
  constructor(private readonly points: IPointsRepository) {}

  async getForCompetition(competitionId: string) {
    const existing = await this.points.getByCompetition(competitionId);
    if (existing) return existing;

    return {
      id: null,
      competition_id: competitionId,
      win_points: 3,
      draw_points: 1,
      loss_points: 0,
      tie_break_order: DEFAULT_TIE_BREAK,
      is_active: true,
    };
  }

  createForCompetition(
    competitionId: string,
    payload: {
      win_points: number;
      draw_points: number;
      loss_points: number;
      tie_break_order: string[];
      is_active?: boolean;
    }
  ) {
    return this.points.upsertForCompetition(competitionId, payload);
  }

  update(configId: string, payload: Record<string, unknown>) {
    return this.points.updateById(configId, payload);
  }

  async delete(configId: string) {
    await this.points.deleteById(configId);
    return { message: "Points config deleted" };
  }
}
