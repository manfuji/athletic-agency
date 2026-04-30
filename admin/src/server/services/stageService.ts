import type { IStageRepository } from "@/server/repositories/stageRepository";

export class StageService {
  constructor(private readonly stages: IStageRepository) {}

  list() {
    return this.stages.listAll();
  }
}
