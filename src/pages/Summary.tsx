import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users, FileText, Shield, ClipboardCheck, AlertTriangle, Database } from 'lucide-react';
import { dashboardApi } from '../api/dashboard';
import { useAuthStore } from '../store/authStore';

const journeySteps = [
  { title: 'Add Members', desc: 'Invite users to your organisation', to: '/users', icon: Users },
  { title: 'Add Policies', desc: 'Create and manage policies', to: '/policies', icon: FileText },
  { title: 'Policy Review', desc: 'Review and approve policies', to: '/policies', icon: FileText },
  { title: 'Add Auditor', desc: 'Assign auditor role', to: '/users', icon: Users },
  { title: 'Risk Register', desc: 'Track risks', to: '/risk', icon: AlertTriangle },
  { title: 'Implement Controls', desc: 'Assign and complete controls', to: '/controls', icon: Shield },
  { title: 'Evidence Collection', desc: 'Upload and review evidence', to: '/controls', icon: Database },
];

export function Summary() {
  const organization = useAuthStore((s) => s.organization);
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'summary', organization?.id],
    queryFn: dashboardApi.summary,
    enabled: !!organization,
  });

  if (!organization) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Summary / Overview</h1>
        <p className="text-slate-400">Select or create an organisation to see the compliance summary.</p>
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400">
        Failed to load dashboard summary.
      </div>
    );
  }

  const { overview } = data;
  const evidenceStats = (data as any).evidence ?? (data as any).evidenceStats;
  const completion = overview.complianceScore ?? 0;
  const implementation = overview.totalControls
    ? Math.round((overview.completedControls / overview.totalControls) * 100)
    : 0;
  const evidenceScore = overview.totalControls && evidenceStats
    ? Math.round((evidenceStats.approved / Math.max(overview.totalControls, 1)) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Summary / Overview</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-700 bg-surface-900 p-6">
          <div className="mb-2 flex items-center gap-2 text-slate-400">
            <ClipboardCheck className="h-5 w-5" />
            <span>Completion</span>
          </div>
          <p className="text-3xl font-bold text-white">{completion}/100</p>
          <p className="mt-1 text-sm text-slate-400">
            {overview.completedControls} of {overview.totalControls} controls completed
          </p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-surface-900 p-6">
          <div className="mb-2 flex items-center gap-2 text-slate-400">
            <Shield className="h-5 w-5" />
            <span>Implementation</span>
          </div>
          <p className="text-3xl font-bold text-white">{implementation}/100</p>
          <p className="mt-1 text-sm text-slate-400">
            In progress: {overview.inProgressControls}
          </p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-surface-900 p-6">
          <div className="mb-2 flex items-center gap-2 text-slate-400">
            <Database className="h-5 w-5" />
            <span>Evidence</span>
          </div>
          <p className="text-3xl font-bold text-white">{evidenceScore}/100</p>
          <p className="mt-1 text-sm text-slate-400">
            {evidenceStats?.approved ?? 0} approved, {evidenceStats?.pending ?? 0} pending
          </p>
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Project Journey</h2>
        <div className="rounded-xl border border-slate-700 bg-surface-900 divide-y divide-slate-700">
          {journeySteps.map((step) => (
            <Link
              key={step.title}
              to={step.to}
              className="flex items-center gap-4 px-6 py-4 transition hover:bg-slate-800/50"
            >
              <div className="rounded-lg bg-accent/20 p-2">
                <step.icon className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">{step.title}</p>
                <p className="text-sm text-slate-400">{step.desc}</p>
              </div>
              <span className="text-accent">→</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
