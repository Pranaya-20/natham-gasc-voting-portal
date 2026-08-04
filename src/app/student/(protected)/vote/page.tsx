import { prisma } from '@/lib/db';
import { getStudentSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import StudentVotingClient from '@/components/StudentVotingClient';

export const dynamic = 'force-dynamic';

export default async function StudentVotePage() {
  const session = await getStudentSession();
  if (!session) redirect('/student/login');

  const [positions, myVotes, settings] = await Promise.all([
    prisma.position.findMany({
      where: { isOpen: true },
      include: { nominees: { orderBy: { name: 'asc' } } },
      orderBy: { title: 'asc' },
    }),
    prisma.vote.findMany({
      where: { studentId: session.userId },
      select: { positionId: true, nomineeId: true },
    }),
    prisma.settings.findUnique({ where: { id: 'system-settings' } }),
  ]);

  const resultsReleased = settings?.resultsReleased || false;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black tracking-tight">Election Ballot</h2>
        <p className="text-slate-400 text-sm mt-1">Cast your vote carefully. Each vote is final and cannot be changed.</p>
      </div>
      <StudentVotingClient positions={positions} myVotes={myVotes} resultsReleased={resultsReleased} />
    </div>
  );
}
