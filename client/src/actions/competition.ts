"use server";

import { apiUrl, cmsUrl } from "@/lib/constant";
import { fetchWrapper } from "@/lib/fetch-wrapper";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

type CompetitionTypeRow = {
  id: string;
  name: string;
  description?: string | null;
  slug?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type CompetitionRow = {
  id: string;
  competition_type_id: string;
  category_id: string;
  title: string;
  description?: string | null;
  banner?: string | null;
  start_date: string;
  end_date: string;
  slug?: string | null;
  location: string;
  status?: "draft" | "started" | "ended" | null;
  ticket_url?: string | null;
  category?: {
    id?: string;
    name?: string;
  } | null;
};

type NewsRelation = {
  id?: string | null;
  title?: string | null;
  slug?: string | null;
};

type CategoryRelation = {
  id?: string | null;
  name?: string | null;
};

type NewsRow = {
  id?: string | null;
  title?: string | null;
  slug?: string | null;
  content?: string | null;
  cover_image?: string | null;
  youtube_url?: string | null;
  is_featured?: boolean | null;
  published_at?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  competition?: NewsRelation | NewsRelation[] | null;
  category?: CategoryRelation | CategoryRelation[] | null;
};

const EMPTY_GAME_SCHEDULE: GameScheduleResponse = { data: [] };
const EMPTY_LEAGUE_TABLE: LeagueTable = { groups: [] };
const EMPTY_STATS: { data: StatsType[] } = { data: [] };
const EMPTY_TEAM_PAGINATION: TeamPagination = {
  current_page: 1,
  data: [],
  first_page_url: "",
  from: 0,
  last_page: 1,
  last_page_url: "",
  links: [],
  next_page_url: null,
  path: "",
  per_page: 10,
  prev_page_url: null,
  to: 0,
  total: 0,
};
const EMPTY_NEWS_LIST: NewsListResponse = { data: [] };
const EMPTY_VIDEO_LIST: VideosListResponse = { data: [] };

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value ?? null;
}

function normalizeNewsRows(rows: NewsRow[]): News[] {
  return rows.map((row) => {
    const competition = firstRelation(row.competition);
    const category = firstRelation(row.category);

    return {
      id: row.id ?? "",
      title: row.title ?? "",
      slug: row.slug ?? "",
      content: row.content ?? "",
      cover_image: row.cover_image ?? null,
      youtube_url: row.youtube_url ?? null,
      is_featured: row.is_featured ?? false,
      competition: competition
        ? {
            id: competition.id ?? "",
            title: competition.title ?? "",
            slug: competition.slug ?? "",
          }
        : null,
      category: {
        id: category?.id ?? "",
        name: category?.name ?? "",
      },
      published_at: row.published_at ?? new Date(0).toISOString(),
      meta_title: row.meta_title ?? null,
      meta_description: row.meta_description ?? null,
      created_at: row.created_at ?? new Date(0).toISOString(),
      updated_at: row.updated_at ?? new Date(0).toISOString(),
    };
  });
}

export async function getFixturesResults(
  slug: string
): Promise<GameScheduleResponse> {
  const url = apiUrl(`/api/fixtures/${slug}`);

  const response = await fetchWrapper<GameScheduleResponse>(url, {
    method: "GET",
  });
  if ("error" in response) {
    return EMPTY_GAME_SCHEDULE;
  }

  return response;
}

export async function getTeams(
  page: number,
  slug: string
): Promise<TeamPagination> {
  const url = apiUrl(`/api/competitions/${slug}/teams?page=${page}`);

  const response = await fetchWrapper<TeamPagination>(url, {
    method: "GET",
  });
  if ("error" in response) {
    return { ...EMPTY_TEAM_PAGINATION, current_page: page || 1 };
  }

  return response;
}

export async function getStandings(slug: string): Promise<LeagueTable> {
  const url = apiUrl(`/api/competition_teams/${slug}`);

  const response = await fetchWrapper<LeagueTable>(url, {
    method: "GET",
  });
  if ("error" in response) {
    return EMPTY_LEAGUE_TABLE;
  }

  return response;
}

export async function getCompetitionTopScorers(slug: string): Promise<{
  data: StatsType[];
}> {
  const url = apiUrl(`/api/top-scorers/${slug}`);

  const response = await fetchWrapper<{ data: GoalStats[] }>(url, {
    method: "GET",
  });

  if ("error" in response) {
    return EMPTY_STATS;
  }

  return response;
}

export async function getCompetitionTopAssists(slug: string): Promise<{
  data: StatsType[];
}> {
  const url = apiUrl(`/api/top-assists/${slug}`);

  const response = await fetchWrapper<{ data: AssistStats[] }>(url, {
    method: "GET",
  });

  if ("error" in response) {
    return EMPTY_STATS;
  }

  return response;
}

export async function getCompetitionTopYellowCards(slug: string): Promise<{
  data: StatsType[];
}> {
  const url = apiUrl(`/api/top-yellow-cards/${slug}`);

  const response = await fetchWrapper<{ data: YellowCardStats[] }>(url, {
    method: "GET",
  });

  if ("error" in response) {
    return EMPTY_STATS;
  }

  return response;
}

export async function getCompetitionTopRedCards(slug: string): Promise<{
  data: StatsType[];
}> {
  const url = apiUrl(`/api/top-red-cards/${slug}`);

  const response = await fetchWrapper<{ data: RedCardStats[] }>(url, {
    method: "GET",
  });

  if ("error" in response) {
    return EMPTY_STATS;
  }

  return response;
}

