import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { toast } from 'react-hot-toast'
import { SodecContractCreatePayload } from '@/types/sodec'

export const useCreateSodecContract = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: SodecContractCreatePayload) => {
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
    onSuccess: () => {
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
