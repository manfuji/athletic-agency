import { z } from "zod";

export const positionBodySchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
});

