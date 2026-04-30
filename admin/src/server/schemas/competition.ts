import { z } from "zod";

export const competitionStatusBodySchema = z.object({
  status: z.string().min(1, "Missing status"),
});

export type CompetitionStatusBody = z.infer<typeof competitionStatusBodySchema>;

export const competitionPublishBodySchema = z.object({
  isPublished: z.boolean(),
});

export const competitionStructurePatchSchema = z.object({
  structure_id: z.string().min(1, "Missing structure_id"),
});
