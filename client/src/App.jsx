import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider }  from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute    from './components/layout/ProtectedRoute';
import Sidebar           from './components/layout/Sidebar';
import Topbar            from './components/layout/Topbar';
import LoginPage         from './pages/LoginPage';
import RegisterPage      from './pages/RegisterPage';
import DashboardPage     from './pages/DashboardPage';
import AnalyticsPage     from './pages/AnalyticsPage';
import SettingsPage      from './pages/SettingsPage';
import ProfilePage       from './pages/ProfilePage';

function AppLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

function Protected({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 8px 24px -4px rgba(0,0,0,0.12)',
                border: '1px solid #f1f5f9',
              },
              success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
            }}
          />
          <Routes>
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/"          element={<Protected><DashboardPage /></Protected>} />
            <Route path="/tasks"     element={<Protected><DashboardPage /></Protected>} />
            <Route path="/analytics" element={<Protected><AnalyticsPage /></Protected>} />
            <Route path="/settings"  element={<Protected><SettingsPage /></Protected>} />
            <Route path="/profile"   element={<Protected><ProfilePage /></Protected>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
