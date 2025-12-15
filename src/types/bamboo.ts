// types/bamboo.ts
export interface BambooEmfResume {
  emf_id: number
  total: number
  montant_total: number
  emf: {
    id: number
    raison_sociale: string
    sigle: string
  }
}

export interface BambooDashboardStats {
  total: number
  actifs: number
  en_attente: number
  resilie: number
  avec_perte_emploi: number
  expire_30_jours: number
  montant_total_assure: number
  cotisation_totale: number
  montant_moyen_pret: number
  par_categorie: {
    commercants: number
    salaries_public: number
    salaries_prive: number
    retraites: number
    autre: number
  }
  par_emf: BambooEmfResume[]
}


export interface BambooContrat {
  id: number
  emf_id: number
  numero_police?: string | null
  nom_prenom: string
  date_naissance?: string | null
  lieu_naissance?: string | null
  profession?: string | null
  adresse_assure?: string | null
  ville_assure?: string | null
  telephone_assure: string
  email_assure?: string | null
  categorie: string
  autre_categorie_precision?: string | null
  type_contrat_travail?: string | null
  // Statut et observations
  statut: string
  motif_attente?: string | null
  limites_depassees?: boolean
  observations?: string | null
  
  // Montant et durée du prêt
  montant_pret_assure?: number
  montant_pret?: number // Alias pour compatibilité
  duree_pret_mois: number
  date_effet: string
  date_fin_echeance?: string | null
  agence?: string | null
  
  // Garanties
  garantie_prevoyance?: boolean | number
  garantie_prevoyance_deces_iad?: boolean | number
  garantie_deces_iad?: boolean | number
  garantie_perte_emploi?: boolean | number
  beneficiaire_prevoyance?: string | null
  
  // Tarification
  prime_unique_prevoyance?: number
  taux_deces_iad?: number
  cotisation_deces_iad?: number
  cotisation_perte_emploi?: number
  cotisation_totale_ttc?: number
  
  // Signatures
  signature_souscripteur?: boolean
  cachet_bamboo?: boolean
  signature_assureur?: boolean
  lieu_signature?: string
  date_signature?: string
  
  // Relations
  emf: {
    id: number
    raison_sociale: string
    sigle: string
  }
  user?: any
  created_by?: any
  updated_by?: any
  created_at?: string
  updated_at?: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  total?: number
}

export interface PaginatedResponse<T> {
  success: boolean
  data: {
    current_page: number
    data: T[]
    last_page: number
    total: number
  }
}
