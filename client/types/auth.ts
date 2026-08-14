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

export interface LoginResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Shape returned by the unified /auth/login endpoint
export interface LoginResponseData {
  token: string;
  user: AuthUser;
}