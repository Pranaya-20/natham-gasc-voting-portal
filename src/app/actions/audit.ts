'use server';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function removeVote(studentId: string, positionId: string) {
  const session = await getAdminSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    const settings = await prisma.settings.findUnique({ where: { id: 'system-settings' } });
    if (settings?.resultsReleased) {
      return { error: 'Results have been publicly released. Vote removal is blocked to preserve result integrity.' };
    }

    const vote = await prisma.vote.findUnique({
      where: { studentId_positionId: { studentId, positionId } },
      include: {
        student: { select: { name: true, regNo: true } },
        position: { select: { title: true } },
        nominee: { select: { name: true } },
      },
    });

    if (!vote) return { error: 'Vote record not found.' };

    await prisma.$transaction([
      prisma.voteAuditLog.create({
        data: {
          studentId,
          positionId,
          nomineeId: vote.nomineeId,
          removedBy: session.username || 'admin',
        },
      }),
      prisma.vote.delete({ where: { studentId_positionId: { studentId, positionId } } }),
    ]);

    revalidatePath('/admin/audit');
    revalidatePath('/admin/results');
    revalidatePath('/admin/dashboard');
    return { success: true, studentName: vote.student.name, positionTitle: vote.position.title };
  } catch (error) {
    console.error('removeVote error:', error);
    return { error: 'Failed to remove vote.' };
  }
}
