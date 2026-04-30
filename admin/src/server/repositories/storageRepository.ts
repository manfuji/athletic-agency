import type { SupabaseClient } from "@supabase/supabase-js";
import { ServiceError } from "@/server/errors/serviceError";

export type UploadResult = {
  bucket: string;
  path: string;
  publicUrl: string;
};

export interface IStorageRepository {
  uploadPublicObject(
    bucket: string,
    pathPrefix: string,
    file: File
  ): Promise<UploadResult>;
}

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export class StorageSupabaseRepository implements IStorageRepository {
  constructor(private readonly db: SupabaseClient) {}

  async uploadPublicObject(
    bucket: string,
    pathPrefix: string,
    file: File
  ): Promise<UploadResult> {
    const id = crypto.randomUUID();
    const filename = safeName(file.name || "upload");
    const prefix = pathPrefix.replace(/^\/+|\/+$/g, "");
    const objectPath = [prefix, `${id}-${filename}`].filter(Boolean).join("/");

    const arrayBuffer = await file.arrayBuffer();
    const { error } = await this.db.storage
      .from(bucket)
      .upload(objectPath, arrayBuffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (error) throw new ServiceError(error.message, 500);

    const { data } = this.db.storage.from(bucket).getPublicUrl(objectPath);
    return {
      bucket,
      path: objectPath,
      publicUrl: data.publicUrl,
    };
  }
}
