import { app, BrowserWindow, ipcMain } from "electron";
import { join } from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import type { InterviewSession, ScreenPrivacyStatus, SessionList } from "../shared/types";

const BACKEND_URL = "http://127.0.0.1:8000";
const PRIVACY_SETTINGS_FILE = "desktop-settings.json";
let screenPrivacyProtectionEnabled = true;

async function loadDesktopSettings(): Promise<void> {
  try {
    const raw = await readFile(join(app.getPath("userData"), PRIVACY_SETTINGS_FILE), "utf8");
    const settings = JSON.parse(raw) as { screenPrivacyProtectionEnabled?: unknown };
    if (typeof settings.screenPrivacyProtectionEnabled === "boolean") {
      screenPrivacyProtectionEnabled = settings.screenPrivacyProtectionEnabled;
    }
  } catch {
    // First launch or an unreadable settings file: use the privacy-protective default.
  }
}

async function persistDesktopSettings(): Promise<void> {
  const directory = app.getPath("userData");
  await mkdir(directory, { recursive: true });
  await writeFile(
    join(directory, PRIVACY_SETTINGS_FILE),
    JSON.stringify({ screenPrivacyProtectionEnabled }, null, 2),
    "utf8"
  );
}

function getScreenPrivacyStatus(): ScreenPrivacyStatus {
  const platform = process.platform;
  const supported = platform === "win32" || platform === "darwin";
  const platformName = platform === "win32" ? "Windows" : platform === "darwin" ? "macOS" : platform;
  return {
    enabled: screenPrivacyProtectionEnabled,
    supported,
    platform: platformName,
    message: supported
      ? "The operating system capture-exclusion hint is enabled for this app's windows. Some capture and recording methods may still include them."
      : "This platform does not provide the same supported window capture-exclusion behavior. Treat app content as visible when sharing your screen."
  };
}

function applyScreenPrivacyProtection(): void {
  for (const window of BrowserWindow.getAllWindows()) {
    if (!window.isDestroyed()) window.setContentProtection(screenPrivacyProtectionEnabled);
  }
}

async function backendRequest<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers
      }
    });
  } catch {
    throw new Error("The local backend is offline. Start the FastAPI service and try again.");
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { detail?: string } | null;
    throw new Error(payload?.detail ?? `Backend request failed (${response.status}).`);
  }
  return response.json() as Promise<T>;
}

function registerIpcHandlers(): void {
  ipcMain.handle("app:version", () => app.getVersion());
  ipcMain.handle("backend:health", async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  });
  ipcMain.handle("privacy:get-screen-protection", () => getScreenPrivacyStatus());
  ipcMain.handle("privacy:set-screen-protection", async (_event, enabled: unknown) => {
    if (typeof enabled !== "boolean") throw new Error("Privacy setting must be a boolean.");
    screenPrivacyProtectionEnabled = enabled;
    applyScreenPrivacyProtection();
    await persistDesktopSettings();
    return getScreenPrivacyStatus();
  });
  ipcMain.handle("sessions:list", () => backendRequest<SessionList>("/api/sessions"));
  ipcMain.handle("sessions:create", (_event, title: string) =>
    backendRequest<InterviewSession>("/api/sessions", {
      method: "POST",
      body: JSON.stringify({ title })
    })
  );
  ipcMain.handle("sessions:start", (_event, sessionId: string) =>
    backendRequest<InterviewSession>(`/api/sessions/${encodeURIComponent(sessionId)}/start`, {
      method: "POST"
    })
  );
  ipcMain.handle("sessions:stop", (_event, sessionId: string) =>
    backendRequest<InterviewSession>(`/api/sessions/${encodeURIComponent(sessionId)}/stop`, {
      method: "POST"
    })
  );
}

function createWindow(): void {
  const window = new BrowserWindow({
    width: 1180,
    height: 780,
    minWidth: 900,
    minHeight: 640,
    title: "AI Interview Copilot",
    backgroundColor: "#0b1020",
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  window.setContentProtection(screenPrivacyProtectionEnabled);

  if (process.env.ELECTRON_RENDERER_URL) {
    void window.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    void window.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(async () => {
  await loadDesktopSettings();
  registerIpcHandlers();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
