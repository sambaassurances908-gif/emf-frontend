// hooks/useBcegStats.ts
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export interface BcegDashboardStats {
  total: number
  actifs: number
  en_attente: number
  suspendu: number
  resilie: number
  termine: number
  montant_total_assure: number
  cotisation_totale: number
  avec_perte_emploi: number
  expire_30_jours: number
  par_categorie: {
    commercants: number
    salaries_public: number
    salaries_prive: number
    retraites: number
    autre: number
  }
}

export const useBcegStats = (emfId: number) => {
  return useQuery<BcegDashboardStats>({
    queryKey: ['bceg-stats', emfId],
    queryFn: async () => {
      // ✅ Utiliser l'endpoint existant Laravel
      const res = await api.get(`/bceg/contrats/statistiques/global?emf_id=${emfId}`)
      const payload = res.data

      if (!payload.success) {
        throw new Error(payload.message || 'Erreur API stats BCEG')
      }

      return payload.data as BcegDashboardStats
    },
    enabled: !!emfId,
  })
}

export default useBcegStats
