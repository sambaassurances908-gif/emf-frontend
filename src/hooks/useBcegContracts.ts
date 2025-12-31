// src/hooks/useBcegContracts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { BcegContrat, BcegContratFormData } from '@/types/bceg'



// ✅ Hook pour la LISTE des contrats BCEG
export const useBcegContracts = (emfId: number) => {
  return useQuery<BcegContrat[]>({
    queryKey: ['bceg-contracts', emfId],
    queryFn: async () => {
      console.log('🔍 BCEG HOOK - Récupération contrats BCEG:', { emfId })

      const response = await api.get('/bceg/contrats', {
        params: { emf_id: emfId, per_page: 50 }
      })

      console.log('📦 BCEG HOOK - Réponse brute:', response.data)

      // Gérer différentes structures de réponse API
      let contrats: BcegContrat[] = []

      if (Array.isArray(response.data)) {
        // Si la réponse est directement un tableau
        contrats = response.data
      } else if (response.data?.data) {
        // Si la réponse est { data: [...] } ou { data: { data: [...] } }
        if (Array.isArray(response.data.data)) {
          contrats = response.data.data
        } else if (Array.isArray(response.data.data?.data)) {
          // Structure paginée Laravel: { data: { data: [...], meta: {...} } }
          contrats = response.data.data.data
        }
      }

      console.log('✅ BCEG HOOK - Contrats extraits:', contrats.length, contrats.slice(0, 2))

      return contrats
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

// ✅ Hook pour le DÉTAIL d'un contrat BCEG par ID
export const useBcegContract = (id?: number) => {
  return useQuery<BcegContrat>({
    queryKey: ['bceg-contract', id],
    queryFn: async () => {
      console.log('🔍 BCEG HOOK - Récupération contrat BCEG:', { id })

      const response = await api.get(`/bceg/contrats/${id}`)

      console.log('📦 BCEG HOOK - Réponse détail:', response.data)

      // Gérer différentes structures de réponse API
      let contrat: BcegContrat

      if (response.data?.data) {
        contrat = response.data.data
      } else {
        contrat = response.data
      }

      console.log('✅ BCEG HOOK - Contrat extrait:', contrat)

      return contrat
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })
}

// ✅ Hook pour CRÉER un contrat BCEG
export const useCreateBcegContract = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Partial<BcegContratFormData>) => {
      const response = await api.post('/bceg/contrats', payload)
      return response.data?.data || response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bceg-contracts'] })
    },
  })
}

// ✅ Hook pour METTRE À JOUR un contrat BCEG
export const useUpdateBcegContract = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<BcegContrat> }) => {
      const response = await api.put(`/bceg/contrats/${id}`, payload)
      return response.data?.data || response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bceg-contracts'] })
      queryClient.invalidateQueries({ queryKey: ['bceg-contract', data.id] })
    },
  })
}

// ✅ Hook pour SUPPRIMER un contrat BCEG
export const useDeleteBcegContract = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/bceg/contrats/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bceg-contracts'] })
    },
  })
}

// ✅ Hook pour les STATISTIQUES BCEG
export const useBcegStats = (emfId?: number) => {
  return useQuery({
    queryKey: ['bceg-stats', emfId],
    queryFn: async () => {
      const response = await api.get('/bceg/contrats/statistiques/global', {
        params: emfId ? { emf_id: emfId } : {}
      })
      return response.data?.data || response.data
    },
  })
}

// ✅ Hook pour les contrats expirants BCEG
export const useBcegExpiringContracts = (emfId?: number, jours = 30) => {
  return useQuery({
    queryKey: ['bceg-expiring-contracts', emfId, jours],
    queryFn: async () => {
      const response = await api.get('/bceg/contrats/expiration/prochains', {
        params: { emf_id: emfId, jours }
      })
      return response.data?.data || response.data
    },
  })
}
