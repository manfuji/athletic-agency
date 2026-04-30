import { z } from "zod";

export const pageQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
});

export type PageQuery = z.infer<typeof pageQuerySchema>;

export function parsePageFromUrl(url: string) {
  const u = new URL(url);
  return pageQuerySchema.parse({ page: u.searchParams.get("page") ?? 1 });
}
