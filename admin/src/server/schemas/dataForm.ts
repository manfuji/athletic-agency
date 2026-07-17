import { z } from "zod";

export const formFieldTypeSchema = z.enum([
  "string",
  "number",
  "boolean",
  "date",
  "textarea",
  "select",
]);

export const formAccessTypeSchema = z.enum(["private", "public"]);

export const formFieldInputSchema = z.object({
  field_key: z.string().min(1).max(80),
  label: z.string().min(1).max(200),
  field_type: formFieldTypeSchema,
  required: z.boolean().optional(),
  options: z
    .array(z.object({ value: z.string(), label: z.string() }))
    .nullable()
    .optional(),
  sort_order: z.number().int().optional(),
});

export const createFormSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).nullable().optional(),
  access_type: formAccessTypeSchema.default("private"),
  is_active: z.boolean().optional(),
  fields: z.array(formFieldInputSchema).optional(),
});

export const updateFormSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  access_type: formAccessTypeSchema.optional(),
  is_active: z.boolean().optional(),
});

export const submitFormSchema = z.object({
  answers: z.record(z.unknown()),
});
