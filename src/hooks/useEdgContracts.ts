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
    queryKey: ['edg-contracts-all', filters],
    queryFn: async () => {
      console.log('🔍 EDG HOOK - Récupération contrats (Standard + Taxi):', { filters })

      const [resStandard, resTaxiPR, resTaxiPD] = await Promise.allSettled([
        api.get('/edg/contrats', { params: { ...filters, per_page: 50 } }),
        api.get('/edg-taxi-perte-recette/contrats', { params: { ...filters, per_page: 50 } }),
        api.get('/edg-taxi-prevoyance-deces/contrats', { params: { ...filters, per_page: 50 } })
      ])

      const extractData = (res: PromiseSettledResult<any>) => {
        if (res.status !== 'fulfilled') return []
        const data = res.value.data
        if (Array.isArray(data)) return data
        if (Array.isArray(data?.data)) return data.data
        if (Array.isArray(data?.data?.data)) return data.data.data
        return []
      }

      const contratsStandard = extractData(resStandard).map((c: any) => ({ ...c, source: 'standard' }))
      const contratsTaxiPR = extractData(resTaxiPR).map((c: any) => ({
        ...c,
        source: 'taxi_perte_recette',
        montant_pret_assure: 0,
        nom_prenom: `${c.nom || ''} ${c.prenom || ''}`.trim(),
        statut: c.statut || 'actif'
      }))
      const contratsTaxiPD = extractData(resTaxiPD).map((c: any) => ({
        ...c,
        source: 'taxi_prevoyance_deces',
        montant_pret_assure: 0,
        nom_prenom: `${c.nom || ''} ${c.prenom || ''}`.trim(),
        statut: c.statut || 'actif'
      }))

      const merged = [...contratsStandard, ...contratsTaxiPR, ...contratsTaxiPD].sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime()
        const dateB = new Date(b.created_at || 0).getTime()
        return dateB - dateA
      })

      return merged
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
