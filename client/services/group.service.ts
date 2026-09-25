// services/group.service.ts
// Groups are served from two scopes with the same shape: admin
// (/groups — view + create) and partner (/partners/me/groups — full CRUD).
import api from "@/lib/axios";
import type {
  EligibleCustomer,
  GroupDetail,
  GroupListResponse,
  GroupOverview,
} from "@/types/group";

export type GroupScope = "admin" | "partner";

const basePath = (scope: GroupScope) =>
  scope === "admin" ? "/groups" : "/partners/me/groups";

export interface GetGroupsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export async function getGroups(
  scope: GroupScope,
  params: GetGroupsParams = {}
): Promise<GroupListResponse> {
  const { data } = await api.get<GroupListResponse>(basePath(scope), { params });

  if (!data.success) {
    throw new Error("Failed to load groups");
  }

  return data;
}

interface GroupDetailResponse {
  success: boolean;
  message?: string;
  data: GroupDetail;
}

export async function getGroupById(scope: GroupScope, id: string): Promise<GroupDetail> {
  const { data } = await api.get<GroupDetailResponse>(`${basePath(scope)}/${id}`);

  if (!data.success) {
    throw new Error("Failed to load group");
  }

  return data.data;
}

export async function getGroupOverview(scope: GroupScope, id: string): Promise<GroupOverview> {
  const { data } = await api.get<{ success: boolean; data: GroupOverview }>(
    `${basePath(scope)}/${id}/overview`
  );

  if (!data.success) {
    throw new Error("Failed to load group overview");
  }

  return data.data;
}

export interface GroupPayload {
  name: string;
  groupHeadId: string;
  memberIds: string[];
}

export async function createGroup(
  scope: GroupScope,
  payload: GroupPayload
): Promise<{ data: GroupDetail; message: string }> {
  const { data } = await api.post<GroupDetailResponse>(basePath(scope), payload);

  if (!data.success) {
    throw new Error(data.message || "Failed to create group");
  }

  return { data: data.data, message: data.message ?? "Group created successfully" };
}

// Partner only — admins cannot edit groups.
export async function updateMyGroup(
  id: string,
  payload: GroupPayload
): Promise<{ data: GroupDetail; message: string }> {
  const { data } = await api.put<GroupDetailResponse>(`/partners/me/groups/${id}`, payload);

  if (!data.success) {
    throw new Error(data.message || "Failed to update group");
  }

  return { data: data.data, message: data.message ?? "Group updated successfully" };
}

// Partner only — admins cannot delete groups.
export async function deleteMyGroup(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ success: boolean; message: string }>(
    `/partners/me/groups/${id}`
  );

  if (!data.success) {
    throw new Error(data.message || "Failed to delete group");
  }

  return { message: data.message };
}

export interface EligibleCustomersParams {
  search?: string;
  groupId?: string;
  // Admin only: a partner id, or "unassigned" for customers with no partner.
  partnerId?: string;
}

export async function getEligibleCustomers(
  scope: GroupScope,
  params: EligibleCustomersParams = {}
): Promise<EligibleCustomer[]> {
  const { data } = await api.get<{ success: boolean; customers: EligibleCustomer[] }>(
    `${basePath(scope)}/eligible-customers`,
    { params }
  );

  if (!data.success) {
    throw new Error("Failed to load customers");
  }

  return data.customers;
}
