import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { BcegMotoContrat, BcegMotoContratFormData, BcegMotoCalculResult } from '@/types/bcegMoto'

// ✅ Hook pour la LISTE des contrats BCEG Moto
export const useBcegMotoContracts = (params?: any) => {
    return useQuery<BcegMotoContrat[]>({
        queryKey: ['bceg-moto-contracts', params],
        queryFn: async () => {
            const response = await api.get('/bceg-moto/contrats', { params })
            return response.data?.data || []
        },
    })
}

// ✅ Hook pour le DÉTAIL d'un contrat
export const useBcegMotoContract = (id?: number | string) => {
    return useQuery<BcegMotoContrat>({
        queryKey: ['bceg-moto-contract', id],
        queryFn: async () => {
            const response = await api.get(`/bceg-moto/contrats/${id}`)
            return response.data?.data
        },
        enabled: !!id,
    })
}

// ✅ Hook pour CRÉER un contrat
export const useCreateBcegMotoContract = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (payload: BcegMotoContratFormData) => {
            const response = await api.post('/bceg-moto/contrats', payload)
            return response.data?.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bceg-moto-contracts'] })
        },
    })
}

// ✅ Hook pour CALCULER la prime
export const useCalculerPrimeBcegMoto = () => {
    return useMutation({
        mutationFn: async (payload: { montant_pret: number }) => {
            const response = await api.post('/bceg-moto/contrats/calculer-prime', payload)
            return response.data?.data as BcegMotoCalculResult
        },
    })
}

// ✅ Hook pour SUPPRIMER un contrat
export const useDeleteBcegMotoContract = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/bceg-moto/contrats/${id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bceg-moto-contracts'] })
        },
    })
}
