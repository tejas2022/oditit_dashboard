import { api, getData } from '../lib/api';
import type { ApiResponse } from '../types/api';
import type { DashboardSummary } from '../types/api';

export const dashboardApi = {
  summary: () =>
    api.get<ApiResponse<DashboardSummary>>('/dashboard/summary').then((r) => getData(r.data)),

  complianceChecker: () =>
    api.get<ApiResponse<{ total: number; compliant: number; nonCompliant: number; gaps: unknown[] }>>('/dashboard/compliance-checker').then((r) => getData(r.data)),
};
