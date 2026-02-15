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

  /** TPRM respondent: list assessments for me (no org required) */
  tprmAssessmentsForMe: () =>
    api.get<ApiResponse<unknown>>('/vendors/tprm/assessments-for-me').then((r) => getData(r.data)),

  /** TPRM respondent: get vendor context */
  tprmGetVendor: (vendorId: number) =>
    api.get<ApiResponse<Vendor>>(`/vendors/tprm/vendors/${vendorId}`).then((r) => getData(r.data)),

  /** TPRM respondent: get questionnaire for vendor */
  tprmGetQuestions: (vendorId: number) =>
    api.get<ApiResponse<unknown>>(`/vendors/tprm/vendors/${vendorId}/questions`).then((r) => getData(r.data)),

  /** TPRM assessor: assign assessor to vendor (requires organizationId) */
  assignAssessor: (vendorId: number, organizationId: number, userId: number) =>
    api
      .post<ApiResponse<unknown>>(`/vendors/${vendorId}/assessors`, { userId }, { params: { organizationId } })
      .then((r) => getData(r.data)),

  /** TPRM assessor: invite respondent (vendor contact) */
  inviteRespondent: (vendorId: number, organizationId: number, body: { email: string; name?: string }) =>
    api
      .post<ApiResponse<unknown>>(`/vendors/${vendorId}/respondents`, body, { params: { organizationId } })
      .then((r) => getData(r.data)),

  /** TPRM assessor: list users linked to vendor */
  getVendorUserLinks: (vendorId: number, organizationId: number) =>
    api
      .get<ApiResponse<unknown>>(`/vendors/${vendorId}/users`, { params: { organizationId } })
      .then((r) => getData(r.data)),
};
