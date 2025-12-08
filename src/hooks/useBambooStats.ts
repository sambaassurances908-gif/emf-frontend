// hooks/useBambooStats.ts
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { BambooDashboardStats } from '@/types/bamboo'

export const useBambooStats = (emfId: number) => {
  return useQuery<BambooDashboardStats>({
    queryKey: ['bamboo-stats', emfId],
    queryFn: async () => {
      const res = await api.get(`/bamboo-emf/contrats/statistiques/global?emf_id=${emfId}`)
      const payload = res.data

      if (!payload.success) {
        throw new Error(payload.message || 'Erreur API statistiques')
      }

      const d = payload.data

      const stats: BambooDashboardStats = {
        total: d.total,
        actifs: d.actifs,
        en_attente: d.en_attente,
        resilie: d.resilie,
        avec_perte_emploi: d.avec_perte_emploi,
        expire_30_jours: d.expire_30_jours,
        montant_total_assure: Number(d.montant_total_assure),
        cotisation_totale: Number(d.cotisation_totale),
        montant_moyen_pret: Number(d.montant_moyen_pret),
        par_categorie: d.par_categorie,
        par_emf: (d.par_emf || []).map((item: any) => ({
          emf_id: item.emf_id,
          total: item.total,
          montant_total: Number(item.montant_total),
          emf: {
            id: item.emf.id,
            raison_sociale: item.emf.raison_sociale,
            sigle: item.emf.sigle,
          },
        })),
      }

      return stats
    },
    enabled: !!emfId,
  })
}
