"use server";

import { revalidatePath } from "next/cache";
import apiClient from "@/lib/axios";
import { Team } from "@/types/teams";
import { unwrapApi } from "@/lib/unwrapApi";

interface TeamResponse {
  data: Team[];
  last_page: number;
  per_page: number;
}

const emptyTeamResponse: TeamResponse = {
  data: [],
  last_page: 1,
  per_page: 10,
};

export async function fetchTeams(competitionId: string, page: number = 1) {
  return await apiClient
    .get(`/api/admin/competitions/${competitionId}/teams?page=${page}`)
    .then((res) => {
      const pageData = unwrapApi<TeamResponse>(res.data);
      return {
        data: Array.isArray(pageData?.data) ? pageData.data : [],
        last_page:
          typeof pageData?.last_page === "number" ? pageData.last_page : 1,
        per_page:
          typeof pageData?.per_page === "number" ? pageData.per_page : 10,
      };
    })
    .catch((error) => {
      console.error("Error fetching teams:", error);
      return emptyTeamResponse;
    });
}

export async function fetchAllTeams(): Promise<Team[]> {
  return await apiClient
    .get("/api/admin/teams")
    .then((res) => {
      const teams = unwrapApi<Team[]>(res.data);
      return Array.isArray(teams) ? teams : [];
    })
    .catch((error) => {
      console.error("Error fetching all teams:", error);
      return [];
    });
}

export async function fetchTeamDetails(
  teamId: string
): Promise<Team | { error: string }> {
  return await apiClient
    .get(`/api/admin/teams/${teamId}`)
    .then((res) => {
      return unwrapApi<Team>(res.data);
    })
    .catch((error) => {
      console.error("Error fetching team details:", error);
      return {
        error: "Error fetching team details",
      };
    });
}

export async function fetchTeamsNotInCompetition(
  competitionId: string
): Promise<Team[]> {
  return await apiClient
    .get(`/api/admin/competition_teams/${competitionId}/teams`)
    .then((res) => {
      const teams = unwrapApi<Team[]>(res.data);
      return Array.isArray(teams) ? teams : [];
    })
    .catch((error) => {
      console.error("Error fetching teams not in competition:", error);
      return [];
    });
}

export async function getAllTeamsForCompetition(
  competitionId: string
): Promise<Team[]>{
  let allTeams: Team[] = [];
  let page = 1;
  let lastPage = 1;

  const fetchPage = async (): Promise<Team[]> => {
    return await fetchTeams(competitionId, page).then(
      async (response: TeamResponse) => {
        if (!Array.isArray(response.data)) {
          throw new Error("Invalid team data format");
        }
        allTeams = allTeams.concat(response.data);
        lastPage = response.last_page;
        page++;

        if (page <= lastPage) {
          return await fetchPage();
        }
        return allTeams;
      }
    );
  };

  return await fetchPage().catch((error: unknown) => {
    console.error("Error fetching all teams:", error);
    return []
  });
}

export async function createTeam(formData: FormData) {
  return await apiClient
    .post(`/api/admin/create/teams`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => {
      return res.data
    })
    .catch((error) => {
      console.error("Error creating team:", error);
      return {
        error: error.response?.data?.message || "Error creating team",
      };
    });
}

export async function createTeamWithCompetition(
  competitionId: string,
  formData: FormData
) {
  return await apiClient
    .post(
      `/api/admin/create/competitions/${competitionId}/teams`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
    .then((res) => {
      return res.data
    })
    .catch((error) => {
      console.error("Error creating team:", error);
      return {
        error: error.response?.data?.message || "Error creating team",
      };
    });
}

export async function addExistingTeamsToCompetition(
  competitionId: string,
  teamIds: string[]
) {
  return await Promise.all(
    teamIds.map((teamId) =>
      apiClient.post(
        `/api/admin/create/competition_teams/${competitionId}/teams`,
        { team_id: teamId }
      )
    )
  )
    .then(() => {
      return {
        success: "Teams added successfully",
      };
    })
    .catch((error) => {
      console.error("Error adding existing teams:", error);
      return {
        error: error.response?.data?.message || "Error adding existing teams",
      };
    });
}

export async function removeTeamFromCompetition(
  competitionId: string,
  teamId: string
) {
  return await apiClient
    .delete(`/api/admin/delete/competitions/${competitionId}/teams/${teamId}`)
    .then(() => {
      revalidatePath(`/setup-competition/${competitionId}/teams`);
    })
    .catch((error) => {
      console.error("Error removing team from competition:", error);
      return {
        error:
          error.response?.data?.message || "Error removing team from competition",
      };
    });
}

export async function deleteTeam(teamId: string) {
  return await apiClient
    .delete(`/api/admin/delete/team/${teamId}`)
    .then(() => {
      revalidatePath("/team");
    })
    .catch((error) => {
      console.error("Error deleting team:", error);
      return {
        error: error.response?.data?.message || "Error deleting team",
      };
    });
}

export async function getTeam(teamId: string) {
  return await apiClient
    .get(`/api/admin/teams/${teamId}`)
    .then((res) => {
      return res.data;
    })
    .catch((error) => {
      console.error("Error fetching team details:", error);
      return {
        error: "Error fetching team details",
      };
    });
}

export async function updateTeam(teamId: string, formData: FormData) {
  return await apiClient
    .post(`/api/admin/update/teams/${teamId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => {
      return res.data;
    })
    .catch((error) => {
      console.error("Error updating team:", error);
      return {
        error: error.response?.data?.message || "Error updating team",
      };
    });
}

export async function fetchTeamPlayers(teamId: string) {
  return await apiClient
    .get(`/api/admin/teams/${teamId}/players`)
    .then((res) => {
      return res.data;
    })
    .catch((error) => {
      console.error("Error fetching team players:", error);
      return {
        error: error.response?.data?.message || "Error fetching team players",
      };
    });
}
