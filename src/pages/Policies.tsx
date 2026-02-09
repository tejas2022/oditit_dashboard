import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Plus, Check, Archive } from 'lucide-react';
import { policiesApi } from '../api/policies';
import type { Policy } from '../types/api';

export function Policies() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<'create' | 'detail' | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({ title: '', content: '', version: '1.0' });

  const { data, isLoading } = useQuery({
    queryKey: ['policies', page],
    queryFn: () => policiesApi.list({ page, limit: 10 }),
  });

  const createMutation = useMutation({
    mutationFn: () => policiesApi.create(createForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      setModal(null);
      setCreateForm({ title: '', content: '', version: '1.0' });
    },
  });

  const list = Array.isArray(data) ? data : (data as { data?: Policy[] })?.data ?? [];
  const meta = (data as { meta?: { total: number; totalPages: number } })?.meta;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Policies</h1>
        <button
          onClick={() => setModal('create')}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          <Plus className="h-4 w-4" /> Create Policy
        </button>
      </div>
      <div className="rounded-xl border border-slate-700 bg-surface-900 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {list.map((p: Policy) => (
              <div
                key={p.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-800/50"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="font-medium text-white">{p.title}</p>
                    <p className="text-sm text-slate-400">
                      v{p.version ?? '1.0'} — {p.status}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedId(p.id);
                      setModal('detail');
                    }}
                    className="rounded px-3 py-1.5 text-sm text-accent hover:bg-accent/20"
                  >
                    View
                  </button>
                  {p.status !== 'APPROVED' && (
                    <button
                      onClick={async () => {
                        await policiesApi.approve(p.id);
                        queryClient.invalidateQueries({ queryKey: ['policies'] });
                      }}
                      className="flex items-center gap-1 rounded px-3 py-1.5 text-sm text-green-400 hover:bg-green-500/20"
                    >
                      <Check className="h-4 w-4" /> Approve
                    </button>
                  )}
                  {p.status === 'APPROVED' && (
                    <button
                      onClick={async () => {
                        await policiesApi.publish(p.id);
                        queryClient.invalidateQueries({ queryKey: ['policies'] });
                      }}
                      className="rounded px-3 py-1.5 text-sm text-accent hover:bg-accent/20"
                    >
                      Publish
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      await policiesApi.archive(p.id);
                      queryClient.invalidateQueries({ queryKey: ['policies'] });
                    }}
                    className="flex items-center gap-1 rounded px-3 py-1.5 text-sm text-slate-400 hover:bg-slate-700"
                  >
                    <Archive className="h-4 w-4" /> Archive
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {meta && meta.totalPages > 1 && (
          <div className="flex justify-center gap-2 border-t border-slate-700 p-4">
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
      </div>

      {modal === 'create' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-surface-900 p-6">
            <h2 className="mb-4 text-xl font-bold text-white">Create Policy</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate();
              }}
              className="space-y-4"
            >
              <div>
                <label className="mb-1 block text-sm text-slate-400">Title</label>
                <input
                  value={createForm.title}
                  onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full rounded-lg border border-slate-600 bg-surface-800 px-3 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-400">Version</label>
                <input
                  value={createForm.version}
                  onChange={(e) => setCreateForm((f) => ({ ...f, version: e.target.value }))}
                  className="w-full rounded-lg border border-slate-600 bg-surface-800 px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-400">Content</label>
                <textarea
                  value={createForm.content}
                  onChange={(e) => setCreateForm((f) => ({ ...f, content: e.target.value }))}
                  className="w-full rounded-lg border border-slate-600 bg-surface-800 px-3 py-2 text-white min-h-[120px]"
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === 'detail' && selectedId && (
        <PolicyDetailModal
          id={selectedId}
          onClose={() => {
            setModal(null);
            setSelectedId(null);
          }}
        />
      )}
    </div>
  );
}

function PolicyDetailModal({ id, onClose }: { id: string; onClose: () => void }) {
  const { data } = useQuery({
    queryKey: ['policies', id],
    queryFn: () => policiesApi.get(id),
  });
  const policy = data as Policy | undefined;
  if (!policy) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-xl border border-slate-700 bg-surface-900 p-6">
        <h2 className="mb-2 text-xl font-bold text-white">Details — Policy</h2>
        <p className="mb-4 text-slate-400">Approval Status: {policy.status}</p>
        <div className="space-y-2 text-sm">
          <p><span className="text-slate-400">Title:</span> {policy.title}</p>
          <p><span className="text-slate-400">Version:</span> {policy.version ?? '1.0'}</p>
          {policy.content && (
            <div className="mt-4 rounded border border-slate-600 bg-surface-800 p-4 text-slate-200">
              {policy.content}
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="mt-6 rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300"
        >
          Close
        </button>
      </div>
    </div>
  );
}
