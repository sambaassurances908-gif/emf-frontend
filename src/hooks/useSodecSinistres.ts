// src/hooks/useSodecSinistres.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/lib/axios'
import { SodecSinistre, SodecSinistreCreatePayload } from '@/types/sinistre.types'

export const useSodecContratsForSinistre = (emfId: number) => {
  return useQuery({
    queryKey: ['sodec-contrats-for-sinistre', emfId],
    queryFn: async () => {
      const { data } = await axios.get('/sodec-emf/contrats', {
        params: { emf_id: emfId, statut: 'actif' },
      })
      return data.data
    },
  })
}

export const useCreateSodecSinistre = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (payload: SodecSinistreCreatePayload) => {
      const formData = new FormData()
      formData.append('contrat_id', payload.contrat_id.toString())
      formData.append('type_sinistre', payload.type_sinistre)
      formData.append('date_survenance', payload.date_survenance)
      formData.append('description', payload.description)
      
      if (payload.documents) {
        payload.documents.forEach((file, index) => {
          formData.append(`documents[${index}]`, file)
        })
      }
      
      const { data } = await axios.post<SodecSinistre>(
        '/sodec-emf/sinistres',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sodec-sinistres'] })
    },
  })
}
