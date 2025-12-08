// hooks/useEdgStats.ts
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export interface EdgDashboardStats {
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

export const useEdgStats = (emfId: number) => {
  return useQuery<EdgDashboardStats>({
    queryKey: ['edg-stats', emfId],
    queryFn: async () => {
      const res = await api.get(`/edg/contrats/statistiques/global?emf_id=${emfId}`)
      const payload = res.data

      if (!payload.success) {
        throw new Error(payload.message || 'Erreur API stats EDG')
      }

      return payload.data as EdgDashboardStats
    },
    enabled: !!emfId,
  })
}

export default useEdgStats
