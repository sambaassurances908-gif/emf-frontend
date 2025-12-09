import api from '../lib/api';
import { Sinistre, SinistreStats, SinistreCreatePayload, SinistreCreateResponse, ContratType } from '@/types/sinistre.types';
import { PaginatedResponse } from '@/types/common.types';

interface SinistreSearchParams {
  search?: string;
  statut?: string;
  type_sinistre?: string;
  contrat_type?: ContratType;
  contrat_id?: number;
  emf_id?: number;
  date_debut?: string;
  date_fin?: string;
  page?: number;
  per_page?: number;
}

export const sinistreService = {
  /**
   * Récupère la liste des sinistres avec filtres et pagination
   */
  getAll: async (params?: SinistreSearchParams): Promise<PaginatedResponse<Sinistre>> => {
    const response = await api.get<{ success: boolean; data: PaginatedResponse<Sinistre> }>('/sinistres', { params });
    return response.data.data;
  },

  /**
   * Récupère un sinistre par son ID
   */
  getById: async (id: number): Promise<{ data: Sinistre; documents_complets: boolean; delai_traitement_ecoule: string | number }> => {
    const response = await api.get<{ success: boolean; data: Sinistre; documents_complets: boolean; delai_traitement_ecoule: string | number }>(`/sinistres/${id}`);
    return response.data;
  },

  /**
   * Crée un nouveau sinistre avec upload de documents
   * Utilise FormData pour l'envoi multipart
   */
  create: async (payload: SinistreCreatePayload): Promise<SinistreCreateResponse> => {
    const formData = new FormData();
    
    // Champs obligatoires
    formData.append('contrat_type', payload.contrat_type);
    formData.append('contrat_id', payload.contrat_id.toString());
    formData.append('type_sinistre', payload.type_sinistre);
    formData.append('date_sinistre', payload.date_sinistre);
    formData.append('nom_declarant', payload.nom_declarant);
    formData.append('prenom_declarant', payload.prenom_declarant);
    formData.append('qualite_declarant', payload.qualite_declarant);
    formData.append('telephone_declarant', payload.telephone_declarant);
    formData.append('capital_restant_du', payload.capital_restant_du.toString());
    
    // Champs optionnels texte
    if (payload.email_declarant) {
      formData.append('email_declarant', payload.email_declarant);
    }
    if (payload.circonstances) {
      formData.append('circonstances', payload.circonstances);
    }
    if (payload.lieu_sinistre) {
      formData.append('lieu_sinistre', payload.lieu_sinistre);
    }
    if (payload.montant_reclame) {
      formData.append('montant_reclame', payload.montant_reclame.toString());
    }
    
    // Documents PDF
    const documentFields = [
      'fichier_tableau_amortissement',
      'fichier_acte_deces',
      'fichier_certificat_arret_travail',
      'fichier_certificat_deces',
      'fichier_certificat_licenciement',
      'fichier_proces_verbal',
      'fichier_proces_verbal_faillite',
      'fichier_piece_identite',
      'fichier_certificat_heredite',
      'fichier_autres_documents',
    ] as const;
    
    documentFields.forEach((field) => {
      const file = payload[field];
      if (file) {
        formData.append(field, file);
      }
    });
    
    const response = await api.post<SinistreCreateResponse>('/sinistres', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  /**
   * Met à jour un sinistre existant
   */
  update: async (id: number, data: Partial<Sinistre>): Promise<{ success: boolean; data: Sinistre }> => {
    const response = await api.put<{ success: boolean; message: string; data: Sinistre }>(`/sinistres/${id}`, data);
    return response.data;
  },

  /**
   * Supprime un sinistre
   */
  delete: async (id: number) => {
    const response = await api.delete(`/sinistres/${id}`);
    return response.data;
  },

  /**
   * Upload un document pour un sinistre existant
   */
  uploadDocument: async (id: number, file: File, typeDocument: string, description?: string) => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type_document', typeDocument);
    if (description) {
      formData.append('description', description);
    }
    
    const response = await api.post(`/sinistres/${id}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Liste les documents d'un sinistre
   */
  getDocuments: async (id: number) => {
    const response = await api.get(`/sinistres/${id}/documents`);
    return response.data;
  },

  /**
   * Télécharge un document d'un sinistre
   */
  downloadDocument: async (sinistreId: number, typeDocument: string) => {
    const response = await api.get(`/sinistres/${sinistreId}/documents/${typeDocument}/telecharger`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Supprime un document d'un sinistre
   */
  deleteDocument: async (sinistreId: number, documentId: number) => {
    const response = await api.delete(`/sinistres/${sinistreId}/documents/${documentId}`);
    return response.data;
  },

  /**
   * Récupère les statistiques globales des sinistres
   */
  getStats: async (): Promise<SinistreStats> => {
    const response = await api.get<{ success: boolean; data: SinistreStats }>('/sinistres/statistiques/global');
    return response.data.data;
  },

  // ========================
  // Méthodes legacy pour compatibilité
  // ========================
  
  valider: async (id: number, data: { montant_accorde: number; observations?: string }) => {
    const response = await api.put(`/sinistres/${id}`, {
      statut: 'accepte',
      montant_indemnisation: data.montant_accorde,
      observations: data.observations,
    });
    return response.data;
  },

  rejeter: async (id: number, data: { motif_rejet: string }) => {
    const response = await api.put(`/sinistres/${id}`, {
      statut: 'rejete',
      motif_rejet: data.motif_rejet,
    });
    return response.data;
  },

  payer: async (id: number, data: { mode_paiement: string; reference_paiement: string }) => {
    const response = await api.put(`/sinistres/${id}`, {
      statut: 'paye',
      ...data,
    });
    return response.data;
  },
};
