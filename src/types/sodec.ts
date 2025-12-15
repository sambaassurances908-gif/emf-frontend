// Types SODEC complets conformes au backend Laravel ContratSodec

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
  
  // EMF Info
  emf_id: number
  emf_raison_sociale?: string
  emf_sigle?: string
  emf_adresse?: string
  emf_ville?: string
  emf_telephone?: string
  emf_email?: string
  agence?: string
  
  // Police et Convention
  numero_police?: string
  numero_convention?: string
  visa_dna?: string
  type_contrat?: string
  code_assurances_cima?: string
  
  // Prêt
  montant_pret_assure: number
  duree_pret_mois: number
  date_effet: string
  date_fin_echeance?: string
  
  // Assuré principal
  nom_prenom: string
  adresse_assure: string
  ville_assure: string
  telephone_assure: string
  email_assure?: string
  categorie: 'commercants' | 'salaries_public' | 'salaries_prive' | 'retraites' | 'autre'
  autre_categorie_precision?: string
  
  // Bénéficiaire décès
  beneficiaire_deces?: string
  beneficiaire_nom?: string
  beneficiaire_prenom?: string
  beneficiaire_date_naissance?: string
  beneficiaire_lieu_naissance?: string
  beneficiaire_contact?: string
  
  // Options et garanties
  option_prevoyance: 'option_a' | 'option_b'
  garantie_prevoyance: boolean
  garantie_deces_iad: boolean
  garantie_perte_emploi?: boolean
  
  // Primes et cotisations
  prime_prevoyance_option_a?: number
  prime_prevoyance_option_b?: number
  capital_adulte_option_a?: number
  capital_enfant_option_a?: number
  capital_adulte_option_b?: number
  capital_enfant_option_b?: number
  taux_deces_iad?: number
  taux_perte_emploi?: number
  prime_prevoyance_appliquee?: number
  cotisation_prevoyance?: number
  cotisation_deces_iad?: number
  cotisation_perte_emploi?: number
  cotisation_totale_ttc?: number
  
  // Montants et durées max
  montant_max_prevoyance_option_a?: number
  montant_max_prevoyance_option_b?: number
  montant_max_pret_retraites?: number
  montant_max_pret_autres?: number
  duree_max_pret_retraites_mois?: number
  duree_max_pret_autres_mois?: number
  montant_max_perte_emploi?: number
  duree_max_indemnisation_perte_emploi_mois?: number
  duree_max_couverture_perte_emploi_mois?: number
  montant_max_applique?: number
  duree_max_appliquee_mois?: number
  
  // Ages
  age_max_souscription?: number
  age_max_couverture?: number
  
  // Contrat de travail
  type_contrat_travail?: 'cdi' | 'cdd_plus_9_mois' | 'cdd_moins_9_mois' | 'non_applicable'
  
  // Signatures
  lieu_signature?: string
  date_signature?: string
  signature_souscripteur?: boolean
  signature_cachet_sodec?: boolean
  signature_assureur?: boolean
  
  // Statut
  statut: 'actif' | 'en_attente' | 'expire' | 'resilie'
  motif_attente?: string | null
  limites_depassees?: boolean
  
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
  
  // Feuillet
  feuillet_type?: string
  
  // Relations et métadonnées
  user_id?: number
  created_by?: number
  updated_by?: number
  created_at: string
  updated_at: string
  
  // Accesseurs calculés
  option_prevoyance_label?: string
  capital_restant_du?: number
  jours_restants?: number
  est_expire?: boolean
  nombre_assures_associes?: number
  nombre_adultes?: number
  nombre_enfants?: number
  
  // Relations
  assures_associes?: SodecAssureAssocie[]
  emf?: {
    id: number
    raison_sociale: string
    sigle: string
    adresse?: string
    ville?: string
    telephone?: string
    email?: string
  }
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

// ✅ Payload EXACT du contrôleur Laravel ContratSodec
export interface SodecContractCreatePayload {
  emf_id: number
  
  // Assuré principal
  nom_prenom: string
  adresse_assure: string
  ville_assure: string
  telephone_assure: string
  email_assure?: string | null
  
  // Police (optionnel, auto-généré par backend)
  numero_police?: string | null
  
  // Catégorie
  categorie: 'commercants' | 'salaries_public' | 'salaries_prive' | 'retraites' | 'autre'
  autre_categorie_precision?: string | null
  
  // Option prévoyance
  option_prevoyance: 'option_a' | 'option_b'
  
  // Prêt
  montant_pret_assure: number
  duree_pret_mois: number
  date_effet: string
  
  // Bénéficiaire décès
  beneficiaire_deces?: string | null
  beneficiaire_nom?: string | null
  beneficiaire_prenom?: string | null
  beneficiaire_date_naissance?: string | null
  beneficiaire_lieu_naissance?: string | null
  beneficiaire_contact?: string | null
  
  // Garanties
  garantie_prevoyance: boolean
  garantie_deces_iad: boolean
  garantie_perte_emploi?: boolean
  
  // Contrat de travail (pour perte emploi)
  type_contrat_travail?: 'cdi' | 'cdd_plus_9_mois' | 'cdd_moins_9_mois' | 'non_applicable'
  
  // Agence
  agence?: string | null
  
  // Signature
  lieu_signature?: string | null
  date_signature?: string | null
  
  // Statut
  statut?: 'actif' | 'en_attente' | 'expire' | 'resilie'
  
  // Assurés associés (optionnel)
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
