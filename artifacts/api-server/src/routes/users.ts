import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// POST /users - create or retrieve user by username
router.post("/users", async (req, res) => {
  const { username } = req.body;

  if (!username || typeof username !== "string" || username.length < 2 || username.length > 30) {
    res.status(400).json({ error: "El nombre de usuario debe tener entre 2 y 30 caracteres." });
    return;
  }

  const sanitized = username.trim();
  if (!/^[a-zA-Z0-9_\-]+$/.test(sanitized)) {
    res.status(400).json({ error: "El nombre de usuario solo puede contener letras, números, guiones y guiones bajos." });
    return;
  }

  try {
    // Check if user already exists
    const existing = await db.select().from(usersTable).where(eq(usersTable.username, sanitized)).limit(1);

    if (existing.length > 0) {
      res.json({
        id: existing[0].id,
        username: existing[0].username,
        createdAt: existing[0].createdAt.toISOString(),
      });
      return;
    }

    // Create new user
    const [newUser] = await db.insert(usersTable).values({ username: sanitized }).returning();
    res.json({
      id: newUser.id,
      username: newUser.username,
      createdAt: newUser.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create user");
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// GET /users/:username - check if username exists
router.get("/users/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const users = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);

    if (users.length === 0) {
      res.status(404).json({ error: "Usuario no encontrado." });
      return;
    }

    res.json({
      id: users[0].id,
      username: users[0].username,
      createdAt: users[0].createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get user");
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

export default router;
