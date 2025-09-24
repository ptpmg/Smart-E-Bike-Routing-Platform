import { Router } from "express";
import { pool } from "../db.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

// Helpers
const DIFFICULTIES = new Set(["easy", "moderate", "hard"]);
const VISIBILITIES = new Set(["private", "unlisted", "public"]);

function parseIntOr(def, v) {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : def;
}

// ---------- LISTAR ROTAS ----------
// GET /api/routes?visibility=public|unlisted|private&mine=1&limit=20&offset=0
// Regras:
// - Sem auth: devolve só public
// - Com auth: por omissão devolve public + unlisted; se mine=1 inclui privadas do próprio
router.get("/", async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(parseIntOr(20, req.query.limit), 1), 100);
    const offset = Math.max(parseIntOr(0, req.query.offset), 0);
    const mine = req.query.mine === "1" || req.query.mine === "true";
    const visibility = req.query.visibility;

    const params = [];
    const where = [];

    if (!req.headers.authorization) {
      // público não autenticado → só public
      where.push(`r.visibility = 'public'`);
    } else {
      // autenticado (mesmo se token inválido, o /me/ check fica no create/update)
      // por omissão: public + unlisted
      if (!visibility) {
        where.push(`r.visibility IN ('public','unlisted')`);
      }
    }

    if (visibility && VISIBILITIES.has(visibility)) {
      where.push(`r.visibility = $${params.push(visibility)}`);
    }

    // mine=1 disponível apenas se autenticado: filtramos por owner
    let userId = null;
    if (mine) {
      try {
        const hdr = req.headers.authorization || "";
        const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
        if (!token) return res.status(401).json({ error: "Token em falta" });
        const jwt = await import("jsonwebtoken");
        const payload = jwt.default.verify(token, process.env.JWT_SECRET);
        userId = payload.sub;
        where.push(`r.owner_id = $${params.push(userId)}`);
        // inclui também privadas do próprio
        if (!visibility) {
          where.push(`(r.visibility IN ('public','unlisted') OR r.owner_id = $${params.push(userId)})`);
        }
      } catch {
        return res.status(401).json({ error: "Token inválido" });
      }
    }

    const { rows } = await pool.query(
      `
      SELECT
        r.id, r.owner_id, r.name, r.description, r.distance_m, r.elevation_gain_m,
        r.difficulty, r.visibility, r.is_loop, r.created_at, r.updated_at
      FROM app.routes r
      ${where.length ? "WHERE " + where.map(w => `(${w})`).join(" AND ") : ""}
      ORDER BY r.created_at DESC
      LIMIT $${params.push(limit)} OFFSET $${params.push(offset)}
      `
      , params
    );

    res.json({ items: rows, limit, offset });
  } catch (err) { next(err); }
});

