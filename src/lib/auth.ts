import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'natham-gasc-voting-portal-secret-key-321'
);

export async function signToken(payload: { userId: string; role: 'admin' | 'student'; username?: string; regNo?: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(SECRET_KEY);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as { userId: string; role: 'admin' | 'student'; username?: string; regNo?: string };
  } catch (error) {
    return null;
  }
}

// Session cookie helper for Admin
export async function setAdminSession(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 2, // 2 hours
    path: '/',
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_token');
}

// Session cookie helper for Student
export async function setStudentSession(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('student_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 2, // 2 hours
    path: '/',
  });
}

export async function clearStudentSession() {
  const cookieStore = await cookies();
  cookieStore.delete('student_token');
}

// Get Admin Session server-side helper
export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return null;
  return await verifyToken(token);
}

// Get Student Session server-side helper
export async function getStudentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('student_token')?.value;
  if (!token) return null;
  return await verifyToken(token);
}
