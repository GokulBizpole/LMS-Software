import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,
});

contextBridge.exposeInMainWorld("accessGate", {
  hasCode: () => ipcRenderer.invoke("access-gate:has-code"),
  createCode: (code: string) => ipcRenderer.invoke("access-gate:create-code", code),
  verifyCode: (code: string) => ipcRenderer.invoke("access-gate:verify-code", code),
  resetCode: () => ipcRenderer.invoke("access-gate:reset-code"),
});
