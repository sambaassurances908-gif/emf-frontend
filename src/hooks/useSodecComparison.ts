import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { SodecContrat } from '@/types/sodec'

export const useSodecComparison = (params: {
  montant_pret: number
  nombre_adultes: number
  nombre_enfants: number
}) => {
  return useQuery({
    queryKey: ['sodec-comparison', params],
    queryFn: async () => {
      const response = await api.post('/api/sodec/comparer-options-prevoyance', params)
      return response.data.comparaison
    },
    enabled: params.montant_pret > 0 && params.nombre_adultes > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
