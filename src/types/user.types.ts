export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'emf_user' | 'bank_user' | 'assureur';
  emf_id?: number; // Ajouté ici, optionnel
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


export interface UserStats {
  total: number;      // Total des utilisateurs enregistrés
  admins: number;     // Nombre d'administrateurs
  emf_users: number;  // Nombre d'utilisateurs liés aux EMF
  bank_users: number; // Nombre d'utilisateurs banques
  assureurs: number;  // Nombre d'utilisateurs assureurs
  actifs: number;     // Nombre d'utilisateurs au statut actif
}
