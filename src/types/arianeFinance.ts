// types/arianeFinance.ts
// Types pour ARIANE FINANCE EMF (emf_id = 9)

export interface ArianeFinanceEmfResume {
    emf_id: number
    total: number
    montant_total: number
    emf: {
        id: number
        raison_sociale: string
        sigle: string
    }
}

export interface ArianeFinanceDashboardStats {
    total: number
    actifs: number
    en_attente: number
    resilie: number
    expire_30_jours: number
    montant_total_assure: number
    cotisation_totale: number
    montant_moyen_pret: number
    par_ville: Record<string, number>
    par_emf: ArianeFinanceEmfResume[]
    par_categorie?: {
        commercants: number
        salaries_public: number
        salaries_prive: number
        retraites: number
        autre: number
    }
}

export interface ArianeFinanceContrat {
    id: number
    emf_id: number
    numero_police?: string | null

    // Informations du prêt
    montant_pret_assure?: number | null
    duree_pret?: number | null
    date_effet?: string | null
    date_fin_echeance?: string | null

    // Informations de l'assuré
    nom?: string | null
    prenom?: string | null
    nom_prenom?: string | null
    adresse?: string | null
    ville?: string | null
    telephone?: string | null
    email?: string | null

    // Bénéficiaire
    beneficiaire_nom?: string | null
    beneficiaire_prenom?: string | null
    beneficiaire_telephone?: string | null

    // Calculs financiers
    taux_deces_iad?: number  // 1.05%
    prime_totale?: number

    // Statut
    statut: string
    categorie?: string | null
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

export interface ArianeFinanceContratCreatePayload {
    emf_id: number
    numero_police?: string
    montant_pret_assure?: number
    duree_pret?: number
    date_effet?: string
    date_fin_echeance?: string
    nom?: string
    prenom?: string
    adresse?: string
    ville?: string
    telephone?: string
    email?: string
    beneficiaire_nom?: string
    beneficiaire_prenom?: string
    beneficiaire_telephone?: string
    taux_deces_iad?: number
    statut?: string
    categorie?: string
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
