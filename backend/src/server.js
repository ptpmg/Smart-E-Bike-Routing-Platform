import dotenv from "dotenv";
dotenv.config();                 // carrega .env em runtime normal

import app from "./app.js";

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 API a correr em http://localhost:${PORT}`);
});
