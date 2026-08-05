import { Router } from "express";
import { login, register } from "../controllers/admin.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.get("/profile", authenticate, (req, res) => {
  res.json({
    success: true,
    message: "Admin Profile",
    user: (req as any).user,
  });
});

export default router;