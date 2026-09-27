import { useState, useEffect } from 'react';
import { Save, X, Flag, Tag, Calendar, AlignLeft, Type, Loader2, Folder, Plus } from 'lucide-react';
import { getCategories, createCategory } from '../../api/categories';

const defaultForm = { title: '', description: '', status: 'todo', priority: 'medium', dueDate: '', tags: '', categoryId: '' };

const statusOptions = [
  { value: 'todo',        label: 'To Do',       dot: 'bg-slate-400'   },
  { value: 'in-progress', label: 'In Progress', dot: 'bg-amber-400'   },
  { value: 'completed',   label: 'Completed',   dot: 'bg-emerald-400' },
];

const priorityOptions = [
  { value: 'low',    label: 'Low',    active: 'bg-emerald-500 border-emerald-500 text-white', base: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40', dot: 'bg-emerald-400' },
  { value: 'medium', label: 'Medium', active: 'bg-amber-400 border-amber-400 text-white',     base: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40',             dot: 'bg-amber-400'   },
  { value: 'high',   label: 'High',   active: 'bg-rose-500 border-rose-500 text-white',       base: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40',                   dot: 'bg-rose-400'    },
];

const PRESET_COLORS = ['#6366f1','#8b5cf6','#ec4899','#f43f5e','#f59e0b','#10b981','#14b8a6','#3b82f6','#0ea5e9','#64748b'];

export default function TaskForm({ initialData, onSubmit, onCancel, loading }) {
  const [form,          setForm]          = useState(defaultForm);
  const [errors,        setErrors]        = useState({});
  const [categories,    setCategories]    = useState([]);
  const [showNewCat,    setShowNewCat]    = useState(false);
  const [newCatName,    setNewCatName]    = useState('');
  const [newCatColor,   setNewCatColor]   = useState('#6366f1');
  const [savingCat,     setSavingCat]     = useState(false);

  // Load categories
  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (initialData) {
      setForm({
        title:       initialData.title       || '',
        description: initialData.description || '',
        status:      initialData.status      || 'todo',
        priority:    initialData.priority    || 'medium',
        dueDate:     initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
        tags:        Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '',
        categoryId:  initialData.category?.id || initialData.categoryId || '',
      });
    } else {
      setForm(defaultForm);
    }
    setErrors({});
  }, [initialData]);

  const validate = () => {
    const e = {};
    if (!form.title.trim())            e.title       = 'Title is required';
    else if (form.title.length > 100)  e.title       = 'Max 100 characters';
    if (form.description.length > 500) e.description = 'Max 500 characters';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      title:       form.title.trim(),
      description: form.description.trim(),
      status:      form.status,
      priority:    form.priority,
      dueDate:     form.dueDate || null,
      tags:        form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      categoryId:  form.categoryId || null,
    });
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    setSavingCat(true);
    try {
      const cat = await createCategory({ name: newCatName.trim(), color: newCatColor });
      setCategories((prev) => [...prev, cat]);
      setForm((f) => ({ ...f, categoryId: cat.id }));
      setNewCatName('');
      setShowNewCat(false);
    } catch {}
    finally { setSavingCat(false); }
  };

  const inputBase = (key) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all ${
      errors[key]
        ? 'border-rose-300 bg-rose-50 dark:bg-rose-950/30 text-slate-700 dark:text-slate-200'
        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-slate-800'
    }`;

  const selectedCat = categories.find((c) => c.id === form.categoryId);

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">

      {/* Title */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
          <Type className="w-3.5 h-3.5 text-slate-400" />Task Title <span className="text-rose-400">*</span>
        </label>
        <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="What needs to be done?" className={inputBase('title')} autoFocus />
        <div className="flex justify-between mt-1">
          {errors.title ? <p className="text-rose-500 text-xs font-medium">{errors.title}</p> : <span />}
          <p className={`text-xs ${form.title.length > 90 ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600'}`}>{form.title.length}/100</p>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
          <AlignLeft className="w-3.5 h-3.5 text-slate-400" />Description
        </label>
        <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Add more details..." className={`${inputBase('description')} resize-none`} />
        <div className="flex justify-between mt-1">
          {errors.description ? <p className="text-rose-500 text-xs font-medium">{errors.description}</p> : <span />}
          <p className={`text-xs ${form.description.length > 450 ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600'}`}>{form.description.length}/500</p>
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
          <Folder className="w-3.5 h-3.5 text-slate-400" />Category
        </label>
        <div className="flex flex-wrap gap-2">
          {/* No category option */}
          <button type="button" onClick={() => setForm({ ...form, categoryId: '' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              !form.categoryId
                ? 'bg-slate-700 dark:bg-slate-200 text-white dark:text-slate-800 border-slate-700 dark:border-slate-200'
                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}>
            None
          </button>

          {categories.map((cat) => (
            <button key={cat.id} type="button" onClick={() => setForm({ ...form, categoryId: cat.id })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                form.categoryId === cat.id ? 'ring-2 ring-offset-1' : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                backgroundColor: cat.color + '20',
                color: cat.color,
                borderColor: cat.color + '60',
                ringColor: cat.color,
              }}>
              <Folder className="w-3 h-3" />{cat.name}
            </button>
          ))}

          {/* Add new category inline */}
          <button type="button" onClick={() => setShowNewCat(!showNewCat)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border border-dashed border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 hover:border-indigo-400 hover:text-indigo-500 dark:hover:border-indigo-500 dark:hover:text-indigo-400 transition-all">
            <Plus className="w-3 h-3" />New
          </button>
        </div>

        {/* Inline new category form */}
        {showNewCat && (
          <div className="mt-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-3">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Category name..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(); }}}
            />
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Color:</span>
              <div className="flex gap-1.5 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => setNewCatColor(c)}
                    className={`w-5 h-5 rounded-full transition-transform hover:scale-110 ${newCatColor === c ? 'ring-2 ring-offset-1 ring-slate-400 scale-110' : ''}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowNewCat(false)}
                className="flex-1 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                Cancel
              </button>
              <button type="button" onClick={handleAddCategory} disabled={savingCat || !newCatName.trim()}
                className="flex-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-xs font-semibold text-white transition-all">
                {savingCat ? 'Adding...' : 'Add Category'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Priority */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
          <Flag className="w-3.5 h-3.5 text-slate-400" />Priority
        </label>
        <div className="grid grid-cols-3 gap-2">
          {priorityOptions.map(({ value, label, active, base, dot }) => (
            <button key={value} type="button" onClick={() => setForm({ ...form, priority: value })}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all duration-150 ${form.priority === value ? active : base}`}>
              <span className={`w-2 h-2 rounded-full ${form.priority === value ? 'bg-white/70' : dot}`} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Status</label>
        <div className="grid grid-cols-3 gap-2">
          {statusOptions.map(({ value, label, dot }) => (
            <button key={value} type="button" onClick={() => setForm({ ...form, status: value })}
              className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all duration-150 ${
                form.status === value
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/40'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${form.status === value ? 'bg-white/70' : dot}`} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Due date + Tags */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />Due Date
          </label>
          <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className={inputBase('dueDate')} />
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-400" />Tags
          </label>
          <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="design, urgent" className={inputBase('tags')} />
        </div>
      </div>

      {/* Tag preview */}
      {form.tags && (
        <div className="flex flex-wrap gap-1.5 -mt-1">
          {form.tags.split(',').map((t) => t.trim()).filter(Boolean).map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400 text-xs font-medium border border-indigo-100 dark:border-indigo-800/40">
              <Tag className="w-3 h-3" />{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2 border-t border-slate-100 dark:border-slate-700/60">
        <button type="button" onClick={onCancel}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
          <X className="w-4 h-4" />Cancel
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 dark:shadow-indigo-900/40 hover:-translate-y-0.5 transition-all duration-200">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" />{initialData ? 'Save Changes' : 'Create Task'}</>}
        </button>
      </div>
    </form>
  );
}
