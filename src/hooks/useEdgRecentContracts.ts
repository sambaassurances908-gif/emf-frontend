// hooks/useEdgRecentContracts.ts
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { EdgContrat } from '@/types/edg'

export const useEdgRecentContracts = (emfId: number, limit = 5) => {
  return useQuery<EdgContrat[]>({
    queryKey: ['edg-recent-contracts', emfId, limit],
    queryFn: async () => {
      const res = await api.get(`/edg/contrats?emf_id=${emfId}&limit=${limit}&page=1`)
      const payload = res.data

      if (!payload.success) {
        throw new Error(payload.message || 'Erreur API contrats EDG')
      }

      const raw = payload.data

      // Sécurisation : toujours renvoyer un tableau
      if (Array.isArray(raw)) {
        return raw as EdgContrat[]
      }

      if (raw == null) {
        return []
      }

      return [raw as EdgContrat]
    },
    enabled: !!emfId,
  })
}

export default useEdgRecentContracts
