// src/hooks/useAgrProContracts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/lib/axios'
import { AgrProContrat, AgrProContratCreatePayload } from '@/types/agrpro'

// Réponse liste
type AgrProContractsResponse = {
    data: AgrProContrat[]
    meta?: any
}

// ✅ Hook pour la LISTE des contrats AGR PRO
export const useAgrProContracts = (emfId: number) => {
    return useQuery<AgrProContractsResponse>({
        queryKey: ['agrpro-contracts', emfId],
        queryFn: async () => {
            const response = await axios.get(
                '/agr-pro/contrats',
                {
                    params: {
                        emf_id: emfId,
                    },
                },
            )
            console.log('🌿 AGR PRO API Response:', response.data)

            const rawData = response.data

            // Format Laravel: { success: true, data: { current_page: 1, data: [...], ... } }
            if (rawData?.success && rawData?.data?.data && Array.isArray(rawData.data.data)) {
                console.log('🌿 Contrats extraits (pagination Laravel):', rawData.data.data.length)
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
            console.warn('🌿 Format de réponse inattendu:', rawData)
            return { data: [] }
        },
    })
}

// ✅ Hook pour le DÉTAIL d'un contrat AGR PRO par ID
export const useAgrProContract = (id?: number) => {
    return useQuery<AgrProContrat>({
        queryKey: ['agrpro-contract', id],
        queryFn: async () => {
            const response = await axios.get(`/agr-pro/contrats/${id}`)
            console.log('🌿 AGR PRO Detail API Response:', response.data)

            const rawData = response.data

            // Format: { success: true, data: { ... } }
            if (rawData?.success && rawData?.data && typeof rawData.data === 'object' && !Array.isArray(rawData.data)) {
                console.log('🌿 Contrat extrait:', rawData.data)
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

            console.warn('🌿 Format de réponse détail inattendu:', rawData)
            return rawData
        },
        enabled: !!id,
    })
}

// ✅ Hook pour CRÉER un contrat AGR PRO
export const useCreateAgrProContract = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (payload: AgrProContratCreatePayload) => {
            const { data } = await axios.post<AgrProContrat>(
                '/agr-pro/contrats',
                payload,
            )
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agrpro-contracts'] })
        },
    })
}

// ✅ Hook pour METTRE À JOUR un contrat AGR PRO
export const useUpdateAgrProContract = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, payload }: { id: number; payload: Partial<AgrProContrat> }) => {
            const { data } = await axios.put<AgrProContrat>(
                `/agr-pro/contrats/${id}`,
                payload,
            )
            return data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['agrpro-contracts'] })
            queryClient.invalidateQueries({ queryKey: ['agrpro-contract', data.id] })
        },
    })
}

// ✅ Hook pour SUPPRIMER un contrat AGR PRO
export const useDeleteAgrProContract = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: number) => {
            await axios.delete(`/agr-pro/contrats/${id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agrpro-contracts'] })
        },
    })
}

// ✅ Hook pour CALCULER la prime sans enregistrer
export const useCalculateAgrProPrime = () => {
    return useMutation({
        mutationFn: async (montant_pret_assure: number) => {
            const { data } = await axios.post('/agr-pro/contrats/calculer-prime', {
                montant_pret_assure,
            })
            return data
        },
    })
}
