export interface CompetitionPointsConfig {
  id: string | null;
  competition_id: string;
  win_points: number;
  draw_points: number;
  loss_points: number;
  tie_break_order: string[];
  is_active: boolean;
}
