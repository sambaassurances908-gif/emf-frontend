import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

interface DashboardStats {
  total_contrats: number
  contrats_actifs: number
  contrats_suspendus: number
  contrats_resilies: number
  montant_total_assure: number
  montant_primes_collectees: number
  sinistres_en_cours: number
  sinistres_regles: number
  taux_sinistralite: number
  nouveaux_contrats_mois: number
}

export const useDashboardStats = (emfId: number) => {
  return useQuery({
    queryKey: ['dashboard-stats', emfId],
    queryFn: async () => {
      const response = await api.get<{ data: DashboardStats }>(
        `/dashboard/stats?emf_id=${emfId}`
      )
      return response.data.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
