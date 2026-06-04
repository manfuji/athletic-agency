"use server";

import apiClient from "@/lib/axios";
import { unwrapApi } from "@/lib/unwrapApi";
import { normalizeTeamRow } from "@/lib/normalize";
import { FixtureFormData, Fixture, Team } from "@/types/fixtures";

interface FixtureData {
  id: string;
  home_team_id: string;
  away_team_id: string;
  match_date: string;
  time: string;
  location: string;
  stream_url: string;
  competition_id: string;
  stage_id: string;
  created_at?: string;
  updated_at?: string;
}

interface ResultData {
  id: string;
  fixture_id: string;
  winner_team_id: string | null;
  home_team_score: number;
  away_team_score: number;
  created_at: string;
  updated_at: string;
}

interface FixturesResponse {
  Fixtures: {
    [date: string]: FixtureData[];
  };
}

interface ResultsResponse {
  Results: {
    [key: string]: ResultData[];
  };
}

export async function createFixture(
  competitionId: string,
  formData: FixtureFormData
) {
  // Validate stage_id is not empty
  if (!formData.stage_id || formData.stage_id.trim() === "") {
    console.error("Stage ID is empty or invalid");
    return {
      error: "Stage ID is required",
    };
  }

  let formattedMatchDate = formData.match_date;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(formData.match_date)) {
    const [day, month, year] = formData.match_date.split("/");
    formattedMatchDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const payload = {
    competition_id: competitionId,
    stage_id: formData.stage_id.trim(), // Trim whitespace
    home_team_id: formData.home_team_id,
    away_team_id: formData.away_team_id,
    match_date: formattedMatchDate,
    time: formData.time,
    location: formData.location,
    stream_url: "",
  };

  // Log the payload for debugging
  console.log("Creating fixture with payload:", {
    ...payload,
    stage_id: payload.stage_id,
  });

  return await apiClient
    .post("/api/admin/create/fixture", payload)
    .then((res) => {
      return res.data;
    })
    .catch((error) => {
      console.error("Error creating fixture:", error);
      console.error("Error response:", error.response?.data);
      return {
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Error creating fixture",
      };
    });
}

export async function getFixtures(competitionId: string) {
  return await Promise.all([
    apiClient.get<FixturesResponse>(`/api/admin/fixtures/${competitionId}`),
    apiClient.get(`/api/admin/competitions/${competitionId}/teams`),
    apiClient.get<ResultsResponse>(`/api/admin/result/${competitionId}`),
  ])
    .then(([fixturesRes, teamsRes, resultsRes]) => {
      const fixturesData = unwrapApi<FixturesResponse>(fixturesRes.data);
      const teamsPage = unwrapApi<{
        data: Team[];
        current_page?: number;
      }>(teamsRes.data);
      const resultsData = unwrapApi<ResultsResponse>(resultsRes.data);

      const teamMap = new Map<string, Team>(
        (teamsPage?.data ?? []).map((team: Team) => {
          const normalized = normalizeTeamRow(
            team as unknown as Record<string, unknown>
          ) as unknown as Team;
          return [normalized.id, normalized];
        })
      );

      const resultMap = new Map<string, ResultData>(
        Object.values(resultsData.Results || {})
          .flat()
          .map((result: unknown) => {
            const typedResult = result as ResultData;
            return [typedResult.fixture_id, typedResult];
          })
      );

      const transformedFixtures: { [date: string]: Fixture[] } = {};

      Object.entries(fixturesData.Fixtures || {}).forEach(
        ([date, fixtureList]: [string, FixtureData[]]) => {
          transformedFixtures[date] = fixtureList.map(
            (fixture): Fixture => ({
              ...fixture,
              created_at: fixture.match_date,
              updated_at: fixture.match_date,
              home_team: teamMap.get(fixture.home_team_id) || {
                id: fixture.home_team_id,
                name: "Unknown Team",
              },
              away_team: teamMap.get(fixture.away_team_id) || {
                id: fixture.away_team_id,
                name: "Unknown Team",
              },
              result: resultMap.has(fixture.id)
                ? (() => {
                    const r = resultMap.get(fixture.id)!;
                    const wid = r.winner_team_id;
                    return {
                      ...r,
                      winner_team: wid ? teamMap.get(wid) || null : null,
                    };
                  })()
                : null,
            })
          );
        }
      );

      return transformedFixtures;
    })
    .catch((error) => {
      console.error("Error fetching fixtures:", error);
      return {
        error: "Error fetching fixtures",
      };
    });
}

export async function fetchFixtureDetails(
  fixtureId: string
): Promise<Fixture | { error: string }> {
  return await apiClient
    .get(`/api/admin/fixture/${fixtureId}`)
    .then(async (fixtureRes) => {
      const fxBody = unwrapApi<{ Fixtures: FixtureData }>(fixtureRes.data);
      const fixture = fxBody.Fixtures;
      const competitionId = fixture.competition_id;

      return await Promise.all([
        apiClient.get(`/api/admin/competitions/${competitionId}/teams`),
        apiClient.get(`/api/admin/result/${competitionId}`),
      ]).then(([teamsRes, resultsRes]) => {
        const teamsPage = unwrapApi<{ data: Team[] }>(teamsRes.data);
        const resultsData = unwrapApi<ResultsResponse>(resultsRes.data);

        const teamMap = new Map<string, Team>(
          (teamsPage?.data ?? []).map((team: Team) => {
            const normalized = normalizeTeamRow(
              team as unknown as Record<string, unknown>
            ) as unknown as Team;
            return [normalized.id, normalized];
          })
        );

        const resultMap = new Map<string, ResultData>(
          Object.values(resultsData.Results || {})
            .flat()
            .map((result: unknown) => {
              const typedResult = result as ResultData;
              return [typedResult.fixture_id, typedResult];
            })
        );

        const result = resultMap.get(fixture.id) || null;

        const enriched: Fixture = {
          ...fixture,
          created_at: fixture.created_at ?? "",
          updated_at: fixture.updated_at ?? "",
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
        return enriched;
      });
    })
    .catch((error) => {
      console.error("Error fetching fixture details:", error);
      return {
        error: "Error fetching fixture details",
      };
    });
}


export async function deleteFixture(fixtureId: string) {
  return await apiClient
    .delete(`/api/admin/delete/fixture/${fixtureId}`)
    .then((res) => {
      return res.data;
    })
    .catch((error) => {
      console.error("Error deleting fixture:", error);
      return {
        error: error?.response?.data?.error || "Error deleting fixture",
      };
    });
}
