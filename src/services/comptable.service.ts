// src/services/comptable.service.ts

import api from '@/lib/api';
import {
  ComptableDashboardResponse,
  QuittanceEnAttente,
  HistoriquePaiement,
  HistoriquePaiementParams,
  RapportFinancier,
  RapportFinancierParams,
  AlerteDelai,
  ExportPaiementsParams,
} from '@/types/comptable.types';

/**
 * Service API pour l'espace comptable
 * Endpoints: /api/comptable/*
 */
export const comptableService = {
  /**
   * Récupérer le dashboard comptable
   * GET /api/comptable/dashboard
   */
  getDashboard: async (emfId?: number): Promise<ComptableDashboardResponse> => {
    const params = emfId ? { emf_id: emfId } : {};
    const response = await api.get('/comptable/dashboard', { params });
    return response.data;
  },

  /**
   * Récupérer les quittances en attente de paiement
   * GET /api/comptable/quittances-en-attente
   */
  getQuittancesEnAttente: async (params?: {
    emf_id?: number;
    urgentes_seulement?: boolean;
    page?: number;
    per_page?: number;
  }): Promise<{ success: boolean; data: QuittanceEnAttente[]; meta?: any }> => {
    const response = await api.get('/comptable/quittances-en-attente', { params });
    return response.data;
  },

  /**
   * Récupérer l'historique des paiements
   * GET /api/comptable/historique-paiements
   */
  getHistoriquePaiements: async (
    params?: HistoriquePaiementParams
  ): Promise<{ success: boolean; data: HistoriquePaiement[]; meta?: any }> => {
    const response = await api.get('/comptable/historique-paiements', { params });
    return response.data;
  },

  /**
   * Récupérer le rapport financier par période
   * GET /api/comptable/rapport-financier
   */
  getRapportFinancier: async (
    params: RapportFinancierParams
  ): Promise<{ success: boolean; data: RapportFinancier }> => {
    const response = await api.get('/comptable/rapport-financier', { params });
    return response.data;
  },

  /**
   * Récupérer les alertes de délais de paiement
   * GET /api/comptable/alertes-delais
   */
  getAlertesDelais: async (emfId?: number): Promise<{
    success: boolean;
    data: {
      urgentes: AlerteDelai[];
      proches_echeance: AlerteDelai[];
      total_alertes: number;
    };
  }> => {
    const params = emfId ? { emf_id: emfId } : {};
    const response = await api.get('/comptable/alertes-delais', { params });
    return response.data;
  },

  /**
   * Exporter les paiements en CSV/Excel
   * GET /api/comptable/export-paiements
   */
  exportPaiements: async (params?: ExportPaiementsParams): Promise<Blob> => {
    const response = await api.get('/comptable/export-paiements', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Télécharger l'export des paiements
   */
  downloadExport: async (params?: ExportPaiementsParams) => {
    const blob = await comptableService.exportPaiements(params);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const format = params?.format || 'csv';
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `paiements_${dateStr}.${format}`);
    
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Récupérer les statistiques globales comptables
   */
  getStats: async (emfId?: number): Promise<{
    success: boolean;
    data: {
      ce_mois: {
        paiements: number;
        montant: number;
      };
      mois_precedent: {
        paiements: number;
        montant: number;
      };
      evolution_pourcent: number;
      quittances_en_retard: number;
    };
  }> => {
    const params = emfId ? { emf_id: emfId } : {};
    const response = await api.get('/comptable/stats', { params });
    return response.data;
  },
};

export default comptableService;
