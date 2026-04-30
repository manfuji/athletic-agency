interface Game {
  id: string;
  time: string;
  home_team: TeamInfo;
  away_team: TeamInfo;
}

interface GameDate {
  date: string;
  matches: Game[];
}

interface GameScheduleResponse {
  data: GameDate[];
}

type IGame = Game;

interface LeagueTable {
  groups: Groups[];
}
interface Standings {
  id: string;
  team: TeamInfo;
  played: number;
  won: number;
  draw: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  point: number;
}

interface Groups {
  group_name: string;
  standings: Standings[];
}
