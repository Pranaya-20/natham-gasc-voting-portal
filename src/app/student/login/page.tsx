'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginStudent } from '@/app/actions/auth';

type AuthState = { error?: string; success?: boolean };
const initialState: AuthState = {};

export default function StudentLoginPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(loginStudent, initialState);

  useEffect(() => {
    if (state?.success) {
      router.push('/student/vote');
      router.refresh();
    }
  }, [state, router]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 sm:px-6 py-12 selection:bg-amber-500 selection:text-slate-900">
      {/* College Branding */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-bold text-2xl shadow-xl shadow-amber-500/10 mb-4 hover:scale-105 transition-transform duration-300">
          NG
        </Link>
        <h1 className="text-xl md:text-2xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200">
          NATHAM GOVERNMENT ARTS COLLEGE
        </h1>
        <p className="text-xs text-slate-500 tracking-widest mt-1 uppercase">
          Student Ballot Login
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md p-8 bg-slate-900/80 border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl"></div>
        
        <h2 className="text-2xl font-bold text-white mb-2 text-center">
          Verify Identity
        </h2>
        <p className="text-center text-slate-400 text-xs mb-6">
          Authorized students only. Account is created in bulk by administration.
        </p>

        {state?.error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p>{state.error}</p>
          </div>
        )}

        <form action={formAction} className="space-y-5">
          {/* RegNo Input */}
          <div>
            <label htmlFor="regNo" className="block text-sm font-semibold text-slate-300 mb-2">
              Register Number (RegNo)
            </label>
            <input
              id="regNo"
              name="regNo"
              type="text"
              required
              disabled={isPending}
              placeholder="e.g. 21UCO101"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-700 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-sm uppercase disabled:opacity-50"
            />
          </div>

          {/* DOB Input */}
          <div>
            <label htmlFor="dob" className="block text-sm font-semibold text-slate-300 mb-2">
              Date of Birth (DOB)
            </label>
            <input
              id="dob"
              name="dob"
              type="text"
              required
              disabled={isPending}
              placeholder="e.g. DDMMYYYY (25042003)"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-700 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-sm disabled:opacity-50"
            />
            <p className="mt-1.5 text-[11px] text-slate-500">
              Note: You can input separators (e.g. 25/04/2003 or 25-04-2003).
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 active:scale-[0.98] text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/10 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isPending ? (
              <>
                <svg className="animate-spin h-5 w-5 text-slate-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying Credentials...
              </>
            ) : (
              'Verify & Access Ballot'
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-800/80 pt-6">
          <Link href="/" className="text-slate-500 hover:text-amber-400 text-xs font-semibold tracking-wider uppercase transition-colors inline-flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
