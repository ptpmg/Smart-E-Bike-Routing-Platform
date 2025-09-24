import { Router } from "express";
import users from "./users.js";
import routes from "./routess.js";

const router = Router();

router.use("/users", users);
router.use("/routes", routes);

export default router;
