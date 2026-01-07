import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { AgrProDashboardStats } from '@/types/agrpro'

export const useAgrProStats = (emfId: number) => {
    return useQuery<AgrProDashboardStats>({
        queryKey: ['agrpro-stats', emfId],
        queryFn: async () => {
            const res = await api.get(`/agr-pro/contrats/statistiques/global?emf_id=${emfId}`)
            const payload = res.data

            if (!payload.success) {
                throw new Error(payload.message || 'Erreur API statistiques AGR PRO')
            }

            const d = payload.data

            const stats: AgrProDashboardStats = {
                total: d.total || 0,
                actifs: d.actifs || 0,
                en_attente: d.en_attente || 0,
                resilie: d.resilie || 0,
                expire_30_jours: d.expire_30_jours || 0,
                montant_total_assure: Number(d.montant_total_assure) || 0,
                cotisation_totale: Number(d.cotisation_totale) || 0,
                montant_moyen_pret: Number(d.montant_moyen_pret) || 0,
                par_ville: d.par_ville || {},
                par_emf: d.par_emf || [],
                par_categorie: d.par_categorie || {
                    commercants: 0,
                    salaries_public: 0,
                    salaries_prive: 0,
                    retraites: 0,
                    autre: 0
                }
            }

            return stats
        },
        enabled: !!emfId,
    })
}
