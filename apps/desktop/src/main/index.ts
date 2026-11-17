import { app, BrowserWindow, ipcMain } from "electron";
import { join } from "node:path";
import type { InterviewSession, SessionList } from "../shared/types";

const BACKEND_URL = "http://127.0.0.1:8000";

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

  if (process.env.ELECTRON_RENDERER_URL) {
    void window.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    void window.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
