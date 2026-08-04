'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { logoutAdmin } from '@/app/actions/auth';

export default function AdminNavbar({ adminUsername }: { adminUsername: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard' },
    { name: 'Positions', href: '/admin/positions' },
    { name: 'Nominees', href: '/admin/nominees' },
    { name: 'Student Roster', href: '/admin/students' },
    { name: 'Results Panel', href: '/admin/results' },
    { name: 'Audit & Reset', href: '/admin/audit' },
  ];

  const handleLogout = async () => {
    await logoutAdmin();
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-bold text-sm flex items-center justify-center shadow-md">
              NG
            </Link>
            <div>
              <span className="font-bold text-sm md:text-base tracking-wide block">GASC Voting Portal</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block -mt-1">Admin Panel</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* User Status / Logout */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Logged in as</span>
              <span className="text-xs font-bold text-amber-400 block -mt-0.5">{adminUsername}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              Log Out
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none transition-all"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800/80 px-2 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-semibold ${
                  isActive
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
          
          {/* Mobile User Status and Logout */}
          <div className="border-t border-slate-800/80 mt-4 pt-4 px-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 block">Admin Account</span>
              <span className="text-sm font-bold text-amber-400 block">{adminUsername}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
