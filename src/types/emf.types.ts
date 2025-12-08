export interface Emf {
  id: number;
  raison_sociale: string;
  sigle: string;
  type: 'emf' | 'banque';
  adresse: string;
  ville: string;
  telephone: string;
  email: string;
  statut: 'actif' | 'inactif' | 'suspendu';
  montant_max_pret: number;
  duree_max_pret_mois: number;
  taux_commission: number;
  created_at: string;
  contrats_count?: number;
}

export interface EmfStats {
  total_contrats: number;
  contrats_actifs: number;
  montant_total_assure: number;
  sinistres_en_cours: number;
  taux_sinistralite?: number;
  evolution?: EvolutionData[];
  utilisateurs?: UserData[];
}

interface EvolutionData {
  mois: string;
  nouveaux: number;
  actifs: number;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
}
