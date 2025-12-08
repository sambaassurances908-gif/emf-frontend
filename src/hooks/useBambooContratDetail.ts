// src/hooks/useBambooContratDetail.ts
import { useQuery } from '@tanstack/react-query'
import axios from '@/lib/axios'
import { BambooContrat } from '@/types/bamboo'

export const useBambooContratDetail = (id: number) => {
  return useQuery<BambooContrat>({
    queryKey: ['bamboo-contrat', id],
    queryFn: async () => {
      const { data } = await axios.get<BambooContrat>(`/bamboo-emf/contrats/${id}`)
      return data
    },
    enabled: !!id,
  })
}
