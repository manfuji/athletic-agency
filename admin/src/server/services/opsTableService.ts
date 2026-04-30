import { ServiceError } from "@/server/errors/serviceError";
import type { AppSession } from "@/server/auth/guard";
import type { OpsTableName } from "@/server/schemas/opsTable";
import type { IOpsTableRepository } from "@/server/repositories/opsTableRepository";
import type { QaLogService } from "@/server/services/qaLogService";

export class OpsTableService {
  constructor(
    private readonly ops: IOpsTableRepository,
    private readonly qa: QaLogService
  ) {}

  list(params: { table: OpsTableName; page: number }) {
    return this.ops.list({ table: params.table, page: params.page, perPage: 25 });
  }

  async update(
    session: AppSession,
    table: OpsTableName,
    id: string,
    patch: Record<string, unknown>,
    meta?: { issue_description?: string | null; evidence_reference?: string | null }
  ) {
    const existing = await this.ops.getById(table, id);
    if (!existing) throw new ServiceError("Record not found", 404);

    await this.ops.update(table, id, { ...patch, updated_at: new Date().toISOString() });

    await this.qa.insert({
      table_name: table,
      record_id: id,
      issue_description: meta?.issue_description?.trim() || "Admin ops edit",
      old_value: JSON.stringify(existing),
      new_value: JSON.stringify({ ...existing, ...patch }),
      corrected_by: session.user.email ?? session.user.id,
      evidence_reference: meta?.evidence_reference ?? null,
    });

    return { message: "Updated" };
  }
}

