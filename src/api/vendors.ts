import { api, getData } from '../lib/api';
import type { ApiResponse } from '../types/api';
import type { Vendor } from '../types/api';
import type { PaginatedResponse } from '../types/api';

export const vendorsApi = {
  list: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<PaginatedResponse<Vendor> | Vendor[]>>('/vendors', { params }).then((r) => getData(r.data)),
  get: (id: string) => api.get<ApiResponse<Vendor>>(`/vendors/${id}`).then((r) => getData(r.data)),
  create: (body: { name: string; email?: string; gstin?: string; website?: string; riskLevel?: string }) =>
    api.post<ApiResponse<Vendor>>('/vendors', body).then((r) => getData(r.data)),
  update: (id: string, body: Partial<Vendor>) =>
    api.patch<ApiResponse<Vendor>>(`/vendors/${id}`, body).then((r) => getData(r.data)),
  delete: (id: string) => api.delete<ApiResponse<unknown>>(`/vendors/${id}`).then((r) => getData(r.data)),
};
