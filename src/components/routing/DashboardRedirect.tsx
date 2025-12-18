import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

/**
 * Composant de redirection vers le dashboard approprié
 * Priorité de redirection :
 * 1. Rôle spécifique (comptable → /comptable)
 * 2. EMF associé (emf_id → /dashboard/{emf})
 * 3. Dashboard général (/dashboard)
 */
export const DashboardRedirect = () => {
  const { user, isAuthenticated } = useAuthStore()

  // Si pas authentifié, rediriger vers login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  // ============================================
  // 1. REDIRECTION PAR RÔLE SPÉCIFIQUE
  // ============================================
  
  // FPDG (Fondé de Pouvoir Délégué Général) → Dashboard FPDG
  if (user.role === 'fpdg') {
    return <Navigate to="/fpdg" replace />
  }
  
  // Comptable → Dashboard comptable directement
  if (user.role === 'comptable') {
    return <Navigate to="/comptable" replace />
  }

  // Lecteur → Dashboard en lecture seule (dashboard général)
  if (user.role === 'lecteur') {
    // Si le lecteur a un EMF associé, rediriger vers ce dashboard
    if (user.emf_id && user.emf_id > 0) {
      const emfDashboardMap: Record<number, string> = {
        1: '/dashboard/bamboo',
        2: '/dashboard/cofidec',
        3: '/dashboard/bceg',
        4: '/dashboard/edg',
        5: '/dashboard/sodec',
      }
      if (emfDashboardMap[user.emf_id]) {
        return <Navigate to={emfDashboardMap[user.emf_id]} replace />
      }
    }
    return <Navigate to="/dashboard" replace />
  }

  // ============================================
  // 2. REDIRECTION PAR EMF (système existant)
  // ============================================
  
  const emfDashboardMap: Record<number, string> = {
    1: '/dashboard/bamboo',   // BAMBOO EMF
    2: '/dashboard/cofidec',  // COFIDEC
    3: '/dashboard/bceg',     // BCEG
    4: '/dashboard/edg',      // EDG
    5: '/dashboard/sodec',    // SODEC
  }

  // Si l'utilisateur a un emf_id valide (> 0), rediriger vers son dashboard spécifique
  if (user.emf_id && user.emf_id > 0 && emfDashboardMap[user.emf_id]) {
    return <Navigate to={emfDashboardMap[user.emf_id]} replace />
  }

  // ============================================
  // 3. DASHBOARD GÉNÉRAL (admin, fpdg, gestionnaire sans EMF)
  // ============================================
  return <Navigate to="/dashboard" replace />
}
