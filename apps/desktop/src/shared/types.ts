export type SessionStatus = "created" | "active" | "completed";

export interface InterviewSession {
  id: string;
  title: string;
  status: SessionStatus;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
}

export interface SessionList {
  items: InterviewSession[];
  total: number;
  limit: number;
  offset: number;
}

export interface ScreenPrivacyStatus {
  enabled: boolean;
  supported: boolean;
  platform: string;
  message: string;
}

export interface CopilotApi {
  getAppVersion: () => Promise<string>;
  getBackendHealth: () => Promise<boolean>;
  getScreenPrivacyStatus: () => Promise<ScreenPrivacyStatus>;
  setScreenPrivacyProtection: (enabled: boolean) => Promise<ScreenPrivacyStatus>;
  listSessions: () => Promise<SessionList>;
  createSession: (title: string) => Promise<InterviewSession>;
  startSession: (sessionId: string) => Promise<InterviewSession>;
  stopSession: (sessionId: string) => Promise<InterviewSession>;
}
