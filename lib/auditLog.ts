import "server-only";
import { prisma } from "@/lib/prisma";

// Fire-and-forget: audit logging must never break the action it's
// recording. Called at the end of a mutating /api/system/* route, after the
// real write already succeeded, with the session's own email as the actor.
export async function logAudit(
  actorEmail: string,
  action: "create" | "update" | "delete",
  entityType: string,
  entityId: string,
  summary: string
) {
  try {
    await prisma.auditLog.create({ data: { actorEmail, action, entityType, entityId, summary } });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}
