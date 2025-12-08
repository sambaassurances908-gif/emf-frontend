// src/hooks/useEdgContracts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { EdgContrat, EdgContratCreate } from '@/types/edg'

interface EdgContractsParams {
  search?: string
  statut?: string
}

export const useEdgContracts = (filters: Partial<EdgContractsParams> = {}) => {
  return useQuery({
    queryKey: ['edg-contracts', filters],
    queryFn: async () => {
      console.log('🔍 HOOK EDG - Récupération contrats EDG:', { filters })
      
      const params = new URLSearchParams({
        ...(filters.search && { search: filters.search }),
        ...(filters.statut && { statut: filters.statut }),
        per_page: '50'
      })

      const response = await api.get(`/edg/contrats?${params}`)
      
      console.log('📦 HOOK EDG - Réponse brute:', response.data)
      
      // Gérer différentes structures de réponse API
      let contratsTableau: EdgContrat[] = []
      
      if (Array.isArray(response.data)) {
        // Cas 1: Réponse directe tableau
        contratsTableau = response.data
      } else if (response.data?.data) {
        if (Array.isArray(response.data.data)) {
          // Cas 2: { data: [...] }
          contratsTableau = response.data.data
        } else if (Array.isArray(response.data.data?.data)) {
          // Cas 3: Pagination Laravel { data: { data: [...] } }
          contratsTableau = response.data.data.data
        }
      }
      
      console.log('✅ HOOK EDG - TABLEAU FINAL:', contratsTableau.length, 'contrats')
      console.log('✅ HOOK EDG - Premier contrat:', contratsTableau[0]?.nom_prenom)
      
      return contratsTableau
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

export const useEdgContract = (id?: number) => {
  return useQuery<EdgContrat>({
    queryKey: ['edg-contract', id],
    queryFn: async () => {
      const response = await api.get(`/edg/contrats/${id}`)
      // Gérer { data: contrat } ou contrat direct
      return response.data?.data || response.data
    },
    enabled: !!id,
  })
}

export const useCreateEdgContract = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: EdgContratCreate) => {
      const response = await api.post('/edg/contrats', payload)
      return response.data?.data || response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['edg-contracts'] })
    },
  })
}

export const useUpdateEdgContract = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<EdgContrat> }) => {
      const response = await api.put(`/edg/contrats/${id}`, payload)
      return response.data?.data || response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['edg-contracts'] })
      queryClient.invalidateQueries({ queryKey: ['edg-contract', data.id] })
    },
  })
}

export const useDeleteEdgContract = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/edg/contrats/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['edg-contracts'] })
    },
  })
}
