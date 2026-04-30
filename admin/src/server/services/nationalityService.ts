import type { INationalityRepository, NationalityRow } from "@/server/repositories/nationalityRepository";

export class NationalityService {
  constructor(private readonly nationalities: INationalityRepository) {}

  list() {
    return this.nationalities.list();
  }

  create(payload: Omit<NationalityRow, "id">) {
    return this.nationalities.create(payload);
  }

  update(id: number, payload: Partial<Omit<NationalityRow, "id">>) {
    return this.nationalities.update(id, payload);
  }

  delete(id: number) {
    return this.nationalities.delete(id);
  }
}

