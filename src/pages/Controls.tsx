import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, ChevronRight } from 'lucide-react';
import { controlsApi } from '../api/controls';
import { evidenceApi } from '../api/evidence';
import type { OrganizationControl } from '../types/api';

function ControlRow({
  control,
  selected,
  onSelect,
}: {
  control: OrganizationControl & { control?: { code: string; name: string; framework?: { name: string } } };
  selected: boolean;
  onSelect: () => void;
}) {
  const applicable = control.status !== 'NOT_APPLICABLE';
  const complete = control.status === 'COMPLETED';
  const review = control.status === 'IN_PROGRESS' ? 'In progress' : control.status === 'COMPLETED' ? 'Complete' : control.status;

  return (
    <tr
      onClick={onSelect}
      className={`cursor-pointer border-b border-slate-700/50 transition ${selected ? 'bg-accent/15' : 'hover:bg-slate-800/50'}`}
    >
      <td className="px-4 py-3 font-mono text-sm text-slate-300">
        {control.control?.code ?? control.controlId?.slice(0, 8)}
      </td>
      <td className="px-4 py-3 text-slate-200">
        {control.control?.name ?? 'Control'}
      </td>
      <td className="px-4 py-3">
        {applicable ? (
          <Check className="h-5 w-5 text-green-500" />
        ) : (
          <X className="h-5 w-5 text-slate-500" />
        )}
      </td>
      <td className="px-4 py-3">
        {complete ? (
          <Check className="h-5 w-5 text-green-500" />
        ) : (
          <X className="h-5 w-5 text-amber-500" />
        )}
      </td>
      <td className="px-4 py-3 text-sm text-slate-400">{review}</td>
      <td className="px-4 py-3">
        <ChevronRight className="h-4 w-4 text-slate-500" />
      </td>
    </tr>
  );
}

