import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Organization } from '../types/api';
import type { UserOrganization, TprmAssignments } from '../types/api';

interface AuthState {
  user: User | null;
  organization: Organization | null;
  organizations: UserOrganization[];
  roles: string[];
  tprmAssignments: TprmAssignments;
  accessToken: string | null;
  refreshToken: string | null;
  showCreateOrgModal: boolean;
  setAuth: (
    user: User,
    organization: Organization | null,
    accessToken: string,
    refreshToken: string,
    opts?: { organizations?: UserOrganization[]; roles?: string[]; tprmAssignments?: TprmAssignments }
  ) => void;
  setProfile: (profile: {
    user?: User;
    organization?: Organization | null;
    organizations: UserOrganization[];
    roles: string[];
    tprmAssignments: TprmAssignments;
  }) => void;
  switchOrganization: (
    organization: Organization,
    accessToken: string,
    refreshToken: string
  ) => void;
  setShowCreateOrgModal: (show: boolean) => void;
  logout: () => void;
  hydrate: () => void;
}

const emptyTprm: TprmAssignments = { asRespondent: [], asAssessor: [] };

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      organization: null,
      organizations: [],
      roles: [],
      tprmAssignments: emptyTprm,
      accessToken: null,
      refreshToken: null,
      showCreateOrgModal: false,
      setAuth: (user, organization, accessToken, refreshToken, opts) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set({
          user,
          organization,
          accessToken,
          refreshToken,
          organizations: opts?.organizations ?? [],
          roles: opts?.roles ?? [],
          tprmAssignments: opts?.tprmAssignments ?? emptyTprm,
        });
      },
      setProfile: (profile) => {
        set({
          user: profile.user ?? undefined,
          organization: profile.organization ?? undefined,
          organizations: profile.organizations,
          roles: profile.roles,
          tprmAssignments: profile.tprmAssignments ?? emptyTprm,
        });
      },
      switchOrganization: (organization, accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set({ organization, accessToken, refreshToken });
      },
      setShowCreateOrgModal: (showCreateOrgModal) => set({ showCreateOrgModal }),
      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({
          user: null,
          organization: null,
          organizations: [],
          roles: [],
          tprmAssignments: emptyTprm,
          accessToken: null,
          refreshToken: null,
          showCreateOrgModal: false,
        });
      },
      hydrate: () => {
        const at = localStorage.getItem('accessToken');
        if (!at)
          set({
            user: null,
            organization: null,
            organizations: [],
            roles: [],
            tprmAssignments: emptyTprm,
            accessToken: null,
            refreshToken: null,
          });
      },
    }),
    {
      name: 'auth',
      partialize: (s) => ({
        user: s.user,
        organization: s.organization,
        organizations: s.organizations,
        roles: s.roles,
        tprmAssignments: s.tprmAssignments,
      }),
    }
  )
);
