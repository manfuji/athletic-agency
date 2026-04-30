import { ServiceError } from "@/server/errors/serviceError";
import type { AppSession } from "@/server/auth/guard";
import type { LegacyTableName } from "@/server/schemas/legacyTable";
import type { ILegacyTableRepository } from "@/server/repositories/legacyTableRepository";
import type { QaLogService } from "@/server/services/qaLogService";

const DEFAULT_PER_PAGE = 25;

export class LegacyTableService {
  constructor(
    private readonly legacy: ILegacyTableRepository,
    private readonly qa: QaLogService
  ) {}

  list(params: { table: LegacyTableName; page: number; matchId?: string | null }) {
    return this.legacy.list({
      table: params.table,
      page: params.page,
      perPage: DEFAULT_PER_PAGE,
      matchId: params.matchId ?? null,
    });
  }

  async update(
    session: AppSession,
    table: LegacyTableName,
    id: string,
    patch: Record<string, unknown>,
    meta?: { issue_description?: string | null; evidence_reference?: string | null }
  ) {
    const existing = await this.legacy.getById(table, id);
    if (!existing) throw new ServiceError("Record not found", 404);

    await this.legacy.update(table, id, { ...patch, updated_at: new Date().toISOString() });

    await this.qa.insert({
      table_name: table,
      record_id: id,
      issue_description: meta?.issue_description?.trim() || "Admin legacy edit",
      old_value: JSON.stringify(existing),
      new_value: JSON.stringify({ ...existing, ...patch }),
      corrected_by: session.user.email ?? session.user.id,
      evidence_reference: meta?.evidence_reference ?? null,
    });

    return { message: "Updated" };
  }
}

