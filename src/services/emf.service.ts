import api from '../lib/api';
import { Emf } from '@/types/emf.types';

interface EmfSearchParams {
  search?: string;
  type?: 'emf' | 'banque';
  statut?: string;
  sigle?: string;
  page?: number;
  per_page?: number;
}

interface EmfWithCount extends Emf {
  contrats_count?: number;
}

interface EmfStats {
  total_emfs: number;
  total_banques: number;
  total_actifs: number;
}

interface PaginationMeta {
  total: number;
  from: number;
  to: number;
  current_page: number;
  last_page: number;
  per_page: number;
}

interface EmfListResponse {
  data: EmfWithCount[];
  meta: PaginationMeta;
  stats: EmfStats;
}

interface EmfUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface EmfEvolution {
  mois: string;
  nouveaux: number;
  actifs: number;
}

interface EmfDetailStats {
  contrats_actifs: number;
  montant_total_assure: number;
  sinistres_en_cours: number;
  taux_sinistralite: number;
  evolution?: EmfEvolution[];
  utilisateurs?: EmfUser[];
}

export const emfService = {
  /**
   * Récupère la liste de tous les EMF avec filtres et pagination
   */
  getAll: async (params?: EmfSearchParams): Promise<EmfListResponse> => {
    const response = await api.get<EmfListResponse>('/emfs', { params });
    return response.data;
  },

  /**
   * Récupère un EMF par son ID
   */
  getById: async (id: number) => {
    const response = await api.get<{ data: Emf }>(`/emfs/${id}`);
    return response.data;
  },

  /**
   * Crée un nouvel EMF
   */
  create: async (data: Partial<Emf>) => {
    const response = await api.post<{ data: Emf }>('/emfs', data);
    return response.data;
  },

  /**
   * Met à jour un EMF existant
   */
  update: async (id: number, data: Partial<Emf>) => {
    const response = await api.put<{ data: Emf }>(`/emfs/${id}`, data);
    return response.data;
  },

  /**
   * Supprime un EMF
   */
  delete: async (id: number) => {
    const response = await api.delete(`/emfs/${id}`);
    return response.data;
  },

  /**
   * Récupère les statistiques détaillées d'un EMF
   */
  getStats: async (id: number) => {
    const response = await api.get<{ data: EmfDetailStats }>(`/emfs/${id}/statistiques`);
    return response.data;
  },
};

// Export des interfaces pour réutilisation
export type {
  EmfSearchParams,
  EmfWithCount,
  EmfStats,
  PaginationMeta,
  EmfListResponse,
  EmfUser,
  EmfEvolution,
  EmfDetailStats,
};
