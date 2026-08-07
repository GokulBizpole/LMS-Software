import { Router } from "express";
import {
  adminLogin,
  changePassword,
  partnerLogin,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { adminOnly } from "../middleware/role.middleware";

const router = Router();

router.post("/admin/login", adminLogin);
router.post("/partner/login", partnerLogin);

router.put(
  "/change-password",
  authenticate,
  adminOnly,
  changePassword
);

export default router;