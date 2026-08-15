// app/(auth)/login/page.tsx
"use client";

import { useState, type SubmitEvent } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      // AuthContext redirects to /dashboard (admin) or /partner/dashboard (partner)
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ECE9DF]">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-2xl border border-[#DAD7CA] p-8"
      >
        <h1 className="text-lg font-semibold text-[#1A1A18] mb-1">
          FinLoan
        </h1>
        <p className="text-sm text-[#6B6A62] mb-6">
          Sign in with your admin or partner account.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-[#FAECE7] text-[#993C1D] text-sm px-3 py-2">
            {error}
          </div>
        )}

        <label className="block text-sm text-[#45443E] mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full mb-4 rounded-lg border border-[#9C9A8D] px-3 py-2 text-sm"
          placeholder="you@finloan.com"
        />

        <label className="block text-sm text-[#45443E] mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full mb-6 rounded-lg border border-[#9C9A8D] px-3 py-2 text-sm"
          placeholder="••••••••"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1A1A18] text-white rounded-lg py-2 text-sm font-medium disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
