import { Router } from "express";
import bcrypt from "bcryptjs";
import { pool } from "../db.js";
import { signToken } from "../middleware/auth.js";
import jwt from "jsonwebtoken"; // acrescenta esta import se ainda não existir

const router = Router();
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function adminExists() {
    const { rows } = await pool.query(
      `SELECT 1 FROM app.users WHERE role = 'admin' LIMIT 1`
    );
    return !!rows[0];
  }

// POST /auth/register  (cria SEM role: sempre 'user')
router.post("/register", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !EMAIL_REGEX.test(email)) return res.status(400).json({ error: "Email inválido" });
    if (!password || String(password).length < 6) return res.status(400).json({ error: "Password deve ter pelo menos 6 caracteres" });

    const password_hash = await bcrypt.hash(String(password), 10);
    const { rows } = await pool.query(
      `INSERT INTO app.users (email, password_hash, role)
       VALUES ($1, $2, 'user')
       RETURNING id, email, role, is_active, created_at, updated_at`,
      [email, password_hash]
    );

    const user = rows[0];
    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    res.status(201).json({ user, token });
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "Email já existe" });
    next(err);
  }
});

// POST /auth/login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "Credenciais em falta" });

    const { rows } = await pool.query(`SELECT id, email, password_hash, role, is_active FROM app.users WHERE email = $1`, [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: "Credenciais inválidas" });
    if (!user.is_active) return res.status(403).json({ error: "Conta inativa" });

    const ok = await bcrypt.compare(String(password), user.password_hash);
    if (!ok) return res.status(401).json({ error: "Credenciais inválidas" });

    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    // não devolver password_hash
    delete user.password_hash;
    res.json({ user, token });
  } catch (err) { next(err); }
});

// POST /auth/create-admin
router.post("/create-admin", async (req, res, next) => {
    try {
      const { email, password, setup_token } = req.body || {};
      if (!email || !EMAIL_REGEX.test(email)) {
        return res.status(400).json({ error: "Email inválido" });
      }
      if (!password || String(password).length < 6) {
        return res.status(400).json({ error: "Password deve ter pelo menos 6 caracteres" });
      }
  
      const exists = await adminExists();
  
      if (!exists) {
        // Bootstrap: precisa do setup_token correto
        if (!process.env.ADMIN_SETUP_TOKEN) {
          return res.status(500).json({ error: "ADMIN_SETUP_TOKEN não configurado no servidor" });
        }
        if (setup_token !== process.env.ADMIN_SETUP_TOKEN) {
          return res.status(403).json({ error: "Setup token inválido" });
        }
      } else {
        // Já existe admin: requer JWT de admin
        try {
          const hdr = req.headers.authorization || "";
          const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
          if (!token) return res.status(401).json({ error: "Token em falta" });
          const payload = jwt.verify(token, process.env.JWT_SECRET);
          if (payload.role !== "admin") {
            return res.status(403).json({ error: "Apenas admins podem criar novos admins" });
          }
        } catch {
          return res.status(401).json({ error: "Token inválido" });
        }
      }
  
      // Criar o admin
      const password_hash = await bcrypt.hash(String(password), 10);
      const { rows } = await pool.query(
        `INSERT INTO app.users (email, password_hash, role)
         VALUES ($1, $2, 'admin')
         RETURNING id, email, role, is_active, created_at, updated_at`,
        [email, password_hash]
      );
  
      const user = rows[0];
      // Devolvemos também um JWT já pronto
      const token = jwt.sign(
        { sub: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
      );
  
      res.status(201).json({ user, token });
    } catch (err) {
      if (err.code === "23505") return res.status(409).json({ error: "Email já existe" });
      next(err);
    }
  });

export default router;
