import { api, getData } from '../lib/api';
import type { ApiResponse } from '../types/api';
import type { LoginResponse } from '../types/api';

export const authApi = {
  register: (body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName: string;
    gstin?: string;
    industry?: string;
  }) =>
    api.post<ApiResponse<LoginResponse>>('/auth/register', body).then((r) => getData(r.data)),

  login: (email: string, password: string) =>
    api.post<ApiResponse<LoginResponse>>('/auth/login', { email, password }).then((r) => getData(r.data)),

  refresh: (refreshToken: string) =>
    api.post<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/refresh', { refreshToken }).then((r) => getData(r.data)),

  logout: (refreshToken?: string) => api.post<ApiResponse<unknown>>('/auth/logout', { refreshToken }).then((r) => getData(r.data)),

  me: () => api.get<ApiResponse<{ user: unknown }>>('/auth/me').then((r) => getData(r.data)),
};
