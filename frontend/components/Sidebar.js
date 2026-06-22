'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  PlusCircle, 
  Database,
  X,
  Layers
} from 'lucide-react';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Forms', href: '/forms', icon: FileSpreadsheet },
    { name: 'Create Form', href: '/forms/create', icon: PlusCircle },
    { name: 'Responses & Data', href: '/responses', icon: Database },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-40 bg-zinc-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed bottom-0 top-0 left-0 z-50 flex w-60 flex-col border-r border-zinc-900 bg-[#09090b] transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Branding */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-zinc-900">
          <Link href="/dashboard" className="flex items-center space-x-2.5">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/10">
              <Layers className="h-4 w-4 text-zinc-950" />
            </div>
            <span className="text-sm font-bold tracking-tight text-white uppercase">
              EliteForms
            </span>
          </Link>
          <button
            onClick={toggleSidebar}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200 lg:hidden focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 space-y-1 px-3 py-6">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => isOpen && toggleSidebar()}
                className={`group flex items-center space-x-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-violet-600 text-zinc-950 shadow-lg shadow-violet-600/15'
                    : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'
                }`}
              >
                <Icon
                  className={`h-4.5 w-4.5 transition-colors duration-200 ${
                    isActive ? 'text-zinc-950' : 'text-zinc-400 group-hover:text-zinc-200'
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-zinc-900 p-4">
          <div className="flex items-center space-x-3 rounded-xl bg-zinc-950 p-3 border border-zinc-900">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Service Health 100%
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
