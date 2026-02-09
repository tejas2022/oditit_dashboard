import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { organizationsApi } from '../api/organizations';

export function Settings() {
  const queryClient = useQueryClient();
  const { user, organization } = useAuthStore();
  const [name, setName] = useState(organization?.name ?? '');
  const [industry, setIndustry] = useState(organization?.industry ?? '');

  const updateMutation = useMutation({
    mutationFn: () => organizationsApi.updateMe({ name: name || undefined, industry: industry || undefined }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['organizations'] }),
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Settings</h1>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-700 bg-surface-900 p-6">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-white">
            <User className="h-5 w-5" /> Profile
          </h2>
          <div className="space-y-2 text-sm">
            <p><span className="text-slate-400">Name:</span> {user?.firstName} {user?.lastName}</p>
            <p><span className="text-slate-400">Email:</span> {user?.email}</p>
            <p><span className="text-slate-400">Role:</span> {user?.role}</p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-surface-900 p-6">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-white">
            <Building2 className="h-5 w-5" /> Organization
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateMutation.mutate();
            }}
            className="space-y-4"
          >
            <div>
              <label className="mb-1 block text-sm text-slate-400">Organization name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-surface-800 px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">Industry</label>
              <input
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-surface-800 px-3 py-2 text-white"
                placeholder="Technology"
              />
            </div>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Save
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

