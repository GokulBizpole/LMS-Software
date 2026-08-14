import { Router } from "express";
import { getAuditLogs } from "../controllers/audit.controller";

import { authenticate } from "../middleware/auth.middleware";
import { adminOnly } from "../middleware/role.middleware";

const router = Router();

router.get("/", authenticate, adminOnly, getAuditLogs);

export default router;
