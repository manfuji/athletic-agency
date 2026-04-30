import { z } from "zod";

export const competitionTypeCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(""),
});

export const competitionTypeUpdateSchema = z
  .object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
  })
  .refine((v) => v.name !== undefined || v.description !== undefined, {
    message: "At least one field is required",
  });
