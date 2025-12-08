import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { SodecAssureAssocie } from '@/types/sodec'

export const useSodecAssuresAssocies = (contratId: number) => {
  return useQuery<SodecAssureAssocie[]>({
    queryKey: ['sodec-assures-associes', contratId],
    queryFn: async () => {
      const response = await api.get(`/api/sodec/contrats/${contratId}/assures-associes`)
      return response.data
    },
    enabled: !!contratId,
  })
}

export const useAddSodecAssure = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ contratId, data }: { contratId: number; data: Partial<SodecAssureAssocie> }) =>
      api.post(`/api/sodec/contrats/${contratId}/assures-associes`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sodec-assures-associes', variables.contratId] })
    },
  })
}

export const useRemoveSodecAssure = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ contratId, assureId }: { contratId: number; assureId: number }) =>
      api.delete(`/api/sodec/contrats/${contratId}/assures-associes/${assureId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sodec-assures-associes', variables.contratId] })
    },
  })
}
