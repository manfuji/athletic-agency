import { z } from "zod";

export const createStructureBodySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  description: z.string().trim().max(2000).optional().default(""),
});

export type CreateStructureBody = z.infer<typeof createStructureBodySchema>;
