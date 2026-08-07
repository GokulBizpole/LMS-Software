import { Router } from "express";
import {
  addExpense,
  deleteExpense,
  getExpense,
  getExpenses,
  updateExpense,
} from "../controllers/expense.controller";

import { authenticate } from "../middleware/auth.middleware";
import { adminOnly } from "../middleware/role.middleware";

const router = Router();

router.post("/", authenticate, adminOnly, addExpense);

router.get("/", authenticate, adminOnly, getExpenses);

router.get("/:id", authenticate, adminOnly, getExpense);

router.put("/:id", authenticate, adminOnly, updateExpense);

router.delete("/:id", authenticate, adminOnly, deleteExpense);

export default router;