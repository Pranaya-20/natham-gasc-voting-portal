import { getStudentSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getStudentSession();
  if (!session) {
    redirect('/student/login');
  }

  // Handle student logout action
  const handleLogout = async () => {
    'use server';
    const cookieStore = await cookies();
    cookieStore.delete('student_token');
    redirect('/student/login');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col text-slate-100 selection:bg-amber-500 selection:text-slate-900">
      {/* Student Header */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/student/vote" className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-bold text-sm flex items-center justify-center">
              NG
            </Link>
            <div>
              <h1 className="font-extrabold text-sm md:text-base tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200">
                NATHAM GOVERNMENT ARTS COLLEGE
              </h1>
              <p className="text-[10px] text-slate-500 tracking-wider">Student Union Elections 2026</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">Register Number</span>
              <span className="text-xs font-bold text-amber-400 block">{session.regNo}</span>
            </div>

            <form action={handleLogout}>
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Log Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Student Page Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 text-center text-xs text-slate-500 px-6">
        <p>© {new Date().getFullYear()} Natham Government Arts College. Student Council Voting System.</p>
      </footer>
    </div>
  );
}
