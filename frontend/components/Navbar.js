'use client';

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Menu, LogOut } from 'lucide-react';

export default function Navbar({ toggleSidebar }) {
  const { user, logout } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-900 bg-[#030303]/60 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-6">
        
        {/* Mobile Sidebar Trigger */}
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 lg:hidden focus:outline-none"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Brand Name on Mobile */}
        <div className="flex items-center space-x-2 lg:hidden">
          <span className="text-sm font-bold tracking-tight text-white uppercase">
            EliteForms
          </span>
        </div>

        {/* Space filler */}
        <div className="hidden lg:block"></div>

        {/* User Info / Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowProfileModal(true)}
            title="View Profile"
            className="flex items-center space-x-2.5 rounded-full bg-zinc-900/40 py-1 pl-2.5 pr-3.5 border border-zinc-800/60 hover:bg-zinc-900 hover:border-zinc-750 transition-colors focus:outline-none"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 to-indigo-650 text-[10px] font-bold text-zinc-950 uppercase">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span className="hidden text-xs font-semibold text-zinc-400 sm:inline">
              {user?.name || 'User'}
            </span>
          </button>

          <button
            onClick={logout}
            title="Sign Out"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/20 text-zinc-400 hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>

      {/* User Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4">
          <div className="premium-panel w-full max-w-sm rounded-2xl p-6 space-y-5 shadow-2xl relative border-violet-500/20 animate-in fade-in zoom-in-95 duration-200 text-left">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">User Profile</h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="rounded-lg border border-zinc-800 bg-zinc-900/30 px-2.5 py-1 text-2xs text-zinc-400 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>

            {/* Info */}
            <div className="space-y-4 pt-1">
              <div className="flex flex-col items-center space-y-2 pb-4 border-b border-zinc-900/60">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 to-indigo-650 text-lg font-bold text-zinc-950 uppercase shadow-lg shadow-violet-500/10">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <h4 className="text-sm font-bold text-white">{user?.name}</h4>
                <span className="text-[10px] uppercase font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-0.5 rounded-full">
                  Creator Account
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Email Address</span>
                  <span className="text-xs text-zinc-200 font-medium">{user?.email || 'N/A'}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Member Since</span>
                  <span className="text-xs text-zinc-200 font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </header>
  );
}

