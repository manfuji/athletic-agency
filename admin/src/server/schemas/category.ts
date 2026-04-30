import { z } from "zod";

export const categoryBodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
});

export type CategoryBody = z.infer<typeof categoryBodySchema>;
