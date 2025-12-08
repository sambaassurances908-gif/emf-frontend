/**
 * Types pour l'authentification
 */

/**
 * Interface User - Utilisateur de l'application
 */
export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'emf_user' | 'bank_user' | 'assureur'
  emf_id?: number | null
  emf?: {
    id: number
    raison_sociale: string
    sigle: string
    type: string
  } | null
  statut: 'actif' | 'inactif' | 'suspendu'
  last_login?: string | null
  created_at: string
  updated_at?: string | null
}

/**
 * Credentials de connexion
 */
export interface LoginCredentials {
  email: string
  password: string
}

/**
 * Réponse du backend lors de la connexion
 */
export interface LoginResponse {
  success: boolean
  token: string
  user: User
}

/**
 * Alternative: Réponse du backend (format sans success)
 */
export interface AuthResponse {
  token: string
  user: User
}

/**
 * Données d'inscription
 */
export interface RegisterData {
  name: string
  email: string
  password: string
  password_confirmation: string
  role?: 'admin' | 'emf_user' | 'bank_user' | 'assureur'
  emf_id?: number | null
}

/**
 * Réponse d'erreur du backend
 */
export interface ErrorResponse {
  message?: string
  error?: string
  errors?: Record<string, string[]>
}

/**
 * Statistiques utilisateurs
 */
export interface UserStats {
  total: number
  admins: number
  emf_users: number
  bank_users: number
  assureurs: number
  actifs: number
}
