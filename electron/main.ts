import { app, BrowserWindow, ipcMain, dialog } from "electron";
import { autoUpdater } from "electron-updater";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const APP_URL = app.isPackaged
  ? "https://lms-software-gamma.vercel.app/"
  : "http://localhost:3000";

const ACCESS_CODE_PATH = path.join(app.getPath("userData"), "access-code.json");
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30_000;

interface AccessCodeStore {
  salt: string;
  hash: string;
  failedAttempts: number;
  lockedUntil: number;
}

let mainWindow: BrowserWindow | null = null;

function readAccessCodeStore(): AccessCodeStore | null {
  try {
    const raw = fs.readFileSync(ACCESS_CODE_PATH, "utf8");
    return JSON.parse(raw) as AccessCodeStore;
  } catch {
    return null;
  }
}

function writeAccessCodeStore(data: AccessCodeStore) {
  fs.mkdirSync(path.dirname(ACCESS_CODE_PATH), { recursive: true });
  fs.writeFileSync(ACCESS_CODE_PATH, JSON.stringify(data), { mode: 0o600 });
}

function hashCode(code: string, salt: Buffer): string {
  return crypto.scryptSync(code, salt, 64).toString("hex");
}

function isValidCode(code: unknown): code is string {
  return typeof code === "string" && /^[0-9]{4,6}$/.test(code);
}

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1200,
    minHeight: 700,

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "..", "renderer", "access-gate.html"));
};

function unlockToApp() {
  mainWindow?.loadURL(APP_URL);
}

ipcMain.handle("access-gate:has-code", () => {
  return readAccessCodeStore() !== null;
});

ipcMain.handle("access-gate:create-code", (_event, code: unknown) => {
  if (!isValidCode(code)) {
    return { success: false, error: "Access code must be 4 to 6 digits." };
  }

  const salt = crypto.randomBytes(16);
  writeAccessCodeStore({
    salt: salt.toString("hex"),
    hash: hashCode(code, salt),
    failedAttempts: 0,
    lockedUntil: 0,
  });

  unlockToApp();
  return { success: true };
});

ipcMain.handle("access-gate:verify-code", (_event, code: unknown) => {
  const store = readAccessCodeStore();
  if (!store) {
    return { success: false, error: "No access code has been set up yet." };
  }

  const now = Date.now();
  if (store.lockedUntil > now) {
    return { success: false, error: "Too many attempts.", lockedUntil: store.lockedUntil };
  }

  if (!isValidCode(code)) {
    return { success: false, error: "Invalid access code." };
  }

  const salt = Buffer.from(store.salt, "hex");
  const candidate = Buffer.from(hashCode(code, salt), "hex");
  const stored = Buffer.from(store.hash, "hex");
  const matches = candidate.length === stored.length && crypto.timingSafeEqual(candidate, stored);

  if (matches) {
    writeAccessCodeStore({ ...store, failedAttempts: 0, lockedUntil: 0 });
    unlockToApp();
    return { success: true };
  }

  const failedAttempts = store.failedAttempts + 1;
  const lockedOut = failedAttempts >= MAX_ATTEMPTS;
  writeAccessCodeStore({
    ...store,
    failedAttempts: lockedOut ? 0 : failedAttempts,
    lockedUntil: lockedOut ? now + LOCKOUT_MS : 0,
  });

  return {
    success: false,
    error: "Invalid access code.",
    lockedUntil: lockedOut ? now + LOCKOUT_MS : undefined,
  };
});

ipcMain.handle("access-gate:reset-code", () => {
  try {
    fs.unlinkSync(ACCESS_CODE_PATH);
  } catch {
    // already absent — nothing to reset
  }
  return { success: true };
});

function setupAutoUpdater() {
  // We drive the UI ourselves (Update Now/Later, progress, Restart & Install/Later)
  // instead of the default silent auto-download behavior.
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;

  autoUpdater.on("update-available", (info) => {
    dialog
      .showMessageBox(mainWindow!, {
        type: "info",
        title: "Update Available",
        message: `A new version (${info.version}) is available.`,
        detail: "Would you like to download it now?",
        buttons: ["Update Now", "Later"],
        defaultId: 0,
        cancelId: 1,
      })
      .then(({ response }) => {
        if (response === 0) {
          autoUpdater.downloadUpdate();
        }
      });
  });

  autoUpdater.on("download-progress", (progress) => {
    mainWindow?.setProgressBar(progress.percent / 100);
  });

  autoUpdater.on("update-downloaded", (info) => {
    mainWindow?.setProgressBar(-1);
    dialog
      .showMessageBox(mainWindow!, {
        type: "info",
        title: "Update Ready",
        message: `Version ${info.version} has been downloaded.`,
        detail: "Restart the app now to install it?",
        buttons: ["Restart & Install", "Later"],
        defaultId: 0,
        cancelId: 1,
      })
      .then(({ response }) => {
        if (response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
  });

  autoUpdater.on("error", (error) => {
    console.error("Auto-update error:", error);
  });

  autoUpdater.checkForUpdates();
}

app.whenReady().then(() => {
  createWindow();

  // Auto-update only makes sense for a packaged install checking GitHub Releases —
  // never in local/dev mode.
  if (app.isPackaged) {
    setupAutoUpdater();
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
