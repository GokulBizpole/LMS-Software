import { Router } from "express";
import { addLoan } from "../controllers/loan.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, addLoan);

export default router;