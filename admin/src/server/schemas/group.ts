import { z } from "zod";

export const groupSetupBodySchema = z.object({
  group_name: z.string().min(1),
  team_id: z.array(z.string().min(1)).min(1),
  competition_id: z.string().min(1),
  stage_id: z.string().min(1),
});

export const groupUpdateBodySchema = z.object({
  group_name: z.string().min(1),
  team_id: z.array(z.string().min(1)).min(1),
  stage_id: z.string().min(1),
});
