import { api, getData } from '../lib/api';
import type { ApiResponse } from '../types/api';
import type { AssessmentReport } from '../types/api';
import type { PaginatedResponse } from '../types/api';

export const aiAssessmentApi = {
  assess: (body: { controlIds: string[]; provider: string }) =>
    api.post<ApiResponse<AssessmentReport>>('/ai-assessment/assess', body).then((r) => getData(r.data)),
  history: (params?: { page?: number; limit?: number }) =>
    api
      .get<ApiResponse<PaginatedResponse<AssessmentReport> | AssessmentReport[]>>('/ai-assessment/history', { params })
      .then((r) => getData(r.data)),
  report: (reportId: string) =>
    api.get<ApiResponse<AssessmentReport & { controls?: unknown[]; summary?: string }>>(`/ai-assessment/report/${reportId}`).then((r) => getData(r.data)),
};
