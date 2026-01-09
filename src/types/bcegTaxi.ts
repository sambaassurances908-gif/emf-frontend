// Types pour les contrats BCEG TAXI

// ============================================
// SAMB'A TAXIS - Perte de Recettes
// ============================================
export interface BcegTaxiPerteRecetteContrat {
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

    // Souscripteur (Distinct from Assuré if necessary)
    souscripteur_nom?: string
    souscripteur_prenom?: string
    souscripteur_date_naissance?: string
    souscripteur_numero_identite?: string
    souscripteur_immatriculation_taxi?: string
    souscripteur_adresse?: string
    souscripteur_bp?: string
    souscripteur_ville?: string
    souscripteur_telephone?: string
    souscripteur_email?: string

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

export interface BcegTaxiPerteRecetteFormData {
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
export const TAXI_PERTE_RECETTE_CONSTANTS = {
    INDEMNITE_JOUR: 5000,
    DUREE_MAX_JOURS: 10,
    PLAFOND_ANNUEL: 50000,
    COTISATION_ANNUELLE: 25000,
    COTISATION_SEMESTRE: 12500,
}

// ============================================
// SAMB'A TAXIS - Prévoyance Décès
// ============================================
export interface BcegTaxiPrevoyanceDecesContrat {
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

export interface BcegTaxiPrevoyanceDecesFormData {
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

// Constantes métier (miroir du backend)
export const TAXI_PREVOYANCE_DECES_CONSTANTS = {
    FRAIS_FUNERAIRES_FORFAIT: 500000,
    MONTANT_MAX_COUVERTURE: 500000,
    PRIME_SEMESTRIELLE: 12500,
    PRIME_ANNUELLE: 25000,
}
