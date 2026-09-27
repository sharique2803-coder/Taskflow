import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  CheckSquare, LayoutDashboard, LogOut,
  Sun, Moon, ChevronLeft, ChevronRight,
  ListTodo, BarChart3, Settings, HelpCircle,
  X, Keyboard, Tag, BarChart2,
  Bell, Search, CheckCircle2, ChevronDown, User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-hot-toast';

/* ── Help Modal ──────────────────────────────────────────────── */
const helpSections = [
  {
    title: 'Getting Started',
    icon: CheckCircle2,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    items: [
      'Click + New Task to create your first task',
      'Fill in title, priority, status, due date and tags',
      'Assign a category/project to organise your work',
      'Click the circle icon on any card to cycle its status',
    ],
  },
  {
    title: 'Keyboard Shortcuts',
    icon: Keyboard,
    color: 'text-indigo-500',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    items: [
      '/ or Ctrl+K — Open global search',
      'Esc — Close any open modal or panel',
    ],
    shortcuts: true,
  },
  {
    title: 'Search & Filters',
    icon: Search,
    color: 'text-violet-500',
    bg: 'bg-violet-50 dark:bg-violet-950/40',
    items: [
      'Use the search bar to find tasks by title or description',
      'Filter by status, priority, category or sort order',
      'Click the / key in the topbar to open global search',
    ],
  },
  {
    title: 'Categories',
    icon: Tag,
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    items: [
      'Create colour-coded categories inside the task form',
      'Filter tasks by category using the pills on the dashboard',
      'Categories persist across all your tasks',
    ],
  },
  {
    title: 'Notifications',
    icon: Bell,
    color: 'text-rose-500',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    items: [
      'Bell icon shows overdue, due-today and due-tomorrow tasks',
      'Badge count updates automatically when tasks change',
      '"Today\'s Focus" section highlights tasks due today',
    ],
  },
  {
    title: 'Analytics',
    icon: BarChart2,
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    items: [
      'View your completion rate and task trends',
      'Bar chart shows tasks created vs completed over 14 days',
      'Donut charts break down by status and priority',
    ],
  },
];

function HelpModal({ onClose }) {
  const [openSection, setOpenSection] = useState(0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col border border-slate-100 dark:border-slate-700/60 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Help & Documentation</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">Everything you need to know about TaskFlow</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {helpSections.map(({ title, icon: Icon, color, bg, items }, i) => (
            <div key={title} className={`rounded-xl border border-slate-100 dark:border-slate-700/60 overflow-hidden`}>
              {/* Section header */}
              <button
                onClick={() => setOpenSection(openSection === i ? -1 : i)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openSection === i ? 'rotate-180' : ''}`} />
              </button>

              {/* Section body */}
              {openSection === i && (
                <div className="px-4 pb-4 pt-1 space-y-2 border-t border-slate-50 dark:border-slate-700/40">
                  {items.map((item, j) => (
                    <div key={j} className="flex items-start gap-2.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${color.replace('text-', 'bg-')} mt-1.5 shrink-0`} />
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-3 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
          <p className="text-xs text-slate-400 dark:text-slate-500">TaskFlow v1.0.0</p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-semibold rounded-lg transition-all"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}

function getInitials(name = '') {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function getAvatarGradient(name = '') {
  const gradients = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-cyan-500 to-sky-600',
  ];
  return gradients[(name.charCodeAt(0) || 0) % gradients.length];
}

const navItems = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tasks',     icon: ListTodo,        label: 'My Tasks'  },
  { to: '/analytics', icon: BarChart3,       label: 'Analytics' },
  { to: '/profile',   icon: User,            label: 'Profile'   },
  { to: '/settings',  icon: Settings,        label: 'Settings'  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed,  setCollapsed]  = useState(false);
  const [helpOpen,   setHelpOpen]   = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const initials = getInitials(user?.name);
  const gradient = getAvatarGradient(user?.name);

  return (
    <>
    <aside
      className={`
        relative flex flex-col h-screen sticky top-0
        border-r border-slate-200 dark:border-slate-700/60
        bg-white dark:bg-slate-900
        shadow-sm transition-all duration-300
        ${collapsed ? 'w-[72px]' : 'w-64'}
      `}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3.5 top-6 z-50 w-7 h-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center shadow-md text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
      >
        {collapsed
          ? <ChevronRight className="w-3.5 h-3.5" />
          : <ChevronLeft  className="w-3.5 h-3.5" />}
      </button>

      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 h-16 border-b border-slate-100 dark:border-slate-700/60 shrink-0 ${collapsed ? 'justify-center' : ''}`}>
        <div className="relative shrink-0">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md">
            <CheckSquare className="w-5 h-5 text-white" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-base font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent tracking-tight leading-none">
              TaskFlow
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Stay productive</p>
          </div>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {!collapsed && (
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-3">
            Menu
          </p>
        )}

        {navItems.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
                transition-all duration-200 group relative
                ${active
                  ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/40'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-white' : ''}`} />
              {!collapsed && <span>{label}</span>}
              {active && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />
              )}
            </Link>
          );
        })}

        {!collapsed && (
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700/60">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-3">
              Support
            </p>
            <button
              onClick={() => setHelpOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-all">
              <HelpCircle className="w-5 h-5 shrink-0" />
              <span>Help & Docs</span>
            </button>
          </div>
        )}
      </nav>

      {/* Bottom section */}
      <div className={`shrink-0 border-t border-slate-100 dark:border-slate-700/60 p-3 space-y-2`}>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
            transition-all duration-200
            text-slate-500 dark:text-slate-400
            hover:bg-slate-100 dark:hover:bg-slate-800
            hover:text-slate-700 dark:hover:text-slate-200
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          {dark
            ? <Sun  className="w-5 h-5 shrink-0 text-amber-400" />
            : <Moon className="w-5 h-5 shrink-0 text-indigo-400" />
          }
          {!collapsed && (
            <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
          )}
          {!collapsed && (
            <div className={`ml-auto w-10 h-5 rounded-full flex items-center px-0.5 transition-colors duration-300 ${dark ? 'bg-indigo-500' : 'bg-slate-200'}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${dark ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          )}
        </button>

        {/* User profile */}
        <div className={`flex items-center gap-2.5 px-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 ${collapsed ? 'justify-center' : ''}`}>
          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm shrink-0`}>
            <span className="text-xs font-bold text-white">{initials}</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-none truncate">
                {user?.name}
              </p>
              <p className="text-xs text-slate-400 mt-0.5 truncate">{user?.email}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Collapsed logout */}
        {collapsed && (
          <button
            onClick={handleLogout}
            title="Logout"
            className="w-full flex justify-center p-2.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </aside>

    {/* Help modal — rendered outside aside so it covers full screen */}
    {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
    </>
  );
}
