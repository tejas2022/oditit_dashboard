import { api } from '../lib/api';
import type { LoginResponse, RegisterResponse, AuthProfile } from '../types/api';

/** Auth endpoints return raw body (no responseFormatter wrapper) */
function raw<T>(r: { data: T }) {
  return r.data;
}

export const authApi = {
  register: (body: { email: string; password: string; name: string }) =>
    api.post<RegisterResponse>('/auth/register', body).then(raw),

  login: (email: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { email, password }).then(raw),

  refresh: (refreshToken: string) =>
    api.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken }).then(raw),

  logout: (refreshToken?: string) =>
    api.post<{ message?: string }>('/auth/logout', { refreshToken }).then(raw),

  /** Full profile for org switcher, TPRM, roles (raw response) */
  me: () => api.get<AuthProfile>('/auth/me').then(raw),

  /** Switch organization context; returns new tokens and organization (raw response) */
  switchOrganization: (organizationId: number) =>
    api
      .post<{ accessToken: string; refreshToken: string; organization: { id: number; name: string } }>(
        '/auth/switch-organization',
        { organizationId }
      )
      .then(raw),
};
