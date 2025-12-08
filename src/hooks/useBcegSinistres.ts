// src/hooks/useBcegSinistres.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

export interface BcegSinistreCreatePayload {
  // Champs obligatoires
  contrat_type: 'ContratBceg' | 'App\\Models\\ContratBceg'
  contrat_id: number
  type_sinistre: 'deces' | 'iad' | 'perte_emploi' | 'perte_activite'
  date_sinistre: string
  nom_declarant: string
  prenom_declarant: string
  qualite_declarant: string
  telephone_declarant: string
  capital_restant_du: number
  
  // Champs optionnels
  email_declarant?: string
  circonstances?: string
  lieu_sinistre?: string
  montant_reclame?: number
  
  // Documents justificatifs
  doc_certificat_deces?: boolean
  doc_piece_identite?: boolean
  doc_certificat_heredite?: boolean
  doc_proces_verbal?: boolean
  doc_certificat_licenciement?: boolean
  doc_certificat_arret_travail?: boolean
  doc_proces_verbal_faillite?: boolean
  autres_documents?: string
}

export interface BcegSinistre {
  id: number
  contrat_id: number
  contrat_type: string
  type_sinistre: string
  date_sinistre: string
  date_declaration: string
  nom_declarant: string
  prenom_declarant: string
  qualite_declarant: string
  telephone_declarant: string
  email_declarant?: string
  capital_restant_du: string
  montant_reclame?: string
  montant_indemnite?: string
  circonstances?: string
  lieu_sinistre?: string
  statut: string
  created_at: string
  updated_at: string
  contrat?: any
}

// Hook pour récupérer les contrats BCEG pour la déclaration de sinistre
export const useBcegContratsForSinistre = (emfId: number) => {
  return useQuery({
    queryKey: ['bceg-contrats-for-sinistre', emfId],
    queryFn: async () => {
      console.log('🔍 Récupération contrats BCEG pour sinistre:', { emfId })
      
      const response = await api.get('/bceg/contrats', {
        params: { emf_id: emfId, per_page: 100 },
      })
      
      console.log('📦 Contrats BCEG pour sinistre:', response.data)
      
      // Gérer différentes structures de réponse API
      let contrats = []
      
      if (Array.isArray(response.data)) {
        contrats = response.data
      } else if (response.data?.data) {
        if (Array.isArray(response.data.data)) {
          contrats = response.data.data
        } else if (Array.isArray(response.data.data?.data)) {
          contrats = response.data.data.data
        }
      }
      
      // Filtrer uniquement les contrats actifs
      return contrats.filter((c: any) => c.statut === 'actif' || c.statut === 'en_attente')
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Hook pour créer un sinistre BCEG
export const useCreateBcegSinistre = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (payload: BcegSinistreCreatePayload) => {
      console.log('📤 Création sinistre BCEG:', payload)
      
      // Envoyer en JSON selon la documentation
      const response = await api.post('/sinistres', payload, {
        headers: { 'Content-Type': 'application/json' },
      })
      
      console.log('✅ Sinistre BCEG créé:', response.data)
      return response.data?.data || response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bceg-sinistres'] })
      queryClient.invalidateQueries({ queryKey: ['bceg-contracts'] })
      queryClient.invalidateQueries({ queryKey: ['sinistres'] })
    },
  })
}

// Hook pour récupérer la liste des sinistres BCEG
export const useBcegSinistres = (emfId: number) => {
  return useQuery({
    queryKey: ['bceg-sinistres', emfId],
    queryFn: async () => {
      const response = await api.get('/sinistres', {
        params: { emf_id: emfId, contrat_type: 'ContratBceg', per_page: 50 },
      })
      
      let sinistres = []
      
      if (Array.isArray(response.data)) {
        sinistres = response.data
      } else if (response.data?.data) {
        if (Array.isArray(response.data.data)) {
          sinistres = response.data.data
        } else if (Array.isArray(response.data.data?.data)) {
          sinistres = response.data.data.data
        }
      }
      
      return sinistres as BcegSinistre[]
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Hook pour récupérer le détail d'un sinistre BCEG
export const useBcegSinistre = (id?: number) => {
  return useQuery({
    queryKey: ['bceg-sinistre', id],
    queryFn: async () => {
      const response = await api.get(`/sinistres/${id}`)
      return response.data?.data || response.data
    },
    enabled: !!id,
  })
}