export async function getCompetitionNews(
  slug: string
): Promise<NewsListResponse> {
  const supabase = createSupabaseAdminClient();
  const { data: competition } = await supabase
    .from("competitions")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (!competition?.id) return EMPTY_NEWS_LIST;

  const { data, error } = await supabase
    .from("news_posts")
    .select(
      "id,title,slug,content,cover_image,youtube_url,is_featured,published_at,meta_title,meta_description,created_at,updated_at,competition:competitions(id,title,slug),category:categories(id,name)"
    )
    .eq("competition_id", competition.id)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(10);
  if (error) {
    return EMPTY_NEWS_LIST;
  }

  return {
    data: normalizeNewsRows((data ?? []) as NewsRow[]),
  };
}

export async function getCompetitionHighlights(
  slug: string
): Promise<VideosListResponse> {
  const url = cmsUrl(`/cms/videos/competition/${slug}?highlights=true`);

  const response = await fetchWrapper<VideosListResponse>(url, {
    method: "GET",
  });
  if ("error" in response) {
    return EMPTY_VIDEO_LIST;
  }
  return response;
}

export async function getCompetitionTypes(): Promise<CompetitionType[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("competition_types")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    return [];
  }

  const rows = (data ?? []) as CompetitionTypeRow[];

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug && row.slug.trim().length > 0 ? row.slug : slugify(row.name),
    description: row.description ?? "",
    created_at: row.created_at ?? new Date().toISOString(),
    updated_at: row.updated_at ?? row.created_at ?? new Date().toISOString(),
  }));
}

export async function getCompetitionsByType(
  id: string
): Promise<CompetitionResponse> {
  const supabase = createSupabaseAdminClient();
  const { data: typesData, error: typesError } = await supabase
    .from("competition_types")
    .select("*");

  if (typesError) {
    return {
      id: "",
      name: id,
      slug: id,
      description: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      competitions: [],
    };
  }

  const types = (typesData ?? []) as CompetitionTypeRow[];
  const competitionType = types.find((type) => {
    const candidate =
      type.slug && type.slug.trim().length > 0 ? type.slug : slugify(type.name);
    return candidate === id;
  });

  if (!competitionType) {
    return {
      id: "",
      name: id,
      slug: id,
      description: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      competitions: [],
    };
  }

  const { data: competitionsData, error: competitionsError } = await supabase
    .from("competitions")
    .select(
      "id,competition_type_id,category_id,title,description,banner,start_date,end_date,slug,location,status,ticket_url,category:categories(id,name)"
    )
    .eq("competition_type_id", competitionType.id)
    .order("start_date", { ascending: false });

  if (competitionsError) {
    return {
      id: competitionType.id,
      name: competitionType.name,
      slug:
        competitionType.slug && competitionType.slug.trim().length > 0
          ? competitionType.slug
          : slugify(competitionType.name),
      description: competitionType.description ?? "",
      created_at: competitionType.created_at ?? new Date().toISOString(),
      updated_at:
        competitionType.updated_at ??
        competitionType.created_at ??
        new Date().toISOString(),
      competitions: [],
    };
  }

  const competitions = ((competitionsData ?? []) as CompetitionRow[]).map(
    (competition) => ({
      id: competition.id,
      competition_type_id: competition.competition_type_id,
      category_id: competition.category_id,
      title: competition.title,
      description: competition.description ?? "",
      banner: competition.banner ?? null,
      start_date: competition.start_date,
      end_date: competition.end_date,
      slug:
        competition.slug && competition.slug.trim().length > 0
          ? competition.slug
          : slugify(competition.title),
      location: competition.location,
      status: competition.status ?? "draft",
      category: {
        id: competition.category?.id ?? competition.category_id,
        name: competition.category?.name ?? "",
      },
      competition_type: {
        id: competitionType.id,
        name: competitionType.name,
        slug:
          competitionType.slug && competitionType.slug.trim().length > 0
            ? competitionType.slug
            : slugify(competitionType.name),
        description: competitionType.description ?? "",
        created_at:
          competitionType.created_at ?? new Date().toISOString(),
        updated_at:
          competitionType.updated_at ??
          competitionType.created_at ??
          new Date().toISOString(),
      },
      ticket_url: competition.ticket_url ?? "",
    })
  );

  return {
    id: competitionType.id,
    name: competitionType.name,
    slug:
      competitionType.slug && competitionType.slug.trim().length > 0
        ? competitionType.slug
        : slugify(competitionType.name),
    description: competitionType.description ?? "",
    created_at: competitionType.created_at ?? new Date().toISOString(),
    updated_at:
      competitionType.updated_at ??
      competitionType.created_at ??
      new Date().toISOString(),
    competitions,
  };
}

export async function getFeaturedCompetitionNews(
  slug: string
): Promise<NewsListResponse> {
  const supabase = createSupabaseAdminClient();
  const { data: competition } = await supabase
    .from("competitions")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (!competition?.id) return EMPTY_NEWS_LIST;

  const { data, error } = await supabase
    .from("news_posts")
    .select(
      "id,title,slug,content,cover_image,youtube_url,is_featured,published_at,meta_title,meta_description,created_at,updated_at,competition:competitions(id,title,slug),category:categories(id,name)"
    )
    .eq("competition_id", competition.id)
    .eq("is_featured", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(5);

  if (error) {
    return EMPTY_NEWS_LIST;
  }
  return {
    data: normalizeNewsRows((data ?? []) as NewsRow[]),
  };
}
