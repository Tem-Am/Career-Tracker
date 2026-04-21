import { useState, useEffect } from 'react';
import { Job, JobStatus } from '../types';
import { STATUS_ORDER, STATUS_CONFIG } from './utils';
import { X, Briefcase, ChevronDown } from 'lucide-react';

interface JobFormModalProps {
  existingJob?: Job;
  onSubmit: (data: Omit<Job, 'id' | 'userId' | 'isArchived' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

type Section = 'basic' | 'description' | 'contact';

const SECTIONS: { id: Section; label: string }[] = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'description', label: 'Description & Notes' },
  { id: 'contact', label: 'Contact' },
];

export function JobFormModal({ existingJob, onSubmit, onClose }: JobFormModalProps) {
  const [section, setSection] = useState<Section>('basic');
  const [form, setForm] = useState({
    company: existingJob?.company ?? '',
    role: existingJob?.role ?? '',
    status: (existingJob?.status ?? 'saved') as JobStatus,
    url: existingJob?.url ?? '',
    source: existingJob?.source ?? '',
    appliedDate: existingJob?.appliedDate ?? '',
    followUpDate: existingJob?.followUpDate ?? '',
    resumeLabel: existingJob?.resumeLabel ?? '',
    salaryMin: existingJob?.salaryMin?.toString() ?? '',
    salaryMax: existingJob?.salaryMax?.toString() ?? '',
    jobDescription: existingJob?.jobDescription ?? '',
    notes: existingJob?.notes ?? '',
    contactName: existingJob?.contactName ?? '',
    contactEmail: existingJob?.contactEmail ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const set = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.company.trim()) errs.company = 'Company is required';
    if (!form.role.trim()) errs.role = 'Role is required';
    if (form.salaryMin && isNaN(parseInt(form.salaryMin))) errs.salaryMin = 'Must be a number';
    if (form.salaryMax && isNaN(parseInt(form.salaryMax))) errs.salaryMax = 'Must be a number';
    if (form.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) {
      errs.contactEmail = 'Enter a valid email';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) { setSection('basic'); return; }
    onSubmit({
      company: form.company.trim(),
      role: form.role.trim(),
      status: form.status,
      url: form.url.trim() || undefined,
      source: form.source.trim() || undefined,
      appliedDate: form.appliedDate || undefined,
      followUpDate: form.followUpDate || undefined,
      resumeLabel: form.resumeLabel.trim() || undefined,
      salaryMin: form.salaryMin ? parseInt(form.salaryMin) : undefined,
      salaryMax: form.salaryMax ? parseInt(form.salaryMax) : undefined,
      jobDescription: form.jobDescription.trim() || undefined,
      notes: form.notes.trim() || undefined,
      contactName: form.contactName.trim() || undefined,
      contactEmail: form.contactEmail.trim() || undefined,
    });
  };

  const inputCls = (field: string) =>
    `w-full px-3 py-2.5 rounded-lg bg-slate-50 border transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 ${errors[field] ? 'border-red-300 bg-red-50' : 'border-slate-200'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Briefcase size={16} className="text-white" />
            </div>
            <h2 className="text-slate-900">{existingJob ? 'Edit Job' : 'Add Job'}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Section tabs */}
        <div className="flex border-b border-slate-100 px-6">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSection(s.id)}
              className={`py-3 px-1 mr-6 border-b-2 transition-colors ${section === s.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              style={{ fontSize: '0.875rem' }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-5">

            {/* ── Basic Info ── */}
            {section === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-slate-700 mb-1.5">Company <span className="text-red-500">*</span></label>
                    <input type="text" value={form.company} onChange={e => set('company', e.target.value)}
                      placeholder="e.g. Stripe" autoFocus className={inputCls('company')} />
                    {errors.company && <p className="text-red-500 mt-1" style={{ fontSize: '0.75rem' }}>{errors.company}</p>}
                  </div>

                  <div className="col-span-2">
                    <label className="block text-slate-700 mb-1.5">Role <span className="text-red-500">*</span></label>
                    <input type="text" value={form.role} onChange={e => set('role', e.target.value)}
                      placeholder="e.g. Senior Frontend Engineer" className={inputCls('role')} />
                    {errors.role && <p className="text-red-500 mt-1" style={{ fontSize: '0.75rem' }}>{errors.role}</p>}
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1.5">Status</label>
                    <div className="relative">
                      <select value={form.status} onChange={e => set('status', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-300">
                        {STATUS_ORDER.map(s => (
                          <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1.5">Source</label>
                    <input type="text" value={form.source} onChange={e => set('source', e.target.value)}
                      placeholder="e.g. LinkedIn, Referral" className={inputCls('source')} />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-slate-700 mb-1.5">Job URL</label>
                    <input type="url" value={form.url} onChange={e => set('url', e.target.value)}
                      placeholder="https://company.com/careers/..." className={inputCls('url')} />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1.5">Applied Date</label>
                    <input type="date" value={form.appliedDate} onChange={e => set('appliedDate', e.target.value)} className={inputCls('appliedDate')} />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1.5">Follow-up Date</label>
                    <input type="date" value={form.followUpDate} onChange={e => set('followUpDate', e.target.value)} className={inputCls('followUpDate')} />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1.5">
                      Min Salary <span className="text-slate-400" style={{ fontSize: '0.8125rem', fontWeight: 400 }}>($/yr)</span>
                    </label>
                    <input type="number" value={form.salaryMin} onChange={e => set('salaryMin', e.target.value)}
                      placeholder="e.g. 120000" className={inputCls('salaryMin')} />
                    {errors.salaryMin && <p className="text-red-500 mt-1" style={{ fontSize: '0.75rem' }}>{errors.salaryMin}</p>}
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1.5">
                      Max Salary <span className="text-slate-400" style={{ fontSize: '0.8125rem', fontWeight: 400 }}>($/yr)</span>
                    </label>
                    <input type="number" value={form.salaryMax} onChange={e => set('salaryMax', e.target.value)}
                      placeholder="e.g. 160000" className={inputCls('salaryMax')} />
                    {errors.salaryMax && <p className="text-red-500 mt-1" style={{ fontSize: '0.75rem' }}>{errors.salaryMax}</p>}
                  </div>

                  <div className="col-span-2">
                    <label className="block text-slate-700 mb-1.5">
                      Resume Label <span className="text-slate-400" style={{ fontSize: '0.8125rem', fontWeight: 400 }}>(file name or version)</span>
                    </label>
                    <input type="text" value={form.resumeLabel} onChange={e => set('resumeLabel', e.target.value)}
                      placeholder="e.g. resume-stripe-v3.pdf" className={inputCls('resumeLabel')} />
                  </div>
                </div>
              </div>
            )}

            {/* ── Description & Notes ── */}
            {section === 'description' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-slate-700 mb-1.5">
                    Job Description <span className="text-slate-400" style={{ fontSize: '0.8125rem', fontWeight: 400 }}>(paste from listing)</span>
                  </label>
                  <textarea value={form.jobDescription} onChange={e => set('jobDescription', e.target.value)}
                    placeholder="Paste the full job description here..."
                    rows={10} className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                    style={{ fontFamily: 'inherit', fontSize: '0.875rem' }} />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1.5">
                    Notes <span className="text-slate-400" style={{ fontSize: '0.8125rem', fontWeight: 400 }}>(interview prep, reminders, thoughts)</span>
                  </label>
                  <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                    placeholder="Any notes about this application..."
                    rows={6} className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                    style={{ fontFamily: 'inherit', fontSize: '0.875rem' }} />
                </div>
              </div>
            )}

            {/* ── Contact ── */}
            {section === 'contact' && (
              <div className="space-y-4">
                <p className="text-slate-500" style={{ fontSize: '0.875rem' }}>
                  Primary contact at this company — recruiter, hiring manager, or referral.
                </p>
                <div>
                  <label className="block text-slate-700 mb-1.5">Contact Name</label>
                  <input type="text" value={form.contactName} onChange={e => set('contactName', e.target.value)}
                    placeholder="e.g. Sarah Kim" className={inputCls('contactName')} />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1.5">Contact Email</label>
                  <input type="email" value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)}
                    placeholder="e.g. sarah.kim@company.com" className={inputCls('contactEmail')} />
                  {errors.contactEmail && <p className="text-red-500 mt-1" style={{ fontSize: '0.75rem' }}>{errors.contactEmail}</p>}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/60">
            {/* Section dots */}
            <div className="flex gap-1.5">
              {SECTIONS.map(s => (
                <button key={s.id} type="button" onClick={() => setSection(s.id)}
                  className={`h-1.5 rounded-full transition-all ${section === s.id ? 'w-5 bg-indigo-600' : 'w-1.5 bg-slate-300'}`}
                />
              ))}
            </div>

            {/* Prev / Submit */}
            <div className="flex items-center gap-3">
              {/* Prev / Next nav */}
              {(() => {
                const idx = SECTIONS.findIndex(s => s.id === section);
                return (
                  <>
                    {idx > 0 && (
                      <button type="button" onClick={() => setSection(SECTIONS[idx - 1].id)}
                        className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors"
                        style={{ fontSize: '0.875rem' }}>
                        Back
                      </button>
                    )}
                    {idx < SECTIONS.length - 1 ? (
                      <button type="button" onClick={() => setSection(SECTIONS[idx + 1].id)}
                        className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                        style={{ fontSize: '0.875rem' }}>
                        Next
                      </button>
                    ) : (
                      <>
                        <button type="button" onClick={onClose}
                          className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors"
                          style={{ fontSize: '0.875rem' }}>
                          Cancel
                        </button>
                        <button type="submit"
                          className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                          style={{ fontSize: '0.875rem' }}>
                          {existingJob ? 'Save Changes' : 'Add Job'}
                        </button>
                      </>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
