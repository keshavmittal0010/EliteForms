'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../hooks/useAuth';
import { formService } from '../../../../services/api';
import Sidebar from '../../../../components/Sidebar';
import Navbar from '../../../../components/Navbar';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Settings, 
  Eye, 
  Edit,
  Save, 
  AlertCircle,
  PlusSquare,
  MinusSquare
} from 'lucide-react';

export default function EditFormPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const formId = params.id;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    async function loadForm() {
      if (!isAuthenticated || !formId) return;
      try {
        const res = await formService.getFormById(formId);
        setTitle(res.data.title);
        setDescription(res.data.description || '');
        setFields(res.data.fields || []);
      } catch (err) {
        console.error('Error fetching form structure', err);
        setError('Could not load form structure. Check if it exists.');
      } finally {
        setLoading(false);
      }
    }
    loadForm();
  }, [isAuthenticated, formId]);

  const fieldTypes = [
    { type: 'text', name: 'Text Input', placeholderText: 'Enter text here...' },
    { type: 'email', name: 'Email Input', placeholderText: 'name@company.com' },
    { type: 'number', name: 'Number Input', placeholderText: '0-999' },
    { type: 'textarea', name: 'Textarea', placeholderText: 'Enter long comment...' },
    { type: 'date', name: 'Date Input' },
    { type: 'dropdown', name: 'Dropdown Select', options: ['Option 1', 'Option 2'] },
    { type: 'radio', name: 'Radio Buttons', options: ['Option 1', 'Option 2'] },
    { type: 'checkbox', name: 'Checkboxes', options: ['Option 1', 'Option 2'] },
  ];

  const addField = (typeInfo) => {
    const newField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type: typeInfo.type,
      label: `New ${typeInfo.name}`,
      placeholder: typeInfo.placeholderText || '',
      required: false,
      options: typeInfo.options ? [...typeInfo.options] : [],
    };
    setFields([...fields, newField]);
  };

  const deleteField = (id) => {
    setFields(fields.filter((field) => field.id !== id));
  };

  const updateFieldProperty = (id, propName, value) => {
    setFields(
      fields.map((field) => {
        if (field.id === id) {
          return { ...field, [propName]: value };
        }
        return field;
      })
    );
  };

  const addOption = (fieldId) => {
    setFields(
      fields.map((field) => {
        if (field.id === fieldId) {
          return {
            ...field,
            options: [...field.options, `Option ${field.options.length + 1}`],
          };
        }
        return field;
      })
    );
  };

  const updateOptionValue = (fieldId, optionIndex, value) => {
    setFields(
      fields.map((field) => {
        if (field.id === fieldId) {
          const newOptions = [...field.options];
          newOptions[optionIndex] = value;
          return { ...field, options: newOptions };
        }
        return field;
      })
    );
  };

  const deleteOption = (fieldId, optionIndex) => {
    setFields(
      fields.map((field) => {
        if (field.id === fieldId) {
          const newOptions = field.options.filter((_, idx) => idx !== optionIndex);
          return { ...field, options: newOptions };
        }
        return field;
      })
    );
  };

  const moveField = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === fields.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newFields = [...fields];
    const temp = newFields[index];
    newFields[index] = newFields[newIndex];
    newFields[newIndex] = temp;
    setFields(newFields);
  };

  const handleSaveForm = async () => {
    setError('');
    
    if (!title.trim()) {
      setError('Form Title is required');
      return;
    }

    if (fields.length === 0) {
      setError('Add at least one field to save the form');
      return;
    }

    const invalidField = fields.find((f) => !f.label.trim());
    if (invalidField) {
      setError('All fields must have a label');
      return;
    }

    const multiChoiceField = fields.find(
      (f) => ['dropdown', 'radio', 'checkbox'].includes(f.type) && f.options.length === 0
    );
    if (multiChoiceField) {
      setError(`Field "${multiChoiceField.label}" needs at least one option`);
      return;
    }

    try {
      setIsSaving(true);
      await formService.updateForm(formId, {
        title: title.trim(),
        description: description.trim(),
        fields,
      });
      router.push('/forms');
    } catch (err) {
      console.error('Error updating form', err);
      setError(err.response?.data?.message || 'Failed to update form. Try again.');
    } finally {
      setIsSaving(false);
    }
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

        {/* Builder Toolbar */}
        <div className="sticky top-16 z-30 flex items-center justify-between border-b border-zinc-900 bg-[#030303]/80 backdrop-blur-md px-6 py-3.5">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/forms')}
              className="rounded-lg border border-zinc-800 p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-bold text-white uppercase tracking-wider">Editor</span>
          </div>

          <div className="flex items-center space-x-3.5">
            {/* Toggle Preview/Edit Mode */}
            <button
              onClick={() => setIsPreview(!isPreview)}
              className="inline-flex items-center space-x-2 rounded-xl border border-zinc-800 bg-zinc-900/30 px-3.5 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 transition-all"
            >
              {isPreview ? (
                <>
                  <Edit className="h-3.5 w-3.5 text-violet-400" />
                  <span>Edit Builder</span>
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5 text-violet-400" />
                  <span>Live Preview</span>
                </>
              )}
            </button>

            {/* Save Form */}
            <button
              onClick={handleSaveForm}
              disabled={isSaving || loading}
              className="btn-primary py-2 px-4 text-xs font-bold"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isSaving ? 'Updating...' : 'Update Form'}</span>
            </button>
          </div>
        </div>

        {/* Builder Layout */}
        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Form Editing Workspace */}
          <div className="lg:col-span-2 space-y-4">
            {error && (
              <div className="flex items-center space-x-2 rounded-xl bg-red-500/5 border border-red-500/20 p-4 text-xs text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-32 bg-zinc-900/40 border border-zinc-900 rounded-2xl" />
                <div className="h-28 bg-zinc-900/40 border border-zinc-900 rounded-2xl" />
              </div>
            ) : (
              <>
                {/* Form Details Card */}
                <div className="premium-panel rounded-2xl p-6 space-y-3 shadow-md">
                  <div>
                    <input
                      type="text"
                      placeholder="Form Title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={isPreview}
                      className="bg-transparent border-0 border-b border-transparent hover:border-zinc-800 focus:border-violet-500 text-xl font-bold text-white outline-none w-full pb-1 transition-colors placeholder:text-zinc-600"
                    />
                  </div>
                  <div>
                    <textarea
                      placeholder="Form Description / Instructions..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={isPreview}
                      rows={2}
                      className="bg-transparent border-0 border-b border-transparent hover:border-zinc-800 focus:border-violet-500 text-xs text-zinc-400 outline-none w-full pb-1 resize-none transition-colors placeholder:text-zinc-600"
                    />
                  </div>
                </div>

                {/* Editor canvas */}
                {!isPreview ? (
                  <div className="space-y-3">
                    {fields.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/10 text-center">
                        <PlusSquare className="h-8 w-8 text-zinc-700 mb-3" />
                        <h3 className="text-xs font-bold text-zinc-400">Form Workspace Empty</h3>
                        <p className="text-[10px] text-zinc-500 mt-1 max-w-[220px]">
                          Click questions on the right side panel to populate your workspace.
                        </p>
                      </div>
                    ) : (
                      fields.map((field, idx) => (
                        <div key={field.id} className="glow-card rounded-2xl p-5 space-y-4 relative group">
                          
                          {/* Toolbar */}
                          <div className="flex items-center justify-between border-b border-zinc-900/60 pb-2.5">
                            <div className="flex items-center space-x-2">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-violet-400 px-2 py-0.5 bg-violet-500/10 border border-violet-500/20 rounded">
                                {field.type}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1 opacity-40 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => moveField(idx, 'up')}
                                disabled={idx === 0}
                                className="p-1 rounded hover:bg-zinc-900 text-zinc-400 disabled:opacity-25"
                              >
                                <ChevronUp className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => moveField(idx, 'down')}
                                disabled={idx === fields.length - 1}
                                className="p-1 rounded hover:bg-zinc-900 text-zinc-400 disabled:opacity-25"
                              >
                                <ChevronDown className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteField(field.id)}
                                className="p-1 rounded hover:bg-red-500/10 hover:text-red-400 text-zinc-500 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {/* Config parameters */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2 space-y-1.5">
                              <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Field Title / Label</label>
                              <input
                                type="text"
                                value={field.label}
                                onChange={(e) => updateFieldProperty(field.id, 'label', e.target.value)}
                                placeholder="e.g. Enter your name"
                                className="modern-input w-full px-3 py-2 text-xs"
                              />
                            </div>

                            <div className="space-y-1 flex flex-col justify-end">
                              <div className="flex items-center h-9">
                                <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={field.required}
                                    onChange={(e) => updateFieldProperty(field.id, 'required', e.target.checked)}
                                    className="rounded border-zinc-800 bg-zinc-950 text-violet-600 focus:ring-0 w-4.5 h-4.5 cursor-pointer"
                                  />
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                    Required
                                  </span>
                                </label>
                              </div>
                            </div>
                          </div>

                          {/* Customizers based on type */}
                          {['text', 'email', 'number', 'textarea'].includes(field.type) ? (
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Placeholder Hint</label>
                              <input
                                type="text"
                                value={field.placeholder || ''}
                                onChange={(e) => updateFieldProperty(field.id, 'placeholder', e.target.value)}
                                placeholder="e.g. Type answer..."
                                className="modern-input w-full px-3 py-2 text-xs"
                              />
                            </div>
                          ) : (
                            // Options Editor
                            <div className="space-y-2">
                              <div className="flex items-center justify-between border-b border-zinc-900/60 pb-1.5">
                                <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Options list</label>
                                <button
                                  onClick={() => addOption(field.id)}
                                  className="text-[10px] font-bold text-violet-400 hover:text-violet-300 flex items-center space-x-1"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                  <span>Add Item</span>
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {field.options.map((option, optIdx) => (
                                  <div key={optIdx} className="flex items-center space-x-2">
                                    <input
                                      type="text"
                                      value={option}
                                      onChange={(e) => updateOptionValue(field.id, optIdx, e.target.value)}
                                      className="modern-input flex-1 px-3 py-1.5 text-2xs"
                                    />
                                    <button
                                      onClick={() => deleteOption(field.id, optIdx)}
                                      disabled={field.options.length <= 1}
                                      className="p-1.5 text-zinc-500 hover:text-red-400 disabled:opacity-20 transition-colors"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  // Live Preview Layout
                  <div className="premium-panel rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
                    <div className="border-b border-zinc-900 pb-4">
                      <h2 className="text-lg font-bold text-white">{title}</h2>
                      {description && <p className="text-xs text-zinc-400 mt-1">{description}</p>}
                    </div>

                    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                      {fields.map((field) => (
                        <div key={field.id} className="space-y-1.5">
                          <label className="block text-xs font-semibold text-zinc-300">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </label>

                          {field.type === 'text' && (
                            <input
                              type="text"
                              disabled
                              placeholder={field.placeholder}
                              className="modern-input w-full px-3.5 py-2 text-xs opacity-75"
                            />
                          )}

                          {field.type === 'email' && (
                            <input
                              type="email"
                              disabled
                              placeholder={field.placeholder}
                              className="modern-input w-full px-3.5 py-2 text-xs opacity-75"
                            />
                          )}

                          {field.type === 'number' && (
                            <input
                              type="number"
                              disabled
                              placeholder={field.placeholder}
                              className="modern-input w-full px-3.5 py-2 text-xs opacity-75"
                            />
                          )}

                          {field.type === 'textarea' && (
                            <textarea
                              disabled
                              placeholder={field.placeholder}
                              rows={3}
                              className="modern-input w-full px-3.5 py-2 text-xs resize-none opacity-75"
                            />
                          )}

                          {field.type === 'date' && (
                            <input
                              type="date"
                              disabled
                              className="modern-input w-full px-3.5 py-2 text-xs opacity-75"
                            />
                          )}

                          {field.type === 'dropdown' && (
                            <select disabled className="modern-input w-full px-3.5 py-2 text-xs bg-zinc-950 opacity-75">
                              <option value="">Choose item</option>
                              {field.options.map((opt, oIdx) => (
                                <option key={oIdx} value={opt}>{opt}</option>
                              ))}
                            </select>
                          )}

                          {field.type === 'radio' && (
                            <div className="space-y-2 pt-1 opacity-75">
                              {field.options.map((opt, oIdx) => (
                                <div key={oIdx} className="flex items-center space-x-2.5">
                                  <input
                                    type="radio"
                                    disabled
                                    className="border-zinc-800 bg-zinc-950 text-violet-600 w-4 h-4"
                                  />
                                  <span className="text-xs text-zinc-400">{opt}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {field.type === 'checkbox' && (
                            <div className="space-y-2 pt-1 opacity-75">
                              {field.options.map((opt, oIdx) => (
                                <div key={oIdx} className="flex items-center space-x-2.5">
                                  <input
                                    type="checkbox"
                                    disabled
                                    className="rounded border-zinc-800 bg-zinc-950 text-violet-600 w-4 h-4"
                                  />
                                  <span className="text-xs text-zinc-400">{opt}</span>
                                </div>
                              ))}
                            </div>
                          )}

                        </div>
                      ))}
                    </form>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Picker Panel */}
          <div className="space-y-6">
            <div className={`premium-panel rounded-2xl p-5 space-y-3.5 shadow-md ${isPreview || loading ? 'opacity-40 pointer-events-none' : ''}`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center space-x-2">
                <Settings className="h-4 w-4 text-violet-400" />
                <span>Components</span>
              </h3>
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                Click elements below to append them into the editor canvas.
              </p>

              <div className="grid grid-cols-1 gap-2 pt-1">
                {fieldTypes.map((typeInfo, idx) => (
                  <button
                    key={idx}
                    onClick={() => addField(typeInfo)}
                    className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/40 px-3.5 py-2.5 text-xs font-semibold text-zinc-300 hover:border-zinc-700 hover:text-white transition-all text-left"
                  >
                    <span>{typeInfo.name}</span>
                    <Plus className="h-3.5 w-3.5 text-zinc-500" />
                  </button>
                ))}
              </div>
            </div>

            {/* Editor tips */}
            <div className="premium-panel rounded-2xl p-5 space-y-2 text-[10px] text-zinc-500 leading-relaxed">
              <span className="font-bold text-zinc-400 uppercase tracking-wider block">Field Setup</span>
              <p>Modifying form parameters updates survey responses dynamically. Values previously captured for matching field IDs remain saved.</p>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

