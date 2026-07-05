import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// Names that cannot be registered by regular users (checked case-insensitively)
const RESERVED_NAMES = ["dinox", "admin", "sistema", "server", "workly", "dnx"];

// POST /users — register a new unique username
router.post("/users", async (req, res) => {
  const { username } = req.body;

  if (!username || typeof username !== "string") {
    res.status(400).json({ error: "Nombre de usuario requerido." });
    return;
  }

  // Trim FIRST, then validate length/format
  const sanitized = username.trim();

  if (sanitized.length < 2 || sanitized.length > 30) {
    res.status(400).json({ error: "El nombre debe tener entre 2 y 30 caracteres." });
    return;
  }

  if (!/^[a-zA-Z0-9_\-]+$/.test(sanitized)) {
    res.status(400).json({ error: "Solo letras, números, guiones y guiones bajos." });
    return;
  }

  // Block reserved names (case-insensitive)
  if (RESERVED_NAMES.includes(sanitized.toLowerCase())) {
    res.status(409).json({ error: "Este nombre está reservado y no puede usarse." });
    return;
  }

  try {
    // Check if username is already taken
    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, sanitized))
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: "Este nombre de usuario ya está en uso. Elige otro." });
      return;
    }

    const [newUser] = await db
      .insert(usersTable)
      .values({ username: sanitized })
      .returning();

    res.json({
      id: newUser.id,
      username: newUser.username,
      createdAt: newUser.createdAt.toISOString(),
    });
  } catch (err) {
    console.error("POST /users error:", err);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// GET /users/:username — check if a username exists
router.get("/users/:username", async (req, res) => {
  const { username } = req.params;
  try {
    const result = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username))
      .limit(1);

    if (!result.length) {
      res.status(404).json({ error: "Usuario no encontrado." });
      return;
    }
    const u = result[0];
    res.json({ id: u.id, username: u.username, createdAt: u.createdAt.toISOString() });
  } catch (err) {
    console.error("GET /users/:username error:", err);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

export default router;
