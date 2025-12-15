import api from '../lib/api';
import { User, UserStats, CreateUserPayload } from '@/types/user.types';
import { PaginatedResponse } from '@/types/common.types';

interface UserSearchParams {
  search?: string;
  role?: string;
  statut?: string;
  page?: number;
  per_page?: number;
}

export const userService = {
  getAll: async (params?: UserSearchParams) => {
    const response = await api.get<PaginatedResponse<User>>('/users', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<{ data: User }>(`/users/${id}`);
    return response.data;
  },

  create: async (data: CreateUserPayload) => {
    const response = await api.post<{ data: User }>('/auth/register', data);
    return response.data;
  },

  update: async (id: number, data: Partial<User>) => {
    const response = await api.put<{ data: User }>(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  updatePassword: async (id: number, data: { password: string; password_confirmation: string }) => {
    const response = await api.put(`/users/${id}/password`, data);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get<{ data: UserStats }>('/users/statistiques');
    return response.data;
  },
};
