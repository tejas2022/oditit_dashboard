import { api, getData } from '../lib/api';
import type { ApiResponse } from '../types/api';
import type { Policy } from '../types/api';
import type { PaginatedResponse } from '../types/api';

export const policiesApi = {
  list: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<PaginatedResponse<Policy> | Policy[]>>('/policies', { params }).then((r) => getData(r.data)),
  get: (id: string) => api.get<ApiResponse<Policy>>(`/policies/${id}`).then((r) => getData(r.data)),
  create: (body: { title: string; content?: string; version?: string }) =>
    api.post<ApiResponse<Policy>>('/policies', body).then((r) => getData(r.data)),
  update: (id: string, body: Partial<Policy>) =>
    api.patch<ApiResponse<Policy>>(`/policies/${id}`, body).then((r) => getData(r.data)),
  approve: (id: string) => api.post<ApiResponse<Policy>>(`/policies/${id}/approve`).then((r) => getData(r.data)),
  publish: (id: string) => api.post<ApiResponse<Policy>>(`/policies/${id}/publish`).then((r) => getData(r.data)),
  archive: (id: string) => api.post<ApiResponse<Policy>>(`/policies/${id}/archive`).then((r) => getData(r.data)),
  delete: (id: string) => api.delete<ApiResponse<unknown>>(`/policies/${id}`).then((r) => getData(r.data)),
};
