// types/bceg.ts

export interface BcegEmf {
  id: number
  raison_sociale: string
  sigle: string
  type: string
  adresse: string
  ville: string
  pays: string
  boite_postale?: string
  telephone: string
  telephone_2?: string
  email: string
  site_web?: string
  numero_agrement?: string
  registre_commerce?: string
  date_creation?: string
  compte_bancaire?: string
  banque?: string
  swift_bic?: string
  contact_nom?: string
  contact_fonction?: string
  contact_telephone?: string
  contact_email?: string
  montant_max_pret?: string
  duree_max_pret_mois?: number
  taux_interet_moyen?: string
  logo?: string
  description?: string
  statut: string
  created_by?: number
  updated_by?: number
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface BcegSinistre {
  id: number
  contrat_id: number
  type_sinistre: string
  date_sinistre: string
  date_declaration: string
  description?: string
  montant_indemnite?: string
  statut: string
  created_at: string
  updated_at: string
}

export interface BcegContrat {
  id: number
  emf_id: number
  
  // Informations banque
  banque_raison_sociale: string
  banque_sigle: string
  banque_adresse: string
  banque_ville: string
  banque_telephone: string
  banque_email?: string
  agence?: string
  
  // Informations contrat
  numero_police?: string
  numero_convention?: string
  visa_dna?: string
  type_contrat?: string
  code_assurances_cima?: string
  
  // Informations prêt
  montant_pret: string
  montant_pret_assure?: number  // Alias pour compatibilité
  duree_pret_mois: number
  date_effet: string
  date_fin_echeance: string
  
  // Informations assuré
  nom: string
  prenom: string
  nom_prenom?: string  // Champ calculé pour compatibilité
  adresse_assure: string
  ville_assure: string
  telephone_assure: string
  email_assure?: string
  
  // Bénéficiaire prévoyance
  beneficiaire_prevoyance_nom_prenom?: string
  beneficiaire_prevoyance_adresse?: string
  beneficiaire_prevoyance_contact?: string
  
  // Garanties
  garantie_deces_iad: boolean
  garantie_prevoyance: boolean
  
  // Taux par durée
  taux_deces_max_24_mois?: string
  taux_deces_24_36_mois?: string
  taux_deces_36_48_mois?: string
  taux_deces_48_60_mois?: string
  
  // Cotisations
  prime_unique_prevoyance?: string
  taux_applique?: string
  cotisation_deces_iad?: string
  cotisation_prevoyance?: string
  cotisation_totale_ttc?: string
  
  // Montants et limites
  montant_max_pret_couvert?: string
  montant_protection_forfaitaire?: string
  duree_max_pret_mois?: number
  age_max_souscription?: number
  age_max_couverture?: number
  
  // Signatures
  lieu_signature?: string
  date_signature?: string
  signature_assure: boolean
  signature_cachet_bceg: boolean
  signature_assureur: number
  
  // Statut
  statut: string
  
  // Délais contractuels
  delai_couverture_maladie_mois?: number
  delai_declaration_sinistre_jours?: number
  delai_declaration_deces_jours?: number
  delai_versement_indemnite_jours?: number
  delai_reponse_reclamation_jours?: number
  delai_paiement_apres_acceptation_jours?: number
  delai_regularisation_cheque_impaye_jours?: number
  delai_prescription_annees?: number
  
  // Feuillet
  feuillet_numero?: string
  feuillet_type?: string
  
  // Audit
  user_id?: number
  created_by?: number
  updated_by?: number
  created_at: string
  updated_at: string
  deleted_at?: string
  
  // Relations
  emf?: BcegEmf
  user?: any
  sinistres?: BcegSinistre[]
}

export interface BcegContratFormData {
  emf_id: number
  
  // Informations banque
  banque_raison_sociale?: string
  banque_sigle?: string
  banque_adresse?: string
  banque_ville?: string
  banque_telephone?: string
  banque_email?: string
  agence?: string
  
  // Informations contrat
  numero_police?: string
  numero_convention?: string
  visa_dna?: string
  type_contrat?: string
  
  // Informations prêt
  montant_pret: number
  duree_pret_mois: number
  date_effet: string
  date_fin_echeance?: string
  
  // Informations assuré
  nom: string
  prenom: string
  adresse_assure: string
  ville_assure: string
  telephone_assure: string
  email_assure?: string
  
  // Bénéficiaire prévoyance
  beneficiaire_prevoyance_nom_prenom?: string
  beneficiaire_prevoyance_adresse?: string
  beneficiaire_prevoyance_contact?: string
  
  // Garanties
  garantie_deces_iad: boolean
  garantie_prevoyance: boolean
  
  // Cotisations
  taux_applique?: number
  cotisation_deces_iad?: number
  cotisation_prevoyance?: number
  cotisation_totale_ttc?: number
  
  // Statut
  statut?: string
}

export interface BcegDashboardStats {
  total: number
  actifs: number
  en_attente: number
  suspendu: number
  resilie: number
  termine: number
  montant_total_assure: number
  cotisation_totale: number
  avec_prevoyance: number
  expire_30_jours: number
  par_agence?: {
    [agence: string]: number
  }
}
