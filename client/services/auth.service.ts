// services/auth.service.ts
import api from "@/lib/axios";
import type { LoginRequest, LoginResponse, LoginResponseData } from "@/types/auth";

// Single endpoint for the unified login page — the backend figures out
// whether the email belongs to an Admin or a Partner.
export async function login(credentials: LoginRequest): Promise<LoginResponseData> {
  const { data } = await api.post<LoginResponse<LoginResponseData>>(
    "/auth/login",
    credentials
  );

  if (!data.success) {
    throw new Error(data.message || "Login failed");
  }

  return data.data;
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