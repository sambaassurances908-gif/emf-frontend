import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { EdgTaxiPerteRecetteContrat, EdgTaxiPrevoyanceDecesContrat } from '@/types/edgTaxi'

// ============================================
// EDG TAXI PERTE RECETTE
// ============================================

export const useEdgTaxiPerteRecetteContracts = (emfId: number) => {
    return useQuery<EdgTaxiPerteRecetteContrat[]>({
        queryKey: ['edg-taxi-perte-recette-contracts', emfId],
        queryFn: async () => {
            const response = await api.get('/edg-taxi-perte-recette/contrats', {
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

export const useEdgTaxiPerteRecetteContract = (id?: number | string) => {
    return useQuery<EdgTaxiPerteRecetteContrat>({
        queryKey: ['edg-taxi-perte-recette-contract', id],
        queryFn: async () => {
            const response = await api.get(`/edg-taxi-perte-recette/contrats/${id}`)
            return response.data?.data || response.data
        },
        enabled: !!id,
    })
}

export const useCreateEdgTaxiPerteRecetteContract = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await api.post('/edg-taxi-perte-recette/contrats', data)
            return response.data?.data || response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['edg-taxi-perte-recette-contracts'] })
        },
    })
}

export const useDeleteEdgTaxiPerteRecetteContract = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/edg-taxi-perte-recette/contrats/${id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['edg-taxi-perte-recette-contracts'] })
        },
    })
}

// ============================================
// EDG TAXI PREVOYANCE DECES
// ============================================

export const useEdgTaxiPrevoyanceDecesContracts = (emfId: number) => {
    return useQuery<EdgTaxiPrevoyanceDecesContrat[]>({
        queryKey: ['edg-taxi-prevoyance-deces-contracts', emfId],
        queryFn: async () => {
            const response = await api.get('/edg-taxi-prevoyance-deces/contrats', {
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

export const useEdgTaxiPrevoyanceDecesContract = (id?: number | string) => {
    return useQuery<EdgTaxiPrevoyanceDecesContrat>({
        queryKey: ['edg-taxi-prevoyance-deces-contract', id],
        queryFn: async () => {
            const response = await api.get(`/edg-taxi-prevoyance-deces/contrats/${id}`)
            return response.data?.data || response.data
        },
        enabled: !!id,
    })
}

export const useCreateEdgTaxiPrevoyanceDecesContract = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await api.post('/edg-taxi-prevoyance-deces/contrats', data)
            return response.data?.data || response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['edg-taxi-prevoyance-deces-contracts'] })
        },
    })
}

export const useDeleteEdgTaxiPrevoyanceDecesContract = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/edg-taxi-prevoyance-deces/contrats/${id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['edg-taxi-prevoyance-deces-contracts'] })
        },
    })
}
