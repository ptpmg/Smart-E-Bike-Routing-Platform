import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import health from "./routes/health.js";
import api from "./routes/index.js";
import auth from "./routes/auth.js";
import { mountSwagger } from "./swagger.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

mountSwagger(app); // adiciona /docs e /docs.json

// rotas
app.use("/", health);
app.use("/api", api);
app.use("/auth", auth);

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// erro
app.use((err, _req, res, _next) => {
  console.error("Erro:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`🚀 API a correr em http://localhost:${PORT}`);
});
