import path from "path";
import { fileURLToPath } from "url";
import swaggerUi from "swagger-ui-express";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const specPath = path.join(__dirname, "..", "openapi.json");
const swaggerDocument = JSON.parse(fs.readFileSync(specPath, "utf8"));

export function mountSwagger(app) {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    explorer: true
  }));
  // opcional: expor o JSON
  app.get("/docs.json", (_req, res) => res.json(swaggerDocument));
}
