// src/hooks/useArianeFinanceSinistres.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/lib/axios'
import { sinistreService } from '@/services/sinistre.service'
import { SinistreCreatePayload, SinistreStatut } from '@/types/sinistre.types'

const ARIANEFINANCE_EMF_ID = 9

/**
 * Hook pour récupérer les contrats ARIANE FINANCE actifs (pour le sélecteur du formulaire sinistre)
 */
export const useArianeFinanceContratsForSinistre = (emfId: number = ARIANEFINANCE_EMF_ID) => {
    return useQuery({
        queryKey: ['arianefinance-contrats-for-sinistre', emfId],
        queryFn: async () => {
            const { data } = await axios.get('/ariane-finance/contrats', {
                params: { emf_id: emfId, statut: 'actif', per_page: 100 },
            })
            return data.data?.data || data.data || []
        },
    })
}

/**
 * Hook pour récupérer les sinistres ARIANE FINANCE
 */
export const useArianeFinanceSinistres = (params?: { page?: number; statut?: SinistreStatut }) => {
    return useQuery({
        queryKey: ['arianefinance-sinistres', params],
        queryFn: async () => {
            const response = await sinistreService.getAll({
                contrat_type: 'ContratArianeFinance',
                ...params,
            })
            return response
        },
    })
}

/**
 * Hook pour créer un sinistre ARIANE FINANCE
 * Utilise le service sinistre générique avec contrat_type = 'ContratArianeFinance'
 */
export const useCreateArianeFinanceSinistre = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (payload: Omit<SinistreCreatePayload, 'contrat_type'>) => {
            const fullPayload: SinistreCreatePayload = {
                ...payload,
                contrat_type: 'ContratArianeFinance',
            }
            return sinistreService.create(fullPayload)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sinistres'] })
            queryClient.invalidateQueries({ queryKey: ['arianefinance-sinistres'] })
        },
    })
}
