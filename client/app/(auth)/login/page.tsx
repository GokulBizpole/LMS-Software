// app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { loginAsAdmin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginAsAdmin(email, password);
      // AuthContext handles the redirect to /dashboard on success
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1EFE8]">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-2xl border border-[#E8E6DF] p-8"
      >
        <h1 className="text-lg font-semibold text-[#2C2C2A] mb-1">
          FinLoan admin
        </h1>
        <p className="text-sm text-[#888780] mb-6">
          Sign in to manage loans and customers.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-[#FAECE7] text-[#993C1D] text-sm px-3 py-2">
            {error}
          </div>
        )}

        <label className="block text-sm text-[#5F5E5A] mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full mb-4 rounded-lg border border-[#B4B2A9] px-3 py-2 text-sm"
          placeholder="admin@finloan.com"
        />

        <label className="block text-sm text-[#5F5E5A] mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full mb-6 rounded-lg border border-[#B4B2A9] px-3 py-2 text-sm"
          placeholder="••••••••"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#2C2C2A] text-white rounded-lg py-2 text-sm font-medium disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}