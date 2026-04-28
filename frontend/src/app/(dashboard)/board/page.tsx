"use client";
import { useState, useMemo } from "react";
import JobCard from "@/components/jobs/JobCard";
import JobFormModal from "@/components/jobs/JobFormModal";
import { useJobStore } from "./jobStore";
import { Job } from "@/types";
import { JobStatus } from "@/types";
import {
  STATUS_CONFIG,
  STATUS_ORDER,
  getFollowUpUrgency,
  formatSalary,
} from "@/lib/utils";
import {
  Briefcase,
  Plus,
  Search,
  TrendingUp,
  Bell,
  LogOut,
  Archive,
  X,
  ChevronDown,
} from "lucide-react";

type FilterStatus = "all" | JobStatus;

const mockJob: Job = {
  id: "1",
  userId: "user_1",
  company: "Stripe",
  role: "Senior Frontend Engineer",
  status: "applied",
  url: "https://stripe.com/jobs",
  source: "LinkedIn",
  appliedDate: "2024-04-01",
  followUpDate: "2024-04-10",
  resumeLabel: "resume-stripe-v2.pdf",
  salaryMin: 140000,
  salaryMax: 180000,
  notes: "Great company culture",
  jobDescription: "Build and maintain frontend systems...",
  contactName: "Sarah Kim",
  contactEmail: "sarah@stripe.com",
  isArchived: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// ── Stat card ─────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  colorClass,
  bgClass,
  isActive,
  onClick,
}: {
  label: string;
  value: number;
  colorClass: string;
  bgClass: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl p-4 text-left transition-all border ${
        isActive
          ? `${bgClass} border-current ${colorClass} shadow-sm`
          : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm text-slate-600"
      }`}
    >
      <p
        style={{ fontSize: "1.625rem", fontWeight: 700, lineHeight: 1 }}
        className={isActive ? colorClass : "text-slate-800"}
      >
        {value}
      </p>
      <p className="mt-1" style={{ fontSize: "0.8125rem" }}>
        {label}
      </p>
    </button>
  );
}

export default function BoardPage() {
  const auth = "";
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const store = useJobStore(auth ? "" : "");
  const [showModal, setShowModal] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  // ── Stats ──────────────────────────────────────────────────────
  const activeJobs = store.jobs.filter((j) => !j.isArchived);
  const stats = useMemo(
    () => ({
      all: activeJobs.length,
      saved: activeJobs.filter((j) => j.status === "saved").length,
      applied: activeJobs.filter((j) => j.status === "applied").length,
      interview: activeJobs.filter((j) => j.status === "interview").length,
      offer: activeJobs.filter((j) => j.status === "offer").length,
      rejected: activeJobs.filter((j) => j.status === "rejected").length,
    }),
    [activeJobs]
  );

  const statCards = [
    {
      id: "all" as FilterStatus,
      label: "Total",
      value: stats.all,
      colorClass: "text-indigo-600",
      bgClass: "bg-indigo-50",
    },
    {
      id: "saved" as FilterStatus,
      label: "Saved",
      value: stats.saved,
      colorClass: STATUS_CONFIG.saved.color,
      bgClass: STATUS_CONFIG.saved.bg,
    },
    {
      id: "applied" as FilterStatus,
      label: "Applied",
      value: stats.applied,
      colorClass: STATUS_CONFIG.applied.color,
      bgClass: STATUS_CONFIG.applied.bg,
    },
    {
      id: "interview" as FilterStatus,
      label: "Interview",
      value: stats.interview,
      colorClass: STATUS_CONFIG.interview.color,
      bgClass: STATUS_CONFIG.interview.bg,
    },
    {
      id: "offer" as FilterStatus,
      label: "Offers",
      value: stats.offer,
      colorClass: STATUS_CONFIG.offer.color,
      bgClass: STATUS_CONFIG.offer.bg,
    },
    {
      id: "rejected" as FilterStatus,
      label: "Rejected",
      value: stats.rejected,
      colorClass: STATUS_CONFIG.rejected.color,
      bgClass: STATUS_CONFIG.rejected.bg,
    },
  ];
  // ── Filtered list ──────────────────────────────────────────────
  const filteredJobs = useMemo(() => {
    return store.jobs.filter((job) => {
      if (!showArchived && job.isArchived) return false;
      if (showArchived && !job.isArchived) return false;
      const matchStatus = filterStatus === "all" || job.status === filterStatus;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        job.company.toLowerCase().includes(q) ||
        job.role.toLowerCase().includes(q) ||
        (job.source?.toLowerCase().includes(q) ?? false) ||
        (job.contactName?.toLowerCase().includes(q) ?? false);
      return matchStatus && matchSearch;
    });
  }, [store.jobs, filterStatus, searchQuery, showArchived]);
  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-sky-300 rounded-lg flex items-center justify-center">
              <Briefcase size={17} className="text-white" />
            </div>
            <span
              className="text-slate-900"
              style={{ fontWeight: 600, fontSize: "1rem" }}
            >
              JobTracker
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {}}
              className="flex items-center gap-2 px-4 py-2 bg-sky-300 text-white rounded-lg hover:bg-sky-500 active:scale-[0.98] transition-all"
              style={{ fontSize: "0.875rem" }}
            >
              <Plus size={16} />
              Add Job
            </button>

            {/* User avatar + logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 ml-1">
              <div
                className="w-8 h-8 rounded-full bg-sky-300 flex items-center justify-center text-white shrink-0"
                style={{ fontSize: "0.75rem", fontWeight: 700 }}
              >
                {}
              </div>
              <span
                className="text-slate-700 hidden sm:block"
                style={{ fontSize: "0.875rem" }}
              ></span>
              <button
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors ml-1"
                title="Sign out"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* ── Stats dashboard ── */}
        {!showArchived && (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
            {statCards.map((card) => (
              <StatCard
                key={card.id}
                label={card.label}
                value={card.value}
                colorClass={card.colorClass}
                bgClass={card.bgClass}
                isActive={filterStatus === card.id}
                onClick={() =>
                  setFilterStatus((prev) =>
                    prev === card.id && card.id !== "all" ? "all" : card.id
                  )
                }
              />
            ))}
          </div>
        )}
        {/* ── Job grid ── */}

        {filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            {searchQuery || filterStatus !== "all" ? (
              <>
                <Search size={40} className="text-slate-300 mb-3" />
                <h3 className="text-slate-500 mb-2">No jobs found</h3>
                <p
                  className="text-slate-400 mb-4"
                  style={{ fontSize: "0.875rem" }}
                >
                  Try adjusting your search or filter
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterStatus("all");
                  }}
                  className="text-indigo-600 hover:underline"
                  style={{ fontSize: "0.875rem" }}
                >
                  Clear filters
                </button>
              </>
            ) : showArchived ? (
              <>
                <Archive size={40} className="text-slate-300 mb-3" />
                <h3 className="text-slate-500 mb-2">No archived jobs</h3>
                <p className="text-slate-400" style={{ fontSize: "0.875rem" }}>
                  Archive applications you're no longer pursuing to keep things
                  tidy.
                </p>
              </>
            ) : (
              <>
                <Briefcase size={40} className="text-slate-300 mb-3" />
                <h3 className="text-slate-500 mb-2">No jobs yet</h3>
                <p
                  className="text-slate-400 mb-4"
                  style={{ fontSize: "0.875rem" }}
                >
                  Start tracking your job search
                </p>
                <button
                  onClick={() => (true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus size={16} /> Add Your First Job
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onClick={() =>
                  setSelectedJobId(job.id === selectedJobId ? null : job.id)
                }
                isSelected={job.id === selectedJobId}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
