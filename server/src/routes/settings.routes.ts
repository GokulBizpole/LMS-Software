import { Router } from "express";
import {
  getSettings,
  updateSettings,
} from "../controllers/settings.controller";

import { authenticate } from "../middleware/auth.middleware";
import { adminOnly } from "../middleware/role.middleware";

const router = Router();

router.get("/", authenticate, adminOnly, getSettings);

router.put("/", authenticate, adminOnly, updateSettings);

export default router;