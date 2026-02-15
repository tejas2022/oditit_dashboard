import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ClipboardCheck, Building2, FolderOpen } from 'lucide-react';
import { auditorApi, type MyAssignmentsResult } from '../api/auditor';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui';

export function AuditorHome() {
  const { data, isLoading } = useQuery({
    queryKey: ['auditor', 'my-assignments'],
    queryFn: auditorApi.myAssignments,
  });

  const result = data as MyAssignmentsResult | undefined;
  const assignments = result?.assignments ?? [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">My assignments</h1>
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">My assignments</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardCheck className="mx-auto mb-4 h-12 w-12 text-slate-500" />
            <p className="text-slate-400">You have no auditor assignments.</p>
            <p className="mt-2 text-sm text-slate-500">
              An organisation admin must invite you to audit specific frameworks.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">My assignments</h1>
      <p className="text-slate-400">Organisations and frameworks you can audit. Select one to view controls and submit reviews.</p>
      <div className="space-y-6">
        {assignments.map((org: any) => (
          <Card key={org.organizationId}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {org.organization?.name ?? `Organisation ${org.organizationId}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {(org.frameworks ?? []).map((fw: any) => (
                  <Link
                    key={fw.organizationFrameworkId}
                    to={`/auditor/assignments/${fw.organizationFrameworkId}`}
                    className="flex items-center gap-2 rounded-lg border border-slate-700 bg-surface-800 px-4 py-3 transition-colors hover:border-accent/50 hover:bg-slate-800"
                  >
                    <FolderOpen className="h-4 w-4 text-accent" />
                    <span className="font-medium text-white">
                      {fw.framework?.name ?? fw.frameworkName ?? `Framework ${fw.organizationFrameworkId}`}
                    </span>
                    {fw.fromDate && (
                      <span className="text-xs text-slate-500">
                        {new Date(fw.fromDate).toLocaleDateString()} – {fw.toDate ? new Date(fw.toDate).toLocaleDateString() : '—'}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
