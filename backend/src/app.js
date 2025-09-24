import express from "express";
import morgan from "morgan";
import cors from "cors";
// ❌ NÃO faças dotenv.config() aqui; deixa para server.js ou para o setup dos testes

import health from "./routes/health.js";
import api from "./routes/index.js";
import auth from "./routes/auth.js";         // <= IMPORTANTE
import { mountSwagger } from "./swagger.js";

const app = express();
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

mountSwagger(app);

app.use("/", health);
app.use("/auth", auth);                       // <= IMPORTANTE
app.use("/api", api);

app.use((req, res) => res.status(404).json({ error: "Not found" }));
app.use((err, _req, res, _next) => {
  console.error("Erro:", err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;
