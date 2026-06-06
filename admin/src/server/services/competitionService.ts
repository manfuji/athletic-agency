import { ServiceError } from "@/server/errors/serviceError";
import { formFile, formString, uniqueSlug } from "@/server/lib/formDataParse";
import {
  parseUploadFile,
  statPatchFromRow,
  PLAYER_STATS_EXPORT_COLUMNS,
} from "@/server/lib/parseSpreadsheet";
import { STAT_COLUMN_KEYS } from "@/lib/playerStatistics";
import type {
  ICompetitionRepository,
  ICompetitionTeamRepository,
} from "@/server/repositories/competitionRepository";
import type { ICompetitionImportRepository } from "@/server/repositories/competitionImportRepository";
import type { IPlayerRepository } from "@/server/repositories/playerRepository";
import type { IStorageRepository } from "@/server/repositories/storageRepository";
import type { IStructureRepository } from "@/server/repositories/structureRepository";
import type { TeamService } from "@/server/services/teamService";

const DEFAULT_PER_PAGE = 15;
const UPLOAD_BUCKET = "uploads";

function toCsv(rows: Record<string, unknown>[], columns?: readonly string[]): string {
  const keys =
    columns ??
    Array.from(
      rows.reduce((acc, r) => {
        Object.keys(r).forEach((k) => acc.add(k));
        return acc;
      }, new Set<string>())
    );
  if (rows.length === 0) {
    return `${(columns ?? ["id", "name", "team_id", "position"]).join(",")}\n`;
  }
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [keys.join(",")];
  for (const r of rows) {
    lines.push(keys.map((k) => esc(r[k])).join(","));
  }
  return lines.join("\n");
}

export class CompetitionService {
  constructor(
    private readonly competitions: ICompetitionRepository,
    private readonly competitionTeams: ICompetitionTeamRepository,
    private readonly teamService: TeamService,
    private readonly storage: IStorageRepository,
    private readonly structures: IStructureRepository,
    private readonly players: IPlayerRepository,
    private readonly importJobs: ICompetitionImportRepository
  ) {}

  list() {
    return this.competitions.listAll();
  }

  listForCollatorUser(userId: string) {
    return this.competitions.listForCollatorUser(userId);
  }

  async getById(competitionId: string) {
    const row = await this.competitions.findById(competitionId);
    if (!row) throw new ServiceError("Competition not found", 404);
    return row;
  }

  updateStatus(competitionId: string, status: string) {
    return this.competitions.updateStatus(competitionId, status);
  }

  listTeams(competitionId: string, page: number) {
    return this.competitionTeams.listTeamsPaginated(
      competitionId,
      page,
      DEFAULT_PER_PAGE
    );
  }

  teamsNotInCompetition(competitionId: string) {
    return this.competitionTeams.listTeamsNotInCompetition(competitionId);
  }

  async addExistingTeam(competitionId: string, teamId: string) {
    if (!teamId) throw new ServiceError("team_id is required", 400);
    await this.competitionTeams.addTeamToCompetition(competitionId, teamId);
    return { message: "Team added to competition" };
  }

  async removeTeamFromCompetition(competitionId: string, teamId: string) {
    await this.competitionTeams.removeTeamFromCompetition(
      competitionId,
      teamId
    );
    return { message: "Team removed from competition" };
  }

  async createTeamInCompetition(competitionId: string, formData: FormData) {
    const created = await this.teamService.createFromForm(formData);
    await this.competitionTeams.addTeamToCompetition(
      competitionId,
      created.id as string
    );
    return created;
  }

  private async uploadBanner(
    formData: FormData,
    folder: string
  ): Promise<string | null> {
    const file = formFile(formData, "banner");
    if (!file) return null;
    const res = await this.storage.uploadPublicObject(
      UPLOAD_BUCKET,
      folder,
      file
    );
    return res.path;
  }

