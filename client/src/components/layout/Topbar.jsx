import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Sun, Moon, Search, X, Clock, CheckCircle2, AlertCircle, Calendar, ArrowRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth }  from '../../context/AuthContext';
import { useState, useEffect, useRef, useCallback } from 'react';
import { getTasks } from '../../api/tasks';

const pageTitles = {
  '/':          { title: 'Dashboard',  subtitle: 'Overview of your tasks and progress' },
  '/tasks':     { title: 'My Tasks',   subtitle: 'All your tasks in one place'          },
  '/analytics': { title: 'Analytics',  subtitle: 'Insights and productivity stats'      },
  '/settings':  { title: 'Settings',   subtitle: 'Manage your account and preferences'  },
  '/profile':   { title: 'Profile',    subtitle: 'Your personal information and stats'  },
};

/* ── Search Modal ─────────────────────────────────────────────── */
function SearchModal({ onClose }) {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Focus input on open
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Close on Escape
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await getTasks({ search: query.trim() });
        setResults(data.slice(0, 8));
      } catch {}
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const statusIcon = (status) => {
    if (status === 'completed')   return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (status === 'in-progress') return <Clock        className="w-4 h-4 text-amber-500"   />;
    return                               <AlertCircle  className="w-4 h-4 text-slate-400"   />;
  };

  const handleSelect = () => {
    navigate('/tasks');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-slate-900/20 dark:shadow-slate-950/60 border border-slate-100 dark:border-slate-700/60 overflow-hidden">

        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-700/60">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks by title or description..."
            className="flex-1 text-sm text-slate-700 dark:text-slate-200 bg-transparent placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-300 dark:text-slate-600 hover:text-slate-500 transition">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-lg font-medium">Esc</kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <span className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Search className="w-8 h-8 text-slate-200 dark:text-slate-700 mb-2" />
              <p className="text-sm text-slate-400 dark:text-slate-500">No tasks found for <span className="font-semibold">"{query}"</span></p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="py-2">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 px-4 py-1.5 uppercase tracking-wider">
                {results.length} result{results.length !== 1 ? 's' : ''}
              </p>
              {results.map((task) => (
                <button
                  key={task.id || task._id}
                  onClick={handleSelect}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all text-left group"
                >
                  {statusIcon(task.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">{task.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {task.priority === 'high' && (
                      <span className="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded-lg">High</span>
                    )}
                    {task.dueDate && (
                      <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-indigo-400 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {!query && (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-slate-400 dark:text-slate-500">Start typing to search your tasks...</p>
              <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">Search by title or description</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
          <span className="text-xs text-slate-400 dark:text-slate-500">Press <kbd className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-1.5 py-0.5 rounded text-xs font-medium">↵</kbd> to navigate</span>
          <button onClick={handleSelect} className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 transition flex items-center gap-1">
            View all tasks <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Notifications Panel ──────────────────────────────────────── */
function NotificationsPanel({ onClose, tasks }) {
  const panelRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const h = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  const today    = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

  const overdueTasks   = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < today && t.status !== 'completed');
  const todayTasks     = tasks.filter((t) => {
    if (!t.dueDate) return false;
    const d = new Date(t.dueDate); d.setHours(0,0,0,0);
    return d.getTime() === today.getTime() && t.status !== 'completed';
  });
  const tomorrowTasks  = tasks.filter((t) => {
    if (!t.dueDate) return false;
    const d = new Date(t.dueDate); d.setHours(0,0,0,0);
    return d.getTime() === tomorrow.getTime() && t.status !== 'completed';
  });

  const sections = [
    { label: 'Overdue',       items: overdueTasks,  icon: AlertCircle,  iconColor: 'text-rose-500',   bg: 'bg-rose-50 dark:bg-rose-950/30',   border: 'border-rose-100 dark:border-rose-800/40'   },
    { label: 'Due Today',     items: todayTasks,    icon: Clock,        iconColor: 'text-amber-500',  bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-100 dark:border-amber-800/40' },
    { label: 'Due Tomorrow',  items: tomorrowTasks, icon: Calendar,     iconColor: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-950/30',   border: 'border-blue-100 dark:border-blue-800/40'   },
  ].filter((s) => s.items.length > 0);

  const totalCount = overdueTasks.length + todayTasks.length + tomorrowTasks.length;

  return (
    <div
      ref={panelRef}
      className="absolute top-14 right-0 w-80 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-2xl shadow-2xl shadow-slate-900/15 dark:shadow-slate-950/60 z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700/60">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Notifications</span>
          {totalCount > 0 && (
            <span className="text-xs font-bold bg-rose-500 text-white px-1.5 py-0.5 rounded-full">{totalCount}</span>
          )}
        </div>
        <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto">
        {sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center px-4">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">All caught up!</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">No overdue or upcoming tasks.</p>
          </div>
        ) : (
          <div className="py-2 space-y-1">
            {sections.map(({ label, items, icon: Icon, iconColor, bg, border }) => (
              <div key={label}>
                <p className={`text-xs font-bold uppercase tracking-wider px-4 py-2 flex items-center gap-1.5 ${iconColor}`}>
                  <Icon className="w-3.5 h-3.5" />{label} · {items.length}
                </p>
                {items.map((task) => (
                  <div key={task.id || task._id} className={`mx-3 mb-1.5 p-3 rounded-xl ${bg} border ${border}`}>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{task.title}</p>
                    {task.dueDate && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(task.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/30">
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
          {totalCount > 0 ? `${totalCount} task${totalCount !== 1 ? 's' : ''} need your attention` : 'Notifications are up to date'}
        </p>
      </div>
    </div>
  );
}

/* ── Topbar ───────────────────────────────────────────────────── */
export default function Topbar() {
  const { dark, toggle }  = useTheme();
  const { user }          = useAuth();
  const location          = useLocation();

  const [searchOpen, setSearchOpen]   = useState(false);
  const [notifOpen,  setNotifOpen]    = useState(false);
  const [allTasks,   setAllTasks]     = useState([]);
  const notifRef = useRef(null);

  const page  = pageTitles[location.pathname] || pageTitles['/'];
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  // Load tasks for notification counts
  const loadTasks = useCallback(async () => {
    try { const data = await getTasks({}); setAllTasks(data); } catch {}
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  // Keyboard shortcut: / or Ctrl+K opens search
  useEffect(() => {
    const h = (e) => {
      if ((e.key === '/' || (e.ctrlKey && e.key === 'k')) && !searchOpen) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [searchOpen]);

  // Notification badge count
  const todayDate = new Date(); todayDate.setHours(0, 0, 0, 0);
  const badgeCount = allTasks.filter((t) => {
    if (t.status === 'completed' || !t.dueDate) return false;
    const d = new Date(t.dueDate); d.setHours(0, 0, 0, 0);
    const tomorrow = new Date(todayDate); tomorrow.setDate(tomorrow.getDate() + 1);
    return d <= tomorrow;
  }).length;

  return (
    <>
      <header className="shrink-0 h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm">

        {/* Left — page title */}
        <div className="flex flex-col justify-center">
          <h1 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-none">{page.title}</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 hidden sm:block">{page.subtitle}</p>
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-2">

          {/* Date pill */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400">
            {today}
          </div>

          {/* Search button */}
          <button
            onClick={() => setSearchOpen(true)}
            title="Search tasks (/ or Ctrl+K)"
            className="flex items-center gap-2 p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
          >
            <Search className="w-4 h-4" />
            <kbd className="hidden lg:block text-xs bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 text-slate-400 dark:text-slate-500 px-1.5 py-0.5 rounded font-medium transition-all">/</kbd>
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="relative p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
          >
            <span className={`transition-all duration-300 ${dark ? 'opacity-0 rotate-90 absolute inset-0 flex items-center justify-center' : 'opacity-100 rotate-0'}`}>
              <Moon className="w-4 h-4 text-indigo-400" />
            </span>
            <span className={`transition-all duration-300 ${dark ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90 absolute inset-0 flex items-center justify-center'}`}>
              <Sun className="w-4 h-4 text-amber-400" />
            </span>
          </button>

          {/* Notification bell — with real badge + dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setNotifOpen((o) => !o); if (!notifOpen) loadTasks(); }}
              title="Notifications"
              className={`relative p-2 rounded-xl transition-all ${
                notifOpen
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Bell className="w-4 h-4" />
              {badgeCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-0.5 ring-2 ring-white dark:ring-slate-900">
                  {badgeCount > 9 ? '9+' : badgeCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <NotificationsPanel
                onClose={() => setNotifOpen(false)}
                tasks={allTasks}
              />
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

          {/* User */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-none">{user?.name}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{user?.email}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Search modal — rendered outside header so it overlays everything */}
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </>
  );
}
