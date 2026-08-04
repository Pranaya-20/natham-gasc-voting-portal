import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'natham-gasc-voting-portal-secret-key-321'
);

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as { userId: string; role: 'admin' | 'student' };
  } catch (error) {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const adminToken = request.cookies.get('admin_token')?.value;
  const studentToken = request.cookies.get('student_token')?.value;

  // Admin routes protection
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      if (adminToken) {
        const payload = await verifyToken(adminToken);
        if (payload && payload.role === 'admin') {
          return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
      }
      return NextResponse.next();
    }

    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    const payload = await verifyToken(adminToken);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Student routes protection
  if (pathname.startsWith('/student')) {
    if (pathname === '/student/login') {
      if (studentToken) {
        const payload = await verifyToken(studentToken);
        if (payload && payload.role === 'student') {
          return NextResponse.redirect(new URL('/student/vote', request.url));
        }
      }
      return NextResponse.next();
    }

    if (!studentToken) {
      return NextResponse.redirect(new URL('/student/login', request.url));
    }

    const payload = await verifyToken(studentToken);
    if (!payload || payload.role !== 'student') {
      return NextResponse.redirect(new URL('/student/login', request.url));
    }
  }

  // Landing page redirect if logged in
  if (pathname === '/') {
    if (adminToken) {
      const payload = await verifyToken(adminToken);
      if (payload && payload.role === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
    }
    if (studentToken) {
      const payload = await verifyToken(studentToken);
      if (payload && payload.role === 'student') {
        return NextResponse.redirect(new URL('/student/vote', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin/:path*', '/student/:path*'],
};
