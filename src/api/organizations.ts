import { api, getData } from '../lib/api';
import type { ApiResponse } from '../types/api';
import type { Organization } from '../types/api';

export const organizationsApi = {
  me: () => api.get<ApiResponse<Organization>>('/organizations/me').then((r) => getData(r.data)),
  stats: () => api.get<ApiResponse<Record<string, unknown>>>('/organizations/stats').then((r) => getData(r.data)),
  updateMe: (body: { name?: string; industry?: string }) =>
    api.patch<ApiResponse<Organization>>('/organizations/me', body).then((r) => getData(r.data)),
};
