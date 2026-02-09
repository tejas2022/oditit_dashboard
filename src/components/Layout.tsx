import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Shield,
  FileText,
  FolderOpen,
  ClipboardList,
  Settings,
  ChevronDown,
  LogOut,
  User,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useState } from 'react';
import { ChooseFrameworkBanner } from './ChooseFrameworkBanner';

const navTabs = [
  { to: '/', label: 'Home', icon: FolderOpen },
  { to: '/frameworks', label: 'Choose framework', icon: FolderOpen },
  { to: '/controls', label: 'Controls', icon: Shield },
  { to: '/summary', label: 'Summary', icon: LayoutDashboard },
  { to: '/policies', label: 'Policies', icon: FileText },
  { to: '/vendors', label: 'Questionnaires', icon: ClipboardList },
  { to: '/risk', label: 'Risk Register', icon: Shield },
  { to: '/report', label: 'Report', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Layout() {
  const { user, organization, logout } = useAuthStore();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setUserMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-surface-950 text-slate-200">
      {/* Global header */}
      <header className="sticky top-0 z-50 border-b border-slate-700/50 bg-surface-900/95 backdrop-blur">
        <div className="mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 font-semibold text-white">
              <Shield className="h-6 w-6 text-accent" />
              oditit
            </Link>
            <span className="text-slate-500">»</span>
            <nav className="hidden items-center gap-1 sm:flex">
              {navTabs.slice(0, 3).map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `rounded px-2 py-1 text-sm ${isActive ? 'bg-accent/20 text-accent' : 'text-slate-400 hover:text-white'}`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <a href="#" className="hidden rounded px-2 py-1 text-sm text-slate-400 hover:text-white sm:block">
              Docs
            </a>
            <a href="#" className="hidden rounded px-2 py-1 text-sm text-slate-400 hover:text-white sm:block">
              About
            </a>
            <a href="#" className="hidden rounded px-2 py-1 text-sm text-slate-400 hover:text-white sm:block">
              Contact
            </a>
            <div className="relative">
              <button
                onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                className="rounded px-2 py-1 text-sm text-slate-400 hover:text-white"
              >
                Theme
              </button>
              {themeMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-32 rounded border border-slate-600 bg-surface-800 py-1">
                  <button className="w-full px-3 py-1 text-left text-sm hover:bg-slate-700">Dark</button>
                  <button className="w-full px-3 py-1 text-left text-sm hover:bg-slate-700">Light</button>
                </div>
              )}
            </div>
            <div className="relative ml-2 border-l border-slate-600 pl-2">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-slate-800"
              >
                <User className="h-4 w-4" />
                {user?.firstName ?? 'User'}
                <ChevronDown className="h-4 w-4" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded border border-slate-600 bg-surface-800 py-1 shadow-lg">
                  <div className="border-b border-slate-600 px-3 py-2 text-xs text-slate-400">
                    {user?.email}
                    {organization && (
                      <div className="mt-1 font-medium text-slate-300">{organization.name}</div>
                    )}
                  </div>
                  <Link
                    to="/settings"
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-slate-700"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4" /> Profile / Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-slate-700"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Context bar tabs */}
        <div className="flex gap-1 border-t border-slate-700/50 px-4 py-1">
          {navTabs.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 rounded px-3 py-2 text-sm ${isActive ? 'bg-accent text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <ChooseFrameworkBanner />
        <Outlet />
      </main>
    </div>
  );
}
