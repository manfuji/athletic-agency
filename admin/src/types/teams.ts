export interface Team {
  id: string;
  category_id: string;
  logo: string | null;
  coverPhoto: string | null;
  name: string;
  shortCode: string;
  description: string | null;
  slug: string;
  isDeleted: number;
  created_at: string;
  updated_at: string;
  players_count: number;
  players?: {
    id: string;
    team_id: string | null;
    profile_picture: string | null;
    name: string;
    position: string;
    created_at: string;
    nationality?: string;
    dob?: string;
    weight?: string;
    height?: string;
    bio?: string | null;
    preferred_foot?: string;
    previous_experience?: string | null;
    reason_for_joining?: string | null;
  }[];
  category?: {
    id: string;
    name: string;
  };
}
