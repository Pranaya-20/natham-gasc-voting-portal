'use server';

import { prisma } from '@/lib/db';
import { signToken, setAdminSession, clearAdminSession, setStudentSession, clearStudentSession } from '@/lib/auth';
import { normalizeDOB } from '@/lib/utils';
import bcrypt from 'bcryptjs';

type AuthState = { error?: string; success?: boolean };

export async function loginAdmin(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const usernameInput = ((formData.get('username') as string) || '').trim();
  const passwordInput = ((formData.get('password') as string) || '').trim();

  if (!usernameInput || !passwordInput) {
    return { error: 'Please enter both username and password.' };
  }

  try {
    // Auto-seed default admin if database has 0 admin records
    const adminCount = await prisma.admin.count();
    if (adminCount === 0) {
      const defaultUsername = process.env.ADMIN_USERNAME || 'Nathamgasc';
      const defaultPassword = process.env.ADMIN_PASSWORD || 'vote@gasc';
      const hashedPassword = bcrypt.hashSync(defaultPassword, 10);

      await prisma.admin.create({
        data: {
          username: defaultUsername,
          password: hashedPassword,
        },
      });

      await prisma.settings.upsert({
        where: { id: 'system-settings' },
        update: {},
        create: { id: 'system-settings', resultsReleased: false },
      });
      console.log('Auto-seeded default admin account.');
    }

    // Case-insensitive query for admin account
    const admin = await prisma.admin.findFirst({
      where: {
        username: { equals: usernameInput, mode: 'insensitive' },
      },
    });

    if (!admin) {
      return { error: 'Invalid username or password.' };
    }

    const isValid = bcrypt.compareSync(passwordInput, admin.password);
    if (!isValid) {
      return { error: 'Invalid username or password.' };
    }

    // Sign JWT token
    const token = await signToken({
      userId: admin.id,
      role: 'admin',
      username: admin.username,
    });

    // Set cookie
    await setAdminSession(token);

    return { success: true };
  } catch (error: any) {
    console.error('Admin login error:', error);
    if (!process.env.DATABASE_URL) {
      return { error: 'DATABASE_URL environment variable is missing in Vercel project settings.' };
    }
    return { error: `Database Error: ${error?.message || 'Failed to connect to database.'}` };
  }
}

export async function logoutAdmin() {
  await clearAdminSession();
}

export async function loginStudent(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const regNoInput = ((formData.get('regNo') as string) || '').trim();
  const dobInput = ((formData.get('dob') as string) || '').trim();

  if (!regNoInput || !dobInput) {
    return { error: 'Please enter both Register Number and DOB.' };
  }

  const normalizedDob = normalizeDOB(dobInput);
  if (normalizedDob.length !== 8) {
    return { error: 'Date of Birth must be 8 digits (format: DDMMYYYY, e.g., 25042003).' };
  }

  try {
    const student = await prisma.student.findFirst({
      where: {
        regNo: { equals: regNoInput, mode: 'insensitive' },
      },
    });

    if (!student) {
      return { error: 'Invalid Register Number or Date of Birth.' };
    }

    const isValid = bcrypt.compareSync(normalizedDob, student.dob);
    if (!isValid) {
      return { error: 'Invalid Register Number or Date of Birth.' };
    }

    // Sign JWT token
    const token = await signToken({
      userId: student.id,
      role: 'student',
      regNo: student.regNo,
    });

    // Set cookie
    await setStudentSession(token);

    return { success: true };
  } catch (error: any) {
    console.error('Student login error:', error);
    if (!process.env.DATABASE_URL) {
      return { error: 'DATABASE_URL environment variable is missing in Vercel project settings.' };
    }
    return { error: `Database Error: ${error?.message || 'Failed to connect to database.'}` };
  }
}

export async function logoutStudent() {
  await clearStudentSession();
}
