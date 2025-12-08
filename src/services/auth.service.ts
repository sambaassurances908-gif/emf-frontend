import api from '@/lib/api'
import { AxiosError } from 'axios'
import type {
  LoginCredentials,
  LoginResponse,
  RegisterData,
  ErrorResponse,
  User,
} from '@/types/auth.types'

/**
 * Service d'authentification
 */
export const authService = {
  /**
   * Connexion d'un utilisateur
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      console.log('🔐 Envoi requête login:', { email: credentials.email })
      
      const response = await api.post<LoginResponse>('/auth/login', credentials)
      
      // 🔍 LOGS DE DEBUG
      console.log('📦 Réponse complète:', response)
      console.log('📦 Status HTTP:', response.status)
      console.log('📦 Headers:', response.headers)
      console.log('📦 Data reçue:', response.data)
      console.log('📦 Type de data:', typeof response.data)
      
      const data = response.data

      // Format 1: { success: true, token, user }
      if (data.success && data.token && data.user) {
        console.log('✅ Format détecté: { success, token, user }')
        console.log('✅ Token:', data.token.substring(0, 20) + '...')
        console.log('✅ User:', data.user)
        return data
      }

      // Format 2: { data: { token, user } }
      if ('data' in data && typeof data.data === 'object') {
        console.log('✅ Format détecté: { data: { token, user } }')
        const innerData = data.data as { token?: string; access_token?: string; user: User }
        const token = innerData.token || innerData.access_token
        
        if (token && innerData.user) {
          console.log('✅ Token:', token.substring(0, 20) + '...')
          console.log('✅ User:', innerData.user)
          return {
            success: true,
            token,
            user: innerData.user,
          }
        }
      }

      // Format 3: { token, user } (sans success)
      if ('token' in data && 'user' in data) {
        console.log('✅ Format détecté: { token, user }')
        console.log('✅ Token:', (data as { token: string }).token.substring(0, 20) + '...')
        console.log('✅ User:', (data as { user: User }).user)
        return {
          success: true,
          token: (data as { token: string }).token,
          user: (data as { user: User }).user,
        }
      }

      // Format 4: { access_token, user }
      if ('access_token' in data && 'user' in data) {
        console.log('✅ Format détecté: { access_token, user }')
        const token = (data as { access_token: string }).access_token
        console.log('✅ Token:', token.substring(0, 20) + '...')
        console.log('✅ User:', (data as { user: User }).user)
        return {
          success: true,
          token,
          user: (data as { user: User }).user,
        }
      }

      // ❌ Format non reconnu
      console.error('❌ Format de réponse NON RECONNU')
      console.error('❌ Clés disponibles:', Object.keys(data))
      console.error('❌ Data complète:', JSON.stringify(data, null, 2))
      throw new Error('Format de réponse invalide')
      
    } catch (error) {
      console.error('❌ ERREUR COMPLÈTE:', error)
      
      const axiosError = error as AxiosError<ErrorResponse>
      
      if (axiosError.response) {
        console.error('❌ Réponse erreur serveur:', {
          status: axiosError.response.status,
          statusText: axiosError.response.statusText,
          data: axiosError.response.data,
          headers: axiosError.response.headers,
        })
      } else if (axiosError.request) {
        console.error('❌ Pas de réponse du serveur')
        console.error('❌ Request:', axiosError.request)
      } else {
        console.error('❌ Erreur config:', axiosError.message)
      }
      
      const message = 
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        axiosError.message ||
        'Erreur de connexion'
      throw new Error(message)
    }
  },

  /**
   * Inscription d'un nouvel utilisateur
   */
  async register(data: RegisterData): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/auth/register', data)
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>
      
      // Gérer les erreurs de validation
      if (axiosError.response?.data?.errors) {
        const errors = Object.values(axiosError.response.data.errors).flat()
        throw new Error(errors.join(', '))
      }
      
      const message = 
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Erreur lors de l'inscription"
      throw new Error(message)
    }
  },

  /**
   * Déconnexion
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  },

  /**
   * Récupérer l'utilisateur connecté
   */
  async me(): Promise<User> {
    try {
      const response = await api.get<{ data: User } | { user: User } | User>('/auth/me')
      
      // Format 1: { data: user }
      if ('data' in response.data && typeof response.data.data === 'object') {
        return response.data.data
      }
      
      // Format 2: { user: user }
      if ('user' in response.data) {
        return response.data.user
      }
      
      // Format 3: user directement
      return response.data as User
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>
      const message = 
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        'Non authentifié'
      throw new Error(message)
    }
  },

  /**
   * Rafraîchir le token
   */
  async refresh(): Promise<{ token: string }> {
    try {
      const response = await api.post<{ token: string }>('/auth/refresh')
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>
      const message = 
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        'Erreur de rafraîchissement'
      throw new Error(message)
    }
  },

  /**
   * Demander la réinitialisation du mot de passe
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>('/auth/forgot-password', {
        email,
      })
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>
      const message = 
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        'Erreur lors de la demande'
      throw new Error(message)
    }
  },

  /**
   * Réinitialiser le mot de passe
   */
  async resetPassword(data: {
    token: string
    email: string
    password: string
    password_confirmation: string
  }): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>('/auth/reset-password', data)
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>
      const message = 
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        'Erreur lors de la réinitialisation'
      throw new Error(message)
    }
  },
}
