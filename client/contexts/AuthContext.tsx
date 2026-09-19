// contexts/AuthContext.tsx
"use client";

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { login as loginRequest } from "@/services/auth.service";
import type { AuthUser } from "@/types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
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

  // Memoized so consumers (e.g. the back-button logout guard) that depend
  // on `login`/`logout` in an effect's dependency array don't tear down and
  // re-run on every render — AuthProvider wraps {children} at the root, so
  // its body re-executes on every navigation, and un-memoized functions here
  // would get a new identity each time.
  const handleLoginSuccess = useCallback(
    async (result: { token: string; user: AuthUser }) => {
      // This is the actual setItem call that was missing on the frontend.
      localStorage.setItem("token", result.token);
      localStorage.setItem("authUser", JSON.stringify(result.user));
      setUser(result.user);

      if (result.user.role === "PARTNER") {
        router.push("/partner/dashboard");
      } else {
        router.push("/dashboard");
      }
    },
    [router]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await loginRequest({ email, password });
      await handleLoginSuccess(result);
    },
    [handleLoginSuccess]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("authUser");
    setUser(null);
    // replace, not push — logging out shouldn't leave a forward-navigable
    // history entry pointing back at the now-invalid authenticated page.
    router.replace("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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