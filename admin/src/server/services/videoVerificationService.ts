import type { IVideoVerificationRepository } from "@/server/repositories/videoVerificationRepository";

export class VideoVerificationService {
  constructor(private readonly vv: IVideoVerificationRepository) {}

  list(params: {
    page: number;
    matchId?: string | null;
    playerId?: string | null;
    statTable?: string | null;
  }) {
    return this.vv.list({
      page: params.page,
      perPage: 25,
      matchId: params.matchId ?? null,
      playerId: params.playerId ?? null,
      statTable: params.statTable ?? null,
    });
  }
}

