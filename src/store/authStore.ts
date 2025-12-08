import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'
import { authService } from '@/services/auth.service'
import type { User, LoginCredentials } from '@/types/auth.types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  isAdmin: () => boolean
  getDashboardPath: () => string  // ← NOUVEAU
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
  initialize: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      isAdmin: () => get().user?.role === 'admin',

      // ← NOUVEAU : Fonction pour obtenir le chemin du dashboard selon l'EMF
      getDashboardPath: () => {
        const user = get().user
        
        if (!user) return '/login'

        // Mapping des EMF vers leurs dashboards
        const emfDashboardMap: Record<number, string> = {
          1: '/dashboard/bamboo',
          2: '/dashboard/cofidec',
          3: '/dashboard/bceg',
          4: '/dashboard/edg',
          5: '/dashboard/sodec',
        }

        // Si l'utilisateur a un emf_id, retourner son dashboard spécifique
        if (user.emf_id && emfDashboardMap[user.emf_id]) {
          return emfDashboardMap[user.emf_id]
        }

        // Sinon, dashboard général (pour les admins)
        return '/dashboard'
      },

      initialize: () => {
        console.log('🔄 Initialisation du store auth...')
        const token = localStorage.getItem('token')
        const userStr = localStorage.getItem('user')
        
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr) as User
            console.log('✅ User restauré:', user)
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
            })
          } catch (error) {
            console.error('❌ Erreur initialisation:', error)
            localStorage.clear()
            set({ isLoading: false })
          }
        } else {
          console.log('ℹ️ Pas de session')
          set({ isLoading: false })
        }
      },

      login: async (credentials: LoginCredentials) => {
        try {
          console.log('🚀 Login en cours...')
          
          const response = await authService.login(credentials)
          const { token, user } = response
          
          if (!token || !user) {
            throw new Error('Réponse serveur invalide')
          }

          // Construire l'objet user complet
          const userWithEmf: User = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            emf_id: user.emf_id ?? user.emf?.id ?? null,
            emf: user.emf ?? null,
            statut: user.statut || 'actif',
            last_login: user.last_login ?? null,
            created_at: user.created_at || new Date().toISOString(),
            updated_at: user.updated_at ?? null,
          }

          console.log('✅ User traité:', userWithEmf)
          console.log('📍 EMF ID:', userWithEmf.emf_id)

          localStorage.setItem('token', token)
          localStorage.setItem('user', JSON.stringify(userWithEmf))

          set({
            user: userWithEmf,
            token,
            isAuthenticated: true,
          })

          console.log('✅ Login réussi !')
          toast.success(`Bienvenue ${userWithEmf.name} !`)
          
          // NE PAS NAVIGUER ICI - Laisser le composant LoginPage gérer la navigation
        } catch (error: unknown) {
          console.error('❌ Erreur login:', error)
          const err = error as Error
          toast.error(err.message || 'Erreur de connexion')
          throw error
        }
      },

      logout: () => {
        console.log('👋 Déconnexion...')
        authService.logout().catch(() => {})
        localStorage.clear()
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
        toast.success('Déconnexion réussie')
      },

      setUser: (user: User) => {
        const userWithEmf: User = {
          ...user,
          emf_id: user.emf_id ?? user.emf?.id ?? null,
        }
        set({ user: userWithEmf })
        localStorage.setItem('user', JSON.stringify(userWithEmf))
      },
    }),
    {
      name: 'samba-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Initialiser au chargement
if (typeof window !== 'undefined') {
  useAuthStore.getState().initialize()
}
