import { Router } from "express";
import { testDb } from "../db.js";

const router = Router();

router.get("/healthz", async (_req, res, next) => {
  try {
    const now = await testDb();
    res.json({ ok: true, db_time: now });
  } catch (err) {
    next(err);
  }
});

export default router;
