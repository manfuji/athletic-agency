"use server";

import { apiUrl } from "@/lib/constant";
import { fetchWrapper } from "@/lib/fetch-wrapper";

const EMPTY_TEAM_PROFILE: TeamProfile = {
  id: "",
  category_id: "",
  logo: "",
  coverPhoto: "",
  name: "",
  description: "",
  slug: "",
  category: {
    id: "",
    name: "",
  },
  players: { position: [] },
  stats: {
    wins: 0,
    draws: 0,
    losses: 0,
  },
};

const EMPTY_STATS: { data: StatsType[] } = { data: [] };

export async function getTeamProfile(id: string): Promise<TeamProfile> {
  const url = apiUrl(`/api/teams/${id}`);

  const response = await fetchWrapper<TeamProfile>(url, {
    method: "GET",
  });
  if ("error" in response) {
    return { ...EMPTY_TEAM_PROFILE, id, slug: id };
  }

  return response;
}

export async function getTeamTopScorers(
  id: string
): Promise<{ data: StatsType[] }> {
  const url = apiUrl(`/api/teams/${id}/top-scorers`);

  const response = await fetchWrapper<{ data: GoalStats[] }>(url, {
    method: "GET",
  });

  if ("error" in response) {
    return EMPTY_STATS;
  }

  return response;
}

export async function getTeamTopAssists(
  id: string
): Promise<{ data: StatsType[] }> {
  const url = apiUrl(`/api/teams/${id}/top-assists`);

  const response = await fetchWrapper<{ data: AssistStats[] }>(url, {
    method: "GET",
  });

  if ("error" in response) {
    return EMPTY_STATS;
  }

  return response;
}

export async function getTeamTopYellowCards(
  id: string
): Promise<{ data: StatsType[] }> {
  const url = apiUrl(`/api/teams/${id}/top-yellow-cards`);

  const response = await fetchWrapper<{ data: YellowCardStats[] }>(url, {
    method: "GET",
  });

  if ("error" in response) {
    return EMPTY_STATS;
  }

  return response;
}

export async function getTeamTopRedCards(
  id: string
): Promise<{ data: StatsType[] }> {
  const url = apiUrl(`/api/teams/${id}/top-red-cards`);

  const response = await fetchWrapper<{ data: RedCardStats[] }>(url, {
    method: "GET",
  });

  if ("error" in response) {
    return EMPTY_STATS;
  }

  return response;
}

export async function getTeamById(
  id: string
): Promise<{ name: string } | null> {
  try {
    const url = apiUrl(`/api/teams/${id}`);

    const response = await fetchWrapper<
      TeamProfile | { data?: { name?: string }; name?: string }
    >(url, {
      method: "GET",
    });

    if ("error" in response) {
      return null;
    }

    // Normalize different possible response shapes into a single { name } shape
    if ("name" in response && typeof (response as TeamProfile).name === "string") {
      return { name: (response as TeamProfile).name };
    }

    const maybeWithData = response as {
      data?: { name?: string };
      name?: string;
    };

    const finalName = maybeWithData.data?.name ?? maybeWithData.name ?? null;

    if (!finalName) {
      return null;
    }

    return { name: finalName };
  } catch {
    return null;
  }
}
