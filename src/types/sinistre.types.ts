// src/types/sinistre.types.ts

/**
 * Types de sinistre supportés par l'API
 * Correspond à: 'deces', 'iad', 'perte_emploi', 'perte_activite'
 */
export type SinistreType = 'deces' | 'iad' | 'perte_emploi' | 'perte_activite'

/**
 * Statuts de sinistre supportés par l'API Laravel
 * Correspond exactement à SinistreController@update validation
 */
export type SinistreStatut = 
  | 'en_cours'          // Sinistre déclaré, en attente de traitement
  | 'en_instruction'    // Documents reçus, en cours d'analyse
  | 'en_reglement'      // Analyse terminée, en cours de règlement
  | 'en_paiement'       // Validé, en attente de paiement
  | 'paye'              // Indemnisation versée
  | 'rejete'            // Sinistre refusé
  | 'cloture'           // Dossier clôturé

/**
 * Types de contrat supportés par l'API pour les sinistres
 */
export type ContratType = 
  | 'ContratBambooEmf'
  | 'ContratCofidec'
  | 'ContratBceg'
  | 'ContratEdg'
  | 'ContratSodec'

/**
 * Interface de base pour un sinistre
 */
export interface Sinistre {
  id: number
  numero_sinistre: string
  contrat_type: ContratType
  contrat_id: number
  emf_id?: number // ID de l'EMF (peut être directement sur le sinistre ou via contrat)
  type_sinistre: SinistreType
  date_sinistre: string
  date_declaration: string
  
  // Accesseurs calculés depuis le contrat
  numero_police?: string
  nom_assure?: string
  telephone_assure?: string
  
  // Déclarant
  nom_declarant: string
  prenom_declarant: string
  qualite_declarant: string
  telephone_declarant: string
  email_declarant?: string
  
  // Détails
  circonstances?: string
  lieu_sinistre?: string
  capital_restant_du: number
  montant_reclame?: number
  montant_indemnisation?: number
  montant_paye?: number
  
  // Statut et traitement
  statut: SinistreStatut
  motif_rejet?: string
  observations?: string
  
  // Dates
  date_reception_documents?: string
  date_traitement?: string
  date_decision?: string
  date_paiement?: string
  
  // Utilisateurs
  declare_par?: number
  traite_par?: number
  valide_par?: number
  
  // Documents - flags booléens
  doc_certificat_deces?: boolean
  doc_proces_verbal?: boolean
  doc_certificat_licenciement?: boolean
  doc_certificat_arret_travail?: boolean
  doc_proces_verbal_faillite?: boolean
  doc_piece_identite?: boolean
  doc_certificat_heredite?: boolean
  
  // Documents - chemins fichiers
  fichier_tableau_amortissement?: string
  fichier_acte_deces?: string
  fichier_certificat_arret_travail?: string
  fichier_certificat_deces?: string
  fichier_certificat_licenciement?: string
  fichier_proces_verbal?: string
  fichier_proces_verbal_faillite?: string
  fichier_piece_identite?: string
  fichier_certificat_heredite?: string
  fichier_autres_documents?: string
  
  // Délais
  delai_declaration_jours?: number
  delai_traitement_jours?: number
  
  // Relations
  contrat?: {
    id: number
    numero_police: string
    nom_prenom?: string
    nom_prenom_assure_principal?: string
    montant_pret_assure: number
    duree_pret_mois?: number
    date_effet?: string
    date_fin_echeance?: string
    capital_restant_du?: number
    emf_id?: number
    emf?: { id: number; sigle: string; nom: string }
    // Garanties communes
    garantie_deces_iad?: boolean | number
    garantie_prevoyance?: boolean | number
    garantie_prevoyance_deces_iad?: boolean | number
    garantie_perte_emploi?: boolean | number
    // Cotisations
    cotisation_deces_iad?: number
    cotisation_perte_emploi?: number
    cotisation_totale_ttc?: number
    prime_unique_prevoyance?: number
    // SODEC spécifique
    option_prevoyance?: 'A' | 'B'
    cotisation_prevoyance?: number
  }
  documents?: SinistreDocument[]
  declarePar?: { id: number; name: string }
  traitePar?: { id: number; name: string }
  validePar?: { id: number; name: string }
  
  created_at: string
  updated_at: string
}

/**
 * Document attaché à un sinistre
 */
