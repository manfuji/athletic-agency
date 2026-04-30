import { ServiceError } from "@/server/errors/serviceError";
import type { IStorageRepository } from "@/server/repositories/storageRepository";

export class StorageService {
  constructor(private readonly storage: IStorageRepository) {}

  async uploadFromForm(formData: FormData) {
    const file = formData.get("file");
    const bucket = String(formData.get("bucket") || "uploads");
    const pathPrefix = String(formData.get("pathPrefix") || "");

    if (!(file instanceof File)) {
      throw new ServiceError("Missing file", 400);
    }
    if (!bucket) {
      throw new ServiceError("Missing bucket", 400);
    }

    return this.storage.uploadPublicObject(bucket, pathPrefix, file);
  }
}
