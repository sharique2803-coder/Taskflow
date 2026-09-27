import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  User, Lock, Trash2, Save, Eye, EyeOff,
  ShieldAlert, CheckCircle2, Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Section({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/60 flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center shadow-sm">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function InputField({ label, type = 'text', value, onChange, placeholder, error, suffix }) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <input
          type={isPassword ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-2.5 ${isPassword ? 'pr-11' : ''} rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all ${
            error
              ? 'border-rose-300 bg-rose-50 dark:bg-rose-950/30 text-slate-700 dark:text-slate-200'
              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-slate-800'
          }`}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && <p className="text-rose-500 text-xs mt-1 font-medium">{error}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const { user, updateUser, deleteAccount, loading } = useAuth();
  const navigate = useNavigate();

  // Profile form
  const [profile, setProfile]   = useState({ name: user?.name || '', email: user?.email || '' });
  const [profileErr, setProfileErr] = useState({});
  const [profileOk,  setProfileOk]  = useState(false);

  // Password form
  const [pwd, setPwd]     = useState({ current: '', next: '', confirm: '' });
  const [pwdErr, setPwdErr] = useState({});
  const [pwdOk,  setPwdOk]  = useState(false);

  // Delete confirm
  const [deleteInput, setDeleteInput] = useState('');
  const [deleting, setDeleting] = useState(false);

  /* ── Save profile ─────────────────────────────────────────── */
  const saveProfile = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!profile.name.trim())              errs.name  = 'Name is required';
    if (!profile.email.trim())             errs.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(profile.email)) errs.email = 'Invalid email';
    setProfileErr(errs);
    if (Object.keys(errs).length) return;

    const res = await updateUser({ name: profile.name.trim(), email: profile.email.trim() });
    if (res.success) {
      toast.success('Profile updated!');
      setProfileOk(true);
      setTimeout(() => setProfileOk(false), 3000);
    } else {
      toast.error(res.message);
    }
  };

  /* ── Change password ──────────────────────────────────────── */
  const changePassword = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!pwd.current)            errs.current = 'Current password required';
    if (!pwd.next)               errs.next    = 'New password required';
    else if (pwd.next.length < 6) errs.next   = 'Min 6 characters';
    if (pwd.next !== pwd.confirm) errs.confirm = 'Passwords do not match';
    setPwdErr(errs);
    if (Object.keys(errs).length) return;

    const res = await updateUser({ currentPassword: pwd.current, newPassword: pwd.next });
    if (res.success) {
      toast.success('Password changed!');
      setPwd({ current: '', next: '', confirm: '' });
      setPwdOk(true);
      setTimeout(() => setPwdOk(false), 3000);
    } else {
      toast.error(res.message);
    }
  };

  /* ── Delete account ───────────────────────────────────────── */
  const handleDelete = async () => {
    if (deleteInput !== 'DELETE') return;
    setDeleting(true);
    const res = await deleteAccount();
    if (res.success) {
      toast.success('Account deleted');
      navigate('/login');
    } else {
      toast.error(res.message);
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Settings</h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm">Manage your account and preferences</p>
        </div>
      </div>

      {/* Profile info */}
      <Section icon={User} title="Profile Information" subtitle="Update your name and email address">
        <form onSubmit={saveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Full Name" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
              placeholder="John Doe" error={profileErr.name} />
            <InputField label="Email Address" type="email" value={profile.email}
              onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
              placeholder="you@example.com" error={profileErr.email} />
          </div>
          <div className="flex items-center gap-3 pt-1">
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 dark:shadow-indigo-900/30 hover:-translate-y-0.5 transition-all duration-200">
              {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><Save className="w-4 h-4" />Save Changes</>}
            </button>
            {profileOk && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />Saved!
              </span>
            )}
          </div>
        </form>
      </Section>

      {/* Change password */}
      <Section icon={Lock} title="Change Password" subtitle="Use a strong password you don't use elsewhere">
        <form onSubmit={changePassword} className="space-y-4">
          <InputField label="Current Password" type="password" value={pwd.current}
            onChange={e => setPwd(p => ({ ...p, current: e.target.value }))}
            placeholder="••••••••" error={pwdErr.current} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="New Password" type="password" value={pwd.next}
              onChange={e => setPwd(p => ({ ...p, next: e.target.value }))}
              placeholder="Min 6 characters" error={pwdErr.next} />
            <InputField label="Confirm New Password" type="password" value={pwd.confirm}
              onChange={e => setPwd(p => ({ ...p, confirm: e.target.value }))}
              placeholder="••••••••" error={pwdErr.confirm} />
          </div>
          <div className="flex items-center gap-3 pt-1">
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 dark:shadow-indigo-900/30 hover:-translate-y-0.5 transition-all duration-200">
              {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><Lock className="w-4 h-4" />Update Password</>}
            </button>
            {pwdOk && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />Password changed!
              </span>
            )}
          </div>
        </form>
      </Section>

      {/* Danger zone */}
      <Section icon={ShieldAlert} title="Danger Zone" subtitle="These actions are permanent and cannot be undone">
        <div className="border border-rose-200 dark:border-rose-800/40 rounded-xl p-4 bg-rose-50/50 dark:bg-rose-950/20 space-y-4">
          <div>
            <p className="text-sm font-semibold text-rose-700 dark:text-rose-400 mb-1">Delete Account</p>
            <p className="text-xs text-rose-600/80 dark:text-rose-400/70 leading-relaxed">
              Permanently deletes your account, all tasks, and categories. Type <span className="font-bold">DELETE</span> to confirm.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
              placeholder='Type "DELETE" to confirm'
              className="flex-1 px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-800/40 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
            />
            <button
              onClick={handleDelete}
              disabled={deleteInput !== 'DELETE' || deleting}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 disabled:opacity-40 text-white text-sm font-semibold rounded-xl shadow-md shadow-rose-200 dark:shadow-rose-900/30 transition-all duration-200"
            >
              {deleting ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><Trash2 className="w-4 h-4" />Delete</>}
            </button>
          </div>
        </div>
      </Section>
    </div>
  );
}
