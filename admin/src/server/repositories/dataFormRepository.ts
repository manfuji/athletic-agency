import type { SupabaseClient } from "@supabase/supabase-js";
import { ServiceError } from "@/server/errors/serviceError";

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

export type FormFieldInsert = {
  field_key: string;
  label: string;
  field_type: FormFieldType;
  required?: boolean;
  options?: { value: string; label: string }[] | null;
  sort_order?: number;
};

export interface IDataFormRepository {
  list(): Promise<DataFormRow[]>;
  findById(id: string): Promise<DataFormRow | null>;
  findBySlug(slug: string): Promise<DataFormRow | null>;
  insert(row: {
    title: string;
    slug: string;
    description?: string | null;
    access_type: FormAccessType;
    requires_auth: boolean;
    is_active?: boolean;
    created_by?: string | null;
  }): Promise<DataFormRow>;
  update(id: string, patch: Partial<DataFormRow>): Promise<DataFormRow>;
  delete(id: string): Promise<void>;
  listFields(formId: string): Promise<DataFormFieldRow[]>;
  replaceFields(formId: string, fields: FormFieldInsert[]): Promise<DataFormFieldRow[]>;
  listSubmissions(formId: string, page: number, perPage: number): Promise<{
    data: DataFormSubmissionRow[];
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
  }>;
  insertSubmission(row: {
    form_id: string;
    submitted_by?: string | null;
    answers: Record<string, unknown>;
  }): Promise<DataFormSubmissionRow>;
}

export class DataFormSupabaseRepository implements IDataFormRepository {
  constructor(private readonly db: SupabaseClient) {}

  async list(): Promise<DataFormRow[]> {
    const { data, error } = await this.db
      .from("data_forms")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new ServiceError(error.message, 500);
    return (data ?? []) as DataFormRow[];
  }

  async findById(id: string): Promise<DataFormRow | null> {
    const { data, error } = await this.db
      .from("data_forms")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new ServiceError(error.message, 500);
    return (data as DataFormRow | null) ?? null;
  }

  async findBySlug(slug: string): Promise<DataFormRow | null> {
    const { data, error } = await this.db
      .from("data_forms")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw new ServiceError(error.message, 500);
    return (data as DataFormRow | null) ?? null;
  }

  async insert(row: {
    title: string;
    slug: string;
    description?: string | null;
    access_type: FormAccessType;
    requires_auth: boolean;
    is_active?: boolean;
    created_by?: string | null;
  }): Promise<DataFormRow> {
    const { data, error } = await this.db
      .from("data_forms")
      .insert({
        title: row.title,
        slug: row.slug,
        description: row.description ?? null,
        access_type: row.access_type,
        requires_auth: row.requires_auth,
        is_active: row.is_active ?? true,
        created_by: row.created_by ?? null,
      })
      .select("*")
      .single();
    if (error) throw new ServiceError(error.message, 500);
    return data as DataFormRow;
  }

  async update(id: string, patch: Partial<DataFormRow>): Promise<DataFormRow> {
    const { data, error } = await this.db
      .from("data_forms")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new ServiceError(error.message, 500);
    return data as DataFormRow;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.db.from("data_forms").delete().eq("id", id);
    if (error) throw new ServiceError(error.message, 500);
  }

  async listFields(formId: string): Promise<DataFormFieldRow[]> {
    const { data, error } = await this.db
      .from("data_form_fields")
      .select("*")
      .eq("form_id", formId)
      .order("sort_order", { ascending: true });
    if (error) throw new ServiceError(error.message, 500);
    return (data ?? []) as DataFormFieldRow[];
  }

  async replaceFields(
    formId: string,
    fields: FormFieldInsert[]
  ): Promise<DataFormFieldRow[]> {
    const { error: delErr } = await this.db
      .from("data_form_fields")
      .delete()
      .eq("form_id", formId);
    if (delErr) throw new ServiceError(delErr.message, 500);

    if (fields.length === 0) return [];

    const rows = fields.map((f, i) => ({
      form_id: formId,
      field_key: f.field_key,
      label: f.label,
      field_type: f.field_type,
      required: f.required ?? false,
      options: f.options ?? null,
      sort_order: f.sort_order ?? i,
    }));

    const { data, error } = await this.db
      .from("data_form_fields")
      .insert(rows)
      .select("*");
    if (error) throw new ServiceError(error.message, 500);
    return (data ?? []) as DataFormFieldRow[];
  }

  async listSubmissions(
    formId: string,
    page: number,
    perPage: number
  ): Promise<{
    data: DataFormSubmissionRow[];
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
  }> {
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const { data, error, count } = await this.db
      .from("data_form_submissions")
      .select("*", { count: "exact" })
      .eq("form_id", formId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw new ServiceError(error.message, 500);
    const total = count ?? 0;
    const last_page = Math.max(1, Math.ceil(total / perPage));

    return {
      data: (data ?? []) as DataFormSubmissionRow[],
      total,
      current_page: page,
      last_page,
      per_page: perPage,
    };
  }

  async insertSubmission(row: {
    form_id: string;
    submitted_by?: string | null;
    answers: Record<string, unknown>;
  }): Promise<DataFormSubmissionRow> {
    const { data, error } = await this.db
      .from("data_form_submissions")
      .insert({
        form_id: row.form_id,
        submitted_by: row.submitted_by ?? null,
        answers: row.answers,
      })
      .select("*")
      .single();
    if (error) throw new ServiceError(error.message, 500);
    return data as DataFormSubmissionRow;
  }
}
