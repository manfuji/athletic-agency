interface VideoLibrary {
  id: string;
  title: string;
  slug: string;
  type: "url" | "media";
  video_source: string;
  video_url: string | null;
  media_file: string | null;
  thumbnail: string | null;
  description: string | null;
  published_at: string;
  is_highlight: boolean;
  duration: number | null;
  duration_formatted: string | null;
  competition: Pick<Competition, "id" | "title" | "slug"> | null;
  category: Category;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

interface LiveVideo {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  stream_url: string;
  thumbnail: string | null;
  status: "scheduled" | "live" | "ended";
  scheduled_at: string;
  started_at: string | null;
  ended_at: string | null;
  published_at: string;
  is_live: boolean;
  is_scheduled: boolean;
  is_ended: boolean;
  competition: Pick<Competition, "id" | "title" | "slug"> | null;
  category: Category;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

type VideosListResponse = ListResponse<VideoLibrary>;

type VideoResponse = SingleResponse<VideoLibrary>;

type LiveVideosListResponse = ListResponse<LiveVideo>;

type LiveVideoResponse = SingleResponse<LiveVideo>;

type LiveVideoCalendarResponse = ListResponse<
  Pick<LiveVideo, "scheduled_at" | "status" | "title" | "slug">
>;

type MediaData = Omit<
  Partial<News & NewsPage & VideoLibrary & LiveVideo>,
  "id"
>;
