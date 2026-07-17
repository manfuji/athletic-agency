"use server";

import apiClient from "@/lib/axios";
import { unwrapApi } from "@/lib/unwrapApi";

export type FormAccessType = "private" | "public";
export type FormFieldType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "textarea"
  | "select";

export type DataFormRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  access_type: FormAccessType;
  requires_auth: boolean;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type DataFormFieldRow = {
  id: string;
  form_id: string;
  field_key: string;
  label: string;
  field_type: FormFieldType;
  required: boolean;
  options: { value: string; label: string }[] | null;
  sort_order: number;
  created_at: string;
};

export type DataFormSubmissionRow = {
  id: string;
  form_id: string;
  submitted_by: string | null;
  answers: Record<string, unknown>;
  created_at: string;
};

export type FormFieldInput = {
  field_key: string;
  label: string;
  field_type: FormFieldType;
  required?: boolean;
  options?: { value: string; label: string }[] | null;
  sort_order?: number;
};

export async function fetchDataForms(): Promise<DataFormRow[]> {
  return apiClient
    .get("/api/admin/data-forms")
    .then((res) => {
      const rows = unwrapApi<DataFormRow[]>(res.data);
      return Array.isArray(rows) ? rows : [];
    })
    .catch(() => []);
}

export async function fetchDataForm(formId: string) {
  return apiClient
    .get(`/api/admin/data-forms/${formId}`)
    .then((res) =>
      unwrapApi<{ form: DataFormRow; fields: DataFormFieldRow[] }>(res.data)
    )
    .catch((error) => ({
      error: error.response?.data?.message || "Error loading form",
    }));
}

export async function createDataForm(input: {
  title: string;
  description?: string | null;
  access_type: FormAccessType;
  is_active?: boolean;
  fields?: FormFieldInput[];
}) {
  return apiClient
    .post("/api/admin/data-forms", input)
    .then((res) =>
      unwrapApi<{ form: DataFormRow; fields: DataFormFieldRow[] }>(res.data)
    )
    .catch((error) => ({
      error: error.response?.data?.message || "Error creating form",
    }));
}

export async function updateDataForm(
  formId: string,
  patch: {
    title?: string;
    description?: string | null;
    access_type?: FormAccessType;
    is_active?: boolean;
  }
) {
  return apiClient
    .patch(`/api/admin/data-forms/${formId}`, patch)
    .then((res) => unwrapApi<{ form: DataFormRow }>(res.data))
    .catch((error) => ({
      error: error.response?.data?.message || "Error updating form",
    }));
}

export async function replaceFormFields(formId: string, fields: FormFieldInput[]) {
  return apiClient
    .put(`/api/admin/data-forms/${formId}/fields`, { fields })
    .then((res) => unwrapApi<{ fields: DataFormFieldRow[] }>(res.data))
    .catch((error) => ({
      error: error.response?.data?.message || "Error saving fields",
    }));
}

export async function deleteDataForm(formId: string) {
  return apiClient
    .delete(`/api/admin/data-forms/${formId}`)
    .then((res) => res.data)
    .catch((error) => ({
      error: error.response?.data?.message || "Error deleting form",
    }));
}

export async function fetchFormSubmissions(formId: string, page = 1) {
  return apiClient
    .get(`/api/admin/data-forms/${formId}/submissions`, { params: { page } })
    .then((res) =>
      unwrapApi<{
        data: DataFormSubmissionRow[];
        total: number;
        current_page: number;
        last_page: number;
        per_page: number;
      }>(res.data)
    )
    .catch((error) => ({
      error: error.response?.data?.message || "Error loading submissions",
    }));
}

export async function submitPrivateForm(
  formId: string,
  answers: Record<string, unknown>
) {
  return apiClient
    .post(`/api/admin/data-forms/${formId}/submissions`, { answers })
    .then((res) => unwrapApi<{ submission: DataFormSubmissionRow }>(res.data))
    .catch((error) => ({
      error: error.response?.data?.message || "Error submitting form",
    }));
}
