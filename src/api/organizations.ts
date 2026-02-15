import { api, getData } from '../lib/api';
import type { ApiResponse } from '../types/api';
import type { Organization } from '../types/api';
import type { UserOrganization } from '../types/api';

export const organizationsApi = {
  /** List organizations the current user belongs to */
  myOrganizations: () =>
    api
      .get<ApiResponse<UserOrganization[]>>('/organizations/my-organizations')
      .then((r) => getData(r.data)),

  /** Create organization (user becomes admin) */
  create: (body: { name: string; slug?: string; complianceStartDate?: string }) =>
    api.post<ApiResponse<Organization>>('/organizations', body).then((r) => getData(r.data)),

  /** Get one organization (by id) */
  get: (id: number) =>
    api.get<ApiResponse<Organization>>(`/organizations/${id}`).then((r) => getData(r.data)),

  /** Update organization (admin only) */
  update: (id: number, body: { name?: string; complianceStartDate?: string }) =>
    api.patch<ApiResponse<Organization>>(`/organizations/${id}`, body).then((r) => getData(r.data)),

  /** Invite user to organization (admin only) */
  inviteUser: (id: number, body: { email: string; roles: string[] }) =>
    api.post<ApiResponse<unknown>>(`/organizations/${id}/invite`, body).then((r) => getData(r.data)),

  /** Update member roles (admin only) */
  updateMemberRoles: (orgId: number, userId: number, body: { roles: string[] }) =>
    api.patch<ApiResponse<unknown>>(`/organizations/${orgId}/members/${userId}/roles`, body).then((r) => getData(r.data)),

  /** Remove member (admin only) */
  removeMember: (orgId: number, userId: number) =>
    api.delete<ApiResponse<unknown>>(`/organizations/${orgId}/members/${userId}`).then((r) => getData(r.data)),

  /** Leave organization */
  leave: (orgId: number) =>
    api.post<ApiResponse<unknown>>(`/organizations/${orgId}/leave`).then((r) => getData(r.data)),
};
