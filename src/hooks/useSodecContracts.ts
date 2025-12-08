import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { SodecContrat } from '@/types/sodec'

interface SodecContractsParams {
  search?: string
  statut?: string
  option?: string
  categorie?: string
}

export const useSodecContracts = (emfId: number, filters: Partial<SodecContractsParams> = {}) => {
  return useQuery({
    queryKey: ['sodec-contracts', emfId, filters],
    queryFn: async () => {
      console.log('🔍 HOOK - Récupération contrats SODEC:', { emfId, filters })
      
      const params = new URLSearchParams({
        emf_id: emfId.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.statut && { statut: filters.statut }),
        ...(filters.option && { option: filters.option }),
        ...(filters.categorie && { categorie: filters.categorie }),
        per_page: '50'
      })

      const response = await api.get(`/sodec/contrats?${params}`)
      
      // ✅ DÉFINITIF : Extraire EXACTEMENT le tableau des contrats
      const paginationData = response.data.data
      const contratsTableau = Array.isArray(paginationData.data) ? paginationData.data : []
      
      console.log('✅ HOOK - TABLEAU FINAL:', contratsTableau.length, 'contrats')
      console.log('✅ HOOK - Premier contrat:', contratsTableau[0]?.nom_prenom)
      
      return contratsTableau as SodecContrat[]
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}
