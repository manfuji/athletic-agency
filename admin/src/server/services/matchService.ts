import { ServiceError } from "@/server/errors/serviceError";
import type { IMatchRepository } from "@/server/repositories/matchRepository";

export class MatchService {
  constructor(private readonly match: IMatchRepository) {}

  async createFixture(body: Record<string, unknown>) {
    const row = await this.match.insertFixture(body);
    return {
      message: "Fixture created",
      fixture_id: row.id,
      status: true,
    };
  }

  async listFixturesByCompetition(competitionId: string) {
    const Fixtures = await this.match.listFixturesGrouped(competitionId);
    return { Fixtures };
  }

  async getFixture(fixtureId: string) {
    const row = await this.match.getFixture(fixtureId);
    if (!row) throw new ServiceError("Fixture not found", 404);
    return { Fixtures: row };
  }

  async deleteFixture(fixtureId: string) {
    await this.match.deleteFixture(fixtureId);
    return { message: "Fixture deleted" };
  }

  async listResults(competitionId: string) {
    const grouped = await this.match.listResultsGrouped(competitionId);
    return { Results: grouped };
  }

  async createResult(body: Record<string, unknown>) {
    const home = Number(body.home_team_score);
    const away = Number(body.away_team_score);
    const row = {
      fixture_id: body.fixture_id,
      home_team_score: home,
      away_team_score: away,
      winner_team_id: body.winner_team_id ?? null,
    };
    const saved = await this.match.insertResult(row);
    return { message: "Result saved", data: saved };
  }

  async createGoal(body: Record<string, unknown>) {
    await this.match.insertGoal(body);
    return { message: "Goal recorded" };
  }

  async createCard(body: Record<string, unknown>) {
    await this.match.insertCard(body);
    return { message: "Card recorded" };
  }

  async createSub(body: Record<string, unknown>) {
    await this.match.insertSub(body);
    return { message: "Substitution recorded" };
  }

  async listMatchLogs(fixtureId: string, page: number) {
    const { data, last_page, total } = await this.match.listMatchLogs(
      fixtureId,
      page
    );
    const perPage = 20;
    const rows = (data ?? []) as Record<string, unknown>[];
    const mapped = rows.map((row) => {
      const pl = row.players as { id: string; name: string } | { id: string; name: string }[] | null | undefined;
      const player = Array.isArray(pl) ? pl[0] : pl;
      return {
        ...row,
        player: player ?? { id: String(row.player_id ?? ""), name: "Unknown" },
        players: undefined,
      };
    });
    return {
      logs: {
        current_page: page,
        data: mapped,
        first_page_url: "",
        from: total ? (page - 1) * perPage + 1 : 0,
        last_page,
        last_page_url: "",
        links: [] as { url: string | null; label: string; active: boolean }[],
        next_page_url: null as string | null,
        path: "",
        per_page: perPage,
        prev_page_url: null as string | null,
        to: Math.min(page * perPage, total),
        total,
      },
    };
  }

  async deleteMatchLog(logId: string) {
    await this.match.deleteMatchLog(logId);
    return { message: "Log deleted" };
  }

  async getPlayerStat(playerId: string, fixtureId: string | null) {
    const stats = await this.match.getPlayerStatAggregate(
      playerId,
      fixtureId
    );
    const hasRow = stats && Object.keys(stats).length > 0;
    return { Results: hasRow ? [stats] : [] };
  }

  async createStats(payload: Record<string, unknown>) {
    await this.match.upsertPlayerStats(payload);
    return { message: "Stats saved" };
  }
}
