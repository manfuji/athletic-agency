"use server";

import apiClient from "@/lib/axios";
import { Stage } from "@/types/fixtures";

export async function fetchStages(): Promise<Stage[]> {
  return await apiClient
    .get("/api/admin/stage")
    .then((res) => {
      // Handle different possible response structures
      const data = res.data;
      
      // If response is wrapped in a data property
      if (data && Array.isArray(data.data)) {
        return data.data;
      }
      
      // If response is directly an array
      if (Array.isArray(data)) {
        return data;
      }
      
      // If response has a different structure, try to extract stages
      if (data && Array.isArray(data.stages)) {
        return data.stages;
      }
      
      console.warn("Unexpected stages API response structure:", data);
      return [];
    })
    .catch((error) => {
      console.error("Error fetching stages:", error);
      // Return empty array instead of error object to prevent type issues
      return [];
    });
}
