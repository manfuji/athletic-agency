export interface CompetitionFromAPI {
  id: string;
  structure_id: string | null;
  category_id: string;
  title: string;
  description: string;
  banner: string;
  start_date: string;
  end_date: string;
  slug: string;
  isDeleted: number;
  created_at: string;
  updated_at: string;
  location: string;
  status: string;
  isPublished: number;
}
