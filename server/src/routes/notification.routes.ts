import { Router } from "express";
import {
  getAllNotifications,
  getUnreadCount,
  readNotification,
  readAllNotifications,
  removeNotification,
} from "../controllers/notification.controller";

import { authenticate } from "../middleware/auth.middleware";
import { adminOnly } from "../middleware/role.middleware";

const router = Router();

router.get("/", authenticate, adminOnly, getAllNotifications);

router.get("/unread-count", authenticate, adminOnly, getUnreadCount);

router.put("/read-all", authenticate, adminOnly, readAllNotifications);

router.put("/:id/read", authenticate, adminOnly, readNotification);

router.delete("/:id", authenticate, adminOnly, removeNotification);

export default router;
