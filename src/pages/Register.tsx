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
    name: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setShowCreateOrgModal = useAuthStore((s) => s.setShowCreateOrgModal);

  const registerMutation = useMutation({
    mutationFn: () =>
      authApi.register({
        email: form.email,
        password: form.password,
        name: form.name,
      }),
    onSuccess: (data) => {
      setAuth(data.user, null, data.accessToken, data.refreshToken, {
        organizations: [],
        roles: [],
        tprmAssignments: data.tprmAssignments ?? { asRespondent: [], asAssessor: [] },
      });
      setShowCreateOrgModal(true);
      navigate('/', { replace: true });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setError(err?.response?.data?.message ?? 'Registration failed');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password || !form.name) {
      setError('Email, password and name are required');
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
        <p className="mb-6 text-center text-sm text-slate-400">
          Create your account. You can add an organisation after signing in.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded bg-red-500/20 px-3 py-2 text-sm text-red-400">{error}</div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Full name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-lg border border-slate-600 bg-surface-800 px-3 py-2 text-white focus:border-accent focus:outline-none"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full rounded-lg border border-slate-600 bg-surface-800 px-3 py-2 text-white focus:border-accent focus:outline-none"
              placeholder="you@example.com"
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
          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full rounded-lg bg-accent py-2.5 font-medium text-white hover:bg-accent-hover disabled:opacity-50"
          >
            {registerMutation.isPending ? 'Creating account...' : 'Register'}
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
