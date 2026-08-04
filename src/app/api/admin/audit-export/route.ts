import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import * as xlsx from 'xlsx';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return new Response('Unauthorized', { status: 401 });

  const votes = await prisma.vote.findMany({
    include: {
      student: { select: { regNo: true, name: true, department: true } },
      position: { select: { title: true } },
      nominee: { select: { name: true } },
    },
    orderBy: [{ position: { title: 'asc' } }, { student: { regNo: 'asc' } }],
  });

  const rows = votes.map((v) => ({
    'Register No': v.student.regNo,
    'Student Name': v.student.name,
    'Department': v.student.department,
    'Position': v.position.title,
    'Voted For': v.nominee.name,
    'Vote Timestamp': v.createdAt.toISOString(),
  }));

  const ws = xlsx.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 25 }, { wch: 25 }];
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Vote Audit');
  const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=vote_audit_${Date.now()}.xlsx`,
    },
  });
}
