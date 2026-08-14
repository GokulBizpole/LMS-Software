import { Router } from "express";
import {
  addPartner,
  deletePartner,
  getMyPartnerProfile,
  getPartner,
  getPartners,
  updatePartner,
} from "../controllers/partner.controller";

import { authenticate } from "../middleware/auth.middleware";
import { adminOnly, partnerOnly } from "../middleware/role.middleware";

const router = Router();

router.post("/", authenticate, adminOnly, addPartner);

router.get("/", authenticate, adminOnly, getPartners);

// Partner self-service — must come before the generic "/:id" route
router.get("/me", authenticate, partnerOnly, getMyPartnerProfile);

router.get("/:id", authenticate, adminOnly, getPartner);

router.put("/:id", authenticate, adminOnly, updatePartner);

router.delete("/:id", authenticate, adminOnly, deletePartner);

export default router;