import { prisma } from '@/lib/db';
import DashboardControls from '@/components/DashboardControls';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  // Query summary metrics
  const [positionCount, nomineeCount, studentCount, voteCount, positions, settings] = await Promise.all([
    prisma.position.count(),
    prisma.nominee.count(),
    prisma.student.count(),
    prisma.vote.count(),
    prisma.position.findMany({
      select: { id: true, title: true, isOpen: true },
      orderBy: { title: 'asc' },
    }),
    prisma.settings.findUnique({
      where: { id: 'system-settings' },
    }),
  ]);

  const resultsReleased = settings?.resultsReleased || false;

  return (
    <div className="space-y-8">
      {/* Title block */}
      <div>
        <h2 className="text-3xl font-black tracking-tight">Election Overview</h2>
        <p className="text-slate-400 text-sm mt-1">
          Monitor registration levels, live votes cast, and control election windows.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Positions */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/[0.01] rounded-full blur-xl"></div>
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Positions</span>
          <span className="text-3xl sm:text-4xl font-extrabold text-white block mt-2">{positionCount}</span>
          <p className="text-[11px] text-slate-400 mt-2">Active categories</p>
        </div>

        {/* Total Nominees */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/[0.01] rounded-full blur-xl"></div>
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Nominees</span>
          <span className="text-3xl sm:text-4xl font-extrabold text-white block mt-2">{nomineeCount}</span>
          <p className="text-[11px] text-slate-400 mt-2">Candidates contesting</p>
        </div>

        {/* Registered Students */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/[0.01] rounded-full blur-xl"></div>
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Students</span>
          <span className="text-3xl sm:text-4xl font-extrabold text-white block mt-2">{studentCount}</span>
          <p className="text-[11px] text-slate-400 mt-2">Voters uploaded</p>
        </div>

        {/* Votes Cast */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/[0.01] rounded-full blur-xl"></div>
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Votes Cast</span>
          <span className="text-3xl sm:text-4xl font-extrabold text-white block mt-2">{voteCount}</span>
          <p className="text-[11px] text-slate-400 mt-2">Total ballots filed</p>
        </div>
      </div>

      {/* Control Actions & Status */}
      <DashboardControls initialResultsReleased={resultsReleased} positions={positions} />
    </div>
  );
}
