import { z } from "zod";

export const registerCollatorBodySchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  contact: z.string().optional().nullable(),
});

export const assignCollatorsBodySchema = z.object({
  collators: z.array(z.string().min(1)).min(1),
});

export const assignOneCollatorBodySchema = z.object({
  collator_id: z.string().min(1),
});

export const removeCollatorBodySchema = z.object({
  collator_id: z.string().min(1),
});
