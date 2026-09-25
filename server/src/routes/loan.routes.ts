import { Router } from "express";
import {
  addLoan,
  approveLoan,
  closeLoan,
  getLoan,
  getLoans,
  rejectLoan,
  updateLoan,
} from "../controllers/loan.controller";
import { getLoanCollectionView } from "../controllers/payment.controller";

import { authenticate } from "../middleware/auth.middleware";
import { adminOnly } from "../middleware/role.middleware";

const router = Router();

router.post("/", authenticate, adminOnly, addLoan);

router.get("/", authenticate, adminOnly, getLoans);

router.get("/:id", authenticate, adminOnly, getLoan);

router.get("/:id/collection", authenticate, adminOnly, getLoanCollectionView);

router.put("/:id", authenticate, adminOnly, updateLoan);

router.patch("/:id/close", authenticate, adminOnly, closeLoan);

router.patch(
  "/:id/approve",
  authenticate,
  adminOnly,
  approveLoan
);

router.patch(
  "/:id/reject",
  authenticate,
  adminOnly,
  rejectLoan
);

export default router;