// types/cofidec.ts
export interface CofidecEmf {
  id: number
  nom: string
  sigle: string
  adresse?: string
  telephone?: string
  email?: string
}

export interface CofidecContrat {
  id: number
  numero_police: string
  reference?: string
  nom_prenom: string
  date_naissance: string
  lieu_naissance: string
  profession: string
  adresse: string
  telephone: string
  email?: string
  
  // Champs d'adresse détaillés (alias pour compatibilité)
  adresse_assure?: string
  ville_assure?: string
  telephone_assure?: string
  email_assure?: string
  
  // Dates et durée
  date_effet: string
  date_echeance: string
  date_fin_echeance?: string
  duree_mois: number
  duree_pret_mois?: number  // Alias pour compatibilité
  
  // Montants
  montant_pret_assure: number
  montant_pret?: number  // Alias pour compatibilité
  taux_assurance: number
  prime_mensuelle: number
  prime_totale: number
  
  // Catégorie socio-professionnelle
  categorie?: 'commercants' | 'salaries_public' | 'salaries_prive' | 'salarie_cofidec' | 'retraites' | 'autre'
  autre_categorie_precision?: string
  
  // Agence
  agence?: string
  
  // Garanties
  garantie_deces: boolean
  garantie_deces_iad?: boolean  // Alias pour compatibilité
  garantie_ipt: boolean
  garantie_itt: boolean
  garantie_perte_emploi: boolean
  garantie_prevoyance?: boolean
  
  // Cotisations calculées
  cotisation_deces_iad?: number
  cotisation_prevoyance?: number
  cotisation_perte_emploi?: number
  cotisation_totale?: number
  
  // Statut et observations
  statut: string
  observations?: string
  lieu_signature?: string
  
  // Relations
  emf_id: number
  emf: CofidecEmf
  
  // Timestamps
  created_at: string
  updated_at: string
}

export interface CofidecDashboardStats {
  total: number
  actifs: number
  en_attente: number
  suspendu: number
  resilie: number
  termine: number
  montant_total_assure: number
  cotisation_totale: number
  avec_perte_emploi: number
  expire_30_jours: number
  par_categorie: {
    commercants: number
    salaries_public: number
    salaries_prive: number
    retraites: number
    autre: number
  }
}
