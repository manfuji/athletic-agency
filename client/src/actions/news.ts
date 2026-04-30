"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type NewsRow = {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  content: string;
  cover_image?: string | null;
  youtube_url?: string | null;
  is_featured?: boolean | null;
  published_at?: string | null;
  competition?: { id?: string; title?: string; slug?: string } | null;
  category?: { id?: string; name?: string } | null;
  meta_title?: string | null;
  meta_description?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

const EMPTY_NEWS: News = {
  id: "",
  title: "",
  slug: "",
  content: "",
  cover_image: null,
  youtube_url: null,
  published_at: new Date(0).toISOString(),
  is_featured: false,
  competition: null,
  category: { id: "", name: "" },
  meta_title: null,
  meta_description: null,
  created_at: new Date(0).toISOString(),
  updated_at: new Date(0).toISOString(),
};

function normalizeNews(row: NewsRow): News {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    cover_image: row.cover_image ?? null,
    youtube_url: row.youtube_url ?? null,
    published_at: row.published_at ?? new Date(0).toISOString(),
    is_featured: Boolean(row.is_featured),
    competition: row.competition
      ? {
          id: row.competition.id ?? "",
          title: row.competition.title ?? "",
          slug: row.competition.slug ?? "",
        }
      : null,
    category: {
      id: row.category?.id ?? "",
      name: row.category?.name ?? "",
    },
    meta_title: row.meta_title ?? null,
    meta_description: row.meta_description ?? null,
    created_at: row.created_at ?? new Date(0).toISOString(),
    updated_at: row.updated_at ?? new Date(0).toISOString(),
  };
}

export async function getAllNews(): Promise<NewsListResponse> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("news_posts")
    .select(
      "id,title,slug,content,cover_image,youtube_url,is_featured,published_at,meta_title,meta_description,created_at,updated_at,competition:competitions(id,title,slug),category:categories(id,name)"
    )
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    return { data: [] };
  }

  return { data: ((data ?? []) as NewsRow[]).map(normalizeNews) };
}

export async function getSingleNews(slug: string): Promise<NewsResponse> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("news_posts")
    .select(
      "id,title,slug,content,cover_image,youtube_url,is_featured,published_at,meta_title,meta_description,created_at,updated_at,competition:competitions(id,title,slug),category:categories(id,name)"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return { data: { ...EMPTY_NEWS, slug } };
  }

  return { data: normalizeNews(data as NewsRow) };
}

export async function getNewsLiveVideo(): Promise<NewsPageResponse> {
  return {
    data: {
      id: 0,
      title: "",
      description: null,
      banner_image: null,
      live_video_url: null,
      meta_title: null,
      meta_description: null,
      updated_at: new Date(0).toISOString(),
    },
  };
}

export async function getFeaturedNews(): Promise<NewsListResponse> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("news_posts")
    .select(
      "id,title,slug,content,cover_image,youtube_url,is_featured,published_at,meta_title,meta_description,created_at,updated_at,competition:competitions(id,title,slug),category:categories(id,name)"
    )
    .eq("is_featured", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(5);

  if (error) {
    return { data: [] };
  }
  return { data: ((data ?? []) as NewsRow[]).map(normalizeNews) };
}
