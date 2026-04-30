export interface StatRecord {
  id?: string;
  fixture_id?: string;
  player_id?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | undefined;
  total_shots?: number;
  shots_on_target?: number;
  shots_off_target?: number;
  dribbles_successful?: number;
  dribbles_attempted?: number;
  times_fouled?: number;
  dispossessed?: number;
  offsides?: number;
  tackles?: number;
  interceptions?: number;
  fouls_committed?: number;
  clearances?: number;
  dribbles_defended?: number;
  blocks?: number;
  own_goals?: number;
  minutes_played?: number;
  [key: string]: string | number | undefined;
}

export interface PlayerStats {
  total_shots: string;
  shots_on_target: string;
  shots_off_target: string;
  dribbles_successful: string;
  dribbles_attempted: string;
  times_fouled: string;
  dispossessed: string;
  offsides: string;
  tackles: string;
  interceptions: string;
  fouls_committed: string;
  clearances: string;
  dribbles_defended: string;
  blocks: string;
  own_goals: string;
  minutes_played: string;
}
