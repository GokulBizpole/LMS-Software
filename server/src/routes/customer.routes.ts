import { Router } from "express";
import {
  addCustomer,
  deleteCustomer,
 getCustomer,
  getCustomers,
  updateCustomer,
} from "../controllers/customer.controller";

import { authenticate } from "../middleware/auth.middleware";
import { adminOnly } from "../middleware/role.middleware";

const router = Router();

router.post("/", authenticate, adminOnly, addCustomer);

router.get("/", authenticate, adminOnly, getCustomers);

router.get("/:id", authenticate, adminOnly, getCustomer);

router.put("/:id", authenticate, adminOnly, updateCustomer);

router.delete("/:id", authenticate, adminOnly, deleteCustomer);

export default router;