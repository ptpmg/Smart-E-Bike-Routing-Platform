import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();
const { Pool } = pkg;

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL não definido no .env");
  process.exit(1);
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // SSL desligado em local; ativa se usares cloud que exija SSL
  ssl: false
});

// opcional: teste de arranque
export async function testDb() {
  const { rows } = await pool.query("select now() as now");
  return rows[0].now;
}
