import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

import { pool } from "../src/db.js";

beforeEach(async () => {
  await pool.query(`SET search_path TO app, public;`);

  // Dependências: primeiro filhos, depois pais
  await pool.query(`DELETE FROM route_points;`);
  await pool.query(`DELETE FROM rides;`);
  await pool.query(`DELETE FROM favorites;`);
  await pool.query(`DELETE FROM likes;`);
  await pool.query(`DELETE FROM attachments;`);
  await pool.query(`DELETE FROM api_keys;`);
  await pool.query(`DELETE FROM audit_logs;`);
  await pool.query(`DELETE FROM routes;`);
  await pool.query(`DELETE FROM profiles;`);
  await pool.query(`DELETE FROM users;`);
});

afterAll(async () => {
  await pool.end();
});
