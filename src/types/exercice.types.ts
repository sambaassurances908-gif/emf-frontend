export interface Exercice {
    id: number;
    annee: number;
    date_debut: string;
    date_fin: string;
    statut: 'ouvert' | 'cloture';
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface ExerciceDashboardStats {
    exercice_courant: Exercice;
    stats_globales: {
        total_primes: number;
        total_sinistres: number;
        marge: number;
        ratio_sp: number;
        progression_annuelle: number;
    };
    historique_recent: Exercice[];
}

export interface ExerciceComparaison {
    annee: number;
    total_primes: number;
    total_sinistres: number;
    marge: number;
}

export interface RapportExercice {
    exercice: Exercice;
    production: {
        nombre_contrats: number;
        total_primes_emises: string;
    };
    repartition_contrats: Record<string, number>;
    sinistralite: {
        nombre_sinistres: number;
        total_declares: string;
        total_payes: string;
        provisions: string;
        ratio_sp: string;
    };
    resultat_technique: {
        primes: string;
        sinistres: string;
        marge: number;
    };
}

export interface CreateExercicePayload {
    annee: number;
    date_debut: string;
    date_fin: string;
}

export interface UpdateExercicePayload {
    annee?: number;
    date_debut?: string;
    date_fin?: string;
}

export interface CloturerExercicePayload {
    confirmer: boolean;
    notes: string;
}

export interface ReouvrirExercicePayload {
    motif: string;
}
