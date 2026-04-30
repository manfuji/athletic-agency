import crypto from "crypto";
import { ServiceError } from "@/server/errors/serviceError";
import type { IApiKeyRepository } from "@/server/repositories/apiKeyRepository";

function generateApiKey(): string {
  // 32 bytes -> 64 hex chars
  return crypto.randomBytes(32).toString("hex");
}

function hashApiKey(raw: string): string {
  return crypto.createHash("sha256").update(raw, "utf8").digest("hex");
}

export class ApiKeyService {
  constructor(private readonly keys: IApiKeyRepository) {}

  list() {
    return this.keys.list();
  }

  async create(label?: string | null) {
    const raw = generateApiKey();
    const key_hash = hashApiKey(raw);
    const row = await this.keys.insert({ key_hash, label: label ?? null, is_active: true });
    // Return raw key once; never store it.
    return { ...row, api_key: raw };
  }

  async setActive(id: string, is_active: boolean) {
    if (!id) throw new ServiceError("id is required", 400);
    return this.keys.update(id, { is_active });
  }

  async rename(id: string, label: string | null) {
    if (!id) throw new ServiceError("id is required", 400);
    return this.keys.update(id, { label });
  }

  async delete(id: string) {
    if (!id) throw new ServiceError("id is required", 400);
    await this.keys.delete(id);
    return { message: "Deleted" };
  }
}

