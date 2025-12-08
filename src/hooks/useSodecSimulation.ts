import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

interface SodecSimulationParams {
  montant_pret: number
  duree_mois: number
  categorie: 'commercants' | 'salaries_public' | 'salaries_prive' | 'retraites' | 'autre'
  option_prevoyance: 'option_a' | 'option_b'
  avec_perte_emploi?: boolean
  nombre_adultes?: number
  nombre_enfants?: number
}

export const useSodecSimulation = (params: SodecSimulationParams) => {
  const queryClient = useQueryClient()
  
  return useQuery({
    queryKey: ['sodec-simulation', params],
    queryFn: async () => {
      const response = await api.post('/api/sodec/simuler-tarification', params)
      return response.data.simulation
    },
    enabled: params.montant_pret > 0 && params.duree_mois > 0 && params.option_prevoyance,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}
