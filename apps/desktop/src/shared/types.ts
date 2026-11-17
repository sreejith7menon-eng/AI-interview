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

export interface CopilotApi {
  getAppVersion: () => Promise<string>;
  getBackendHealth: () => Promise<boolean>;
  listSessions: () => Promise<SessionList>;
  createSession: (title: string) => Promise<InterviewSession>;
  startSession: (sessionId: string) => Promise<InterviewSession>;
  stopSession: (sessionId: string) => Promise<InterviewSession>;
}
