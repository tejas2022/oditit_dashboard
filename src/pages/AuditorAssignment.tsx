import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Shield, ChevronDown, ChevronRight } from 'lucide-react';
import { auditorApi } from '../api/auditor';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '../components/ui';
import type { OrganizationControlInstance, OrganizationSubcontrolInstance } from '../types/api';

export function AuditorAssignment() {
  const { organizationFrameworkId } = useParams<{ organizationFrameworkId: string }>();
  const ofId = organizationFrameworkId ? parseInt(organizationFrameworkId, 10) : 0;
  const [page, setPage] = useState(1);
  const [expandedControlId, setExpandedControlId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['auditor', 'assignment', ofId],
    queryFn: () => auditorApi.getAssignmentDetail(ofId),
    enabled: ofId > 0,
  });

  const { data: controlsData, isLoading: controlsLoading } = useQuery({
    queryKey: ['auditor', 'assignment', ofId, 'controls', page],
    queryFn: () => auditorApi.getControlsForAssignment(ofId, { page, limit: 20 }),
    enabled: ofId > 0,
  });

  const controls = (controlsData as any)?.data ?? (Array.isArray(controlsData) ? controlsData : []);
  const pagination = (controlsData as any)?.pagination;

  if (ofId <= 0) {
    return (
      <div>
        <Link to="/auditor" className="text-accent hover:underline">← Back to assignments</Link>
        <p className="mt-4 text-slate-400">Invalid assignment.</p>
      </div>
    );
  }

  if (detailLoading || !detail) {
    return (
      <div>
        <Link to="/auditor" className="text-accent hover:underline">← Back to assignments</Link>
        <p className="mt-4 text-slate-400">Loading assignment...</p>
      </div>
    );
  }

  const assignment = detail as any;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/auditor"
          className="flex items-center gap-1 text-slate-400 hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" /> Back to assignments
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-white">
          {assignment.organization?.name ?? 'Organisation'} – {assignment.framework?.name ?? 'Framework'}
        </h1>
        <p className="text-slate-400">
          Access: {assignment.grantFromDate ? new Date(assignment.grantFromDate).toLocaleDateString() : '—'} to{' '}
          {assignment.grantToDate ? new Date(assignment.grantToDate).toLocaleDateString() : '—'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Controls</CardTitle>
        </CardHeader>
        <CardContent>
          {controlsLoading ? (
            <p className="text-slate-400">Loading controls...</p>
          ) : controls.length === 0 ? (
            <p className="text-slate-400">No controls in this assignment.</p>
          ) : (
            <div className="space-y-2">
              {controls.map((control: OrganizationControlInstance) => (
                <ControlRow
                  key={control.id}
                  control={control}
                  expanded={expandedControlId === control.id}
                  onToggle={() =>
                    setExpandedControlId((id) => (id === control.id ? null : control.id))
                  }
                  onReviewSaved={() => {
                    queryClient.invalidateQueries({ queryKey: ['auditor', 'assignment', ofId, 'controls'] });
                  }}
                />
              ))}
            </div>
          )}
          {pagination && pagination.total > 20 && (
            <div className="mt-4 flex justify-between text-sm text-slate-400">
              <span>
                Page {pagination.page} of {Math.ceil(pagination.total / 20)}
              </span>
              <div className="gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={pagination.page >= Math.ceil(pagination.total / 20)}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ControlRow({
  control,
  expanded,
  onToggle,
  onReviewSaved,
}: {
  control: OrganizationControlInstance;
  expanded: boolean;
  onToggle: () => void;
  onReviewSaved: () => void;
}) {
  const subcontrols = control.subcontrolInstances ?? [];
  return (
    <div className="rounded-lg border border-slate-700 bg-surface-800/50">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-slate-800/50"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-slate-400" />
        )}
        <Shield className="h-4 w-4 text-accent" />
        <span className="font-medium text-white">
          {control.frameworkControl?.refCode ?? ''} {control.frameworkControl?.name ?? control.id}
        </span>
        {subcontrols.length > 0 && (
          <span className="text-xs text-slate-500">({subcontrols.length} subcontrols)</span>
        )}
      </button>
      {expanded && subcontrols.length > 0 && (
        <div className="border-t border-slate-700 px-4 py-3">
          {subcontrols.map((sub: OrganizationSubcontrolInstance) => (
            <SubcontrolReview key={sub.id} subcontrol={sub} onSaved={onReviewSaved} />
          ))}
        </div>
      )}
    </div>
  );
}

function SubcontrolReview({
  subcontrol,
  onSaved,
}: {
  subcontrol: OrganizationSubcontrolInstance;
  onSaved: () => void;
}) {
  const [status, setStatus] = useState<'INCOMPLETE' | 'DONE'>('INCOMPLETE');
  const [notes, setNotes] = useState('');
  const submitMutation = useMutation({
    mutationFn: () =>
      auditorApi.submitSubcontrolReview(subcontrol.id, { status, notes }),
    onSuccess: () => onSaved(),
  });

  const name =
    subcontrol.frameworkSubcontrol?.name ?? subcontrol.frameworkSubcontrol?.refCode ?? `Subcontrol ${subcontrol.id}`;
  const isApplicable = subcontrol.isApplicable !== false;

  return (
    <div className="mb-4 rounded border border-slate-700 bg-surface-900 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-medium text-slate-200">{name}</p>
        {!isApplicable && (
          <Badge size="sm" variant="warning">
            Not applicable
          </Badge>
        )}
      </div>
      {!isApplicable && (
        <p className="mt-1 text-xs text-amber-400/90">
          You can still submit a review and add notes (e.g. to suggest re-evaluating applicability).
        </p>
      )}
      {subcontrol.frameworkSubcontrol?.description && (
        <p className="mt-1 text-sm text-slate-500">{subcontrol.frameworkSubcontrol.description}</p>
      )}
      {subcontrol.reviewNotes && (
        <p className="mt-1 text-sm text-slate-400">
          <span className="text-slate-500">Existing review notes:</span> {subcontrol.reviewNotes}
        </p>
      )}
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as 'INCOMPLETE' | 'DONE')}
          className="rounded border border-slate-600 bg-surface-800 px-3 py-2 text-sm text-white"
        >
          <option value="INCOMPLETE">Incomplete</option>
          <option value="DONE">Done</option>
        </select>
        <input
          type="text"
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-w-[200px] rounded border border-slate-600 bg-surface-800 px-3 py-2 text-sm text-white placeholder-slate-500"
        />
        <Button
          size="sm"
          onClick={() => submitMutation.mutate()}
          disabled={submitMutation.isPending}
        >
          {submitMutation.isPending ? 'Saving...' : 'Save review'}
        </Button>
      </div>
    </div>
  );
}
