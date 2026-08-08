import { Router } from "express";
import {
  getAllNotifications,
  readNotification,
  removeNotification,
} from "../controllers/notification.controller";

const router = Router();

router.get("/", getAllNotifications);

router.put("/:id/read", readNotification);

router.delete("/:id", removeNotification);

export default router;