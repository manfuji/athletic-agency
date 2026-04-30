import { ServiceError } from "@/server/errors/serviceError";
import type { ICompetitionTypeRepository } from "@/server/repositories/competitionTypeRepository";

export class CompetitionTypeService {
  constructor(private readonly types: ICompetitionTypeRepository) {}

  list() {
    return this.types.listAll();
  }

  async create(name: string, description?: string) {
    if (!name?.trim()) throw new ServiceError("Name is required", 400);
    return this.types.insert({
      name: name.trim(),
      description: description ?? "",
    });
  }

  async updateType(id: string, payload: { name?: string; description?: string }) {
    if (!id) throw new ServiceError("Type id is required", 400);
    if (
      payload.name === undefined &&
      payload.description === undefined
    ) {
      throw new ServiceError("At least one field is required", 400);
    }
    return this.types.updateById(id, payload);
  }

  async deleteType(id: string) {
    await this.types.deleteById(id);
    return { message: "Competition type deleted" };
  }
}
