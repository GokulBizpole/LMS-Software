import { Request, Response } from "express";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "../services/notification.service";
import { subscribePartnerActivity } from "../services/realtimeEvents.service";

export const getAllNotifications = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const unreadOnly = String(req.query.unreadOnly || "") === "true";

    const data = await getNotifications(page, limit, unreadOnly);

    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const getUnreadCount = async (_req: Request, res: Response) => {
  try {
    const count = await getUnreadNotificationCount();

    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const readNotification = async (req: Request, res: Response) => {
  try {
    const notification = await markNotificationRead(String(req.params.id));

    return res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const readAllNotifications = async (_req: Request, res: Response) => {
  try {
    const count = await markAllNotificationsRead();

    return res.status(200).json({
      success: true,
      message: `${count} notification(s) marked as read`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

// ================= REAL-TIME ADMIN STREAM =================
// SSE feed of partner-activity events (customer/loan created by a partner)
// for the Admin Electron app to relay into a native Windows notification.
// Auth is the existing Bearer-JWT middleware — no new auth mechanism.
export const streamAdminNotifications = (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const send = (event: unknown) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  const unsubscribe = subscribePartnerActivity(send);

  const heartbeat = setInterval(() => {
    res.write(": heartbeat\n\n");
  }, 30_000);

  req.on("close", () => {
    clearInterval(heartbeat);
    unsubscribe();
  });
};

export const removeNotification = async (req: Request, res: Response) => {
  try {
    await deleteNotification(String(req.params.id));

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};
