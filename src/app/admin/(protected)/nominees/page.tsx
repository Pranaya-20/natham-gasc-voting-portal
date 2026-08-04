import { prisma } from '@/lib/db';
import NomineesClient from '@/components/NomineesClient';

export const dynamic = 'force-dynamic';

export default async function AdminNomineesPage() {
  const [positions, nominees] = await Promise.all([
    prisma.position.findMany({
      include: {
        _count: {
          select: { votes: true },
        },
      },
      orderBy: { title: 'asc' },
    }),
    prisma.nominee.findMany({
      include: {
        position: {
          select: {
            title: true,
            isOpen: true,
            _count: { select: { votes: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black tracking-tight">Manage Nominees</h2>
        <p className="text-slate-400 text-sm mt-1">
          Add or edit candidate nominations, upload photos, and group candidates by contesting categories.
        </p>
      </div>

      <NomineesClient positions={positions} nominees={nominees} />
    </div>
  );
}
