// contexts/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { adminLogin, partnerLogin } from "@/services/auth.service";
import type { AuthUser } from "@/types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  loginAsAdmin: (email: string, password: string) => Promise<void>;
  loginAsPartner: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, restore user from localStorage (token + user were saved at login)
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("authUser");

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("authUser");
      }
    }
    setLoading(false);
  }, []);

  async function handleLoginSuccess(result: { token: string; user: AuthUser }) {
    // This is the actual setItem call that was missing on the frontend.
    localStorage.setItem("token", result.token);
    localStorage.setItem("authUser", JSON.stringify(result.user));
    setUser(result.user);

    if (result.user.role === "SUPER_ADMIN" || result.user.role === "ADMIN") {
      router.push("/dashboard");
    } else {
      router.push("/dashboard"); // adjust if partner has a different landing route
    }
  }

  async function loginAsAdmin(email: string, password: string) {
    const result = await adminLogin({ email, password });
    await handleLoginSuccess(result);
  }

  async function loginAsPartner(email: string, password: string) {
    const result = await partnerLogin({ email, password });
    await handleLoginSuccess(result);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("authUser");
    setUser(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, loginAsAdmin, loginAsPartner, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
}