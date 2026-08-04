'use server';

import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function toggleResultsRelease(released: boolean) {
  const session = await getAdminSession();
  if (!session) {
    return { error: 'Unauthorized' };
  }

  try {
    const settingsId = 'system-settings';
    await prisma.settings.upsert({
      where: { id: settingsId },
      update: { resultsReleased: released },
      create: { id: settingsId, resultsReleased: released },
    });

    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/results');
    revalidatePath('/student/results');

    return { success: true };
  } catch (error) {
    console.error('Error toggling results release:', error);
    return { error: 'Failed to update settings.' };
  }
}

export async function togglePositionVoting(positionId: string, open: boolean) {
  const session = await getAdminSession();
  if (!session) {
    return { error: 'Unauthorized' };
  }

  try {
    await prisma.position.update({
      where: { id: positionId },
      data: { isOpen: open },
    });

    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/positions');
    revalidatePath('/student/vote');

    return { success: true };
  } catch (error) {
    console.error('Error toggling position voting:', error);
    return { error: 'Failed to update position status.' };
  }
}

export async function toggleAllPositionsVoting(open: boolean) {
  const session = await getAdminSession();
  if (!session) {
    return { error: 'Unauthorized' };
  }

  try {
    await prisma.position.updateMany({
      data: { isOpen: open },
    });

    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/positions');
    revalidatePath('/student/vote');

    return { success: true };
  } catch (error) {
    console.error('Error toggling all positions voting:', error);
    return { error: 'Failed to update positions.' };
  }
}
