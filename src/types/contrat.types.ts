import { Emf } from './emf.types';

export interface ContratBase {
  id: number;
  emf_id: number;
  emf?: Emf;
  numero_police: string;
  montant_pret_assure?: number;
  montant_pret?: number;
  duree_pret_mois: number;
  date_effet: string;
  date_fin_echeance: string;
  statut: 'en_attente' | 'actif' | 'suspendu' | 'resilie' | 'termine' | 'sinistre';
  cotisation_totale_ttc: number;
  created_at: string;
}

export interface ContratBamboo extends ContratBase {
  type: 'ContratBamboo';
  nom_prenom: string;
  telephone_assure: string;
  email_assure?: string;
  adresse_assure: string;
  ville_assure: string;
  categorie: string;
  garantie_perte_emploi: boolean;
  garantie_prevoyance?: boolean;
  garantie_deces_iad?: boolean;
  beneficiaire_prevoyance?: string;
  type_contrat_travail?: string;
  agence?: string;
}

export interface ContratCofidec extends ContratBase {
  type: 'ContratCofidec';
  nom_prenom: string;
  telephone_assure: string;
  email_assure?: string;
  adresse_assure: string;
  ville_assure: string;
  categorie: string;
  garantie_perte_emploi: boolean;
  garantie_prevoyance?: boolean;
  garantie_deces_iad?: boolean;
  taux_applique: number;
  type_contrat_travail?: string;
  agence?: string;
}

export interface ContratBceg extends ContratBase {
  type: 'ContratBceg';
  nom: string;
  prenom: string;
  telephone_assure: string;
  email_assure?: string;
  adresse_assure: string;
  ville_assure: string;
  garantie_deces_iad: boolean;
  garantie_prevoyance: boolean;
  beneficiaire_prevoyance_nom_prenom?: string;
  beneficiaire_prevoyance_adresse?: string;
  beneficiaire_prevoyance_contact?: string;
  agence?: string;
}

export interface AssureAssocie {
  type_assure: 'souscripteur' | 'conjoint' | 'conjoint_2' | 'enfant_1' | 'enfant_2' | 'enfant_3' | 'enfant_4';
  nom: string;
  prenom: string;
  date_naissance?: string;
  lieu_naissance?: string;
  contact?: string;
  adresse?: string;
}

export interface ContratEdg extends ContratBase {
  type: 'ContratEdg';
  nom_prenom: string;
  telephone_assure: string;
  email_assure?: string;
  adresse_assure: string;
  ville_assure: string;
  categorie: string;
  est_vip: boolean;
  garantie_perte_emploi: boolean;
  garantie_prevoyance: boolean;
  garantie_deces_iad: boolean;
  beneficiaire_deces?: string;
  type_contrat_travail?: string;
  agence?: string;
  assures_associes?: AssureAssocie[];
}

export interface ContratSodec extends ContratBase {
  type: 'ContratSodec';
  nom_prenom: string;
  telephone_assure: string;
  email_assure?: string;
  adresse_assure: string;
  ville_assure: string;
  categorie: string;
  option_prevoyance: 'option_a' | 'option_b';
  garantie_perte_emploi: boolean;
  garantie_prevoyance: boolean;
  garantie_deces_iad: boolean;
  beneficiaire_deces?: string;
  type_contrat_travail?: string;
  agence?: string;
  assures_associes?: AssureAssocie[];
}
