import { z } from "zod";

export const footPreferenceBodySchema = z.object({
  code: z.string().min(1),
  description: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v ?? null),
});

