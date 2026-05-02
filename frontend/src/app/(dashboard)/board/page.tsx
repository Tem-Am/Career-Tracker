"use client";
import { useEffect, useMemo, useState } from "react";
import JobCard from "@/components/jobs/JobCard";
import JobFormModal from "@/components/jobs/JobFormModal";
import { Job } from "@/types";
import { JobStatus } from "@/types";
import { STATUS_CONFIG } from "@/lib/utils";
import { Briefcase, Plus, Search, LogOut, Zap } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { clearAuth, getToken, getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

// ── Fonts: add to globals.css ──────────────────────────────────────────────
// @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Mono:wght@400;500&family=Instrument+Sans:wght@400;500;600&display=swap');

type FilterStatus = "all" | JobStatus;

// ── Stat card ──────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  accentColor,
  accentBg,
  accentBorder,
  isActive,
  onClick,
}: {
  label: string;
  value: number;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: isActive ? accentBg : "#fff",
        border: `1px solid ${isActive ? accentBorder : "#e8e4dc"}`,
        borderTop: isActive ? `2px solid ${accentColor}` : `2px solid transparent`,
        borderRadius: "6px",
        padding: "14px 16px",
        textAlign: "left",
        cursor: "pointer",
        transition: "all 0.18s",
        fontFamily: "'Instrument Sans', sans-serif",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.borderColor = "#d0cbc0";
          e.currentTarget.style.borderTopColor = accentColor;
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.borderColor = "#e8e4dc";
          e.currentTarget.style.borderTopColor = "transparent";
        }
      }}
    >
      <p style={{
        fontSize: "26px", fontWeight: 600, lineHeight: 1, margin: "0 0 4px",
        fontFamily: "'Playfair Display', serif",
        color: isActive ? accentColor : "#1a1916",
      }}>
        {value}
      </p>
      <p style={{
        fontSize: "11px", margin: 0, letterSpacing: "0.08em",
        textTransform: "uppercase" as const,
        fontFamily: "'DM Mono', monospace",
        color: isActive ? accentColor : "#8a8474",
      }}>
        {label}
      </p>
    </button>
  );
}

