export type UserRole = 'admin' | 'gestionnaire' | 'agent' | 'emf_user' | 'bank_user' | 'assureur';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  emf_id?: number | null;
  emf?: {
    id: number;
    raison_sociale: string;
    sigle: string;
    type: string;
  };
  statut: 'actif' | 'inactif' | 'suspendu';
  last_login?: string;
  created_at: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: UserRole;
  emf_id?: number | null;
  statut?: 'actif' | 'inactif' | 'suspendu';
}

export const USER_ROLES = [
  { value: 'admin' as const, label: 'Administrateur', description: 'Accès complet à toutes les fonctionnalités' },
  { value: 'gestionnaire' as const, label: 'Gestionnaire', description: 'Gestion des contrats et sinistres' },
  { value: 'agent' as const, label: 'Agent', description: 'Saisie et consultation des données' },
] as const;

export const EMF_USER_ROLES = [
  { value: 'gestionnaire' as const, label: 'Gestionnaire EMF', description: 'Gestion complète pour cet EMF' },
  { value: 'agent' as const, label: 'Agent EMF', description: 'Saisie et consultation pour cet EMF' },
] as const;


export interface UserStats {
  total: number;      // Total des utilisateurs enregistrés
  admins: number;     // Nombre d'administrateurs
  emf_users: number;  // Nombre d'utilisateurs liés aux EMF
  bank_users: number; // Nombre d'utilisateurs banques
  assureurs: number;  // Nombre d'utilisateurs assureurs
  actifs: number;     // Nombre d'utilisateurs au statut actif
}
