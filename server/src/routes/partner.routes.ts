import { Router } from "express";
import {
  addPartner,
  deletePartner,
  getPartner,
  getPartners,
  updatePartner,
} from "../controllers/partner.controller";

import { authenticate } from "../middleware/auth.middleware";
import { adminOnly } from "../middleware/role.middleware";

const router = Router();

router.post("/", authenticate, adminOnly, addPartner);

router.get("/", authenticate, adminOnly, getPartners);

router.get("/:id", authenticate, adminOnly, getPartner);

router.put("/:id", authenticate, adminOnly, updatePartner);

router.delete("/:id", authenticate, adminOnly, deletePartner);

export default router;