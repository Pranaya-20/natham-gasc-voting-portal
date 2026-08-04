'use server';

import { prisma } from '@/lib/db';
import { signToken, setAdminSession, clearAdminSession, setStudentSession, clearStudentSession } from '@/lib/auth';
import { normalizeDOB } from '@/lib/utils';
import bcrypt from 'bcryptjs';

type AuthState = { error?: string; success?: boolean };

export async function loginAdmin(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { error: 'Please enter both username and password.' };
  }

  try {
    const admin = await prisma.admin.findUnique({
      where: { username: username.trim() },
    });

    if (!admin) {
      return { error: 'Invalid username or password.' };
    }

    const isValid = bcrypt.compareSync(password, admin.password);
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
  const regNo = formData.get('regNo') as string;
  const dobInput = formData.get('dob') as string;

  if (!regNo || !dobInput) {
    return { error: 'Please enter both Register Number and DOB.' };
  }

  const normalizedDob = normalizeDOB(dobInput);
  if (normalizedDob.length !== 8) {
    return { error: 'Date of Birth must be 8 digits (format: DDMMYYYY, e.g., 25042003).' };
  }

  try {
    const student = await prisma.student.findUnique({
      where: { regNo: regNo.trim().toUpperCase() },
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
