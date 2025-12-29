// src/hooks/useCofigaContracts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/lib/axios'
import { CofigaContrat, CofigaDashboardStats, CofigaSimulation } from '@/types/cofiga'

// Réponse liste
type CofigaContractsResponse = {
  data: CofigaContrat[]
  meta?: any
}

// ✅ Hook pour la LISTE des contrats COFIGA
export const useCofigaContracts = (params?: {
  categorie?: string
  actif?: boolean
  statut?: string
  expire_dans?: number
  search?: string
}) => {
  return useQuery<CofigaContractsResponse>({
    queryKey: ['cofiga-contracts', params],
    queryFn: async () => {
      const response = await axios.get('/cofiga/contrats', { params })
      console.log('🏦 COFIGA API Response:', response.data)
      
      const rawData = response.data
      
      // Format Laravel: { success: true, data: { current_page: 1, data: [...], ... } }
      if (rawData?.success && rawData?.data?.data && Array.isArray(rawData.data.data)) {
        console.log('🏦 Contrats COFIGA extraits (pagination):', rawData.data.data.length)
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
      console.warn('🏦 Format de réponse COFIGA inattendu:', rawData)
      return { data: [] }
    },
  })
}

// ✅ Hook pour le DÉTAIL d'un contrat COFIGA par ID
export const useCofigaContract = (id?: number) => {
  return useQuery<CofigaContrat>({
    queryKey: ['cofiga-contract', id],
    queryFn: async () => {
      const response = await axios.get(`/cofiga/contrats/${id}`)
      console.log('🏦 COFIGA Detail API Response:', response.data)
      
      const rawData = response.data
      
      // Format: { success: true, data: { ... } }
      if (rawData?.success && rawData?.data && typeof rawData.data === 'object' && !Array.isArray(rawData.data)) {
        console.log('🏦 Contrat COFIGA extrait:', rawData.data)
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
      
      console.warn('🏦 Format de réponse COFIGA détail inattendu:', rawData)
      return rawData
    },
    enabled: !!id,
  })
}

// ✅ Hook pour CRÉER un contrat COFIGA
export const useCreateCofigaContract = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Partial<CofigaContrat>) => {
      const { data } = await axios.post<CofigaContrat>('/cofiga/contrats', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cofiga-contracts'] })
    },
  })
}

// ✅ Hook pour METTRE À JOUR un contrat COFIGA
export const useUpdateCofigaContract = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<CofigaContrat> }) => {
      const { data } = await axios.put<CofigaContrat>(`/cofiga/contrats/${id}`, payload)
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cofiga-contracts'] })
      queryClient.invalidateQueries({ queryKey: ['cofiga-contract', variables.id] })
    },
  })
}

// ✅ Hook pour SUPPRIMER un contrat COFIGA
export const useDeleteCofigaContract = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`/cofiga/contrats/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cofiga-contracts'] })
    },
  })
}

// ✅ Hook pour les STATISTIQUES COFIGA
export const useCofigaStats = () => {
  return useQuery<CofigaDashboardStats>({
    queryKey: ['cofiga-stats'],
    queryFn: async () => {
      const response = await axios.get('/cofiga/contrats/statistiques')
      console.log('🏦 COFIGA Stats Response:', response.data)
      
      if (response.data?.success && response.data?.data) {
        return response.data.data
      }
      return response.data
    },
  })
}

// ✅ Hook pour SIMULATION de tarification COFIGA
export const useCofigaSimulation = () => {
  return useMutation<{ success: boolean; simulation: CofigaSimulation }, Error, {
    montant_pret_assure: number
    duree_mois?: number
  }>({
    mutationFn: async (payload) => {
      const { data } = await axios.post('/cofiga/contrats/simuler-tarification', payload)
      return data
    },
  })
}

// ✅ Hook pour CALCULER la cotisation COFIGA
export const useCofigaCalculerCotisation = () => {
  return useMutation<any, Error, {
    montant_pret_assure: number
  }>({
    mutationFn: async (payload) => {
      const { data } = await axios.post('/cofiga/contrats/calculer-cotisation', payload)
      return data
    },
  })
}

// ✅ Hook pour valider les signatures COFIGA
export const useCofigaValiderSignatures = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { 
      id: number
      payload: {
        signature_assure?: boolean
        signature_cachet_cofiga?: boolean
        signature_assureur?: boolean
        lieu_signature?: string
        date_signature?: string
      }
    }) => {
      const { data } = await axios.post(`/cofiga/contrats/${id}/valider-signatures`, payload)
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cofiga-contracts'] })
      queryClient.invalidateQueries({ queryKey: ['cofiga-contract', variables.id] })
    },
  })
}

// ✅ Hook pour les contrats expirant prochainement
export const useCofigaContratsExpirant = (jours: number = 30) => {
  return useQuery({
    queryKey: ['cofiga-contracts-expiring', jours],
    queryFn: async () => {
      const response = await axios.get('/cofiga/contrats/expirant-prochainement', {
        params: { jours },
      })
      
      if (response.data?.success) {
        return response.data.data
      }
      return response.data
    },
  })
}

// ✅ Hook pour les contrats par catégorie
export const useCofigaContratsByCategorie = (categorie: string) => {
  return useQuery({
    queryKey: ['cofiga-contracts-categorie', categorie],
    queryFn: async () => {
      const response = await axios.get(`/cofiga/contrats/categorie/${categorie}`)
      
      if (response.data?.success) {
        return response.data.data
      }
      return response.data
    },
    enabled: !!categorie,
  })
}
