import { api, getData } from '../lib/api';
import type { ApiResponse } from '../types/api';
import type {
  OrganizationControlInstance,
  OrganizationSubcontrolInstance,
} from '../types/api';

export interface ControlsListResponse {
  data: OrganizationControlInstance[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export const controlsApi = {
  /** GET /controls?organizationFrameworkId= required. Optional isApplicable (true | false) for filter. */
  list: (params: {
    organizationFrameworkId: number;
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    isApplicable?: boolean;
  }) =>
    api
      .get<ApiResponse<ControlsListResponse>>('/controls', { params })
      .then((r) => getData(r.data)),

  /** GET /controls/:id – control instance by id with subcontrolInstances (for expanded row). */
  get: (id: string) =>
    api
      .get<ApiResponse<OrganizationControlInstance>>(`/controls/${id}`)
      .then((r) => getData(r.data)),

  stats: (params?: { organizationFrameworkId?: number }) =>
    api
      .get<ApiResponse<Record<string, number>>>('/controls/stats', { params })
      .then((r) => getData(r.data)),

  updateStatus: (id: string, body: { status: string; reviewNotes?: string }) =>
    api
      .patch<ApiResponse<OrganizationControlInstance>>(`/controls/${id}/status`, body)
      .then((r) => getData(r.data)),

  updateControl: (
    id: string,
    body: {
      ownerId?: number;
      operatorId?: number;
      status?: string;
      reviewNotes?: string;
      isApplicable?: boolean;
    }
  ) =>
    api
      .patch<ApiResponse<OrganizationControlInstance>>(`/controls/${id}`, body)
      .then((r) => getData(r.data)),

  /** GET /controls/subcontrol-instances/:id – one subcontrol instance (for detail page). */
  getSubcontrol: (id: string) =>
    api
      .get<ApiResponse<OrganizationSubcontrolInstance>>(`/controls/subcontrol-instances/${id}`)
      .then((r) => getData(r.data)),

  updateSubcontrol: (
    id: string,
    body: {
      reviewNotes?: string;
      status?: string;
      ownerId?: number;
      operatorId?: number;
      isApplicable?: boolean;
    }
  ) =>
    api
      .patch<ApiResponse<OrganizationSubcontrolInstance>>(`/controls/subcontrol-instances/${id}`, body)
      .then((r) => getData(r.data)),

  getSubcontrolNotes: (subcontrolId: string) =>
    api
      .get<ApiResponse<{ id: number; content: string; ownerId?: number; dateAdded: string }[]>>(
        `/controls/subcontrol-instances/${subcontrolId}/notes`
      )
      .then((r) => getData(r.data)),

  addSubcontrolNote: (subcontrolId: string, content: string) =>
    api
      .post<ApiResponse<unknown>>(`/controls/subcontrol-instances/${subcontrolId}/notes`, {
        content,
      })
      .then((r) => getData(r.data)),

  assign: (id: string, body: { userId: string; dueDate?: string }) =>
    api.post<ApiResponse<unknown>>(`/controls/${id}/assign`, body).then((r) => getData(r.data)),

  /** POST /controls/subcontrol-instances/:id/ai-assess – run AI assessment for one subcontrol */
  aiAssessSubcontrol: (subcontrolInstanceId: string) =>
    api
      .post<ApiResponse<OrganizationSubcontrolInstance>>(
        `/controls/subcontrol-instances/${subcontrolInstanceId}/ai-assess`
      )
      .then((r) => getData(r.data)),

  /** POST /controls/ai-assess/control/:id – run AI assessment for one control (all subcontrols + evidence) */
  aiAssessControl: (controlInstanceId: string) =>
    api
      .post<
        ApiResponse<{
          controlInstance: OrganizationControlInstance;
          assessment: {
            isCompliant: boolean;
            score: number;
            aiAssessmentResult: string;
            findings: string;
            recommendations: string;
          };
        }>
      >(`/controls/ai-assess/control/${controlInstanceId}`)
      .then((r) => getData(r.data)),

  /** POST /controls/ai-assess/framework?organizationFrameworkId= – run AI assessment for whole org framework */
  aiAssessFramework: (organizationFrameworkId: number) =>
    api
      .post<
        ApiResponse<{
          frameworkAssessmentResult: {
            id: number;
            organizationFrameworkId: number;
            summary: string;
            score: number;
            isCompliant: boolean;
            findings: string;
            recommendations: string;
          };
          assessment: {
            isCompliant: boolean;
            score: number;
            findings: string;
            recommendations: string;
          };
        }>
      >(`/controls/ai-assess/framework`, {
        params: { organizationFrameworkId },
      })
      .then((r) => getData(r.data)),
};
