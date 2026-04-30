import { toast } from "sonner";
import {
  Fixture,
  Stage,
  FixtureFormData,
  Group,
  KnockoutGame,
  ResultsResponse,
  Result,
  Team,
  GroupStanding,
} from "@/types/fixtures";
import { CompetitionFromAPI } from "@/types/competitions";
import {
  RawPlayerData,
  Player,
  PlayerStat,
  PlayerSection,
} from "@/types/players";
import { Category } from "@/types/categories";
import { ensureArray } from "@/lib/normalize";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || "";
// const BEARER_TOKEN = process.env.NEXT_PUBLIC_BEARER_TOKEN;

// if (!BEARER_TOKEN) {
//   throw new Error("Bearer token is missing");
// }

export const getImageUrl = (path: string | null | undefined) => {
  if (!path) return null;

  // Decode URL-encoded paths first
  let decodedPath = path;
  try {
    // Check if path is URL-encoded and decode it
    if (path.includes('%')) {
      decodedPath = decodeURIComponent(path);
    }
  } catch {
    // If decoding fails, use original path
    decodedPath = path;
  }

  // If the path is already a full URL, check if it's a placeholder
  if (decodedPath.startsWith('http://') || decodedPath.startsWith('https://')) {
    // If it's a placeholder URL, return null to use fallback
    if (decodedPath.includes('via.placeholder.com')) {
      return null;
    }
    return decodedPath;
  }

  // Check if the original path contains placeholder (might be encoded)
  if (path.includes('via.placeholder.com') || path.includes('via%2Eplaceholder%2Ecom')) {
    return null;
  }

  const imagePatterns = ["coverPhotos", "logos", "profile_pictures", "banners"];

  const shouldUseSpacesUrl = imagePatterns.some((pattern) =>
    decodedPath.toLowerCase().includes(pattern.toLowerCase())
  );

  const baseUrl = shouldUseSpacesUrl
    ? process.env.NEXT_PUBLIC_SPACES_BASE_URL
    : `${BASE_URL}/uploads`;

  // Encode the decoded path so S3 and Next Image Optimization handle spaces correctly
  const encodedPath = decodedPath.split("/").map(part => encodeURIComponent(part)).join("/");

  return `${baseUrl}/${encodedPath}`;
};

const defaultHeaders = {
  Authorization: `Bearer `,
  "Content-Type": "application/json",
};

interface ApiFixture {
  id: string;
  competition_id: string;
  home_team_id: string;
  away_team_id: string;
  match_date: string;
  time: string;
  location: string;
  status?: string;
  stream_url?: string | null;
  created_at: string;
  updated_at: string;
  stage_id?: string;
}

export type PaginatedTeamsResponse = {
  current_page: number;
  data: Team[];
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
};

export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit & { cache?: "force-cache" | "no-store" } = {}
): Promise<T> {
  const method = options.method || "GET";
  const cacheOption =
    method === "GET" ? options.cache || "force-cache" : "no-store";


  const headers: {
    Authorization: string;
    "Content-Type"?: string;
  } = { ...defaultHeaders };

  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
    cache: cacheOption,
    next: options.next,
  });

  if (!response.ok) {
    console.log("response", response);
    const text = await response.json();
    let errorMessage = `API Error: ${response.status} - ${text}`;
    try {
      const errorData = JSON.parse(text);
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (parseError) {
      console.error("Error parsing error response:", parseError);
    }
    const error = new Error(errorMessage);
    console.error(error);
    // throw error;
  }

  return response.json();
}

