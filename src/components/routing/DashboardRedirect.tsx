import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

/**
 * Composant de redirection vers le dashboard spécifique à l'EMF
 */
export const DashboardRedirect = () => {
  const { user, isAuthenticated } = useAuthStore()

  // Si pas authentifié, rediriger vers login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  // Redirection selon l'EMF de l'utilisateur
  const emfDashboardMap: Record<number, string> = {
    1: '/dashboard/bamboo',   // BAMBOO EMF
    2: '/dashboard/cofidec',  // COFIDEC
    3: '/dashboard/bceg',     // BCEG
    4: '/dashboard/edg',      // EDG
    5: '/dashboard/sodec',    // SODEC
  }

  // Si l'utilisateur a un emf_id, rediriger vers son dashboard spécifique
  if (user.emf_id && emfDashboardMap[user.emf_id]) {
    return <Navigate to={emfDashboardMap[user.emf_id]} replace />
  }

  // Sinon (admin ou sans EMF), dashboard général
  return <Navigate to="/dashboard" replace />
}
