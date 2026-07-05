import { Router } from "express";
import { db, commentsTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router = Router();

// GET /comments - list all comments
router.get("/comments", async (req, res) => {
  try {
    const comments = await db.select().from(commentsTable).orderBy(desc(commentsTable.createdAt)).limit(100);

    res.json(
      comments.map((c) => ({
        id: c.id,
        username: c.username,
        content: c.content,
        createdAt: c.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list comments");
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// POST /comments - create a comment
router.post("/comments", async (req, res) => {
  const { username, content } = req.body;

  if (!username || typeof username !== "string" || username.trim().length === 0) {
    res.status(400).json({ error: "Se requiere nombre de usuario." });
    return;
  }

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    res.status(400).json({ error: "El comentario no puede estar vacío." });
    return;
  }

  if (content.trim().length > 500) {
    res.status(400).json({ error: "El comentario no puede tener más de 500 caracteres." });
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
      createdAt: comment.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create comment");
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

export default router;
