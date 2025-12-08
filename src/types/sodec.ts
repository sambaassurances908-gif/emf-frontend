// Types SODEC complets conformes au backend Laravel

export interface SodecStats {
  total: number
  actifs: number
  en_attente: number
  resilie: number
  retraites: number
  autres_categories: number
  option_a: number
  option_b: number
  avec_perte_emploi: number
  avec_assures_associes: number
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
  par_option_prevoyance: {
    option_a_actifs: number
    option_b_actifs: number
  }
  assures_associes: {
    total: number
    adultes: number
    enfants: number
  }
  par_emf: Array<{
    emf_id: number
    total: number
    montant_total: number
    emf: {
      id: number
      raison_sociale: string
      sigle: string
    }
  }>
}

export interface SodecContrat {
  id: number
  nom_prenom: string
  numero_police?: string
  statut: string
  categorie: string
  option_prevoyance: string
  montant_pret_assure: number
  duree_pret_mois: number
  date_effet: string
  garantie_perte_emploi?: boolean
  nombre_assures_associes?: number
  emf_id: number
  created_at: string
  updated_at: string
  adresse_assure: string
  ville_assure: string
  telephone_assure: string
  garantie_prevoyance: boolean
  garantie_deces_iad: boolean
}

export interface SodecAssureAssocie {
  id: number
  contrat_sodec_id: number
  type_assure: 'souscripteur' | 'conjoint' | 'conjoint_2' | 'enfant_1' | 'enfant_2' | 'enfant_3' | 'enfant_4'
  nom: string
  prenom: string
  date_naissance: string
  lieu_naissance: string
  contact?: string
  adresse?: string
}

// ✅ Payload EXACT du contrôleur Laravel
export interface SodecContractCreatePayload {
  emf_id: number
  nom_prenom: string
  adresse_assure: string
  ville_assure: string
  telephone_assure: string
  email_assure?: string | null
  date_naissance?: string | null
  numero_police?: string | null
  categorie: 'commercants' | 'salaries_public' | 'salaries_prive' | 'retraites' | 'autre'
  autre_categorie_precision?: string | null
  option_prevoyance: 'option_a' | 'option_b'
  montant_pret_assure: number
  duree_pret_mois: number
  date_effet: string
  beneficiaire_deces?: string | null
  beneficiaire_nom?: string | null
  beneficiaire_prenom?: string | null
  beneficiaire_date_naissance?: string | null
  beneficiaire_lieu_naissance?: string | null
  beneficiaire_contact?: string | null
  garantie_prevoyance: boolean
  garantie_deces_iad: boolean
  garantie_perte_emploi?: boolean
  type_contrat_travail?: 'cdi' | 'cdd_plus_9_mois' | 'cdd_moins_9_mois' | 'non_applicable'
  agence?: string | null
  assures_associes?: Array<{
    type_assure: string
    nom: string
    prenom: string
    date_naissance: string
    lieu_naissance: string
    contact?: string
    adresse?: string
  }>
}
