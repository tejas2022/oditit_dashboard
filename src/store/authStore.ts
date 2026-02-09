import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Organization } from '../types/api';

interface AuthState {
  user: User | null;
  organization: Organization | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: User, organization: Organization, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      organization: null,
      accessToken: null,
      refreshToken: null,
      setAuth: (user, organization, accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set({ user, organization, accessToken, refreshToken });
      },
      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, organization: null, accessToken: null, refreshToken: null });
      },
      hydrate: () => {
        const at = localStorage.getItem('accessToken');
        if (!at) set({ user: null, organization: null, accessToken: null, refreshToken: null });
      },
    }),
    { name: 'auth', partialize: (s) => ({ user: s.user, organization: s.organization }) }
  )
);