export const createFixture = async (
  competitionId: string,
  formData: FixtureFormData
): Promise<{ fixture_id?: string; message: string }> => {
  let formattedMatchDate = formData.match_date;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(formData.match_date)) {
    const [day, month, year] = formData.match_date.split("/");
    formattedMatchDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const payload = {
    competition_id: competitionId,
    stage_id: formData.stage_id,
    home_team_id: formData.home_team_id,
    away_team_id: formData.away_team_id,
    match_date: formattedMatchDate,
    time: formData.time,
    location: formData.location,
    stream_url: "",
  };

  return fetchAPI<{ fixture_id?: string; message: string }>(
    "/api/admin/create/fixture",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
};

export async function fetchTeams(
  competitionId: string,
  page: number = 1
): Promise<PaginatedTeamsResponse> {
  return fetchAPI<PaginatedTeamsResponse>(
    `/api/admin/competitions/${competitionId}/teams?page=${page}`,
    {
      cache: "no-store",
    }
  );
}

export async function fetchAllTeamsForCompetition(
  competitionId: string
): Promise<Team[]> {
  let allTeams: Team[] = [];
  let page = 1;
  let lastPage = 1;

  try {
    do {
      const response = await fetchTeams(competitionId, page);
      if (!Array.isArray(response.data)) {
        console.error(
          `fetchTeams page ${page} did not return an array:`,
          response.data
        );
        throw new Error("Invalid team data format");
      }
      allTeams = allTeams.concat(response.data);
      lastPage = response.last_page;
      page++;
    } while (page <= lastPage);
  } catch (error) {
    console.error("Error fetching all teams:", error);
    return [];
  }

  return allTeams;
}

export async function fetchAllTeams(): Promise<
  {
    id: string;
    name: string;
    shortCode: string;
    logo?: string;
    created_at: string;
    slug: string;
  }[]
> {
  return fetchAPI("/api/admin/teams", { next: { revalidate: 10 } });
}

export async function fetchTeamDetails(teamId: string): Promise<{
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
  players: {
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
}> {
  return fetchAPI(`/api/admin/teams/${teamId}`, { cache: "no-store" });
}

export async function fetchCategories(): Promise<Category[]> {
  return fetchAPI<Category[]>("/api/admin/categories", { cache: "no-store" });
}

export async function fetchPlayers(): Promise<
  {
    id: string;
    name: string;
    profile_picture: string | null;
    team_id: string | null;
  }[]
> {
  return fetchAPI("/api/admin/players/without-team", { cache: "no-store" });
}

export async function fetchPlayer(
  playerId: string
): Promise<{ player: Player }> {
  const data = await fetchAPI<{ data: RawPlayerData }>(
    `/api/admin/players/${playerId}`,
    {
      cache: "no-store",
    }
  );
  const playerData = data.data;

  const statsMap = new Map(
    ensureArray<PlayerStat>(playerData.stats).map((stat: PlayerStat) => [
      stat.title,
      stat.value,
    ])
  );

  return {
    player: {
      id: playerData.id,
      team_id: playerData.team_id,
      profile_picture: playerData.profile_picture,
      name: playerData.name,
      nationality: playerData.nationality,
      dob: playerData.dob,
      weight: String(statsMap.get("weight") || ""),
      height: String(statsMap.get("height") || ""),
      bio:
        playerData.sections.find((s: PlayerSection) => s.title === "bio")
          ?.content || null,
      position: String(statsMap.get("position") || ""),
      preferred_foot: (statsMap.get("preferred foot") as string) || "",
      previous_experience:
        playerData.sections.find(
          (s: PlayerSection) => s.title === "previous experience"
        )?.content || null,
      reason_for_joining:
        playerData.sections.find(
          (s: PlayerSection) => s.title === "reason for joining"
        )?.content || null,
      created_at: playerData.created_at,
      updated_at: playerData.updated_at,
      stats: ensureArray<PlayerStat>(playerData.stats),
    },
  };
}

export async function fetchTeamsNotInCompetition(
  competitionId: string
): Promise<
  {
    id: string;
    name: string;
    logo: string;
    shortCode: string;
  }[]
> {
  return fetchAPI(`/api/admin/competition_teams/${competitionId}/teams`, {
    cache: "no-store",
  });
}

export async function fetchStages(): Promise<Stage[]> {
  try {
    return await fetchAPI<Stage[]>("/api/admin/stage", {
      cache: "no-store",
    });
  } catch (error) {
    console.error("Error fetching stages:", error);
    toast.error("Failed to load stages");
    return [];
  }
}

export const fetchFixtures = async (
  competitionId: string
): Promise<{ [date: string]: Fixture[] }> => {
  try {
    const [fixturesData, teams, resultsData] = await Promise.all([
      fetchAPI<{ Fixtures: { [date: string]: ApiFixture[] } }>(
        `/api/admin/fixtures/${competitionId}`,
        { cache: "no-store" }
      ),
      fetchTeams(competitionId),
      fetchResults(competitionId),
    ]);

    const teamMap = new Map<string, Team>(
      teams.data.map((team) => [team.id, team])
    );
    const resultMap = new Map<string, Result>();

    Object.values(resultsData.Results || {}).forEach((resultList) => {
      resultList.forEach((result) => {
        resultMap.set(result.fixture_id, result);
      });
    });

    const transformedFixtures: { [date: string]: Fixture[] } =
      Object.fromEntries(
        Object.entries(fixturesData.Fixtures || {}).map(
          ([date, fixtureList]) => [
            date,
            fixtureList.map((fixture) => {
              const result = resultMap.get(fixture.id) || null;
              return {
                ...fixture,
                home_team: teamMap.get(fixture.home_team_id) || {
                  id: fixture.home_team_id,
                  name: "Unknown Team",
                },
                away_team: teamMap.get(fixture.away_team_id) || {
                  id: fixture.away_team_id,
                  name: "Unknown Team",
                },
                result: result
                  ? {
                    id: result.id,
                    fixture_id: result.fixture_id,
                    winner_team_id: result.winner_team_id,
                    home_team_score: result.home_team_score,
                    away_team_score: result.away_team_score,
                    created_at: result.created_at,
                    updated_at: result.updated_at,
                    winner_team: result.winner_team_id
                      ? teamMap.get(result.winner_team_id) || null
                      : null,
                  }
                  : null,
              };
            }),
          ]
        )
      );
    return transformedFixtures;
  } catch (error) {
    console.error("Error fetching fixtures:", error);
    toast.error("Failed to load fixtures");
    return {};
  }
};

export async function fetchFixtureDetails(fixtureId: string): Promise<Fixture> {
  try {
    const data = await fetchAPI<{ Fixtures: ApiFixture }>(
      `/api/admin/fixture/${fixtureId}`,
      { cache: "no-store" }
    );
    const fixture = data.Fixtures;

    const competitionId = fixture.competition_id;
    const [teams, resultsData] = await Promise.all([
      fetchTeams(competitionId),
      fetchResults(competitionId),
    ]);
    const teamMap = new Map<string, Team>(
      teams.data.map((team) => [team.id, team])
    );
    const resultMap = new Map<string, Result>(
      Object.values(resultsData.Results || {})
        .flat()
        .map((result) => [result.fixture_id, result])
    );

    const result = resultMap.get(fixture.id) || null;
    return {
      ...fixture,
      home_team: teamMap.get(fixture.home_team_id) || {
        id: fixture.home_team_id,
        name: "Unknown Team",
      },
      away_team: teamMap.get(fixture.away_team_id) || {
        id: fixture.away_team_id,
        name: "Unknown Team",
      },
      result: result
        ? {
          id: result.id,
          fixture_id: result.fixture_id,
          winner_team_id: result.winner_team_id,
          home_team_score: result.home_team_score,
          away_team_score: result.away_team_score,
          created_at: result.created_at,
          updated_at: result.updated_at,
          winner_team: result.winner_team_id
            ? teamMap.get(result.winner_team_id) || null
            : null,
        }
        : null,
    };
  } catch (error) {
    console.error("Error fetching fixture details:", error);
    toast.error("Failed to load fixture");
    throw error;
  }
}

export const saveGroupSetup = async (
  competitionId: string,
  group: Group | KnockoutGame
): Promise<void> => {
  const validTeams = group.teams
    .filter((team) => team !== null)
    .map((team) => (typeof team === "string" ? team : team!.id));
  if (validTeams.length === 0) return;

  if (
    "id" in group &&
    "title" in group &&
    Array.isArray(group.teams) &&
    group.teams.some((team) => team && typeof team === "object")
  ) {
    const existingGroups = await fetchGroups(competitionId);

    const groupNames = existingGroups
      .filter((g) => typeof g.title === "string")
      .map((g) => g.title.toLowerCase());

    if (groupNames.includes(group.title.toLowerCase())) {
      toast.error(`A group named "${group.title}" already exists`);
      throw new Error(`Duplicate group name: ${group.title}`);
    }
  }

  // Get valid stage_id - use group.stage_id if available, otherwise fetch stages
  let stageId = "stage_id" in group ? group.stage_id : "";

  if (!stageId || stageId.trim() === "") {
    // Fetch available stages and use the first one
    const { fetchStages } = await import("@/actions/stages");
    const stages = await fetchStages();
    if (Array.isArray(stages) && stages.length > 0) {
      stageId = stages[0].id;
      console.log(`Using first available stage: ${stages[0].name} (${stageId})`);
    } else {
      toast.error("No stages available. Please ensure stages are set up for this competition.");
      throw new Error("No stages available. Cannot create group without a valid stage_id.");
    }
  }

  const response = await fetchAPI("/api/admin/create/group-setup", {
    method: "POST",
    body: JSON.stringify({
      group_name: group.title,
      team_id: validTeams,
      competition_id: competitionId,
      stage_id: stageId,
    }),
  });
  localStorage.setItem("saveGroupSetupResponse", JSON.stringify(response));
};

export async function fetchGroups(competitionId: string): Promise<Group[]> {
  try {
    const response = await fetchAPI<{
      data: {
        id: string;
        competition_id: string;
        group_name: string;
        stage_id: string;
        created_at: string;
        updated_at: string;
        teams: {
          id: string;
          name: string;
          pivot: { group_id: string; team_id: string };
        }[];
      }[];
    }>(`/api/admin/competitions/${competitionId}/groups`, {
      cache: "no-store",
    });
    const groups = Array.isArray(response.data)
      ? response.data.map((group) => ({
        id: group.id,
        title: group.group_name,
        competition_id: group.competition_id,
        stage_id: group.stage_id,
        created_at: group.created_at,
        updated_at: group.updated_at,
        teams: group.teams.map((team) => ({
          id: team.id,
          name: team.name,
          pivot: team.pivot,
        })),
        isSaved: true,
      }))
      : [];
    localStorage.setItem("fetchGroupsResponse", JSON.stringify(groups));
    return groups;
  } catch (error) {
    const errorMessage = `Error fetching groups: ${(error as Error).message}`;
    console.warn(errorMessage);
    localStorage.setItem("fetchGroupsError", errorMessage);
    if (!(error as Error).message.includes("404")) {
      toast.error("Failed to load existing groups");
    }
    return [];
  }
}

export async function fetchResults(
  competitionId: string
): Promise<ResultsResponse> {
  try {
    const data = await fetchAPI<ResultsResponse>(
      `/api/admin/result/${competitionId}`,
      { cache: "no-store" }
    );
    return data;
  } catch (error) {
    console.error("Error fetching results:", error);
    toast.error("Failed to load results");
    return { Results: {} };
  }
}

export interface SubmitResultPayload {
  fixture_id: string;
  home_team_score: string;
  away_team_score: string;
  winner_team_id?: string;
}

export async function submitResult(
  payload: SubmitResultPayload
): Promise<void> {
  try {
    const data = await fetchAPI<{ message: string }>(
      "/api/admin/create/result",
      {
        method: "POST",
        body: JSON.stringify(payload),
        cache: "no-store",
      }
    );
    toast.success(data.message || "Score submitted successfully");
  } catch (error) {
    console.error("Error submitting result:", error);
    toast.error(
      error instanceof Error ? error.message : "Failed to submit score"
    );
    throw error;
  }
}

export async function fetchCompetitionDetails(
  competitionId: string
): Promise<CompetitionFromAPI> {
  const data = await fetchAPI<{ competition: CompetitionFromAPI }>(
    `/api/admin/competitions/${competitionId}`,
    { cache: "no-store" }
  );
  return data.competition;
}

export async function updateCompetitionStatus(
  competitionId: string,
  status: "draft" | "started" | "ended"
): Promise<{ message: string }> {
  return fetchAPI(`/api/admin/competitions/${competitionId}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
    cache: "no-store",
  });
}

export async function publishCompetition(
  competitionId: string,
  isPublished: boolean
): Promise<{ message: string }> {
  return fetchAPI(`/api/admin/publish/competitions/${competitionId}`, {
    method: "POST",
    body: JSON.stringify({ isPublished }),
    cache: "no-store",
  });
}

export async function createGoal(payload: {
  fixture_id: string;
  scorer_id: string;
  assist_player_id?: string | null;
  goal_type: string;
}): Promise<{ message: string }> {
  return fetchAPI("/api/admin/create/goal", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createCard(payload: {
  fixture_id: string;
  player_id: string;
  card_type: string;
}): Promise<{ message: string }> {
  return fetchAPI("/api/admin/create/card", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createSubstitution(payload: {
  fixture_id: string;
  player_out_id: string;
  player_in_id: string;
  team_id: string;
}): Promise<{ message: string }> {
  return fetchAPI("/api/admin/create/subs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchStandings(
  competitionId: string
): Promise<{ competition_id: string; groups: GroupStanding[] }> {
  const data = await fetchAPI<{
    competition_id: string;
    groups: GroupStanding[];
  }>(`/api/admin/competition_teams/${competitionId}`, { cache: "no-store" });
  return data;
}
