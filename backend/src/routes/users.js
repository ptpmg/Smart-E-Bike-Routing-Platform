import { Router } from "express";
import { pool } from "../db.js";
import bcrypt from "bcryptjs";
import { authRequired, adminOnly, selfOrAdmin } from "../middleware/auth.js";

const router = Router();

const PUBLIC_COLS = "id, email, role, is_active, created_at, updated_at";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// GET /api/users -> lista (ADMIN ONLY)
router.get("/", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT ${PUBLIC_COLS} FROM app.users ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/users/:id -> detalhe (SELF OR ADMIN)
router.get("/:id", authRequired, selfOrAdmin, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT ${PUBLIC_COLS} FROM app.users WHERE id = $1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "User não encontrado" });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// (REMOVIDO) POST /api/users -> registo agora é /auth/register
// Se quiseres manter para admins, descomenta e usa: authRequired, adminOnly
// router.post("/", authRequired, adminOnly, async (req, res, next) => { ... });

// PATCH /api/users/:id -> atualizar (SELF OR ADMIN)
// - user normal: pode mudar email/password
// - admin: pode também mudar is_active
router.patch("/:id", authRequired, selfOrAdmin, async (req, res, next) => {
  try {
    const { email, password, is_active } = req.body || {};
    const sets = [];
    const vals = [];
    let i = 1;

    if (email !== undefined) {
      if (!EMAIL_REGEX.test(email)) return res.status(400).json({ error: "Email inválido" });
      sets.push(`email = $${i++}`); vals.push(email);
    }
    if (password !== undefined) {
      if (String(password).length < 6) return res.status(400).json({ error: "Password deve ter pelo menos 6 caracteres" });
      const hash = await bcrypt.hash(String(password), 10);
      sets.push(`password_hash = $${i++}`); vals.push(hash);
    }
    if (is_active !== undefined) {
      // só admin pode alterar is_active
      if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Apenas admin pode alterar is_active" });
      }
      sets.push(`is_active = $${i++}`); vals.push(Boolean(is_active));
    }

    if (sets.length === 0) return res.status(400).json({ error: "Nada para atualizar" });

    vals.push(req.params.id);
    const { rows } = await pool.query(
      `UPDATE app.users SET ${sets.join(", ")}, updated_at = now()
       WHERE id = $${i}
       RETURNING ${PUBLIC_COLS}`,
      vals
    );
    if (!rows[0]) return res.status(404).json({ error: "User não encontrado" });
    res.json(rows[0]);
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "Email já existe" });
    next(err);
  }
});

// DELETE /api/users/:id -> ADMIN ONLY
router.delete("/:id", authRequired, adminOnly, async (req, res, next) => {
  try {
    const { rowCount } = await pool.query(`DELETE FROM app.users WHERE id = $1`, [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: "User não encontrado" });
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
