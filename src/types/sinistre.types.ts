// src/types/sinistre.types.ts
export type SinistreType = 'deces' | 'iad' | 'perte_emploi' | 'autre'

export type SinistreStatut = 'en_attente' | 'en_cours' | 'valide' | 'refuse' | 'cloture'

export interface SinistreBase {
  id: number
  contrat_id: number
  numero_sinistre: string
  type_sinistre: SinistreType
  date_survenance: string
  date_declaration: string
  statut: SinistreStatut
  montant_reclame?: number
  montant_approuve?: number
  description: string
  documents?: string[]
  created_at: string
  updated_at: string
}

// BAMBOO
export interface BambooSinistre extends SinistreBase {
  contrat: {
    numero_police: string
    nom_prenom: string
    montant_pret_assure: number
    emf: { sigle: string; nom: string }
  }
}

export interface BambooSinistreCreatePayload {
  contrat_id: number
  type_sinistre: SinistreType
  date_survenance: string
  description: string
  documents?: File[]
}

// SODEC
export interface SodecSinistre extends SinistreBase {
  contrat: {
    numero_police: string
    nom_prenom_assure_principal: string
    montant_pret_assure: number
    emf: { sigle: string; nom: string }
  }
}

export interface SodecSinistreCreatePayload {
  contrat_id: number
  type_sinistre: SinistreType
  date_survenance: string
  description: string
  documents?: File[]
}

// COFIDEC
export interface CofidecSinistre extends SinistreBase {
  contrat: {
    numero_police: string
    nom_prenom: string
    montant_pret_assure: number
    emf: { sigle: string; nom: string }
  }
}

export interface CofidecSinistreCreatePayload {
  contrat_id: number
  type_sinistre: SinistreType
  date_survenance: string
  description: string
  documents?: File[]
}

// BCEG
export interface BcegSinistre extends SinistreBase {
  contrat: {
    numero_police: string
    nom_prenom: string
    montant_pret_assure: number
    emf: { sigle: string; nom: string }
  }
}

export interface BcegSinistreCreatePayload {
  contrat_id: number
  type_sinistre: SinistreType
  date_survenance: string
  description: string
  documents?: File[]
}

// EDG
export interface EdgSinistre extends SinistreBase {
  contrat: {
    numero_police: string
    nom_prenom: string
    montant_pret_assure: number
    emf: { sigle: string; nom: string }
  }
}

export interface EdgSinistreCreatePayload {
  contrat_id: number
  type_sinistre: SinistreType
  date_survenance: string
  description: string
  documents?: File[]
}
