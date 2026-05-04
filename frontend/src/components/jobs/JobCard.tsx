import { useState } from "react";
import { Job, JobStatus } from "../../types/index";
import { formatDate, STATUS_CONFIG, getInitials } from "../../lib/utils";
import { Copy, Pencil, Trash2, ChevronDown } from "lucide-react";

interface JobCardProps {
  job: Job;
  onClick: () => void;
  isSelected: boolean;
  onStatusChange: (jobId: string, status: JobStatus) => void;
  // onEdit?: (job: Job) => void;
  onDelete: (jobId: string) => void;
}

const STATUS_ACCENTS: Record<string, { color: string; bg: string; border: string; bar: string }> = {
  saved:     { color: "#7b8fdc", bg: "rgba(123,143,220,0.08)", border: "rgba(123,143,220,0.22)", bar: "#7b8fdc" },
  applied:   { color: "#b8820a", bg: "rgba(184,130,10,0.08)",  border: "rgba(184,130,10,0.22)",  bar: "#b8820a" },
  interview: { color: "#5a9e7a", bg: "rgba(90,158,122,0.08)",  border: "rgba(90,158,122,0.22)",  bar: "#5a9e7a" },
  offer:     { color: "#5a9e7a", bg: "rgba(90,158,122,0.08)",  border: "rgba(90,158,122,0.22)",  bar: "#5a9e7a" },
  rejected:  { color: "#c96b6b", bg: "rgba(201,107,107,0.08)", border: "rgba(201,107,107,0.22)", bar: "#c96b6b" },
};

const STATUS_ORDER: JobStatus[] = ["saved", "applied", "interview", "offer", "rejected"];
const DEFAULT_ACCENT = { color: "#8a8474", bg: "rgba(138,132,116,0.08)", border: "rgba(138,132,116,0.22)", bar: "#b8b2a4" };

