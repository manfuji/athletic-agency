"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type PublicFormField = {
  id: string;
  field_key: string;
  label: string;
  field_type: string;
  required: boolean;
  options: { value: string; label: string }[] | null;
  sort_order: number;
};

export type PublicForm = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  requires_auth: boolean;
};

function validateAnswers(
  fields: PublicFormField[],
  answers: Record<string, unknown>
): Record<string, unknown> | { error: string } {
  const normalized: Record<string, unknown> = {};

  for (const field of fields) {
    const raw = answers[field.field_key];
    const missing =
      raw === undefined ||
      raw === null ||
      (typeof raw === "string" && raw.trim() === "");

    if (field.required && missing) {
      return { error: `${field.label} is required` };
    }
    if (missing) continue;

    if (field.field_type === "number") {
      const n = Number(raw);
      if (Number.isNaN(n)) return { error: `${field.label} must be a number` };
      normalized[field.field_key] = n;
    } else if (field.field_type === "boolean") {
      normalized[field.field_key] = Boolean(raw);
    } else {
      normalized[field.field_key] = raw;
    }
  }

  return normalized;
}

export async function fetchPublicForm(slug: string) {
  const db = createSupabaseAdminClient();

  const { data: form, error } = await db
    .from("data_forms")
    .select("id,title,slug,description,requires_auth,is_active,access_type")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !form || form.access_type !== "public" || !form.is_active) {
    return { error: "Form not found" };
  }

  const { data: fields, error: fieldsError } = await db
    .from("data_form_fields")
    .select("id,field_key,label,field_type,required,options,sort_order")
    .eq("form_id", form.id)
    .order("sort_order", { ascending: true });

  if (fieldsError) return { error: fieldsError.message };

  return {
    form: {
      id: form.id,
      title: form.title,
      slug: form.slug,
      description: form.description,
      requires_auth: form.requires_auth,
    } satisfies PublicForm,
    fields: (fields ?? []) as PublicFormField[],
  };
}

export async function getPublicFormSession() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { id: user.id, email: user.email ?? null } : null;
}

export async function submitPublicForm(
  slug: string,
  answers: Record<string, unknown>
) {
  const loaded = await fetchPublicForm(slug);
  if ("error" in loaded) return loaded;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (loaded.form.requires_auth && !user) {
    return { error: "Authentication required to submit this form" };
  }

  const validated = validateAnswers(loaded.fields, answers);
  if ("error" in validated) return validated;

  const db = createSupabaseAdminClient();
  const { error } = await db.from("data_form_submissions").insert({
    form_id: loaded.form.id,
    submitted_by: user?.id ?? null,
    answers: validated,
  });

  if (error) return { error: error.message };
  return { ok: true };
}

export async function signInForForm(email: string, password: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  return { ok: true };
}

export async function signOutFromForm() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  return { ok: true };
}
