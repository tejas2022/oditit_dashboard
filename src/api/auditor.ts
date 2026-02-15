import { api, getData } from '../lib/api';
import type { ApiResponse } from '../types/api';
import type {
  AuditorAssignmentOrg,
  AuditorAssignmentDetail,
  AuditorControlsResponse,
  OrganizationSubcontrolInstance,
} from '../types/api';

/** Backend returns { assignments: AuditorAssignmentOrg[], auditorId? } */
export interface MyAssignmentsResult {
  assignments: AuditorAssignmentOrg[];
  auditorId?: number;
}

export const auditorApi = {
  /** Returns { assignments, auditorId }; use result.assignments */
  myAssignments: () =>
    api.get<ApiResponse<MyAssignmentsResult>>('/auditor/my-assignments').then((r) => getData(r.data)),

  getAssignmentDetail: (organizationFrameworkId: number) =>
    api
      .get<ApiResponse<AuditorAssignmentDetail>>(`/auditor/assignments/${organizationFrameworkId}`)
      .then((r) => getData(r.data)),

  getControlsForAssignment: (organizationFrameworkId: number, params?: { page?: number; limit?: number }) =>
    api
      .get<ApiResponse<AuditorControlsResponse>>(`/auditor/assignments/${organizationFrameworkId}/controls`, {
        params,
      })
      .then((r) => getData(r.data)),

  getSubcontrolInstance: (id: number) =>
    api
      .get<ApiResponse<OrganizationSubcontrolInstance>>(`/auditor/subcontrol-instances/${id}`)
      .then((r) => getData(r.data)),

  submitSubcontrolReview: (
    id: number,
    body: { status: 'INCOMPLETE' | 'DONE'; remarkId?: number; notes?: string }
  ) =>
    api
      .post<ApiResponse<unknown>>(`/auditor/subcontrol-instances/${id}/review`, body)
      .then((r) => getData(r.data)),
};
