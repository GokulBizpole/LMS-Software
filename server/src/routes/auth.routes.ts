import { Router } from "express";
import {
  adminLogin,
  changePassword,
  login,
  partnerLogin,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { adminOnly } from "../middleware/role.middleware";

const router = Router();

// Unified login — used by the single /login page
router.post("/login", login);

router.post("/admin/login", adminLogin);
router.post("/partner/login", partnerLogin);

router.put(
  "/change-password",
  authenticate,
  adminOnly,
  changePassword
);

export default router;