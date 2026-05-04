"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { clientApi, ApiError } from "@/lib/api";
import type { Job, AiInsight, Resume } from "@/lib/types";
import { useJobEvents } from "@/app/hooks/useJobEvents";
import { ArrowLeft, Play, Save, Zap } from "lucide-react";

// ─── Fonts: add to your layout.tsx or globals.css ───────────────────────────
// @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Mono:wght@400;500&family=Instrument+Sans:wght@400;500;600&display=swap');

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [job, setJob] = useState<Job | null>(null);
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(false);

  const [resume, setResume] = useState<Resume | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeSaving, setResumeSaving] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [resumeNotice, setResumeNotice] = useState<string | null>(null);


  const [editing, setEditing] = useState<
    "title" | "company" | "description" | null
  >(null);
  const [editValues, setEditValues] = useState({
    title: "",
    company: "",
    description: "",
  });
  const [editSaving, setEditSaving] = useState(false);

  const insightsRef = useRef<AiInsight[]>([]);
  useEffect(() => {
    insightsRef.current = insights;
  }, [insights]);

  const fetchInsights = useCallback(async () => {
    try {
      const data = await clientApi.get<AiInsight[]>(`/api/ai/insights/${id}`);
      setInsights(data ?? []);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) setInsights([]);
    }
  }, [id]);

  const fetchResume = useCallback(async () => {
    setResumeLoading(true);
    setResumeError(null);
    try {
      const data = await clientApi.get<Resume>(`/api/resume`);
      setResume(data ?? null);
      setResumeText(data?.rawText ?? "");
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setResume(null);
        setResumeText("");
        return;
      }
      setResumeError(
        err instanceof ApiError ? err.message : "Failed to load resume",
      );
    } finally {
      setResumeLoading(false);
    }
  }, []);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setAnalyzeError("");
    try {
      await clientApi.post(`/api/ai/match/${job?.id}`, {});
      // success — worker is queued, SSE will notify when done
    } catch (e) {
      if (e instanceof ApiError && e.status === 429) {
        setAnalyzeError("You've used all 5 analyses for today. Come back tomorrow.");
      } else if (e instanceof ApiError) {
        setAnalyzeError(e.message);
      } else {
        setAnalyzeError("Something went wrong. Try again.");
      }
    } finally {
      setAnalyzing(false);
    }
  };
  

  useEffect(() => {
    clientApi
      .get<Job>(`/api/jobs/${id}`)
      .then((j) => setJob(j ?? null))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          setJob(null);
          setError("Job not found");
          return;
        }
        setError(err instanceof ApiError ? err.message : "Failed to load job");
      });

    setTimeout(() => {
      void fetchInsights();
      void fetchResume();
    }, 0);
  }, [id, fetchInsights, fetchResume]);

  useJobEvents((jobId) => {
    if (jobId !== id) return;
    setMatchLoading(false);
    void fetchInsights();
  });

  async function saveResume() {
    setResumeSaving(true);
    setResumeError(null);
    setResumeNotice(null);
    try {
      await clientApi.post(`/api/resume`, { rawText: resumeText });
      setResumeNotice("Saved. Embedding running in background.");
      await fetchResume();
    } catch (err) {
      setResumeError(
        err instanceof ApiError ? err.message : "Failed to save resume",
      );
    } finally {
      setResumeSaving(false);
    }
  }

  async function waitForNewInsight(previousTopId?: string | null) {
    const timeoutMs = 45000;
    const intervalMs = 2000;
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      await new Promise((r) => setTimeout(r, intervalMs));
      await fetchInsights();
      const top = insightsRef.current.at(0);
      if (top?.id && top.id !== previousTopId) return;
    }
  }

  async function runMatch() {
    setMatchLoading(true);
    setError(null);
    try {
      const prevTopId = insights.at(0)?.id ?? null;
      await clientApi.post(`/api/ai/match/${id}`, {});
      await waitForNewInsight(prevTopId);
      await fetchInsights();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setMatchLoading(false);
    }
  }

  async function saveEdit() {
    if (!job) return;
    setEditSaving(true);
    try {
      const updated = await clientApi.patch<Job>(`/api/jobs/${job.id}`, {
        title: editValues.title,
        company: editValues.company,
        description: editValues.description,
      });
      setJob(updated);
      setEditing(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save");
    } finally {
      setEditSaving(false);
    }
  }

  function startEdit(field: "title" | "company" | "description") {
    if (!job) return;
    setEditValues({
      title: job.title,
      company: job.company,
      description: job.description ?? "",
    });
    setEditing(field);
  }

  const latest = insights.at(0);

  return (
    <>
      {/* ── Global font import — move to layout.tsx if preferred ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Mono:wght@400;500&family=Instrument+Sans:wght@400;500;600&display=swap');
      `}</style>

      <div
        style={{
          fontFamily: "'Instrument Sans', sans-serif",
          background: "#faf9f7",
          minHeight: "100vh",
          color: "#1a1916",
        }}
      >
        {/* ── Topbar ── */}
        <div
          style={{
            borderBottom: "1px solid #e8e4dc",
            padding: "14px 40px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: "rgba(250,249,247,0.92)",
            backdropFilter: "blur(12px)",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <button
            onClick={() => router.push("/")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "11px",
              color: "#8a8474",
              cursor: "pointer",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 600,
              background: "none",
              border: "none",
              padding: 0,
              fontFamily: "'DM Mono', monospace",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#b8820a")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#8a8474")}
          >
            <ArrowLeft size={13} /> Back
          </button>
          <span style={{ color: "#d0cbc0", fontSize: "14px" }}>/</span>
          <span
            style={{
              fontSize: "12px",
              color: "#8a8474",
              fontFamily: "'DM Mono', monospace",
            }}
          >
            {job?.title ?? "Job Detail"}
          </span>
        </div>

        {/* ── Body grid ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 340px",
            maxWidth: "1100px",
            margin: "0 auto",
          }}
        >
          {/* ════════════════ LEFT / MAIN ════════════════ */}
          <div
            style={{
              padding: "40px 44px 60px 40px",
              borderRight: "1px solid #e8e4dc",
            }}
          >
            {/* Job header */}
            {job ? (
              <div>
                {/* Status badge — unchanged */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "10px",
                    fontFamily: "'DM Mono', monospace",
                    color: "#b8820a",
                    background: "rgba(184,130,10,0.08)",
                    border: "1px solid rgba(184,130,10,0.22)",
                    borderRadius: "2px",
                    padding: "3px 10px",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    marginBottom: "14px",
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: "#b8820a",
                      display: "inline-block",
                    }}
                  />
                  {job.status}
                </div>

                {/* Editable title */}
                {editing === "title" ? (
                  <input
                    autoFocus
                    value={editValues.title}
                    onChange={(e) =>
                      setEditValues((v) => ({ ...v, title: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void saveEdit();
                      if (e.key === "Escape") setEditing(null);
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      boxSizing: "border-box",
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "30px",
                      fontWeight: 600,
                      lineHeight: 1.2,
                      color: "#1a1916",
                      letterSpacing: "-0.02em",
                      background: "#f4f2ee",
                      border: "1px solid rgba(184,130,10,0.4)",
                      borderRadius: "4px",
                      padding: "4px 8px",
                      outline: "none",
                      marginBottom: "8px",
                    }}
                  />
                ) : (
                  <h1
                    onClick={() => startEdit("title")}
                    title="Click to edit"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "30px",
                      fontWeight: 600,
                      lineHeight: 1.2,
                      color: "#1a1916",
                      margin: "0 0 8px",
                      letterSpacing: "-0.02em",
                      cursor: "text",
                      borderRadius: "4px",
                      padding: "4px 8px",
                      marginLeft: "-8px",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f4f2ee")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    {job.title}
                  </h1>
                )}

                {/* Editable company */}
                {editing === "company" ? (
                  <input
                    autoFocus
                    value={editValues.company}
                    onChange={(e) =>
                      setEditValues((v) => ({ ...v, company: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void saveEdit();
                      if (e.key === "Escape") setEditing(null);
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      boxSizing: "border-box",
                      fontSize: "13px",
                      fontFamily: "'DM Mono', monospace",
                      color: "#8a8474",
                      background: "#f4f2ee",
                      border: "1px solid rgba(184,130,10,0.4)",
                      borderRadius: "4px",
                      padding: "3px 8px",
                      outline: "none",
                    }}
                  />
                ) : (
                  <p
                    onClick={() => startEdit("company")}
                    title="Click to edit"
                    style={{
                      fontSize: "13px",
                      color: "#8a8474",
                      fontFamily: "'DM Mono', monospace",
                      margin: 0,
                      cursor: "text",
                      borderRadius: "4px",
                      padding: "3px 8px",
                      marginLeft: "-8px",
                      display: "inline-block",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f4f2ee")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    {job.company}
                  </p>
                )}

                <div
                  style={{ height: 1, background: "#e8e4dc", margin: "24px 0" }}
                />

                <p
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "#b8b2a4",
                    fontWeight: 600,
                    marginBottom: "12px",
                  }}
                >
                  Job Description
                </p>

                {/* Editable description */}
                {editing === "description" ? (
                  <textarea
                    autoFocus
                    value={editValues.description}
                    onChange={(e) =>
                      setEditValues((v) => ({
                        ...v,
                        description: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setEditing(null);
                    }}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      height: "240px",
                      background: "#f4f2ee",
                      border: "1px solid rgba(184,130,10,0.4)",
                      borderRadius: "4px",
                      padding: "16px",
                      outline: "none",
                      resize: "none",
                      fontSize: "13px",
                      lineHeight: 1.75,
                      color: "#5a5650",
                      fontFamily: "'DM Mono', monospace",
                    }}
                  />
                ) : (
                  <div
                    onClick={() => startEdit("description")}
                    title="Click to edit"
                    style={{
                      height: "240px",
                      overflowY: "auto",
                      background: "#f4f2ee",
                      border: "1px solid #e8e4dc",
                      borderRadius: "4px",
                      padding: "16px",
                      cursor: "text",
                      transition: "border-color 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor =
                        "rgba(184,130,10,0.3)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor = "#e8e4dc")
                    }
                  >
                    <p
                      style={{
                        fontSize: "13px",
                        lineHeight: 1.75,
                        color: job.description ? "#5a5650" : "#b8b2a4",
                        whiteSpace: "pre-wrap",
                        margin: 0,
                        fontStyle: job.description ? "normal" : "italic",
                      }}
                    >
                      {job.description ?? "Click to add a description…"}
                    </p>
                  </div>
                )}

                {/* Save / Cancel bar — appears when any field is being edited */}
                {editing && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginTop: "12px",
                      animation: "fade-up 0.15s ease both",
                    }}
                  >
                    <button
                      onClick={() => void saveEdit()}
                      disabled={editSaving}
                      style={{
                        padding: "6px 16px",
                        background: "#b8820a",
                        border: "none",
                        borderRadius: "4px",
                        color: "#fff",
                        fontSize: "11px",
                        fontFamily: "'DM Mono', monospace",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        cursor: editSaving ? "not-allowed" : "pointer",
                        opacity: editSaving ? 0.6 : 1,
                      }}
                    >
                      {editSaving ? "Saving…" : "Save"}
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      style={{
                        padding: "6px 14px",
                        background: "transparent",
                        border: "1px solid #e8e4dc",
                        borderRadius: "4px",
                        color: "#8a8474",
                        fontSize: "11px",
                        fontFamily: "'DM Mono', monospace",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#b8b2a4",
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      {editing !== "description" && "Enter to save · "}Esc to
                      cancel
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: "#8a8474" }}>{error ?? "Loading..."}</p>
            )}
            {/* ── AI Results ── */}
            <div style={{ marginTop: "40px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                }}
              >
                <h2
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#1a1916",
                    margin: 0,
                  }}
                >
                  AI Match Analysis
                </h2>
                {latest && (
                  <span
                    style={{
                      fontSize: "10px",
                      fontFamily: "'DM Mono', monospace",
                      color: "#5a9e7a",
                      background: "rgba(90,158,122,0.1)",
                      border: "1px solid rgba(90,158,122,0.2)",
                      borderRadius: "2px",
                      padding: "3px 8px",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Analysis ready
                  </span>
                )}
              </div>

              {/* Loading pulse */}
              {matchLoading && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    background: "#f4f2ee",
                    border: "1px solid #e8e4dc",
                    borderRadius: "6px",
                    padding: "20px",
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#b8820a",
                      display: "inline-block",
                      animation: "pulse-dot 1.2s ease-in-out infinite",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "13px",
                      color: "#8a8474",
                      fontFamily: "'DM Mono', monospace",
                    }}
                  >
                    Analyzing resume against job requirements...
                  </span>
                  <style>{`@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:0.2}}`}</style>
                </div>
              )}

              {/* Results */}
              {latest && !matchLoading && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                  }}
                >
                  {/* Score */}
                  <div
                    style={{
                      background: "#fff",
                      border: "1px solid #e8e4dc",
                      borderRadius: "6px",
                      padding: "22px 28px",
                      display: "flex",
                      alignItems: "flex-end",
                      gap: "16px",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: "3px",
                        background: "#b8820a",
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "54px",
                        fontWeight: 600,
                        lineHeight: 1,
                        color: "#b8820a",
                        letterSpacing: "-0.03em",
                      }}
                    >
                      {latest.result.matchScore}
                      <span style={{ fontSize: "24px", color: "#d4a84b" }}>
                        %
                      </span>
                    </span>
                    <div style={{ paddingBottom: "6px" }}>
                      <p
                        style={{
                          fontSize: "11px",
                          color: "#8a8474",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          fontFamily: "'DM Mono', monospace",
                          margin: 0,
                        }}
                      >
                        Match Score
                      </p>
                    </div>
                  </div>

                  {/* Skills grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                    }}
                  >
                    {/* Strong matches */}
                    <div
                      style={{
                        background: "#fff",
                        border: "1px solid #e8e4dc",
                        borderTop: "2px solid #5a9e7a",
                        borderRadius: "6px",
                        padding: "16px",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "10px",
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: "#5a9e7a",
                          fontWeight: 600,
                          margin: "0 0 12px",
                        }}
                      >
                        Strong Matches
                      </p>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "6px",
                        }}
                      >
                        {latest.result.strongMatches.map((s, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: "11px",
                              fontFamily: "'DM Mono', monospace",
                              padding: "3px 9px",
                              borderRadius: "2px",
                              background: "rgba(90,158,122,0.09)",
                              color: "#3d7a5a",
                              border: "1px solid rgba(90,158,122,0.15)",
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Missing skills */}
                    <div
                      style={{
                        background: "#fff",
                        border: "1px solid #e8e4dc",
                        borderTop: "2px solid #c96b6b",
                        borderRadius: "6px",
                        padding: "16px",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "10px",
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: "#c96b6b",
                          fontWeight: 600,
                          margin: "0 0 12px",
                        }}
                      >
                        Missing Skills
                      </p>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "6px",
                        }}
                      >
                        {latest.result.missingSkills.map((s, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: "11px",
                              fontFamily: "'DM Mono', monospace",
                              padding: "3px 9px",
                              borderRadius: "2px",
                              background: "rgba(201,107,107,0.08)",
                              color: "#a84848",
                              border: "1px solid rgba(201,107,107,0.15)",
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div
                    style={{
                      background: "#fff",
                      border: "1px solid #e8e4dc",
                      borderLeft: "3px solid #7b8fdc",
                      borderRadius: "0 6px 6px 0",
                      padding: "16px 20px",
                      fontSize: "13px",
                      lineHeight: 1.75,
                      color: "#5a5650",
                      fontStyle: "italic",
                    }}
                  >
                    {latest.result.recommendation}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {!latest && !matchLoading && (
                <div
                  style={{
                    background: "#fff",
                    border: "1px dashed #d8d4cc",
                    borderRadius: "6px",
                    padding: "48px 24px",
                    textAlign: "center",
                    color: "#b8b2a4",
                    fontSize: "13px",
                  }}
                >
                  No analysis yet. Paste your resume and run a match.
                </div>
              )}

              {error && (
                <p
                  style={{
                    fontSize: "12px",
                    color: "#c96b6b",
                    marginTop: "10px",
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  {error}
                </p>
              )}
            </div>
          </div>

          {/* ════════════════ RIGHT / SIDEBAR ════════════════ */}
          <div style={{ padding: "40px 32px 60px" }}>
            {/* Resume panel */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <h2
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "17px",
                    fontWeight: 600,
                    color: "#1a1916",
                    margin: 0,
                  }}
                >
                  Your Resume
                </h2>
                <span
                  style={{
                    fontSize: "11px",
                    fontFamily: "'DM Mono', monospace",
                    color: "#b8b2a4",
                  }}
                >
                  {resumeText.length.toLocaleString()} chars
                </span>
              </div>

              {resumeLoading ? (
                <div
                  style={{
                    height: "220px",
                    background: "#f4f2ee",
                    border: "1px solid #e8e4dc",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#b8b2a4",
                      fontFamily: "'DM Mono', monospace",
                    }}
                  >
                    Loading...
                  </span>
                </div>
              ) : (
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste resume text here..."
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    height: "220px",
                    background: "#f4f2ee",
                    border: "1px solid #e8e4dc",
                    borderRadius: "4px",
                    color: "#1a1916",
                    fontSize: "12px",
                    fontFamily: "'DM Mono', monospace",
                    lineHeight: 1.65,
                    padding: "14px",
                    resize: "none",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "rgba(184,130,10,0.4)")
                  }
                  onBlur={(e) => (e.target.style.borderColor = "#e8e4dc")}
                />
              )}

              <button
                onClick={saveResume}
                disabled={resumeSaving || !resumeText.trim()}
                style={{
                  marginTop: "10px",
                  width: "100%",
                  padding: "9px",
                  background: "transparent",
                  border: "1px solid #d0cbc0",
                  borderRadius: "4px",
                  color: "#8a8474",
                  fontSize: "12px",
                  fontFamily: "'Instrument Sans', sans-serif",
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  cursor:
                    resumeSaving || !resumeText.trim()
                      ? "not-allowed"
                      : "pointer",
                  opacity: resumeSaving || !resumeText.trim() ? 0.4 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!resumeSaving && resumeText.trim()) {
                    e.currentTarget.style.borderColor = "rgba(184,130,10,0.4)";
                    e.currentTarget.style.color = "#b8820a";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#d0cbc0";
                  e.currentTarget.style.color = "#8a8474";
                }}
              >
                <Save size={12} />
                {resumeSaving ? "Saving..." : "Save Resume"}
              </button>

              {resumeNotice && (
                <p
                  style={{
                    fontSize: "11px",
                    fontFamily: "'DM Mono', monospace",
                    color: "#5a9e7a",
                    margin: "8px 0 0",
                  }}
                >
                  {resumeNotice}
                </p>
              )}
              {resumeError && (
                <p
                  style={{
                    fontSize: "11px",
                    fontFamily: "'DM Mono', monospace",
                    color: "#c96b6b",
                    margin: "8px 0 0",
                  }}
                >
                  {resumeError}
                </p>
              )}
            </div>

            {/* ── CTA ── */}
            <div
              style={{
                marginTop: "24px",
                background: "#fff",
                border: "1px solid #e8e4dc",
                borderRadius: "6px",
                overflow: "hidden",
                position: "sticky",
                top: "72px",
              }}
            >
              <div
                style={{
                  padding: "20px 20px 18px",
                  borderBottom: "1px solid #e8e4dc",
                }}
              >
                <p
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "#b8820a",
                    fontWeight: 600,
                    margin: "0 0 6px",
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  AI-Powered
                </p>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#1a1916",
                    margin: "0 0 6px",
                  }}
                >
                  Run Match
                </h3>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#8a8474",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  Compare your resume against this job using Claude AI. Takes
                  ~10 seconds.
                </p>
              </div>

              <button
                onClick={runMatch}
                disabled={matchLoading || !resumeText.trim() || !job}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "16px",
                  background:
                    matchLoading || !resumeText.trim() || !job
                      ? "#e8c87a"
                      : "#b8820a",
                  border: "none",
                  color: "#fff",
                  fontSize: "12px",
                  fontFamily: "'Instrument Sans', sans-serif",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  cursor:
                    matchLoading || !resumeText.trim() || !job
                      ? "not-allowed"
                      : "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!matchLoading && resumeText.trim() && job)
                    e.currentTarget.style.background = "#a07010";
                }}
                onMouseLeave={(e) => {
                  if (!matchLoading && resumeText.trim() && job)
                    e.currentTarget.style.background = "#b8820a";
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  {matchLoading ? (
                    <>
                      <span
                        style={{
                          width: 12,
                          height: 12,
                          border: "2px solid rgba(255,255,255,0.3)",
                          borderTopColor: "#fff",
                          borderRadius: "50%",
                          display: "inline-block",
                          animation: "spin 0.7s linear infinite",
                        }}
                      />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap size={13} />
                      Analyze Match
                    </>
                  )}
                </span>
              </button>
            </div>

            {/* Previous runs */}
            {insights.length > 1 && (
              <div style={{ marginTop: "20px" }}>
                <p
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#b8b2a4",
                    fontWeight: 600,
                    margin: "0 0 10px",
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  Previous Runs
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  {insights.slice(1).map((insight) => (
                    <div
                      key={insight.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        background: "#f4f2ee",
                        border: "1px solid #e8e4dc",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                        color: "#8a8474",
                      }}
                    >
                      <span style={{ fontFamily: "'DM Mono', monospace" }}>
                        {insight.result.matchScore}% match
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Spinner keyframe */}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </>
  );
}
