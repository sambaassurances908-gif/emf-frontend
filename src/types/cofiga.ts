// types/cofiga.ts

export interface CofigaEmf {
  id: number
  raison_sociale: string
  sigle: string
  adresse?: string
  telephone?: string
  email?: string
}

export interface CofigaContrat {
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
  categorie: 'Commerçants' | 'Salariés du public' | 'Salariés du privé' | 'Autre'
  categorie_autre: string | null
  
  // Prêt
  montant_pret_assure: number
  duree_pret: number
  date_effet: string
  date_fin_echeance: string
  
  // Souscripteur EMF
  souscripteur_raison_sociale: string | null
  souscripteur_rccm: string | null
  souscripteur_nif: string | null
  souscripteur_adresse: string | null
  souscripteur_ville: string | null
  souscripteur_telephone: string | null
  souscripteur_email: string | null
  
  // Bénéficiaire
  beneficiaire_nom: string | null
  beneficiaire_prenom: string | null
  beneficiaire_telephone: string | null
  
  // Tarification (calculés par le backend)
  taux_garantie?: number // 1.50%
  cotisation_variable?: number
  cotisation_fixe?: number // 5000 FCFA
  cotisation_totale?: number
  protection_forfaitaire?: number // 250.000 FCFA
  
  // Signatures
  signature_assure?: boolean
  signature_cachet_cofiga?: boolean
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

export interface CofigaDashboardStats {
  total_contrats: number
  contrats_actifs: number
  en_attente: number
  resilie: number
  expire_30_jours: number
  par_categorie: {
    commercants: number
    salaries_public: number
    salaries_prive: number
    autre: number
  }
  total_cotisations: number
  total_montants_assures: number
  montant_moyen_pret: number
  duree_moyenne_pret: number
}

export interface CofigaSimulation {
  montant_pret_assure: string
  duree_mois: number
  taux_garantie: string
  cotisation_variable: string
  cotisation_fixe: string
  cotisation_totale: string
  formule: string
  protection_forfaitaire: string
  montant_max_pret_couvert: string
  duree_max_pret: string
  dans_limites: boolean
  respecte_limites: boolean
  delais: {
    couverture_maladie: string
  }
}

// Constantes COFIGA (basées sur le backend)
export const COFIGA_CONSTANTS = {
  TAUX_GARANTIE: 1.50, // 1.50%
  PRIME_UNIQUE: 5000, // 5.000 FCFA
  PROTECTION_FORFAITAIRE: 250000, // 250.000 FCFA
  MONTANT_MAX_PRET: 10000000, // 10.000.000 FCFA
  DUREE_MAX_PRET: 24, // 24 mois
}
