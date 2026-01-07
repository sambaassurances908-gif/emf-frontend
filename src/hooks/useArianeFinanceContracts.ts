// src/hooks/useArianeFinanceContracts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/lib/axios'
import { ArianeFinanceContrat, ArianeFinanceContratCreatePayload } from '@/types/arianeFinance'

// Réponse liste
type ArianeFinanceContractsResponse = {
    data: ArianeFinanceContrat[]
    meta?: any
}

// ✅ Hook pour la LISTE des contrats ARIANE FINANCE
export const useArianeFinanceContracts = (emfId: number) => {
    return useQuery<ArianeFinanceContractsResponse>({
        queryKey: ['arianefinance-contracts', emfId],
        queryFn: async () => {
            const response = await axios.get(
                '/ariane-finance/contrats',
                {
                    params: {
                        emf_id: emfId,
                    },
                },
            )
            console.log('💎 ARIANE FINANCE API Response:', response.data)

            const rawData = response.data

            // Format Laravel: { success: true, data: { current_page: 1, data: [...], ... } }
            if (rawData?.success && rawData?.data?.data && Array.isArray(rawData.data.data)) {
                console.log('💎 Contrats extraits (pagination Laravel):', rawData.data.data.length)
                return { data: rawData.data.data, meta: rawData.data }
            }

            // Si la réponse est directement un tableau
            if (Array.isArray(rawData)) {
                return { data: rawData }
            }

            // Si la réponse est paginée Laravel directe { data: [...], meta: {...} }
            if (rawData?.data && Array.isArray(rawData.data)) {
                return rawData
            }

            // Si la réponse est { success: true, data: [...] } (tableau direct)
            if (rawData?.success && Array.isArray(rawData.data)) {
                return { data: rawData.data }
            }

            // Fallback
            console.warn('💎 Format de réponse inattendu:', rawData)
            return { data: [] }
        },
    })
}

// ✅ Hook pour le DÉTAIL d'un contrat ARIANE FINANCE par ID
export const useArianeFinanceContract = (id?: number) => {
    return useQuery<ArianeFinanceContrat>({
        queryKey: ['arianefinance-contract', id],
        queryFn: async () => {
            const response = await axios.get(`/ariane-finance/contrats/${id}`)
            console.log('💎 ARIANE FINANCE Detail API Response:', response.data)

            const rawData = response.data

            // Format: { success: true, data: { ... } }
            if (rawData?.success && rawData?.data && typeof rawData.data === 'object' && !Array.isArray(rawData.data)) {
                console.log('💎 Contrat extrait:', rawData.data)
                return rawData.data
            }

            // Format: { data: { ... } }
            if (rawData?.data && typeof rawData.data === 'object' && !Array.isArray(rawData.data)) {
                return rawData.data
            }

            // Si c'est déjà le contrat directement
            if (rawData?.id) {
                return rawData
            }

            console.warn('💎 Format de réponse détail inattendu:', rawData)
            return rawData
        },
        enabled: !!id,
    })
}

// ✅ Hook pour CRÉER un contrat ARIANE FINANCE
export const useCreateArianeFinanceContract = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (payload: ArianeFinanceContratCreatePayload) => {
            const { data } = await axios.post<ArianeFinanceContrat>(
                '/ariane-finance/contrats',
                payload,
            )
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['arianefinance-contracts'] })
        },
    })
}

// ✅ Hook pour METTRE À JOUR un contrat ARIANE FINANCE
export const useUpdateArianeFinanceContract = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, payload }: { id: number; payload: Partial<ArianeFinanceContrat> }) => {
            const { data } = await axios.put<ArianeFinanceContrat>(
                `/ariane-finance/contrats/${id}`,
                payload,
            )
            return data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['arianefinance-contracts'] })
            queryClient.invalidateQueries({ queryKey: ['arianefinance-contract', data.id] })
        },
    })
}

// ✅ Hook pour SUPPRIMER un contrat ARIANE FINANCE
export const useDeleteArianeFinanceContract = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: number) => {
            await axios.delete(`/ariane-finance/contrats/${id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['arianefinance-contracts'] })
        },
    })
}

// ✅ Hook pour CALCULER la prime sans enregistrer
export const useCalculateArianeFinancePrime = () => {
    return useMutation({
        mutationFn: async (montant_pret_assure: number) => {
            const { data } = await axios.post('/ariane-finance/contrats/calculer-prime', {
                montant_pret_assure,
            })
            return data
        },
    })
}
