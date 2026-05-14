"use server";

import apiClient from "@/lib/axios";
import { unwrapApi } from "@/lib/unwrapApi";
import { AxiosError } from "axios";
import type { CompetitionFromAPI } from "@/types/competitions";
import type { Category } from "@/types/categories";

export async function getCompetitions() {
  return await apiClient
    .get("/api/admin/competitions")
    .then((res) => {
      const competitions = unwrapApi<CompetitionFromAPI[]>(res?.data);
      return Array.isArray(competitions) ? competitions : [];
    })
    .catch((error) => {
      const status = error instanceof AxiosError ? error.response?.status : null;
      if (status !== 401 && status !== 403) {
        console.error("Error fetching competitions:", error);
      }
      return [];
    });
}

export async function getCompetitionById(id: string) {
  return await apiClient
    .get(`/api/admin/competitions/${id}`)
    .then((res) => {
      return res.data?.data;
    })
    .catch((error) => {
      console.error("Error fetching competition by id:", error);
      return {
        error: "Error fetching competition by id",
      };
    });
}

export async function getCompetitionCategories() {
  return await apiClient
    .get("/api/admin/categories")
    .then((res) => {
      const categories = unwrapApi<Category[]>(res.data);
      return Array.isArray(categories) ? categories : [];
    })
    .catch((error) => {
      const status = error instanceof AxiosError ? error.response?.status : null;
      if (status !== 401 && status !== 403) {
        console.error("Error fetching competition categories:", error);
      }
      return [];
    });
}

export async function createCategory(name: string, slug: string) {
  return await apiClient
    .post("/api/admin/create/category", {
      name,
      slug,
    })
    .then((res) => {
      return res.data;
    })
    .catch((error) => {
      console.error("Error creating category:", error);
      return {
        error: "Error creating category",
      };
    });
}

export async function createCompetition(formData: FormData) {
  return await apiClient
    .post("/api/admin/create/competitions", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => {
      const data = unwrapApi<{ competition: { id: string } }>(res.data);
      return data.competition;
    })
    .catch((error) => {
      console.error("Error creating competition:", error?.response?.data);
      return {
        error:
          error instanceof AxiosError
            ? error.response?.data?.message
            : "Error creating competition",
      };
    });
}

export async function updateCompetition(
  id: string,
  data: FormData | Record<string, string>
) {
  return await apiClient
    .post(`/api/admin/update/competitions/${id}`, data, {
      headers:
        data instanceof FormData
          ? {
              "Content-Type": "multipart/form-data",
            }
          : {
              "Content-Type": "application/json",
            },
    })
    .then((res) => {
      return res.data;
    })
    .catch((error) => {
      console.error("Error updating competition:", error?.response?.data);
      return {
        error:
          error instanceof AxiosError
            ? error.response?.data?.message
            : "Error updating competition",
      };
    });
}

export async function deleteCompetition(competitionId: string) {
  return await apiClient
    .delete(`/api/admin/delete/competitions/${competitionId}`)
    .then((res) => {
      return res.data;
    })
    .catch((error) => {
      console.error("Error deleting competition:", error);
      return {
        error:
          error instanceof AxiosError
            ? error.response?.data?.message
            : "Error deleting competition",
      };
    });
}

export async function updateCompetitionStatus(
  competitionId: string,
  status: "draft" | "started" | "ended"
) {
  return await apiClient
    .put(`/api/admin/competitions/${competitionId}`, { status })
    .then((res) => {
      return res.data;
    })
    .catch((error) => {
      console.error("Error updating competition status:", error);
      return {
        error: "Error updating competition status",
      };
    });
}

export async function publishCompetition(
  competitionId: string,
  isPublished: boolean
) {
  return await apiClient
    .post(`/api/admin/publish/competitions/${competitionId}`, {
      isPublished,
    })
    .then((res) => {
      return res.data;
    })
    .catch((error) => {
      console.error("Error publishing competition:", error);
      return {
        error: "Error publishing competition",
      };
    });
}

export async function updateCompetitionStructure(
  competitionId: string,
  structureId: string
) {
  return await apiClient
    .patch(`/api/admin/competitions/${competitionId}`, {
      structure_id: structureId,
    })
    .then((res) => {
      return res.data;
    })
    .catch((error) => {
      console.error("Error updating competition structure:", error);
      return {
        error: "Error updating competition structure",
      };
    });
}