export default function JobCard({ job, onClick, isSelected, onStatusChange, onDelete }: JobCardProps) {
  const [hovered, setHovered] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const statusCfg = STATUS_CONFIG[job.status];
  const accent = STATUS_ACCENTS[job.status] ?? DEFAULT_ACCENT;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(job.id);
  };

  // const handleEdit = (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   onEdit?.(job);
  // };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDelete) {
      onDelete(job.id);
    } else {
      setConfirmDelete(true);
      // auto-reset confirm after 3s if user doesn't click again
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowStatusMenu((v) => !v);
  };

  const handleStatusSelect = (e: React.MouseEvent, status: JobStatus) => {
    e.stopPropagation();
    onStatusChange(job.id, status);
    setShowStatusMenu(false);
  };

  return (
    <>
      <style>{`
        @keyframes action-bar-in {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes status-menu-in {
          from { opacity: 0; transform: translateY(-4px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .jc-action-bar { animation: action-bar-in 0.15s ease both; }
        .jc-status-menu { animation: status-menu-in 0.12s ease both; }
      `}</style>

      <div
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setShowStatusMenu(false); setConfirmDelete(false); }}
        style={{
          background: "#fff",
          border: `1px solid ${isSelected ? accent.border : hovered ? "#d0cbc0" : "#e8e4dc"}`,
          borderRadius: "6px",
          cursor: "pointer",
          overflow: "visible", // allow status menu to overflow
          transition: "border-color 0.18s, box-shadow 0.18s",
          boxShadow: isSelected
            ? `0 0 0 3px ${accent.bg}`
            : hovered
            ? "0 2px 8px rgba(26,25,22,0.06)"
            : "none",
          fontFamily: "'Instrument Sans', sans-serif",
          position: "relative",
        }}
      >
        {/* Status accent bar */}
        <div style={{ height: "2px", background: accent.bar, borderRadius: "6px 6px 0 0" }} />

        <div style={{ padding: "16px" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
              {/* Initials avatar */}
              <div style={{
                width: "36px", height: "36px", flexShrink: 0,
                background: accent.bg,
                border: `1px solid ${accent.border}`,
                borderRadius: "4px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "11px", fontWeight: 600,
                fontFamily: "'DM Mono', monospace",
                color: accent.color,
                letterSpacing: "0.04em",
              }}>
                {getInitials(job.company)}
              </div>

              <div style={{ minWidth: 0 }}>
                <p style={{
                  fontSize: "14px", fontWeight: 600,
                  color: "#1a1916", margin: 0,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {job.title}
                </p>
                <p style={{
                  fontSize: "12px", color: "#8a8474", margin: 0,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  fontFamily: "'DM Mono', monospace",
                }}>
                  {job.company}
                </p>
              </div>
            </div>

            {/* Status badge — clickable to open menu */}
            <div style={{ position: "relative", flexShrink: 0, marginLeft: "8px" }}>
              <button
                onClick={handleStatusClick}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "5px",
                  padding: "3px 8px",
                  background: accent.bg,
                  border: `1px solid ${showStatusMenu ? accent.color : accent.border}`,
                  borderRadius: "2px",
                  fontSize: "10px",
                  fontFamily: "'DM Mono', monospace",
                  color: accent.color,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "border-color 0.15s",
                }}
              >
                <span style={{
                  width: "5px", height: "5px",
                  borderRadius: "50%",
                  background: accent.color,
                  display: "inline-block",
                }} />
                {statusCfg.label}
                <ChevronDown
                  size={9}
                  style={{
                    transition: "transform 0.15s",
                    transform: showStatusMenu ? "rotate(180deg)" : "none",
                    marginLeft: "1px",
                  }}
                />
              </button>

              {/* Status dropdown */}
              {showStatusMenu && (
                <div
                  className="jc-status-menu"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: "absolute", top: "calc(100% + 4px)", right: 0,
                    background: "#fff",
                    border: "1px solid #e8e4dc",
                    borderRadius: "4px",
                    boxShadow: "0 4px 16px rgba(26,25,22,0.10)",
                    zIndex: 20,
                    minWidth: "130px",
                    overflow: "hidden",
                  }}
                >
                  {STATUS_ORDER.map((s) => {
                    const a = STATUS_ACCENTS[s] ?? DEFAULT_ACCENT;
                    const cfg = STATUS_CONFIG[s];
                    const isCurrent = s === job.status;
                    return (
                      <button
                        key={s}
                        onClick={(e) => handleStatusSelect(e, s)}
                        style={{
                          width: "100%", textAlign: "left",
                          display: "flex", alignItems: "center", gap: "8px",
                          padding: "8px 12px",
                          background: isCurrent ? a.bg : "transparent",
                          border: "none",
                          borderBottom: "1px solid #f4f2ee",
                          fontSize: "11px",
                          fontFamily: "'DM Mono', monospace",
                          color: isCurrent ? a.color : "#5a5650",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          cursor: isCurrent ? "default" : "pointer",
                          transition: "background 0.12s",
                        }}
                        onMouseEnter={(e) => { if (!isCurrent) e.currentTarget.style.background = "#f4f2ee"; }}
                        onMouseLeave={(e) => { if (!isCurrent) e.currentTarget.style.background = "transparent"; }}
                      >
                        <span style={{
                          width: "6px", height: "6px", borderRadius: "50%",
                          background: a.color, flexShrink: 0,
                        }} />
                        {cfg.label}
                        {isCurrent && (
                          <span style={{ marginLeft: "auto", fontSize: "9px", opacity: 0.5 }}>current</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Source tag */}
          {job.source && job.source.length > 0 && (
            <div style={{ marginBottom: "10px" }}>
              <span style={{
                fontSize: "10px",
                fontFamily: "'DM Mono', monospace",
                padding: "2px 7px",
                background: "#f4f2ee",
                border: "1px solid #e8e4dc",
                borderRadius: "2px",
                color: "#8a8474",
                letterSpacing: "0.06em",
              }}>
                {job.source}
              </span>
            </div>
          )}

          {/* Description preview */}
          <p style={{
            fontSize: "12px", color: "#5a5650",
            lineHeight: 1.65,
            margin: job.description ? "0 0 12px" : "0 0 4px",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical" as const,
            overflow: "hidden",
            fontStyle: job.description ? "normal" : "italic",
            opacity: job.description ? 1 : 0.45,
          }}>
            {job.description ?? "No description added"}
          </p>

          {/* Footer */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            paddingTop: "10px", borderTop: "1px solid #f0ede8",
          }}>
            <span style={{
              fontSize: "10px", color: "#b8b2a4",
              fontFamily: "'DM Mono', monospace",
              letterSpacing: "0.04em",
            }}>
              {formatDate(job.createdAt)}
            </span>

            <button
              onClick={handleCopy}
              title="Copy job ID"
              style={{
                display: "flex", alignItems: "center", gap: "4px",
                fontSize: "10px",
                fontFamily: "'DM Mono', monospace",
                color: "#b8b2a4",
                background: "none", border: "none",
                cursor: "pointer",
                letterSpacing: "0.04em",
                padding: 0,
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#b8820a")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#b8b2a4")}
            >
              <Copy size={10} />
              {job.id.slice(0, 8)}
            </button>
          </div>
        </div>

        {/* ── Hover action bar ── */}
        {hovered && (
          <div
            className="jc-action-bar"
            onClick={(e) => e.stopPropagation()}
            style={{
              display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px",
              padding: "6px 12px",
              borderTop: "1px solid #f0ede8",
              background: "#faf9f7",
            }}
          >
            {/* Edit */}
            {/* {onEdit && <button
              onClick={handleEdit}
              title="Edit job"
              style={{
                display: "flex", alignItems: "center", gap: "5px",
                padding: "4px 10px",
                background: "transparent",
                border: "1px solid #e8e4dc",
                borderRadius: "3px",
                fontSize: "10px",
                fontFamily: "'DM Mono', monospace",
                color: "#8a8474",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#b8820a";
                e.currentTarget.style.color = "#b8820a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e8e4dc";
                e.currentTarget.style.color = "#8a8474";
              }}
            >
              <Pencil size={10} />
              Edit
            </button>} */}

            {/* Delete — two-step confirm */}
            <button
              onClick={handleDeleteClick}
              title={confirmDelete ? "Click again to confirm" : "Delete job"}
              style={{
                display: "flex", alignItems: "center", gap: "5px",
                padding: "4px 10px",
                background: confirmDelete ? "rgba(201,107,107,0.08)" : "transparent",
                border: `1px solid ${confirmDelete ? "rgba(201,107,107,0.4)" : "#e8e4dc"}`,
                borderRadius: "3px",
                fontSize: "10px",
                fontFamily: "'DM Mono', monospace",
                color: confirmDelete ? "#c96b6b" : "#8a8474",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!confirmDelete) {
                  e.currentTarget.style.borderColor = "rgba(201,107,107,0.4)";
                  e.currentTarget.style.color = "#c96b6b";
                }
              }}
              onMouseLeave={(e) => {
                if (!confirmDelete) {
                  e.currentTarget.style.borderColor = "#e8e4dc";
                  e.currentTarget.style.color = "#8a8474";
                }
              }}
            >
              <Trash2 size={10} />
              {confirmDelete ? "Confirm?" : "Delete"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}