function ControlDetail({ controlId }: { controlId: string }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'evidence' | 'notes' | 'audits'>('evidence');

  const { data: control, isLoading } = useQuery({
    queryKey: ['controls', controlId],
    queryFn: () => controlsApi.get(controlId),
  });

  const { data: evidenceList } = useQuery({
    queryKey: ['evidence', 'control', controlId],
    queryFn: () => evidenceApi.getByControl(controlId),
    enabled: !!controlId && activeTab === 'evidence',
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => controlsApi.updateStatus(controlId, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['controls'] }),
  });

  if (isLoading || !control) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-slate-700 bg-surface-900">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  const orgControl = control as OrganizationControl & {
    control?: { code: string; name: string; description?: string; framework?: { name: string } };
    evidence?: unknown[];
    assignments?: { user?: { firstName: string; lastName: string } }[];
  };

  return (
    <div className="rounded-xl border border-slate-700 bg-surface-900 p-6">
      <h2 className="mb-4 text-xl font-bold text-white">
        Details — {orgControl.control?.name ?? 'Control'}
      </h2>
      <div className="mb-6 rounded-lg border border-slate-600 bg-surface-800 p-4">
        <h3 className="mb-2 text-sm font-medium text-slate-400">Approval Status</h3>
        <p className="text-lg font-medium text-white capitalize">{orgControl.status?.toLowerCase().replace('_', ' ')}</p>
        <p className="mt-1 text-sm text-slate-400">
          {orgControl.status === 'COMPLETED' ? 'Control implementation completed.' : 'Implementation in progress or not started.'}
        </p>
      </div>
      <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-slate-400">Reference Code</span>
          <p className="font-mono text-white">{orgControl.control?.code ?? '—'}</p>
        </div>
        <div>
          <span className="text-slate-400">Complete</span>
          <p className="text-white">{orgControl.status === 'COMPLETED' ? 'Yes' : 'No'}</p>
        </div>
        <div>
          <span className="text-slate-400">Applicable</span>
          <p className="text-white">{orgControl.status !== 'NOT_APPLICABLE' ? 'Yes' : 'No'}</p>
        </div>
        <div>
          <span className="text-slate-400">Has Evidence</span>
          <p className="text-white">{(orgControl.evidence?.length ?? evidenceList?.length ?? 0) > 0 ? 'Yes' : 'No'}</p>
        </div>
        <div>
          <span className="text-slate-400">Owner</span>
          <p className="text-white">
            {orgControl.assignments?.[0]?.user
              ? `${orgControl.assignments[0].user.firstName} ${orgControl.assignments[0].user.lastName}`
              : '—'}
          </p>
        </div>
        <div>
          <span className="text-slate-400">Implementation Status</span>
          <p className="text-white capitalize">{orgControl.status?.toLowerCase().replace('_', ' ')}</p>
        </div>
      </div>
      {orgControl.implementationContext && (
        <div className="mb-6">
          <span className="text-slate-400">Implementation Context</span>
          <p className="mt-1 rounded border border-slate-600 bg-surface-800 p-3 text-sm text-slate-200">
            {orgControl.implementationContext}
          </p>
        </div>
      )}
      <div className="flex gap-2 border-b border-slate-700 pb-2">
        {(['evidence', 'notes', 'audits'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded px-3 py-1.5 text-sm capitalize ${activeTab === tab ? 'bg-accent text-white' : 'text-slate-400 hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {activeTab === 'evidence' && (
          <div className="space-y-2">
            {Array.isArray(evidenceList) && evidenceList.length > 0 ? (
              evidenceList.map((e: { id: string; title: string; status: string }) => (
                <div
                  key={e.id}
                  className="rounded border border-slate-600 bg-surface-800 px-3 py-2 text-sm"
                >
                  {e.title} — <span className="text-slate-400">{e.status}</span>
                </div>
              ))
            ) : (
              <p className="text-slate-400">No evidence for this control.</p>
            )}
          </div>
        )}
        {activeTab === 'notes' && (
          <p className="text-slate-400">Notes section. Add implementation context above.</p>
        )}
        {activeTab === 'audits' && (
          <p className="text-slate-400">Audit results for this control.</p>
        )}
      </div>
      {orgControl.status !== 'COMPLETED' && (
        <div className="mt-6">
          <button
            onClick={() => statusMutation.mutate('COMPLETED')}
            disabled={statusMutation.isPending}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            Mark Complete
          </button>
        </div>
      )}
    </div>
  );
}

export function Controls() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');

  const { data: controlsData, isLoading } = useQuery({
    queryKey: ['controls', { status: statusFilter || undefined, search: search || undefined }],
    queryFn: () => controlsApi.list({ status: statusFilter || undefined, search: search || undefined, limit: 50 }),
  });

  const controls = Array.isArray(controlsData)
    ? controlsData
    : (controlsData as { data?: OrganizationControl[] })?.data ?? controlsData ?? [];

  const list = Array.isArray(controls) ? controls : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Controls</h1>
        <a href="#stats" className="text-sm text-accent hover:underline">
          Show stats
        </a>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
        <div className="rounded-xl border border-slate-700 bg-surface-900 overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-700 p-4">
            <input
              type="text"
              placeholder="Search controls..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-slate-600 bg-surface-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-accent focus:outline-none"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-600 bg-surface-800 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
            >
              <option value="">All statuses</option>
              <option value="NOT_STARTED">Not started</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="NOT_APPLICABLE">Not applicable</option>
            </select>
          </div>
          <div className="max-h-[70vh] overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              </div>
            ) : (
              <table className="w-full">
                <thead className="sticky top-0 bg-surface-900 text-left text-sm text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Ref</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Applicable</th>
                    <th className="px-4 py-3">Complete</th>
                    <th className="px-4 py-3">Review</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {list.map((c: OrganizationControl & { control?: { code: string; name: string }; controlId?: string }) => (
                    <ControlRow
                      key={c.id}
                      control={c}
                      selected={selectedId === c.id}
                      onSelect={() => setSelectedId(c.id)}
                    />
                  ))}
                </tbody>
              </table>
            )}
            {!isLoading && list.length === 0 && (
              <div className="py-12 text-center text-slate-400">No controls found.</div>
            )}
          </div>
        </div>
        <div className="min-h-[400px]">
          {selectedId ? (
            <ControlDetail controlId={selectedId} />
          ) : (
            <div className="flex h-64 items-center justify-center rounded-xl border border-slate-700 bg-surface-900 text-slate-400">
              Select a control to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
