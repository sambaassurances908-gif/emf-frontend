// hooks/useBambooContrat.ts
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { BambooContrat } from '@/types/bamboo'

export const useBambooContrat = (id: string | number) => {
  return useQuery<BambooContrat>({
    queryKey: ['bamboo-contrat', id],
    queryFn: async () => {
      const res = await api.get(`/bamboo-emf/contrats/${id}`)
      const payload = res.data
      if (!payload.success) {
        throw new Error(payload.message || 'Erreur API contrat')
      }
      return payload.data as BambooContrat
    },
    enabled: !!id,
  })
}
