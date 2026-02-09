import { api, getData } from '../lib/api';
import type { ApiResponse } from '../types/api';
import type { OrganizationControl } from '../types/api';
import type { PaginatedResponse } from '../types/api';

export const controlsApi = {
  list: (params?: { page?: number; limit?: number; status?: string; frameworkId?: string; search?: string }) =>
    api
      .get<ApiResponse<PaginatedResponse<OrganizationControl> | OrganizationControl[]>>('/controls', { params })
      .then((r) => getData(r.data)),
  get: (id: string) =>
    api.get<ApiResponse<OrganizationControl>>(`/controls/${id}`).then((r) => getData(r.data)),
  stats: () => api.get<ApiResponse<Record<string, number>>>('/controls/stats').then((r) => getData(r.data)),
  updateStatus: (
    id: string,
    body: { status: string; completionDate?: string; nextReviewDate?: string }
  ) =>
    api.patch<ApiResponse<OrganizationControl>>(`/controls/${id}/status`, body).then((r) => getData(r.data)),
  assign: (id: string, body: { userId: string; dueDate?: string }) =>
    api.post<ApiResponse<unknown>>(`/controls/${id}/assign`, body).then((r) => getData(r.data)),
};
