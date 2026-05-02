import { Job } from "../../types/index";
import { formatDate, STATUS_CONFIG, getInitials, getCompanyColor } from "../../lib/utils";
import { Copy } from "lucide-react";
 
interface JobCardProps {
  job: Job;
  onClick: () => void;
  isSelected: boolean;
}
 
// Map status to our design system accent colors
const STATUS_ACCENTS: Record<string, { color: string; bg: string; border: string; bar: string }> = {
  saved:      { color: "#7b8fdc", bg: "rgba(123,143,220,0.08)", border: "rgba(123,143,220,0.22)", bar: "#7b8fdc" },
  applied:    { color: "#b8820a", bg: "rgba(184,130,10,0.08)",  border: "rgba(184,130,10,0.22)",  bar: "#b8820a" },
  interview:  { color: "#5a9e7a", bg: "rgba(90,158,122,0.08)",  border: "rgba(90,158,122,0.22)",  bar: "#5a9e7a" },
  offer:      { color: "#5a9e7a", bg: "rgba(90,158,122,0.08)",  border: "rgba(90,158,122,0.22)",  bar: "#5a9e7a" },
  rejected:   { color: "#c96b6b", bg: "rgba(201,107,107,0.08)", border: "rgba(201,107,107,0.22)", bar: "#c96b6b" },
};
 
const DEFAULT_ACCENT = { color: "#8a8474", bg: "rgba(138,132,116,0.08)", border: "rgba(138,132,116,0.22)", bar: "#b8b2a4" };
 
export default function JobCard({ job, onClick, isSelected }: JobCardProps) {
  const statusCfg = STATUS_CONFIG[job.status];
  const accent = STATUS_ACCENTS[job.status] ?? DEFAULT_ACCENT;
 
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(job.id);
  };
 
  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff",
        border: `1px solid ${isSelected ? accent.border : "#e8e4dc"}`,
        borderRadius: "6px",
        cursor: "pointer",
        overflow: "hidden",
        transition: "border-color 0.18s, box-shadow 0.18s",
        boxShadow: isSelected ? `0 0 0 3px ${accent.bg}` : "none",
        fontFamily: "'Instrument Sans', sans-serif",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = "#d0cbc0";
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(26,25,22,0.06)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = "#e8e4dc";
          e.currentTarget.style.boxShadow = "none";
        }
      }}
    >
      {/* Status accent bar */}
      <div style={{ height: "2px", background: accent.bar }} />
 
      <div style={{ padding: "16px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
          {/* Company + title */}
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
                {job.company}
              </p>
              <p style={{
                fontSize: "12px", color: "#8a8474", margin: 0,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                fontFamily: "'DM Mono', monospace",
              }}>
                {job.title}
              </p>
            </div>
          </div>
 
          {/* Status badge */}
          <div style={{
            flexShrink: 0, marginLeft: "8px",
            display: "inline-flex", alignItems: "center", gap: "5px",
            padding: "3px 8px",
            background: accent.bg,
            border: `1px solid ${accent.border}`,
            borderRadius: "2px",
            fontSize: "10px",
            fontFamily: "'DM Mono', monospace",
            color: accent.color,
            letterSpacing: "0.08em",
            textTransform: "uppercase" as const,
          }}>
            <span style={{
              width: "5px", height: "5px",
              borderRadius: "50%",
              background: accent.color,
              display: "inline-block",
            }} />
            {statusCfg.label}
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
          lineHeight: 1.65, margin: "0 0 12px",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical" as const,
          overflow: "hidden",
        }}>
          {job.description}
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
    </div>
  );
}