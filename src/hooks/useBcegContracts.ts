// src/hooks/useBcegContracts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { BcegContrat, BcegContratFormData } from '@/types/bceg'



// ✅ Hook pour la LISTE des contrats BCEG (Standard + Moto + Taxi)
export const useBcegContracts = (emfId: number) => {
  return useQuery<(BcegContrat | any)[]>({
    queryKey: ['bceg-contracts-all', emfId],
    queryFn: async () => {
      console.log('🔍 BCEG HOOK - Récupération contrats (Standard + Moto + Taxi):', { emfId })

      const [resStandard, resMoto, resTaxiPR, resTaxiPD] = await Promise.allSettled([
        api.get('/bceg/contrats', { params: { emf_id: emfId, per_page: 100 } }),
        api.get('/bceg-moto/contrats', { params: { emf_id: emfId, per_page: 100 } }),
        api.get('/bceg-taxi-perte-recette/contrats', { params: { emf_id: emfId, per_page: 100 } }),
        api.get('/bceg-taxi-prevoyance-deces/contrats', { params: { emf_id: emfId, per_page: 100 } })
      ])

      // Helper to extract data
      const extractData = (res: PromiseSettledResult<any>) => {
        if (res.status !== 'fulfilled') return []
        const data = res.value.data
        if (Array.isArray(data)) return data
        if (Array.isArray(data?.data)) return data.data
        if (Array.isArray(data?.data?.data)) return data.data.data
        return []
      }

      const contratsStandard = extractData(resStandard)
      const contratsMoto = extractData(resMoto)
      const contratsTaxiPR = extractData(resTaxiPR)
      const contratsTaxiPD = extractData(resTaxiPD)

      // Add Source tag & Normalize
      const standardTagged = contratsStandard.map((c: any) => ({ ...c, source: 'standard' }))

      const motoTagged = contratsMoto.map((c: any) => ({
        ...c,
        source: 'moto',
        numero_police: c.numero_police || c.police_numero,
        statut: c.statut || 'actif'
      }))

      const taxiPRTagged = contratsTaxiPR.map((c: any) => ({
        ...c,
        source: 'taxi_perte_recette',
        montant_pret: 0,
        statut: c.statut || 'actif'
      }))

      const taxiPDTagged = contratsTaxiPD.map((c: any) => ({
        ...c,
        source: 'taxi_prevoyance_deces',
        montant_pret: 0,
        statut: c.statut || 'actif'
      }))

      // Merge and Sort by created_at desc
      const merged = [...standardTagged, ...motoTagged, ...taxiPRTagged, ...taxiPDTagged].sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime()
        const dateB = new Date(b.created_at || 0).getTime()
        return dateB - dateA
      })

      console.log(`✅ BCEG HOOK - Total: ${merged.length} (Std: ${contratsStandard.length}, Moto: ${contratsMoto.length}, TaxiPR: ${contratsTaxiPR.length}, TaxiPD: ${contratsTaxiPD.length})`)
      return merged
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
    queryKey: ['bceg-stats-combined', emfId],
    queryFn: async () => {
      // Parallel fetch: Standard Stats, Moto List (to count)
      const [resStats, resMoto] = await Promise.allSettled([
        api.get('/bceg/contrats/statistiques/global', { params: emfId ? { emf_id: emfId } : {} }),
        api.get('/bceg-moto/contrats', { params: { emf_id: emfId, per_page: 1 } }) // Minimal fetch just for meta total if available
      ])

      let stats = { total: 0, actifs: 0, en_attente: 0, resilie: 0, cotisation_totale: 0, montant_total_assure: 0 }

      // Process Standard Stats
      if (resStats.status === 'fulfilled') {
        const data = resStats.value.data?.data || resStats.value.data
        if (data) stats = { ...data }
      }

      // Process Moto Stats (Estimate from list meta)
      if (resMoto.status === 'fulfilled') {
        const data = resMoto.value.data
        let motoCount = 0
        if (Array.isArray(data)) motoCount = data.length
        else if (data?.total) motoCount = data.total // Laravel paginate meta
        else if (data?.data?.length) motoCount = data.data.length

        // Add Moto count to Total and Actifs (assuming active)
        stats.total += motoCount
        stats.actifs += motoCount
        // Cannot easily merge revenue without more data, but count is key
      }

      return stats
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
