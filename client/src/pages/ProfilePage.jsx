import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Save, CheckCircle2, BarChart3, CheckSquare, Clock, AlertCircle, Calendar, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getTaskStats } from '../api/tasks';

const AVATAR_EMOJIS = [
  '👤','😀','😎','🤓','🥷','🧑‍💻','👨‍🚀','👩‍🎨','🦸','🧙','🐱','🦊',
  '🐸','🐼','🦁','🐯','🦋','🌟','🚀','⚡','🔥','💎','🎯','🏆',
];

function AvatarPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-20 h-20 text-4xl bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 border-2 border-indigo-200 dark:border-indigo-700/60 rounded-2xl flex items-center justify-center hover:border-indigo-400 dark:hover:border-indigo-500 transition-all shadow-sm hover:shadow-md hover:scale-105">
        {value}
      </button>
      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">✎</div>
      {open && (
        <div className="absolute top-24 left-0 z-30 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-3 w-64">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-1">Choose Avatar</p>
          <div className="grid grid-cols-8 gap-1">
            {AVATAR_EMOJIS.map(emoji => (
              <button key={emoji} type="button"
                onClick={() => { onChange(emoji); setOpen(false); }}
                className={`w-8 h-8 text-lg rounded-lg flex items-center justify-center hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all ${value === emoji ? 'bg-indigo-100 dark:bg-indigo-900/40 ring-2 ring-indigo-400' : ''}`}>
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg, border }) {
  return (
    <div className={`${bg} border ${border} rounded-2xl p-4 flex items-center gap-3`}>
      <div className={`w-9 h-9 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{value}</p>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, updateUser, loading } = useAuth();

  const [form,    setForm]    = useState({ name: user?.name || '', email: user?.email || '', avatarEmoji: user?.avatarEmoji || '👤' });
  const [errors,  setErrors]  = useState({});
  const [saved,   setSaved]   = useState(false);
  const [stats,   setStats]   = useState({ total: 0, completed: 0, 'in-progress': 0, todo: 0 });

  useEffect(() => {
    getTaskStats().then(setStats).catch(() => {});
  }, []);

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const memberSince    = user ? new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '';

  const validate = () => {
    const e = {};
    if (!form.name.trim())              e.name  = 'Name required';
    if (!form.email.trim())             e.email = 'Email required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const res = await updateUser({ name: form.name.trim(), email: form.email.trim(), avatarEmoji: form.avatarEmoji });
    if (res.success) {
      toast.success('Profile saved!');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      toast.error(res.message);
    }
  };

  const inputClass = (key) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all ${
      errors[key]
        ? 'border-rose-300 bg-rose-50 dark:bg-rose-950/30 text-slate-700 dark:text-slate-200'
        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800'
    }`;

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md">
          <User className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Profile</h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm">Manage your personal information</p>
        </div>
      </div>

      {/* Profile card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-2xl shadow-sm overflow-hidden">
        {/* Cover gradient */}
        <div className="h-24 bg-gradient-to-r from-indigo-500 via-violet-600 to-purple-600 relative">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        </div>

        <div className="px-6 pb-6">
          {/* Avatar overlapping cover */}
          <div className="flex items-end justify-between -mt-10 mb-4">
            <AvatarPicker value={form.avatarEmoji} onChange={v => setForm(f => ({ ...f, avatarEmoji: v }))} />
            <div className="text-right">
              <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center justify-end gap-1">
                <Calendar className="w-3 h-3" />Member since {memberSince}
              </p>
              <div className={`mt-1 inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                completionRate >= 70 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'
                  : completionRate >= 40 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-700/60 dark:text-slate-400'}`}>
                <BarChart3 className="w-3 h-3" />{completionRate}% completion
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Full Name</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Your name" className={inputClass('name')} />
                {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Email Address</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com" className={inputClass('email')} />
                {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email}</p>}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button type="submit" disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 dark:shadow-indigo-900/30 hover:-translate-y-0.5 transition-all duration-200">
                {loading
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><Save className="w-4 h-4" />Save Profile</>}
              </button>
              {saved && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />Saved!
                </span>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Stats */}
      <div>
        <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Your Task Stats</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={CheckSquare}  label="Total Tasks"  value={stats.total}
            color="text-indigo-600 dark:text-indigo-400"
            bg="bg-indigo-50 dark:bg-indigo-950/40" border="border-indigo-100 dark:border-indigo-800/40" />
          <StatCard icon={CheckCircle2} label="Completed"    value={stats.completed}
            color="text-emerald-600 dark:text-emerald-400"
            bg="bg-emerald-50 dark:bg-emerald-950/40" border="border-emerald-100 dark:border-emerald-800/40" />
          <StatCard icon={Clock}        label="In Progress"  value={stats['in-progress']}
            color="text-amber-600 dark:text-amber-400"
            bg="bg-amber-50 dark:bg-amber-950/40" border="border-amber-100 dark:border-amber-800/40" />
          <StatCard icon={AlertCircle}  label="To Do"        value={stats.todo}
            color="text-slate-500 dark:text-slate-400"
            bg="bg-slate-50 dark:bg-slate-800/60" border="border-slate-100 dark:border-slate-700/60" />
        </div>

        {/* Progress bar */}
        {stats.total > 0 && (
          <div className="mt-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Overall Progress</span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{completionRate}%</span>
            </div>
            <div className="h-2.5 bg-slate-100 dark:bg-slate-700/60 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
                style={{ width: `${completionRate}%` }} />
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
              {stats.completed} of {stats.total} tasks completed
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
