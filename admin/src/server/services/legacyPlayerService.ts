import { ServiceError } from "@/server/errors/serviceError";
import type { ILegacyPlayerRepository } from "@/server/repositories/legacyPlayerRepository";

const DEFAULT_PER_PAGE = 20;

export class LegacyPlayerService {
  constructor(private readonly legacy: ILegacyPlayerRepository) {}

  listUnmappedBioData(page: number) {
    return this.legacy.listUnmappedBioData(page, DEFAULT_PER_PAGE);
  }

  async link(payload: { player_id: string; bio_data_id: string }) {
    const playerId = payload.player_id?.trim();
    const bioDataId = payload.bio_data_id?.trim();
    if (!playerId || !bioDataId) {
      throw new ServiceError("player_id and bio_data_id are required", 400);
    }
    await this.legacy.linkPlayerToBioData(playerId, bioDataId);
    return { message: "Linked successfully" };
  }

  async import(payload: { bio_data_id: string }) {
    const bioDataId = payload.bio_data_id?.trim();
    if (!bioDataId) throw new ServiceError("bio_data_id is required", 400);
    const { player_id } = await this.legacy.createPlayerFromBioData(bioDataId);
    return { message: "Imported successfully", player_id };
  }

  async unlink(payload: { bio_data_id: string }) {
    const bioDataId = payload.bio_data_id?.trim();
    if (!bioDataId) throw new ServiceError("bio_data_id is required", 400);
    await this.legacy.unlinkBioData(bioDataId);
    return { message: "Unlinked successfully" };
  }
}

