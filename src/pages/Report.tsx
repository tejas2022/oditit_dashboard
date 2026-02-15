import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard';
import { useAuthStore } from '../store/authStore';

export function Report() {
  const organization = useAuthStore((s) => s.organization);
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'compliance-checker', organization?.id],
    queryFn: dashboardApi.complianceChecker,
    enabled: !!organization,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  const gap = data as { total?: number; compliant?: number; nonCompliant?: number; gaps?: { controlName?: string; controlCode?: string; status: string; missingEvidence?: boolean }[] } | undefined;

  if (!organization) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Report / Compliance</h1>
        <p className="text-slate-400">Select or create an organisation to view compliance reports.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Report / Compliance</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-700 bg-surface-900 p-6">
          <p className="text-sm text-slate-400">Total controls</p>
          <p className="text-2xl font-bold text-white">{gap?.total ?? 0}</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-surface-900 p-6">
          <p className="text-sm text-slate-400">Compliant</p>
          <p className="text-2xl font-bold text-green-500">{gap?.compliant ?? 0}</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-surface-900 p-6">
          <p className="text-sm text-slate-400">Non-compliant</p>
          <p className="text-2xl font-bold text-red-500">{gap?.nonCompliant ?? 0}</p>
        </div>
      </div>
      {gap?.gaps && gap.gaps.length > 0 && (
        <div className="rounded-xl border border-slate-700 bg-surface-900 overflow-hidden">
          <div className="border-b border-slate-700 px-6 py-4">
            <h2 className="font-semibold text-white">Gaps</h2>
          </div>
          <div className="divide-y divide-slate-700">
            {gap.gaps.map((g, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-3">
                <p className="font-medium text-white">{g.controlName ?? g.controlCode ?? 'Control'}</p>
                <span className="text-sm text-slate-400">{g.status}</span>
                {g.missingEvidence && (
                  <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs text-red-400">Missing evidence</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
