import { useState, useEffect } from 'react';
import { Job, JobStatus, Activity, Reminder } from '../types';
import { JobStore } from '../useJobStore';
import {
  formatDate, formatDateTime, timeAgo, getFollowUpUrgency, daysUntil,
  STATUS_CONFIG, STATUS_ORDER, formatSalary,
  getInitials, getCompanyColor, ACTIVITY_CONFIG,
} from './utils';
import {
  X, Pencil, Trash2, ExternalLink, Bell, ChevronDown,
  LayoutDashboard, FileText, User, Activity as ActivityIcon,
  AlarmClock, Archive, ArchiveRestore, Plus, Save, Link, Mail,
  AlertCircle, Clock, Calendar,
} from 'lucide-react';

interface JobDrawerProps {
  job: Job;
  activities: Activity[];
  reminders: Reminder[];
  onClose: () => void;
  onEdit: () => void;
  store: JobStore;
  onDelete: () => void;
}

type Tab = 'overview' | 'description' | 'contact' | 'activity' | 'reminders';

function FollowUpBadge({ date }: { date: string }) {
  const urgency = getFollowUpUrgency(date);
  const days = daysUntil(date);
  const configs = {
    overdue: { text: `${Math.abs(days)}d overdue`, cls: 'bg-red-50 text-red-600 border-red-200', Icon: AlertCircle },
    soon:    { text: days === 0 ? 'Today' : `In ${days}d`,  cls: 'bg-amber-50 text-amber-700 border-amber-200', Icon: Bell },
    upcoming:{ text: `In ${days}d`,  cls: 'bg-blue-50 text-blue-600 border-blue-200', Icon: Clock },
    future:  { text: formatDate(date), cls: 'bg-slate-50 text-slate-500 border-slate-200', Icon: Calendar },
  };
  const { text, cls, Icon } = configs[urgency];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${cls}`} style={{ fontSize: '0.75rem' }}>
      <Icon size={12} /> {text}
    </span>
  );
}

const STATUS_OPTIONS = STATUS_ORDER.map(s => ({ value: s, label: STATUS_CONFIG[s].label }));

export function JobDrawer({ job, activities, reminders, onClose, onEdit, store, onDelete }: JobDrawerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Reminder form
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('09:00');
  const [reminderMsg, setReminderMsg] = useState('');

  // Status change
  const handleStatusChange = (status: JobStatus) => {
    store.updateJob(job.id, { status });
  };

  // Archive
  const handleArchive = () => {
    store.archiveJob(job.id, !job.isArchived);
  };

  // Add reminder
  const submitReminder = () => {
    if (!reminderDate) return;
    const remindAt = new Date(`${reminderDate}T${reminderTime}`).toISOString();
    store.addReminder(job.id, remindAt, reminderMsg.trim() || undefined);
    setReminderDate(''); setReminderTime('09:00'); setReminderMsg('');
    setShowReminderForm(false);
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const statusCfg = STATUS_CONFIG[job.status];
  const companyColor = getCompanyColor(job.company);
  const salary = formatSalary(job.salaryMin, job.salaryMax);
  const pendingReminders = reminders.filter(r => !r.isSent);

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview',    label: 'Overview',    icon: <LayoutDashboard size={14} /> },
    { id: 'description', label: 'Description', icon: <FileText size={14} /> },
    { id: 'contact',     label: 'Contact',     icon: <User size={14} /> },
    { id: 'activity',    label: 'Activity',    icon: <ActivityIcon size={14} />, badge: activities.length },
    { id: 'reminders',   label: 'Reminders',   icon: <AlarmClock size={14} />, badge: pendingReminders.length },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40" onClick={onClose} />

      <div className="fixed right-0 top-0 bottom-0 w-full max-w-[620px] bg-white shadow-2xl z-50 flex flex-col">
        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <div className={`${companyColor} rounded-lg w-9 h-9 flex items-center justify-center text-white shrink-0`}
            style={{ fontSize: '0.875rem', fontWeight: 600 }}>
            {getInitials(job.company)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-slate-900 truncate">{job.company}</h3>
            <p className="text-slate-500 truncate" style={{ fontSize: '0.8125rem' }}>{job.role}</p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Status selector */}
            <div className="relative">
              <select
                value={job.status}
                onChange={e => handleStatusChange(e.target.value as JobStatus)}
                className={`pl-3 pr-7 py-1.5 rounded-full border appearance-none cursor-pointer focus:outline-none ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}
                style={{ fontSize: '0.8125rem', fontWeight: 500 }}
              >
                {STATUS_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown size={12} className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${statusCfg.color}`} />
            </div>

            {/* Edit */}
            <button onClick={onEdit} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors" title="Edit">
              <Pencil size={14} />
            </button>

            {/* Archive toggle */}
            <button onClick={handleArchive} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              title={job.isArchived ? 'Unarchive' : 'Archive'}>
              {job.isArchived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
            </button>

            {/* Delete */}
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)} className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                <Trash2 size={14} />
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <button onClick={onDelete} className="px-2.5 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors" style={{ fontSize: '0.75rem' }}>Delete</button>
                <button onClick={() => setConfirmDelete(false)} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors" style={{ fontSize: '0.75rem' }}>Cancel</button>
              </div>
            )}

            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex border-b border-slate-100 px-5 shrink-0 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 py-3 px-1 mr-4 border-b-2 whitespace-nowrap shrink-0 transition-colors ${
                activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
              style={{ fontSize: '0.875rem' }}
            >
              {tab.icon}
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}
                  style={{ fontSize: '0.6875rem', fontWeight: 600 }}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto">

          {/* ═══ OVERVIEW ═══ */}
          {activeTab === 'overview' && (
            <div className="px-5 py-5 space-y-4">
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                {job.appliedDate && (
                  <div className="bg-slate-50 rounded-xl p-3.5">
                    <p className="text-slate-400 mb-1" style={{ fontSize: '0.75rem' }}>Applied</p>
                    <p className="text-slate-800">{formatDate(job.appliedDate)}</p>
                  </div>
                )}
                {salary && (
                  <div className="bg-slate-50 rounded-xl p-3.5">
                    <p className="text-slate-400 mb-1" style={{ fontSize: '0.75rem' }}>Salary</p>
                    <p className="text-slate-800">{salary}</p>
                  </div>
                )}
                {job.source && (
                  <div className="bg-slate-50 rounded-xl p-3.5">
                    <p className="text-slate-400 mb-1" style={{ fontSize: '0.75rem' }}>Source</p>
                    <p className="text-slate-800">{job.source}</p>
                  </div>
                )}
                {job.resumeLabel && (
                  <div className="bg-slate-50 rounded-xl p-3.5">
                    <p className="text-slate-400 mb-1" style={{ fontSize: '0.75rem' }}>Resume</p>
                    <p className="text-slate-800 truncate" style={{ fontSize: '0.875rem' }}>{job.resumeLabel}</p>
                  </div>
                )}
              </div>

              {/* Job URL */}
              {job.url && (
                <a href={job.url.startsWith('http') ? job.url : `https://${job.url}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors"
                  style={{ fontSize: '0.875rem' }}>
                  <Link size={14} /> View Job Posting
                </a>
              )}

              {/* Follow-up */}
              {job.followUpDate && (
                <div className={`rounded-xl p-4 border ${
                  getFollowUpUrgency(job.followUpDate) === 'overdue' || getFollowUpUrgency(job.followUpDate) === 'soon'
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell size={15} className="text-amber-600" />
                      <span className="text-slate-700" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Follow-up Reminder</span>
                    </div>
                    <FollowUpBadge date={job.followUpDate} />
                  </div>
                  <p className="text-slate-500 mt-1 ml-6" style={{ fontSize: '0.8125rem' }}>{formatDate(job.followUpDate)}</p>
                </div>
              )}

              {/* Archived badge */}
              {job.isArchived && (
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-100 rounded-xl text-slate-500" style={{ fontSize: '0.875rem' }}>
                  <Archive size={15} /> This application is archived
                </div>
              )}
            </div>
          )}

          {/* ═══ DESCRIPTION ═══ */}
          {activeTab === 'description' && (
            <div className="px-5 py-5 space-y-6">
              <div>
                <h4 className="text-slate-700 mb-2.5">Job Description</h4>
                {job.jobDescription ? (
                  <div className="bg-slate-50 rounded-xl px-4 py-3.5 text-slate-700 whitespace-pre-line"
                    style={{ fontSize: '0.875rem', lineHeight: 1.7 }}>
                    {job.jobDescription}
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-xl p-6 text-center text-slate-400" style={{ fontSize: '0.875rem' }}>
                    No job description.{' '}
                    <button onClick={onEdit} className="text-indigo-500 hover:underline">Add one</button>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-slate-700 mb-2.5">Notes</h4>
                {job.notes ? (
                  <div className="bg-slate-50 rounded-xl px-4 py-3.5 text-slate-700 whitespace-pre-line"
                    style={{ fontSize: '0.875rem', lineHeight: 1.7 }}>
                    {job.notes}
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-xl p-6 text-center text-slate-400" style={{ fontSize: '0.875rem' }}>
                    No notes yet.{' '}
                    <button onClick={onEdit} className="text-indigo-500 hover:underline">Add notes</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ CONTACT ═══ */}
          {activeTab === 'contact' && (
            <div className="px-5 py-5">
              {job.contactName || job.contactEmail ? (
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 shrink-0"
                      style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                      {getInitials(job.contactName || '?')}
                    </div>
                    <div>
                      {job.contactName && <p className="text-slate-800" style={{ fontWeight: 500 }}>{job.contactName}</p>}
                      {job.contactEmail && (
                        <a href={`mailto:${job.contactEmail}`}
                          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 transition-colors mt-0.5"
                          style={{ fontSize: '0.8125rem' }}>
                          <Mail size={12} /> {job.contactEmail}
                        </a>
                      )}
                    </div>
                  </div>
                  <button onClick={onEdit}
                    className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 transition-colors"
                    style={{ fontSize: '0.8125rem' }}>
                    <Pencil size={13} /> Edit contact
                  </button>
                </div>
              ) : (
                <div className="text-center py-14 text-slate-400">
                  <User size={36} className="mx-auto mb-2.5 opacity-30" />
                  <p style={{ fontSize: '0.875rem' }}>No contact added yet</p>
                  <button onClick={onEdit} className="mt-3 text-indigo-500 hover:underline" style={{ fontSize: '0.875rem' }}>
                    Add contact
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ═══ ACTIVITY ═══ */}
          {activeTab === 'activity' && (
            <div className="px-5 py-5">
              {activities.length === 0 ? (
                <div className="text-center py-14 text-slate-400">
                  <ActivityIcon size={36} className="mx-auto mb-2.5 opacity-30" />
                  <p style={{ fontSize: '0.875rem' }}>No activity yet</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-[17px] top-2 bottom-2 w-px bg-slate-200" />
                  <div className="space-y-1">
                    {activities.map((act, i) => {
                      const cfg = ACTIVITY_CONFIG[act.type];
                      return (
                        <div key={act.id} className="flex gap-3 relative">
                          {/* Dot */}
                          <div className={`w-[34px] h-[34px] rounded-full flex items-center justify-center shrink-0 z-10 ${
                            act.type === 'status_change' ? 'bg-indigo-100' :
                            act.type === 'created' ? 'bg-emerald-100' :
                            act.type === 'reminder_set' ? 'bg-amber-100' : 'bg-slate-100'
                          }`}
                            style={{ fontSize: '0.875rem' }}>
                            {cfg.icon}
                          </div>
                          <div className="flex-1 pb-4 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                {act.type === 'status_change' && act.fromStatus && act.toStatus ? (
                                  <p className="text-slate-700" style={{ fontSize: '0.875rem' }}>
                                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs ${STATUS_CONFIG[act.fromStatus].bg} ${STATUS_CONFIG[act.fromStatus].color}`}>
                                      {STATUS_CONFIG[act.fromStatus].label}
                                    </span>
                                    {' → '}
                                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs ${STATUS_CONFIG[act.toStatus].bg} ${STATUS_CONFIG[act.toStatus].color}`}>
                                      {STATUS_CONFIG[act.toStatus].label}
                                    </span>
                                  </p>
                                ) : (
                                  <p className="text-slate-700" style={{ fontSize: '0.875rem' }}>{act.note || cfg.label}</p>
                                )}
                                {act.note && act.type !== 'created' && (
                                  <p className="text-slate-500 mt-0.5 truncate" style={{ fontSize: '0.8125rem' }}>{act.note}</p>
                                )}
                              </div>
                              <span className="text-slate-400 shrink-0" style={{ fontSize: '0.75rem' }}>{timeAgo(act.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ REMINDERS ═══ */}
          {activeTab === 'reminders' && (
            <div className="px-5 py-5">
              {/* Reminder list */}
              {reminders.length > 0 && (
                <div className="space-y-3 mb-5">
                  {reminders.map(r => {
                    const urgency = getFollowUpUrgency(r.remindAt.split('T')[0]);
                    return (
                      <div key={r.id} className={`rounded-xl p-4 border flex items-start justify-between gap-3 ${
                        r.isSent ? 'bg-slate-50 border-slate-200 opacity-60' :
                        urgency === 'overdue' ? 'bg-red-50 border-red-200' :
                        urgency === 'soon' ? 'bg-amber-50 border-amber-200' :
                        'bg-white border-slate-200'
                      }`}>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Bell size={14} className={r.isSent ? 'text-slate-400' : urgency === 'overdue' ? 'text-red-500' : 'text-amber-500'} />
                            <span className="text-slate-700" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                              {formatDateTime(r.remindAt)}
                            </span>
                            {r.isSent && (
                              <span className="text-slate-400 px-1.5 py-0.5 bg-slate-100 rounded text-xs">Sent</span>
                            )}
                          </div>
                          {r.message && <p className="text-slate-500 ml-6" style={{ fontSize: '0.8125rem' }}>{r.message}</p>}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {!r.isSent && (
                            <button onClick={() => store.markReminderSent(r.id)}
                              className="text-slate-400 hover:text-emerald-600 transition-colors px-2 py-1 rounded hover:bg-emerald-50"
                              style={{ fontSize: '0.75rem' }} title="Mark as done">
                              ✓
                            </button>
                          )}
                          <button onClick={() => store.deleteReminder(r.id)}
                            className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {reminders.length === 0 && !showReminderForm && (
                <div className="text-center py-10 text-slate-400">
                  <AlarmClock size={36} className="mx-auto mb-2.5 opacity-30" />
                  <p style={{ fontSize: '0.875rem' }}>No reminders set</p>
                </div>
              )}

              {/* Add reminder form */}
              {showReminderForm ? (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <h4 className="text-slate-700 mb-3" style={{ fontSize: '0.9375rem' }}>New Reminder</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600 mb-1" style={{ fontSize: '0.8125rem' }}>Date</label>
                        <input type="date" value={reminderDate} onChange={e => setReminderDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          style={{ fontSize: '0.875rem' }} />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-1" style={{ fontSize: '0.8125rem' }}>Time</label>
                        <input type="time" value={reminderTime} onChange={e => setReminderTime(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          style={{ fontSize: '0.875rem' }} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1" style={{ fontSize: '0.8125rem' }}>Message (optional)</label>
                      <input type="text" value={reminderMsg} onChange={e => setReminderMsg(e.target.value)}
                        placeholder="e.g. Follow up with recruiter"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        style={{ fontSize: '0.875rem' }} />
                    </div>
                    <div className="flex gap-2 justify-end pt-1">
                      <button onClick={() => { setShowReminderForm(false); setReminderDate(''); setReminderMsg(''); }}
                        className="px-3 py-1.5 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors" style={{ fontSize: '0.875rem' }}>
                        Cancel
                      </button>
                      <button onClick={submitReminder} disabled={!reminderDate}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors" style={{ fontSize: '0.875rem' }}>
                        <Save size={13} /> Save
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowReminderForm(true)}
                  className="flex items-center gap-2 px-4 py-2.5 w-full border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors justify-center"
                  style={{ fontSize: '0.875rem' }}>
                  <Plus size={16} /> Add Reminder
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
