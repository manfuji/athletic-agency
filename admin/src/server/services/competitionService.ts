import { ServiceError } from "@/server/errors/serviceError";
import { formFile, formString, uniqueSlug } from "@/server/lib/formDataParse";
import type {
  ICompetitionRepository,
  ICompetitionTeamRepository,
} from "@/server/repositories/competitionRepository";
import type { IPlayerRepository } from "@/server/repositories/playerRepository";
import type { IStorageRepository } from "@/server/repositories/storageRepository";
import type { IStructureRepository } from "@/server/repositories/structureRepository";
import type { TeamService } from "@/server/services/teamService";

const DEFAULT_PER_PAGE = 15;
const UPLOAD_BUCKET = "uploads";
const importProgressStore = new Map<
  string,
  {
    competition_id: string;
    status: "pending" | "processing" | "success" | "failed";
    progress: number;
    message?: string;
    link?: string | null;
    updated_at: string;
  }
>();

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "id,name,team_id,position\n";
  const keys = Array.from(
    rows.reduce((acc, r) => {
      Object.keys(r).forEach((k) => acc.add(k));
      return acc;
    }, new Set<string>())
  );
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
    private readonly players: IPlayerRepository
  ) {}

  list() {
    return this.competitions.listAll();
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

  async importStats(competitionId: string, formData: FormData) {
    const file = formFile(formData, "file");
    if (!file) throw new ServiceError("file is required", 400);

    importProgressStore.set(competitionId, {
      competition_id: competitionId,
      status: "pending",
      progress: 5,
      message: "Import queued",
      updated_at: new Date().toISOString(),
    });

    const folder = `imports/${competitionId}`;
    await this.storage.uploadPublicObject(UPLOAD_BUCKET, folder, file);

    importProgressStore.set(competitionId, {
      competition_id: competitionId,
      status: "processing",
      progress: 45,
      message: "Import is processing",
      updated_at: new Date().toISOString(),
    });

    // Simulate asynchronous completion until a real background worker is added.
    setTimeout(() => {
      importProgressStore.set(competitionId, {
        competition_id: competitionId,
        status: "success",
        progress: 100,
        message: "Import completed",
        updated_at: new Date().toISOString(),
      });
    }, 800);

    return {
      message: "Import received",
      status: "pending",
      progress: 5,
    };
  }

  async getImportProgress(competitionId: string) {
    return (
      importProgressStore.get(competitionId) ?? {
        competition_id: competitionId,
        status: "pending",
        progress: 0,
        message: "No import started",
        updated_at: new Date().toISOString(),
      }
    );
  }

  async exportPlayersCsv(competitionId: string): Promise<string> {
    const teamIds =
      await this.competitionTeams.listTeamIdsInCompetition(competitionId);
    const players = await this.players.listByTeamIds(teamIds);
    return toCsv(players as Record<string, unknown>[]);
  }

}
