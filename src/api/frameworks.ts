import { api, getData } from '../lib/api';
import type { ApiResponse } from '../types/api';
import type { Framework, ActivatedFramework } from '../types/api';

export interface FrameworksListResponse {
  data: Framework[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export const frameworksApi = {
  /** GET /api/v1/frameworks – list all frameworks the organisation can select from */
  list: (params?: { page?: number; limit?: number }) =>
    api
      .get<ApiResponse<FrameworksListResponse>>('/frameworks', { params })
      .then((r) => getData(r.data)),

  /** GET /api/v1/frameworks/:id – get one framework (e.g. details before activating) */
  get: (id: string) =>
    api.get<ApiResponse<Framework>>(`/frameworks/${id}`).then((r) => getData(r.data)),

  /** GET /api/v1/frameworks/activated – frameworks already selected for the organisation */
  activated: () =>
    api
      .get<ApiResponse<ActivatedFramework[]>>('/frameworks/activated')
      .then((r) => getData(r.data)),

  /** Alias for activated (used by Frameworks page) */
  listActive: () =>
    api
      .get<ApiResponse<ActivatedFramework[]>>('/frameworks/activated')
      .then((r) => getData(r.data)),

  /** POST /api/v1/frameworks/activate – select framework for the organisation (ADMIN, SUPER_ADMIN, CISO). Backend expects frameworkId as number. */
  activate: (frameworkId: string | number, targetDate?: string) =>
    api
      .post<ApiResponse<unknown>>('/frameworks/activate', {
        frameworkId: Number(frameworkId),
        ...(targetDate && { targetDate }),
      })
      .then((r) => getData(r.data)),

  /** PATCH /api/v1/frameworks/:frameworkId – update activation (targetDate, isActive) */
  updateActivation: (
    frameworkId: string,
    body: { isActive?: boolean; targetDate?: string }
  ) =>
    api
      .patch<ApiResponse<unknown>>(`/frameworks/${frameworkId}`, body)
      .then((r) => getData(r.data)),

  /** DELETE /api/v1/frameworks/:frameworkId – deactivate framework for the organisation */
  deactivate: (frameworkId: string) =>
    api
      .delete<ApiResponse<unknown>>(`/frameworks/${frameworkId}`)
      .then((r) => getData(r.data)),
};
