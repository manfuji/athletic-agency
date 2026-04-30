import { ServiceError } from "@/server/errors/serviceError";
import type { INewsRepository } from "@/server/repositories/newsRepository";

export class NewsService {
  constructor(private readonly news: INewsRepository) {}

  list() {
    return this.news.list();
  }

  async getById(id: string) {
    const row = await this.news.findById(id);
    if (!row) throw new ServiceError("News not found", 404);
    return row;
  }

  async getBySlug(slug: string) {
    const row = await this.news.findBySlug(slug);
    if (!row) throw new ServiceError("News not found", 404);
    return row;
  }

  create(payload: Record<string, unknown>) {
    return this.news.insert(payload);
  }

  update(id: string, payload: Record<string, unknown>) {
    return this.news.update(id, payload);
  }

  async deleteNews(id: string) {
    await this.news.deleteById(id);
    return { message: "News deleted" };
  }
}
