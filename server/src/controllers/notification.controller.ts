import { Request, Response } from "express";
import {
  getNotifications,
  markNotificationRead,
  deleteNotification,
} from "../services/notification.service";

export const getAllNotifications = async (
  req: Request,
  res: Response
) => {
  try {
    const notifications = await getNotifications();

    return res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const readNotification = async (
  req: Request,
  res: Response
) => {
  try {
    const notification = await markNotificationRead(
      String(req.params.id)
    );

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

export const removeNotification = async (
  req: Request,
  res: Response
) => {
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