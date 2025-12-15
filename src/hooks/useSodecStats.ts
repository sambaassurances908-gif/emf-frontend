import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export const useSodecStats = (emfId: number = 5) => {
  return useQuery({
    queryKey: ['sodec-stats', emfId],
    queryFn: async () => {
      // ✅ SANS /api/ car baseURL l'ajoute
      const response = await api.get('/sodec/contrats/statistiques/global', {
        params: { emf_id: emfId }
      })
      return response.data.data
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
    enabled: !!emfId,
  })
}
