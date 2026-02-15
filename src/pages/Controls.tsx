import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Filter,
  Plus,
  Upload,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Paperclip,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { controlsApi } from '../api/controls';
import { EvidenceForSubcontrolModal } from '../components/EvidenceForSubcontrolModal';
import { frameworksApi } from '../api/frameworks';
import {
  Card,
  CardContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmptyState,
  Button,
  Input,
  Select,
  Modal,
  Textarea,
  StatusBadge,
  Badge,
  Progress,
  Alert,
} from '../components/ui';
import type {
  OrganizationControlInstance,
  OrganizationSubcontrolInstance,
  ControlInstanceStatus,
} from '../types/api';
import { useAuthStore } from '../store/authStore';
import { canChangeApplicability, canRunAIAssessment } from '../lib/rbac';
import type { UserRole } from '../types/api';

export function Controls() {
  const organization = useAuthStore((s) => s.organization);
  const roles = useAuthStore((s) => s.roles) as string[];
  const primaryRole = (roles?.[0] ?? undefined) as UserRole | undefined;
  const userCanChangeApplicability = canChangeApplicability(primaryRole);
  const userCanRunAIAssessment = canRunAIAssessment(primaryRole);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ControlInstanceStatus | ''>('');
  const [applicabilityFilter, setApplicabilityFilter] = useState<boolean | ''>('');
  const [page, setPage] = useState(1);
  const [expandedControlId, setExpandedControlId] = useState<number | null>(null);
  const [selectedControl, setSelectedControl] = useState<OrganizationControlInstance | null>(null);
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
  const [organizationFrameworkId, setOrganizationFrameworkId] = useState<number | ''>('');
  const [evidenceModalSubcontrol, setEvidenceModalSubcontrol] = useState<{
    id: number;
    label: string;
  } | null>(null);

  const queryClient = useQueryClient();

  const { data: activatedFrameworks } = useQuery({
    queryKey: ['frameworks-activated'],
    queryFn: frameworksApi.activated,
    enabled: !!organization,
  });

  const effectiveOrgFrameworkId =
    organizationFrameworkId ||
    (activatedFrameworks && activatedFrameworks.length > 0 ? activatedFrameworks[0].id : null);

  const { data: controlsResponse, isLoading } = useQuery({
    queryKey: [
      'controls',
      organization?.id,
      effectiveOrgFrameworkId,
      searchTerm,
      statusFilter,
      applicabilityFilter,
      page,
    ],
    queryFn: () =>
      controlsApi.list({
        organizationFrameworkId: effectiveOrgFrameworkId as number,
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        isApplicable: applicabilityFilter === '' ? undefined : applicabilityFilter,
        page,
        limit: 20,
      }),
    enabled: !!organization && !!effectiveOrgFrameworkId,
  });

  const { data: controlStats } = useQuery({
    queryKey: ['control-stats', organization?.id, effectiveOrgFrameworkId],
    queryFn: () =>
      controlsApi.stats(
        effectiveOrgFrameworkId ? { organizationFrameworkId: effectiveOrgFrameworkId } : undefined
      ),
    enabled: !!organization && !!effectiveOrgFrameworkId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (payload: {
      id: number;
      status: ControlInstanceStatus;
      implementedPct?: number;
      context?: string;
    }) => controlsApi.updateStatus(String(payload.id), { status: payload.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['controls'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['control-stats'] });
      setIsUpdateStatusModalOpen(false);
    },
  });

  const updateControlApplicabilityMutation = useMutation({
    mutationFn: ({ id, isApplicable }: { id: number; isApplicable: boolean }) =>
      controlsApi.updateControl(String(id), { isApplicable }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['controls'] });
      queryClient.invalidateQueries({ queryKey: ['control'] });
      queryClient.invalidateQueries({ queryKey: ['control-stats'] });
    },
  });

  const updateSubcontrolApplicabilityMutation = useMutation({
    mutationFn: ({ id, isApplicable }: { id: number; isApplicable: boolean }) =>
      controlsApi.updateSubcontrol(String(id), { isApplicable }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['controls'] });
      queryClient.invalidateQueries({ queryKey: ['control'] });
      queryClient.invalidateQueries({ queryKey: ['control-stats'] });
    },
  });

  const aiAssessControlMutation = useMutation({
    mutationFn: (controlId: number) => controlsApi.aiAssessControl(String(controlId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['controls'] });
      queryClient.invalidateQueries({ queryKey: ['control'] });
    },
  });

  const aiAssessFrameworkMutation = useMutation({
    mutationFn: () =>
      controlsApi.aiAssessFramework(effectiveOrgFrameworkId as number),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['controls'] });
      queryClient.invalidateQueries({ queryKey: ['control'] });
    },
  });

  const controls = controlsResponse?.data ?? [];
  const meta = controlsResponse?.meta;

  const handleRowClick = (control: OrganizationControlInstance) => {
    setExpandedControlId((prev) => (prev === control.id ? null : control.id));
  };

  const handleUpdateStatus = (e: React.MouseEvent, control: OrganizationControlInstance) => {
    e.stopPropagation();
    setSelectedControl(control);
    setIsUpdateStatusModalOpen(true);
  };

  if (!organization) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Controls</h1>
        <p className="text-slate-400">Select or create an organisation to manage controls.</p>
      </div>
    );
  }

  const frameworkOptions =
    activatedFrameworks?.map((af) => ({
      value: String(af.id),
      label: af.framework?.name ?? af.framework?.code ?? `Framework ${af.id}`,
    })) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Controls</h1>
          <p className="mt-1 text-slate-400">Manage and track your compliance controls</p>
        </div>
        <div className="flex gap-3">
          {userCanRunAIAssessment && effectiveOrgFrameworkId && (
            <Button
              variant="outline"
              icon={<Sparkles className="h-4 w-4" />}
              onClick={() => aiAssessFrameworkMutation.mutate()}
              disabled={aiAssessFrameworkMutation.isPending}
              loading={aiAssessFrameworkMutation.isPending}
            >
              {aiAssessFrameworkMutation.isPending
                ? 'Assessing framework…'
                : 'Run AI assessment (framework)'}
            </Button>
          )}
          <Button variant="outline" icon={<Upload className="h-4 w-4" />}>
            Import Controls
          </Button>
          <Button variant="primary" icon={<Plus className="h-4 w-4" />}>
            Add Control
          </Button>
        </div>
      </div>

      {effectiveOrgFrameworkId && controlStats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-slate-500">Total controls</p>
              <p className="text-2xl font-bold text-white">{controlStats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-slate-500">Applicable</p>
              <p className="text-2xl font-bold text-emerald-400">
                {controlStats.applicable ?? controlStats.total}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-slate-500">Not applicable</p>
              <p className="text-2xl font-bold text-amber-400">
                {controlStats.notApplicable ?? 0}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {activatedFrameworks && activatedFrameworks.length > 0 && (
              <Select
                label="Framework"
                value={String(organizationFrameworkId || (activatedFrameworks?.[0]?.id ?? ''))}
                onChange={(e) => setOrganizationFrameworkId(e.target.value ? Number(e.target.value) : '')}
                options={[
                  { value: '', label: 'Select framework' },
                  ...frameworkOptions,
                ]}
              />
            )}
            <Input
              placeholder="Search controls..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ControlInstanceStatus | '')}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'DRAFT', label: 'Draft' },
                { value: 'UPLOADED', label: 'Uploaded' },
                { value: 'SUBMITTED', label: 'Submitted' },
                { value: 'REVIEWED', label: 'Reviewed' },
                { value: 'APPROVED', label: 'Approved' },
              ]}
            />
            <Select
              label="Applicability"
              value={applicabilityFilter === '' ? '' : applicabilityFilter ? 'true' : 'false'}
              onChange={(e) => {
                const v = e.target.value;
                setApplicabilityFilter(v === '' ? '' : v === 'true');
                setPage(1);
              }}
              options={[
                { value: '', label: 'All' },
                { value: 'true', label: 'Applicable only' },
                { value: 'false', label: 'Not applicable only' },
              ]}
            />
            <Button variant="outline" className="w-full" icon={<Filter className="h-4 w-4" />}>
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {!effectiveOrgFrameworkId && activatedFrameworks?.length === 0 && (
        <Alert variant="info">
          No framework activated. <Link to="/frameworks" className="font-semibold text-blue-300 underline">Activate a framework</Link> to see controls.
        </Alert>
      )}

      {effectiveOrgFrameworkId && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>Control ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Framework</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-28">Applicable</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center text-slate-500">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : controls.length === 0 ? (
                  <TableEmptyState
                    message="No controls found. Activate a framework to see controls."
                    icon={<AlertCircle className="h-12 w-12" />}
                  />
                ) : (
                  controls.map((control) => (
                    <ControlRow
                      key={control.id}
                      control={control}
                      isExpanded={expandedControlId === control.id}
                      onToggle={() => handleRowClick(control)}
                      onUpdateStatus={(e) => handleUpdateStatus(e, control)}
                      onUploadEvidence={(sub) =>
                        setEvidenceModalSubcontrol({
                          id: sub.id,
                          label: `${sub.frameworkSubcontrol.refCode ?? ''} ${sub.frameworkSubcontrol.name}`.trim(),
                        })
                      }
                      canChangeApplicability={userCanChangeApplicability}
                      onControlApplicabilityChange={(id, isApplicable) =>
                        updateControlApplicabilityMutation.mutate({ id, isApplicable })
                      }
                      onSubcontrolApplicabilityChange={(id, isApplicable) =>
                        updateSubcontrolApplicabilityMutation.mutate({ id, isApplicable })
                      }
                      canRunAIAssessment={userCanRunAIAssessment}
                      onRunControlAiAssess={(controlId) =>
                        aiAssessControlMutation.mutate(controlId)
                      }
                      isAssessingControlId={
                        aiAssessControlMutation.isPending &&
                        aiAssessControlMutation.variables !== undefined
                          ? aiAssessControlMutation.variables
                          : null
                      }
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Showing {(meta.page - 1) * meta.limit + 1} to{' '}
            {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} controls
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <UpdateStatusModal
        control={selectedControl}
        isOpen={isUpdateStatusModalOpen}
        onClose={() => {
          setIsUpdateStatusModalOpen(false);
          setSelectedControl(null);
        }}
        onSubmit={updateStatusMutation.mutate}
        isLoading={updateStatusMutation.isPending}
      />

      {evidenceModalSubcontrol && (
        <EvidenceForSubcontrolModal
          isOpen={true}
          onClose={() => setEvidenceModalSubcontrol(null)}
          subcontrolId={evidenceModalSubcontrol.id}
          subcontrolLabel={evidenceModalSubcontrol.label}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['control'] })}
        />
      )}
    </div>
  );
}

