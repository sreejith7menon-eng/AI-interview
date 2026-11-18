import { FormEvent, useCallback, useEffect, useState } from "react";
import type { InterviewSession, ScreenPrivacyStatus } from "../../shared/types";

type Notice = { kind: "success" | "error"; message: string } | null;

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export default function App() {
  const [version, setVersion] = useState("0.1.0");
  const [backendOnline, setBackendOnline] = useState(false);
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [privacy, setPrivacy] = useState<ScreenPrivacyStatus | null>(null);
  const [privacyBusy, setPrivacyBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  const refresh = useCallback(async () => {
    const online = await window.copilot.getBackendHealth();
    setBackendOnline(online);
    if (!online) {
      setSessions([]);
      setLoading(false);
      return;
    }
    try {
      const result = await window.copilot.listSessions();
      setSessions(result.items);
    } catch (error) {
      setNotice({ kind: "error", message: error instanceof Error ? error.message : "Could not load sessions." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void window.copilot.getAppVersion().then(setVersion);
    void window.copilot.getScreenPrivacyStatus().then(setPrivacy);
    void refresh();
  }, [refresh]);

  async function togglePrivacyProtection() {
    if (!privacy) return;
    setPrivacyBusy(true);
    setNotice(null);
    try {
      const updated = await window.copilot.setScreenPrivacyProtection(!privacy.enabled);
      setPrivacy(updated);
      setNotice({ kind: "success", message: updated.enabled ? "Screen privacy protection enabled." : "Screen privacy protection disabled." });
    } catch (error) {
      setNotice({ kind: "error", message: error instanceof Error ? error.message : "Could not update screen privacy protection." });
    } finally {
      setPrivacyBusy(false);
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    setBusyId("new");
    setNotice(null);
    try {
      const created = await window.copilot.createSession(cleanTitle);
      setTitle("");
      setNotice({ kind: "success", message: "Interview session created." });
      await refresh();
      setSessions((current) => [created, ...current.filter((item) => item.id !== created.id)]);
    } catch (error) {
      setNotice({ kind: "error", message: error instanceof Error ? error.message : "Could not create session." });
    } finally {
      setBusyId(null);
    }
  }

  async function changeSession(session: InterviewSession, action: "start" | "stop") {
    setBusyId(session.id);
    setNotice(null);
    try {
      if (action === "start") await window.copilot.startSession(session.id);
      else await window.copilot.stopSession(session.id);
      await refresh();
      setNotice({ kind: "success", message: action === "start" ? "Session started." : "Session completed." });
    } catch (error) {
      setNotice({ kind: "error", message: error instanceof Error ? error.message : "Session update failed." });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">AI</div>
          <div><strong>Interview Copilot</strong><span>PRODUCT WORKSPACE</span></div>
        </div>
        <div className="nav-label">WORKSPACE</div>
        <button className="nav-item active"><span>▦</span> Overview</button>
        <button className="nav-item" disabled><span>◷</span> Interview sessions</button>
        <button className="nav-item" disabled><span>▤</span> Candidate profile</button>
        <button className="nav-item" disabled><span>⚙</span> Settings</button>
        <div className="sidebar-bottom">
          <div className="privacy-note"><span className="privacy-dot" /> LOCAL-FIRST BY DESIGN</div>
          <p>Your documents and session data stay on this device unless you explicitly configure an external AI provider.</p>
          <span className="version">Desktop v{version}</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div><span className="eyebrow">YOUR WORKSPACE</span><h1>Overview</h1></div>
          <div className={`backend-pill ${backendOnline ? "online" : "offline"}`}>
            <span /> Backend {backendOnline ? "connected" : "offline"}
          </div>
        </header>

        <section className="welcome">
          <div>
            <span className="eyebrow accent">INTERVIEW PREPARATION, ORGANIZED</span>
            <h2>Think clearly.<br /><em>Show what you know.</em></h2>
            <p>Manage practice sessions and keep your interview preparation in one private workspace.</p>
          </div>
          <div className="welcome-art" aria-hidden="true">
            <div className="orbit orbit-one" /><div className="orbit orbit-two" />
            <div className="orbit-core"><span>AI</span></div>
            <i className="spark spark-one" /><i className="spark spark-two" />
          </div>
        </section>

        <section className="privacy-panel">
          <div className="privacy-panel-copy">
            <span className="eyebrow">SCREEN PRIVACY</span>
            <strong>{privacy?.enabled ? "Capture protection is on" : "Capture protection is off"}</strong>
            <p>{privacy?.message ?? "Checking operating-system privacy support…"}</p>
            <small>{privacy?.supported ? `Supported platform: ${privacy.platform}` : `Limited platform support: ${privacy?.platform ?? "checking"}`}</small>
          </div>
          <button className={`privacy-toggle ${privacy?.enabled ? "enabled" : ""}`} onClick={() => void togglePrivacyProtection()} disabled={!privacy || privacyBusy}>
            {privacyBusy ? "Saving…" : privacy?.enabled ? "Turn off" : "Turn on"}
          </button>
        </section>

        {!backendOnline && (
          <div className="connection-banner">
            <div><strong>Backend not running</strong><p>Start the local FastAPI service to create and manage interview sessions.</p></div>
            <code>py -3.13 -m uvicorn app.main:app --reload --app-dir services/backend --host 127.0.0.1 --port 8000</code>
          </div>
        )}

        {notice && <div className={`notice ${notice.kind}`}>{notice.message}</div>}

        <section className="section-heading">
          <div><span className="eyebrow">YOUR ACTIVITY</span><h2>Interview sessions</h2></div>
          <span className="count-chip">{sessions.length} {sessions.length === 1 ? "SESSION" : "SESSIONS"}</span>
        </section>

        <section className="session-create">
          <div className="create-icon">＋</div>
          <div className="create-copy"><strong>Start with a new session</strong><span>Create a workspace for your next interview or practice run.</span></div>
          <form onSubmit={handleCreate}>
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Senior IT Operations interview" maxLength={120} aria-label="Session title" disabled={!backendOnline} />
            <button type="submit" disabled={!backendOnline || !title.trim() || busyId === "new"}>{busyId === "new" ? "Creating…" : "Create session"} <span>→</span></button>
          </form>
        </section>

        <section className="sessions-list">
          {loading ? <div className="empty-state">Loading your sessions…</div> :
            sessions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">◷</div>
                <strong>No sessions yet</strong>
                <span>Your interview sessions will appear here once you create one.</span>
              </div>
            ) : sessions.map((session) => (
              <article className="session-card" key={session.id}>
                <div className="session-symbol">◷</div>
                <div className="session-info">
                  <strong>{session.title}</strong>
                  <span>Created {formatDate(session.created_at)}</span>
                </div>
                <span className={`status-badge ${session.status}`}>{session.status}</span>
                {session.status === "created" && <button className="action-button" disabled={busyId === session.id} onClick={() => void changeSession(session, "start")}>Start session</button>}
                {session.status === "active" && <button className="action-button stop" disabled={busyId === session.id} onClick={() => void changeSession(session, "stop")}>End session</button>}
                {session.status === "completed" && <span className="completed-label">Completed</span>}
              </article>
            ))
          }
        </section>
        <footer>AI Interview Copilot <span>•</span> Local desktop workspace</footer>
      </main>
    </div>
  );
}
