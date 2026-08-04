'use client';

import { useState, useTransition } from 'react';
import { createPosition, updatePosition, deletePosition } from '@/app/actions/positions';
import { useRouter } from 'next/navigation';

interface PositionWithCounts {
  id: string;
  title: string;
  isOpen: boolean;
  _count: {
    nominees: number;
    votes: number;
  };
}

export default function PositionsClient({ initialPositions }: { initialPositions: PositionWithCounts[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!newTitle.trim()) return;

    startTransition(async () => {
      const res = await createPosition(newTitle);
      if (res.error) {
        setError(res.error);
      } else {
        setNewTitle('');
        setSuccess('Position created successfully!');
        router.refresh();
      }
    });
  };

  const handleUpdate = async (id: string) => {
    setError('');
    setSuccess('');

    if (!editingTitle.trim()) return;

    startTransition(async () => {
      const res = await updatePosition(id, editingTitle);
      if (res.error) {
        setError(res.error);
      } else {
        setEditingId(null);
        setSuccess('Position updated successfully!');
        router.refresh();
      }
    });
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the position "${title}"? This will delete all associated nominees and votes.`)) {
      return;
    }

    setError('');
    setSuccess('');

    startTransition(async () => {
      const res = await deletePosition(id);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess('Position deleted successfully!');
        router.refresh();
      }
    });
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Add Position Form (Left Column) */}
      <div className="lg:col-span-1">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl sticky top-24">
          <h3 className="text-lg font-bold text-slate-100 mb-4">Add New Position</h3>
          
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Position Title
              </label>
              <input
                id="title"
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. President"
                required
                disabled={isPending}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-700 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-sm disabled:opacity-50"
              />
            </div>
            
            <button
              type="submit"
              disabled={isPending || !newTitle.trim()}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 active:scale-[0.98] text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/10 transition-all cursor-pointer disabled:opacity-50"
            >
              {isPending ? 'Creating...' : 'Create Position'}
            </button>
          </form>
        </div>
      </div>

      {/* Positions List (Right Column) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Status Alerts */}
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

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-900/50">
            <h3 className="font-bold text-slate-100 text-lg">Active Positions ({initialPositions.length})</h3>
          </div>

          {initialPositions.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No positions added yet. Use the form on the left to get started.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {initialPositions.map((pos) => {
                const isEditing = editingId === pos.id;
                const isLocked = pos.isOpen || pos._count.votes > 0;

                return (
                  <div key={pos.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Position Details */}
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex items-center gap-2 max-w-md">
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            disabled={isPending}
                            className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                          />
                          <button
                            onClick={() => handleUpdate(pos.id)}
                            disabled={isPending || !editingTitle.trim()}
                            className="px-3 py-1.5 bg-emerald-600 text-slate-950 font-bold text-xs rounded-lg hover:bg-emerald-500 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            disabled={isPending}
                            className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-xs hover:bg-slate-750"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <h4 className="font-bold text-slate-100 text-base truncate">{pos.title}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                            pos.isOpen
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}>
                            {pos.isOpen ? 'Voting Open' : 'Voting Closed'}
                          </span>
                        </div>
                      )}

                      {/* Stat badging */}
                      <div className="flex gap-4 mt-2.5 text-xs text-slate-400">
                        <span>Nominees: <strong className="text-slate-200">{pos._count.nominees}</strong></span>
                        <span>Votes Cast: <strong className="text-slate-200">{pos._count.votes}</strong></span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    {!isEditing && (
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          onClick={() => {
                            setEditingId(pos.id);
                            setEditingTitle(pos.title);
                          }}
                          disabled={isLocked}
                          title={isLocked ? 'Cannot edit while voting is open or votes exist' : 'Edit position title'}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                            isLocked
                              ? 'bg-slate-950 border-slate-800/80 text-slate-600 cursor-not-allowed'
                              : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white cursor-pointer'
                          }`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(pos.id, pos.title)}
                          disabled={isLocked}
                          title={isLocked ? 'Cannot delete while voting is open or votes exist' : 'Delete position'}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                            isLocked
                              ? 'bg-slate-950 border-slate-800/80 text-slate-600 cursor-not-allowed'
                              : 'bg-red-950/20 border-red-900/30 text-red-400 hover:bg-red-900/30 cursor-pointer'
                          }`}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
