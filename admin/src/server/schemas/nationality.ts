import { z } from "zod";

export const nationalityBodySchema = z.object({
  code: z.string().min(1).max(8),
  name: z.string().min(1),
});

