// src/types/sinistre.types.ts

/**
 * Types de sinistre supportés par l'API
 * Correspond à: 'deces', 'iad', 'perte_emploi', 'perte_activite', 'maladie'
 */
export type SinistreType = 'deces' | 'iad' | 'perte_emploi' | 'perte_activite' | 'maladie'

/**
 * Enum pour les types de sinistre (pour une utilisation plus stricte)
 */
export enum TypeSinistre {
  DECES = 'deces',
  IAD = 'iad',
  PERTE_EMPLOI = 'perte_emploi',
  PERTE_ACTIVITE = 'perte_activite',
  MALADIE = 'maladie'
}

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
 * Enum pour les statuts de sinistre (pour une utilisation plus stricte)
 */
export enum SinistreStatutEnum {
  EN_COURS = 'en_cours',
  EN_INSTRUCTION = 'en_instruction',
  EN_REGLEMENT = 'en_reglement',
  EN_PAIEMENT = 'en_paiement',
  PAYE = 'paye',
  REJETE = 'rejete',
  CLOTURE = 'cloture'
}

/**
 * Types de quittance supportés
 */
export type TypeQuittance = 
  | 'capital_sans_interets'  // Capital sans intérêts (EMF)
  | 'capital_restant_du'     // Capital restant dû
  | 'capital_prevoyance'     // Capital prévoyance (Bénéficiaire)
  | 'indemnite_journaliere'  // Indemnité journalière
  | 'frais_medicaux'         // Frais médicaux

/**
 * Enum pour les types de quittance
 */
export enum TypeQuittanceEnum {
  CAPITAL_SANS_INTERETS = 'capital_sans_interets',
  CAPITAL_RESTANT_DU = 'capital_restant_du',
  CAPITAL_PREVOYANCE = 'capital_prevoyance',
  INDEMNITE_JOURNALIERE = 'indemnite_journaliere',
  FRAIS_MEDICAUX = 'frais_medicaux'
}

/**
 * Statuts de quittance
 */
export type QuittanceStatut = 'en_attente' | 'validee' | 'payee' | 'annulee'

/**
 * Modes de paiement supportés
 */
export type ModePaiement = 'virement' | 'cheque' | 'especes' | 'mobile_money'

/**
 * Utilisateur simplifié pour les relations
 */
export interface UserSimple {
  id: number
  name: string
  email?: string
}

/**
 * Quittance de sinistre (Règle B)
 */
export interface Quittance {
  id: number
  sinistre_id: number
  reference: string
  type: TypeQuittance
  beneficiaire: string
  montant: number
  statut: QuittanceStatut
  date_validation?: string
  date_paiement?: string
  mode_paiement?: ModePaiement
  numero_transaction?: string
  valideur?: UserSimple
  payeur?: UserSimple
  created_at: string
  updated_at?: string
}

/**
 * Délai de paiement (Règle C - 10 jours)
 */
export interface DelaiPaiement {
  date_debut: string
  date_echeance: string
  jours_restants: number
  depasse: boolean
}

/**
 * Résumé du règlement d'un sinistre
 */
export interface ResumeReglement {
  sinistre_id: number
  avec_prevoyance: boolean
  montant_total: number
  quittances: Quittance[]
  nombre_quittances: number
}

/**
 * Payload pour payer une quittance
 */
export interface PaiementQuittancePayload {
  mode_paiement: ModePaiement
  numero_transaction?: string
}

/**
 * Erreur de validation sinistre (Règle A)
 */
export interface SinistreValidationError {
  success: false
  error: {
    code: string
    message: string
    context?: Record<string, any>
  }
}

/**
 * Codes d'erreur de validation connus
 */
export type SinistreErrorCode = 
  | 'SINISTRE_DECES_HORS_COUVERTURE'
  | 'SINISTRE_MALADIE_DELAI_CARENCE'
  | 'CONTRAT_NON_VALIDE'
  | 'CONTRAT_EXPIRE'
  | 'SINISTRE_NON_MODIFIABLE'
  | 'TRANSITION_NON_AUTORISEE'
  | 'QUITTANCE_NON_TROUVEE'
  | 'QUITTANCE_DEJA_VALIDEE'
  | 'QUITTANCE_DEJA_PAYEE'
  | 'PERMISSION_REFUSEE'

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
  
  // Délai de paiement (Règle C)
  date_debut_delai_paiement?: string
  date_echeance_paiement?: string
  delai_paiement?: DelaiPaiement
  
  // Archivage (Règle E)
  est_archive: boolean
  est_modifiable?: boolean
  date_cloture?: string
  fichier_archive?: string
  
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
    avec_prevoyance?: boolean
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
  quittances?: Quittance[]
  declarePar?: UserSimple
  traitePar?: UserSimple
  validePar?: UserSimple
  
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
  archives?: number
  par_type: {
    deces: number
    iad: number
    perte_emploi: number
    perte_activite: number
    maladie?: number
  }
  montants: {
    total_indemnisations: number
    total_payes: number
    en_attente_paiement: number
  }
  delais: {
    delai_moyen_traitement: number
    delai_moyen_declaration: number
    sinistres_delai_depasse?: number
  }
  quittances?: {
    total: number
    en_attente: number
    validees: number
    payees: number
    montant_total: number
  }
}

/**
 * Paramètres de recherche pour la liste des sinistres
 */
export interface SinistreSearchParams {
  search?: string
  statut?: SinistreStatut
  type_sinistre?: SinistreType
  contrat_type?: ContratType
  contrat_id?: number
  emf_id?: number
  date_debut?: string
  date_fin?: string
  inclure_archives?: boolean
  page?: number
  per_page?: number
}

/**
 * Réponse détaillée d'un sinistre
 */
export interface SinistreDetailResponse {
  success: boolean
  data: Sinistre
  quittances?: Quittance[]
  delai_paiement?: DelaiPaiement
  documents_complets: boolean
  delai_traitement_ecoule: string | number
  est_modifiable?: boolean
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