// ---------- OBTER UMA ROTA ----------
// GET /api/routes/:id
// Acesso:
// - public → toda a gente
// - unlisted → toda a gente (se souber o id)
// - private → só owner (JWT) ou admin
router.get("/:id", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM app.routes WHERE id = $1`, [req.params.id]
    );
    const route = rows[0];
    if (!route) return res.status(404).json({ error: "Route não encontrada" });

    if (route.visibility === "private") {
      // exige token e ser owner ou admin
      const hdr = req.headers.authorization || "";
      const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
      if (!token) return res.status(403).json({ error: "Acesso negado" });
      const jwt = await import("jsonwebtoken");
      try {
        const payload = jwt.default.verify(token, process.env.JWT_SECRET);
        if (payload.role !== "admin" && payload.sub !== route.owner_id) {
          return res.status(403).json({ error: "Acesso negado" });
        }
      } catch {
        return res.status(401).json({ error: "Token inválido" });
      }
    }

    res.json({
      id: route.id,
      owner_id: route.owner_id,
      name: route.name,
      description: route.description,
      distance_m: route.distance_m,
      elevation_gain_m: route.elevation_gain_m,
      difficulty: route.difficulty,
      visibility: route.visibility,
      is_loop: route.is_loop,
      created_at: route.created_at,
      updated_at: route.updated_at
    });
  } catch (err) { next(err); }
});

// ---------- CRIAR ROTA ----------
// POST /api/routes
// body: { name, description?, distance_m?, elevation_gain_m?, difficulty?, visibility?, is_loop?, points?: [{lat,lon,elevation_m?,ts?}, ...] }
router.post("/", authRequired, async (req, res, next) => {
  const client = await pool.connect();
  try {
    const userId = req.user.sub;
    const {
      name,
      description = null,
      distance_m = null,
      elevation_gain_m = null,
      difficulty = "moderate",
      visibility = "private",
      is_loop = false,
      points = []
    } = req.body || {};

    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Campo 'name' é obrigatório" });
    }
    if (!DIFFICULTIES.has(difficulty)) {
      return res.status(400).json({ error: "difficulty inválida (easy|moderate|hard)" });
    }
    if (!VISIBILITIES.has(visibility)) {
      return res.status(400).json({ error: "visibility inválida (private|unlisted|public)" });
    }

    await client.query("BEGIN");

    const { rows } = await client.query(
      `INSERT INTO app.routes
         (owner_id, name, description, distance_m, elevation_gain_m, difficulty, visibility, is_loop)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id, owner_id, name, description, distance_m, elevation_gain_m, difficulty, visibility, is_loop, created_at, updated_at`,
      [userId, name, description, distance_m, elevation_gain_m, difficulty, visibility, is_loop]
    );
    const route = rows[0];

    // pontos (opcional) → inserção em massa
    if (Array.isArray(points) && points.length > 0) {
      const values = [];
      const params = [];
      let i = 1;
      points.forEach((p, idx) => {
        if (typeof p.lat !== "number" || typeof p.lon !== "number") return;
        values.push(`($${i++}, $${i++}, $${i++}, $${i++}, $${i++})`);
        params.push(route.id, idx, p.lat, p.lon, p.elevation_m ?? null);
        // se quiseres ts, acrescenta coluna e binding
      });
      if (values.length > 0) {
        await client.query(
          `INSERT INTO app.route_points (route_id, seq, lat, lon, elevation_m)
           VALUES ${values.join(",")}`, params
        );
      }
    }

    await client.query("COMMIT");
    res.status(201).json(route);
  } catch (err) {
    await pool.query("ROLLBACK").catch(() => {});
    next(err);
  } finally {
    client.release();
  }
});

// ---------- ATUALIZAR ROTA ----------
// PATCH /api/routes/:id  (owner ou admin)
// body: { name?, description?, distance_m?, elevation_gain_m?, difficulty?, visibility?, is_loop? }
router.patch("/:id", authRequired, async (req, res, next) => {
  try {
    // verificar ownership
    const { rows: r0 } = await pool.query(
      `SELECT owner_id FROM app.routes WHERE id = $1`, [req.params.id]
    );
    const found = r0[0];
    if (!found) return res.status(404).json({ error: "Route não encontrada" });
    if (req.user.role !== "admin" && req.user.sub !== found.owner_id) {
      return res.status(403).json({ error: "Apenas owner ou admin" });
    }

    const { name, description, distance_m, elevation_gain_m, difficulty, visibility, is_loop } = req.body || {};
    const sets = [];
    const vals = [];
    let i = 1;

    if (name !== undefined) { sets.push(`name = $${i++}`); vals.push(name); }
    if (description !== undefined) { sets.push(`description = $${i++}`); vals.push(description); }
    if (distance_m !== undefined) { sets.push(`distance_m = $${i++}`); vals.push(distance_m); }
    if (elevation_gain_m !== undefined) { sets.push(`elevation_gain_m = $${i++}`); vals.push(elevation_gain_m); }
    if (difficulty !== undefined) {
      if (!DIFFICULTIES.has(difficulty)) return res.status(400).json({ error: "difficulty inválida" });
      sets.push(`difficulty = $${i++}`); vals.push(difficulty);
    }
    if (visibility !== undefined) {
      if (!VISIBILITIES.has(visibility)) return res.status(400).json({ error: "visibility inválida" });
      sets.push(`visibility = $${i++}`); vals.push(visibility);
    }
    if (is_loop !== undefined) { sets.push(`is_loop = $${i++}`); vals.push(Boolean(is_loop)); }

    if (sets.length === 0) return res.status(400).json({ error: "Nada para atualizar" });

    vals.push(req.params.id);

    const { rows } = await pool.query(
      `UPDATE app.routes SET ${sets.join(", ")}, updated_at = now()
       WHERE id = $${i}
       RETURNING id, owner_id, name, description, distance_m, elevation_gain_m, difficulty, visibility, is_loop, created_at, updated_at`,
      vals
    );

    res.json(rows[0]);
  } catch (err) { next(err); }
});

// ---------- APAGAR ROTA ----------
// DELETE /api/routes/:id (owner ou admin)
router.delete("/:id", authRequired, async (req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT owner_id FROM app.routes WHERE id = $1`, [req.params.id]);
    const route = rows[0];
    if (!route) return res.status(404).json({ error: "Route não encontrada" });
    if (req.user.role !== "admin" && req.user.sub !== route.owner_id) {
      return res.status(403).json({ error: "Apenas owner ou admin" });
    }
    await pool.query(`DELETE FROM app.routes WHERE id = $1`, [req.params.id]);
    res.status(204).send();
  } catch (err) { next(err); }
});