export async function getCompetitionStructures() {
  return await apiClient
    .get("/api/admin/structures")
    .then((res) => {
      const structures = unwrapApi<unknown>(res.data);
      return Array.isArray(structures) ? structures : [];
    })
    .catch((error) => {
      console.error("Error fetching competition structures:", error);
      return [];
    });
}

export async function createCompetitionStructure(input: {
  name: string;
  description?: string;
}) {
  return await apiClient
    .post("/api/admin/structures", {
        name: input.name,
        description: input.description ?? "",
      })
    .then((res) => unwrapApi<unknown>(res.data))
    .catch((error) => {
      console.error("Error creating competition structure:", error);
      return {
        error:
          error instanceof AxiosError
            ? error.response?.data?.message ||
              error.response?.data?.error ||
              error.message ||
              "Error creating structure"
            : "Error creating structure",
      };
    });
}

export async function importCompetitionStats(competitionId: string, file: File) {
  const formData = new FormData();
  
  // Normalize filename - remove double extensions (e.g., .csv.xlsx -> .xlsx)
  let normalizedFileName = file.name;
  const fileNameLower = file.name.toLowerCase();
  const validExtensions = [".csv", ".xlsx", ".xls"];
  
  // Check if file has double extension
  const parts = fileNameLower.split(".");
  if (parts.length > 2) {
    const lastExt = `.${parts[parts.length - 1]}`;
    const secondLastExt = `.${parts[parts.length - 2]}`;
    
    // If both are valid extensions, use only the last one
    if (validExtensions.includes(secondLastExt) && validExtensions.includes(lastExt)) {
      const baseName = file.name.substring(0, file.name.lastIndexOf("."));
      normalizedFileName = `${baseName}${lastExt}`;
      console.log(`Normalized filename from "${file.name}" to "${normalizedFileName}"`);
    }
  }
  
  // Create a new File object with normalized name to ensure backend receives correct extension
  const normalizedFile = new File([file], normalizedFileName, {
    type: file.type,
    lastModified: file.lastModified,
  });
  
  formData.append("file", normalizedFile, normalizedFileName);

  return await apiClient
    .post(`/api/admin/competitions/${competitionId}/import`, formData, {
      // Don't set Content-Type header - axios will set it automatically with boundary
      // for multipart/form-data
    })
    .then((res) => {
      console.log("Import API response:", res.data);
      // Handle both direct response and wrapped response
      const responseData = res.data?.data || res.data;
      return responseData;
    })
    .catch((error) => {
      console.error("Error importing competition stats:", error);
      console.error("Error response:", error.response?.data);
      console.error("File details:", {
        originalName: file.name,
        normalizedName: normalizedFileName,
        fileType: file.type,
        fileSize: file.size,
      });
      return {
        error:
          error instanceof AxiosError
            ? error.response?.data?.message || error.response?.data?.error || error.message || "Error importing competition stats"
            : "Error importing competition stats",
      };
    });
}

export async function exportCompetitionPlayers(competitionId: string) {
  return await apiClient
    .post(`/api/admin/competitions/${competitionId}/players/export`, {}, {
      responseType: "blob",
    })
    .then((res) => {
      // Return the blob data - client will handle download
      return { data: res.data, success: true };
    })
    .catch((error) => {
      console.error("Error exporting competition players:", error);
      return {
        error:
          error instanceof AxiosError
            ? error.response?.data?.message
            : "Error exporting competition players",
      };
    });
}

export async function getCompetitionImportProgress(competitionId: string) {
  return await apiClient
    .get(`/api/admin/competitions/${competitionId}/import-progress`)
    .then((res) => {
      console.log("Progress API response:", res.data);
      // Handle both direct response and wrapped response
      const responseData = res.data?.data || res.data;
      return responseData;
    })
    .catch((error) => {
      console.error("Error fetching import progress:", error);
      console.error("Error response:", error.response?.data);
      return {
        error:
          error instanceof AxiosError
            ? error.response?.data?.message || error.response?.data?.error || error.message || "Error fetching import progress"
            : "Error fetching import progress",
      };
    });
}
