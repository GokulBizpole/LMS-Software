import { Router } from "express";
import {
  addPayment,
  downloadReceipt,
  getPayment,
  getPayments,
} from "../controllers/payment.controller";

import { authenticate } from "../middleware/auth.middleware";
import { adminOnly } from "../middleware/role.middleware";

const router = Router();

router.post("/", authenticate, adminOnly, addPayment);

router.get("/", authenticate, adminOnly, getPayments);

router.get("/:id", authenticate, adminOnly, getPayment);

router.get(
  "/:id/receipt",
  authenticate,
  downloadReceipt
);

export default router;