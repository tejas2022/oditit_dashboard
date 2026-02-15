import { api, getData } from '../lib/api';
import type { ApiResponse } from '../types/api';
import type { User } from '../types/api';
import type { PaginatedResponse } from '../types/api';

export const usersApi = {
  list: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<PaginatedResponse<User> | User[]>>('/users', { params }).then((r) => getData(r.data)),
  get: (id: string) => api.get<ApiResponse<User>>(`/users/${id}`).then((r) => getData(r.data)),
  create: (body: { email: string; password: string; name: string; isActive?: boolean }) =>
    api.post<ApiResponse<User>>('/users', body).then((r) => getData(r.data)),
  update: (id: string, body: Partial<User>) =>
    api.patch<ApiResponse<User>>(`/users/${id}`, body).then((r) => getData(r.data)),
  delete: (id: string) => api.delete<ApiResponse<unknown>>(`/users/${id}`).then((r) => getData(r.data)),
};
