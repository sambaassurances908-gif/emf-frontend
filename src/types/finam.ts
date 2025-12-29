// types/finam.ts

export interface FinamEmf {
  id: number
  raison_sociale: string
  sigle: string
  adresse?: string
  telephone?: string
  email?: string
}

export interface FinamContrat {
  id: number
  numero_police: string | null
  
  // Assuré
  nom: string
  prenom: string
  adresse: string | null
  ville: string | null
  telephone: string | null
  email: string | null
  
  // Catégorie
  categorie: 'Personnel FINAM' | 'Retraités'
  
  // Prêt
  montant_a_assurer: number
  duree_pret: number
  date_effet: string
  date_fin_echeance: string
  montant_mensualite: number
  taux_pret: number
  
  // Agence
  agence: string | null
  
  // Tarification (calculés par le backend)
  taux_garantie?: number
  prime_totale?: number
  
  // Bénéficiaire
  beneficiaire_nom: string | null
  beneficiaire_prenom: string | null
  beneficiaire_contact: string | null
  
  // Signatures
  signature_assure?: boolean
  signature_cachet_finam?: boolean
  signature_assureur?: boolean
  lieu_signature: string | null
  date_signature: string | null
  
  // Statut
  statut: 'en_attente' | 'actif' | 'suspendu' | 'resilie' | 'termine' | 'sinistre'
  motif_attente: string | null
  limites_depassees?: boolean
  observations?: string | null
  
  // Timestamps
  created_at?: string
  updated_at?: string
}

export interface FinamDashboardStats {
  total_contrats: number
  contrats_actifs: number
  en_attente: number
  resilie: number
  expire_30_jours: number
  par_categorie: {
    personnel: number
    retraites: number
  }
  total_primes: number
  total_montants_assures: number
  montant_moyen_assure: number
  duree_moyenne_pret: number
}

export interface FinamSimulation {
  montant_a_assurer: string
  duree_mois: number
  categorie: string
  taux_garantie: string
  prime_totale: string
  montant_max_couverture: string
  duree_max_couverture: string
  dans_limites: boolean
  respecte_limites: boolean
  delais: {
    couverture_maladie: string
  }
  tarifs_reference: {
    personnel_finam: string
    retraites: string
  }
}

// Constantes FINAM (basées sur le backend)
export const FINAM_CONSTANTS = {
  // Personnel FINAM
  PERSONNEL_TAUX: 2.00, // 2%
  PERSONNEL_MONTANT_MAX: 10000000, // 10.000.000 FCFA
  PERSONNEL_DUREE_MAX: 60, // 60 mois
  
  // Retraités
  RETRAITES_TAUX: 2.50, // 2.5%
  RETRAITES_MONTANT_MAX: 5000000, // 5.000.000 FCFA
  RETRAITES_DUREE_MAX: 36, // 36 mois
}
