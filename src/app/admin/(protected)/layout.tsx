import { getAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminNavbar from '@/components/AdminNavbar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  
  if (!session) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-amber-500 selection:text-slate-900">
      {/* Admin Navbar */}
      <AdminNavbar adminUsername={session.username || 'Admin'} />

      {/* Main Admin Portal Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 text-white">
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 text-center text-xs text-slate-500 px-6">
        <p>© {new Date().getFullYear()} Natham Government Arts College. Admin Security Auditing Panel.</p>
      </footer>
    </div>
  );
}
