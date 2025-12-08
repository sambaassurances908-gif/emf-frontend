import api from '../lib/api';
import { 
  ContratBamboo, 
  ContratCofidec, 
  ContratBceg, 
  ContratEdg, 
  ContratSodec 
} from '@/types/contrat.types';

// Interfaces pour les paramètres
interface ContratSearchParams {
  search?: string;
  statut?: string;
  emf_id?: string;
  type?: string;
  page?: number;
  per_page?: number;
}

interface SimulationBambooParams {
  montant_pret: number;
  duree_mois: number;
  avec_perte_emploi?: boolean;
}

interface SimulationCofidecParams {
  montant_pret: number;
  duree_mois: number;
  categorie: string;
  avec_perte_emploi?: boolean;
}

interface SimulationBcegParams {
  montant_pret: number;
  duree_mois: number;
}

interface SimulationEdgParams {
  montant_pret: number;
  duree_mois: number;
  est_vip: boolean;
}

interface SimulationSodecParams {
  montant_pret: number;
  duree_mois: number;
  categorie: string;
  option_prevoyance: 'option_a' | 'option_b';
  avec_perte_emploi?: boolean;
}

interface ComparaisonOptionsParams {
  montant_pret: number;
  nombre_adultes: number;
  nombre_enfants: number;
}

export const contratService = {
  searchByPolice: async (numeroPolice: string) => {
    const response = await api.get('/contrats/search', {
      params: { numero_police: numeroPolice },
    });
    return response.data;
  },

  getAll: async (params?: ContratSearchParams) => {
    const response = await api.get('/contrats', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/contrats/${id}`);
    return response.data;
  },

  // BAMBOO EMF
  bamboo: {
    getAll: async (params?: ContratSearchParams) => {
      const response = await api.get('/bamboo-emf/contrats', { params });
      return response.data;
    },
    getById: async (id: number) => {
      const response = await api.get(`/bamboo-emf/contrats/${id}`);
      return response.data;
    },
    create: async (data: Partial<ContratBamboo>) => {
      const response = await api.post('/bamboo-emf/contrats', data);
      return response.data;
    },
    update: async (id: number, data: Partial<ContratBamboo>) => {
      const response = await api.put(`/bamboo-emf/contrats/${id}`, data);
      return response.data;
    },
    delete: async (id: number) => {
      const response = await api.delete(`/bamboo-emf/contrats/${id}`);
      return response.data;
    },
    simuler: async (data: SimulationBambooParams) => {
      const response = await api.post('/bamboo-emf/simuler-tarification', data);
      return response.data;
    },
    stats: async () => {
      const response = await api.get('/bamboo-emf/statistiques');
      return response.data;
    },
  },

  // COFIDEC
  cofidec: {
    getAll: async (params?: ContratSearchParams) => {
      const response = await api.get('/cofidec/contrats', { params });
      return response.data;
    },
    getById: async (id: number) => {
      const response = await api.get(`/cofidec/contrats/${id}`);
      return response.data;
    },
    create: async (data: Partial<ContratCofidec>) => {
      const response = await api.post('/cofidec/contrats', data);
      return response.data;
    },
    update: async (id: number, data: Partial<ContratCofidec>) => {
      const response = await api.put(`/cofidec/contrats/${id}`, data);
      return response.data;
    },
    delete: async (id: number) => {
      const response = await api.delete(`/cofidec/contrats/${id}`);
      return response.data;
    },
    simuler: async (data: SimulationCofidecParams) => {
      const response = await api.post('/cofidec/simuler-tarification', data);
      return response.data;
    },
    stats: async () => {
      const response = await api.get('/cofidec/statistiques');
      return response.data;
    },
  },

  // BCEG
  bceg: {
    getAll: async (params?: ContratSearchParams) => {
      const response = await api.get('/bceg/contrats', { params });
      return response.data;
    },
    getById: async (id: number) => {
      const response = await api.get(`/bceg/contrats/${id}`);
      return response.data;
    },
    create: async (data: Partial<ContratBceg>) => {
      const response = await api.post('/bceg/contrats', data);
      return response.data;
    },
    update: async (id: number, data: Partial<ContratBceg>) => {
      const response = await api.put(`/bceg/contrats/${id}`, data);
      return response.data;
    },
    delete: async (id: number) => {
      const response = await api.delete(`/bceg/contrats/${id}`);
      return response.data;
    },
    simuler: async (data: SimulationBcegParams) => {
      const response = await api.post('/bceg/simuler-tarification', data);
      return response.data;
    },
    stats: async () => {
      const response = await api.get('/bceg/statistiques');
      return response.data;
    },
  },

  // EDG
  edg: {
    getAll: async (params?: ContratSearchParams) => {
      const response = await api.get('/edg/contrats', { params });
      return response.data;
    },
    getById: async (id: number) => {
      const response = await api.get(`/edg/contrats/${id}`);
      return response.data;
    },
    create: async (data: Partial<ContratEdg>) => {
      const response = await api.post('/edg/contrats', data);
      return response.data;
    },
    update: async (id: number, data: Partial<ContratEdg>) => {
      const response = await api.put(`/edg/contrats/${id}`, data);
      return response.data;
    },
    delete: async (id: number) => {
      const response = await api.delete(`/edg/contrats/${id}`);
      return response.data;
    },
    simuler: async (data: SimulationEdgParams) => {
      const response = await api.post('/edg/simuler-tarification', data);
      return response.data;
    },
    stats: async () => {
      const response = await api.get('/edg/statistiques');
      return response.data;
    },
  },

  // SODEC
  sodec: {
    getAll: async (params?: ContratSearchParams) => {
      const response = await api.get('/sodec/contrats', { params });
      return response.data;
    },
    getById: async (id: number) => {
      const response = await api.get(`/sodec/contrats/${id}`);
      return response.data;
    },
    create: async (data: Partial<ContratSodec>) => {
      const response = await api.post('/sodec/contrats', data);
      return response.data;
    },
    update: async (id: number, data: Partial<ContratSodec>) => {
      const response = await api.put(`/sodec/contrats/${id}`, data);
      return response.data;
    },
    delete: async (id: number) => {
      const response = await api.delete(`/sodec/contrats/${id}`);
      return response.data;
    },
    simuler: async (data: SimulationSodecParams) => {
      const response = await api.post('/sodec/simuler-tarification', data);
      return response.data;
    },
    comparerOptions: async (data: ComparaisonOptionsParams) => {
      const response = await api.post('/sodec/comparer-options', data);
      return response.data;
    },
    stats: async () => {
      const response = await api.get('/sodec/statistiques');
      return response.data;
    },
  },
};
