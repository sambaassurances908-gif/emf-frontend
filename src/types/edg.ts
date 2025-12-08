// types/edg.ts
export interface EdgEmf {
  id: number
  nom?: string
  raison_sociale?: string
  sigle: string
  adresse?: string
  telephone?: string
  email?: string
}

export interface EdgAssureAssocie {
  id: number
  contrat_edg_id: number
  numero_ordre: number
  nom: string
  prenom: string
  date_naissance: string
  lieu_naissance: string
  contact?: string
  adresse?: string
  nom_complet?: string
  age?: number
  type_assure?: string
  created_at?: string
  updated_at?: string
}

// Type pour la création d'assurés associés (sans id, contrat_edg_id, numero_ordre)
export type EdgAssureAssocieCreate = Omit<EdgAssureAssocie, 'id' | 'contrat_edg_id' | 'numero_ordre' | 'created_at' | 'updated_at' | 'nom_complet' | 'age'>

export interface EdgContrat {
  id: number
  emf_id: number
  emf_raison_sociale?: string
  emf_sigle?: string
  emf_adresse?: string
  emf_telephone?: string
  emf_email?: string
  agence?: string
  numero_convention?: string
  numero_police?: string
  visa_dna?: string
  type_contrat?: string
  code_assurances_cima?: string
  
  // Couverture
  montant_pret_assure: number
  duree_pret_mois: number
  duree_mois?: number  // Alias
  date_effet: string
  date_fin_echeance?: string
  date_echeance?: string  // Alias
  
  // Assuré principal
  nom_prenom: string
  adresse_assure?: string
  adresse?: string  // Alias
  ville_assure?: string
  telephone_assure?: string
  telephone?: string  // Alias
  email_assure?: string
  email?: string  // Alias
  date_naissance?: string
  lieu_naissance?: string
  profession?: string
  categorie: 'commercants' | 'salaries_public' | 'salaries_prive' | 'retraites' | 'autre'
  autre_categorie_precision?: string
  est_vip: boolean
  is_vip?: boolean  // Alias
  beneficiaire_deces?: string
  
  // Garanties
  garantie_prevoyance: boolean
  garantie_deces_iad: boolean
  garantie_deces?: boolean  // Alias
  garantie_ipt?: boolean
  garantie_itt?: boolean
  garantie_perte_emploi?: boolean
  
  // Tarification
  prime_unique_prevoyance?: number
  prime_mensuelle?: number
  prime_totale?: number
  taux_deces_standard?: number
  taux_deces_vip?: number
  taux_perte_emploi?: number
  taux_applique?: number
  cotisation_prevoyance?: number
  cotisation_deces_iad?: number
  cotisation_totale_ttc?: number
  
  // Limites
  montant_max_pret_vip?: number
  montant_max_pret_standard?: number
  duree_max_pret_vip_mois?: number
  duree_max_pret_standard_mois?: number
  montant_max_applique?: number
  duree_max_appliquee_mois?: number
  age_max_souscription?: number
  age_max_couverture?: number
  
  // Contrat de travail
  type_contrat_travail?: 'cdi' | 'cdd_plus_9_mois' | 'cdd_moins_9_mois' | 'non_applicable'
  
  // Signatures
  lieu_signature?: string
  date_signature?: string
  signature_assure?: boolean
  signature_cachet_edg?: boolean
  signature_assureur?: boolean
  
  // Statut et observations
  statut: 'en_attente' | 'actif' | 'suspendu' | 'resilie' | 'termine' | 'sinistre'
  observations?: string
  
  // Délais
  delai_couverture_maladie_mois?: number
  delai_couverture_perte_emploi_mois?: number
  delai_declaration_deces_jours?: number
  delai_declaration_perte_emploi_jours?: number
  delai_versement_indemnite_jours?: number
  delai_reponse_reclamation_jours?: number
  delai_paiement_apres_acceptation_jours?: number
  delai_regularisation_cheque_impaye_jours?: number
  delai_prescription_annees?: number
  
  // Feuillets
  feuillet_numero?: string
  feuillet_type?: string
  
  // Relations
  user_id?: number
  created_by?: number
  updated_by?: number
  emf?: EdgEmf
  assures_associes?: EdgAssureAssocie[]
  
  // Timestamps
  created_at?: string
  updated_at?: string
}

export interface EdgDashboardStats {
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

// Type pour la création de contrat EDG (avec assures_associes en création)
export interface EdgContratCreate extends Omit<Partial<EdgContrat>, 'assures_associes' | 'id' | 'emf' | 'created_at' | 'updated_at'> {
  assures_associes?: EdgAssureAssocieCreate[]
}
