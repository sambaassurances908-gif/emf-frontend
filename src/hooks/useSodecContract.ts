import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { SodecContrat } from '@/types/sodec'

export const useSodecContract = (id: number) => {
  return useQuery({
    queryKey: ['sodec-contract', id],
    queryFn: async () => {
      const response = await api.get(`/sodec/contrats/${id}`)
      return response.data.data
    },
    enabled: !!id,
  })
}
