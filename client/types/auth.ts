// types/auth.ts

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "PARTNER" | string;
}

// Raw shapes as the backend actually returns them
export interface AdminLoginResponseData {
  token: string;
  admin: AuthUser;
}

export interface PartnerLoginResponseData {
  token: string;
  partner: AuthUser;
}

export interface LoginResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Normalized shape the rest of the app (AuthContext) works with
export interface LoginResponseData {
  token: string;
  user: AuthUser;
}