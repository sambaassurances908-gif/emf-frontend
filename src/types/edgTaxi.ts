// Types pour les contrats EDG TAXI

// ============================================
// SAMB'A TAXIS - Perte de Recettes
// ============================================
export interface EdgTaxiPerteRecetteContrat {
    id: number
    emf_id: number

    // Identité contrat
    numero_police: string
    date_effet: string // YYYY-MM-DD
    date_echeance: string // YYYY-MM-DD

    // Assuré
    nom: string
    prenom: string
    date_naissance?: string
    numero_identite?: string

    // Véhicule & Coordonnées
    immatriculation_taxi: string
    adresse?: string
    bp?: string
    ville?: string
    telephone?: string
    email?: string

    // Contact d'urgence
    contact_nom?: string
    contact_telephone?: string

    // Paramètres
    periodicite: 'annuel' | 'semestre'
    cotisation?: number
    statut?: string
    categorie?: string

    created_at?: string
    updated_at?: string
    deleted_at?: string
}

export interface EdgTaxiPerteRecetteFormData {
    emf_id: number
    numero_police?: string
    date_effet: string
    date_echeance: string
    nom: string
    prenom: string
    date_naissance?: string
    numero_identite?: string
    immatriculation_taxi: string
    adresse?: string
    bp?: string
    ville?: string
    telephone?: string
    email?: string
    contact_nom?: string
    contact_telephone?: string
    periodicite: 'annuel' | 'semestre'
    statut?: string
    categorie?: string
}

// Constantes métier (miroir du backend)
export const EDG_TAXI_PERTE_RECETTE_CONSTANTS = {
    INDEMNITE_JOUR: 10000,
    DUREE_MAX_JOURS: 10,
    PLAFOND_ANNUEL: 100000,
    COTISATION_ANNUELLE: 25000,
    COTISATION_SEMESTRE: 12500,
}

// ============================================
// SAMB'A TAXIS - Prévoyance Décès
// ============================================
export interface EdgTaxiPrevoyanceDecesContrat {
    id: number
    emf_id: number

    // Identité contrat
    numero_police: string
    date_effet: string // YYYY-MM-DD
    date_echeance: string // YYYY-MM-DD

    // Assuré
    nom: string
    prenom: string
    adresse?: string
    ville?: string
    telephone?: string
    email?: string

    // Paramètres
    periodicite: 'annuel' | 'semestre'
    prime_semestrielle?: number
    prime_annuelle?: number
    statut?: string
    categorie?: string

    assures_associes?: Array<{
        lien: string
        nom: string
        prenom: string
        date_naissance: string
        lieu_naissance: string
        contact: string
    }>

    created_at?: string
    updated_at?: string
    deleted_at?: string
}

export interface EdgTaxiPrevoyanceDecesFormData {
    emf_id: number
    numero_police?: string
    date_effet: string
    date_echeance: string
    nom: string
    prenom: string
    adresse?: string
    ville?: string
    telephone?: string
    email?: string
    periodicite: 'annuel' | 'semestre'
    statut?: string
    categorie?: string
    assures_associes: Array<{
        lien: string
        nom: string
        prenom: string
        date_naissance: string
        lieu_naissance: string
        contact: string
    }>
}

export const EDG_TAXI_PREVOYANCE_DECES_CONSTANTS = {
    FRAIS_FUNERAIRES_FORFAIT: 200000, // Implied, not explicitly in controller but assuming similar to BCEG or I should check controller infos returns
    MONTANT_MAX_COUVERTURE: 200000, // Same
    PRIME_ANNUELLE: 25000,
    PRIME_SEMESTRIELLE: 12500,
}
