import { Link, useNavigate } from 'react-router-dom';
import { LogOut, CheckSquare, Bell, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

function getInitials(name = '') {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
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
  const index = name.charCodeAt(0) % gradients.length;
  return gradients[index];
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const initials = getInitials(user?.name);
  const gradient = getAvatarGradient(user?.name);

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-indigo-200 group-hover:scale-105 transition-all duration-200">
                <CheckSquare className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
            </div>
            <div>
              <span className="text-lg font-800 bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent font-extrabold tracking-tight">
                TaskFlow
              </span>
              <p className="text-xs text-slate-400 -mt-0.5 hidden sm:block">Stay productive</p>
            </div>
          </Link>

          {/* Right side */}
          {user && (
            <div className="flex items-center gap-2">
              {/* Notification bell */}
              <button className="relative p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200">
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
              </button>

              {/* Settings */}
              <button className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200">
                <Settings className="w-4.5 h-4.5" />
              </button>

              {/* Divider */}
              <div className="w-px h-6 bg-slate-200 mx-1" />

              {/* User info */}
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
                  <span className="text-xs font-bold text-white">{initials}</span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-slate-700 leading-none">{user.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[140px]">{user.email}</p>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 ml-1 px-3 py-2 text-sm text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-200 font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
