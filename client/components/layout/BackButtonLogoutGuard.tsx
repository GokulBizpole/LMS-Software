// components/layout/BackButtonLogoutGuard.tsx
"use client";

import { useCallback, useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useBackButtonLogoutGuard } from "@/hooks/useBackButtonLogoutGuard";
import LogoutConfirmDialog from "@/components/ui/LogoutConfirmDialog";

export default function BackButtonLogoutGuard({ enabled }: { enabled: boolean }) {
  const { logout } = useAuthContext();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleBackPressed = useCallback(() => setShowConfirm(true), []);
  useBackButtonLogoutGuard(enabled, handleBackPressed);

  return (
    <LogoutConfirmDialog
      open={showConfirm}
      onCancel={() => setShowConfirm(false)}
      onConfirm={() => {
        setShowConfirm(false);
        logout();
      }}
    />
  );
}
