import { z } from "zod";

export const newsCreateSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  summary: z.string().optional().nullable(),
  content: z.string().min(1),
  cover_image: z.string().optional().nullable(),
  youtube_url: z.string().optional().nullable(),
  is_featured: z.boolean().optional().default(false),
  competition_id: z.string().uuid().optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  meta_title: z.string().optional().nullable(),
  meta_description: z.string().optional().nullable(),
  published_at: z.string().optional().nullable(),
});

export const newsUpdateSchema = newsCreateSchema.partial().refine(
  (v) => Object.keys(v).length > 0,
  {
    message: "At least one field is required",
  }
);
