"use server";

import apiClient from "@/lib/axios";
import { unwrapApi } from "@/lib/unwrapApi";
import { NewsItem } from "@/types/news";

export async function fetchNews(): Promise<NewsItem[]> {
  return await apiClient
    .get("/api/admin/news")
    .then((res) => {
      const data = unwrapApi<NewsItem[]>(res.data);
      return Array.isArray(data) ? data : [];
    })
    .catch((error) => {
      console.error("Error fetching news:", error);
      return [];
    });
}

export async function createNews(payload: {
  title: string;
  slug: string;
  summary?: string | null;
  content: string;
  cover_image?: string | null;
  youtube_url?: string | null;
  is_featured?: boolean;
  competition_id?: string | null;
  category_id?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  published_at?: string | null;
}) {
  return await apiClient
    .post("/api/admin/news", payload)
    .then((res) => unwrapApi(res.data))
    .catch((error) => {
      console.error("Error creating news:", error);
      return {
        error: error.response?.data?.message || "Error creating news",
      };
    });
}

export async function updateNews(
  newsId: string,
  payload: Partial<{
    title: string;
    slug: string;
    summary: string | null;
    content: string;
    cover_image: string | null;
    youtube_url: string | null;
    is_featured: boolean;
    competition_id: string | null;
    category_id: string | null;
    meta_title: string | null;
    meta_description: string | null;
    published_at: string | null;
  }>
) {
  return await apiClient
    .patch(`/api/admin/news/${newsId}`, payload)
    .then((res) => unwrapApi(res.data))
    .catch((error) => {
      console.error("Error updating news:", error);
      return {
        error: error.response?.data?.message || "Error updating news",
      };
    });
}

export async function deleteNews(newsId: string) {
  return await apiClient
    .delete(`/api/admin/news/${newsId}`)
    .then((res) => unwrapApi(res.data))
    .catch((error) => {
      console.error("Error deleting news:", error);
      return {
        error: error.response?.data?.message || "Error deleting news",
      };
    });
}
