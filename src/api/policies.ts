import { api, getData } from '../lib/api';
import type { ApiResponse } from '../types/api';
import type { Policy, PolicyVersion, PolicyTemplate } from '../types/api';

export interface PoliciesListResponse {
  data: Policy[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export const policiesApi = {
  /** GET /policies – list policies (paginated, optional search) */
  list: (params?: { page?: number; limit?: number; search?: string }) =>
    api
      .get<ApiResponse<PoliciesListResponse>>('/policies', { params })
      .then((r) => getData(r.data)),

  /** GET /policies/:id – get policy with versions and evidence links */
  get: (id: string) =>
    api.get<ApiResponse<Policy>>(`/policies/${id}`).then((r) => getData(r.data)),

  /** POST /policies – create policy (optional templateId, content) */
  create: (body: {
    name: string;
    description?: string;
    content?: string;
    templateId?: number;
  }) =>
    api.post<ApiResponse<Policy>>('/policies', body).then((r) => getData(r.data)),

  /** PATCH /policies/:id – update policy (name, description, ownerId, reviewerId) */
  update: (id: string, body: { name?: string; description?: string; ownerId?: number; reviewerId?: number }) =>
    api.patch<ApiResponse<Policy>>(`/policies/${id}`, body).then((r) => getData(r.data)),

  /** DELETE /policies/:id */
  delete: (id: string) =>
    api.delete<ApiResponse<unknown>>(`/policies/${id}`).then((r) => getData(r.data)),

  /** GET /policies/templates – list default + org templates; optional frameworkId */
  listTemplates: (params?: { frameworkId?: number }) =>
    api
      .get<ApiResponse<PolicyTemplate[]>>('/policies/templates', { params })
      .then((r) => getData(r.data)),

  /** POST /policies/templates – create org-specific template */
  createTemplate: (body: {
    name: string;
    description?: string;
    content?: string;
    frameworkId?: number;
  }) =>
    api
      .post<ApiResponse<PolicyTemplate>>('/policies/templates', body)
      .then((r) => getData(r.data)),

  /** POST /policies/generate-with-ai – AI generate policy; returns new policy with version 1 */
  generateWithAi: (body: { name: string; description: string }) =>
    api
      .post<ApiResponse<Policy>>('/policies/generate-with-ai', body)
      .then((r) => getData(r.data)),

  /** POST /policies/enhance-selection – AI enhance selection or add section; returns enhancedText only (no DB write) */
  enhanceSelection: (body: {
    policyName: string;
    fullPolicyContent: string;
    selectedText?: string;
    userDescription: string;
  }) =>
    api
      .post<ApiResponse<{ enhancedText: string }>>('/policies/enhance-selection', body)
      .then((r) => getData(r.data)),

  /** GET /policies/:id/versions – list all versions (for dropdown) */
  listVersions: (policyId: string) =>
    api
      .get<ApiResponse<PolicyVersion[]>>(`/policies/${policyId}/versions`)
      .then((r) => getData(r.data)),

  /** GET /policies/:id/versions/:versionId – get one version (content, etc.) */
  getVersion: (policyId: string, versionId: string) =>
    api
      .get<ApiResponse<PolicyVersion>>(`/policies/${policyId}/versions/${versionId}`)
      .then((r) => getData(r.data)),

  /** POST /policies/:id/versions – add version (JSON: content, changeNote; or FormData with file) */
  addVersion: (
    policyId: string,
    body: { content?: string; changeNote?: string } | FormData
  ): Promise<PolicyVersion> => {
    if (body instanceof FormData) {
      return api
        .post<ApiResponse<PolicyVersion>>(`/policies/${policyId}/versions`, body)
        .then((r) => getData(r.data));
    }
    return api
      .post<ApiResponse<PolicyVersion>>(`/policies/${policyId}/versions`, body)
      .then((r) => getData(r.data));
  },

  /** POST /policies/:id/versions/:versionId/attach-to-subcontrol – attach as evidence */
  attachToSubcontrol: (
    policyId: string,
    versionId: string,
    organizationSubcontrolInstanceId: number
  ) =>
    api
      .post<ApiResponse<{ id: number; name?: string }>>(
        `/policies/${policyId}/versions/${versionId}/attach-to-subcontrol`,
        { organizationSubcontrolInstanceId }
      )
      .then((r) => getData(r.data)),
};
