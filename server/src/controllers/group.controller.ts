import { Response } from "express";
import {
  createGroup,
  deleteGroupById,
  getAllGroups,
  getEligibleCustomers,
  getGroupById,
  getGroupOverview,
  updateGroupById,
  type GroupActor,
} from "../services/group.service";

// Shared by the admin (/api/groups) and partner (/api/partners/me/groups)
// routes — the actor's type decides scope and allowed operations.
const actorOf = (req: any): GroupActor => ({
  type: req.user?.type,
  id: req.user?.id,
});

// ================= CREATE GROUP =================
export const addGroup = async (req: any, res: Response) => {
  try {
    const group = await createGroup(req.body, actorOf(req), req.ip);

    res.status(201).json({
      success: true,
      message: "Group created successfully",
      data: group,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= GET ALL GROUPS =================
export const getGroups = async (req: any, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = (req.query.search as string) || "";
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const order = (req.query.order as "asc" | "desc") || "desc";

    const result = await getAllGroups(actorOf(req), page, limit, search, sortBy, order);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= GET GROUP =================
export const getGroup = async (req: any, res: Response) => {
  try {
    const group = await getGroupById(req.params.id as string, actorOf(req));

    res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= GROUP OVERVIEW =================
export const getGroupOverviewView = async (req: any, res: Response) => {
  try {
    const data = await getGroupOverview(req.params.id as string, actorOf(req));

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= UPDATE GROUP =================
export const updateGroup = async (req: any, res: Response) => {
  try {
    const group = await updateGroupById(
      req.params.id as string,
      req.body,
      actorOf(req),
      req.ip
    );

    res.status(200).json({
      success: true,
      message: "Group updated successfully",
      data: group,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= DELETE GROUP =================
export const deleteGroup = async (req: any, res: Response) => {
  try {
    const result = await deleteGroupById(req.params.id as string, actorOf(req), req.ip);

    res.status(200).json({
      success: true,
      message: "Group deleted successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= ELIGIBLE CUSTOMERS =================
export const getGroupEligibleCustomers = async (req: any, res: Response) => {
  try {
    const customers = await getEligibleCustomers(
      actorOf(req),
      (req.query.search as string) || "",
      (req.query.groupId as string) || undefined,
      (req.query.partnerId as string) || undefined,
      Number(req.query.limit) || 50
    );

    res.status(200).json({
      success: true,
      customers,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
