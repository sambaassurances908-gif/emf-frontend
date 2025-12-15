export interface ContratRecent {
  id: number;
  numero_police: string;
  nom_prenom: string;
  montant_pret_assure: number;
  statut: string;
  created_at: string;
  emf?: {
    sigle: string;
  };
}

export interface SinistreRecent {
  id: number;
  numero_sinistre: string;
  numero_police: string;
  type_sinistre: string;
  montant_reclame: number;
  statut: string;
  date_declaration: string;
  created_at: string;
}

export interface EvolutionContrat {
  mois: string;
  nouveaux: number;
  total?: number;
  resilie: number;
}

export interface LocalisationStats {
  ville?: string;
  localisation?: string;
  nombre: number;
}

export interface GenreStats {
  hommes: number;
  femmes: number;
  non_determine: number;
}

export interface CategorieSocioPro {
  categorie: string;
  nombre: number;
}

export interface EmfStats {
  emf_id: number;
  emf?: {
    sigle: string;
  };
  total: number;
  montant_total: number;
}

export interface AgenceStats {
  agence: string;
  nombre: number;
}

export interface DashboardStats {
  contrats_actifs: number;
  montant_total_assure: number;
  sinistres_en_cours: number;
  taux_reglement: number;
  contrats_en_attente?: number;
  contrats_expires_mois?: number;
  prime_totale_collectee?: number;
  evolution_contrats: EvolutionContrat[];
  par_emf: EmfStats[];
  par_localisation?: LocalisationStats[];
  par_agence?: AgenceStats[];
  par_genre?: GenreStats;
  par_categorie_socio_pro?: CategorieSocioPro[];
  contrats_recents: ContratRecent[];
  sinistres_recents: SinistreRecent[];
}

export interface Contrat {
  id: number;
  nom_prenom: string;
  type: string;
  montant: number;
  statut: string;
  date_effet: string; // C'est ici que le formatage posait problème
}

// Dans ton fichier types/dashboard.types.ts, ajoute :
export interface BambooDashboardStats {
  total_contrats: number
  contrats_actifs: number
  contrats_suspendus: number
  contrats_resilies: number
  montant_total_assure: number
  montant_primes_collectees: number
  sinistres_en_cours: number
  sinistres_regles: number
  taux_sinistralite: number
  nouveaux_contrats_mois: number
}

export interface BambooContratRecent {
  id: number
  numero_contrat: string  // ou numero_police selon ton backend
  nom_assure: string      // ou nom_prenom
  prenom_assure: string   // ou inclus dans nom_prenom
  montant_assure: number  // ou montant_pret_assure
  statut: string
  date_effet: string
  created_at: string
}
