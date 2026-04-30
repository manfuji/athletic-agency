"use server";

import { revalidatePath } from "next/cache";
import apiClient from "@/lib/axios";
import { unwrapApi } from "@/lib/unwrapApi";
import type { Category } from "@/types/categories";
// import { Category } from "@/types/categories";

export async function fetchCategories(): Promise<Category[]> {
  return await apiClient
    .get("/api/admin/categories")
    .then((res) => {
      const categories = unwrapApi<Category[]>(res.data);
      return Array.isArray(categories) ? categories : [];
    })
    .catch((error) => {
      console.error("Error fetching categories:", error);
      return [];
    });
}

export async function createCategory(data: { name: string; slug: string }) {
  return await apiClient
    .post("/api/admin/create/category", data)
    .then(() => {
      revalidatePath("/dashboard/categories");
    })
    .catch((error) => {
      console.error("Error creating category:", error);
      return {
        error: error.response?.data?.message || "Error creating category",
      };
    });
}

export async function updateCategory(
  id: string,
  data: { name: string; slug: string }
) {
  return await apiClient
    .put(`/api/admin/update/category/${id}`, data)
    .then(() => {
      revalidatePath("/dashboard/categories");
    })
    .catch((error) => {
      console.error("Error updating category:", error);
      return {
        error: error.response?.data?.message || "Error updating category",
      };
    });
}

export async function deleteCategory(categoryId: string) {
  return await apiClient
    .delete(`/api/admin/delete/category/${categoryId}`)
    .then(() => {
      revalidatePath("/dashboard/categories");
    })
    .catch((error) => {
      console.error("Error deleting category:", error);
      return {
        error: error.response?.data?.message || "Error deleting category",
      };
    });
}
