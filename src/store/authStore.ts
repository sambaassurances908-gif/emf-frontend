import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'
import { authService } from '@/services/auth.service'
import type { User, LoginCredentials, UserRole } from '@/types/auth.types'

// Rôles avec permissions spécifiques pour les sinistres
const ROLES_VALIDATION_SINISTRE: UserRole[] = ['admin', 'fpdg', 'gestionnaire']
const ROLES_PAIEMENT_QUITTANCE: UserRole[] = ['admin', 'fpdg', 'comptable']
const ROLES_CLOTURE_SINISTRE: UserRole[] = ['admin', 'fpdg']
const ROLES_LECTURE_SEULE: UserRole[] = ['lecteur']

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  isAdmin: () => boolean
  getDashboardPath: () => string
  // Permissions sinistres (Règle D)
  peutValiderSinistre: () => boolean
  peutPayerQuittance: () => boolean
  peutCloturerSinistre: () => boolean
  estLecteurSeul: () => boolean
  hasRole: (roles: UserRole | UserRole[]) => boolean
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

      // ← NOUVEAU : Fonction pour obtenir le chemin du dashboard selon le rôle et l'EMF
      getDashboardPath: () => {
        const user = get().user
        
        if (!user) return '/login'

        // ============================================
        // 1. REDIRECTION PAR RÔLE SPÉCIFIQUE
        // ============================================
        
        // Comptable → Dashboard comptable directement
        if (user.role === 'comptable') {
          return '/comptable'
        }

        // ============================================
        // 2. REDIRECTION PAR EMF (pour les autres rôles)
        // ============================================
        
        // Mapping des EMF vers leurs dashboards
        const emfDashboardMap: Record<number, string> = {
          1: '/dashboard/bamboo',
          2: '/dashboard/cofidec',
          3: '/dashboard/bceg',
          4: '/dashboard/edg',
          5: '/dashboard/sodec',
        }

        // Si l'utilisateur a un emf_id valide (> 0), retourner son dashboard spécifique
        if (user.emf_id && user.emf_id > 0 && emfDashboardMap[user.emf_id]) {
          return emfDashboardMap[user.emf_id]
        }

        // ============================================
        // 3. DASHBOARD GÉNÉRAL (admin, fpdg, gestionnaire sans EMF)
        // ============================================
        return '/dashboard'
      },

      // ==========================================
      // Permissions Sinistres (Règle D)
      // ==========================================

      /**
       * Vérifie si l'utilisateur peut valider un sinistre
       * Rôles autorisés: admin, fpdg, gestionnaire
       */
      peutValiderSinistre: () => {
        const role = get().user?.role
        return role ? ROLES_VALIDATION_SINISTRE.includes(role) : false
      },

      /**
       * Vérifie si l'utilisateur peut payer une quittance
       * Rôles autorisés: admin, fpdg, comptable
       */
      peutPayerQuittance: () => {
        const role = get().user?.role
        return role ? ROLES_PAIEMENT_QUITTANCE.includes(role) : false
      },

      /**
       * Vérifie si l'utilisateur peut clôturer un sinistre
       * Rôles autorisés: admin, fpdg uniquement
       */
      peutCloturerSinistre: () => {
        const role = get().user?.role
        return role ? ROLES_CLOTURE_SINISTRE.includes(role) : false
      },

      /**
       * Vérifie si l'utilisateur est en lecture seule
       */
      estLecteurSeul: () => {
        const role = get().user?.role
        return role ? ROLES_LECTURE_SEULE.includes(role) : false
      },

      /**
       * Vérifie si l'utilisateur a un ou plusieurs rôles
       */
      hasRole: (roles: UserRole | UserRole[]) => {
        const userRole = get().user?.role
        if (!userRole) return false
        const rolesArray = Array.isArray(roles) ? roles : [roles]
        return rolesArray.includes(userRole)
      },

      initialize: () => {
        console.log('🔄 Initialisation du store auth...')
        const token = localStorage.getItem('token')
        const userStr = localStorage.getItem('user')
        
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr) as User
            
            // Pour les admins, s'assurer que emf_id est null
            if (user.role === 'admin') {
              user.emf_id = null;
              user.emf = null;
            }
            
            console.log('✅ User restauré:', user, '| emf_id:', user.emf_id)
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
          
          // IMPORTANT: Réinitialiser COMPLÈTEMENT le store AVANT l'appel API
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          })
          
          // Nettoyer TOUT le localStorage
          localStorage.clear()
          
          const response = await authService.login(credentials)
          const { token, user } = response
          
          console.log('📥 Réponse backend complète:', JSON.stringify(user, null, 2))
          
          if (!token || !user) {
            throw new Error('Réponse serveur invalide')
          }

          // Déterminer le emf_id correct
          // Pour les admins SAMBA (role = 'admin'), on force emf_id à null
          let finalEmfId: number | null = null;
          
          if (user.role !== 'admin') {
            // Pour les utilisateurs non-admin, prendre le emf_id du backend
            finalEmfId = user.emf_id ?? user.emf?.id ?? null;
          }
          
          console.log('🔍 Role:', user.role, '| Backend emf_id:', user.emf_id, '| emf.id:', user.emf?.id, '| emf.sigle:', user.emf?.sigle, '| Final emf_id:', finalEmfId);

          // Construire l'objet user complet
          const userWithEmf: User = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            emf_id: finalEmfId,
            emf: user.role === 'admin' ? null : (user.emf ?? null),
            statut: user.statut || 'actif',
            last_login: user.last_login ?? null,
            created_at: user.created_at || new Date().toISOString(),
            updated_at: user.updated_at ?? null,
          }

          console.log('✅ User traité:', userWithEmf)
          console.log('📍 EMF ID:', userWithEmf.emf_id, '| EMF sigle:', userWithEmf.emf?.sigle)

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
