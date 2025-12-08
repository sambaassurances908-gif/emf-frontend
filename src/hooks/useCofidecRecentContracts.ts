// hooks/useCofidecRecentContracts.ts
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { CofidecContrat } from '@/types/cofidec'

export const useCofidecRecentContracts = (emfId: number, limit = 5) => {
  return useQuery<CofidecContrat[]>({
    queryKey: ['cofidec-recent-contracts', emfId, limit],
    queryFn: async () => {
      const res = await api.get(`/cofidec/contrats?emf_id=${emfId}&limit=${limit}&page=1`)
      const payload = res.data

      if (!payload.success) {
        throw new Error(payload.message || 'Erreur API contrats COFIDEC')
      }

      const raw = payload.data

      // Sécurisation : toujours renvoyer un tableau
      if (Array.isArray(raw)) {
        return raw as CofidecContrat[]
      }

      if (raw == null) {
        return []
      }

      return [raw as CofidecContrat]
    },
    enabled: !!emfId,
  })
}

export default useCofidecRecentContracts
