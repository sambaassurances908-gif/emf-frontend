// src/hooks/useArianeFinanceRecentContracts.ts
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { ArianeFinanceContrat } from '@/types/arianeFinance'

export const useArianeFinanceRecentContracts = (emfId: number, limit = 5) => {
    return useQuery<ArianeFinanceContrat[]>({
        queryKey: ['arianefinance-recent-contracts', emfId, limit],
        queryFn: async () => {
            const res = await api.get(`/ariane-finance/contrats?emf_id=${emfId}&limit=${limit}&page=1`)
            const payload = res.data

            if (!payload.success) {
                throw new Error(payload.message || 'Erreur API contrats ARIANE FINANCE')
            }

            // Gérer différents formats de réponse
            if (payload.data?.data && Array.isArray(payload.data.data)) {
                return payload.data.data
            }
            if (Array.isArray(payload.data)) {
                return payload.data
            }

            return payload.data as ArianeFinanceContrat[]
        },
        enabled: !!emfId,
    })
}
