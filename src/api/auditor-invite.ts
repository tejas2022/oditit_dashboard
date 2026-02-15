import { api, getData } from '../lib/api';
import type { ApiResponse } from '../types/api';
import type { OrganizationFramework } from '../types/api';

/** Org admin: list org frameworks for inviting auditors */
export interface OrgFrameworkOption {
  id: number;
  frameworkId: number;
  framework?: { id: number; name: string; code?: string };
}

/** Org admin: list grants for one org framework */
export interface AuditorGrant {
  id: number;
  auditorId: number;
  auditor?: { id: number; name?: string; email?: string };
  fromDate: string;
  toDate: string;
}

export const auditorInviteApi = {
  /** GET /organizations/:orgId/auditors/frameworks */
  listFrameworks: (organizationId: number) =>
    api
      .get<ApiResponse<OrgFrameworkOption[] | OrganizationFramework[]>>(
        `/organizations/${organizationId}/auditors/frameworks`
      )
      .then((r) => getData(r.data)),

  /** POST /organizations/:orgId/auditors/invite */
  inviteAuditor: (
    organizationId: number,
    body: {
      email: string;
      name?: string;
      organizationFrameworkIds: number[];
      fromDate?: string;
      toDate?: string;
      experience?: string;
      certifications?: string;
      designation?: string;
      organisationName?: string;
    }
  ) =>
    api
      .post<ApiResponse<unknown>>(`/organizations/${organizationId}/auditors/invite`, body)
      .then((r) => getData(r.data)),

  /** GET /organizations/:orgId/auditors/frameworks/:organizationFrameworkId/grants */
  listGrants: (organizationId: number, organizationFrameworkId: number) =>
    api
      .get<ApiResponse<AuditorGrant[]>>(
        `/organizations/${organizationId}/auditors/frameworks/${organizationFrameworkId}/grants`
      )
      .then((r) => getData(r.data)),
};
