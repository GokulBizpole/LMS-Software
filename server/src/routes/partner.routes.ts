import { Router } from "express";
import { addPartner, deletePartner, getPartner, getPartners, updatePartner } from "../controllers/partner.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, addPartner);
router.get("/", authenticate, getPartners);
router.get("/:id", authenticate, getPartner);
router.put("/:id", authenticate, updatePartner);
router.delete("/:id", authenticate, deletePartner);

export default router;