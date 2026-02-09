import { api, getData } from '../lib/api';
import type { ApiResponse } from '../types/api';
import type { Evidence } from '../types/api';
import type { PaginatedResponse } from '../types/api';

export const evidenceApi = {
  list: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<PaginatedResponse<Evidence> | Evidence[]>>('/evidence', { params }).then((r) => getData(r.data)),
  getByControl: (controlId: string) =>
    api.get<ApiResponse<Evidence[]>>(`/evidence/control/${controlId}`).then((r) => getData(r.data)),
  get: (id: string) => api.get<ApiResponse<Evidence>>(`/evidence/${id}`).then((r) => getData(r.data)),
  upload: (form: FormData) =>
    api.post<ApiResponse<Evidence>>('/evidence', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => getData(r.data)),
  updateStatus: (id: string, body: { status: string; reviewNotes?: string }) =>
    api.patch<ApiResponse<Evidence>>(`/evidence/${id}/status`, body).then((r) => getData(r.data)),
  delete: (id: string) => api.delete<ApiResponse<unknown>>(`/evidence/${id}`).then((r) => getData(r.data)),
};
