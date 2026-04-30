import type { IAffiliationRepository, AffiliationRow } from "@/server/repositories/affiliationRepository";

export class AffiliationService {
  constructor(private readonly affiliations: IAffiliationRepository) {}

  list() {
    return this.affiliations.list();
  }

  create(payload: Omit<AffiliationRow, "id">) {
    return this.affiliations.create(payload);
  }

  update(id: number, payload: Partial<Omit<AffiliationRow, "id">>) {
    return this.affiliations.update(id, payload);
  }

  delete(id: number) {
    return this.affiliations.delete(id);
  }
}

