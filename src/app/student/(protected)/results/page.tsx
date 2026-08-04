import { prisma } from '@/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function StudentResultsPage() {
  const settings = await prisma.settings.findUnique({ where: { id: 'system-settings' } });
  const resultsReleased = settings?.resultsReleased || false;

  if (!resultsReleased) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-amber-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-100">Results Not Yet Released</h2>
          <p className="text-slate-400 text-sm mt-2 max-w-md">The election results are being tabulated. They will be released by the administration after verification. Please check back later.</p>
        </div>
        <Link href="/student/vote" className="px-6 py-2.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 font-bold text-sm rounded-xl transition-all">
          Back to Ballot
        </Link>
      </div>
    );
  }

  const positions = await prisma.position.findMany({
    include: {
      nominees: {
        include: { _count: { select: { votes: true } } },
        orderBy: { votes: { _count: 'desc' } },
      },
    },
    orderBy: { title: 'asc' },
  });

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-bold uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          Official Results Released
        </div>
        <h2 className="text-3xl font-black tracking-tight text-slate-100">Election Results 2026-27</h2>
        <p className="text-slate-400 text-sm mt-1">Final verified tally of all positions. Winners are highlighted.</p>
      </div>

      <div className="space-y-8">
        {positions.map((pos) => {
          const totalVotes = pos.nominees.reduce((s, n) => s + n._count.votes, 0);
          return (
            <div key={pos.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
                <h3 className="font-extrabold text-lg text-slate-100">{pos.title}</h3>
                <span className="text-xs text-slate-500">{totalVotes} total votes</span>
              </div>
              <div className="p-6 space-y-4">
                {pos.nominees.map((nom, idx) => {
                  const pct = totalVotes > 0 ? Math.round((nom._count.votes / totalVotes) * 100) : 0;
                  const isWinner = idx === 0 && nom._count.votes > 0;
                  return (
                    <div key={nom.id} className={`p-4 rounded-2xl border ${isWinner ? 'bg-amber-500/5 border-amber-500/40' : 'bg-slate-950/40 border-slate-800'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {isWinner && <span className="text-amber-500 text-sm">🏆</span>}
                          <div>
                            <p className="font-bold text-sm text-slate-100">{nom.name}</p>
                            <p className="text-xs text-slate-500">{nom.department} · {nom.year}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-extrabold text-lg text-slate-100">{nom._count.votes}</p>
                          <p className="text-xs text-slate-500">{pct}%</p>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 ${isWinner ? 'bg-amber-500' : 'bg-slate-600'}`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
                {pos.nominees.length === 0 && <p className="text-slate-500 text-xs text-center py-4">No nominees registered.</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
