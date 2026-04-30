import { ServiceError } from "@/server/errors/serviceError";
import type { AppSession } from "@/server/auth/guard";
import type { IBioDataRepository, BioDataUpdatePatch } from "@/server/repositories/bioDataRepository";
import type { QaLogService } from "@/server/services/qaLogService";

const DEFAULT_PER_PAGE = 25;

export class BioDataService {
  constructor(
    private readonly bio: IBioDataRepository,
    private readonly qa: QaLogService
  ) {}

  list(params: {
    page: number;
    q?: string | null;
    seasonId?: number | null;
    teamId?: string | null;
  }) {
    return this.bio.listPaged({
      page: params.page,
      perPage: DEFAULT_PER_PAGE,
      q: params.q ?? null,
      seasonId: params.seasonId ?? null,
      teamId: params.teamId ?? null,
    });
  }

  getById(bioDataId: string) {
    return this.bio.getById(bioDataId);
  }

  async update(
    session: AppSession,
    bioDataId: string,
    patch: BioDataUpdatePatch,
    meta?: { issue_description?: string | null; evidence_reference?: string | null }
  ) {
    const existing = await this.bio.getById(bioDataId);
    if (!existing) throw new ServiceError("Bio data not found", 404);

    await this.bio.update(bioDataId, patch);

    const oldValue = JSON.stringify(existing);
    const newValue = JSON.stringify({ ...existing, ...patch });

    await this.qa.insert({
      table_name: "bio_data",
      record_id: bioDataId,
      issue_description: meta?.issue_description?.trim() || "Admin edit",
      old_value: oldValue,
      new_value: newValue,
      corrected_by: session.user.email ?? session.user.id,
      evidence_reference: meta?.evidence_reference ?? null,
    });

    return { message: "Bio data updated" };
  }
}

