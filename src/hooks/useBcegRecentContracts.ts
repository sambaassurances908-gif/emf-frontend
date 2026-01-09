// hooks/useBcegRecentContracts.ts
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

// ✅ Export nommé du hook
export const useBcegRecentContracts = (emfId: number, limit = 5) => {
  return useQuery<any[]>({ // Changed generic to any[] or union
    queryKey: ['bceg-recent-contracts-all', emfId, limit],
    queryFn: async () => {
      const [resStandard, resMoto] = await Promise.allSettled([
        api.get(`/bceg/contrats`, { params: { emf_id: emfId, per_page: limit, page: 1 } }),
        api.get(`/bceg-moto/contrats`, { params: { emf_id: emfId, per_page: limit, page: 1 } })
      ])

      let contratsStandard: any[] = []
      let contratsMoto: any[] = []

      // Process Standard
      if (resStandard.status === 'fulfilled') {
        const payload = resStandard.value.data
        if (Array.isArray(payload)) contratsStandard = payload
        else if (payload?.data) {
          if (Array.isArray(payload.data)) contratsStandard = payload.data
          else if (Array.isArray(payload.data?.data)) contratsStandard = payload.data.data
        }
      }

      // Process Moto
      if (resMoto.status === 'fulfilled') {
        const payload = resMoto.value.data
        if (Array.isArray(payload)) contratsMoto = payload
        else if (payload?.data) {
          if (Array.isArray(payload.data)) contratsMoto = payload.data
          else if (Array.isArray(payload.data?.data)) contratsMoto = payload.data.data
        }
      }

      // Tag and Merge
      const standardTagged = contratsStandard.map(c => ({ ...c, source: 'standard' }))
      const motoTagged = contratsMoto.map(c => ({
        ...c,
        source: 'moto',
        numero_police: c.numero_police || c.police_numero,
        nom: c.nom,
        prenom: c.prenom,
        montant_pret: c.montant_pret,
        statut: 'actif'
      }))

      // Sort recent first
      const merged = [...standardTagged, ...motoTagged].sort((a, b) => {
        const dateA = new Date(a.created_at || a.date_effet || 0).getTime()
        const dateB = new Date(b.created_at || b.date_effet || 0).getTime()
        return dateB - dateA
      })

      // Limiter au nombre demandé
      return merged.slice(0, limit)
    },
    enabled: !!emfId,
  })
}

// ✅ Export par défaut également (optionnel mais recommandé)
export default useBcegRecentContracts
