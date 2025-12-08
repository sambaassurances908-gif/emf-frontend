// src/hooks/useBambooContracts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/lib/axios'
import { BambooContrat } from '@/types/bamboo'

// Réponse liste
type BambooContractsResponse = {
  data: BambooContrat[]
  meta?: any
}

// ✅ Hook pour la LISTE des contrats Bamboo
export const useBambooContracts = (emfId: number) => {
  return useQuery<BambooContractsResponse>({
    queryKey: ['bamboo-contracts', emfId],
    queryFn: async () => {
      const response = await axios.get(
        '/bamboo-emf/contrats',
        {
          params: {
            emf_id: emfId,
          },
        },
      )
      console.log('🎋 BAMBOO API Response:', response.data)
      
      const rawData = response.data
      
      // Format Laravel: { success: true, data: { current_page: 1, data: [...], ... } }
      if (rawData?.success && rawData?.data?.data && Array.isArray(rawData.data.data)) {
        console.log('🎋 Contrats extraits (pagination Laravel):', rawData.data.data.length)
        return { data: rawData.data.data, meta: rawData.data }
      }
      
      // Si la réponse est directement un tableau
      if (Array.isArray(rawData)) {
        return { data: rawData }
      }
      
      // Si la réponse est paginée Laravel directe { data: [...], meta: {...} }
      if (rawData?.data && Array.isArray(rawData.data)) {
        return rawData
      }
      
      // Si la réponse est { success: true, data: [...] } (tableau direct)
      if (rawData?.success && Array.isArray(rawData.data)) {
        return { data: rawData.data }
      }
      
      // Fallback
      console.warn('🎋 Format de réponse inattendu:', rawData)
      return { data: [] }
    },
  })
}

// ✅ Hook pour le DÉTAIL d'un contrat Bamboo par ID
export const useBambooContract = (id?: number) => {
  return useQuery<BambooContrat>({
    queryKey: ['bamboo-contract', id],
    queryFn: async () => {
      const { data } = await axios.get<BambooContrat>(
        `/bamboo-emf/contrats/${id}`,
      )
      return data
    },
    enabled: !!id, // ne lance la requête que si id est défini
  })
}

// ✅ Hook pour CRÉER un contrat Bamboo
export const useCreateBambooContract = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Partial<BambooContrat>) => {
      const { data } = await axios.post<BambooContrat>(
        '/bamboo-emf/contrats',
        payload,
      )
      return data
    },
    onSuccess: () => {
      // Invalide le cache pour recharger la liste
      queryClient.invalidateQueries({ queryKey: ['bamboo-contracts'] })
    },
  })
}

// ✅ Hook pour METTRE À JOUR un contrat Bamboo
export const useUpdateBambooContract = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<BambooContrat> }) => {
      const { data } = await axios.put<BambooContrat>(
        `/bamboo-emf/contrats/${id}`,
        payload,
      )
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bamboo-contracts'] })
      queryClient.invalidateQueries({ queryKey: ['bamboo-contract', data.id] })
    },
  })
}

// ✅ Hook pour SUPPRIMER un contrat Bamboo
export const useDeleteBambooContract = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`/bamboo-emf/contrats/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bamboo-contracts'] })
    },
  })
}