// ---------- SUB-RECURSO: PONTOS ----------
// PUT /api/routes/:id/points  (replace all)
// body: { points: [{lat,lon,elevation_m?}, ...] }
router.put("/:id/points", authRequired, async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(`SELECT owner_id FROM app.routes WHERE id = $1`, [req.params.id]);
    const route = rows[0];
    if (!route) return res.status(404).json({ error: "Route não encontrada" });
    if (req.user.role !== "admin" && req.user.sub !== route.owner_id) {
      return res.status(403).json({ error: "Apenas owner ou admin" });
    }

    const { points } = req.body || {};
    if (!Array.isArray(points)) return res.status(400).json({ error: "points deve ser array" });

    await client.query("BEGIN");
    await client.query(`DELETE FROM app.route_points WHERE route_id = $1`, [req.params.id]);

    if (points.length > 0) {
      const values = [];
      const params = [];
      let i = 1;
      points.forEach((p, idx) => {
        if (typeof p.lat !== "number" || typeof p.lon !== "number") return;
        values.push(`($${i++}, $${i++}, $${i++}, $${i++}, $${i++})`);
        params.push(req.params.id, idx, p.lat, p.lon, p.elevation_m ?? null);
      });
      if (values.length > 0) {
        await client.query(
          `INSERT INTO app.route_points (route_id, seq, lat, lon, elevation_m)
           VALUES ${values.join(",")}`, params
        );
      }
    }

    await client.query("COMMIT");
    res.status(204).send();
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    next(err);
  } finally {
    client.release();
  }
});

// GET /api/routes/:id/points
router.get("/:id/points", async (req, res, next) => {
  try {
    // verificar visibilidade/ownership para privadas
    const { rows: r0 } = await pool.query(`SELECT owner_id, visibility FROM app.routes WHERE id = $1`, [req.params.id]);
    const route = r0[0];
    if (!route) return res.status(404).json({ error: "Route não encontrada" });
    if (route.visibility === "private") {
      const hdr = req.headers.authorization || "";
      const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
      if (!token) return res.status(403).json({ error: "Acesso negado" });
      const jwt = await import("jsonwebtoken");
      try {
        const payload = jwt.default.verify(token, process.env.JWT_SECRET);
        if (payload.role !== "admin" && payload.sub !== route.owner_id) {
          return res.status(403).json({ error: "Acesso negado" });
        }
      } catch {
        return res.status(401).json({ error: "Token inválido" });
      }
    }

    const { rows } = await pool.query(
      `SELECT id, seq, lat, lon, elevation_m
       FROM app.route_points
       WHERE route_id = $1
       ORDER BY seq ASC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

export default router;
