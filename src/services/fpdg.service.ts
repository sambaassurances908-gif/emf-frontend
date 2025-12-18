// src/services/fpdg.service.ts

import api from '@/lib/api';

/**
 * Types pour le service FPDG
 */
export interface FpdgDashboardStats {
  sinistres: {
    total: number;
    en_cours: number;
    a_valider: number;
    a_cloturer: number;
    clos_ce_mois: number;
  };
  quittances: {
    total_en_attente: number;
    montant_a_valider: number;
    montant_a_payer: number;
    validees_ce_mois: number;
    payees_ce_mois: number;
  };
  finance: {
    cotisations_totales: number;
    primes_collectees: number;
    montant_indemnise: number;
    taux_reglement: number;
  };
  par_emf: Array<{
    emf_id: number;
    sigle: string;
    sinistres_en_cours: number;
    quittances_en_attente: number;
    montant_a_traiter: number;
  }>;
}

export interface SinistreAValider {
  id: number;
  reference: string;
  type_sinistre: string;
  contrat_type: string;
  emf_sigle: string;
  assure_nom: string;
  date_declaration: string;
  capital_restant_du: number;
  statut: string;
  quittances_count: number;
}

export interface SinistreACloturer {
  id: number;
  reference: string;
  type_sinistre: string;
  contrat_type: string;
  emf_sigle: string;
  assure_nom: string;
  date_declaration: string;
  montant_total_indemnise: number;
  quittances_payees: number;
  quittances_total: number;
  peut_cloturer: boolean;
}

export interface QuittanceATraiter {
  id: number;
  sinistre_id: number;
  sinistre_reference: string;
  reference: string;
  type: string;
  montant: number;
  statut: 'en_attente' | 'validee' | 'payee';
  emf_sigle: string;
  beneficiaire: string;
  date_creation: string;
  date_echeance?: string;
  jours_restants?: number;
  niveau_urgence?: 'normal' | 'urgent' | 'critique';
}

/**
 * Service API pour l'espace FPDG
 * Le FPDG a accès à toutes les fonctionnalités sinistres + comptabilité
 */
