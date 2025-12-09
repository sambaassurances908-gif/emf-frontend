// src/types/sinistre.types.ts

/**
 * Types de sinistre supportés par l'API
 * Correspond à: 'deces', 'iad', 'perte_emploi', 'perte_activite'
 */
export type SinistreType = 'deces' | 'iad' | 'perte_emploi' | 'perte_activite'

/**
 * Statuts de sinistre supportés par l'API Laravel
 */
export type SinistreStatut = 
  | 'en_attente'
  | 'en_attente_documents'
  | 'documents_complets'
  | 'en_cours_traitement'
  | 'en_attente_decision'
  | 'accepte'
  | 'rejete'
  | 'paye'
  | 'cloture'

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
  type_sinistre: SinistreType
  date_sinistre: string
  date_declaration: string
  
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
    capital_restant_du?: number
    emf?: { id: number; sigle: string; nom: string }
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
 * Payload pour créer un sinistre (correspond exactement au validator Laravel)
 */
export interface SinistreCreatePayload {
  contrat_type: ContratType
  contrat_id: number
  type_sinistre: SinistreType
  date_sinistre: string // format YYYY-MM-DD
  
  // Informations du déclarant (obligatoires)
  nom_declarant: string
  prenom_declarant: string
  qualite_declarant: string
  telephone_declarant: string
  email_declarant?: string
  
  // Détails sinistre
  circonstances?: string
  lieu_sinistre?: string
  capital_restant_du: number
  montant_reclame?: number
  
  // Documents PDF (optionnels lors de la création)
  fichier_tableau_amortissement?: File
  fichier_acte_deces?: File
  fichier_certificat_arret_travail?: File
  fichier_certificat_deces?: File
  fichier_certificat_licenciement?: File
  fichier_proces_verbal?: File
  fichier_proces_verbal_faillite?: File
  fichier_piece_identite?: File
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
 * Statistiques sinistres
 */
export interface SinistreStats {
  total: number
  en_attente: number
  acceptes: number
  rejetes: number
  payes: number
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
