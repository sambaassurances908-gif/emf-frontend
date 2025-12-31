// src/hooks/useBcegSinistres.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { sinistreService } from '@/services/sinistre.service'
import { SinistreCreatePayload, BcegSinistreCreatePayload, SinistreStatut } from '@/types/sinistre.types'

// Re-export du type pour faciliter l'import dans les formulaires
export type { BcegSinistreCreatePayload }

/**
 * Hook pour récupérer les contrats BCEG actifs (pour le sélecteur du formulaire)
 */
export const useBcegContratsForSinistre = (emfId: number) => {
  return useQuery({
    queryKey: ['bceg-contrats-for-sinistre', emfId],
    queryFn: async () => {
      console.log('🔍 Récupération contrats BCEG pour sinistre:', { emfId })

      const response = await api.get('/bceg/contrats', {
        params: { emf_id: emfId, per_page: 100 },
      })

      console.log('📦 Contrats BCEG pour sinistre:', response.data)

      // Gérer différentes structures de réponse API
      let contrats = []

      if (Array.isArray(response.data)) {
        contrats = response.data
      } else if (response.data?.data) {
        if (Array.isArray(response.data.data)) {
          contrats = response.data.data
        } else if (Array.isArray(response.data.data?.data)) {
          contrats = response.data.data.data
        }
      }

      // Filtrer uniquement les contrats actifs
      return contrats.filter((c: any) => c.statut === 'actif' || c.statut === 'en_attente')
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook pour récupérer les sinistres BCEG
 */
export const useBcegSinistres = (params?: { page?: number; statut?: SinistreStatut }) => {
  return useQuery({
    queryKey: ['bceg-sinistres', params],
    queryFn: async () => {
      const response = await sinistreService.getAll({
        contrat_type: 'ContratBceg',
        ...params,
      })
      return response
    },
  })
}

/**
 * Hook pour créer un sinistre BCEG
 * Utilise le service sinistre générique avec contrat_type = 'ContratBceg'
 */
export const useCreateBcegSinistre = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Omit<SinistreCreatePayload, 'contrat_type'>) => {
      console.log('📤 Création sinistre BCEG:', payload)

      const fullPayload: SinistreCreatePayload = {
        ...payload,
        contrat_type: 'ContratBceg',
      }

      const result = await sinistreService.create(fullPayload)
      console.log('✅ Sinistre BCEG créé:', result)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sinistres'] })
      queryClient.invalidateQueries({ queryKey: ['bceg-sinistres'] })
      queryClient.invalidateQueries({ queryKey: ['bceg-contracts'] })
    },
  })
}

/**
 * Hook pour récupérer le détail d'un sinistre BCEG
 */
export const useBcegSinistre = (id?: number) => {
  return useQuery({
    queryKey: ['bceg-sinistre', id],
    queryFn: async () => {
      const response = await sinistreService.getById(id!)
      return response.data
    },
    enabled: !!id,
  })
}
