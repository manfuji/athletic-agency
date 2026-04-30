import { ServiceError } from "@/server/errors/serviceError";
import { formFile, formString } from "@/server/lib/formDataParse";
import type { IStorageRepository } from "@/server/repositories/storageRepository";
import type { IPlayerRepository, PlayerRowInsert } from "@/server/repositories/playerRepository";

const DEFAULT_PER_PAGE = 15;
const UPLOAD_BUCKET = "uploads";

function buildSections(
  bio: string | null,
  prev: string | null,
  reason: string | null
) {
  const sections: { title: string; content: string }[] = [];
  if (bio) sections.push({ title: "bio", content: bio });
  if (prev) sections.push({ title: "previous experience", content: prev });
  if (reason) sections.push({ title: "reason for joining", content: reason });
  return sections;
}

export class PlayerService {
  constructor(
    private readonly players: IPlayerRepository,
    private readonly storage: IStorageRepository
  ) {}

  listWithoutTeam(page: number) {
    return this.players.listWithoutTeam(page, DEFAULT_PER_PAGE);
  }

  listAll(page: number) {
    return this.players.listAll(page, DEFAULT_PER_PAGE);
  }

  async getById(playerId: string, competitionId: string | null) {
    return this.players.findByIdWithOptionalStats(playerId, competitionId);
  }

  private async uploadProfile(
    formData: FormData,
    folder: string
  ): Promise<string | null> {
    const file =
      formFile(formData, "profile_picture") || formFile(formData, "image");
    if (!file) return null;
    const res = await this.storage.uploadPublicObject(UPLOAD_BUCKET, folder, file);
    return res.path;
  }

  private parsePlayerRow(
    formData: FormData,
    teamId: string | null,
    profilePath: string | null
  ): PlayerRowInsert {
    const name = formString(formData, "name");
    if (!name) throw new ServiceError("Name is required", 400);

    const dob = formString(formData, "dob");
    if (!dob) throw new ServiceError("Date of birth is required", 400);

    const nationality =
      formString(formData, "nationality") || formString(formData, "country");
    if (!nationality) throw new ServiceError("Nationality is required", 400);

    const height = formString(formData, "height");
    const weight = formString(formData, "weight");
    if (!height || !weight) {
      throw new ServiceError("Height and weight are required", 400);
    }

    const position = formString(formData, "position");
    if (!position) throw new ServiceError("Position is required", 400);

    const preferred_foot =
      formString(formData, "preferred_foot") ||
      formString(formData, "preferredFoot");
    if (!preferred_foot) throw new ServiceError("Preferred foot is required", 400);

    const bio = formString(formData, "bio");
    const previous_experience =
      formString(formData, "previous_experience") ||
      formString(formData, "experience");
    const reason_for_joining =
      formString(formData, "reason_for_joining") ||
      formString(formData, "reason");

    const sections = buildSections(bio, previous_experience, reason_for_joining);

    const row: PlayerRowInsert = {
      name,
      dob,
      nationality,
      height,
      weight,
      bio: bio ?? null,
      position,
      preferred_foot,
      previous_experience: previous_experience ?? null,
      reason_for_joining: reason_for_joining ?? null,
      team_id: teamId,
      sections,
    };

    if (profilePath) row.profile_picture = profilePath;
    return row;
  }

  async createStandalone(formData: FormData) {
    const folder = `players/${crypto.randomUUID()}`;
    const profilePath = await this.uploadProfile(formData, folder);
    const row = this.parsePlayerRow(formData, null, profilePath);
    const { id } = await this.players.insertPlayer(row);
    return { message: "Player created successfully", id };
  }

  async createForTeam(teamId: string, formData: FormData) {
    const folder = `players/${crypto.randomUUID()}`;
    const profilePath = await this.uploadProfile(formData, folder);
    const row = this.parsePlayerRow(formData, teamId, profilePath);
    const { id } = await this.players.insertPlayer(row);
    return { message: "Player created successfully", id };
  }

  async updatePlayer(playerId: string, formData: FormData) {
    const existing = await this.players.findByIdWithOptionalStats(
      playerId,
      null
    );
    const folder = `players/${playerId}`;
    let profilePath: string | null =
      (existing.profile_picture as string | null) ?? null;
    const newFile = await this.uploadProfile(formData, folder);
    if (newFile) profilePath = newFile;

    const row = this.parsePlayerRow(
      formData,
      (existing.team_id as string | null) ?? null,
      profilePath
    );
    await this.players.updatePlayer(playerId, row);
    return { message: "Player updated successfully" };
  }

  async updateTeamPlayer(
    teamId: string,
    playerId: string,
    formData: FormData
  ) {
    const existing = await this.players.findByIdWithOptionalStats(
      playerId,
      null
    );
    if (existing.team_id !== teamId) {
      throw new ServiceError("Player is not on this team", 403);
    }
    return this.updatePlayer(playerId, formData);
  }

  async assignToTeam(teamId: string, playerId: string) {
    await this.players.setTeamId(playerId, teamId);
    return { message: "Player assigned to team" };
  }

  async removeFromTeam(playerId: string) {
    await this.players.setTeamId(playerId, null);
    return { message: "Player removed from team" };
  }

  async deletePlayer(playerId: string) {
    await this.players.deletePlayer(playerId);
    return { message: "Player deleted successfully" };
  }
}
