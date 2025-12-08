// hooks/useBambooRecentContracts.ts
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { BambooContrat } from '@/types/bamboo'

export const useBambooRecentContracts = (emfId: number, limit = 5) => {
  return useQuery<BambooContrat[]>({
    queryKey: ['bamboo-recent-contracts', emfId, limit],
    queryFn: async () => {
      const res = await api.get(`/bamboo-emf/contrats?emf_id=${emfId}&limit=${limit}&page=1`)
      const payload = res.data

      if (!payload.success) {
        throw new Error(payload.message || 'Erreur API contrats')
      }

      return payload.data as BambooContrat[]
    },
    enabled: !!emfId,
  })
}
