'use server';

import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

// Helper to handle nominee photo uploads with local fallback
async function uploadPhoto(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // If Vercel Blob token is configured, attempt upload
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(`nominees/${Date.now()}-${file.name.replace(/\s+/g, '-')}`, file, {
        access: 'public',
      });
      return blob.url;
    } catch (error) {
      console.error('Failed to upload to Vercel Blob, falling back to local:', error);
    }
  }

  // Fallback to local file storage
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
  const filepath = path.join(uploadDir, filename);
  fs.writeFileSync(filepath, buffer);

  return `/uploads/${filename}`;
}

export async function createNominee(prevState: any, formData: FormData) {
  const session = await getAdminSession();
  if (!session) {
    return { error: 'Unauthorized' };
  }

  const name = formData.get('name') as string;
  const year = formData.get('year') as string;
  const department = formData.get('department') as string;
  const positionId = formData.get('positionId') as string;
  const photo = formData.get('photo') as File;
  const ignoreDuplicate = formData.get('ignoreDuplicate') === 'true';

  if (!name?.trim() || !year || !department?.trim() || !positionId) {
    return { error: 'All fields are required.' };
  }

  if (!photo || photo.size === 0) {
    return { error: 'Please upload a nominee photo.' };
  }

  try {
    // Check if the position exists and is closed
    const position = await prisma.position.findUnique({
      where: { id: positionId },
      include: { _count: { select: { votes: true } } },
    });

    if (!position) {
      return { error: 'Selected position does not exist.' };
    }

    if (position.isOpen || position._count.votes > 0) {
      return { error: 'Cannot add nominee because voting has opened or votes exist.' };
    }

    // Duplicate name safeguard
    if (!ignoreDuplicate) {
      const duplicate = await prisma.nominee.findFirst({
        where: {
          positionId,
          name: { equals: name.trim(), mode: 'insensitive' },
        },
      });

      if (duplicate) {
        return {
          duplicateWarning: true,
          error: `A nominee named "${name.trim()}" is already registered for this position. If this is a different person, check "Ignore Warning" and submit again.`,
        };
      }
    }

    // Upload photo
    const photoUrl = await uploadPhoto(photo);

    // Save to DB
    await prisma.nominee.create({
      data: {
        name: name.trim(),
        year,
        department: department.trim(),
        photoUrl,
        positionId,
      },
    });

    revalidatePath('/admin/nominees');
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating nominee:', error);
    return { error: 'Failed to register nominee.' };
  }
}

export async function updateNominee(id: string, prevState: any, formData: FormData) {
  const session = await getAdminSession();
  if (!session) {
    return { error: 'Unauthorized' };
  }

  const name = formData.get('name') as string;
  const year = formData.get('year') as string;
  const department = formData.get('department') as string;
  const positionId = formData.get('positionId') as string;
  const photo = formData.get('photo') as File;
  const ignoreDuplicate = formData.get('ignoreDuplicate') === 'true';

  if (!name?.trim() || !year || !department?.trim() || !positionId) {
    return { error: 'All fields are required.' };
  }

  try {
    const nominee = await prisma.nominee.findUnique({
      where: { id },
      include: {
        position: {
          include: { _count: { select: { votes: true } } },
        },
      },
    });

    if (!nominee) {
      return { error: 'Nominee not found.' };
    }

    // Block changes if voting is open or votes have been cast
    if (nominee.position.isOpen || nominee.position._count.votes > 0) {
      return { error: 'Cannot update candidate while voting is open or votes have been cast.' };
    }

    // Duplicate name safeguard
    if (!ignoreDuplicate) {
      const duplicate = await prisma.nominee.findFirst({
        where: {
          positionId,
          name: { equals: name.trim(), mode: 'insensitive' },
          id: { not: id },
        },
      });

      if (duplicate) {
        return {
          duplicateWarning: true,
          error: `Another nominee named "${name.trim()}" is already registered for this position. If this is correct, check "Ignore Warning" and submit again.`,
        };
      }
    }

    let photoUrl = nominee.photoUrl;
    if (photo && photo.size > 0) {
      photoUrl = await uploadPhoto(photo);
    }

    await prisma.nominee.update({
      where: { id },
      data: {
        name: name.trim(),
        year,
        department: department.trim(),
        positionId,
        photoUrl,
      },
    });

    revalidatePath('/admin/nominees');
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error updating nominee:', error);
    return { error: 'Failed to update nominee.' };
  }
}

export async function deleteNominee(id: string) {
  const session = await getAdminSession();
  if (!session) {
    return { error: 'Unauthorized' };
  }

  try {
    const nominee = await prisma.nominee.findUnique({
      where: { id },
      include: {
        position: {
          include: { _count: { select: { votes: true } } },
        },
      },
    });

    if (!nominee) {
      return { error: 'Nominee not found.' };
    }

    // Block deletion if voting is open or votes have been cast
    if (nominee.position.isOpen || nominee.position._count.votes > 0) {
      return { error: 'Cannot delete nominee while voting is open or votes have been cast.' };
    }

    await prisma.nominee.delete({
      where: { id },
    });

    revalidatePath('/admin/nominees');
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error deleting nominee:', error);
    return { error: 'Failed to delete nominee.' };
  }
}
