import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  FolderOpen,
  Check,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { frameworksApi } from '../api/frameworks';
import type { Framework, ActivatedFramework } from '../types/api';
import { canManageFrameworks } from '../lib/rbac';
import { useAuthStore } from '../store/authStore';

export function Frameworks() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [activateTargetDate, setActivateTargetDate] = useState('');
  const [activatingId, setActivatingId] = useState<string | null>(null);

  const canActivate = canManageFrameworks(user?.role);

  const { data: listResponse, isLoading: listLoading, error: listError } = useQuery({
    queryKey: ['frameworks', 'list', page],
    queryFn: () => frameworksApi.list({ page, limit: 20 }),
  });

  const { data: activatedList, isLoading: activatedLoading, error: activatedError } = useQuery({
    queryKey: ['frameworks', 'activated'],
    queryFn: frameworksApi.activated,
  });

  const [activateError, setActivateError] = useState<string | null>(null);

  const activateMutation = useMutation({
    mutationFn: ({ frameworkId, targetDate }: { frameworkId: string | number; targetDate?: string }) =>
      frameworksApi.activate(frameworkId, targetDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['frameworks'] });
      setActivatingId(null);
      setActivateTargetDate('');
      setActivateError(null);
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = e?.response?.data?.message ?? e?.message ?? 'Failed to activate framework';
      setActivateError(msg);
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (frameworkId: string) => frameworksApi.deactivate(frameworkId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['frameworks'] }),
  });

  const frameworks = listResponse?.data ?? [];
  const meta = listResponse?.meta;
  const activated = Array.isArray(activatedList) ? activatedList : [];

  const activatedIds = new Set(activated.map((a: ActivatedFramework) => Number(a.frameworkId)));

  const listErrorMessage = listError
    ? (listError instanceof Error ? listError.message : (listError as { message?: string }).message ?? 'Error')
    : null;
  const activatedErrorMessage = activatedError
    ? (activatedError instanceof Error ? activatedError.message : (activatedError as { message?: string }).message ?? 'Error')
    : null;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Choose a framework</h1>
      <p className="text-slate-400">
        Select compliance frameworks for your organisation. Activated frameworks create organisation-level
        controls you can work on in Controls.
      </p>

      {activateError && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/15 px-4 py-3 text-red-300">
          {activateError}
          <button
            type="button"
            onClick={() => setActivateError(null)}
            className="ml-2 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {activatedErrorMessage && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/15 px-4 py-3 text-amber-200">
          Could not load activated frameworks: {activatedErrorMessage}
        </div>
      )}

      {/* Frameworks we have selected */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">
          Frameworks selected for your organisation
        </h2>
        {activatedLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : activated.length === 0 ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 text-center">
            <p className="text-amber-200">
              Your organisation has not selected any framework yet. Choose one below to get started.
            </p>
            <p className="mt-2 text-sm text-slate-400">
              After activation, controls will appear under Controls.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-700 bg-surface-900 overflow-hidden">
            <div className="divide-y divide-slate-700">
              {activated.map((a: ActivatedFramework) => (
                <div
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 hover:bg-slate-800/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-green-500/20 p-2">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{a.framework?.name ?? 'Framework'}</p>
                      <p className="text-sm text-slate-400">
                        {a.framework?.type ?? ''} · Controls: {a.framework?._count?.controls ?? 0} · Activated{' '}
                        {a.activatedAt ? new Date(a.activatedAt).toLocaleDateString() : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/controls?frameworkId=${a.frameworkId}`}
                      className="rounded px-3 py-1.5 text-sm text-accent hover:bg-accent/20"
                    >
                      View controls
                    </Link>
                    <button
                      onClick={() => setDetailId(a.frameworkId)}
                      className="rounded px-3 py-1.5 text-sm text-slate-400 hover:bg-slate-700 hover:text-white"
                    >
                      Details
                    </button>
                    {canActivate && (
                      <button
                        onClick={() => {
                          if (window.confirm('Deactivate this framework for your organisation? Organisation controls will be affected.'))
                            deactivateMutation.mutate(a.frameworkId);
                        }}
                        disabled={deactivateMutation.isPending}
                        className="rounded px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                      >
                        Deactivate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Choose a framework – list available */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">
          Available frameworks to choose from
        </h2>
        {!canActivate && frameworks.length > 0 && (
          <p className="mb-2 text-sm text-slate-500">
            Only Admin, CISO, or Super Admin can activate frameworks. Your role: <span className="font-mono text-slate-400">{user?.role ?? '—'}</span>
          </p>
        )}
        {listErrorMessage && (
          <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/15 px-4 py-3 text-red-300">
            Could not load frameworks: {listErrorMessage}
          </div>
        )}
        {listLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {frameworks.map((f: Framework) => {
              const fId = typeof f.id === 'number' ? f.id : Number(f.id);
              const isActivated = activatedIds.has(fId);
              return (
                <div
                  key={f.id}
                  className="rounded-xl border border-slate-700 bg-surface-900 p-6 transition hover:border-slate-600"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <FolderOpen className="h-10 w-10 shrink-0 text-accent" />
                      <div>
                        <p className="font-medium text-white">{f.name}</p>
                        <p className="text-sm text-slate-400">
                          {f.type} · {f._count?.controls ?? 0} controls
                        </p>
                      </div>
                    </div>
                    {isActivated && (
                      <span className="shrink-0 rounded bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                        Selected
                      </span>
                    )}
                  </div>
                  {f.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-slate-400">{f.description}</p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => setDetailId(f.id)}
                      className="flex items-center gap-1 rounded px-3 py-1.5 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
                    >
                      View details <ChevronRight className="h-4 w-4" />
                    </button>
                    {canActivate && !isActivated && (
                      <>
                        <button
                          onClick={() => setActivatingId(f.id)}
                          className="flex items-center gap-1 rounded bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover"
                        >
                          Select for organisation
                        </button>
                        {activatingId === f.id && (
                          <div className="mt-2 flex w-full flex-wrap items-center gap-2 rounded border border-slate-600 bg-surface-800 p-2">
                            <label className="flex items-center gap-1 text-sm text-slate-400">
                              <Calendar className="h-4 w-4" /> Target date (optional)
                            </label>
                            <input
                              type="date"
                              value={activateTargetDate}
                              onChange={(e) => setActivateTargetDate(e.target.value)}
                              className="rounded border border-slate-600 bg-surface-900 px-2 py-1 text-sm text-white"
                            />
                            <button
                              onClick={() => {
                                setActivateError(null);
                                activateMutation.mutate({
                                  frameworkId: fId,
                                  targetDate: activateTargetDate || undefined,
                                });
                              }}
                              disabled={activateMutation.isPending}
                              className="rounded bg-green-600 px-2 py-1 text-sm text-white hover:bg-green-700 disabled:opacity-50"
                            >
                              Activate
                            </button>
                            <button
                              onClick={() => {
                                setActivatingId(null);
                                setActivateTargetDate('');
                              }}
                              className="rounded px-2 py-1 text-sm text-slate-400 hover:bg-slate-700"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {meta && meta.totalPages > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded border border-slate-600 px-3 py-1 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-slate-400">
              Page {page} of {meta.totalPages}
            </span>
            <button
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded border border-slate-600 px-3 py-1 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
        {!listLoading && frameworks.length === 0 && (
          <div className="rounded-xl border border-slate-700 bg-surface-900 p-8 text-center text-slate-400">
            No frameworks available. Contact your platform admin to add frameworks (e.g. ISO 27001, SOC 2).
          </div>
        )}
      </section>

      {detailId && (
        <FrameworkDetailModal
          frameworkId={detailId}
          onClose={() => setDetailId(null)}
        />
      )}
    </div>
  );
}

function FrameworkDetailModal({
  frameworkId,
  onClose,
}: {
  frameworkId: string;
  onClose: () => void;
}) {
  const { data: framework, isLoading } = useQuery({
    queryKey: ['frameworks', frameworkId],
    queryFn: () => frameworksApi.get(frameworkId),
  });

  const f = framework as Framework & { controls?: Array<{ code: string; name: string }> } | undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-xl border border-slate-700 bg-surface-900 p-6">
        <h2 className="mb-4 text-xl font-bold text-white">Framework details</h2>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : f ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-400">Name</p>
              <p className="font-medium text-white">{f.name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Type</p>
              <p className="text-white">{f.type}</p>
            </div>
            {f.version && (
              <div>
                <p className="text-sm text-slate-400">Version</p>
                <p className="text-white">{f.version}</p>
              </div>
            )}
            {f.description && (
              <div>
                <p className="text-sm text-slate-400">Description</p>
                <p className="text-slate-200">{f.description}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-slate-400">Controls</p>
              <p className="text-white">{f._count?.controls ?? f.controls?.length ?? 0} controls</p>
            </div>
            {f.controls && f.controls.length > 0 && (
              <div>
                <p className="mb-2 text-sm text-slate-400">Sample controls</p>
                <ul className="max-h-40 overflow-auto rounded border border-slate-600 bg-surface-800 p-2 text-sm">
                  {f.controls.map((c) => (
                    <li key={c.code} className="py-1 text-slate-200">
                      {c.code} — {c.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-slate-400">Framework not found.</p>
        )}
        <button
          onClick={onClose}
          className="mt-6 rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
        >
          Close
        </button>
      </div>
    </div>
  );
}
