// src/hooks/useAgrProSinistres.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/lib/axios'
import { sinistreService } from '@/services/sinistre.service'
import { SinistreCreatePayload, SinistreStatut } from '@/types/sinistre.types'

const AGRPRO_EMF_ID = 8

/**
 * Hook pour récupérer les contrats AGR PRO actifs (pour le sélecteur du formulaire sinistre)
 */
export const useAgrProContratsForSinistre = (emfId: number = AGRPRO_EMF_ID) => {
    return useQuery({
        queryKey: ['agrpro-contrats-for-sinistre', emfId],
        queryFn: async () => {
            const { data } = await axios.get('/agr-pro/contrats', {
                params: { emf_id: emfId, statut: 'actif', per_page: 100 },
            })
            return data.data?.data || data.data || []
        },
    })
}

/**
 * Hook pour récupérer les sinistres AGR PRO
 */
export const useAgrProSinistres = (params?: { page?: number; statut?: SinistreStatut }) => {
    return useQuery({
        queryKey: ['agrpro-sinistres', params],
        queryFn: async () => {
            const response = await sinistreService.getAll({
                contrat_type: 'ContratAgrPro',
                ...params,
            })
            return response
        },
    })
}

/**
 * Hook pour créer un sinistre AGR PRO
 * Utilise le service sinistre générique avec contrat_type = 'ContratAgrPro'
 */
export const useCreateAgrProSinistre = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (payload: Omit<SinistreCreatePayload, 'contrat_type'>) => {
            const fullPayload: SinistreCreatePayload = {
                ...payload,
                contrat_type: 'ContratAgrPro',
            }
            return sinistreService.create(fullPayload)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sinistres'] })
            queryClient.invalidateQueries({ queryKey: ['agrpro-sinistres'] })
        },
    })
}
