'use client';

import { useState, useTransition } from 'react';
import { toggleAllPositionsVoting, toggleResultsRelease } from '@/app/actions/election';
import { useRouter } from 'next/navigation';

export default function DashboardControls({
  initialResultsReleased,
  positions,
}: {
  initialResultsReleased: boolean;
  positions: { id: string; title: string; isOpen: boolean }[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const anyOpen = positions.some((p) => p.isOpen);
  const allOpen = positions.length > 0 && positions.every((p) => p.isOpen);

  const handleToggleAllVoting = (open: boolean) => {
    setError('');
    startTransition(async () => {
      const res = await toggleAllPositionsVoting(open);
      if (res.error) {
        setError(res.error);
      } else {
        router.refresh();
      }
    });
  };

  const handleToggleResults = (release: boolean) => {
    setError('');
    startTransition(async () => {
      const res = await toggleResultsRelease(release);
      if (res.error) {
        setError(res.error);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Voting Control Card */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/[0.02] rounded-full blur-2xl"></div>
          <h3 className="text-lg font-bold text-slate-100 mb-2 flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${anyOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
            Voting Status
          </h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Toggle the entire election window. Opening voting enables students to log in and cast ballots. Closing blocks all further votes.
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => handleToggleAllVoting(true)}
              disabled={isPending || allOpen}
              className={`flex-1 py-3 px-4 font-bold text-xs uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
                allOpen
                  ? 'bg-slate-950 border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/20 active:scale-[0.98]'
              }`}
            >
              Open All Polls
            </button>
            <button
              onClick={() => handleToggleAllVoting(false)}
              disabled={isPending || !anyOpen}
              className={`flex-1 py-3 px-4 font-bold text-xs uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
                !anyOpen
                  ? 'bg-slate-950 border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-red-600/10 border-red-500/30 text-red-400 hover:bg-red-600/20 active:scale-[0.98]'
              }`}
            >
              Close All Polls
            </button>
          </div>
        </div>

        {/* Results Release Card */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/[0.02] rounded-full blur-2xl"></div>
          <h3 className="text-lg font-bold text-slate-100 mb-2 flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${initialResultsReleased ? 'bg-amber-500 animate-pulse' : 'bg-slate-600'}`}></span>
            Results Visibility
          </h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Release the final vote tallies and charts. Once released, student panels are unlocked, allowing them to view candidates' vote counts and winners.
          </p>

          <div className="flex gap-4">
            {!initialResultsReleased ? (
              <button
                onClick={() => handleToggleResults(true)}
                disabled={isPending}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 active:scale-[0.98] text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/10 transition-all cursor-pointer disabled:opacity-50"
              >
                Release Results to Students
              </button>
            ) : (
              <button
                onClick={() => handleToggleResults(false)}
                disabled={isPending}
                className="w-full py-3 px-4 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-amber-500 active:scale-[0.98] font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                Hide / Retract Released Results
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Position Status List */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
        <h3 className="font-bold text-slate-100 text-lg mb-4">Position Polling Details</h3>
        {positions.length === 0 ? (
          <p className="text-sm text-slate-500">No positions configured yet.</p>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {positions.map((p) => (
              <div key={p.id} className="py-3.5 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-200">{p.title}</span>
                <div className="flex items-center gap-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    p.isOpen
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {p.isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
