export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  cover_image: string | null;
  youtube_url: string | null;
  is_featured: boolean;
  competition_id: string | null;
  category_id: string | null;
  meta_title: string | null;
  meta_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  competition: { id: string; title: string; slug?: string | null } | null;
  category: { id: string; name: string } | null;
}
