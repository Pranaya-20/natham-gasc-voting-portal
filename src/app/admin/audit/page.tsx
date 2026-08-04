import { prisma } from '@/lib/db';
import AuditClient from '@/components/AuditClient';

export const dynamic = 'force-dynamic';

export default async function AdminAuditPage() {
  const [votes, auditLogs] = await Promise.all([
    prisma.vote.findMany({
      include: {
        student: { select: { id: true, regNo: true, name: true, department: true } },
        position: { select: { id: true, title: true } },
        nominee: { select: { name: true } },
      },
      orderBy: [{ position: { title: 'asc' } }, { student: { regNo: 'asc' } }],
    }),
    prisma.voteAuditLog.findMany({ orderBy: { removedAt: 'desc' }, take: 50 }),
  ]);

  const enrichedLogs = await Promise.all(
    auditLogs.map(async (log) => {
      const [student, position, nominee] = await Promise.all([
        prisma.student.findUnique({ where: { id: log.studentId }, select: { name: true, regNo: true } }),
        prisma.position.findUnique({ where: { id: log.positionId }, select: { title: true } }),
        prisma.nominee.findUnique({ where: { id: log.nomineeId }, select: { name: true } }),
      ]);
      return { ...log, student, position, nominee, removedAt: log.removedAt.toISOString() };
    })
  );

  const serializedVotes = votes.map((v) => ({ ...v, createdAt: v.createdAt.toISOString() }));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black tracking-tight">Vote Audit & Correction</h2>
        <p className="text-slate-400 text-sm mt-1">Review all cast votes, remove individual votes for error correction, and export the full audit trail.</p>
      </div>
      <AuditClient votes={serializedVotes} auditLogs={enrichedLogs} />
    </div>
  );
}
