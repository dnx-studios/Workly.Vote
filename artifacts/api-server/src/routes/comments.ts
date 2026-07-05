import { Router } from "express";
import { db, commentsTable, commentReactionsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";

const router = Router();

// GET /comments?username=xxx — list comments with reaction counts
router.get("/comments", async (req, res) => {
  const { username } = req.query as { username?: string };

  try {
    const comments = await db
      .select()
      .from(commentsTable)
      .orderBy(desc(commentsTable.createdAt));

    const reactions = await db.select().from(commentReactionsTable);

    const enriched = comments.map((c) => {
      const cReactions = reactions.filter((r) => r.commentId === c.id);
      const likes = cReactions.filter((r) => r.reactionType === "like").length;
      const dislikes = cReactions.filter((r) => r.reactionType === "dislike").length;
      const userReaction = username
        ? (cReactions.find((r) => r.username === username)?.reactionType ?? null)
        : null;

      return {
        id: c.id,
        username: c.username,
        content: c.content,
        hasStar: c.hasStar,
        hasHeart: c.hasHeart,
        likes,
        dislikes,
        userReaction,
        createdAt: c.createdAt.toISOString(),
      };
    });

    res.json(enriched);
  } catch (err) {
    console.error("GET /comments error:", err);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// POST /comments — create a comment
router.post("/comments", async (req, res) => {
  const { username, content } = req.body;

  if (!username || typeof username !== "string") {
    res.status(400).json({ error: "Nombre de usuario requerido." });
    return;
  }
  if (!content || typeof content !== "string" || content.trim().length === 0 || content.length > 500) {
    res.status(400).json({ error: "El mensaje debe tener entre 1 y 500 caracteres." });
    return;
  }

  try {
    const [comment] = await db
      .insert(commentsTable)
      .values({ username: username.trim(), content: content.trim() })
      .returning();

    res.status(201).json({
      id: comment.id,
      username: comment.username,
      content: comment.content,
      hasStar: comment.hasStar,
      hasHeart: comment.hasHeart,
      likes: 0,
      dislikes: 0,
      userReaction: null,
      createdAt: comment.createdAt.toISOString(),
    });
  } catch (err) {
    console.error("POST /comments error:", err);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// POST /comments/:id/react — like or dislike a comment (toggle)
router.post("/comments/:id/react", async (req, res) => {
  const commentId = parseInt(req.params.id, 10);
  const { username, type } = req.body;

  if (!username || typeof username !== "string") {
    res.status(400).json({ error: "Nombre de usuario requerido." });
    return;
  }
  if (type !== "like" && type !== "dislike") {
    res.status(400).json({ error: "Tipo de reacción inválido." });
    return;
  }
  if (isNaN(commentId)) {
    res.status(400).json({ error: "ID de comentario inválido." });
    return;
  }

  try {
    // Check if comment exists
    const comment = await db.select().from(commentsTable).where(eq(commentsTable.id, commentId)).limit(1);
    if (!comment.length) {
      res.status(404).json({ error: "Comentario no encontrado." });
      return;
    }

    // Check existing reaction
    const existing = await db
      .select()
      .from(commentReactionsTable)
      .where(
        and(
          eq(commentReactionsTable.commentId, commentId),
          eq(commentReactionsTable.username, username.trim())
        )
      )
      .limit(1);

    if (existing.length > 0 && existing[0].reactionType === type) {
      // Same type → toggle off (remove)
      await db
        .delete(commentReactionsTable)
        .where(eq(commentReactionsTable.id, existing[0].id));
      res.json({ action: "removed", type: null });
    } else {
      // Upsert (new reaction or change like→dislike)
      await db
        .insert(commentReactionsTable)
        .values({ commentId, username: username.trim(), reactionType: type })
        .onConflictDoUpdate({
          target: [commentReactionsTable.commentId, commentReactionsTable.username],
          set: { reactionType: type },
        });
      res.json({ action: "set", type });
    }
  } catch (err) {
    console.error("POST /comments/:id/react error:", err);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

export default router;
