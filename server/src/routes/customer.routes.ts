import { Router } from "express";
import { addCustomer, deleteCustomer, getCustomer, getCustomers, updateCustomer } from "../controllers/customer.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, addCustomer);
router.get("/", authenticate, getCustomers);
router.get("/:id", authenticate, getCustomer);
router.put("/:id", authenticate, updateCustomer);
router.delete("/:id", authenticate, deleteCustomer);

export default router;