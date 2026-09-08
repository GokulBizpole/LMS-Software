// app/(auth)/login/page.tsx
"use client";

import { useState, type SubmitEvent } from "react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/utils/getErrorMessage";

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      // AuthContext redirects to /dashboard (admin) or /partner/dashboard (partner)
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Login failed"));
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
        <Image src="/logo.svg" alt="SKA Trust" width={48} height={48} className="mb-3" />
        <h1 className="text-lg font-semibold text-[#1A1A18] mb-1">
          SKA Trust
        </h1>
        <p className="text-[10px] tracking-wide text-[#6B6A62] uppercase mb-4">
          Loans you can rely on
        </p>
        <p className="text-sm text-[#6B6A62] mb-6">
          Sign in with your admin or partner account.
        </p>

        <label className="block text-sm text-[#45443E] mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full mb-4 rounded-lg border border-[#9C9A8D] px-3 py-2 text-sm"
          placeholder="you@skatrust.com"
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
