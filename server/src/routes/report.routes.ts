import { Router } from "express";
import { collectionReport, customerLedger, expenseReport, loanReport, partnerReport, profitLossReport } from "../controllers/report.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/loan", authenticate, loanReport);
router.get("/collection", authenticate, collectionReport);
router.get("/expense", authenticate, expenseReport);
router.get("/profit-loss", authenticate, profitLossReport);
router.get(
  "/customer-ledger/:customerId",
  authenticate,
  customerLedger
);
router.get("/partner", authenticate, partnerReport);

export default router;