'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { 
  ArrowRight, 
  Layers, 
  Sparkles, 
  PieChart, 
  Share2,
  Lock,
  Compass,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030303] text-zinc-200 bg-grid-pattern">
      
      {/* Glow Rings / Mesh Gradients */}
      <div className="absolute top-[-10%] left-[20%] h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[120px] animate-mesh-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[20%] h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[120px] animate-mesh-pulse pointer-events-none" />

      {/* Header / Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-zinc-900 bg-[#030303]/75 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Layers className="h-4.5 w-4.5 text-zinc-950" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white uppercase">
              EliteForms
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <Link href="/dashboard" className="btn-primary py-2 text-xs">
                <span>Dashboard</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-semibold text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link href="/register" className="btn-primary py-2 text-xs">
                  <span>Start Free</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="mx-auto max-w-6xl px-6 pt-20 pb-24 text-center space-y-16">
        
        {/* Floating Tag */}
        <div className="inline-flex items-center space-x-2 rounded-full border border-zinc-800 bg-zinc-950/80 px-4 py-1.5 text-xs font-medium text-zinc-400 shadow-[0_0_15px_rgba(255,255,255,0.02)]">
          <Sparkles className="h-3.5 w-3.5 text-violet-400" />
          <span className="text-zinc-300">EliteForms v1.0 is live</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
        </div>

        {/* Headings */}
        <div className="space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl leading-tight">
            Create beautiful forms.<br />
            <span className="bg-gradient-to-r from-violet-400 via-indigo-200 to-fuchsia-400 bg-clip-text text-transparent">
              Analyze in real time.
            </span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-base text-zinc-400 sm:text-lg leading-relaxed">
            Design interactive survey forms dynamically, generate instant public links, collect replies, and look up results in a premium analytics control room.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {isAuthenticated ? (
            <Link href="/dashboard" className="btn-primary px-6 py-3.5 text-sm">
              <span>Go to Dashboard</span>
              <ArrowRight className="h-4.5 w-4.5" />
            </Link>
          ) : (
            <>
              <Link href="/register" className="btn-primary px-6 py-3.5 text-sm">
                <span>Start Building Free</span>
                <ArrowRight className="h-4.5 w-4.5 animate-pulse" />
              </Link>
              <Link href="/login" className="btn-secondary px-6 py-3.5 text-sm">
                <span>Sign In</span>
              </Link>
            </>
          )}
        </div>

        {/* Mock UI Preview - Top Website Aesthetic */}
        <div className="relative mx-auto max-w-4xl rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 shadow-[0_0_50px_rgba(176,228,204,0.08)] backdrop-blur">
          <div className="flex items-center space-x-2 border-b border-zinc-900 pb-3 mb-4">
            <div className="h-3 w-3 rounded-full bg-zinc-800" />
            <div className="h-3 w-3 rounded-full bg-zinc-800" />
            <div className="h-3 w-3 rounded-full bg-zinc-800" />
            <span className="text-xs text-zinc-600 pl-4">eliteforms.io/dashboard</span>
          </div>

          <div className="grid grid-cols-3 gap-4 text-left">
            <div className="col-span-2 border border-zinc-900 rounded-xl bg-zinc-950/40 p-4 space-y-3">
              <div className="h-4 w-1/3 bg-zinc-800 rounded animate-pulse" />
              <div className="h-2 w-2/3 bg-zinc-900 rounded" />
              <hr className="border-zinc-900" />
              <div className="space-y-2">
                <div className="h-8 w-full bg-zinc-900/60 border border-zinc-900 rounded-lg flex items-center px-3 justify-between">
                  <span className="text-2xs text-zinc-500">Email input field</span>
                  <span className="text-3xs font-semibold uppercase tracking-wider text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded">Required</span>
                </div>
                <div className="h-8 w-full bg-zinc-900/60 border border-zinc-900 rounded-lg flex items-center px-3 justify-between">
                  <span className="text-2xs text-zinc-500">Feedback comments</span>
                  <span className="text-3xs font-semibold uppercase tracking-wider text-zinc-600 px-2 py-0.5 rounded">Optional</span>
                </div>
              </div>
            </div>
            <div className="border border-zinc-900 rounded-xl bg-zinc-950/40 p-4 space-y-3">
              <span className="text-2xs font-bold uppercase tracking-wider text-zinc-500 block">Toolbar</span>
              <div className="space-y-2">
                {['Text Field', 'Email Input', 'Checkboxes'].map((text, i) => (
                  <div key={i} className="h-7 border border-zinc-800 rounded bg-[#030303] text-2xs flex items-center px-3 text-zinc-400 font-semibold hover:border-zinc-800">
                    + {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid Section */}
        <section className="pt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
          
          <div className="glow-card rounded-2xl p-7 text-left space-y-3">
            <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Dynamic Form Builder</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Add Text, Emails, Numbers, Dropdowns, Checkboxes and Radio lists in real-time. Setup option answers and validation constraints instantly.
            </p>
          </div>

          <div className="glow-card rounded-2xl p-7 text-left space-y-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Share2 className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Public Sharing Links</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Generate static links optimized for mobile, desktops and browsers. Respondents can submit answers securely without logging in.
            </p>
          </div>

          <div className="glow-card rounded-2xl p-7 text-left space-y-3">
            <div className="h-10 w-10 rounded-xl bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-400">
              <PieChart className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Analytics Room</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Track totals, inspect activity trends, search within submissions, view details in modals, and download structured CSV reports.
            </p>
          </div>

        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-[#030303] py-12 text-center text-2xs text-zinc-600">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-zinc-500">
            <Layers className="h-4 w-4 text-zinc-600" />
            <span>EliteForms &copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex space-x-6 text-zinc-500">
            <a href="#" className="hover:text-zinc-300">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-300">Terms of Use</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

