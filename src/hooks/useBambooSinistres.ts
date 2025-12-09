// src/hooks/useBambooSinistres.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/lib/axios'
import { sinistreService } from '@/services/sinistre.service'
import { SinistreCreatePayload, BambooSinistre } from '@/types/sinistre.types'

/**
 * Hook pour récupérer les contrats BAMBOO actifs (pour le sélecteur du formulaire)
 */
export const useBambooContratsForSinistre = (emfId: number) => {
  return useQuery({
    queryKey: ['bamboo-contrats-for-sinistre', emfId],
    queryFn: async () => {
      const { data } = await axios.get('/bamboo-emf/contrats', {
        params: { emf_id: emfId, statut: 'actif', per_page: 100 },
      })
      return data.data?.data || data.data || []
    },
  })
}

/**
 * Hook pour récupérer les sinistres BAMBOO
 */
export const useBambooSinistres = (params?: { page?: number; statut?: string }) => {
  return useQuery({
    queryKey: ['bamboo-sinistres', params],
    queryFn: async () => {
      const response = await sinistreService.getAll({
        contrat_type: 'ContratBambooEmf',
        ...params,
      })
      return response
    },
  })
}

/**
 * Hook pour créer un sinistre BAMBOO
 * Utilise le service sinistre générique avec contrat_type = 'ContratBambooEmf'
 */
export const useCreateBambooSinistre = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Omit<SinistreCreatePayload, 'contrat_type'>) => {
      const fullPayload: SinistreCreatePayload = {
        ...payload,
        contrat_type: 'ContratBambooEmf',
      }
      return sinistreService.create(fullPayload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sinistres'] })
      queryClient.invalidateQueries({ queryKey: ['bamboo-sinistres'] })
    },
  })
}
