import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, Plus } from 'lucide-react';
import { vendorsApi } from '../api/vendors';
import type { Vendor } from '../types/api';

export function Vendors() {
  const queryClient = useQueryClient();
  const [page] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    gstin: '',
    website: '',
    riskLevel: 'MEDIUM',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['vendors', page],
    queryFn: () => vendorsApi.list({ page, limit: 10 }),
  });

  const createMutation = useMutation({
    mutationFn: () => vendorsApi.create(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      setShowCreate(false);
      setForm({ name: '', email: '', gstin: '', website: '', riskLevel: 'MEDIUM' });
    },
  });

  const list = Array.isArray(data) ? data : (data as { data?: Vendor[] })?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Vendor / Questionnaire</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          <Plus className="h-4 w-4" /> Create Vendor
        </button>
      </div>

      <div className="rounded-xl border border-slate-700 bg-surface-900 p-6">
        <h2 className="mb-2 text-lg font-semibold text-white">General / Vendor Questionnaire</h2>
        <p className="mb-6 text-slate-400">
          This section is ready. You can add more questions or create a new section.
        </p>
        <div className="mb-6 rounded border border-slate-600 bg-surface-800 p-4">
          <p className="text-sm text-slate-300">Critical Control list (e.g. G1)</p>
          <p className="mt-2 text-sm text-slate-400">
            Create and share questionnaires for vendors. Click to see more.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-700 bg-surface-900 overflow-hidden">
        <div className="border-b border-slate-700 px-6 py-4">
          <h2 className="font-semibold text-white">Vendors</h2>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {list.map((v: Vendor) => (
              <div
                key={v.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-800/50"
              >
                <div className="flex items-center gap-3">
                  <ClipboardList className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="font-medium text-white">{v.name}</p>
                    <p className="text-sm text-slate-400">
                      {v.email ?? '—'} · Risk: {v.riskLevel ?? '—'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-surface-900 p-6">
            <h2 className="mb-4 text-xl font-bold text-white">Create Vendor</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate();
              }}
              className="space-y-4"
            >
              <div>
                <label className="mb-1 block text-sm text-slate-400">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-lg border border-slate-600 bg-surface-800 px-3 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-400">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-lg border border-slate-600 bg-surface-800 px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-400">Risk Level</label>
                <select
                  value={form.riskLevel}
                  onChange={(e) => setForm((f) => ({ ...f, riskLevel: e.target.value }))}
                  className="w-full rounded-lg border border-slate-600 bg-surface-800 px-3 py-2 text-white"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
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
    </div>
  );
}
