export interface Team {
  id: string;
  name: string;
  logo?: string | null;
  shortCode: string;
  created_at: string;
  slug: string;
}

export type MinimalTeam = { id: string; name: string };

export interface Fixture {
  id: string;
  competition_id: string;
  home_team_id: string;
  away_team_id: string;
  home_team: Team | MinimalTeam;
  away_team: Team | MinimalTeam;
  match_date: string;
  time: string;
  location: string;
  status?: string;
  stream_url?: string | null;
  created_at: string;
  updated_at: string;
  stage_id?: string;
  result: Result | null;
}

export interface FixturesResponse {
  Fixtures: { [date: string]: Fixture[] } | null;
}

export interface FixtureResponse {
  Fixtures: Fixture;
}

export interface Stage {
  id: string;
  name: string;
}

export interface FixtureFormData {
  stage_id: string;
  home_team_id: string;
  away_team_id: string;
  match_date: string;
  time: string;
  location: string;
}

export interface Group {
  id: string;
  title: string;
  competition_id: string;
  stage_id: string;
  created_at: string;
  updated_at: string;
  teams: ({ id: string; name: string } | null)[];
  isSaved: boolean; // Added to track saved status
}

export interface KnockoutGame {
  id: string;
  title: string;
  stage_id?: string;
  teams: ({ id: string; name: string } | null)[];
  isSaved: boolean; // Added to track saved status
}

export interface Result {
  id: string;
  fixture_id: string;
  winner_team_id: string | null;
  home_team_score: number;
  away_team_score: number;
  created_at: string;
  updated_at: string;
  winner_team?: Team | null;
}

export interface ResultsResponse {
  Results: { [date: string]: Result[] };
}

export interface Standing {
  id: string;
  team: {
    id: string;
    name: string;
    logo: string;
  };
  played: number;
  won: number;
  draw: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  point: number;
}

export interface GroupStanding {
  group_id: string;
  group_name: string;
  standings: Standing[];
}