export const fpdgService = {
  /**
   * Récupérer le dashboard FPDG avec statistiques complètes
   */
  getDashboard: async (): Promise<{ success: boolean; data: FpdgDashboardStats }> => {
    // Utilise le dashboard stats global + données comptable
    const [statsResponse, comptableResponse] = await Promise.all([
      api.get('/dashboard/statistiques'),
      api.get('/comptable/dashboard')
    ]);
    
    const stats = statsResponse.data?.data || {};
    const comptable = comptableResponse.data?.data || {};
    
    return {
      success: true,
      data: {
        sinistres: {
          total: stats.total_sinistres || 0,
          en_cours: stats.sinistres_en_cours || 0,
          a_valider: stats.sinistres_a_valider || 0,
          a_cloturer: stats.sinistres_a_cloturer || 0,
          clos_ce_mois: stats.sinistres_clos_mois || 0,
        },
        quittances: {
          total_en_attente: comptable.resume?.quittances_a_payer || 0,
          montant_a_valider: comptable.resume?.montant_a_valider || 0,
          montant_a_payer: comptable.resume?.montant_total_a_payer || 0,
          validees_ce_mois: comptable.mois_en_cours?.quittances_validees || 0,
          payees_ce_mois: comptable.mois_en_cours?.nombre_paiements || 0,
        },
        finance: {
          cotisations_totales: stats.cotisations_totales || 0,
          primes_collectees: stats.primes_collectees || 0,
          montant_indemnise: stats.montant_total_indemnise || 0,
          taux_reglement: stats.taux_reglement || 0,
        },
        par_emf: Object.entries(stats.details_par_type || {}).map(([key, value]: [string, any]) => ({
          emf_id: getEmfIdFromKey(key),
          sigle: key.toUpperCase().replace('_EMF', ''),
          sinistres_en_cours: value.sinistres_en_cours || 0,
          quittances_en_attente: value.quittances_en_attente || 0,
          montant_a_traiter: value.montant_a_traiter || 0,
        })),
      }
    };
  },

  /**
   * Récupérer les sinistres à valider (avec quittances en attente de validation)
   */
  getSinistresAValider: async (params?: {
    emf_id?: number;
    page?: number;
    per_page?: number;
  }): Promise<{ success: boolean; data: SinistreAValider[]; meta?: any }> => {
    const response = await api.get('/sinistres', {
      params: {
        ...params,
        statut: 'en_cours',
        has_quittances_a_valider: true,
      }
    });
    return response.data;
  },

  /**
   * Récupérer les sinistres pouvant être clôturés
   */
  getSinistresACloturer: async (params?: {
    emf_id?: number;
    page?: number;
    per_page?: number;
  }): Promise<{ success: boolean; data: SinistreACloturer[]; meta?: any }> => {
    const response = await api.get('/sinistres', {
      params: {
        ...params,
        peut_cloturer: true,
      }
    });
    return response.data;
  },

  /**
   * Récupérer toutes les quittances à traiter (validation + paiement)
   * Utilise l'endpoint /comptable/quittances-en-attente qui retourne les quittances validées
   */
  getQuittancesATraiter: async (params?: {
    emf_id?: number;
    statut?: 'en_attente' | 'validee';
    page?: number;
    per_page?: number;
  }): Promise<{ success: boolean; data: QuittanceATraiter[]; meta?: any }> => {
    const response = await api.get('/comptable/quittances-en-attente', { params });
    return response.data;
  },

  /**
   * Récupérer TOUTES les quittances (tous statuts confondus)
   * Utilise l'endpoint /fpdg/quittances qui retourne toutes les quittances
   */
  getAllQuittances: async (params?: {
    emf_id?: number;
    statut?: string;
    page?: number;
    per_page?: number;
  }): Promise<{ success: boolean; data: QuittanceATraiter[]; meta?: any }> => {
    try {
      // Essayer d'abord l'endpoint FPDG dédié
      const response = await api.get('/fpdg/quittances', { params });
      return response.data;
    } catch (error: any) {
      // Fallback: récupérer via l'endpoint comptable avec tous les statuts
      console.log('Fallback vers /comptable/quittances-en-attente');
      const response = await api.get('/comptable/quittances-en-attente', { 
        params: { ...params, tous_statuts: true } 
      });
      return response.data;
    }
  },

  /**
   * Valider une quittance
   * POST /api/sinistres/{sinistreId}/quittances/{quittanceId}/valider
   */
  validerQuittance: async (sinistreId: number, quittanceId: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/sinistres/${sinistreId}/quittances/${quittanceId}/valider`);
    return response.data;
  },

  /**
   * Payer une quittance
   * POST /api/sinistres/{sinistreId}/quittances/{quittanceId}/payer
   */
  payerQuittance: async (
    sinistreId: number, 
    quittanceId: number,
    data?: {
      mode_paiement?: string;
      reference_paiement?: string;
      commentaire?: string;
    }
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/sinistres/${sinistreId}/quittances/${quittanceId}/payer`, data);
    return response.data;
  },

  /**
   * Clôturer un sinistre (action irréversible)
   * POST /api/sinistres/{id}/cloturer
   */
  cloturerSinistre: async (
    sinistreId: number,
    data?: {
      motif_cloture?: string;
      commentaire?: string;
    }
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/sinistres/${sinistreId}/cloturer`, data);
    return response.data;
  },

  /**
   * Créer un sinistre
   */
  creerSinistre: async (data: any): Promise<{ success: boolean; data: any }> => {
    const response = await api.post('/sinistres', data);
    return response.data;
  },

  /**
   * Modifier un sinistre
   */
  modifierSinistre: async (id: number, data: any): Promise<{ success: boolean; data: any }> => {
    const response = await api.put(`/sinistres/${id}`, data);
    return response.data;
  },

  /**
   * Récupérer le rapport financier complet
   */
  getRapportFinancier: async (params: {
    date_debut: string;
    date_fin: string;
    emf_id?: number;
  }): Promise<{ success: boolean; data: any }> => {
    const response = await api.get('/comptable/rapport-financier', { params });
    return response.data;
  },

  /**
   * Exporter les données (sinistres ou paiements)
   */
  exportData: async (type: 'sinistres' | 'paiements', params?: any): Promise<Blob> => {
    const endpoint = type === 'sinistres' 
      ? '/sinistres/export'
      : '/comptable/export-paiements';
    const response = await api.get(endpoint, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};

// Helper pour obtenir l'ID EMF depuis la clé
function getEmfIdFromKey(key: string): number {
  const mapping: Record<string, number> = {
    'bamboo_emf': 1,
    'bamboo': 1,
    'cofidec': 2,
    'bceg': 3,
    'edg': 4,
    'sodec': 5,
  };
  return mapping[key.toLowerCase()] || 0;
}

export default fpdgService;
