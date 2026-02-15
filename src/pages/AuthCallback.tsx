import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';

/**
 * Handles redirect from Google OAuth (backend redirects here with ?accessToken=...&refreshToken=...).
 * Stores tokens, fetches profile, then redirects to home.
 */
export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const setAuth = useAuthStore((s) => s.setAuth);
  const setShowCreateOrgModal = useAuthStore((s) => s.setShowCreateOrgModal);

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    if (!accessToken || !refreshToken) {
      setError('Missing tokens from login');
      return;
    }
    (async () => {
      try {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        const profile = await authApi.me();
        const user = {
          id: profile.id,
          email: profile.email,
          name: profile.name ?? undefined,
          authProvider: 'GOOGLE' as const,
          isActive: true,
          dateAdded: '',
          dateUpdated: '',
        };
        setAuth(user, profile.organization ?? null, accessToken, refreshToken, {
          organizations: profile.organizations ?? [],
          roles: profile.roles ?? [],
          tprmAssignments: profile.tprmAssignments ?? { asRespondent: [], asAssessor: [] },
        });
        if (!profile.organizations?.length) {
          setShowCreateOrgModal(true);
        }
        navigate('/', { replace: true });
      } catch (e) {
        setError('Failed to load profile');
      }
    })();
  }, [searchParams, navigate, setAuth, setShowCreateOrgModal]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-950 px-4">
        <div className="rounded-xl border border-red-900/50 bg-surface-900 p-8 text-center">
          <p className="text-red-400">{error}</p>
          <a href="/login" className="mt-4 inline-block text-accent hover:underline">
            Back to login
          </a>
        </div>
      </div>
    );
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-950 px-4">
      <p className="text-slate-400">Signing you in...</p>
    </div>
  );
}
