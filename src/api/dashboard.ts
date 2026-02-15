import { api, getData } from '../lib/api';
import type { ApiResponse, DashboardSummary, ControlStats } from '../types/api';

export const dashboardApi = {
  summary: () =>
    api.get<ApiResponse<DashboardSummary>>('/dashboard/summary').then((r) => getData(r.data)),

  complianceChecker: () =>
    api.get<ApiResponse<{ total: number; compliant: number; nonCompliant: number; gaps: unknown[] }>>('/dashboard/compliance-checker').then((r) => getData(r.data)),
  
  controlStats: (params?: { organizationFrameworkId?: number }) =>
    api
      .get<ApiResponse<ControlStats>>('/controls/stats', { params })
      .then((r) => getData(r.data)),
};
