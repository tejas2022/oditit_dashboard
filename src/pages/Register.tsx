import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Shield } from 'lucide-react';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';

export function Register() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    organizationName: '',
    gstin: '',
    industry: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const registerMutation = useMutation({
    mutationFn: () =>
      authApi.register({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        organizationName: form.organizationName,
        gstin: form.gstin || undefined,
        industry: form.industry || undefined,
      }),
    onSuccess: (data) => {
      setAuth(data.user, data.organization, data.accessToken, data.refreshToken);
      navigate('/', { replace: true });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setError(err?.response?.data?.message ?? 'Registration failed');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password || !form.firstName || !form.lastName || !form.organizationName) {
      setError('Required: email, password, first name, last name, organization name');
      return;
    }
    registerMutation.mutate();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-950 px-4 py-8">
      <div className="w-full max-w-md rounded-xl border border-slate-700 bg-surface-900 p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-center gap-2">
          <Shield className="h-10 w-10 text-accent" />
          <span className="text-2xl font-bold text-white">oditit</span>
        </div>
        <h1 className="mb-2 text-center text-xl font-semibold text-white">Register</h1>
        <p className="mb-6 text-center text-sm text-slate-400">Create your organisation and admin user</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded bg-red-500/20 px-3 py-2 text-sm text-red-400">{error}</div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Organization name</label>
            <input
              type="text"
              value={form.organizationName}
              onChange={(e) => setForm((f) => ({ ...f, organizationName: e.target.value }))}
              className="w-full rounded-lg border border-slate-600 bg-surface-800 px-3 py-2 text-white focus:border-accent focus:outline-none"
              placeholder="Acme Corp"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">First name</label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                className="w-full rounded-lg border border-slate-600 bg-surface-800 px-3 py-2 text-white focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Last name</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                className="w-full rounded-lg border border-slate-600 bg-surface-800 px-3 py-2 text-white focus:border-accent focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full rounded-lg border border-slate-600 bg-surface-800 px-3 py-2 text-white focus:border-accent focus:outline-none"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full rounded-lg border border-slate-600 bg-surface-800 px-3 py-2 text-white focus:border-accent focus:outline-none"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">GSTIN (optional)</label>
            <input
              type="text"
              value={form.gstin}
              onChange={(e) => setForm((f) => ({ ...f, gstin: e.target.value }))}
              className="w-full rounded-lg border border-slate-600 bg-surface-800 px-3 py-2 text-white focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Industry (optional)</label>
            <input
              type="text"
              value={form.industry}
              onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
              className="w-full rounded-lg border border-slate-600 bg-surface-800 px-3 py-2 text-white focus:border-accent focus:outline-none"
              placeholder="Technology"
            />
          </div>
          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full rounded-lg bg-accent py-2.5 font-medium text-white hover:bg-accent-hover disabled:opacity-50"
          >
            {registerMutation.isPending ? 'Creating...' : 'Register'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
