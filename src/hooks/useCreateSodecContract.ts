import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { toast } from 'react-hot-toast'

interface SodecContractPayload {
  emf_id: number
  nom_prenom: string
  adresse_assure: string
  ville_assure: string
  telephone_assure: string
  email_assure?: string | null
  date_naissance?: string | null
  numero_police?: string | null
  categorie: 'commercants' | 'salaries_public' | 'salaries_prive' | 'retraites' | 'autre'
  autre_categorie_precision?: string | null
  option_prevoyance: 'option_a' | 'option_b'
  montant_pret_assure: number
  duree_pret_mois: number
  date_effet: string
  beneficiaire_deces?: string | null
  beneficiaire_nom?: string | null
  beneficiaire_prenom?: string | null
  beneficiaire_date_naissance?: string | null
  beneficiaire_lieu_naissance?: string | null
  beneficiaire_contact?: string | null
  garantie_prevoyance: boolean
  garantie_deces_iad: boolean
  garantie_perte_emploi?: boolean
  type_contrat_travail?: 'cdi' | 'cdd_plus_9_mois' | 'cdd_moins_9_mois' | 'non_applicable'
  agence?: string | null
  statut?: 'actif' | 'en_attente' | 'expire' | 'resilie'
  assures_associes?: Array<{
    type_assure: string
    nom: string
    prenom: string
    date_naissance: string
    lieu_naissance: string
    contact?: string
  }>
}

export const useCreateSodecContract = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: SodecContractPayload) => {
      console.log('📤 HOOK - Payload COMPLET reçu:', payload)
      
      // ✅ URL CORRIGÉE : SUPPRESSION du double /api/
      const response = await api.post('/sodec/contrats', payload, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      })

      console.log('✅ Réponse backend:', response.data)
      return response.data
    },
    onSuccess: (data) => {
      // ✅ Rafraîchir TOUS les caches
      queryClient.invalidateQueries({ queryKey: ['sodec-stats'] })
      queryClient.invalidateQueries({ queryKey: ['sodec-contracts'] })
      queryClient.invalidateQueries({ queryKey: ['sodec-recent-contracts'] })
      
      toast.success('✅ Contrat SODEC créé avec succès !')
    },
    onError: (error: any) => {
      console.error('❌ Erreur complète:', error.response?.data)
      console.error('❌ Erreurs détaillées:', JSON.stringify(error.response?.data?.errors, null, 2))
      
      if (error.response?.status === 422) {
        const errors = error.response.data.errors || {}
        const errorMessages = Object.entries(errors).map(([field, msgs]) => 
          `${field}: ${Array.isArray(msgs) ? msgs[0] : msgs}`
        )
        console.error('❌ Liste des erreurs:', errorMessages)
        toast.error(`❌ ${errorMessages[0] || 'Erreur de validation'}`)
      } else if (error.response?.status === 405) {
        toast.error('❌ Route non trouvée - vérifiez l\'URL backend')
      } else {
        toast.error('❌ Erreur serveur lors de la création')
      }
    }
  })
}
