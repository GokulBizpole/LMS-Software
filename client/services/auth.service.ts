// services/auth.service.ts
import api from "@/lib/axios";
import type {
  LoginRequest,
  LoginResponse,
  LoginResponseData,
  AdminLoginResponseData,
  PartnerLoginResponseData,
} from "@/types/auth";



export async function adminLogin(credentials: LoginRequest): Promise<LoginResponseData> {
  const { data } = await api.post<LoginResponse<AdminLoginResponseData>>(
    "/auth/admin/login",
    credentials
  );

  if (!data.success) {
    throw new Error(data.message || "Login failed");
  }

  // Backend returns { token, admin: {...} } — normalize to { token, user }
  return { token: data.data.token, user: data.data.admin };
}

export async function partnerLogin(credentials: LoginRequest): Promise<LoginResponseData> {
  const { data } = await api.post<LoginResponse<PartnerLoginResponseData>>(
    "/auth/partner/login",
    credentials
  );

  if (!data.success) {
    throw new Error(data.message || "Login failed");
  }

  // Backend returns { token, partner: {...} } — normalize to { token, user }
  return { token: data.data.token, user: data.data.partner };
}

export async function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ message: string }> {
  const { data } = await api.post("/auth/change-password", payload);

  if (!data.success) {
    throw new Error(data.message || "Failed to change password");
  }

  return { message: data.message };
}