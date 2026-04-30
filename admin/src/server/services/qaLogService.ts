import type { IQaLogRepository, QaLogInsert } from "@/server/repositories/qaLogRepository";

export class QaLogService {
  constructor(private readonly qa: IQaLogRepository) {}

  insert(row: QaLogInsert) {
    return this.qa.insert(row);
  }

  list(params: {
    page: number;
    tableName?: string | null;
    recordId?: string | null;
    perPage?: number;
  }) {
    return this.qa.list({
      page: params.page,
      perPage: params.perPage ?? 25,
      tableName: params.tableName ?? null,
      recordId: params.recordId ?? null,
    });
  }
}

