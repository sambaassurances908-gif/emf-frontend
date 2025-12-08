// hooks/useBcegRecentContracts.ts
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { BcegContrat } from '@/types/bceg'

// ✅ Export nommé du hook
export const useBcegRecentContracts = (emfId: number, limit = 5) => {
  return useQuery<BcegContrat[]>({
    queryKey: ['bceg-recent-contracts', emfId, limit],
    queryFn: async () => {
      const res = await api.get(`/bceg-emf/contrats?emf_id=${emfId}&limit=${limit}&page=1`)
      const payload = res.data

      if (!payload.success) {
        throw new Error(payload.message || 'Erreur API contrats BCEG')
      }

      const raw = payload.data

      // Sécurisation : toujours renvoyer un tableau
      if (Array.isArray(raw)) {
        return raw as BcegContrat[]
      }

      if (raw == null) {
        return []
      }

      return [raw as BcegContrat]
    },
    enabled: !!emfId,
  })
}

// ✅ Export par défaut également (optionnel mais recommandé)
export default useBcegRecentContracts
