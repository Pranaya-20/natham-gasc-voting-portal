'use client';

import { useState, useTransition, useRef } from 'react';
import { createNominee, updateNominee, deleteNominee } from '@/app/actions/nominees';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Position {
  id: string;
  title: string;
  isOpen: boolean;
  _count: { votes: number };
}

interface Nominee {
  id: string;
  name: string;
  year: string;
  department: string;
  photoUrl: string;
  positionId: string;
  position: {
    title: string;
    isOpen: boolean;
    _count: { votes: number };
  };
}

export default function NomineesClient({
  positions,
  nominees,
}: {
  positions: Position[];
  nominees: Nominee[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [name, setName] = useState('');
  const [year, setYear] = useState('3rd Year');
  const [department, setDepartment] = useState('');
  const [positionId, setPositionId] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [ignoreDuplicate, setIgnoreDuplicate] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Editing states
  const [editingNominee, setEditingNominee] = useState<Nominee | null>(null);

  // Group nominees by position
  const groupedNominees = positions.reduce((acc, pos) => {
    acc[pos.id] = nominees.filter((n) => n.positionId === pos.id);
    return acc;
  }, {} as Record<string, Nominee[]>);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!positionId) {
      setError('Please select a position.');
      return;
    }

    const formData = new FormData(e.target as HTMLFormElement);
    formData.set('ignoreDuplicate', ignoreDuplicate.toString());

    startTransition(async () => {
      let res;
      if (editingNominee) {
        res = await updateNominee(editingNominee.id, null, formData);
      } else {
        res = await createNominee(null, formData);
      }

      if (res.error) {
        if (res.duplicateWarning) {
          setDuplicateWarning(true);
        }
        setError(res.error);
      } else {
        // Reset states on success
        setName('');
        setDepartment('');
        setDuplicateWarning(false);
        setIgnoreDuplicate(false);
        setEditingNominee(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setSuccess(editingNominee ? 'Nominee updated successfully!' : 'Nominee registered successfully!');
        router.refresh();
      }
    });
  };

  const handleEditClick = (nominee: Nominee) => {
    setEditingNominee(nominee);
    setName(nominee.name);
    setYear(nominee.year);
    setDepartment(nominee.department);
    setPositionId(nominee.positionId);
    setDuplicateWarning(false);
    setIgnoreDuplicate(false);
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    setEditingNominee(null);
    setName('');
    setDepartment('');
    setDuplicateWarning(false);
    setIgnoreDuplicate(false);
    setError('');
    setSuccess('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove the nominee "${name}"?`)) {
      return;
    }

    setError('');
    setSuccess('');

    startTransition(async () => {
      const res = await deleteNominee(id);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess('Nominee removed successfully.');
        router.refresh();
      }
    });
  };

  const yearOptions = [
    '1st Year',
    '2nd Year',
    '3rd Year',
    'PG 1st Year',
    'PG 2nd Year',
  ];

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Form Column */}
      <div className="lg:col-span-1">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl sticky top-24">
          <h3 className="text-lg font-bold text-slate-100 mb-4">
            {editingNominee ? 'Edit Nominee Details' : 'Register New Nominee'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Contesting Position */}
            <div>
              <label htmlFor="positionId" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Contesting Position
              </label>
              <select
                id="positionId"
                name="positionId"
                value={positionId}
                onChange={(e) => setPositionId(e.target.value)}
                disabled={isPending}
                required
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm disabled:opacity-50"
              >
                <option value="">-- Select Position --</option>
                {positions.map((pos) => (
                  <option key={pos.id} value={pos.id} disabled={pos.isOpen || pos._count.votes > 0}>
                    {pos.title} {pos.isOpen || pos._count.votes > 0 ? '(Voting Open/Locked)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Candidate Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter candidate's full name"
                required
                disabled={isPending}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-700 focus:outline-none focus:border-amber-500 text-sm disabled:opacity-50"
              />
            </div>

            {/* Candidate Year */}
            <div>
              <label htmlFor="year" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Year of Study
              </label>
              <select
                id="year"
                name="year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                disabled={isPending}
                required
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm"
              >
                {yearOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div>
              <label htmlFor="department" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Department
              </label>
              <input
                id="department"
                name="department"
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Computer Science"
                required
                disabled={isPending}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-700 focus:outline-none focus:border-amber-500 text-sm disabled:opacity-50"
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label htmlFor="photo" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Photo {editingNominee ? '(Leave empty to keep existing)' : ''}
              </label>
              <input
                id="photo"
                name="photo"
                type="file"
                accept="image/*"
                ref={fileInputRef}
                required={!editingNominee}
                disabled={isPending}
                className="w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-amber-400 hover:file:bg-slate-700 file:cursor-pointer disabled:opacity-50"
              />
            </div>

            {/* Duplicate Safety Bypass */}
            {duplicateWarning && (
              <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <input
                  id="ignoreDuplicate"
                  type="checkbox"
                  checked={ignoreDuplicate}
                  onChange={(e) => setIgnoreDuplicate(e.target.checked)}
                  disabled={isPending}
                  className="rounded text-amber-500 focus:ring-amber-500 bg-slate-950 border-slate-800 w-4 h-4"
                />
                <label htmlFor="ignoreDuplicate" className="text-xs text-amber-400 font-semibold cursor-pointer select-none">
                  Ignore duplicate name warning
                </label>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              {editingNominee && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isPending}
                  className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isPending || (duplicateWarning && !ignoreDuplicate)}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 active:scale-[0.98] text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/10 transition-all cursor-pointer disabled:opacity-50"
              >
                {isPending ? 'Processing...' : editingNominee ? 'Save Changes' : 'Register Nominee'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Roster Column */}
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

        {positions.length === 0 ? (
          <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center text-slate-500 text-sm">
            Please configure election positions first before registering candidates.
          </div>
        ) : (
          positions.map((pos) => {
            const list = groupedNominees[pos.id] || [];
            const isLocked = pos.isOpen || pos._count.votes > 0;

            return (
              <div key={pos.id} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <h4 className="font-bold text-slate-100 text-lg flex items-center gap-2">
                    {pos.title}
                    <span className="text-xs font-semibold text-slate-500 bg-slate-950 px-2.5 py-0.5 rounded-full border border-slate-800">
                      {list.length} Contesting
                    </span>
                  </h4>
                  {isLocked && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
                      Locked
                    </span>
                  )}
                </div>

                {list.length === 0 ? (
                  <p className="text-xs text-slate-500 py-2">No nominees registered for this position.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {list.map((nom) => (
                      <div
                        key={nom.id}
                        className="p-4 bg-slate-950 border border-slate-800/50 hover:border-slate-800 rounded-xl flex items-center gap-4 transition-all"
                      >
                        {/* Photo Thumbnail */}
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-800 shrink-0 border border-slate-800">
                          <Image
                            src={nom.photoUrl}
                            alt={nom.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </div>

                        {/* Candidate Details */}
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-slate-200 text-sm truncate">{nom.name}</h5>
                          <p className="text-xs text-slate-500 leading-normal">{nom.department}</p>
                          <p className="text-[10px] text-amber-500/80 font-semibold mt-0.5">{nom.year}</p>
                        </div>

                        {/* Nominee Actions */}
                        <div className="flex flex-col gap-1.5 shrink-0">
                          <button
                            onClick={() => handleEditClick(nom)}
                            disabled={isLocked}
                            title={isLocked ? 'Cannot edit while voting is open or votes exist' : 'Edit candidate'}
                            className={`p-1.5 border rounded-lg transition-all ${
                              isLocked
                                ? 'bg-slate-950 border-slate-900 text-slate-700 cursor-not-allowed'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer'
                            }`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.83 19.82a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(nom.id, nom.name)}
                            disabled={isLocked}
                            title={isLocked ? 'Cannot delete while voting is open or votes exist' : 'Remove candidate'}
                            className={`p-1.5 border rounded-lg transition-all ${
                              isLocked
                                ? 'bg-slate-950 border-slate-900 text-slate-700 cursor-not-allowed'
                                : 'bg-red-950/10 border-red-950/20 text-red-500 hover:bg-red-950/20 cursor-pointer'
                            }`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
