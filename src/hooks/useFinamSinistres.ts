// src/hooks/useFinamSinistres.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/lib/axios'
import { sinistreService } from '@/services/sinistre.service'
import { SinistreCreatePayload } from '@/types/sinistre.types'

/**
 * Hook pour récupérer les contrats FINAM actifs (pour le sélecteur du formulaire)
 */
export const useFinamContratsForSinistre = (emfId: number) => {
    return useQuery({
        queryKey: ['finam-contrats-for-sinistre', emfId],
        queryFn: async () => {
            const { data } = await axios.get('/finam/contrats', {
                params: { emf_id: emfId, statut: 'actif', per_page: 100 },
            })
            return data.data?.data || data.data || []
        },
    })
}

/**
 * Hook pour récupérer les sinistres FINAM
 */
export const useFinamSinistres = (params?: { page?: number; statut?: string }) => {
    return useQuery({
        queryKey: ['finam-sinistres', params],
        queryFn: async () => {
            const response = await sinistreService.getAll({
                contrat_type: 'ContratFinam',
                ...params,
            })
            return response
        },
    })
}

/**
 * Hook pour créer un sinistre FINAM
 * Utilise le service sinistre générique avec contrat_type = 'ContratFinam'
 */
export const useCreateFinamSinistre = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (payload: Omit<SinistreCreatePayload, 'contrat_type'>) => {
            const fullPayload: SinistreCreatePayload = {
                ...payload,
                contrat_type: 'ContratFinam',
            }
            return sinistreService.create(fullPayload)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sinistres'] })
            queryClient.invalidateQueries({ queryKey: ['finam-sinistres'] })
        },
    })
}
