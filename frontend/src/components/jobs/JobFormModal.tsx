import { useEffect, useState } from "react";
import { Job, JobStatus } from "../../types/index";
import { STATUS_CONFIG, STATUS_ORDER } from "../../lib/utils";
import { Briefcase, ChevronDown, X } from "lucide-react";

interface JobFormModalProps {
  existingJob?: Job;
  onSubmit: (data: Omit<Job, "id" | "userId" | "createdAt">) => void;
  onClose: () => void;
}

type Section = "basic" | "description";

const SECTIONS: { id: Section; label: string }[] = [
  { id: "basic",       label: "Basic Info" },
  { id: "description", label: "Description" },
];

export default function JobFormModal({ existingJob, onSubmit, onClose }: JobFormModalProps) {
  const [section, setSection] = useState<Section>("basic");
  const [form, setForm] = useState({
    company:     existingJob?.company     ?? "",
    title:       existingJob?.title       ?? "",
    status:      (existingJob?.status     ?? "saved") as JobStatus,
    source:      existingJob?.source      ?? "",
    description: existingJob?.description ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const set = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.company.trim())     errs.company     = "Company is required";
    if (!form.title.trim())       errs.title       = "Title is required";
    if (!form.description.trim()) errs.description = "Description is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) { setSection("basic"); return; }
    onSubmit({
      company:     form.company.trim(),
      title:       form.title.trim(),
      status:      form.status,
      source:      form.source.trim() || null,
      description: form.description.trim(),
    });
  };

  // Shared input style factory
  const inputStyle = (field: string): React.CSSProperties => ({
    width: "100%",
    boxSizing: "border-box",
    padding: "9px 12px",
    background: errors[field] ? "rgba(201,107,107,0.05)" : "#f4f2ee",
    border: `1px solid ${errors[field] ? "rgba(201,107,107,0.4)" : "#e8e4dc"}`,
    borderRadius: "4px",
    fontSize: "13px",
    fontFamily: "'Instrument Sans', sans-serif",
    color: "#1a1916",
    outline: "none",
    transition: "border-color 0.2s",
  });

  return (
    <>
      <style>{`
        @keyframes modal-in { from { opacity:0; transform:translateY(12px) scale(0.98); } to { opacity:1; transform:none; } }
        .jf-modal { animation: modal-in 0.2s ease both; }
        .jf-input:focus { border-color: rgba(184,130,10,0.45) !important; }
        .jf-textarea:focus { border-color: rgba(184,130,10,0.45) !important; }
        .jf-select:focus { border-color: rgba(184,130,10,0.45) !important; }
      `}</style>

      {/* Backdrop */}
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 50,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px",
          background: "rgba(26,25,22,0.55)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="jf-modal"
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
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "18px 24px",
            borderBottom: "1px solid #e8e4dc",
            background: "#fff",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "30px", height: "30px", background: "#b8820a",
                borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Briefcase size={14} color="#fff" />
              </div>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "18px", fontWeight: 600, color: "#1a1916", margin: 0,
              }}>
                {existingJob ? "Edit Job" : "Add Job"}
              </h2>
            </div>

            <button
              onClick={onClose}
              style={{
                width: "28px", height: "28px", borderRadius: "4px",
                border: "1px solid #e8e4dc", background: "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#b8b2a4", transition: "all 0.15s",
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

          {/* ── Section tabs ── */}
          <div style={{
            display: "flex", gap: 0,
            borderBottom: "1px solid #e8e4dc",
            background: "#fff",
            padding: "0 24px",
          }}>
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSection(s.id)}
                style={{
                  padding: "12px 0",
                  marginRight: "24px",
                  background: "none",
                  border: "none",
                
                  borderBottomStyle: "solid",
                  borderBottomWidth: "2px",
                  borderBottomColor: section === s.id ? "#b8820a" : "transparent",
                
                  fontSize: "12px",
                  fontFamily: "'DM Mono', monospace",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: section === s.id ? "#b8820a" : "#8a8474",
                  cursor: "pointer",
                  transition: "color 0.15s",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "24px", flex: 1 }}>

              {/* Basic Info */}
              {section === "basic" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

                  {/* Company */}
                  <div>
                    <label style={{
                      display: "block", fontSize: "10px", letterSpacing: "0.12em",
                      textTransform: "uppercase", color: "#8a8474", fontWeight: 600,
                      fontFamily: "'DM Mono', monospace", marginBottom: "7px",
                    }}>
                      Company <span style={{ color: "#c96b6b" }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={form.company}
                      onChange={(e) => set("company", e.target.value)}
                      placeholder="e.g. Stripe"
                      autoFocus
                      className="jf-input"
                      style={inputStyle("company")}
                    />
                    {errors.company && (
                      <p style={{ fontSize: "11px", color: "#c96b6b", margin: "5px 0 0", fontFamily: "'DM Mono', monospace" }}>
                        {errors.company}
                      </p>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <label style={{
                      display: "block", fontSize: "10px", letterSpacing: "0.12em",
                      textTransform: "uppercase", color: "#8a8474", fontWeight: 600,
                      fontFamily: "'DM Mono', monospace", marginBottom: "7px",
                    }}>
                      Title <span style={{ color: "#c96b6b" }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => set("title", e.target.value)}
                      placeholder="e.g. Frontend Engineer"
                      className="jf-input"
                      style={inputStyle("title")}
                    />
                    {errors.title && (
                      <p style={{ fontSize: "11px", color: "#c96b6b", margin: "5px 0 0", fontFamily: "'DM Mono', monospace" }}>
                        {errors.title}
                      </p>
                    )}
                  </div>

                  {/* Status + Source */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <div>
                      <label style={{
                        display: "block", fontSize: "10px", letterSpacing: "0.12em",
                        textTransform: "uppercase", color: "#8a8474", fontWeight: 600,
                        fontFamily: "'DM Mono', monospace", marginBottom: "7px",
                      }}>
                        Status
                      </label>
                      <div style={{ position: "relative" }}>
                        <select
                          value={form.status}
                          onChange={(e) => set("status", e.target.value)}
                          className="jf-select"
                          style={{
                            ...inputStyle("status"),
                            appearance: "none",
                            paddingRight: "32px",
                            cursor: "pointer",
                          }}
                        >
                          {STATUS_ORDER.map((s) => (
                            <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                          ))}
                        </select>
                        <ChevronDown
                          size={14}
                          style={{
                            position: "absolute", right: "10px", top: "50%",
                            transform: "translateY(-50%)",
                            color: "#b8b2a4", pointerEvents: "none",
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{
                        display: "block", fontSize: "10px", letterSpacing: "0.12em",
                        textTransform: "uppercase", color: "#8a8474", fontWeight: 600,
                        fontFamily: "'DM Mono', monospace", marginBottom: "7px",
                      }}>
                        Source
                      </label>
                      <input
                        type="text"
                        value={form.source}
                        onChange={(e) => set("source", e.target.value)}
                        placeholder="e.g. LinkedIn"
                        className="jf-input"
                        style={inputStyle("source")}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              {section === "description" && (
                <div>
                  <label style={{
                    display: "block", fontSize: "10px", letterSpacing: "0.12em",
                    textTransform: "uppercase", color: "#8a8474", fontWeight: 600,
                    fontFamily: "'DM Mono', monospace", marginBottom: "7px",
                  }}>
                    Job Description <span style={{ color: "#c96b6b" }}>*</span>
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Paste the full job description here..."
                    rows={12}
                    className="jf-textarea"
                    style={{
                      ...inputStyle("description"),
                      resize: "none",
                      lineHeight: 1.7,
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "12px",
                    }}
                  />
                  {errors.description && (
                    <p style={{ fontSize: "11px", color: "#c96b6b", margin: "5px 0 0", fontFamily: "'DM Mono', monospace" }}>
                      {errors.description}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* ── Footer ── */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 24px",
              borderTop: "1px solid #e8e4dc",
              background: "#fff",
            }}>
              {/* Progress dots */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {SECTIONS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSection(s.id)}
                    style={{
                      height: "4px",
                      width: section === s.id ? "20px" : "6px",
                      borderRadius: "2px",
                      background: section === s.id ? "#b8820a" : "#e8e4dc",
                      border: "none", padding: 0, cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  />
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {section === "basic" ? (
                  <button
                    type="button"
                    onClick={() => setSection("description")}
                    style={{
                      padding: "8px 20px",
                      background: "#b8820a", border: "none",
                      borderRadius: "4px", color: "#fff",
                      fontSize: "12px", fontFamily: "'Instrument Sans', sans-serif",
                      fontWeight: 600, letterSpacing: "0.07em",
                      textTransform: "uppercase", cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#a07010")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#b8820a")}
                  >
                    Next
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setSection("basic")}
                      style={{
                        padding: "8px 14px",
                        background: "transparent",
                        border: "1px solid #e8e4dc",
                        borderRadius: "4px",
                        color: "#8a8474",
                        fontSize: "12px", fontFamily: "'Instrument Sans', sans-serif",
                        fontWeight: 500, cursor: "pointer",
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
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      style={{
                        padding: "8px 14px",
                        background: "transparent",
                        border: "1px solid #e8e4dc",
                        borderRadius: "4px",
                        color: "#8a8474",
                        fontSize: "12px", fontFamily: "'Instrument Sans', sans-serif",
                        fontWeight: 500, cursor: "pointer",
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
                    <button
                      type="submit"
                      style={{
                        padding: "8px 20px",
                        background: "#b8820a", border: "none",
                        borderRadius: "4px", color: "#fff",
                        fontSize: "12px", fontFamily: "'Instrument Sans', sans-serif",
                        fontWeight: 600, letterSpacing: "0.07em",
                        textTransform: "uppercase", cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#a07010")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#b8820a")}
                    >
                      {existingJob ? "Save Changes" : "Add Job"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}