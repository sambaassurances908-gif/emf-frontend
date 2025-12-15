// hooks/useBcegRecentContracts.ts
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { BcegContrat } from '@/types/bceg'

// ✅ Export nommé du hook
export const useBcegRecentContracts = (emfId: number, limit = 5) => {
  return useQuery<BcegContrat[]>({
    queryKey: ['bceg-recent-contracts', emfId, limit],
    queryFn: async () => {
      const res = await api.get(`/bceg/contrats`, {
        params: { emf_id: emfId, per_page: limit, page: 1 }
      })
      const payload = res.data

      console.log('📦 useBcegRecentContracts - Réponse brute:', payload)

      // Gérer différentes structures de réponse API
      let contrats: BcegContrat[] = []

      if (Array.isArray(payload)) {
        // Si la réponse est directement un tableau
        contrats = payload
      } else if (payload?.data) {
        // Si la réponse est { data: [...] } ou { data: { data: [...] } }
        if (Array.isArray(payload.data)) {
          contrats = payload.data
        } else if (Array.isArray(payload.data?.data)) {
          // Structure paginée Laravel: { data: { data: [...], meta: {...} } }
          contrats = payload.data.data
        }
      }

      // Limiter au nombre demandé
      return contrats.slice(0, limit)
    },
    enabled: !!emfId,
  })
}

// ✅ Export par défaut également (optionnel mais recommandé)
export default useBcegRecentContracts
