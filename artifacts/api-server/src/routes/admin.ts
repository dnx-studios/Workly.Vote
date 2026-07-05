import { Router } from "express";
import { db, votesTable, commentsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import crypto from "crypto";

const router = Router();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? "Dinox";

/**
 * Derive a deterministic admin token from SESSION_SECRET.
 * Never sent to the client directly — the client must POST /admin/session
 * with the correct admin username to receive it.
 */
function getAdminToken(): string {
  const secret = process.env.SESSION_SECRET ?? "fallback-dev-only-secret";
  return crypto
    .createHmac("sha256", secret)
    .update(`admin:${ADMIN_USERNAME}`)
    .digest("hex");
}

/**
 * Verify the X-Admin-Token header is the HMAC-signed token.
 * This is the only trusted admin check — client-supplied username is NOT trusted.
 */
function adminGuard(req: any, res: any): boolean {
  const token = req.headers["x-admin-token"];
  if (!token || token !== getAdminToken()) {
    res.status(403).json({ error: "Acceso denegado." });
    return false;
  }
  return true;
}

// POST /admin/session — exchange admin username for a signed token
// Only works when the provided username exactly matches ADMIN_USERNAME.
router.post("/admin/session", (req, res) => {
  const { username } = req.body;
  if (typeof username !== "string" || username.trim() !== ADMIN_USERNAME) {
    res.status(403).json({ error: "Acceso denegado." });
    return;
  }
  res.json({ token: getAdminToken() });
});

// GET /admin/votes — list all votes (requires valid admin token)
router.get("/admin/votes", async (req, res) => {
  if (!adminGuard(req, res)) return;

  try {
    const votes = await db
      .select()
      .from(votesTable)
      .orderBy(desc(votesTable.createdAt));

    res.json(
      votes.map((v) => ({
        id: v.id,
        ipAddress: v.ipAddress,
        username: v.username,
        voteType: v.voteType,
        createdAt: v.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    console.error("GET /admin/votes error:", err);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// DELETE /admin/comments/:id — delete a comment (requires valid admin token)
router.delete("/admin/comments/:id", async (req, res) => {
  if (!adminGuard(req, res)) return;

  const commentId = parseInt(req.params.id, 10);
  if (isNaN(commentId)) {
    res.status(400).json({ error: "ID inválido." });
    return;
  }

  try {
    const deleted = await db
      .delete(commentsTable)
      .where(eq(commentsTable.id, commentId))
      .returning();

    if (!deleted.length) {
      res.status(404).json({ error: "Comentario no encontrado." });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /admin/comments/:id error:", err);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// POST /admin/comments/:id/star — atomic star toggle (requires valid admin token)
router.post("/admin/comments/:id/star", async (req, res) => {
  if (!adminGuard(req, res)) return;

  const commentId = parseInt(req.params.id, 10);
  if (isNaN(commentId)) {
    res.status(400).json({ error: "ID inválido." });
    return;
  }

  try {
    // Atomic toggle — no read-then-write race condition
    const [updated] = await db
      .update(commentsTable)
      .set({ hasStar: sql`NOT ${commentsTable.hasStar}` })
      .where(eq(commentsTable.id, commentId))
      .returning({ hasStar: commentsTable.hasStar });

    if (!updated) {
      res.status(404).json({ error: "Comentario no encontrado." });
      return;
    }
    res.json({ success: true, hasStar: updated.hasStar });
  } catch (err) {
    console.error("POST /admin/comments/:id/star error:", err);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// POST /admin/comments/:id/heart — atomic heart toggle (requires valid admin token)
router.post("/admin/comments/:id/heart", async (req, res) => {
  if (!adminGuard(req, res)) return;

  const commentId = parseInt(req.params.id, 10);
  if (isNaN(commentId)) {
    res.status(400).json({ error: "ID inválido." });
    return;
  }

  try {
    // Atomic toggle — no read-then-write race condition
    const [updated] = await db
      .update(commentsTable)
      .set({ hasHeart: sql`NOT ${commentsTable.hasHeart}` })
      .where(eq(commentsTable.id, commentId))
      .returning({ hasHeart: commentsTable.hasHeart });

    if (!updated) {
      res.status(404).json({ error: "Comentario no encontrado." });
      return;
    }
    res.json({ success: true, hasHeart: updated.hasHeart });
  } catch (err) {
    console.error("POST /admin/comments/:id/heart error:", err);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

export default router;
