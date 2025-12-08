import api from '../lib/api';
import { Sinistre, SinistreStats } from '@/types/sinistre.types';
import { PaginatedResponse } from '@/types/common.types';

interface SinistreSearchParams {
  search?: string;
  statut?: string;
  type_sinistre?: string;
  emf_id?: number;
  page?: number;
  per_page?: number;
}

export const sinistreService = {
  getAll: async (params?: SinistreSearchParams): Promise<PaginatedResponse<Sinistre>> => {
    const response = await api.get<PaginatedResponse<Sinistre>>('/sinistres', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<{ data: Sinistre }>(`/sinistres/${id}`);
    return response.data;
  },

  create: async (data: Partial<Sinistre>) => {
    const response = await api.post<{ data: Sinistre }>('/sinistres', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Sinistre>) => {
    const response = await api.put<{ data: Sinistre }>(`/sinistres/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/sinistres/${id}`);
    return response.data;
  },

  valider: async (id: number, data: { montant_accorde: number; observations?: string }) => {
    const response = await api.post(`/sinistres/${id}/valider`, data);
    return response.data;
  },

  rejeter: async (id: number, data: { motif_rejet: string }) => {
    const response = await api.post(`/sinistres/${id}/rejeter`, data);
    return response.data;
  },

  payer: async (id: number, data: { mode_paiement: string; reference_paiement: string }) => {
    const response = await api.post(`/sinistres/${id}/payer`, data);
    return response.data;
  },

  uploadDocument: async (id: number, formData: FormData) => {
    const response = await api.post(`/sinistres/${id}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteDocument: async (sinistreId: number, documentId: number) => {
    const response = await api.delete(`/sinistres/${sinistreId}/documents/${documentId}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get<{ data: SinistreStats }>('/sinistres/statistiques');
    return response.data;
  },
};