  async createFromMultipart(formData: FormData) {
    const title = formString(formData, "title");
    const category_id = formString(formData, "category_id");
    const start_date = formString(formData, "start_date");
    const end_date = formString(formData, "end_date");
    const location = formString(formData, "location");
    const competition_type_id = formString(formData, "competition_type_id");

    if (!title || !category_id || !start_date || !end_date || !location) {
      throw new ServiceError(
        "title, category_id, start_date, end_date, and location are required",
        400
      );
    }
    if (!competition_type_id) {
      throw new ServiceError("competition_type_id is required", 400);
    }

    const folder = `competitions/${crypto.randomUUID()}`;
    const banner = await this.uploadBanner(formData, folder);

    const row = {
      title,
      category_id,
      competition_type_id,
      start_date,
      end_date,
      location,
      description: formString(formData, "description"),
      banner,
      slug: uniqueSlug(title),
      ticket_url: formString(formData, "ticket_url"),
      status: "draft",
      is_published: false,
    };

    const created = await this.competitions.insert(row);
    return { competition: created };
  }

  async updateFromRequest(competitionId: string, req: Request) {
    const ct = req.headers.get("content-type") || "";
    if (ct.includes("multipart/form-data")) {
      const formData = await req.formData();
      const folder = `competitions/${competitionId}`;
      const banner = await this.uploadBanner(formData, folder);
      if (banner) {
        await this.competitions.update(competitionId, { banner });
      }
      return { message: "Competition updated" };
    }

    const body = (await req.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    const patch: Record<string, unknown> = {};

    const map: [string, string][] = [
      ["title", "title"],
      ["location", "location"],
      ["description", "description"],
      ["start_date", "start_date"],
      ["end_date", "end_date"],
      ["category_id", "category_id"],
      ["competition_type_id", "competition_type_id"],
    ];
    for (const [jsonKey, col] of map) {
      if (body[jsonKey] !== undefined && body[jsonKey] !== null) {
        patch[col] = body[jsonKey];
      }
    }

    if (Object.keys(patch).length === 0) {
      return { message: "No changes" };
    }

    await this.competitions.update(competitionId, patch);
    return { message: "Competition updated" };
  }

  async deleteCompetition(competitionId: string) {
    await this.competitions.deleteById(competitionId);
    return { message: "Competition deleted" };
  }

  async publish(competitionId: string, isPublished: boolean) {
    const row = await this.competitions.setPublished(
      competitionId,
      isPublished
    );
    return { message: "Publish state updated", data: row };
  }

  async patchStructure(competitionId: string, structureId: string) {
    if (!structureId) throw new ServiceError("structure_id is required", 400);
    await this.competitions.update(competitionId, {
      structure_id: structureId,
    });
    return { message: "Structure updated" };
  }

  listStructures() {
    return this.structures.listAll();
  }

  createStructure(input: { name: string; description: string }) {
    return this.structures.insert(input);
  }

  private async uploadImportErrorCsv(
    folder: string,
    errors: { row: number; message: string }[]
  ): Promise<string> {
    const errorCsv = toCsv(
      errors.map((e) => ({ row: e.row, message: e.message })),
      ["row", "message"]
    );
    const errorPath = `${folder}/errors-${Date.now()}.csv`;
    const errorBlob = new Blob([errorCsv], { type: "text/csv" });
    const errorFile = new File([errorBlob], "import-errors.csv", {
      type: "text/csv",
    });
    const uploaded = await this.storage.uploadPublicObject(
      UPLOAD_BUCKET,
      errorPath,
      errorFile
    );
    return uploaded.publicUrl;
  }

  async importStats(competitionId: string, formData: FormData) {
    const file = formFile(formData, "file");
    if (!file) throw new ServiceError("file is required", 400);

    await this.importJobs.upsert(competitionId, {
      status: "pending",
      progress: 5,
      message: "Import queued",
      error_file_path: null,
    });

    const folder = `imports/${competitionId}`;
    await this.storage.uploadPublicObject(UPLOAD_BUCKET, folder, file);

    await this.importJobs.upsert(competitionId, {
      status: "processing",
      progress: 10,
      message: "Parsing file",
    });

    try {
      const rows = await parseUploadFile(file);
      if (rows.length === 0) {
        throw new ServiceError("File contains no data rows", 400);
      }

      const teamIds =
        await this.competitionTeams.listTeamIdsInCompetition(competitionId);
      const competitionPlayers = await this.players.listByTeamIds(teamIds);
      const allowedIds = new Set(
        competitionPlayers.map((p) => String((p as { id: string }).id))
      );

      const errors: { row: number; message: string }[] = [];
      let processed = 0;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const playerId = (row.id ?? row.player_id ?? "").trim();
        if (!playerId) {
          errors.push({ row: i + 2, message: "Missing player id" });
          continue;
        }
        if (!allowedIds.has(playerId)) {
          errors.push({
            row: i + 2,
            message: "Player not in this competition",
          });
          continue;
        }

        const statPatch = statPatchFromRow(row);
        if (Object.keys(statPatch).length === 0) {
          errors.push({ row: i + 2, message: "No stat columns filled" });
          continue;
        }

        await this.players.upsertCompetitionPlayerStats(
          playerId,
          competitionId,
          statPatch
        );
        processed++;
        const progress = Math.min(
          95,
          10 + Math.round((processed / rows.length) * 85)
        );
        await this.importJobs.upsert(competitionId, {
          status: "processing",
          progress,
          message: `Imported ${processed} of ${rows.length} rows`,
        });
      }

      if (errors.length > 0 && processed === 0) {
        const errorUrl = await this.uploadImportErrorCsv(folder, errors);
        await this.importJobs.upsert(competitionId, {
          status: "failed",
          progress: 100,
          message: "Import failed",
          error_file_path: errorUrl,
        });
        return {
          message: "Import failed",
          status: "failed",
          progress: 100,
          link: errorUrl,
        };
      }

      if (errors.length > 0) {
        const errorUrl = await this.uploadImportErrorCsv(folder, errors);
        await this.importJobs.upsert(competitionId, {
          status: "failed",
          progress: 100,
          message: `Completed with ${errors.length} row errors`,
          error_file_path: errorUrl,
        });
        return {
          message: "Import completed with errors",
          status: "failed",
          progress: 100,
          link: errorUrl,
        };
      }

      await this.importJobs.upsert(competitionId, {
        status: "success",
        progress: 100,
        message: "Import completed",
        error_file_path: null,
      });

      return {
        message: "Import completed",
        status: "success",
        progress: 100,
      };
    } catch (e) {
      const message =
        e instanceof ServiceError ? e.message : "Import failed unexpectedly";
      await this.importJobs.upsert(competitionId, {
        status: "failed",
        progress: 100,
        message,
        error_file_path: null,
      });
      throw e instanceof ServiceError ? e : new ServiceError(message, 500);
    }
  }

