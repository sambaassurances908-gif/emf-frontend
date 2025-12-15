import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export const useSodecRecentContracts = (emfId: number = 5, limit: number = 5) => {
  return useQuery({
    queryKey: ['sodec-recent-contracts', emfId, limit],
    queryFn: async () => {
      // ✅ SANS /api/ car baseURL l'ajoute
      const response = await api.get('/sodec/contrats', {
        params: { 
          emf_id: emfId,
          per_page: limit,
          orderBy: 'created_at',
          orderDirection: 'desc'
        }
      })
      return response.data.data
    },
    staleTime: 2 * 60 * 1000,
    retry: 2,
    enabled: !!emfId,
  })
}
