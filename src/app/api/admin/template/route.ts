import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import * as xlsx from 'xlsx';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Sample data conforming to the layout
  const templateData = [
    { 'RegNo': '21UCS101', 'Name': 'Anbarasan M', 'Department': 'Computer Science', 'DOB': '15/08/2003' },
    { 'RegNo': '21UCO102', 'Name': 'Banupriya K', 'Department': 'Commerce', 'DOB': '25/04/2003' },
  ];

  const ws = xlsx.utils.json_to_sheet(templateData);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Roster Template');

  // Format cell widths
  ws['!cols'] = [
    { wch: 15 }, // RegNo
    { wch: 25 }, // Name
    { wch: 25 }, // Department
    { wch: 15 }, // DOB
  ];

  const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=student_upload_template.xlsx',
    },
  });
}
