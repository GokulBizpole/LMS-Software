// types/electron.d.ts
// Types the existing Electron preload bridge (electron/preload.ts) so the
// renderer can call it. Declares the shape only — the bridge itself already
// exists and is unchanged; window.electronAPI is undefined outside Electron.

interface ElectronNotificationResult {
  success: boolean;
  error?: string;
}

interface ElectronAPI {
  isElectron: boolean;
  showNotification: (title: string, body: string) => Promise<ElectronNotificationResult>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
