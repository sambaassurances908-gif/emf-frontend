import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

interface Contrat {
  id: number
  numero_contrat: string
  nom_assure: string
  prenom_assure: string
  montant_assure: number
  date_effet: string
  date_echeance: string
  statut: string
  type_contrat: string
  emf_id: number
}

export const useRecentContracts = (emfId: number, limit: number = 5) => {
  return useQuery({
    queryKey: ['recent-contrats', emfId, limit],
    queryFn: async () => {
      const response = await api.get<{ data: Contrat[] }>(
        `/contrats?emf_id=${emfId}&limit=${limit}&sort=created_at&order=desc`
      )
      return response.data.data || []
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}
