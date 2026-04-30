import type { IFootPreferenceRepository, FootPreferenceRow } from "@/server/repositories/footPreferenceRepository";

export class FootPreferenceService {
  constructor(private readonly foot: IFootPreferenceRepository) {}

  list() {
    return this.foot.list();
  }

  create(payload: Omit<FootPreferenceRow, "id">) {
    return this.foot.create(payload);
  }

  update(id: number, payload: Partial<Omit<FootPreferenceRow, "id">>) {
    return this.foot.update(id, payload);
  }

  delete(id: number) {
    return this.foot.delete(id);
  }
}

