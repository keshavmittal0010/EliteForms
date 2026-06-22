'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { formService } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { 
  Plus, 
  Search, 
  Copy, 
  Edit2, 
  Trash2, 
  Files, 
  ExternalLink, 
  Check, 
  AlertCircle 
} from 'lucide-react';

export default function FormsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedFormId, setCopiedFormId] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchForms = async () => {
    try {
      const res = await formService.getForms();
      setForms(res.data);
    } catch (err) {
      console.error('Error fetching forms', err);
      setError('Could not retrieve forms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchForms();
    }
  }, [isAuthenticated]);

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This will delete all associated responses permanently.`)) {
      try {
        await formService.deleteForm(id);
        setForms(forms.filter((form) => form._id !== id));
      } catch (err) {
        console.error('Error deleting form', err);
        alert('Failed to delete form. Please try again.');
      }
    }
  };

  const handleDuplicate = async (id) => {
    try {
      setLoading(true);
      await formService.duplicateForm(id);
      await fetchForms();
    } catch (err) {
      console.error('Error duplicating form', err);
      alert('Failed to duplicate form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (id) => {
    const shareUrl = `${window.location.origin}/form/${id}`;
    navigator.clipboard.writeText(shareUrl).then(
      () => {
        setCopiedFormId(id);
        setTimeout(() => setCopiedFormId(null), 2000);
      },
      (err) => console.error('Failed to copy text: ', err)
    );
  };

  const filteredForms = forms.filter((form) => {
    const query = searchQuery.toLowerCase();
    return (
      form.title.toLowerCase().includes(query) ||
      form.description.toLowerCase().includes(query)
    );
  });

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-0.5">
              <h1 className="text-2xl font-bold tracking-tight text-white">Forms</h1>
              <p className="text-xs text-zinc-400">View, share public links, and inspect responses.</p>
            </div>
            <div>
              <Link href="/forms/create" className="btn-primary py-2 text-xs">
                <Plus className="h-4 w-4" />
                <span>Create Form</span>
              </Link>
            </div>
          </div>

          {/* Search bar and Filters */}
          <div className="flex items-center w-full max-w-sm relative">
            <span className="absolute left-3.5 text-zinc-500">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="modern-input w-full py-2 pl-10 pr-4 text-xs"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-400">
              {error}
            </div>
          )}

          {/* Forms Table List */}
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-zinc-900/40 border border-zinc-900 rounded-xl" />
              ))}
            </div>
          ) : filteredForms.length > 0 ? (
            <div className="premium-panel rounded-2xl overflow-hidden border border-zinc-900 shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-900 bg-zinc-950/40 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      <th className="py-3.5 px-5">Title</th>
                      <th className="py-3.5 px-5 hidden md:table-cell">Created At</th>
                      <th className="py-3.5 px-5 text-center">Submissions</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 text-xs text-zinc-300">
                    {filteredForms.map((form) => (
                      <tr key={form._id} className="hover:bg-zinc-950/20 transition-colors">
                        
                        <td className="py-3.5 px-5 max-w-xs md:max-w-sm">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-zinc-200 block">{form.title}</span>
                            <span className="text-[10px] text-zinc-500 block truncate">{form.description || 'No description.'}</span>
                          </div>
                        </td>
                        
                        <td className="py-3.5 px-5 hidden md:table-cell text-zinc-500">
                          {new Date(form.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>

                        <td className="py-3.5 px-5 text-center">
                          <Link
                            href={`/responses?formId=${form._id}`}
                            className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-zinc-950 border border-zinc-800 hover:border-violet-500/30 text-[10px] font-bold text-zinc-400 hover:text-zinc-200 transition-colors"
                          >
                            <span>{form.responseCount || 0}</span>
                          </Link>
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {/* Copy URL */}
                            <button
                              onClick={() => copyToClipboard(form._id)}
                              title="Copy Public link"
                              className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:border-violet-500/20 hover:text-violet-400 transition-colors"
                            >
                              {copiedFormId === form._id ? (
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>

                            {/* View Shared page */}
                            <Link
                              href={`/form/${form._id}`}
                              target="_blank"
                              title="Public form"
                              className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:border-violet-500/20 hover:text-violet-400 transition-colors"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>

                            {/* Duplicate */}
                            <button
                              onClick={() => handleDuplicate(form._id)}
                              title="Duplicate Form"
                              className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:border-violet-500/20 hover:text-violet-400 transition-colors"
                            >
                              <Files className="h-3.5 w-3.5" />
                            </button>

                            {/* Edit */}
                            <Link
                              href={`/forms/edit/${form._id}`}
                              title="Edit fields"
                              className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:border-violet-500/20 hover:text-violet-400 transition-colors"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Link>

                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(form._id, form.title)}
                              title="Delete form"
                              className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:border-red-500/20 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/10 text-center">
              <AlertCircle className="h-8 w-8 text-zinc-700 mb-3" />
              <h3 className="text-sm font-bold text-zinc-400">No forms registered</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm">
                {searchQuery ? 'No forms match your search keywords.' : 'Create a form and start collecting answers today!'}
              </p>
              {!searchQuery && (
                <Link href="/forms/create" className="btn-primary py-2 text-xs mt-4">
                  <Plus className="h-4 w-4" />
                  <span>Build First Form</span>
                </Link>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