function ControlRow({
  control,
  isExpanded,
  onToggle,
  onUpdateStatus,
  onUploadEvidence,
  canChangeApplicability,
  onControlApplicabilityChange,
  onSubcontrolApplicabilityChange,
  canRunAIAssessment,
  onRunControlAiAssess,
  isAssessingControlId,
}: {
  control: OrganizationControlInstance;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdateStatus: (e: React.MouseEvent) => void;
  onUploadEvidence: (sub: OrganizationSubcontrolInstance) => void;
  canChangeApplicability: boolean;
  onControlApplicabilityChange: (controlId: number, isApplicable: boolean) => void;
  onSubcontrolApplicabilityChange: (subcontrolId: number, isApplicable: boolean) => void;
  canRunAIAssessment: boolean;
  onRunControlAiAssess: (controlId: number) => void;
  isAssessingControlId: number | null;
}) {
  const { data: controlDetail, isLoading } = useQuery({
    queryKey: ['control', control.id],
    queryFn: () => controlsApi.get(String(control.id)),
    enabled: isExpanded,
  });

  const subcontrols = controlDetail?.subcontrolInstances ?? [];

  const handleApplicabilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    const value = e.target.value === 'true';
    onControlApplicabilityChange(control.id, value);
  };

  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-slate-800/50"
        onClick={onToggle}
      >
        <TableCell className="w-10">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-400" />
          )}
        </TableCell>
        <TableCell className="font-mono text-xs">
          {control.frameworkControl.refCode}
        </TableCell>
        <TableCell>
          <div>
            <p className="font-medium text-white">{control.frameworkControl.name}</p>
            {control.frameworkControl.category && (
              <p className="text-xs text-slate-500">{control.frameworkControl.category}</p>
            )}
          </div>
        </TableCell>
        <TableCell>
          <Badge size="sm">
            {control.organizationFramework?.framework?.code?.toUpperCase() ?? '—'}
          </Badge>
        </TableCell>
        <TableCell>
          <StatusBadge status={control.status} />
        </TableCell>
        <TableCell onClick={(e) => e.stopPropagation()}>
          {canChangeApplicability ? (
            <select
              value={String(control.isApplicable !== false)}
              onChange={handleApplicabilityChange}
              className="rounded border border-slate-600 bg-slate-800 px-2 py-1 text-xs text-white"
            >
              <option value="true">Applicable</option>
              <option value="false">Not applicable</option>
            </select>
          ) : (
            <span className="text-xs text-slate-400">
              {control.isApplicable !== false ? 'Applicable' : 'Not applicable'}
            </span>
          )}
        </TableCell>
        <TableCell>
          <div className="w-28">
            <Progress value={control.implementedPct} size="sm" showLabel={false} />
            <p className="mt-1 text-xs text-slate-500">{control.implementedPct}%</p>
          </div>
        </TableCell>
        <TableCell>
          <span className="text-sm">
            {control.owner?.name || control.owner?.email || 'Unassigned'}
          </span>
        </TableCell>
        <TableCell onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="ghost" onClick={onUpdateStatus}>
            Update
          </Button>
        </TableCell>
      </TableRow>

      {isExpanded && (
        <TableRow className="bg-slate-800/30 hover:bg-slate-800/30">
          <TableCell colSpan={9} className="p-0">
            <div className="border-t border-slate-700 bg-slate-900/50 px-6 py-4">
              {isLoading ? (
                <div className="py-6 text-center text-slate-500">Loading control details...</div>
              ) : (
                <ExpandedControlContent
                  control={controlDetail ?? control}
                  subcontrols={subcontrols}
                  onUploadEvidence={onUploadEvidence}
                  canChangeApplicability={canChangeApplicability}
                  onSubcontrolApplicabilityChange={onSubcontrolApplicabilityChange}
                  canRunAIAssessment={canRunAIAssessment}
                  onRunControlAiAssess={onRunControlAiAssess}
                  isAssessingControlId={isAssessingControlId}
                />
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

function ExpandedControlContent({
  control,
  subcontrols,
  onUploadEvidence,
  canChangeApplicability,
  onSubcontrolApplicabilityChange,
  canRunAIAssessment,
  onRunControlAiAssess,
}: {
  control: OrganizationControlInstance;
  subcontrols: OrganizationSubcontrolInstance[];
  onUploadEvidence: (sub: OrganizationSubcontrolInstance) => void;
  canChangeApplicability: boolean;
  onSubcontrolApplicabilityChange: (subcontrolId: number, isApplicable: boolean) => void;
  canRunAIAssessment: boolean;
  onRunControlAiAssess: (controlId: number) => void;
  isAssessingControlId: number | null;
}) {
  const fc = control.frameworkControl;
  const isAssessingThisControl = isAssessingControlId === control.id;

  return (
    <div className="space-y-6">
      {/* Control summary */}
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
        <h4 className="mb-3 text-sm font-semibold text-white">Control summary</h4>
        <div className="grid gap-3 text-sm md:grid-cols-2">
          <div>
            <span className="text-slate-500">Status</span>
            <div className="mt-0.5">
              <StatusBadge status={control.status} />
            </div>
          </div>
          <div>
            <span className="text-slate-500">Implementation</span>
            <div className="mt-0.5">
              <Progress value={control.implementedPct} size="sm" />
            </div>
          </div>
          <div>
            <span className="text-slate-500">Applicable</span>
            <div className="mt-0.5">
              <span className="text-slate-300">
                {control.isApplicable !== false ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
          {(control.aiAssessed || canRunAIAssessment) && (
            <div>
              <span className="text-slate-500">AI assessment</span>
              <div className="mt-0.5 flex flex-wrap items-center gap-2">
                {control.aiAssessed && (
                  <Badge
                    variant={
                      control.aiAssessmentResult === 'PASS'
                        ? 'success'
                        : control.aiAssessmentResult === 'FAIL'
                          ? 'danger'
                          : 'warning'
                    }
                  >
                    {control.aiAssessmentResult}
                  </Badge>
                )}
                {canRunAIAssessment && (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Sparkles className="h-3.5 w-3.5" />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRunControlAiAssess(control.id);
                    }}
                    disabled={isAssessingThisControl}
                    loading={isAssessingThisControl}
                  >
                    {isAssessingThisControl ? 'Assessing…' : 'Run AI assessment (control)'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
        {fc.description && (
          <p className="mt-3 text-slate-400">{fc.description}</p>
        )}
        {fc.guidance && (
          <p className="mt-2 text-slate-500 text-xs">{fc.guidance}</p>
        )}
        {control.reviewNotes && (
          <p className="mt-2 text-slate-400 text-xs">
            <span className="text-slate-500">Review notes:</span> {control.reviewNotes}
          </p>
        )}
      </div>

      {/* Subcontrols */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-white">
          Subcontrols ({subcontrols.length})
        </h4>
        {subcontrols.length === 0 ? (
          <p className="rounded-lg border border-slate-700 bg-slate-800/30 px-4 py-3 text-sm text-slate-500">
            No subcontrols defined for this control.
          </p>
        ) : (
          <div className="space-y-2">
            {subcontrols.map((sub) => (
              <SubcontrolRow
                key={sub.id}
                subcontrol={sub}
                onUploadEvidence={onUploadEvidence}
                canChangeApplicability={canChangeApplicability}
                onApplicabilityChange={(isApplicable) =>
                  onSubcontrolApplicabilityChange(sub.id, isApplicable)
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SubcontrolRow({
  subcontrol,
  onUploadEvidence,
  canChangeApplicability,
  onApplicabilityChange,
}: {
  subcontrol: OrganizationSubcontrolInstance;
  onUploadEvidence: (sub: OrganizationSubcontrolInstance) => void;
  canChangeApplicability: boolean;
  onApplicabilityChange: (isApplicable: boolean) => void;
}) {
  const fs = subcontrol.frameworkSubcontrol;
  const evidenceCount = subcontrol.evidenceLinks?.length ?? 0;
  const isApplicable = subcontrol.isApplicable !== false;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-700 bg-slate-800/30 p-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-slate-400">{fs.refCode ?? '—'}</span>
          <span className="font-medium text-white">{fs.name}</span>
          {!isApplicable && (
            <Badge size="sm" variant="warning">
              Not applicable
            </Badge>
          )}
        </div>
        {fs.description && (
          <p className="mt-1 line-clamp-2 text-xs text-slate-500">{fs.description}</p>
        )}
        {subcontrol.reviewNotes && (
          <p className="mt-1 text-xs text-slate-400">
            <span className="text-slate-500">Review:</span> {subcontrol.reviewNotes}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {canChangeApplicability ? (
          <select
            value={String(isApplicable)}
            onChange={(e) => onApplicabilityChange(e.target.value === 'true')}
            className="rounded border border-slate-600 bg-slate-800 px-2 py-1 text-xs text-white"
          >
            <option value="true">Applicable</option>
            <option value="false">Not applicable</option>
          </select>
        ) : (
          <span className="text-xs text-slate-400">
            {isApplicable ? 'Applicable' : 'Not applicable'}
          </span>
        )}
        <StatusBadge status={subcontrol.status} />
        <div className="w-24">
          <Progress value={subcontrol.implementedPct} size="sm" showLabel={false} />
          <p className="text-center text-xs text-slate-500">{subcontrol.implementedPct}%</p>
        </div>
        <Badge size="sm" variant="info">
          {evidenceCount} evidence
        </Badge>
        <Link
          to={`/controls/subcontrol/${subcontrol.id}`}
          className="inline-flex items-center gap-1 rounded px-2 py-1 text-sm text-accent hover:bg-accent/10"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View details
        </Link>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="inline-flex items-center gap-1 text-slate-400 hover:text-white"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onUploadEvidence(subcontrol);
          }}
        >
          <Paperclip className="h-3.5 w-3.5" />
          Upload evidence
        </Button>
      </div>
    </div>
  );
}

function UpdateStatusModal({
  control,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: {
  control: OrganizationControlInstance | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    id: number;
    status: ControlInstanceStatus;
    implementedPct?: number;
    context?: string;
  }) => void;
  isLoading: boolean;
}) {
  const [status, setStatus] = useState<ControlInstanceStatus>('DRAFT');
  const [implementedPct, setImplementedPct] = useState(0);
  const [context, setContext] = useState('');

  if (!control) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Control Status"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={isLoading}
            onClick={() => {
              onSubmit({
                id: control.id,
                status,
                implementedPct,
                context,
              });
            }}
          >
            Update Status
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">Control</label>
          <p className="text-slate-400">{control.frameworkControl.name}</p>
        </div>

        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as ControlInstanceStatus)}
          options={[
            { value: 'DRAFT', label: 'Draft' },
            { value: 'UPLOADED', label: 'Uploaded' },
            { value: 'SUBMITTED', label: 'Submitted' },
            { value: 'REVIEWED', label: 'Reviewed' },
            { value: 'APPROVED', label: 'Approved' },
          ]}
          required
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Implementation Progress ({implementedPct}%)
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={implementedPct}
            onChange={(e) => setImplementedPct(parseInt(e.target.value, 10))}
            className="w-full"
          />
          <Progress value={implementedPct} className="mt-2" />
        </div>

        <Textarea
          label="Implementation Context"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          rows={4}
          placeholder="Describe how this control is implemented in your organization..."
        />
      </div>
    </Modal>
  );
}
