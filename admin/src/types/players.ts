export interface PlayerStat {
  title: string;
  value: string | number;
}

export interface PlayerSection {
  title: string;
  content: string | null;
}

export interface RawPlayerData {
  id: string;
  team_id: string | null;
  profile_picture: string | null;
  name: string;
  nationality: string;
  dob: string;
  created_at: string;
  updated_at: string;
  stats: PlayerStat[];
  sections: PlayerSection[];
}

export interface Player {
  id: string;
  team_id: string | null;
  profile_picture: string | null;
  name: string;
  nationality: string;
  dob: string;
  weight: string;
  height: string;
  bio: string | null;
  position: string;
  preferred_foot: string;
  previous_experience: string | null;
  reason_for_joining: string | null;
  created_at: string;
  updated_at: string;
  stats: PlayerStat[];
}

export interface PlayersResponse {
  current_page: number;
  data: Player[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: { url: string | null; label: string; active: boolean }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface PlayerDetails {
  id: string;
  team_id: string | null;
  profile_picture: string | null;
  name: string;
  nationality: string;
  dob: string;
  weight: string;
  height: string;
  bio: string | null;
  position: string;
  preferred_foot: string;
  previous_experience: string | null;
  reason_for_joining: string | null;
  created_at: string;
  updated_at: string;
  team: string | null;
  stats: { title: string; value: string | number }[];
}
