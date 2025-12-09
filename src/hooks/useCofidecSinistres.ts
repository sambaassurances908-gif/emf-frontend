// src/hooks/useCofidecSinistres.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/lib/axios'
import { sinistreService } from '@/services/sinistre.service'
import { SinistreCreatePayload, CofidecSinistre } from '@/types/sinistre.types'

/**
 * Hook pour récupérer les contrats COFIDEC actifs (pour le sélecteur du formulaire)
 */
export const useCofidecContratsForSinistre = (emfId: number) => {
  return useQuery({
    queryKey: ['cofidec-contrats-for-sinistre', emfId],
    queryFn: async () => {
      const { data } = await axios.get('/cofidec/contrats', {
        params: { emf_id: emfId, statut: 'actif', per_page: 100 },
      })
      return data.data?.data || data.data || []
    },
  })
}

/**
 * Hook pour récupérer les sinistres COFIDEC
 */
export const useCofidecSinistres = (params?: { page?: number; statut?: string }) => {
  return useQuery({
    queryKey: ['cofidec-sinistres', params],
    queryFn: async () => {
      const response = await sinistreService.getAll({
        contrat_type: 'ContratCofidec',
        ...params,
      })
      return response
    },
  })
}

/**
 * Hook pour créer un sinistre COFIDEC
 * Utilise le service sinistre générique avec contrat_type = 'ContratCofidec'
 */
export const useCreateCofidecSinistre = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Omit<SinistreCreatePayload, 'contrat_type'>) => {
      const fullPayload: SinistreCreatePayload = {
        ...payload,
        contrat_type: 'ContratCofidec',
      }
      return sinistreService.create(fullPayload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sinistres'] })
      queryClient.invalidateQueries({ queryKey: ['cofidec-sinistres'] })
    },
  })
}
