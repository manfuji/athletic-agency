import { ServiceError } from "@/server/errors/serviceError";
import { formFile, formString, uniqueSlug } from "@/server/lib/formDataParse";
import type { IStorageRepository } from "@/server/repositories/storageRepository";
import type { ITeamRepository, TeamInsert } from "@/server/repositories/teamRepository";

const UPLOAD_BUCKET = "uploads";

export class TeamService {
  constructor(
    private readonly teams: ITeamRepository,
    private readonly storage: IStorageRepository
  ) {}

  list() {
    return this.teams.listSummary();
  }

  async getById(teamId: string) {
    const row = await this.teams.findByIdWithPlayers(teamId);
    if (!row) throw new ServiceError("Team not found", 404);
    return row;
  }

  listPlayers(teamId: string) {
    return this.teams.listPlayersForTeam(teamId);
  }

  private async uploadTeamAsset(
    formData: FormData,
    field: "logo" | "coverPhoto",
    folder: string
  ): Promise<string | null> {
    const file = formFile(formData, field);
    if (!file) return null;
    const res = await this.storage.uploadPublicObject(UPLOAD_BUCKET, folder, file);
    return res.path;
  }

  async createFromForm(formData: FormData) {
    const name = formString(formData, "name");
    const shortCode = formString(formData, "shortCode");
    const category_id = formString(formData, "category_id");
    if (!name || !shortCode || !category_id) {
      throw new ServiceError("name, shortCode and category_id are required", 400);
    }

    const folder = `teams/${crypto.randomUUID()}`;
    const logo =
      (await this.uploadTeamAsset(formData, "logo", folder)) ?? null;
    const coverPhoto =
      (await this.uploadTeamAsset(formData, "coverPhoto", folder)) ?? null;

    const row: TeamInsert = {
      name,
      shortCode,
      slug: uniqueSlug(name),
      category_id,
      description: formString(formData, "description"),
      logo,
      coverPhoto,
    };

    const { id } = await this.teams.insertTeam(row);
    return { message: "Team created successfully", id };
  }

  async updateFromForm(teamId: string, formData: FormData) {
    const folder = `teams/${teamId}`;
    const logo = await this.uploadTeamAsset(formData, "logo", folder);
    const coverPhoto = await this.uploadTeamAsset(formData, "coverPhoto", folder);

    const patch: Partial<TeamInsert> = {};
    const name = formString(formData, "name");
    const shortCode = formString(formData, "shortCode");
    const category_id = formString(formData, "category_id");
    const description = formString(formData, "description");
    if (name != null) patch.name = name;
    if (shortCode != null) patch.shortCode = shortCode;
    if (category_id != null) patch.category_id = category_id;
    if (description != null) patch.description = description;
    if (logo != null) patch.logo = logo;
    if (coverPhoto != null) patch.coverPhoto = coverPhoto;

    if (Object.keys(patch).length === 0) {
      throw new ServiceError("No fields to update", 400);
    }

    await this.teams.updateTeam(teamId, patch);
    return { message: "Team updated successfully" };
  }

  async deleteTeam(teamId: string) {
    await this.teams.deleteTeam(teamId);
    return { message: "Team deleted successfully" };
  }
}
