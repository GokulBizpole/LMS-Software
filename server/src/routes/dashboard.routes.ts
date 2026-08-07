import { Router } from "express";
import { dashboard } from "../controllers/dashboard.controller";
import { authenticate } from "../middleware/auth.middleware";
import { adminOnly } from "../middleware/role.middleware";

const router = Router();

router.get("/", authenticate, adminOnly, dashboard);

export default router;