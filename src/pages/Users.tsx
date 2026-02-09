import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users as UsersIcon, Plus } from 'lucide-react';
import { usersApi } from '../api/users';
import type { User } from '../types/api';

export function Users() {
  const queryClient = useQueryClient();
  const [page] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'EMPLOYEE',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['users', page],
    queryFn: () => usersApi.list({ page, limit: 10 }),
  });

  const createMutation = useMutation({
    mutationFn: () => usersApi.create(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowCreate(false);
      setForm({ email: '', password: '', firstName: '', lastName: '', role: 'EMPLOYEE' });
    },
  });

  const list = Array.isArray(data) ? data : (data as { data?: User[] })?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          <Plus className="h-4 w-4" /> Add User
        </button>
      </div>
      <div className="rounded-xl border border-slate-700 bg-surface-900 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {list.map((u: User) => (
              <div
                key={u.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-800/50"
              >
                <div className="flex items-center gap-3">
                  <UsersIcon className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="font-medium text-white">
                      {u.firstName} {u.lastName}
                    </p>
                    <p className="text-sm text-slate-400">{u.email} · {u.role}</p>
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
            <h2 className="mb-4 text-xl font-bold text-white">Add User</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate();
              }}
              className="space-y-4"
            >
              <div>
                <label className="mb-1 block text-sm text-slate-400">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-lg border border-slate-600 bg-surface-800 px-3 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-400">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full rounded-lg border border-slate-600 bg-surface-800 px-3 py-2 text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-sm text-slate-400">First name</label>
                  <input
                    value={form.firstName}
                    onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                    className="w-full rounded-lg border border-slate-600 bg-surface-800 px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">Last name</label>
                  <input
                    value={form.lastName}
                    onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                    className="w-full rounded-lg border border-slate-600 bg-surface-800 px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-400">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  className="w-full rounded-lg border border-slate-600 bg-surface-800 px-3 py-2 text-white"
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="IT_TEAM">IT Team</option>
                  <option value="SECURITY_TEAM">Security Team</option>
                  <option value="CISO">CISO</option>
                  <option value="ADMIN">Admin</option>
                  <option value="AUDITOR">Auditor</option>
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
