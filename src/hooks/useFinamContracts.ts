// src/hooks/useFinamContracts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/lib/axios'
import { FinamContrat, FinamDashboardStats, FinamSimulation } from '@/types/finam'

// Réponse liste
type FinamContractsResponse = {
  data: FinamContrat[]
  meta?: any
}

// ✅ Hook pour la LISTE des contrats FINAM
export const useFinamContracts = (params?: {
  categorie?: string
  actif?: boolean
  agence?: string
  statut?: string
  expire_dans?: number
  search?: string
}) => {
  return useQuery<FinamContractsResponse>({
    queryKey: ['finam-contracts', params],
    queryFn: async () => {
      const response = await axios.get('/finam/contrats', { params })
      console.log('💰 FINAM API Response:', response.data)
      
      const rawData = response.data
      
      // Format Laravel: { success: true, data: { current_page: 1, data: [...], ... } }
      if (rawData?.success && rawData?.data?.data && Array.isArray(rawData.data.data)) {
        console.log('💰 Contrats FINAM extraits (pagination):', rawData.data.data.length)
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
      console.warn('💰 Format de réponse FINAM inattendu:', rawData)
      return { data: [] }
    },
  })
}

// ✅ Hook pour le DÉTAIL d'un contrat FINAM par ID
export const useFinamContract = (id?: number) => {
  return useQuery<FinamContrat>({
    queryKey: ['finam-contract', id],
    queryFn: async () => {
      const response = await axios.get(`/finam/contrats/${id}`)
      console.log('💰 FINAM Detail API Response:', response.data)
      
      const rawData = response.data
      
      // Format: { success: true, data: { ... } }
      if (rawData?.success && rawData?.data && typeof rawData.data === 'object' && !Array.isArray(rawData.data)) {
        console.log('💰 Contrat FINAM extrait:', rawData.data)
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
      
      console.warn('💰 Format de réponse FINAM détail inattendu:', rawData)
      return rawData
    },
    enabled: !!id,
  })
}

// ✅ Hook pour CRÉER un contrat FINAM
export const useCreateFinamContract = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Partial<FinamContrat>) => {
      const { data } = await axios.post<FinamContrat>('/finam/contrats', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finam-contracts'] })
    },
  })
}

// ✅ Hook pour METTRE À JOUR un contrat FINAM
export const useUpdateFinamContract = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<FinamContrat> }) => {
      const { data } = await axios.put<FinamContrat>(`/finam/contrats/${id}`, payload)
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['finam-contracts'] })
      queryClient.invalidateQueries({ queryKey: ['finam-contract', variables.id] })
    },
  })
}

// ✅ Hook pour SUPPRIMER un contrat FINAM
export const useDeleteFinamContract = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`/finam/contrats/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finam-contracts'] })
    },
  })
}

// ✅ Hook pour les STATISTIQUES FINAM
export const useFinamStats = (agence?: string) => {
  return useQuery<FinamDashboardStats>({
    queryKey: ['finam-stats', agence],
    queryFn: async () => {
      const response = await axios.get('/finam/contrats/statistiques', {
        params: agence ? { agence } : undefined,
      })
      console.log('💰 FINAM Stats Response:', response.data)
      
      if (response.data?.success && response.data?.data) {
        return response.data.data
      }
      return response.data
    },
  })
}

// ✅ Hook pour SIMULATION de tarification FINAM
export const useFinamSimulation = () => {
  return useMutation<{ success: boolean; simulation: FinamSimulation }, Error, {
    montant_a_assurer: number
    categorie: 'Personnel FINAM' | 'Retraités'
    duree_mois?: number
  }>({
    mutationFn: async (payload) => {
      const { data } = await axios.post('/finam/contrats/simuler-tarification', payload)
      return data
    },
  })
}

// ✅ Hook pour CALCULER la prime FINAM
export const useFinamCalculerPrime = () => {
  return useMutation<any, Error, {
    montant_a_assurer: number
    categorie: 'Personnel FINAM' | 'Retraités'
  }>({
    mutationFn: async (payload) => {
      const { data } = await axios.post('/finam/contrats/calculer-prime', payload)
      return data
    },
  })
}

// ✅ Hook pour valider les signatures FINAM
export const useFinamValiderSignatures = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { 
      id: number
      payload: {
        signature_assure?: boolean
        signature_cachet_finam?: boolean
        signature_assureur?: boolean
        lieu_signature?: string
        date_signature?: string
      }
    }) => {
      const { data } = await axios.post(`/finam/contrats/${id}/valider-signatures`, payload)
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['finam-contracts'] })
      queryClient.invalidateQueries({ queryKey: ['finam-contract', variables.id] })
    },
  })
}

// ✅ Hook pour les contrats expirant prochainement
export const useFinamContratsExpirant = (jours: number = 30) => {
  return useQuery({
    queryKey: ['finam-contracts-expiring', jours],
    queryFn: async () => {
      const response = await axios.get('/finam/contrats/expirant-prochainement', {
        params: { jours },
      })
      
      if (response.data?.success) {
        return response.data.data
      }
      return response.data
    },
  })
}

// ✅ Hook pour les contrats par agence
export const useFinamContratsByAgence = (agence: string) => {
  return useQuery({
    queryKey: ['finam-contracts-agence', agence],
    queryFn: async () => {
      const response = await axios.get(`/finam/contrats/agence/${agence}`)
      
      if (response.data?.success) {
        return response.data.data
      }
      return response.data
    },
    enabled: !!agence,
  })
}
