import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

export const useBcegContracts = (params?: any) =>
  useQuery({
    queryKey: ['bceg-contracts', params],
    queryFn: async () => {
      const res = await api.get('/bceg/contrats', { params })
      return res.data
    },
  })

export const useBcegContract = (id: string | number) =>
  useQuery({
    queryKey: ['bceg-contract', id],
    queryFn: async () => {
      const res = await api.get(`/bceg/contrats/${id}`)
      return res.data
    },
    enabled: !!id,
  })

export const useCreateBcegContract = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/bceg/contrats', payload)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bceg-contracts'] })
      queryClient.invalidateQueries({ queryKey: ['bceg-stats'] })
    },
  })
}
