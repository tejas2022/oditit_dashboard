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
  addFiles: (evidenceId: string, form: FormData) =>
    api.post<ApiResponse<Evidence>>(`/evidence/${evidenceId}/files`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => getData(r.data)),
  updateStatus: (id: string, body: { status: string; reviewNotes?: string }) =>
    api.patch<ApiResponse<Evidence>>(`/evidence/${id}/status`, body).then((r) => getData(r.data)),
  delete: (id: string) => api.delete<ApiResponse<unknown>>(`/evidence/${id}`).then((r) => getData(r.data)),
  /** Get signed download URL for an evidence file. GET /evidence/:id/files/:fileId/download */
  getFileDownloadUrl: (evidenceId: string, fileId: number) =>
    api
      .get<ApiResponse<{ url: string; fileName: string; fileType?: string }>>(
        `/evidence/${evidenceId}/files/${fileId}/download`
      )
      .then((r) => getData(r.data)),
  /** Link evidence to a subcontrol instance. POST /evidence/:id/link-subcontrol */
  linkToSubcontrol: (evidenceId: string, organizationSubcontrolInstanceId: number) =>
    api
      .post<ApiResponse<unknown>>(`/evidence/${evidenceId}/link-subcontrol`, {
        organizationSubcontrolInstanceId,
      })
      .then((r) => getData(r.data)),
  /** Unlink evidence from subcontrol. DELETE /evidence/:id/link-subcontrol/:organizationSubcontrolInstanceId */
  unlinkFromSubcontrol: (evidenceId: string, organizationSubcontrolInstanceId: number) =>
    api
      .delete<ApiResponse<unknown>>(
        `/evidence/${evidenceId}/link-subcontrol/${organizationSubcontrolInstanceId}`
      )
      .then((r) => getData(r.data)),
};
