import { getPublicSiteUrl } from "@/lib/siteUrl";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ServiceError } from "@/server/errors/serviceError";
import type { ICollatorRepository } from "@/server/repositories/collatorRepository";

function parseRpcUuid(data: unknown): string | null {
  if (typeof data === "string" && data.length > 0) return data;
  if (data && typeof data === "object" && "find_auth_user_id_by_email" in data) {
    const v = (data as { find_auth_user_id_by_email: unknown })
      .find_auth_user_id_by_email;
    return typeof v === "string" && v.length > 0 ? v : null;
  }
  return null;
}

export class CollatorService {
  constructor(private readonly collators: ICollatorRepository) {}

  list(status?: string | null) {
    return this.collators.listCollators(status ?? null);
  }

  async register(body: Record<string, unknown>) {
    const first_name = String(body.first_name ?? "").trim();
    const last_name = String(body.last_name ?? "").trim();
    const emailNorm = String(body.email ?? "").trim().toLowerCase();
    const contact = body.contact ?? null;

    if (!first_name || !last_name || !emailNorm) {
      throw new ServiceError("first_name, last_name, and email are required", 400);
    }

    if (await this.collators.collatorEmailExists(emailNorm)) {
      throw new ServiceError("A collator with this email already exists", 409);
    }

    const admin = createSupabaseAdminClient();
    const redirectTo = `${getPublicSiteUrl()}/auth/callback?next=${encodeURIComponent("/")}`;

    const { data: invited, error: inviteErr } =
      await admin.auth.admin.inviteUserByEmail(emailNorm, {
        redirectTo,
        data: { first_name, last_name },
      });

    let userId = invited?.user?.id;
    let inviteSent = Boolean(userId && !inviteErr);

    if (inviteErr || !userId) {
      const { data: rpcData, error: rpcErr } = await admin.rpc(
        "find_auth_user_id_by_email",
        { p_email: emailNorm }
      );
      if (rpcErr) {
        throw new ServiceError(inviteErr?.message ?? rpcErr.message, 400);
      }
      const existingId = parseRpcUuid(rpcData);
      if (!existingId) {
        throw new ServiceError(
          inviteErr?.message ?? "Could not invite or link this email",
          400
        );
      }
      userId = existingId;
      inviteSent = false;
    }

    const { data: existingProfile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    const existingRole = existingProfile?.role
      ? String(existingProfile.role)
      : null;
    if (existingRole && existingRole !== "collator") {
      throw new ServiceError(
        "This email already belongs to a non-collator account",
        409
      );
    }

    const { error: profErr } = await admin.from("profiles").upsert(
      {
        id: userId,
        first_name,
        last_name,
        role: "collator",
      },
      { onConflict: "id" }
    );
    if (profErr) throw new ServiceError(profErr.message, 500);

    const { id: collatorId } = await this.collators.registerCollator({
      first_name,
      last_name,
      email: emailNorm,
      contact,
      user_id: userId,
    });

    return {
      id: collatorId,
      auth_user_id: userId,
      invite_sent: inviteSent,
      message: inviteSent
        ? "Invitation email sent. The collator should open the link to set their password."
        : "This email already had a Supabase account; collator was linked. Send a password reset from Supabase if they need a new login link.",
    };
  }

  async deleteCollator(id: string) {
    await this.collators.deleteCollator(id);
    return { message: "Collator deleted" };
  }

  listForCompetition(competitionId: string) {
    return this.collators.listForCompetition(competitionId);
  }

  async assignOne(competitionId: string, collatorId: string) {
    if (!collatorId) throw new ServiceError("collator_id is required", 400);
    await this.collators.assignToCompetition(competitionId, collatorId);
    return { message: "Collator assigned" };
  }

  async assignMany(competitionId: string, collatorIds: string[]) {
    if (!collatorIds?.length) {
      throw new ServiceError("collators array is required", 400);
    }
    await this.collators.assignManyToCompetition(competitionId, collatorIds);
    return { message: "Collators assigned" };
  }

  async removeFromCompetition(competitionId: string, collatorId: string) {
    await this.collators.removeFromCompetition(competitionId, collatorId);
    return { message: "Collator removed" };
  }
}
