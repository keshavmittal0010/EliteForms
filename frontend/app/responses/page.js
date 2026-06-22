'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { formService, responseService } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { 
  Database, 
  Search, 
  Trash2, 
  Download, 
  AlertCircle, 
  Calendar,
  Layers,
  Info
} from 'lucide-react';

function ResponsesPageContent() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryFormId = searchParams.get('formId');

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState('');
  
  const [formStructure, setFormStructure] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [loadingForms, setLoadingForms] = useState(true);
  const [error, setError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeResponseDetails, setActiveResponseDetails] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    async function loadForms() {
      if (!isAuthenticated) return;
      try {
        const res = await formService.getForms();
        setForms(res.data);
        
        if (queryFormId) {
          setSelectedFormId(queryFormId);
        } else if (res.data.length > 0) {
          setSelectedFormId(res.data[0]._id);
        }
      } catch (err) {
        console.error('Error fetching forms for response viewer', err);
        setError('Failed to fetch forms. Please try reloading.');
      } finally {
        setLoadingForms(false);
      }
    }
    loadForms();
  }, [isAuthenticated, queryFormId]);

  const fetchResponses = async () => {
    if (!selectedFormId) return;
    try {
      setLoadingResponses(true);
      setError('');
      const res = await responseService.getResponses(selectedFormId, searchQuery);
      setFormStructure(res.data.form);
      setResponses(res.data.responses);
    } catch (err) {
      console.error('Error fetching form responses', err);
      setError('Could not load responses for this form.');
      setResponses([]);
      setFormStructure(null);
    } finally {
      setLoadingResponses(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && selectedFormId) {
      fetchResponses();
    }
  }, [isAuthenticated, selectedFormId, searchQuery]);

  const handleDeleteResponse = async (responseId) => {
    if (window.confirm('Are you sure you want to delete this response permanently?')) {
      try {
        await responseService.deleteResponse(responseId);
        setResponses(responses.filter((r) => r._id !== responseId));
        if (activeResponseDetails?._id === responseId) {
          setActiveResponseDetails(null);
        }
      } catch (err) {
        console.error('Error deleting response', err);
        alert('Failed to delete response. Try again.');
      }
    }
  };

  const exportToCSV = () => {
    if (!formStructure || responses.length === 0) return;

    const headers = ['Submitted At', ...formStructure.fields.map(f => f.label)];
    
    const rows = responses.map((resp) => {
      const answersMap = resp.answers instanceof Map ? Object.fromEntries(resp.answers) : resp.answers;
      const rowData = [
        new Date(resp.submittedAt).toLocaleString(),
        ...formStructure.fields.map((field) => {
          const ans = answersMap[field.id];
          if (ans === undefined || ans === null) return '';
          if (Array.isArray(ans)) return ans.join('; ');
          return String(ans);
        })
      ];
      return rowData.map(val => `"${val.replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${formStructure.title.replace(/\s+/g, '_')}_Responses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#030303]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#030303] text-zinc-100">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 pl-0 lg:pl-60 flex flex-col min-h-screen">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-6xl w-full mx-auto">
          {/* Header */}
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">Responses</h1>
            <p className="text-xs text-zinc-400">Review and download data collected from your public forms.</p>
          </div>

          {/* Filters Panel */}
          <div className="premium-panel rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4 shadow-md">
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Select Form</label>
              {loadingForms ? (
                <div className="h-10 bg-zinc-900/40 rounded-xl animate-pulse" />
              ) : (
                <select
                  value={selectedFormId}
                  onChange={(e) => setSelectedFormId(e.target.value)}
                  className="modern-input w-full px-3 py-2 text-xs bg-[#030303] cursor-pointer"
                >
                  <option value="">-- Choose a Form --</option>
                  {forms.map((form) => (
                    <option key={form._id} value={form._id}>
                      {form.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Search Answers</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-zinc-500">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder="Filter by answer value keywords..."
                  disabled={!selectedFormId}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="modern-input w-full py-2 pl-9 pr-4 text-xs disabled:opacity-40"
                />
              </div>
            </div>

          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-400">
              {error}
            </div>
          )}

          {/* Submissions data table */}
          {!selectedFormId ? (
            <div className="flex flex-col items-center justify-center p-16 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/10 text-center">
              <Database className="h-8 w-8 text-zinc-700 mb-3" />
              <h3 className="text-xs font-bold text-zinc-400">Select a Form</h3>
              <p className="text-[10px] text-zinc-500 mt-1 max-w-[200px]">
                Choose a form from the drop-down filter above to load responses.
              </p>
            </div>
          ) : loadingResponses ? (
            <div className="space-y-3 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-zinc-900/40 border border-zinc-900 rounded-xl" />
              ))}
            </div>
          ) : responses.length > 0 && formStructure ? (
            <div className="space-y-4">
              
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  Collected {responses.length} responses
                </div>
                <button
                  onClick={exportToCSV}
                  className="btn-secondary py-1.5 px-3 text-xs"
                >
                  <Download className="h-3.5 w-3.5 text-violet-400" />
                  <span>Export CSV</span>
                </button>
              </div>

              {/* Table wrapper */}
              <div className="premium-panel rounded-2xl overflow-hidden border border-zinc-900 shadow-md">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-900 bg-zinc-950/40 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                        <th className="py-3.5 px-5">Submitted At</th>
                        {formStructure.fields.slice(0, 3).map((field) => (
                          <th key={field.id} className="py-3.5 px-5 max-w-[130px] truncate" title={field.label}>
                            {field.label}
                          </th>
                        ))}
                        {formStructure.fields.length > 3 && (
                          <th className="py-3.5 px-5 text-zinc-600 italic">+{formStructure.fields.length - 3} fields</th>
                        )}
                        <th className="py-3.5 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900 text-xs text-zinc-300">
                      {responses.map((resp) => {
                        const answersMap = resp.answers instanceof Map ? Object.fromEntries(resp.answers) : resp.answers;
                        return (
                          <tr key={resp._id} className="hover:bg-zinc-950/20 transition-colors">
                            
                            <td className="py-3.5 px-5 text-zinc-500 text-[11px] whitespace-nowrap">
                              {new Date(resp.submittedAt).toLocaleString()}
                            </td>

                            {formStructure.fields.slice(0, 3).map((field) => {
                              const ansVal = answersMap[field.id];
                              let displayVal = '';
                              if (ansVal !== undefined && ansVal !== null) {
                                displayVal = Array.isArray(ansVal) ? ansVal.join(', ') : String(ansVal);
                              }
                              return (
                                <td key={field.id} className="py-3.5 px-5 max-w-[130px] truncate text-zinc-200">
                                  {displayVal || <span className="text-zinc-700 italic">empty</span>}
                                </td>
                              );
                            })}

                            {formStructure.fields.length > 3 && (
                              <td className="py-3.5 px-5 text-zinc-600 text-2xs italic">...</td>
                            )}

                            <td className="py-3.5 px-5 text-right">
                              <div className="flex items-center justify-end space-x-2.5">
                                <button
                                  onClick={() => setActiveResponseDetails(resp)}
                                  className="rounded-lg border border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:border-violet-500/20 hover:text-violet-400 px-3 py-1 text-[11px] font-semibold transition-colors"
                                >
                                  Inspect
                                </button>
                                <button
                                  onClick={() => handleDeleteResponse(resp._id)}
                                  title="Delete response"
                                  className="p-1.5 rounded-lg border border-zinc-800 text-zinc-500 hover:border-red-500/20 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/10 text-center">
              <Calendar className="h-8 w-8 text-zinc-700 mb-3" />
              <h3 className="text-xs font-bold text-zinc-400">No submissions found</h3>
              <p className="text-[10px] text-zinc-500 mt-1 max-w-sm">
                {searchQuery ? 'No responses match your search filters.' : 'This form has not received submissions. Share your public link!'}
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Detail inspect modal */}
      {activeResponseDetails && formStructure && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4">
          <div className="premium-panel w-full max-w-md rounded-2xl p-6 space-y-5 shadow-2xl relative max-h-[85vh] overflow-y-auto border-violet-500/20 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Inspect Submission</h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  Submitted: {new Date(activeResponseDetails.submittedAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setActiveResponseDetails(null)}
                className="rounded-lg border border-zinc-800 bg-zinc-900/30 px-3 py-1.5 text-2xs text-zinc-400 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>

            {/* Answer List */}
            <div className="space-y-3">
              {formStructure.fields.map((field) => {
                const answersMap = activeResponseDetails.answers instanceof Map 
                  ? Object.fromEntries(activeResponseDetails.answers) 
                  : activeResponseDetails.answers;
                const ans = answersMap[field.id];
                
                return (
                  <div key={field.id} className="space-y-1 bg-zinc-950/60 p-3 rounded-xl border border-zinc-900">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">
                      {field.label}
                    </span>
                    <span className="text-xs text-zinc-200 block whitespace-pre-wrap">
                      {ans === undefined || ans === null || ans === '' || (Array.isArray(ans) && ans.length === 0) ? (
                        <span className="text-zinc-600 italic">empty</span>
                      ) : Array.isArray(ans) ? (
                        ans.join(', ')
                      ) : (
                        String(ans)
                      )}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-zinc-900 pt-3 text-[10px]">
              <button
                onClick={() => handleDeleteResponse(activeResponseDetails._id)}
                className="flex items-center space-x-1.5 text-red-500 hover:text-red-400 font-bold transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Reply</span>
              </button>
              <span className="text-zinc-600 font-mono text-3xs">ID: {activeResponseDetails._id}</span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default function ResponsesPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#030303]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
      </div>
    }>
      <ResponsesPageContent />
    </Suspense>
  );
}

