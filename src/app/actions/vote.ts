'use server';

import { prisma } from '@/lib/db';
import { getStudentSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function castVote(positionId: string, nomineeId: string) {
  const session = await getStudentSession();
  if (!session) {
    return { error: 'Unauthorized. Please login again.' };
  }

  const studentId = session.userId;

  try {
    // 1. Verify position exists and is currently open
    const position = await prisma.position.findUnique({
      where: { id: positionId },
    });

    if (!position) {
      return { error: 'Selected position does not exist.' };
    }

    if (!position.isOpen) {
      return { error: 'Voting is currently closed for this position.' };
    }

    // 2. Double-submit prevention check
    const existingVote = await prisma.vote.findUnique({
      where: {
        studentId_positionId: {
          studentId,
          positionId,
        },
      },
    });

    if (existingVote) {
      return { error: 'You have already cast a vote for this position.' };
    }

    // 3. Verify nominee belongs to this position
    const nominee = await prisma.nominee.findFirst({
      where: {
        id: nomineeId,
        positionId,
      },
    });

    if (!nominee) {
      return { error: 'Selected candidate is not registered for this position.' };
    }

    // 4. Save vote in database
    await prisma.vote.create({
      data: {
        studentId,
        positionId,
        nomineeId,
      },
    });

    // Revalidate paths
    revalidatePath('/student/vote');
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/results');
    revalidatePath('/admin/audit');

    return { success: true };
  } catch (error: any) {
    // Unique constraint violation check
    if (error.code === 'P2002') {
      return { error: 'You have already cast a vote for this position.' };
    }
    console.error('Vote casting error:', error);
    return { error: 'An error occurred while submitting your vote. Please try again.' };
  }
}
