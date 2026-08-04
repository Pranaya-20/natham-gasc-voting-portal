'use client';
import { useState, useTransition } from 'react';
import { removeVote } from '@/app/actions/audit';
import { useRouter } from 'next/navigation';

interface VoteRow {
  id: string;
  student: { id: string; regNo: string; name: string; department: string };
  position: { id: string; title: string };
  nominee: { name: string };
  createdAt: string;
}

export default function AuditClient({ votes, auditLogs }: { votes: VoteRow[]; auditLogs: any[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [modal, setModal] = useState<{ open: boolean; vote: VoteRow | null }>({ open: false, vote: null });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');

  const handleRemoveClick = (vote: VoteRow) => { setError(''); setSuccess(''); setModal({ open: true, vote }); };

  const handleConfirmRemove = async () => {
    const { vote } = modal;
    if (!vote) return;
    setModal({ open: false, vote: null });
    startTransition(async () => {
      const res = await removeVote(vote.student.id, vote.position.id);
      if (res.error) { setError(res.error); }
      else { setSuccess(`Removed ${res.studentName}'s vote for ${res.positionTitle}. They can now re-vote.`); router.refresh(); }
    });
  };

  const filtered = votes.filter((v) => {
    const q = search.toLowerCase();
    return v.student.regNo.toLowerCase().includes(q) || v.student.name.toLowerCase().includes(q) || v.position.title.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">{error}</div>}
      {success && <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl">{success}</div>}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <input
          type="text"
          placeholder="Search by RegNo, Name, or Position..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-700 focus:outline-none focus:border-amber-500 text-sm w-full sm:max-w-sm"
        />
        <a
          href="/api/admin/audit-export"
          className="px-5 py-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Export Full Audit (.xlsx)
        </a>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/80">
          <h3 className="font-bold text-slate-100">All Recorded Votes ({filtered.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 font-semibold tracking-wide">
                <th className="p-4">RegNo</th>
                <th className="p-4">Student</th>
                <th className="p-4">Position</th>
                <th className="p-4">Voted For</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500">No vote records found.</td></tr>
              ) : filtered.map((v) => (
                <tr key={v.id} className="hover:bg-slate-800/30 text-slate-300">
                  <td className="p-4 font-semibold text-slate-100">{v.student.regNo}</td>
                  <td className="p-4">{v.student.name}</td>
                  <td className="p-4 text-slate-400">{v.position.title}</td>
                  <td className="p-4 text-amber-400 font-semibold">{v.nominee.name}</td>
                  <td className="p-4 text-slate-500">{new Date(v.createdAt).toLocaleString('en-IN')}</td>
                  <td className="p-4">
                    <button onClick={() => handleRemoveClick(v)} disabled={isPending}
                      className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-bold rounded-lg transition-all cursor-pointer disabled:opacity-50">
                      Remove Vote
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {auditLogs.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800/80">
            <h3 className="font-bold text-slate-100">Admin Vote Removal Log ({auditLogs.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 font-semibold tracking-wide">
                  <th className="p-4">Student</th><th className="p-4">Position</th><th className="p-4">Was Voted For</th><th className="p-4">Removed By</th><th className="p-4">Removed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="text-slate-300">
                    <td className="p-4">{log.student?.name || log.studentId} ({log.student?.regNo || ''})</td>
                    <td className="p-4">{log.position?.title || log.positionId}</td>
                    <td className="p-4 text-red-400">{log.nominee?.name || log.nomineeId}</td>
                    <td className="p-4 text-amber-400">{log.removedBy}</td>
                    <td className="p-4 text-slate-500">{new Date(log.removedAt).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal.open && modal.vote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-red-400 mb-3">⚠️ Confirm Vote Removal</h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Remove <strong className="text-slate-100">{modal.vote.student.name}</strong> ({modal.vote.student.regNo})'s vote for <strong className="text-slate-100">{modal.vote.position.title}</strong>?
              <span className="text-amber-400 font-medium mt-1.5 block">They voted for: {modal.vote.nominee.name}</span>
              <span className="text-slate-400 text-xs block mt-1.5">After removal, this student can log in and re-vote for this position. This action is logged.</span>
            </p>
            <div className="flex gap-3">
              <button onClick={() => setModal({ open: false, vote: null })} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl cursor-pointer transition-all">Cancel</button>
              <button onClick={handleConfirmRemove} disabled={isPending} className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl cursor-pointer transition-all disabled:opacity-50">Confirm Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
