// app/(auth)/login/page.tsx
"use client";

import { useState, type SubmitEvent } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/utils/getErrorMessage";
import BrandLogo from "@/components/ui/BrandLogo";

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center bg-white px-4">
      {/* Decorative background — purely presentational, no content */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[#FCE4E4]" />
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full border border-[#FCE4E4]" />
        <div className="absolute top-24 left-24 w-24 h-24 rounded-full border border-[#FCE4E4]" />
        <div className="absolute top-16 right-16 w-1.5 h-1.5 rounded-full bg-[#F3A5A5]" />
        <div className="absolute top-32 right-28 w-1.5 h-1.5 rounded-full bg-[#F3A5A5]" />
        <div className="absolute top-8 right-8 w-1 h-24 rounded-full bg-[#FCE4E4]" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <BrandLogo size="lg" showTagline />
          <h2 className="text-xl font-bold text-[#1A1A18] mt-5">Welcome back</h2>
          <p className="text-sm text-[#6B6A62]">Sign in with your admin or partner account</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg border border-[#E5E7EB] p-6"
        >
          <label className="block text-sm font-medium text-[#45443E] mb-1">Email address</label>
          <div className="relative mb-4">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C9A8D]" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-[#9C9A8D] pl-9 pr-3 py-2.5 text-sm"
              placeholder="you@skatrust.com"
            />
          </div>

          <label className="block text-sm font-medium text-[#45443E] mb-1">Password</label>
          <div className="relative mb-6">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C9A8D]" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-[#9C9A8D] pl-9 pr-9 py-2.5 text-sm"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9C9A8D] hover:text-[#45443E]"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E31E24] text-white rounded-full py-2.5 text-sm font-semibold hover:bg-[#E31E24]/90 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-xs text-[#9C9A8D] mt-4">Authorized personnel only</p>
      </div>
    </div>
  );
}
