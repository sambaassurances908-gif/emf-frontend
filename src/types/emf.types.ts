export interface Emf {
  id: number;
  raison_sociale: string;
  sigle: string;
  type: 'emf' | 'banque';
  adresse: string;
  ville: string;
  pays?: string;
  boite_postale?: string;
  telephone: string;
  telephone_2?: string;
  email: string;
  site_web?: string;
  numero_agrement?: string;
  registre_commerce?: string;
  date_creation?: string;
  compte_bancaire?: string;
  banque?: string;
  swift_bic?: string;
  contact_nom?: string;
  contact_fonction?: string;
  contact_telephone?: string;
  contact_email?: string;
  montant_max_pret: number;
  duree_max_pret_mois: number;
  taux_interet_moyen?: number;
  taux_commission: number;
  logo?: string;
  description?: string;
  statut: 'actif' | 'inactif' | 'suspendu';
  created_at: string;
  updated_at?: string;
  contrats_count?: number;
}

export interface CreateEmfPayload {
  raison_sociale: string;
  sigle: string;
  type: 'emf' | 'banque';
  adresse: string;
  ville: string;
  pays?: string;
  boite_postale?: string;
  telephone: string;
  telephone_2?: string;
  email: string;
  site_web?: string;
  numero_agrement?: string;
  registre_commerce?: string;
  date_creation?: string;
  compte_bancaire?: string;
  banque?: string;
  swift_bic?: string;
  contact_nom?: string;
  contact_fonction?: string;
  contact_telephone?: string;
  contact_email?: string;
  montant_max_pret?: number;
  duree_max_pret_mois?: number;
  taux_interet_moyen?: number;
  description?: string;
  statut?: 'actif' | 'inactif' | 'suspendu';
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
