'use client';

import { useState, useTransition } from 'react';
import { castVote } from '@/app/actions/vote';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface Nominee {
  id: string;
  name: string;
  year: string;
  department: string;
  photoUrl: string;
}

interface Position {
  id: string;
  title: string;
  isOpen: boolean;
  nominees: Nominee[];
}

interface Vote {
  positionId: string;
  nomineeId: string;
}

export default function StudentVotingClient({
  positions,
  myVotes,
  resultsReleased,
}: {
  positions: Position[];
  myVotes: Vote[];
  resultsReleased: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Modal control states
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    nominee: Nominee | null;
    position: Position | null;
  }>({
    isOpen: false,
    nominee: null,
    position: null,
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Index votes by positionId for O(1) lock checks
  const voteMap = new Map(myVotes.map((v) => [v.positionId, v.nomineeId]));

  const totalPositions = positions.length;
  const votedCount = myVotes.length;
  const progressPercent = totalPositions > 0 ? Math.round((votedCount / totalPositions) * 100) : 0;

  const handleVoteClick = (nominee: Nominee, position: Position) => {
    setError('');
    setSuccess('');
    setConfirmModal({
      isOpen: true,
      nominee,
      position,
    });
  };

  const handleConfirmVote = async () => {
    const { nominee, position } = confirmModal;
    if (!nominee || !position) return;

    setConfirmModal({ isOpen: false, nominee: null, position: null });

    startTransition(async () => {
      const res = await castVote(position.id, nominee.id);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(`Your vote for "${nominee.name}" was successfully cast!`);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl">
          {success}
        </div>
      )}

      {/* Progress & Info Header */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/[0.01] rounded-full blur-3xl"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100">Cast Your Votes</h2>
            <p className="text-xs text-slate-400 mt-1">
              Select one candidate for each category. Once voted, that category is locked.
            </p>
          </div>
          <div className="text-sm font-bold text-amber-400">
            Voted {votedCount} of {totalPositions} Categories
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        {/* Links to Results */}
        {resultsReleased && (
          <div className="pt-2">
            <Link
              href="/student/results"
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-500 hover:text-amber-400 uppercase tracking-wider transition-colors"
            >
              View Official Results Released
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        )}
      </div>

      {/* Voting Ballot */}
      {positions.length === 0 ? (
        <div className="p-8 text-center text-slate-500 text-sm">
          No election positions are currently configured. Please contact the administrator.
        </div>
      ) : (
        <div className="space-y-8">
          {positions.map((pos) => {
            const hasVotedThis = voteMap.has(pos.id);
            const votedNomineeId = voteMap.get(pos.id);
            const isClosed = !pos.isOpen;

            return (
              <div key={pos.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                {/* Header block for position */}
                <div className="px-6 py-4 bg-slate-900/60 border-b border-slate-850 flex items-center justify-between gap-4">
                  <h3 className="font-extrabold text-slate-100 text-base md:text-lg">{pos.title}</h3>
                  
                  {isClosed && !hasVotedThis ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
                      Voting Closed
                    </span>
                  ) : hasVotedThis ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                      </svg>
                      Ballot Locked
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Voting Active
                    </span>
                  )}
                </div>

                {/* Candidate list inside this position */}
                <div className="p-6">
                  {pos.nominees.length === 0 ? (
                    <p className="text-slate-500 text-xs py-4 text-center">No nominees contested for this category.</p>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                      {pos.nominees.map((nom) => {
                        const isVotedForThisNominee = hasVotedThis && votedNomineeId === nom.id;
                        const isVotedForOther = hasVotedThis && votedNomineeId !== nom.id;

                        return (
                          <div
                            key={nom.id}
                            className={`p-5 rounded-2xl border transition-all relative overflow-hidden flex items-center gap-5 ${
                              isVotedForThisNominee
                                ? 'bg-amber-500/5 border-amber-500 shadow-lg shadow-amber-500/5'
                                : isVotedForOther
                                ? 'bg-slate-950/20 border-slate-850 opacity-40'
                                : isClosed
                                ? 'bg-slate-950/40 border-slate-850/80 opacity-60'
                                : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700/80'
                            }`}
                          >
                            {/* Candidate Photo */}
                            <div className="relative w-18 h-18 rounded-xl overflow-hidden shrink-0 bg-slate-900 border border-slate-850">
                              <Image
                                src={nom.photoUrl}
                                alt={nom.name}
                                fill
                                sizes="72px"
                                className="object-cover"
                              />
                            </div>

                            {/* Candidate Profile Details */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-extrabold text-slate-100 text-base truncate">{nom.name}</h4>
                              <p className="text-xs text-slate-400 leading-relaxed truncate">{nom.department}</p>
                              <p className="text-[10px] text-amber-500/80 font-bold mt-1 uppercase tracking-wide">
                                {nom.year}
                              </p>
                            </div>

                            {/* Action Button / Lock Indicator */}
                            <div className="shrink-0">
                              {isVotedForThisNominee ? (
                                <div className="p-2 bg-amber-500 text-slate-950 rounded-xl shadow-lg font-bold text-[10px] uppercase tracking-wider">
                                  Your Choice
                                </div>
                              ) : isClosed || hasVotedThis ? (
                                <button
                                  disabled
                                  className="px-4 py-2 bg-slate-900 border border-slate-850 text-slate-600 font-bold text-xs uppercase tracking-wider rounded-xl cursor-not-allowed"
                                >
                                  Vote
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleVoteClick(nom, pos)}
                                  disabled={isPending}
                                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 active:scale-[0.97] text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                                >
                                  Vote
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl"></div>
            
            <h3 className="text-lg font-bold text-slate-100 mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-amber-500 animate-bounce">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              Confirm Ballot Submission
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Are you sure you want to vote for <strong className="text-amber-400 font-extrabold">{confirmModal.nominee?.name}</strong> for the position of <strong className="text-slate-100 font-bold">{confirmModal.position?.title}</strong>? 
              <br />
              <span className="text-red-400 font-medium mt-2 block">⚠️ This action is permanent and cannot be altered or re-cast.</span>
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal({ isOpen: false, nominee: null, position: null })}
                disabled={isPending}
                className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmVote}
                disabled={isPending}
                className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/10 transition-all cursor-pointer"
              >
                Confirm Vote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
