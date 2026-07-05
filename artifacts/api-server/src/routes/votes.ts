import { Router } from "express";
import { db, votesTable } from "@workspace/db";
import { eq, desc, sql, and, gt } from "drizzle-orm";

const router = Router();

const VOTE_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

function getClientIp(req: any): string {
  // req.ip is set by Express when trust proxy is configured, reflecting the real client IP
  return req.ip || req.socket?.remoteAddress || "unknown";
}

async function getStats() {
  const rows = await db.select().from(votesTable);
  const upvotes = rows.filter((r) => r.voteType === "up").length;
  const downvotes = rows.filter((r) => r.voteType === "down").length;
  const total = rows.length;
  const percentage = total > 0 ? Math.round((upvotes / total) * 100) : 0;
  return { upvotes, downvotes, total, percentage };
}

// GET /votes/stats
router.get("/votes/stats", async (req, res) => {
  try {
    const stats = await getStats();
    res.json(stats);
  } catch (err) {
    req.log.error({ err }, "Failed to get vote stats");
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// GET /votes/status - check if current IP can vote
router.get("/votes/status", async (req, res) => {
  const ip = getClientIp(req);
  try {
    const oneHourAgo = new Date(Date.now() - VOTE_COOLDOWN_MS);
    const recent = await db
      .select()
      .from(votesTable)
      .where(and(eq(votesTable.ipAddress, ip), gt(votesTable.createdAt, oneHourAgo)))
      .orderBy(desc(votesTable.createdAt))
      .limit(1);

    if (recent.length === 0) {
      res.json({
        canVote: true,
        nextVoteAt: null,
        secondsRemaining: 0,
        lastVoteType: null,
      });
      return;
    }

    const lastVote = recent[0];
    const nextVoteAt = new Date(lastVote.createdAt.getTime() + VOTE_COOLDOWN_MS);
    const secondsRemaining = Math.max(0, Math.ceil((nextVoteAt.getTime() - Date.now()) / 1000));

    res.json({
      canVote: false,
      nextVoteAt: nextVoteAt.toISOString(),
      secondsRemaining,
      lastVoteType: lastVote.voteType,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get vote status");
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// POST /votes - cast a vote
router.post("/votes", async (req, res) => {
  const { type, username } = req.body;
  const ip = getClientIp(req);

  if (!type || !["up", "down"].includes(type)) {
    res.status(400).json({ error: "Tipo de voto inválido. Usa 'up' o 'down'." });
    return;
  }

  if (!username || typeof username !== "string") {
    res.status(400).json({ error: "Se requiere nombre de usuario." });
    return;
  }

  try {
    // Check cooldown
    const oneHourAgo = new Date(Date.now() - VOTE_COOLDOWN_MS);
    const recent = await db
      .select()
      .from(votesTable)
      .where(and(eq(votesTable.ipAddress, ip), gt(votesTable.createdAt, oneHourAgo)))
      .orderBy(desc(votesTable.createdAt))
      .limit(1);

    if (recent.length > 0) {
      const lastVote = recent[0];
      const nextVoteAt = new Date(lastVote.createdAt.getTime() + VOTE_COOLDOWN_MS);
      const secondsRemaining = Math.max(0, Math.ceil((nextVoteAt.getTime() - Date.now()) / 1000));

      res.status(429).json({
        error: "Debes esperar 1 hora entre cada voto.",
        nextVoteAt: nextVoteAt.toISOString(),
        secondsRemaining,
      });
      return;
    }

    // Record vote
    await db.insert(votesTable).values({
      ipAddress: ip,
      username,
      voteType: type,
    });

    const stats = await getStats();
    const nextVoteAt = new Date(Date.now() + VOTE_COOLDOWN_MS);

    res.json({
      success: true,
      message: type === "up" ? "¡Voto positivo registrado!" : "Voto negativo registrado.",
      stats,
      nextVoteAt: nextVoteAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to cast vote");
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

export default router;