export interface SinistreDocument {
  id: number
  sinistre_id: number
  type_document: string
  nom_fichier: string
  chemin_fichier: string
  extension: string
  taille: number
  description?: string
  uploaded_by?: number
  created_at: string
}

/**
 * Payload pour créer un sinistre (correspond exactement au validator Laravel SinistreController@store)
 * 
 * Champs obligatoires:
 * - contrat_type: ContratBambooEmf, ContratCofidec, ContratBceg, ContratEdg, ContratSodec
 * - contrat_id: integer (doit exister dans la table correspondante)
 * - type_sinistre: deces, iad, perte_emploi, perte_activite
 * - date_sinistre: date format YYYY-MM-DD (before_or_equal:today)
 * - capital_restant_du: numeric min:0
 * 
 * Champs optionnels:
 * - circonstances: string
 * - lieu_sinistre: string max:255
 * - montant_reclame: numeric min:0
 * - fichier_*: File (PDF, max 10MB)
 */
export interface SinistreCreatePayload {
  // Champs obligatoires
  contrat_type: ContratType
  contrat_id: number
  type_sinistre: SinistreType
  date_sinistre: string // format YYYY-MM-DD
  capital_restant_du: number
  
  // Champs optionnels
  circonstances?: string
  lieu_sinistre?: string
  montant_reclame?: number
  
  // Documents PDF (tous optionnels, max 10MB chacun)
  fichier_tableau_amortissement?: File
  fichier_acte_deces?: File
  fichier_certificat_arret_travail?: File
  fichier_certificat_deces?: File
  fichier_certificat_licenciement?: File
  fichier_proces_verbal?: File
  fichier_proces_verbal_faillite?: File
  fichier_piece_identite?: File // Accepte aussi jpg, jpeg, png
  fichier_certificat_heredite?: File
  fichier_autres_documents?: File
}

/**
 * Réponse de création de sinistre
 */
export interface SinistreCreateResponse {
  success: boolean
  message: string
  data: Sinistre
  numero_sinistre: string
  documents_uploades: string[]
  delai_restant_documents: string
}

/**
 * Statistiques sinistres - Correspond à SinistreController@statistiques
 */
export interface SinistreStats {
  total: number
  en_cours: number
  en_instruction: number
  en_reglement: number
  en_paiement: number
  payes: number
  rejetes: number
  clotures: number
  par_type: {
    deces: number
    iad: number
    perte_emploi: number
    perte_activite: number
  }
  montants: {
    total_indemnisations: number
    total_payes: number
    en_attente_paiement: number
  }
  delais: {
    delai_moyen_traitement: number
    delai_moyen_declaration: number
  }
}

// ========================
// Types legacy pour compatibilité
// ========================

export type SinistreBase = Sinistre

// BAMBOO
export interface BambooSinistre extends Sinistre {
  contrat_type: 'ContratBambooEmf'
}

export interface BambooSinistreCreatePayload extends Omit<SinistreCreatePayload, 'contrat_type'> {
  contrat_type?: 'ContratBambooEmf'
}

// COFIDEC
export interface CofidecSinistre extends Sinistre {
  contrat_type: 'ContratCofidec'
}

export interface CofidecSinistreCreatePayload extends Omit<SinistreCreatePayload, 'contrat_type'> {
  contrat_type?: 'ContratCofidec'
}

// BCEG
export interface BcegSinistre extends Sinistre {
  contrat_type: 'ContratBceg'
}

export interface BcegSinistreCreatePayload extends Omit<SinistreCreatePayload, 'contrat_type'> {
  contrat_type?: 'ContratBceg'
  // Note: Les flags doc_* ne sont PAS acceptés lors de la création (store)
  // Ils sont mis à jour automatiquement par le backend lors de l'upload des fichiers
}

// EDG
export interface EdgSinistre extends Sinistre {
  contrat_type: 'ContratEdg'
}

export interface EdgSinistreCreatePayload extends Omit<SinistreCreatePayload, 'contrat_type'> {
  contrat_type?: 'ContratEdg'
}

// SODEC
export interface SodecSinistre extends Sinistre {
  contrat_type: 'ContratSodec'
}

export interface SodecSinistreCreatePayload extends Omit<SinistreCreatePayload, 'contrat_type'> {
  contrat_type?: 'ContratSodec'
}
