import { z } from "zod";

export const affiliationBodySchema = z.object({
  name: z.string().min(1),
});

