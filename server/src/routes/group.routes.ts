import { Router } from "express";
import {
  addGroup,
  getGroup,
  getGroupEligibleCustomers,
  getGroupOverviewView,
  getGroups,
} from "../controllers/group.controller";

import { authenticate } from "../middleware/auth.middleware";
import { adminOnly } from "../middleware/role.middleware";

// Admin groups: view + create only. Edit/delete are partner-only and live
// under /api/partners/me/groups.
const router = Router();

router.post("/", authenticate, adminOnly, addGroup);

router.get("/", authenticate, adminOnly, getGroups);

router.get("/eligible-customers", authenticate, adminOnly, getGroupEligibleCustomers);

router.get("/:id", authenticate, adminOnly, getGroup);

router.get("/:id/overview", authenticate, adminOnly, getGroupOverviewView);

export default router;
