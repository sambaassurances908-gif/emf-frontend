import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { BcegTaxiPerteRecetteContrat, BcegTaxiPrevoyanceDecesContrat } from '@/types/bcegTaxi'

// ============================================
// BCEG TAXI PERTE RECETTE
// ============================================

export const useBcegTaxiPerteRecetteContracts = (emfId: number) => {
    return useQuery<BcegTaxiPerteRecetteContrat[]>({
        queryKey: ['bceg-taxi-perte-recette-contracts', emfId],
        queryFn: async () => {
            const response = await api.get('/bceg-taxi-perte-recette/contrats', {
                params: { emf_id: emfId, per_page: 100 }
            })
            const payload = response.data
            if (Array.isArray(payload)) return payload
            if (payload?.data?.data) return payload.data.data
            if (payload?.data) return Array.isArray(payload.data) ? payload.data : []
            return []
        },
        enabled: !!emfId,
    })
}

export const useBcegTaxiPerteRecetteContract = (id?: number | string) => {
    return useQuery<BcegTaxiPerteRecetteContrat>({
        queryKey: ['bceg-taxi-perte-recette-contract', id],
        queryFn: async () => {
            const response = await api.get(`/bceg-taxi-perte-recette/contrats/${id}`)
            return response.data?.data || response.data
        },
        enabled: !!id,
    })
}

export const useCreateBcegTaxiPerteRecetteContract = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await api.post('/bceg-taxi-perte-recette/contrats', data)
            return response.data?.data || response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bceg-taxi-perte-recette-contracts'] })
        },
    })
}

export const useDeleteBcegTaxiPerteRecetteContract = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/bceg-taxi-perte-recette/contrats/${id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bceg-taxi-perte-recette-contracts'] })
        },
    })
}

// ============================================
// BCEG TAXI PREVOYANCE DECES
// ============================================

export const useBcegTaxiPrevoyanceDecesContracts = (emfId: number) => {
    return useQuery<BcegTaxiPrevoyanceDecesContrat[]>({
        queryKey: ['bceg-taxi-prevoyance-deces-contracts', emfId],
        queryFn: async () => {
            const response = await api.get('/bceg-taxi-prevoyance-deces/contrats', {
                params: { emf_id: emfId, per_page: 100 }
            })
            const payload = response.data
            if (Array.isArray(payload)) return payload
            if (payload?.data?.data) return payload.data.data
            if (payload?.data) return Array.isArray(payload.data) ? payload.data : []
            return []
        },
        enabled: !!emfId,
    })
}

export const useBcegTaxiPrevoyanceDecesContract = (id?: number | string) => {
    return useQuery<BcegTaxiPrevoyanceDecesContrat>({
        queryKey: ['bceg-taxi-prevoyance-deces-contract', id],
        queryFn: async () => {
            const response = await api.get(`/bceg-taxi-prevoyance-deces/contrats/${id}`)
            return response.data?.data || response.data
        },
        enabled: !!id,
    })
}

export const useCreateBcegTaxiPrevoyanceDecesContract = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await api.post('/bceg-taxi-prevoyance-deces/contrats', data)
            return response.data?.data || response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bceg-taxi-prevoyance-deces-contracts'] })
        },
    })
}

export const useDeleteBcegTaxiPrevoyanceDecesContract = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/bceg-taxi-prevoyance-deces/contrats/${id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bceg-taxi-prevoyance-deces-contracts'] })
        },
    })
}
