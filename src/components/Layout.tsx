import { useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import type { AuthProfile } from '../types/api';
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
  Building2,
  ClipboardCheck,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth';
import { auditorApi, type MyAssignmentsResult } from '../api/auditor';
import { ChooseFrameworkBanner } from './ChooseFrameworkBanner';
import { CreateOrganizationModal } from './CreateOrganizationModal';
import { useState } from 'react';

const orgNavTabs = [
  { to: '/', label: 'Home', icon: FolderOpen },
  { to: '/frameworks', label: 'Frameworks', icon: FolderOpen },
  { to: '/controls', label: 'Controls', icon: Shield },
  { to: '/summary', label: 'Summary', icon: LayoutDashboard },
  { to: '/policies', label: 'Policies', icon: FileText },
  { to: '/vendors', label: 'Vendors', icon: ClipboardList },
  { to: '/users', label: 'Users', icon: User },
  { to: '/risk', label: 'Risk', icon: Shield },
  { to: '/report', label: 'Report', icon: FileText },
  { to: '/evidence', label: 'Evidence', icon: FileText },
  { to: '/ai-assessment', label: 'AI Assessment', icon: Shield },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const auditorNavTabs = [
  { to: '/auditor', label: 'My assignments', icon: ClipboardCheck },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Layout() {
  const { user, organization, organizations, logout, setProfile } = useAuthStore();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [orgSwitcherOpen, setOrgSwitcherOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    enabled: !!localStorage.getItem('accessToken') && (organizations.length === 0 || !organization),
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!profile) return;
    const p = profile as AuthProfile;
    setProfile({
      organizations: p.organizations ?? [],
      roles: p.roles ?? [],
      tprmAssignments: p.tprmAssignments ?? { asRespondent: [], asAssessor: [] },
      organization: p.organization ?? null,
    });
  }, [profile, setProfile]);

  const { data: auditorData } = useQuery({
    queryKey: ['auditor', 'my-assignments'],
    queryFn: auditorApi.myAssignments,
    enabled: !!localStorage.getItem('accessToken'),
  });

  const assignments = (auditorData as MyAssignmentsResult | undefined)?.assignments ?? [];
  const isAuditor = assignments.length > 0;
  const navTabs = isAuditor ? auditorNavTabs : orgNavTabs;

  const handleLogout = () => {
    logout();
    navigate('/login');
    setUserMenuOpen(false);
  };

  const handleSwitchOrg = async (orgId: number) => {
    try {
      const tokens = await authApi.switchOrganization(orgId);
      const org = organizations.find((o) => o.id === orgId);
      if (org && tokens.organization) {
        useAuthStore.getState().switchOrganization(
          { id: tokens.organization.id, name: tokens.organization.name, dateAdded: '', dateUpdated: '' },
          tokens.accessToken,
          tokens.refreshToken
        );
      }
      setOrgSwitcherOpen(false);
      window.location.reload();
    } catch {
      setOrgSwitcherOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 text-slate-200">
      <CreateOrganizationModal />
      <header className="sticky top-0 z-50 border-b border-slate-700/50 bg-surface-900/95 backdrop-blur">
        <div className="mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link to={isAuditor ? '/auditor' : '/'} className="flex items-center gap-2 font-semibold text-white">
              <Shield className="h-6 w-6 text-accent" />
              oditit
            </Link>
            <span className="text-slate-500">»</span>
            <nav className="hidden items-center gap-1 sm:flex">
              {navTabs.slice(0, 4).map(({ to, label }) => (
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
            {organizations.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => setOrgSwitcherOpen(!orgSwitcherOpen)}
                  className="flex items-center gap-1.5 rounded px-2 py-1 text-sm text-slate-300 hover:bg-slate-800"
                >
                  <Building2 className="h-4 w-4" />
                  {organization?.name ?? 'Select org'}
                  <ChevronDown className="h-4 w-4" />
                </button>
                {orgSwitcherOpen && (
                  <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded border border-slate-600 bg-surface-800 py-1 shadow-lg">
                    {organizations.map((org) => (
                      <button
                        key={org.id}
                        onClick={() => handleSwitchOrg(org.id)}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-700 ${
                          organization?.id === org.id ? 'bg-accent/20 text-accent' : 'text-slate-300'
                        }`}
                      >
                        {org.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="relative ml-2 border-l border-slate-600 pl-2">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-slate-800"
              >
                <User className="h-4 w-4" />
                {user?.name ?? user?.email ?? 'User'}
                <ChevronDown className="h-4 w-4" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded border border-slate-600 bg-surface-800 py-1 shadow-lg">
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
        {!isAuditor && <ChooseFrameworkBanner />}
        <Outlet />
      </main>
    </div>
  );
}