export default function BoardPage() {
  const router = useRouter();
  const [token] = useState<string | null>(() => getToken());
  const [userEmail] = useState<string>(() => getUser()?.email ?? "");

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobsError, setJobsError] = useState<string>("");

  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      setLoadingJobs(true);
      setJobsError("");
      try {
        const rows = await apiFetch<Job[]>("/api/jobs", { token });
        if (!cancelled) setJobs(rows);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load jobs";
        if (!cancelled) setJobsError(message);
      } finally {
        if (!cancelled) setLoadingJobs(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  const stats = useMemo(() => ({
    all: jobs.length,
    saved: jobs.filter((j) => j.status === "saved").length,
    applied: jobs.filter((j) => j.status === "applied").length,
    interview: jobs.filter((j) => j.status === "interview").length,
    offer: jobs.filter((j) => j.status === "offer").length,
    rejected: jobs.filter((j) => j.status === "rejected").length,
  }), [jobs]);

  const statCards = [
    {
      id: "all" as FilterStatus,
      label: "Total",
      value: stats.all,
      accentColor: "#b8820a",
      accentBg: "rgba(184,130,10,0.06)",
      accentBorder: "rgba(184,130,10,0.25)",
    },
    {
      id: "saved" as FilterStatus,
      label: "Saved",
      value: stats.saved,
      accentColor: "#7b8fdc",
      accentBg: "rgba(123,143,220,0.07)",
      accentBorder: "rgba(123,143,220,0.25)",
    },
    {
      id: "applied" as FilterStatus,
      label: "Applied",
      value: stats.applied,
      accentColor: "#b8820a",
      accentBg: "rgba(184,130,10,0.06)",
      accentBorder: "rgba(184,130,10,0.25)",
    },
    {
      id: "interview" as FilterStatus,
      label: "Interview",
      value: stats.interview,
      accentColor: "#5a9e7a",
      accentBg: "rgba(90,158,122,0.07)",
      accentBorder: "rgba(90,158,122,0.25)",
    },
    {
      id: "offer" as FilterStatus,
      label: "Offers",
      value: stats.offer,
      accentColor: "#5a9e7a",
      accentBg: "rgba(90,158,122,0.07)",
      accentBorder: "rgba(90,158,122,0.25)",
    },
    {
      id: "rejected" as FilterStatus,
      label: "Rejected",
      value: stats.rejected,
      accentColor: "#c96b6b",
      accentBg: "rgba(201,107,107,0.07)",
      accentBorder: "rgba(201,107,107,0.25)",
    },
  ];

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchStatus = filterStatus === "all" || job.status === filterStatus;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        job.company.toLowerCase().includes(q) ||
        job.title.toLowerCase().includes(q) ||
        (job.source?.toLowerCase().includes(q) ?? false);
      return matchStatus && matchSearch;
    });
  }, [jobs, filterStatus, searchQuery]);

  const onLogout = () => {
    clearAuth();
    router.replace("/login");
  };

  const onCreateJob = async (input: Omit<Job, "id" | "userId" | "createdAt">) => {
    if (!token) return;
    const created = await apiFetch<Job>("/api/jobs", {
      method: "POST",
      token,
      body: input,
    });
    setJobs((prev) => [created, ...prev]);
    setShowModal(false);
  };

  const initials = (userEmail?.[0] ?? "?").toUpperCase();
  const activeCard = statCards.find((c) => c.id === filterStatus);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Mono:wght@400;500&family=Instrument+Sans:wght@400;500;600&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fade-up { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .board-job-grid { animation: fade-up 0.3s ease both; }
      `}</style>

      <div style={{
        fontFamily: "'Instrument Sans', sans-serif",
        background: "#faf9f7",
        minHeight: "100vh",
        color: "#1a1916",
      }}>

        {/* ── Topbar ── */}
        <header style={{
          borderBottom: "1px solid #e8e4dc",
          padding: "0 40px",
          background: "rgba(250,249,247,0.92)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 30,
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "30px", height: "30px",
              background: "#b8820a",
              borderRadius: "4px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Briefcase size={15} color="#fff" />
            </div>
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "17px", fontWeight: 600,
              color: "#1a1916", letterSpacing: "-0.01em",
            }}>
              JobTracker
            </span>
          </div>

          {/* Right */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={() => setShowModal(true)}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "7px 14px",
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
              onMouseEnter={(e) => (e.currentTarget.style.background = "#a07010")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#b8820a")}
            >
              <Plus size={13} />
              Add Job
            </button>

            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              paddingLeft: "10px",
              borderLeft: "1px solid #e8e4dc",
            }}>
              <div style={{
                width: "30px", height: "30px",
                borderRadius: "50%",
                background: "rgba(184,130,10,0.12)",
                border: "1px solid rgba(184,130,10,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: 600, color: "#b8820a",
                fontFamily: "'DM Mono', monospace",
              }} suppressHydrationWarning>
                {initials}
              </div>
              <span style={{
                fontSize: "12px", color: "#8a8474",
                fontFamily: "'DM Mono', monospace",
              }} suppressHydrationWarning>
                {userEmail}
              </span>
              <button
                onClick={onLogout}
                title="Sign out"
                style={{
                  width: "28px", height: "28px",
                  borderRadius: "4px",
                  border: "1px solid #e8e4dc",
                  background: "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                  color: "#b8b2a4",
                  transition: "all 0.2s",
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
                <LogOut size={13} />
              </button>
            </div>
          </div>
        </header>

        <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 40px 80px" }}>

          {/* ── Page heading ── */}
          <div style={{ marginBottom: "32px" }}>
            <p style={{
              fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase",
              color: "#b8820a", fontWeight: 600, margin: "0 0 6px",
              fontFamily: "'DM Mono', monospace",
            }}>
              Dashboard
            </p>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "28px", fontWeight: 600, color: "#1a1916",
              margin: 0, letterSpacing: "-0.02em",
            }}>
              Your Job Board
            </h1>
          </div>

          {/* ── Stat cards ── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: "10px",
            marginBottom: "32px",
          }}>
            {statCards.map((card) => (
              <StatCard
                key={card.id}
                label={card.label}
                value={card.value}
                accentColor={card.accentColor}
                accentBg={card.accentBg}
                accentBorder={card.accentBorder}
                isActive={filterStatus === card.id}
                onClick={() =>
                  setFilterStatus((prev) =>
                    prev === card.id && card.id !== "all" ? "all" : card.id
                  )
                }
              />
            ))}
          </div>

          {/* ── Search + filter bar ── */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "24px",
          }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search
                size={14}
                style={{
                  position: "absolute", left: "12px",
                  top: "50%", transform: "translateY(-50%)",
                  color: "#b8b2a4",
                  pointerEvents: "none",
                }}
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by company, title, or source…"
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "9px 12px 9px 34px",
                  background: "#fff",
                  border: "1px solid #e8e4dc",
                  borderRadius: "4px",
                  fontSize: "13px",
                  fontFamily: "'Instrument Sans', sans-serif",
                  color: "#1a1916",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(184,130,10,0.4)")}
                onBlur={(e) => (e.target.style.borderColor = "#e8e4dc")}
              />
            </div>

            {/* Active filter pill */}
            {filterStatus !== "all" && activeCard && (
              <div style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "7px 12px",
                background: activeCard.accentBg,
                border: `1px solid ${activeCard.accentBorder}`,
                borderRadius: "4px",
                fontSize: "11px",
                fontFamily: "'DM Mono', monospace",
                color: activeCard.accentColor,
                letterSpacing: "0.08em",
                whiteSpace: "nowrap",
              }}>
                {activeCard.label}
                <button
                  onClick={() => setFilterStatus("all")}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: activeCard.accentColor, fontSize: "14px",
                    lineHeight: 1, padding: "0 0 0 2px", opacity: 0.7,
                  }}
                >×</button>
              </div>
            )}
          </div>

          {/* ── Error ── */}
          {jobsError && (
            <div style={{
              marginBottom: "20px", padding: "12px 16px",
              background: "rgba(201,107,107,0.08)",
              border: "1px solid rgba(201,107,107,0.2)",
              borderLeft: "3px solid #c96b6b",
              borderRadius: "0 4px 4px 0",
              fontSize: "13px", color: "#a84848",
              fontFamily: "'DM Mono', monospace",
            }}>
              {jobsError}
            </div>
          )}

          {/* ── Job grid / states ── */}
          {loadingJobs ? (
            <div style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "60px 0", color: "#8a8474",
              fontSize: "13px", fontFamily: "'DM Mono', monospace",
            }}>
              <span style={{
                width: 14, height: 14,
                border: "2px solid #e8e4dc",
                borderTopColor: "#b8820a",
                borderRadius: "50%",
                display: "inline-block",
                animation: "spin 0.7s linear infinite",
              }} />
              Loading jobs…
            </div>
          ) : filteredJobs.length === 0 ? (
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              padding: "80px 24px", textAlign: "center",
            }}>
              {searchQuery || filterStatus !== "all" ? (
                <>
                  <div style={{
                    width: "48px", height: "48px",
                    background: "#f4f2ee", border: "1px solid #e8e4dc",
                    borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: "16px",
                  }}>
                    <Search size={20} color="#b8b2a4" />
                  </div>
                  <h3 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "18px", color: "#1a1916", margin: "0 0 6px",
                  }}>
                    No jobs found
                  </h3>
                  <p style={{ fontSize: "13px", color: "#8a8474", margin: "0 0 16px" }}>
                    Try adjusting your search or filter
                  </p>
                  <button
                    onClick={() => { setSearchQuery(""); setFilterStatus("all"); }}
                    style={{
                      fontSize: "12px", fontFamily: "'DM Mono', monospace",
                      color: "#b8820a", background: "none", border: "none",
                      cursor: "pointer", letterSpacing: "0.06em",
                      textDecoration: "underline",
                    }}
                  >
                    Clear filters
                  </button>
                </>
              ) : (
                <>
                  <div style={{
                    width: "48px", height: "48px",
                    background: "#f4f2ee", border: "1px solid #e8e4dc",
                    borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: "16px",
                  }}>
                    <Briefcase size={20} color="#b8b2a4" />
                  </div>
                  <h3 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "18px", color: "#1a1916", margin: "0 0 6px",
                  }}>
                    No jobs yet
                  </h3>
                  <p style={{ fontSize: "13px", color: "#8a8474", margin: "0 0 20px" }}>
                    Start tracking your job search
                  </p>
                  <button
                    onClick={() => setShowModal(true)}
                    style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      padding: "9px 18px",
                      background: "#b8820a", border: "none",
                      borderRadius: "4px", color: "#fff",
                      fontSize: "12px", fontFamily: "'Instrument Sans', sans-serif",
                      fontWeight: 600, letterSpacing: "0.08em",
                      textTransform: "uppercase", cursor: "pointer",
                    }}
                  >
                    <Plus size={13} /> Add Your First Job
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Results meta */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: "16px",
              }}>
                <p style={{
                  fontSize: "11px", fontFamily: "'DM Mono', monospace",
                  color: "#b8b2a4", letterSpacing: "0.06em",
                  margin: 0,
                }}>
                  {filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"}
                  {filterStatus !== "all" ? ` · ${filterStatus}` : ""}
                </p>
              </div>

              <div
                className="board-job-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "12px",
                }}
              >
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onClick={() => router.push(`/jobs/${job.id}`)}
                    isSelected={false}
                  />
                ))}
              </div>
            </>
          )}
        </main>

        {showModal && (
          <JobFormModal
            onClose={() => setShowModal(false)}
            onSubmit={(data) => {
              void onCreateJob(data as unknown as Omit<Job, "id" | "userId" | "createdAt">);
            }}
          />
        )}
      </div>
    </>
  );
}