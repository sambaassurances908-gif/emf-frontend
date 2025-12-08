// src/hooks/useCofidecContracts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import axios from '@/lib/axios'
import { CofidecContrat } from '@/types/cofidec'

interface CofidecContractsParams {
  search?: string
  statut?: string
  categorie?: string
}

export const useCofidecContracts = (emfId: number, filters: Partial<CofidecContractsParams> = {}) => {
  return useQuery({
    queryKey: ['cofidec-contracts', emfId, filters],
    queryFn: async () => {
      console.log('🔍 HOOK COFIDEC - Récupération contrats:', { emfId, filters })
      
      const params = new URLSearchParams({
        emf_id: emfId.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.statut && { statut: filters.statut }),
        ...(filters.categorie && { categorie: filters.categorie }),
        per_page: '50'
      })

      const response = await api.get(`/cofidec/contrats?${params}`)
      
      // ✅ Extraire le tableau des contrats (même structure que SODEC)
      const paginationData = response.data.data
      const contratsTableau = Array.isArray(paginationData?.data) 
        ? paginationData.data 
        : Array.isArray(paginationData) 
          ? paginationData 
          : []
      
      console.log('✅ HOOK COFIDEC - TABLEAU FINAL:', contratsTableau.length, 'contrats')
      
      return contratsTableau as CofidecContrat[]
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

export const useCofidecContract = (id?: number) => {
  return useQuery<CofidecContrat>({
    queryKey: ['cofidec-contract', id],
    queryFn: async () => {
      const response = await axios.get(`/cofidec/contrats/${id}`)
      console.log('🏦 COFIDEC Detail Response:', response.data)
      
      const rawData = response.data
      
      // Format: { success: true, data: { ... } }
      if (rawData?.success && rawData?.data && typeof rawData.data === 'object' && !Array.isArray(rawData.data)) {
        console.log('🏦 Contrat COFIDEC extrait:', rawData.data)
        return rawData.data
      }
      
      // Format: { data: { ... } }
      if (rawData?.data && typeof rawData.data === 'object' && !Array.isArray(rawData.data)) {
        return rawData.data
      }
      
      // Si c'est déjà le contrat directement
      if (rawData?.id) {
        return rawData
      }
      
      console.warn('🏦 Format de réponse détail COFIDEC inattendu:', rawData)
      return rawData
    },
    enabled: !!id,
  })
}

// Alias pour la compatibilité avec les pages d'impression
export const useCofidecContractDetail = useCofidecContract

export const useCreateCofidecContract = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Partial<CofidecContrat>) => {
      const response = await axios.post('/cofidec/contrats', payload)
      console.log('🏦 COFIDEC Create Response:', response.data)
      
      // Extraire les données selon le format de réponse
      const rawData = response.data
      if (rawData?.success && rawData?.data) {
        return rawData.data
      }
      if (rawData?.data) {
        return rawData.data
      }
      return rawData
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cofidec-contracts'] })
    },
  })
}

export const useUpdateCofidecContract = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<CofidecContrat> }) => {
      const { data } = await axios.put<CofidecContrat>(`/cofidec/contrats/${id}`, payload)
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cofidec-contracts'] })
      queryClient.invalidateQueries({ queryKey: ['cofidec-contract', data.id] })
    },
  })
}

export const useDeleteCofidecContract = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`/cofidec/contrats/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cofidec-contracts'] })
    },
  })
}
