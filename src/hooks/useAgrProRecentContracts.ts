// src/hooks/useAgrProRecentContracts.ts
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { AgrProContrat } from '@/types/agrpro'

export const useAgrProRecentContracts = (emfId: number, limit = 5) => {
    return useQuery<AgrProContrat[]>({
        queryKey: ['agrpro-recent-contracts', emfId, limit],
        queryFn: async () => {
            const res = await api.get(`/agr-pro/contrats?emf_id=${emfId}&limit=${limit}&page=1`)
            const payload = res.data

            if (!payload.success) {
                throw new Error(payload.message || 'Erreur API contrats AGR PRO')
            }

            // Gérer différents formats de réponse
            if (payload.data?.data && Array.isArray(payload.data.data)) {
                return payload.data.data
            }
            if (Array.isArray(payload.data)) {
                return payload.data
            }

            return payload.data as AgrProContrat[]
        },
        enabled: !!emfId,
    })
}