  async getImportProgress(competitionId: string) {
    const job = await this.importJobs.get(competitionId);
    if (!job) {
      return {
        competition_id: competitionId,
        status: "pending" as const,
        progress: 0,
        message: "No import started",
        link: null as string | null,
        updated_at: new Date().toISOString(),
      };
    }
    return {
      competition_id: job.competition_id,
      status: job.status,
      progress: job.progress,
      message: job.message ?? undefined,
      link: job.error_file_path,
      updated_at: job.updated_at,
    };
  }

  async exportPlayersCsv(competitionId: string): Promise<string> {
    const teamIds =
      await this.competitionTeams.listTeamIdsInCompetition(competitionId);
    const players = await this.players.listByTeamIds(teamIds);
    const statsByPlayer =
      await this.players.listCompetitionStatsForExport(competitionId);

    const rows = (players as Record<string, unknown>[]).map((player) => {
      const playerId = String(player.id ?? "");
      const statsRow = statsByPlayer.get(playerId) ?? {};
      const statValues = Object.fromEntries(
        STAT_COLUMN_KEYS.map((key) => [key, statsRow[key] ?? ""])
      );
      return {
        id: playerId,
        name: player.name ?? "",
        team_id: player.team_id ?? "",
        position: player.position ?? "",
        ...statValues,
      };
    });

    return toCsv(rows, PLAYER_STATS_EXPORT_COLUMNS);
  }

}
