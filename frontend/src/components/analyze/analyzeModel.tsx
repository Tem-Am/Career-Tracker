import { useEffect, useRef, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { api } from "../../lib/api";

interface AnalyzeResult {
  matchScore: number;
  missingSkills: string[];
  strongMatches: string[];
  recommendation: string;
  remaining: number;
}

interface AnalyzeModalProps {
  onClose: () => void;
  onAddJob: (description: string) => void; // pre-fills JobFormModal
}

export default function AnalyzeModal({ onClose, onAddJob }: AnalyzeModalProps) {
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    // Focus textarea on mount
    textareaRef.current?.focus();
  }, []);

  async function handleAnalyze() {
    if (!description.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await api.post<AnalyzeResult>("/api/ai/analyze", {
        jobDescription: description.trim(),
      });
      setResult(data);
    } catch (e: any) {
      setError(e.message ?? "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const scoreColor = (score: number) => {
    if (score >= 70)
      return {
        bg: "rgba(74,139,74,0.08)",
        border: "rgba(74,139,74,0.25)",
        text: "#3a7a3a",
        dot: "#4a8b4a",
      };
    if (score >= 45)
      return {
        bg: "rgba(184,130,10,0.08)",
        border: "rgba(184,130,10,0.25)",
        text: "#b8820a",
        dot: "#b8820a",
      };
    return {
      bg: "rgba(201,107,107,0.08)",
      border: "rgba(201,107,107,0.25)",
      text: "#c96b6b",
      dot: "#c96b6b",
    };
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    padding: "9px 12px",
    background: "#f4f2ee",
    border: "1px solid #e8e4dc",
    borderRadius: "4px",
    fontSize: "12px",
    fontFamily: "'DM Mono', monospace",
    color: "#1a1916",
    outline: "none",
    transition: "border-color 0.2s",
    resize: "none",
    lineHeight: 1.7,
  };

  return (
    <>
      <style>{`
        @keyframes modal-in { from { opacity:0; transform:translateY(12px) scale(0.98); } to { opacity:1; transform:none; } }
        @keyframes result-in { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .az-modal { animation: modal-in 0.2s ease both; }
        .az-result { animation: result-in 0.25s ease both; }
        .az-textarea:focus { border-color: rgba(184,130,10,0.45) !important; }
        .az-skill-tag { transition: opacity 0.15s; }
        .az-skill-tag:hover { opacity: 0.75; }
      `}</style>

      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          background: "rgba(26,25,22,0.55)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="az-modal"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "relative",
            background: "#faf9f7",
            borderRadius: "6px",
            border: "1px solid #e8e4dc",
            width: "100%",
            maxWidth: "580px",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            fontFamily: "'Instrument Sans', sans-serif",
          }}
        >
          {/* ── Header ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "18px 24px",
              borderBottom: "1px solid #e8e4dc",
              background: "#fff",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  background: "#b8820a",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Sparkles size={14} color="#fff" />
              </div>
              <div>
                <h2
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "#1a1916",
                    margin: 0,
                  }}
                >
                  Analyze Fit
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "4px",
                border: "1px solid #e8e4dc",
                background: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#b8b2a4",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#c96b6b";
                e.currentTarget.style.color = "#c96b6b";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e8e4dc";
                e.currentTarget.style.color = "#b8b2a4";
              }}
            >
              <X size={14} />
            </button>
          </div>

          {/* ── Tab bar — matches JobFormModal exactly ── */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid #e8e4dc",
              background: "#fff",
              padding: "0 24px",
            }}
          >
            <div
              style={{
                padding: "12px 0",
                marginRight: "24px",
                borderBottom: "2px solid #b8820a",
                fontSize: "12px",
                fontFamily: "'DM Mono', monospace",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#b8820a",
              }}
            >
              Job Description
            </div>
          </div>

          {/* ── Body ── */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "24px",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "18px",
              }}
            >
              {/* Textarea */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "10px",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#8a8474",
                    fontWeight: 600,
                    fontFamily: "'DM Mono', monospace",
                    marginBottom: "7px",
                  }}
                >
                  Paste job description{" "}
                  <span style={{ color: "#c96b6b" }}>*</span>
                </label>
                <textarea
                  ref={textareaRef}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setError("");
                  }}
                  placeholder="Paste the full job description here to see how well your resume matches before deciding to apply..."
                  rows={result ? 5 : 10}
                  className="az-textarea"
                  style={{
                    ...inputStyle,
                    ...(result ? {} : {}),
                    transition: "border-color 0.2s, height 0.3s",
                  }}
                />
                {error && (
                  <p
                    style={{
                      fontSize: "11px",
                      color: "#c96b6b",
                      margin: "5px 0 0",
                      fontFamily: "'DM Mono', monospace",
                    }}
                  >
                    {error}
                  </p>
                )}
              </div>

              {/* ── Results ── */}
              {result && (
                <div
                  className="az-result"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                  }}
                >
                  {/* Score card */}
                  {(() => {
                    const c = scoreColor(result.matchScore);
                    return (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "16px",
                          padding: "14px 16px",
                          background: c.bg,
                          border: `1px solid ${c.border}`,
                          borderRadius: "4px",
                        }}
                      >
                        {/* Score ring */}
                        <div
                          style={{
                            flexShrink: 0,
                            width: "52px",
                            height: "52px",
                            borderRadius: "50%",
                            border: `2px solid ${c.border}`,
                            background: "#fff",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "16px",
                              fontWeight: 700,
                              fontFamily: "'Playfair Display', serif",
                              color: c.text,
                              lineHeight: 1,
                            }}
                          >
                            {result.matchScore}
                          </span>
                          <span
                            style={{
                              fontSize: "9px",
                              color: c.text,
                              fontFamily: "'DM Mono', monospace",
                              opacity: 0.7,
                            }}
                          >
                            %
                          </span>
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: "11px",
                              fontFamily: "'DM Mono', monospace",
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              color: c.text,
                              fontWeight: 600,
                              marginBottom: "4px",
                            }}
                          >
                            Match Score
                          </div>
                          <div
                            style={{
                              fontSize: "13px",
                              color: "#3a3830",
                              lineHeight: 1.5,
                            }}
                          >
                            {result.recommendation}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Strong matches */}
                  {result.strongMatches.length > 0 && (
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "10px",
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: "#8a8474",
                          fontWeight: 600,
                          fontFamily: "'DM Mono', monospace",
                          marginBottom: "8px",
                        }}
                      >
                        Strong matches
                      </label>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "6px",
                        }}
                      >
                        {result.strongMatches.map((s) => (
                          <span
                            key={s}
                            className="az-skill-tag"
                            style={{
                              fontSize: "11px",
                              fontFamily: "'DM Mono', monospace",
                              padding: "3px 10px",
                              borderRadius: "3px",
                              background: "rgba(74,139,74,0.09)",
                              border: "1px solid rgba(74,139,74,0.22)",
                              color: "#3a7a3a",
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing skills */}
                  {result.missingSkills.length > 0 && (
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "10px",
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: "#8a8474",
                          fontWeight: 600,
                          fontFamily: "'DM Mono', monospace",
                          marginBottom: "8px",
                        }}
                      >
                        Missing skills
                      </label>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "6px",
                        }}
                      >
                        {result.missingSkills.map((s) => (
                          <span
                            key={s}
                            className="az-skill-tag"
                            style={{
                              fontSize: "11px",
                              fontFamily: "'DM Mono', monospace",
                              padding: "3px 10px",
                              borderRadius: "3px",
                              background: "rgba(201,107,107,0.08)",
                              border: "1px solid rgba(201,107,107,0.22)",
                              color: "#c96b6b",
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Remaining count */}
                  <p
                    style={{
                      fontSize: "11px",
                      color: "#b8b2a4",
                      fontFamily: "'DM Mono', monospace",
                      margin: 0,
                    }}
                  >
                    {result.remaining}{" "}
                    {result.remaining === 1 ? "analysis" : "analyses"} remaining
                    today
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Footer ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 24px",
              borderTop: "1px solid #e8e4dc",
              background: "#fff",
            }}
          >
            {/* Left: hint */}
            <p
              style={{
                fontSize: "11px",
                color: "#b8b2a4",
                fontFamily: "'DM Mono', monospace",
                margin: 0,
              }}
            >
              {result ? "Want to track this role?" : "5 analyses per day"}
            </p>

            {/* Right: actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "8px 14px",
                  background: "transparent",
                  border: "1px solid #e8e4dc",
                  borderRadius: "4px",
                  color: "#8a8474",
                  fontSize: "12px",
                  fontFamily: "'Instrument Sans', sans-serif",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#d0cbc0";
                  e.currentTarget.style.color = "#1a1916";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e8e4dc";
                  e.currentTarget.style.color = "#8a8474";
                }}
              >
                Cancel
              </button>

              {result ? (
                /* After analysis: two actions */
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setResult(null);
                      setDescription("");
                      textareaRef.current?.focus();
                    }}
                    style={{
                      padding: "8px 14px",
                      background: "transparent",
                      border: "1px solid #e8e4dc",
                      borderRadius: "4px",
                      color: "#8a8474",
                      fontSize: "12px",
                      fontFamily: "'Instrument Sans', sans-serif",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#d0cbc0";
                      e.currentTarget.style.color = "#1a1916";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e8e4dc";
                      e.currentTarget.style.color = "#8a8474";
                    }}
                  >
                    Try another
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onAddJob(description);
                      onClose();
                    }}
                    style={{
                      padding: "8px 20px",
                      background: "#b8820a",
                      border: "none",
                      borderRadius: "4px",
                      color: "#fff",
                      fontSize: "12px",
                      fontFamily: "'Instrument Sans', sans-serif",
                      fontWeight: 600,
                      letterSpacing: "0.07em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#a07010")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#b8820a")
                    }
                  >
                    Add Job →
                  </button>
                </>
              ) : (
                /* Before analysis: analyze button */
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={loading || !description.trim()}
                  style={{
                    padding: "8px 20px",
                    background:
                      loading || !description.trim() ? "#d4c89a" : "#b8820a",
                    border: "none",
                    borderRadius: "4px",
                    color: "#fff",
                    fontSize: "12px",
                    fontFamily: "'Instrument Sans', sans-serif",
                    fontWeight: 600,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    cursor:
                      loading || !description.trim()
                        ? "not-allowed"
                        : "pointer",
                    transition: "background 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                  onMouseEnter={(e) => {
                    if (!loading && description.trim())
                      e.currentTarget.style.background = "#a07010";
                  }}
                  onMouseLeave={(e) => {
                    if (!loading && description.trim())
                      e.currentTarget.style.background = "#b8820a";
                  }}
                >
                  {loading ? (
                    <>
                      <span
                        style={{
                          display: "inline-block",
                          width: "10px",
                          height: "10px",
                          border: "1.5px solid rgba(255,255,255,0.35)",
                          borderTopColor: "#fff",
                          borderRadius: "50%",
                          animation: "spin 0.7s linear infinite",
                        }}
                      />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={12} />
                      Analyze
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
