import type { IPositionRepository, PositionRow } from "@/server/repositories/positionRepository";

export class PositionService {
  constructor(private readonly positions: IPositionRepository) {}

  list() {
    return this.positions.list();
  }

  create(payload: Omit<PositionRow, "id">) {
    return this.positions.create(payload);
  }

  update(id: number, payload: Partial<Omit<PositionRow, "id">>) {
    return this.positions.update(id, payload);
  }

  delete(id: number) {
    return this.positions.delete(id);
  }
}

