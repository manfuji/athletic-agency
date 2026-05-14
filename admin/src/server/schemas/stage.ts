import { z } from "zod";

export const createStageBodySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
});

export type CreateStageBody = z.infer<typeof createStageBodySchema>;
