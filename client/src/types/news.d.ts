interface News {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_image: string | null;
  youtube_url: string | null;
  published_at: string;
  is_featured: boolean;
  competition: Pick<Competition, "id" | "title" | "slug"> | null;
  category: Category
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

interface NewsPage {
  id: number;
  title: string;
  description: string | null;
  banner_image: string | null;
  live_video_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  updated_at: string;
}

type NewsListResponse = ListResponse<News>;
type NewsResponse = SingleResponse<News>;
type NewsPageResponse = SingleResponse<NewsPage>;
