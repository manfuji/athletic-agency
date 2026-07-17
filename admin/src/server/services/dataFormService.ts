import { ServiceError } from "@/server/errors/serviceError";
import { uniqueSlug } from "@/server/lib/formDataParse";
import type { AppSession } from "@/server/auth/guard";
import type {
  IDataFormRepository,
  DataFormFieldRow,
  FormAccessType,
  FormFieldInsert,
} from "@/server/repositories/dataFormRepository";

const DEFAULT_PER_PAGE = 25;

function slugifyFieldKey(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
}

function validateAnswers(
  fields: DataFormFieldRow[],
  answers: Record<string, unknown>
): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};

  for (const field of fields) {
    const raw = answers[field.field_key];
    const missing =
      raw === undefined ||
      raw === null ||
      (typeof raw === "string" && raw.trim() === "");

    if (field.required && missing) {
      throw new ServiceError(`${field.label} is required`, 400);
    }
    if (missing) continue;

    switch (field.field_type) {
      case "number": {
        const n = Number(raw);
        if (Number.isNaN(n)) {
          throw new ServiceError(`${field.label} must be a number`, 400);
        }
        normalized[field.field_key] = n;
        break;
      }
      case "boolean":
        normalized[field.field_key] = Boolean(raw);
        break;
      default:
        normalized[field.field_key] = raw;
    }
  }

  return normalized;
}

export class DataFormService {
  constructor(private readonly forms: IDataFormRepository) {}

  list() {
    return this.forms.list();
  }

  async getById(formId: string) {
    const form = await this.forms.findById(formId);
    if (!form) throw new ServiceError("Form not found", 404);
    const fields = await this.forms.listFields(formId);
    return { form, fields };
  }

  async getPublicBySlug(slug: string) {
    const form = await this.forms.findBySlug(slug);
    if (!form || form.access_type !== "public" || !form.is_active) {
      throw new ServiceError("Form not found", 404);
    }
    const fields = await this.forms.listFields(form.id);
    return { form, fields };
  }

  async create(
    session: AppSession,
    input: {
      title: string;
      description?: string | null;
      access_type: FormAccessType;
      is_active?: boolean;
      fields?: FormFieldInsert[];
    }
  ) {
    const requires_auth = input.access_type === "public";
    const slug = uniqueSlug(input.title);

    const form = await this.forms.insert({
      title: input.title,
      slug,
      description: input.description ?? null,
      access_type: input.access_type,
      requires_auth,
      is_active: input.is_active ?? true,
      created_by: session.user.id,
    });

    let fields: DataFormFieldRow[] = [];
    if (input.fields?.length) {
      const normalized = input.fields.map((f, i) => ({
        ...f,
        field_key: f.field_key || slugifyFieldKey(f.label) || `field_${i + 1}`,
        sort_order: f.sort_order ?? i,
      }));
      fields = await this.forms.replaceFields(form.id, normalized);
    }

    return { form, fields };
  }

  async update(
    formId: string,
    patch: {
      title?: string;
      description?: string | null;
      access_type?: FormAccessType;
      is_active?: boolean;
    }
  ) {
    const existing = await this.forms.findById(formId);
    if (!existing) throw new ServiceError("Form not found", 404);

    const nextAccess = patch.access_type ?? existing.access_type;
    const updatePatch = {
      ...patch,
      requires_auth: nextAccess === "public",
    };

    const form = await this.forms.update(formId, updatePatch);
    return { form };
  }

  async replaceFields(formId: string, fields: FormFieldInsert[]) {
    const existing = await this.forms.findById(formId);
    if (!existing) throw new ServiceError("Form not found", 404);

    const normalized = fields.map((f, i) => ({
      ...f,
      field_key: f.field_key || slugifyFieldKey(f.label) || `field_${i + 1}`,
      sort_order: f.sort_order ?? i,
    }));

    const saved = await this.forms.replaceFields(formId, normalized);
    return { fields: saved };
  }

  async delete(formId: string) {
    await this.forms.delete(formId);
    return { message: "Form deleted" };
  }

  listSubmissions(formId: string, page: number) {
    return this.forms.listSubmissions(formId, page, DEFAULT_PER_PAGE);
  }

  async submitPrivate(
    session: AppSession,
    formId: string,
    answers: Record<string, unknown>
  ) {
    const form = await this.forms.findById(formId);
    if (!form) throw new ServiceError("Form not found", 404);
    if (form.access_type !== "private") {
      throw new ServiceError("This form is not private", 400);
    }
    if (!form.is_active) throw new ServiceError("Form is inactive", 400);

    const fields = await this.forms.listFields(formId);
    const normalized = validateAnswers(fields, answers);

    const submission = await this.forms.insertSubmission({
      form_id: formId,
      submitted_by: session.user.id,
      answers: normalized,
    });

    return { submission };
  }

  async submitPublic(
    slug: string,
    userId: string | null,
    answers: Record<string, unknown>
  ) {
    const { form, fields } = await this.getPublicBySlug(slug);

    if (form.requires_auth && !userId) {
      throw new ServiceError("Authentication required to submit this form", 401);
    }

    const normalized = validateAnswers(fields, answers);

    const submission = await this.forms.insertSubmission({
      form_id: form.id,
      submitted_by: userId,
      answers: normalized,
    });

    return { submission };
  }
}
