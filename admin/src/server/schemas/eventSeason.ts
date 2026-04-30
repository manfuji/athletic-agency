import { z } from "zod";

export const eventSeasonBodySchema = z.object({
  name: z.string().min(1),
  year: z.coerce.number().int().min(1900),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  is_active: z.coerce.boolean().optional().default(true),
  competition_type: z.string().nullable().optional(),
});

export type EventSeasonBody = z.infer<typeof eventSeasonBodySchema>;

