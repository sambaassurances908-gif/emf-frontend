// src/hooks/useEdgSinistres.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/lib/axios'
import { sinistreService } from '@/services/sinistre.service'
import { SinistreCreatePayload, EdgSinistre } from '@/types/sinistre.types'

/**
 * Hook pour récupérer les contrats EDG actifs (pour le sélecteur du formulaire)
 */
export const useEdgContratsForSinistre = (emfId: number) => {
  return useQuery({
    queryKey: ['edg-contrats-for-sinistre', emfId],
    queryFn: async () => {
      const { data } = await axios.get('/edg/contrats', {
        params: { emf_id: emfId, statut: 'actif', per_page: 100 },
      })
      return data.data?.data || data.data || []
    },
  })
}

/**
 * Hook pour récupérer les sinistres EDG
 */
export const useEdgSinistres = (params?: { page?: number; statut?: string }) => {
  return useQuery({
    queryKey: ['edg-sinistres', params],
    queryFn: async () => {
      const response = await sinistreService.getAll({
        contrat_type: 'ContratEdg',
        ...params,
      })
      return response
    },
  })
}

/**
 * Hook pour créer un sinistre EDG
 * Utilise le service sinistre générique avec contrat_type = 'ContratEdg'
 */
export const useCreateEdgSinistre = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Omit<SinistreCreatePayload, 'contrat_type'>) => {
      const fullPayload: SinistreCreatePayload = {
        ...payload,
        contrat_type: 'ContratEdg',
      }
      return sinistreService.create(fullPayload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sinistres'] })
      queryClient.invalidateQueries({ queryKey: ['edg-sinistres'] })
    },
  })
}
