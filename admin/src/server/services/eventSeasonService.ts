import type { IEventSeasonRepository, EventSeasonRow } from "@/server/repositories/eventSeasonRepository";

export class EventSeasonService {
  constructor(private readonly seasons: IEventSeasonRepository) {}

  list() {
    return this.seasons.list();
  }

  create(payload: Omit<EventSeasonRow, "id" | "created_at">) {
    return this.seasons.create(payload);
  }

  update(
    id: number,
    payload: Partial<Omit<EventSeasonRow, "id" | "created_at">>
  ) {
    return this.seasons.update(id, payload);
  }

  delete(id: number) {
    return this.seasons.delete(id);
  }
}

