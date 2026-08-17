import { Router } from "express";
import {
  addPartner,
  changeMyPassword,
  deletePartner,
  getMyPartnerProfile,
  getPartner,
  getPartners,
  updateMyProfile,
  updatePartner,
} from "../controllers/partner.controller";
import {
  addMyCustomer,
  getMyCustomer,
  getMyCustomerLoans,
  getMyCustomerPayments,
  getMyCustomers,
} from "../controllers/customer.controller";
import { addMyLoan, getMyLoan, getMyLoans } from "../controllers/loan.controller";
import {
  addMyPayment,
  downloadMyReceipt,
  getMyPayment,
  getMyPayments,
} from "../controllers/payment.controller";
import {
  myCollectionReport,
  myLoanReport,
  myOutstandingReport,
} from "../controllers/report.controller";
import { myDashboard } from "../controllers/dashboard.controller";
import {
  getMyCustomerDocuments,
  removeMyCustomerDocument,
  uploadMyCustomerDocument,
} from "../controllers/document.controller";

import { authenticate } from "../middleware/auth.middleware";
import { adminOnly, partnerOnly } from "../middleware/role.middleware";
import { uploadCustomerDocument } from "../middleware/upload.middleware";

const router = Router();

router.post("/", authenticate, adminOnly, addPartner);

router.get("/", authenticate, adminOnly, getPartners);

// ============================================================
// Partner self-service — all "/me" routes must come before the
// generic "/:id" admin routes so they aren't shadowed by them.
// ============================================================

router.get("/me", authenticate, partnerOnly, getMyPartnerProfile);
router.put("/me", authenticate, partnerOnly, updateMyProfile);
router.put("/me/password", authenticate, partnerOnly, changeMyPassword);

router.get("/me/dashboard", authenticate, partnerOnly, myDashboard);

router.get("/me/customers", authenticate, partnerOnly, getMyCustomers);
router.post("/me/customers", authenticate, partnerOnly, addMyCustomer);
router.get("/me/customers/:id", authenticate, partnerOnly, getMyCustomer);
router.get(
  "/me/customers/:id/loans",
  authenticate,
  partnerOnly,
  getMyCustomerLoans
);
router.get(
  "/me/customers/:id/payments",
  authenticate,
  partnerOnly,
  getMyCustomerPayments
);
router.get(
  "/me/customers/:id/documents",
  authenticate,
  partnerOnly,
  getMyCustomerDocuments
);
router.post(
  "/me/customers/:id/documents",
  authenticate,
  partnerOnly,
  uploadCustomerDocument,
  uploadMyCustomerDocument
);
router.delete(
  "/me/documents/:docId",
  authenticate,
  partnerOnly,
  removeMyCustomerDocument
);

router.get("/me/loans", authenticate, partnerOnly, getMyLoans);
router.post("/me/loans", authenticate, partnerOnly, addMyLoan);
router.get("/me/loans/:id", authenticate, partnerOnly, getMyLoan);

router.get("/me/payments", authenticate, partnerOnly, getMyPayments);
router.post("/me/payments", authenticate, partnerOnly, addMyPayment);
router.get("/me/payments/:id", authenticate, partnerOnly, getMyPayment);
router.get(
  "/me/payments/:id/receipt",
  authenticate,
  partnerOnly,
  downloadMyReceipt
);

router.get("/me/reports/loans", authenticate, partnerOnly, myLoanReport);
router.get(
  "/me/reports/collections",
  authenticate,
  partnerOnly,
  myCollectionReport
);
router.get(
  "/me/reports/outstanding",
  authenticate,
  partnerOnly,
  myOutstandingReport
);

// ============================================================
// Admin management of partner records
// ============================================================

router.get("/:id", authenticate, adminOnly, getPartner);

router.put("/:id", authenticate, adminOnly, updatePartner);

router.delete("/:id", authenticate, adminOnly, deletePartner);

export default router;
