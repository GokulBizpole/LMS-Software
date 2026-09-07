import { Router } from "express";
import {
  approveEod,
  getEod,
  getEodList,
  rejectEod,
} from "../controllers/eod.controller";

import { authenticate } from "../middleware/auth.middleware";
import { adminOnly } from "../middleware/role.middleware";

const router = Router();

router.get("/", authenticate, adminOnly, getEodList);

router.get("/:id", authenticate, adminOnly, getEod);

router.patch("/:id/approve", authenticate, adminOnly, approveEod);

router.patch("/:id/reject", authenticate, adminOnly, rejectEod);

export default router;
