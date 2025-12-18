import api from '../lib/api';
import { 
  Sinistre, 
  SinistreStats, 
  SinistreCreatePayload, 
  SinistreCreateResponse, 
  SinistreSearchParams,
  SinistreDetailResponse,
  Quittance,
  ResumeReglement,
  PaiementQuittancePayload
} from '@/types/sinistre.types';
import { PaginatedResponse } from '@/types/common.types';

export const sinistreService = {
  /**
   * Récupère la liste des sinistres avec filtres et pagination
   */
  getAll: async (params?: SinistreSearchParams): Promise<PaginatedResponse<Sinistre>> => {
    const response = await api.get<{ success: boolean; data: PaginatedResponse<Sinistre> }>('/sinistres', { params });
    return response.data.data;
  },

  /**
   * Récupère un sinistre par son ID avec quittances et délai de paiement
   */
  getById: async (id: number): Promise<SinistreDetailResponse> => {
    const response = await api.get<SinistreDetailResponse>(`/sinistres/${id}`);
    console.log(`🔍 Réponse sinistre ${id}:`, JSON.stringify(response.data, null, 2));
    return response.data;
  },

  /**
   * Crée un nouveau sinistre avec upload de documents
   * Utilise FormData pour l'envoi multipart
   * 
   * Correspond exactement à SinistreController@store
   */
  create: async (payload: SinistreCreatePayload): Promise<SinistreCreateResponse> => {
    const formData = new FormData();
    
    // Champs obligatoires (required par le backend)
    formData.append('contrat_type', payload.contrat_type);
    formData.append('contrat_id', payload.contrat_id.toString());
    formData.append('type_sinistre', payload.type_sinistre);
    formData.append('date_sinistre', payload.date_sinistre);
    
    // capital_restant_du - s'assurer que c'est un nombre valide
    const capitalRestantDu = typeof payload.capital_restant_du === 'string' 
      ? parseFloat(payload.capital_restant_du) 
      : payload.capital_restant_du;
    formData.append('capital_restant_du', capitalRestantDu.toString());
    
    // Champs optionnels (nullable) - NE PAS envoyer si vide/undefined
    if (payload.circonstances && payload.circonstances.trim()) {
      formData.append('circonstances', payload.circonstances.trim());
    }
    if (payload.lieu_sinistre && payload.lieu_sinistre.trim()) {
      formData.append('lieu_sinistre', payload.lieu_sinistre.trim());
    }
    if (payload.montant_reclame !== undefined && payload.montant_reclame !== null && payload.montant_reclame > 0) {
      formData.append('montant_reclame', payload.montant_reclame.toString());
    }
    
    // Documents PDF (tous optionnels)
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
      if (file instanceof File) {
        formData.append(field, file);
      }
    });

    // Log pour debug
    console.log('📤 Sinistre FormData:', {
      contrat_type: payload.contrat_type,
      contrat_id: payload.contrat_id,
      type_sinistre: payload.type_sinistre,
      date_sinistre: payload.date_sinistre,
      capital_restant_du: capitalRestantDu,
      circonstances: payload.circonstances,
      lieu_sinistre: payload.lieu_sinistre,
      montant_reclame: payload.montant_reclame,
      documents: documentFields.filter(f => payload[f] instanceof File),
    });
    
    // POST sans emf_id dans les params (le backend le récupère du contrat)
    const response = await api.post<SinistreCreateResponse>('/sinistres', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: {}, // Forcer des params vides pour éviter l'ajout automatique de emf_id
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
   * Télécharge un document d'un sinistre via l'API (retourne un blob)
   */
  downloadDocument: async (sinistreId: number, typeDocument: string): Promise<Blob> => {
    const response = await api.get(`/sinistres/${sinistreId}/documents/${typeDocument}/telecharger`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Télécharge un document par son chemin de fichier (via l'API pour contourner CORS/symlink)
   */
  downloadDocumentByPath: async (sinistreId: number, filePath: string): Promise<Blob> => {
    const response = await api.post(`/sinistres/${sinistreId}/documents/download`, {
      file_path: filePath,
    }, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Récupère l'URL de téléchargement d'un document (URL signée ou directe)
   */
  getDocumentUrl: async (sinistreId: number, typeDocument: string): Promise<{ url: string; expires_at?: string }> => {
    const response = await api.get<{ success: boolean; data: { url: string; expires_at?: string } }>(
      `/sinistres/${sinistreId}/documents/${typeDocument}/url`
    );
    return response.data.data;
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
  getStats: async (params?: { emf_id?: number; inclure_archives?: boolean }): Promise<SinistreStats> => {
    const response = await api.get<{ success: boolean; data: SinistreStats }>('/sinistres/statistiques/global', { params });
    return response.data.data;
  },

  // ==========================================
  // RÈGLEMENT ET QUITTANCES (Règles B & C)
  // ==========================================

  /**
   * Calculer le règlement et générer les quittances
   */
  calculerReglement: async (id: number): Promise<ResumeReglement> => {
    const response = await api.get<{ success: boolean; data: ResumeReglement }>(`/sinistres/${id}/reglement`);
    return response.data.data;
  },

  /**
   * Créer une quittance pour un sinistre
   */
  creerQuittance: async (sinistreId: number, data: {
    type: string;
    beneficiaire: string;
    beneficiaire_type?: 'emf' | 'personne';
    montant: number;
    description?: string;
  }): Promise<{ success: boolean; message: string; data: Quittance }> => {
    // Déterminer beneficiaire_type automatiquement si non fourni
    const beneficiaireType = data.beneficiaire_type || 
      (data.type === 'capital_sans_interets' || data.type === 'capital_restant_du' ? 'emf' : 'personne');
    
    const payload = {
      type: data.type,
      beneficiaire_type: beneficiaireType,
      beneficiaire_nom: data.beneficiaire,
      montant: data.montant,
      description: data.description
    };
    console.log('📤 Payload creerQuittance:', payload);
    const response = await api.post<{ success: boolean; message: string; data: Quittance }>(
      `/sinistres/${sinistreId}/quittances`,
      payload
    );
    return response.data;
  },

  /**
   * Générer les quittances pour un sinistre (EMF + Prévoyance si applicable)
   */
  genererQuittances: async (sinistreId: number, quittances: Array<{
    type: string;
    beneficiaire: string;
    beneficiaire_type?: 'emf' | 'personne';
    montant: number;
    description?: string;
  }>): Promise<{ success: boolean; message: string; data: { quittances: Quittance[]; montant_total: number } }> => {
    // Le backend attend beneficiaire_nom et beneficiaire_type
    const payload = quittances.map(q => {
      // Déterminer beneficiaire_type automatiquement si non fourni
      const beneficiaireType = q.beneficiaire_type || 
        (q.type === 'capital_sans_interets' || q.type === 'capital_restant_du' ? 'emf' : 'personne');
      
      return {
        type: q.type,
        beneficiaire_type: beneficiaireType,
        beneficiaire_nom: q.beneficiaire,
        montant: q.montant,
        description: q.description
      };
    });
    console.log('📤 Payload genererQuittances:', payload);
    const response = await api.post<{ success: boolean; message: string; data: { quittances: Quittance[]; montant_total: number } }>(
      `/sinistres/${sinistreId}/quittances/generer`,
      { quittances: payload }
    );
    return response.data;
  },

  /**
   * Supprimer une quittance (uniquement si statut = 'en_attente')
   */
  supprimerQuittance: async (sinistreId: number, quittanceId: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/sinistres/${sinistreId}/quittances/${quittanceId}`
    );
    return response.data;
  },

  /**
   * Liste des quittances d'un sinistre
   * GET /api/sinistres/{sinistreId}/quittances
   */
  getQuittances: async (id: number): Promise<Quittance[]> => {
    const response = await api.get<{ 
      success: boolean; 
      data: { 
        sinistre_id: number;
        numero_sinistre: string;
        quittances: Quittance[];
        resume?: ResumeReglement;
      } 
    }>(`/sinistres/${id}/quittances`);
    console.log(`📋 GET /sinistres/${id}/quittances response:`, response.data);
    return response.data.data.quittances || [];
  },

  /**
   * Détail d'une quittance avec transitions possibles
   * GET /api/sinistres/{sinistreId}/quittances/{quittanceId}
   */
  getQuittanceDetail: async (sinistreId: number, quittanceId: number): Promise<{
    quittance: Quittance;
    sinistre: { id: number; numero_sinistre: string; statut: string };
    transitions_possibles: Array<{
      statut: string;
      label: string;
      action: 'valider' | 'payer' | 'annuler' | 'statut';
    }>;
  }> => {
    const response = await api.get<{ success: boolean; data: any }>(
      `/sinistres/${sinistreId}/quittances/${quittanceId}`
    );
    return response.data.data;
  },

  /**
   * Valider une quittance (ADMIN, FPDG, GESTIONNAIRE)
   * POST /api/sinistres/{sinistreId}/quittances/{quittanceId}/valider
   */
  validerQuittance: async (sinistreId: number, quittanceId: number): Promise<{ success: boolean; message: string; data: Quittance }> => {
    const response = await api.post<{ success: boolean; message: string; data: Quittance }>(
      `/sinistres/${sinistreId}/quittances/${quittanceId}/valider`
    );
    return response.data;
  },

  /**
   * Payer une quittance (ADMIN, FPDG, COMPTABLE)
   * POST /api/sinistres/{sinistreId}/quittances/{quittanceId}/payer
   */
  payerQuittance: async (
    sinistreId: number, 
    quittanceId: number,
    paiement: PaiementQuittancePayload
  ): Promise<{ success: boolean; message: string; data: Quittance }> => {
    const response = await api.post<{ success: boolean; message: string; data: Quittance }>(
      `/sinistres/${sinistreId}/quittances/${quittanceId}/payer`,
      paiement
    );
    return response.data;
  },

  /**
   * Annuler une quittance
   * POST /api/sinistres/{sinistreId}/quittances/{quittanceId}/annuler
   */
  annulerQuittance: async (
    sinistreId: number,
    quittanceId: number,
    motif?: string
  ): Promise<{ success: boolean; message: string; data: Quittance }> => {
    const response = await api.post<{ success: boolean; message: string; data: Quittance }>(
      `/sinistres/${sinistreId}/quittances/${quittanceId}/annuler`,
      { motif }
    );
    return response.data;
  },

  /**
   * Modifier le statut d'une quittance manuellement
   * PUT /api/sinistres/{sinistreId}/quittances/{quittanceId}/statut
   */
  modifierStatutQuittance: async (
    sinistreId: number,
    quittanceId: number,
    data: {
      statut: 'en_attente' | 'validee' | 'payee' | 'annulee';
      observations?: string;
      mode_paiement?: string;
      numero_transaction?: string;
    }
  ): Promise<{ success: boolean; message: string; data: Quittance }> => {
    const response = await api.put<{ success: boolean; message: string; data: Quittance }>(
      `/sinistres/${sinistreId}/quittances/${quittanceId}/statut`,
      data
    );
    return response.data;
  },

  // ==========================================
  // CLÔTURE ET ARCHIVAGE (Règle E)
  // ==========================================

  /**
   * Clôturer un sinistre (ADMIN, FPDG uniquement)
   */
  cloturer: async (id: number, format: 'json' | 'pdf' = 'json'): Promise<{ success: boolean; message: string; data: Sinistre }> => {
    const response = await api.post<{ success: boolean; message: string; data: Sinistre }>(
      `/sinistres/${id}/cloturer`, 
      { format }
    );
    return response.data;
  },

  /**
   * Liste des sinistres archivés
   */
  getArchives: async (params?: {
    emf_id?: number;
    date_debut?: string;
    date_fin?: string;
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<Sinistre>> => {
    const response = await api.get<{ success: boolean; data: PaginatedResponse<Sinistre> }>('/sinistres/archives', { params });
    return response.data.data;
  },

  /**
   * Télécharger l'archive d'un sinistre clôturé
   */
  telechargerArchive: async (id: number): Promise<Blob> => {
    const response = await api.get(`/sinistres/${id}/archive/telecharger`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // ==========================================
  // Méthodes legacy pour compatibilité
  // ==========================================
  
  /**
   * Valider un sinistre (passage de en_cours → en_instruction)
   * Pour passer à en_reglement, utiliser passerEnReglement()
   */
  valider: async (id: number, data: { montant_accorde: number; observations?: string }) => {
    const response = await api.put(`/sinistres/${id}`, {
      statut: 'en_instruction',
      montant_indemnisation: data.montant_accorde,
      observations: data.observations,
    });
    return response.data;
  },

  /**
   * Passer un sinistre en instruction → en_reglement
   */
  passerEnReglement: async (id: number, data?: { observations?: string }) => {
    const response = await api.put(`/sinistres/${id}`, {
      statut: 'en_reglement',
      ...data,
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
