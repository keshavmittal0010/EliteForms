'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { responseService, API } from '../../../services/api';
import { 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Send 
} from 'lucide-react';

export default function PublicFormPage() {
  const params = useParams();
  const formId = params.id;

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function loadForm() {
      if (!formId) return;
      try {
        const res = await API.get(`/forms/${formId}`);
        setForm(res.data);
        
        const initialAnswers = {};
        res.data.fields.forEach((field) => {
          if (field.type === 'checkbox') {
            initialAnswers[field.id] = [];
          } else {
            initialAnswers[field.id] = '';
          }
        });
        setAnswers(initialAnswers);
      } catch (err) {
        console.error('Error loading public form', err);
        setError('The form you are looking for does not exist or has been deleted.');
      } finally {
        setLoading(false);
      }
    }
    loadForm();
  }, [formId]);

  const handleInputChange = (fieldId, value) => {
    setAnswers({
      ...answers,
      [fieldId]: value,
    });
  };

  const handleCheckboxChange = (fieldId, option, checked) => {
    const currentSelection = answers[fieldId] || [];
    let newSelection;
    if (checked) {
      newSelection = [...currentSelection, option];
    } else {
      newSelection = currentSelection.filter((item) => item !== option);
    }
    setAnswers({
      ...answers,
      [fieldId]: newSelection,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    for (const field of form.fields) {
      const value = answers[field.id];
      if (field.required) {
        if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
          setError(`Please fill in the required field: "${field.label}"`);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }

      if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          setError(`Please enter a valid email for: "${field.label}"`);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }
    }

    try {
      setIsSubmitting(true);
      await responseService.submitResponse(formId, answers);
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting form response', err);
      setError(err.response?.data?.message || 'Could not submit your response. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#030303] text-zinc-200">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#030303] px-6 bg-grid-pattern">
        <div className="glow-card max-w-sm w-full rounded-2xl p-7 text-center space-y-4 shadow-xl border-red-500/20">
          <AlertCircle className="h-10 w-10 text-red-400 mx-auto" />
          <h2 className="text-base font-bold text-white uppercase tracking-wider">Form Error</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">{error}</p>
          <div className="pt-2">
            <a 
              href="/" 
              className="inline-flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white px-5 py-2 text-xs font-semibold transition-all"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#030303] px-6 bg-grid-pattern">
        <div className="glow-card max-w-md w-full rounded-2xl p-8 text-center space-y-5 shadow-2xl border-emerald-500/20">
          <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto animate-pulse" />
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-white tracking-tight">Submission Recorded</h2>
            <p className="text-xs text-zinc-400">
              Thank you! Your reply to <strong className="text-zinc-200">"{form.title}"</strong> was saved.
            </p>
          </div>
          <div className="pt-2">
            <a 
              href="/" 
              className="inline-flex items-center justify-center rounded-xl bg-violet-600 hover:bg-violet-500 text-white px-5 py-2 text-xs font-semibold transition-all shadow-lg shadow-violet-500/10"
            >
              Back to Home
            </a>
          </div>
          <div className="pt-4 border-t border-zinc-900 text-3xs text-zinc-600 flex items-center justify-center space-x-1 uppercase tracking-wider">
            <span>Powered by</span>
            <span className="font-bold text-zinc-500">EliteForms</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-200 py-16 px-4 md:px-6 bg-grid-pattern">
      <div className="absolute top-[10%] left-[20%] h-[350px] w-[350px] rounded-full bg-violet-650/5 blur-[90px] pointer-events-none" />

      <div className="max-w-xl w-full mx-auto space-y-6 z-10 relative">
        
        {/* Brand Header */}
        <div className="flex items-center justify-between text-zinc-500 px-2">
          <a 
            href="/" 
            className="flex items-center space-x-1 text-[10px] font-bold tracking-wider uppercase text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <span>← Back to Home</span>
          </a>
          <div className="flex items-center space-x-2 text-zinc-500">
            <Layers className="h-4 w-4 text-violet-500" />
            <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-400">EliteForms</span>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="flex items-center space-x-2 rounded-xl bg-red-500/5 border border-red-500/20 p-4 text-xs text-red-400">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Title */}
        <div className="premium-panel rounded-2xl p-6 md:p-8 space-y-2 shadow-lg">
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">{form.title}</h1>
          {form.description && (
            <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">{form.description}</p>
          )}
        </div>

        {/* Form Fields inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {form.fields.map((field) => (
            <div key={field.id} className="premium-panel rounded-2xl p-6 md:p-8 space-y-3 shadow-md hover:border-zinc-800 transition-colors">
              <label className="block text-xs font-semibold text-zinc-300">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {/* Text */}
              {field.type === 'text' && (
                <input
                  type="text"
                  required={field.required}
                  placeholder={field.placeholder}
                  value={answers[field.id] || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="modern-input w-full px-4 py-2.5 text-xs"
                />
              )}

              {/* Email */}
              {field.type === 'email' && (
                <input
                  type="email"
                  required={field.required}
                  placeholder={field.placeholder}
                  value={answers[field.id] || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="modern-input w-full px-4 py-2.5 text-xs"
                />
              )}

              {/* Number */}
              {field.type === 'number' && (
                <input
                  type="number"
                  required={field.required}
                  placeholder={field.placeholder}
                  value={answers[field.id] || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="modern-input w-full px-4 py-2.5 text-xs"
                />
              )}

              {/* Textarea */}
              {field.type === 'textarea' && (
                <textarea
                  required={field.required}
                  placeholder={field.placeholder}
                  rows={4}
                  value={answers[field.id] || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="modern-input w-full px-4 py-2.5 text-xs resize-none"
                />
              )}

              {/* Date */}
              {field.type === 'date' && (
                <input
                  type="date"
                  required={field.required}
                  value={answers[field.id] || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="modern-input w-full px-4 py-2.5 text-xs text-zinc-100"
                />
              )}

              {/* Dropdown */}
              {field.type === 'dropdown' && (
                <select
                  required={field.required}
                  value={answers[field.id] || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="modern-input w-full px-4 py-2.5 text-xs bg-zinc-950 cursor-pointer focus:bg-zinc-950"
                >
                  <option value="" className="text-zinc-500">Select...</option>
                  {field.options.map((option, optIdx) => (
                    <option key={optIdx} value={option} className="bg-zinc-950 text-zinc-400">
                      {option}
                    </option>
                  ))}
                </select>
              )}

              {/* Radio Group */}
              {field.type === 'radio' && (
                <div className="space-y-2.5 pt-1">
                  {field.options.map((option, optIdx) => (
                    <label key={optIdx} className="flex items-center space-x-3 cursor-pointer group">
                      <input
                        type="radio"
                        name={field.id}
                        required={field.required && !answers[field.id]}
                        checked={answers[field.id] === option}
                        onChange={() => handleInputChange(field.id, option)}
                        className="border-zinc-800 bg-zinc-950 text-violet-655 focus:ring-0 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {/* Checkboxes Group */}
              {field.type === 'checkbox' && (
                <div className="space-y-2.5 pt-1">
                  {field.options.map((option, optIdx) => {
                    const isChecked = (answers[field.id] || []).includes(option);
                    return (
                      <label key={optIdx} className="flex items-center space-x-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleCheckboxChange(field.id, option, e.target.checked)}
                          className="rounded border-zinc-800 bg-zinc-950 text-violet-655 focus:ring-0 w-4 h-4 cursor-pointer"
                        />
                        <span className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors">
                          {option}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}

            </div>
          ))}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-3 text-xs"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{isSubmitting ? 'Submitting response...' : 'Submit Answers'}</span>
          </button>
        </form>

        <div className="text-center text-[10px] text-zinc-600 pt-6">
          <span>Created using </span>
          <a href="/" target="_blank" className="font-bold text-zinc-500 hover:underline">EliteForms</a>
        </div>
      </div>
    </div>
  );
}

