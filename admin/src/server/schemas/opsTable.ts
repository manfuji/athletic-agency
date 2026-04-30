import { z } from "zod";

export const opsTableNameSchema = z.enum([
  "evaluators",
  "evaluation_sessions",
  "player_evaluations",
  "top64_selection",
  "draft_events",
  "draft_picks",
  "api_import_log",
  "google_sheets_import",
  "partner_live_cache",
]);

export type OpsTableName = z.infer<typeof opsTableNameSchema>;

export const opsTableUpdateBodySchema = z.object({
  id: z.string().uuid(),
  patch: z.record(z.string(), z.unknown()),
  issue_description: z.string().nullable().optional(),
  evidence_reference: z.string().nullable().optional(),
});

