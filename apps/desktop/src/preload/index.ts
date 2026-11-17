import { contextBridge, ipcRenderer } from "electron";
import type { CopilotApi } from "../shared/types";

const copilotApi: CopilotApi = {
  getAppVersion: () => ipcRenderer.invoke("app:version"),
  getBackendHealth: () => ipcRenderer.invoke("backend:health"),
  listSessions: () => ipcRenderer.invoke("sessions:list"),
  createSession: (title) => ipcRenderer.invoke("sessions:create", title),
  startSession: (sessionId) => ipcRenderer.invoke("sessions:start", sessionId),
  stopSession: (sessionId) => ipcRenderer.invoke("sessions:stop", sessionId)
};

contextBridge.exposeInMainWorld("copilot", copilotApi);
