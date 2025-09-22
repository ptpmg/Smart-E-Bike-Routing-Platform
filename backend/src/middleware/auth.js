import jwt from "jsonwebtoken";

export function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "1d" });
}

export function authRequired(req, res, next) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Token em falta" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
}

export function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Apenas admins" });
  }
  next();
}

// autoriza se o user do token for o mesmo do :id OU se for admin
export function selfOrAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Token em falta" });
  if (req.user.role === "admin" || req.user.sub === req.params.id) return next();
  return res.status(403).json({ error: "Acesso negado" });
}
