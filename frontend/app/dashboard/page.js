'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { formService } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { 
  FileSpreadsheet, 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  Plus, 
  ChevronRight,
  Eye,
  Activity
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const prevResponsesCount = useRef(null);
  const [activeToast, setActiveToast] = useState(null);

  const playNotificationSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const playTone = (freq, startTime, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.1, startTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      
      const now = ctx.currentTime;
      playTone(523.25, now, 0.15); // C5
      playTone(659.25, now + 0.08, 0.25); // E5
    } catch (err) {
      console.error('AudioContext failed:', err);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    async function fetchStats() {
      if (!isAuthenticated) return;
      try {
        const res = await formService.getStats();
        
        // Compare response count for notification toast
        if (prevResponsesCount.current !== null && res.data.totalResponses > prevResponsesCount.current) {
          const diff = res.data.totalResponses - prevResponsesCount.current;
          setActiveToast({
            message: `🔔 ${diff} new response${diff > 1 ? 's' : ''} received!`,
            id: Date.now()
          });
          playNotificationSound();
        }
        
        prevResponsesCount.current = res.data.totalResponses;
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching dashboard stats', err);
        setError('Could not load statistics. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();

    // 10 seconds polling interval
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#030303]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
      </div>
    );
  }

  // Render SVG trend line chart with premium aesthetics
  const renderTrendChart = (trendData) => {
    if (!trendData || trendData.length === 0) return null;
    
    const maxCount = Math.max(...trendData.map(d => d.count), 5);
    const width = 500;
    const height = 180;
    const padding = 25;
    
    const points = trendData.map((d, index) => {
      const x = padding + (index * (width - padding * 2)) / (trendData.length - 1);
      const y = height - padding - (d.count * (height - padding * 2)) / maxCount;
      return { x, y, date: d.date, count: d.count };
    });

    const pathD = points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    const fillD = points.length > 0 
      ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z` 
      : '';

    return (
      <div className="relative h-[200px] w-full mt-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#B0E4CC" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#B0E4CC" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          
          {/* Horizontal lines */}
          {[0, 0.5, 1].map((ratio, i) => {
            const y = padding + ratio * (height - padding * 2);
            const val = Math.round(maxCount * (1 - ratio));
            return (
              <g key={i}>
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#1f1f23" strokeDasharray="3,3" />
                <text x={padding - 5} y={y + 3} fill="#52525b" fontSize="8" fontWeight="semibold" textAnchor="end">{val}</text>
              </g>
            );
          })}

          {/* Fill path */}
          {fillD && <path d={fillD} fill="url(#chartGradient)" />}

          {/* Stroke path */}
          {pathD && <path d={pathD} fill="none" stroke="#B0E4CC" strokeWidth="2" strokeLinecap="round" />}

          {/* Coordinate nodes */}
          {points.map((p, i) => (
            <g key={i} className="group">
              <circle cx={p.x} cy={p.y} r="3" fill="#B0E4CC" stroke="#09090b" strokeWidth="1.5" />
              <circle cx={p.x} cy={p.y} r="7" fill="#B0E4CC" className="opacity-0 hover:opacity-10 cursor-pointer transition-opacity" />
              {/* Tooltip text */}
              <text x={p.x} y={p.y - 8} className="opacity-0 group-hover:opacity-100 transition-opacity font-bold" fill="#f4f4f5" fontSize="8" textAnchor="middle">
                {p.count}
              </text>
              {i % 2 === 0 && (
                <text x={p.x} y={height - 5} fill="#52525b" fontSize="8" fontWeight="semibold" textAnchor="middle">
                  {p.date.split('-').slice(1).join('/')}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#030303] text-zinc-100">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 pl-0 lg:pl-60 flex flex-col min-h-screen">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-6xl w-full mx-auto">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-0.5">
              <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
              <p className="text-xs text-zinc-400">Welcome, {user?.name}. Here is your form collection overview.</p>
            </div>
            <div>
              <Link href="/forms/create" className="btn-primary py-2 text-xs">
                <Plus className="h-4 w-4" />
                <span>Create Form</span>
              </Link>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-400">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-zinc-900/40 border border-zinc-900 rounded-2xl" />
              ))}
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Total Forms */}
                <div className="glow-card rounded-2xl p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Total Forms</span>
                    <h3 className="text-2xl font-bold text-white">{stats?.totalForms || 0}</h3>
                  </div>
                  <div className="h-9 w-9 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center justify-center text-zinc-400">
                    <FileSpreadsheet className="h-4.5 w-4.5" />
                  </div>
                </div>

                {/* Total Responses */}
                <div className="glow-card rounded-2xl p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Responses</span>
                    <h3 className="text-2xl font-bold text-white">{stats?.totalResponses || 0}</h3>
                  </div>
                  <div className="h-9 w-9 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center justify-center text-zinc-400">
                    <MessageSquare className="h-4.5 w-4.5" />
                  </div>
                </div>

                {/* Avg Completion Rate */}
                <div className="glow-card rounded-2xl p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Avg Submissions</span>
                    <h3 className="text-2xl font-bold text-white">
                      {stats?.totalForms > 0 ? (stats.totalResponses / stats.totalForms).toFixed(1) : '0.0'}
                    </h3>
                  </div>
                  <div className="h-9 w-9 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center justify-center text-zinc-400">
                    <TrendingUp className="h-4.5 w-4.5" />
                  </div>
                </div>

                {/* Real-time Indicator */}
                <div className="glow-card rounded-2xl p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Status</span>
                    <h3 className="text-2xl font-bold text-emerald-400 flex items-center space-x-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>Live</span>
                    </h3>
                  </div>
                  <div className="h-9 w-9 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center justify-center text-zinc-400">
                    <Activity className="h-4.5 w-4.5" />
                  </div>
                </div>

              </div>

              {/* Analytics Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Submission trend line graph */}
                <div className="premium-panel rounded-2xl p-6 lg:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">Submission Activity (Last 7 Days)</h2>
                    <span className="text-[10px] font-semibold text-zinc-500">Updated live</span>
                  </div>
                  {stats?.trendData && stats.trendData.some(d => d.count > 0) ? (
                    renderTrendChart(stats.trendData)
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[180px] border border-dashed border-zinc-900 rounded-xl bg-zinc-950/20 text-center">
                      <TrendingUp className="h-6 w-6 text-zinc-700 mb-2" />
                      <span className="text-xs text-zinc-500">No response data points available yet</span>
                    </div>
                  )}
                </div>

                {/* Submission distribution histograms */}
                <div className="premium-panel rounded-2xl p-6 space-y-4">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">Forms Distribution</h2>
                  
                  <div className="space-y-4 max-h-[170px] overflow-y-auto pr-1">
                    {stats?.submissionsPerForm && stats.submissionsPerForm.length > 0 ? (
                      stats.submissionsPerForm.map((item, idx) => {
                        const maxCount = Math.max(...stats.submissionsPerForm.map(s => s.count), 1);
                        const percentage = (item.count / maxCount) * 100;
                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-center justify-between text-2xs font-semibold">
                              <span className="truncate max-w-[130px] text-zinc-300" title={item.title}>
                                {item.title}
                              </span>
                              <span className="text-zinc-500">{item.count} replies</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${percentage}%` }}
                                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[120px] text-zinc-700">
                        <FileSpreadsheet className="h-5 w-5 mb-2" />
                        <span className="text-xs text-zinc-500">No forms registered</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Activity Lists */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Recent Forms list */}
                <div className="premium-panel rounded-2xl p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">Recent Forms</h2>
                    <Link href="/forms" className="text-2xs font-semibold text-violet-400 hover:text-violet-300 flex items-center space-x-1">
                      <span>View All</span>
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>

                  <div className="divide-y divide-zinc-900">
                    {stats?.recentForms && stats.recentForms.length > 0 ? (
                      stats.recentForms.map((form) => (
                        <div key={form._id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                          <div className="space-y-0.5 truncate max-w-[180px]">
                            <h4 className="text-xs font-semibold text-zinc-200 truncate">{form.title}</h4>
                            <p className="text-[10px] text-zinc-500">{new Date(form.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-semibold">
                              {form.responseCount || 0} replies
                            </span>
                            <Link href={`/forms/edit/${form._id}`} title="View Form" className="text-zinc-500 hover:text-zinc-300">
                              <Eye className="h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-600 py-4 text-center">No forms created yet.</p>
                    )}
                  </div>
                </div>

                {/* Recent Responses list */}
                <div className="premium-panel rounded-2xl p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">Recent Responses</h2>
                    <Link href="/responses" className="text-2xs font-semibold text-violet-400 hover:text-violet-300 flex items-center space-x-1">
                      <span>View All</span>
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>

                  <div className="divide-y divide-zinc-900">
                    {stats?.recentResponses && stats.recentResponses.length > 0 ? (
                      stats.recentResponses.map((resp) => (
                        <div key={resp._id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                          <div className="space-y-0.5 truncate max-w-[200px]">
                            <h4 className="text-xs font-semibold text-zinc-200 truncate">
                              Response for {resp.formId?.title || 'Deleted Form'}
                            </h4>
                            <p className="text-[10px] text-zinc-500">
                              {new Date(resp.submittedAt).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-500 italic">
                              {Object.keys(resp.answers || {}).length} answers
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-600 py-4 text-center">No recent replies found.</p>
                    )}
                  </div>
                </div>

              </div>
            </>
          )}

        </main>
      </div>

      {/* Toast Notification */}
      {activeToast && (
        <div className="fixed top-24 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center space-x-3.5 bg-zinc-950/95 border-2 border-violet-500/30 shadow-2xl shadow-violet-500/10 rounded-2xl p-4 max-w-sm backdrop-blur-md">
            <div className="h-2 w-2 rounded-full bg-violet-400 animate-pulse shrink-0" />
            <div className="text-xs font-bold text-white tracking-wide">
              {activeToast.message}
            </div>
            <button 
              onClick={() => setActiveToast(null)}
              className="text-zinc-500 hover:text-zinc-300 text-2xs font-semibold pl-2 transition-colors focus:outline-none"
            >
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

