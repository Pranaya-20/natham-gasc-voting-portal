import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminResultsPage() {
  const [positions, settings] = await Promise.all([
    prisma.position.findMany({
      include: {
        nominees: {
          include: { _count: { select: { votes: true } } },
          orderBy: { votes: { _count: 'desc' } },
        },
        _count: { select: { votes: true } },
      },
      orderBy: { title: 'asc' },
    }),
    prisma.settings.findUnique({ where: { id: 'system-settings' } }),
  ]);

  const resultsReleased = settings?.resultsReleased || false;
  const totalVotes = positions.reduce((s, p) => s + p._count.votes, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Live Results Panel</h2>
          <p className="text-slate-400 text-sm mt-1">
            Real-time vote tallies visible only to admin. Total votes cast:{' '}
            <strong className="text-amber-400">{totalVotes}</strong>
          </p>
        </div>
        <div className={`px-4 py-2 rounded-xl text-sm font-bold border ${
          resultsReleased
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            : 'bg-slate-800 border-slate-700 text-slate-400'
        }`}>
          {resultsReleased ? '🌐 Results Public' : '🔒 Results Private'}
        </div>
      </div>

      <div className="space-y-6">
        {positions.map((pos) => {
          const totalForPos = pos._count.votes;
          return (
            <div key={pos.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="font-extrabold text-lg text-slate-100">{pos.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    pos.isOpen
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>{pos.isOpen ? 'Open' : 'Closed'}</span>
                </div>
                <span className="text-xs text-slate-400">{totalForPos} votes</span>
              </div>
              <div className="p-6 space-y-4">
                {pos.nominees.map((nom, idx) => {
                  const pct = totalForPos > 0 ? Math.round((nom._count.votes / totalForPos) * 100) : 0;
                  const isWinner = idx === 0 && nom._count.votes > 0;
                  return (
                    <div key={nom.id} className={`p-4 rounded-xl border ${
                      isWinner ? 'bg-amber-500/5 border-amber-500/30' : 'bg-slate-950/50 border-slate-800'
                    }`}>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                          {isWinner && <span className="text-base">🏆</span>}
                          <div>
                            <p className="font-bold text-sm text-slate-100">{nom.name}</p>
                            <p className="text-xs text-slate-500">{nom.department} · {nom.year}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-extrabold text-xl text-slate-100">{nom._count.votes}</p>
                          <p className="text-xs text-slate-500">{pct}%</p>
                        </div>
                      </div>
                      <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full rounded-full ${isWinner ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-slate-600'}`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
                {pos.nominees.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-4">No nominees registered for this position.</p>
                )}
              </div>
            </div>
          );
        })}
        {positions.length === 0 && (
          <div className="p-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
            No positions configured yet.
          </div>
        )}
      </div>
    </div>
  );
}
