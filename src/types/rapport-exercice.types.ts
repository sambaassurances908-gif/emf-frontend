import { Exercice } from './exercice.types';

export interface RapportExercice {
    exercice: Exercice;
    production: {
        nombre_contrats: number;
        total_primes_emises: string;
    };
    repartition_contrats: Record<string, number>; // Semble être par EMF dans le log
    repartition_sinistres: Record<string, any>;
    resultat_technique: {
        primes: string;
        sinistres: string;
        marge: number;
    };
    sinistralite: {
        nombre_sinistres: number;
        total_declares: string;
        total_payes: string;
        provisions: string;
        ratio_sp: string;
    };
}
