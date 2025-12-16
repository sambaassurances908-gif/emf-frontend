// src/types/comptable.types.ts

import { Quittance, ModePaiement } from './sinistre.types';

/**
 * Résumé du dashboard comptable
 */
export interface ComptableDashboardResume {
  quittances_a_payer: number;
  montant_total_a_payer: number;
  quittances_urgentes: number;
  quittances_proches_echeance: number;
}

/**
 * Statistiques du jour/mois
 */
export interface ComptablePeriodeStats {
  nombre_paiements: number;
  montant_total: number;
}

/**
 * Alerte de délai de paiement
 */
export interface AlerteDelai {
  quittance_id: number;
  reference: string;
  sinistre_numero: string;
  beneficiaire: string;
  montant: number;
  jours_restants: number;
  date_echeance: string;
  niveau: 'urgente' | 'proche_echeance' | 'normale';
}

/**
 * Dashboard comptable complet
 */
export interface ComptableDashboardData {
  resume: ComptableDashboardResume;
  aujourd_hui: ComptablePeriodeStats;
  mois_en_cours: ComptablePeriodeStats;
  quittances_en_attente: QuittanceEnAttente[];
  alertes: {
    urgentes: AlerteDelai[];
    proches_echeance: AlerteDelai[];
  };
}

/**
 * Réponse du dashboard comptable
 */
export interface ComptableDashboardResponse {
  success: boolean;
  data: ComptableDashboardData;
}

/**
 * Quittance en attente avec infos sinistre
 */
export interface QuittanceEnAttente extends Quittance {
  // Champs supplémentaires pour le comptable
  niveau_urgence?: 'critique' | 'urgent' | 'normal';
  date_echeance?: string;
  jours_restants?: number;
  emf_nom?: string;
  sinistre?: {
    id: number;
    numero_sinistre: string;
    nom_assure: string;
    type_sinistre: string;
    delai_paiement?: {
      jours_restants: number;
      depasse: boolean;
      date_echeance: string;
    };
  };
  emf?: {
    id: number;
    sigle: string;
    nom: string;
  };
}

/**
 * Historique de paiement
 */
export interface HistoriquePaiement {
  id: number;
  quittance_id: number;
  reference: string;
  sinistre_numero: string;
  beneficiaire: string;
  montant: number;
  mode_paiement: ModePaiement;
  numero_transaction?: string;
  date_paiement: string;
  paye_par: {
    id: number;
    name: string;
  };
  emf?: {
    id: number;
    sigle: string;
  };
}

/**
 * Paramètres de recherche historique
 */
export interface HistoriquePaiementParams {
  emf_id?: number;
  date_debut?: string;
  date_fin?: string;
  mode_paiement?: ModePaiement;
  page?: number;
  per_page?: number;
}

/**
 * Rapport financier par période
 */
export interface RapportFinancier {
  periode: {
    debut: string;
    fin: string;
  };
  resume: {
    total_paiements: number;
    montant_total: number;
    nombre_sinistres_regles: number;
  };
  par_emf: RapportFinancierEmf[];
  par_type_quittance: {
    type: string;
    nombre: number;
    montant: number;
  }[];
  par_mode_paiement: {
    mode: ModePaiement;
    nombre: number;
    montant: number;
  }[];
  evolution_mensuelle?: {
    mois: string;
    nombre: number;
    montant: number;
  }[];
}

/**
 * Rapport financier par EMF
 */
export interface RapportFinancierEmf {
  emf_id: number;
  emf_sigle: string;
  emf_nom: string;
  nombre_paiements: number;
  montant_total: number;
  quittances_en_attente: number;
  montant_en_attente: number;
}

/**
 * Paramètres du rapport financier
 */
export interface RapportFinancierParams {
  emf_id?: number;
  date_debut: string;
  date_fin: string;
  grouper_par?: 'jour' | 'semaine' | 'mois';
}

/**
 * Paramètres d'export
 */
export interface ExportPaiementsParams {
  emf_id?: number;
  date_debut?: string;
  date_fin?: string;
  format?: 'csv' | 'xlsx' | 'pdf';
}

/**
 * Configuration des niveaux d'alerte
 */
export const ALERTE_NIVEAUX = {
  urgente: {
    label: 'Urgent',
    description: 'Délai dépassé',
    color: 'red',
    bgClass: 'bg-red-100',
    textClass: 'text-red-800',
    borderClass: 'border-red-300',
  },
  proche_echeance: {
    label: 'Proche échéance',
    description: 'Moins de 3 jours',
    color: 'yellow',
    bgClass: 'bg-yellow-100',
    textClass: 'text-yellow-800',
    borderClass: 'border-yellow-300',
  },
  normale: {
    label: 'Normal',
    description: 'Dans les délais',
    color: 'green',
    bgClass: 'bg-green-100',
    textClass: 'text-green-800',
    borderClass: 'border-green-300',
  },
} as const;
