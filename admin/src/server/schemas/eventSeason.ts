import { z } from "zod";

export const eventSeasonBodySchema = z.object({
  name: z.string().min(1),
  year: z.coerce.number().int().min(1900),
  start_date: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v ?? null),
  end_date: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v ?? null),
  description: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v ?? null),
  is_active: z.coerce.boolean().optional().default(true),
  competition_type: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v ?? null),
});

export type EventSeasonBody = z.infer<typeof eventSeasonBodySchema>;

