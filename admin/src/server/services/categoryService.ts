import { ServiceError } from "@/server/errors/serviceError";
import type { CategoryBody } from "@/server/schemas/category";
import type { ICategoryRepository } from "@/server/repositories/categoryRepository";

export class CategoryService {
  constructor(private readonly categories: ICategoryRepository) {}

  list() {
    return this.categories.listAll();
  }

  create(body: CategoryBody) {
    return this.categories.insert(body);
  }

  async update(id: string, body: CategoryBody) {
    const row = await this.categories.update(id, body);
    if (!row) throw new ServiceError("Category not found", 404);
    return row;
  }

  async deleteCategory(id: string) {
    await this.categories.deleteById(id);
    return { message: "Category deleted" };
  }
}
