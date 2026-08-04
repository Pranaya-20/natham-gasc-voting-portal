import { prisma } from '@/lib/db';
import StudentsClient from '@/components/StudentsClient';

export const dynamic = 'force-dynamic';

export default async function AdminStudentsPage() {
  const [totalCount, students] = await Promise.all([
    prisma.student.count(),
    prisma.student.findMany({
      select: {
        id: true,
        regNo: true,
        name: true,
        department: true,
      },
      orderBy: {
        regNo: 'asc',
      },
      take: 200, // Limit query size for performance, client-side handles search
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black tracking-tight">Voter Administration</h2>
        <p className="text-slate-400 text-sm mt-1">
          Perform bulk student roster uploads via Excel, download formatting templates, and verify registered student union electors.
        </p>
      </div>

      <StudentsClient initialStudents={students} totalCount={totalCount} />
    </div>
  );
}
