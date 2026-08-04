'use server';

import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createPosition(title: string) {
  const session = await getAdminSession();
  if (!session) {
    return { error: 'Unauthorized' };
  }

  const cleanTitle = title.trim();
  if (!cleanTitle) {
    return { error: 'Position title cannot be empty.' };
  }

  try {
    const existing = await prisma.position.findFirst({
      where: { title: { equals: cleanTitle, mode: 'insensitive' } },
    });

    if (existing) {
      return { error: 'A position with this title already exists.' };
    }

    await prisma.position.create({
      data: { title: cleanTitle, isOpen: false },
    });

    revalidatePath('/admin/positions');
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error creating position:', error);
    return { error: 'Failed to create position.' };
  }
}

export async function updatePosition(id: string, title: string) {
  const session = await getAdminSession();
  if (!session) {
    return { error: 'Unauthorized' };
  }

  const cleanTitle = title.trim();
  if (!cleanTitle) {
    return { error: 'Position title cannot be empty.' };
  }

  try {
    const position = await prisma.position.findUnique({
      where: { id },
      include: {
        _count: {
          select: { votes: true },
        },
      },
    });

    if (!position) {
      return { error: 'Position not found.' };
    }

    // Check if voting has opened or if votes exist
    if (position.isOpen || position._count.votes > 0) {
      return { error: 'Cannot edit this position because voting has already opened or votes have been cast.' };
    }

    const existing = await prisma.position.findFirst({
      where: {
        title: { equals: cleanTitle, mode: 'insensitive' },
        id: { not: id },
      },
    });

    if (existing) {
      return { error: 'Another position with this title already exists.' };
    }

    await prisma.position.update({
      where: { id },
      data: { title: cleanTitle },
    });

    revalidatePath('/admin/positions');
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error updating position:', error);
    return { error: 'Failed to update position.' };
  }
}

export async function deletePosition(id: string) {
  const session = await getAdminSession();
  if (!session) {
    return { error: 'Unauthorized' };
  }

  try {
    const position = await prisma.position.findUnique({
      where: { id },
      include: {
        _count: {
          select: { votes: true },
        },
      },
    });

    if (!position) {
      return { error: 'Position not found.' };
    }

    // Check if voting has opened or if votes exist
    if (position.isOpen || position._count.votes > 0) {
      return { error: 'Cannot delete this position because voting has already opened or votes have been cast.' };
    }

    await prisma.position.delete({
      where: { id },
    });

    revalidatePath('/admin/positions');
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/nominees');
    return { success: true };
  } catch (error) {
    console.error('Error deleting position:', error);
    return { error: 'Failed to delete position.' };
  }
}
