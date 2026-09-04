// app/(auth)/forgot-password/page.tsx

import Link from "next/link";
import { KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ECE9DF]">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-[#DAD7CA] p-8 text-center">
        <div className="mb-4 flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-[#ECE9DF]">
          <KeyRound className="h-6 w-6 text-[#45443E]" />
        </div>
        <h1 className="text-lg font-semibold text-[#1A1A18] mb-1">
          Password reset is coming soon
        </h1>
        <p className="text-sm text-[#6B6A62] mb-6">
          Self-service password reset isn&apos;t available yet. Contact your admin to reset your password.
        </p>
        <Link
          href="/login"
          className="inline-block w-full bg-[#1A1A18] text-white rounded-lg py-2 text-sm font-medium"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
