// src/hooks/useCofigaSinistres.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/lib/axios'
import { sinistreService } from '@/services/sinistre.service'
import { SinistreCreatePayload } from '@/types/sinistre.types'

/**
 * Hook pour récupérer les contrats COFIGA actifs (pour le sélecteur du formulaire)
 */
export const useCofigaContratsForSinistre = (emfId: number) => {
    return useQuery({
        queryKey: ['cofiga-contrats-for-sinistre', emfId],
        queryFn: async () => {
            const { data } = await axios.get('/cofiga/contrats', {
                params: { emf_id: emfId, statut: 'actif', per_page: 100 },
            })
            return data.data?.data || data.data || []
        },
    })
}

/**
 * Hook pour récupérer les sinistres COFIGA
 */
export const useCofigaSinistres = (params?: { page?: number; statut?: string }) => {
    return useQuery({
        queryKey: ['cofiga-sinistres', params],
        queryFn: async () => {
            const response = await sinistreService.getAll({
                contrat_type: 'ContratCofiga',
                ...params,
            })
            return response
        },
    })
}

/**
 * Hook pour créer un sinistre COFIGA
 * Utilise le service sinistre générique avec contrat_type = 'ContratCofiga'
 */
export const useCreateCofigaSinistre = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (payload: Omit<SinistreCreatePayload, 'contrat_type'>) => {
            const fullPayload: SinistreCreatePayload = {
                ...payload,
                contrat_type: 'ContratCofiga',
            }
            return sinistreService.create(fullPayload)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sinistres'] })
            queryClient.invalidateQueries({ queryKey: ['cofiga-sinistres'] })
        },
    })
}
