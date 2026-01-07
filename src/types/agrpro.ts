// types/agrpro.ts
// Types pour AGR PRO EMF (emf_id = 8)

export interface AgrProEmfResume {
    emf_id: number
    total: number
    montant_total: number
    emf: {
        id: number
        raison_sociale: string
        sigle: string
    }
}

export interface AgrProDashboardStats {
    total: number
    actifs: number
    en_attente: number
    resilie: number
    expire_30_jours: number
    montant_total_assure: number
    cotisation_totale: number
    montant_moyen_pret: number
    par_ville: Record<string, number>
    par_emf: AgrProEmfResume[]
    par_categorie?: {
        commercants: number
        salaries_public: number
        salaries_prive: number
        retraites: number
        autre: number
    }
}

export interface AgrProContrat {
    id: number
    emf_id: number
    numero_police?: string | null

    // Informations du prêt
    montant_pret_assure: number
    duree_pret: number
    date_effet: string
    date_fin_echeance?: string | null

    // Informations de l'assuré
    nom: string
    prenom: string
    nom_prenom?: string
    adresse?: string | null
    ville?: string | null
    telephone?: string | null
    email?: string | null

    // Bénéficiaire prévoyance
    beneficiaire_prevoyance_nom?: string | null
    beneficiaire_prevoyance_prenom?: string | null
    beneficiaire_prevoyance_telephone?: string | null

    // Calculs financiers
    taux_pret?: number   // 3%
    prime_unique?: number // 5000 FCFA
    prime_variable?: number
    prime_totale?: number
    montant_prevoyance_forfaitaire?: number // 25000 FCFA

    // Statut
    statut: 'actif' | 'en_attente' | 'resilie' | 'termine' | 'sinistre'
    observations?: string | null

    // Relations
    emf: {
        id: number
        raison_sociale: string
        sigle: string
    }
    user?: any
    created_by?: any
    updated_by?: any
    created_at?: string
    updated_at?: string
}

export interface AgrProContratCreatePayload {
    emf_id: number
    numero_police?: string
    montant_pret_assure: number
    duree_pret: number
    date_effet: string
    date_fin_echeance?: string
    nom: string
    prenom: string
    adresse?: string
    ville?: string
    telephone?: string
    email?: string
    beneficiaire_prevoyance_nom?: string
    beneficiaire_prevoyance_prenom?: string
    beneficiaire_prevoyance_telephone?: string
    taux_pret?: number
    prime_unique?: number
    montant_prevoyance_forfaitaire?: number
}

export interface ApiResponse<T> {
    success: boolean
    data?: T
    message?: string
    total?: number
}

export interface PaginatedResponse<T> {
    success: boolean
    data: {
        current_page: number
        data: T[]
        last_page: number
        total: number
    }
}
