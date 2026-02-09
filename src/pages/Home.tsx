import { Link } from 'react-router-dom';
import {
  FolderOpen,
  Shield,
  Users,
  ClipboardList,
  Settings,
} from 'lucide-react';

const quickAccess = [
  { to: '/users', label: 'Users', icon: Users },
  { to: '/frameworks', label: 'Projects', icon: FolderOpen },
  { to: '/controls', label: 'Controls', icon: Shield },
  { to: '/vendors', label: 'Questionnaires', icon: ClipboardList },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Home() {
  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-slate-700 bg-surface-900 p-6">
        <h1 className="mb-2 text-2xl font-bold text-white">Welcome</h1>
        <p className="mb-6 text-slate-300">
          oditit is a governance, risk and compliance platform. Manage controls, evidence, policies,
          and audits in one place.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/register"
            className="rounded-lg border border-accent bg-accent/10 px-4 py-2 font-medium text-accent hover:bg-accent/20"
          >
            Register
          </Link>
          <Link
            to="/frameworks"
            className="rounded-lg border border-slate-600 bg-surface-800 px-4 py-2 font-medium text-white hover:bg-slate-700"
          >
            View Projects
          </Link>
          <Link
            to="/controls"
            className="rounded-lg border border-slate-600 bg-surface-800 px-4 py-2 font-medium text-white hover:bg-slate-700"
          >
            View Controls
          </Link>
          <Link
            to="/policies"
            className="rounded-lg border border-slate-600 bg-surface-800 px-4 py-2 font-medium text-white hover:bg-slate-700"
          >
            View Policies
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Quick Access</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {quickAccess.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-3 rounded-xl border border-slate-700 bg-surface-900 p-6 transition hover:border-accent/50 hover:bg-surface-800"
            >
              <div className="rounded-full bg-accent/20 p-4">
                <Icon className="h-8 w-8 text-accent" />
              </div>
              <span className="text-center font-medium text-slate-200">{label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
