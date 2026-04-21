"use client";

import { useState } from "react";
import JobCard from "@/components/jobs/JobCard";
import JobFormModal from "@/components/jobs/JobFormModal";
import { Job } from "@/types";

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

export default function BoardPage() {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Job Board</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          + Add Job
        </button>
      </div>

      {/* Job cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <JobCard
          job={mockJob}
          onClick={() => setSelectedJobId(mockJob.id)}
          isSelected={selectedJobId === mockJob.id}
        />
      </div>

      {/* Add job modal */}
      {showModal && (
        <JobFormModal
          onSubmit={(data) => {
            console.log("new job:", data);
            setShowModal(false);
          }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}