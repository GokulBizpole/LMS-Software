// utils/electronNotify.ts
// Thin wrapper around the existing Electron IPC notification bridge
// (electron/preload.ts -> electron/main.ts "notification:show"). No-ops
// outside Electron (plain browser / dev server), so it's safe to call from
// anywhere without checking the environment first.
export function notifyDesktop(title: string, message: string): void {
  if (typeof window === "undefined") return;

  window.electronAPI?.showNotification(title, message)?.catch(() => {
    // Best-effort only — never let a notification failure affect the caller.
  });
}
