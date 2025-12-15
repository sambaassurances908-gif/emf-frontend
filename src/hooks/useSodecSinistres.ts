// src/hooks/useSodecSinistres.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/lib/axios'
import { sinistreService } from '@/services/sinistre.service'
import type { SinistreCreatePayload } from '@/types/sinistre.types'

/**
 * Hook pour récupérer les contrats SODEC actifs (pour le sélecteur du formulaire)
 */
export const useSodecContratsForSinistre = (emfId: number) => {
  return useQuery({
    queryKey: ['sodec-contrats-for-sinistre', emfId],
    queryFn: async () => {
      const { data } = await axios.get('/sodec/contrats', {
        params: { emf_id: emfId, statut: 'actif', per_page: 100 },
      })
      return data.data?.data || data.data || []
    },
  })
}

/**
 * Hook pour récupérer les sinistres SODEC
 */
export const useSodecSinistres = (params?: { page?: number; statut?: string }) => {
  return useQuery({
    queryKey: ['sodec-sinistres', params],
    queryFn: async () => {
      const response = await sinistreService.getAll({
        contrat_type: 'ContratSodec',
        ...params,
      })
      return response
    },
  })
}

/**
 * Hook pour créer un sinistre SODEC
 * Utilise le service sinistre générique avec contrat_type = 'ContratSodec'
 */
export const useCreateSodecSinistre = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Omit<SinistreCreatePayload, 'contrat_type'>) => {
      const fullPayload: SinistreCreatePayload = {
        ...payload,
        contrat_type: 'ContratSodec',
      }
      return sinistreService.create(fullPayload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sinistres'] })
      queryClient.invalidateQueries({ queryKey: ['sodec-sinistres'] })
    },
  })
}
