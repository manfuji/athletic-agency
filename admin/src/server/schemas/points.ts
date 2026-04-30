import { z } from "zod";

export const pointsConfigCreateSchema = z.object({
  win_points: z.number().int().min(0).default(3),
  draw_points: z.number().int().min(0).default(1),
  loss_points: z.number().int().min(0).default(0),
  tie_break_order: z.array(z.string()).min(1).default([
    "points",
    "goal_difference",
    "goals_for",
  ]),
  is_active: z.boolean().optional().default(true),
});

export const pointsConfigUpdateSchema = z
  .object({
    win_points: z.number().int().min(0).optional(),
    draw_points: z.number().int().min(0).optional(),
    loss_points: z.number().int().min(0).optional(),
    tie_break_order: z.array(z.string()).min(1).optional(),
    is_active: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: "At least one field is required",
  });
