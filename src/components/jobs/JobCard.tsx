import { Job } from "../../types/index";
import {
  formatDate,
  getFollowUpUrgency,
  STATUS_CONFIG,
  formatSalary,
  getInitials,
  getCompanyColor,
} from "../../lib/utils";
import { Bell, Link, Bookmark } from "lucide-react";

interface JobCardProps {
  job: Job;
  onClick: () => void;
  isSelected: boolean;
}

export default function JobCard({ job, onClick, isSelected }: JobCardProps) {
  const statusCfg = STATUS_CONFIG[job.status];
  const companyColor = getCompanyColor(job.company);
  const salary = formatSalary(job.salaryMin, job.salaryMax);

  const followUpUrgency = job.followUpDate
    ? getFollowUpUrgency(job.followUpDate)
    : null;
  const hasUrgentFollowUp =
    followUpUrgency === "overdue" || followUpUrgency === "soon";
  const hasUpcomingFollowUp = followUpUrgency === "upcoming";

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-xl border cursor-pointer transition-all duration-150 overflow-hidden group
        ${
          isSelected
            ? "border-indigo-400 shadow-lg shadow-indigo-100 ring-2 ring-indigo-200"
            : "border-slate-200 hover:border-slate-300 hover:shadow-md"
        }
        ${job.isArchived ? "opacity-60" : ""}
      `}
    >
      {/* Status accent bar */}
      <div className={`h-1 ${statusCfg.dot}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`${companyColor} rounded-lg w-10 h-10 flex items-center justify-center text-white shrink-0`}
              style={{ fontSize: "0.875rem", fontWeight: 600 }}
            >
              {getInitials(job.company)}
            </div>
            <div className="min-w-0">
              <h3 className="text-slate-900 truncate">{job.company}</h3>
              <p
                className="text-slate-500 truncate"
                style={{ fontSize: "0.8125rem" }}
              >
                {job.role}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {job.isArchived && (
              <span className="text-slate-400" title="Archived">
                <Bookmark size={13} />
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}
              style={{ fontSize: "0.75rem", fontWeight: 500 }}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
              {statusCfg.label}
            </span>
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {salary && (
            <span className="text-slate-500" style={{ fontSize: "0.75rem" }}>
              {salary}
            </span>
          )}
          {job.source && (
            <span
              className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md"
              style={{ fontSize: "0.75rem" }}
            >
              {job.source}
            </span>
          )}
          {job.url && (
            <a
              href={job.url.startsWith("http") ? job.url : `https://${job.url}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-indigo-500 hover:text-indigo-700 transition-colors"
              title="View job posting"
            >
              <Link size={12} />
            </a>
          )}
        </div>

        {/* Applied date */}
        {job.appliedDate && (
          <p className="text-slate-400 mb-3" style={{ fontSize: "0.75rem" }}>
            Applied {formatDate(job.appliedDate)}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="text-slate-400" style={{ fontSize: "0.75rem" }}>
            {job.contactName ? (
              <span className="text-slate-500">{job.contactName}</span>
            ) : (
              <span>No contact</span>
            )}
          </div>

          {hasUrgentFollowUp && (
            <div
              className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded-full"
              style={{ fontSize: "0.75rem", fontWeight: 500 }}
            >
              <Bell size={11} />
              Follow-up due
            </div>
          )}
          {!hasUrgentFollowUp && hasUpcomingFollowUp && (
            <div
              className="flex items-center gap-1 text-amber-600"
              style={{ fontSize: "0.75rem" }}
            >
              <Bell size={11} />
              Follow-up soon
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
