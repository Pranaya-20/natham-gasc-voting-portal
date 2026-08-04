import { prisma } from '@/lib/db';
import PositionsClient from '@/components/PositionsClient';

export const dynamic = 'force-dynamic';

export default async function AdminPositionsPage() {
  // Query all positions with their candidate and vote tallies
  const positions = await prisma.position.findMany({
    include: {
      _count: {
        select: {
          nominees: true,
          votes: true,
        },
      },
    },
    orderBy: {
      title: 'asc',
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black tracking-tight">Manage Positions</h2>
        <p className="text-slate-400 text-sm mt-1">
          Configure available election positions. Edits and deletions are blocked once voting begins.
        </p>
      </div>

      <PositionsClient initialPositions={positions} />
    </div>
  );
}
