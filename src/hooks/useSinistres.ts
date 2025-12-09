// src/hooks/useSinistres.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sinistreService } from '@/services/sinistre.service'
import { SinistreCreatePayload, ContratType, SinistreType } from '@/types/sinistre.types'

/**
 * Hook pour récupérer la liste des sinistres avec filtres
 */
export const useSinistres = (params?: {
  statut?: string
  type_sinistre?: SinistreType
  contrat_type?: ContratType
  contrat_id?: number
  page?: number
}) => {
  return useQuery({
    queryKey: ['sinistres', params],
    queryFn: () => sinistreService.getAll(params),
  })
}

/**
 * Hook pour récupérer un sinistre par ID
 */
export const useSinistre = (id: number) => {
  return useQuery({
    queryKey: ['sinistre', id],
    queryFn: () => sinistreService.getById(id),
    enabled: !!id,
  })
}

/**
 * Hook pour créer un sinistre
 * Fonctionne avec l'API Laravel: POST /api/sinistres
 */
export const useCreateSinistre = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: SinistreCreatePayload) => sinistreService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sinistres'] })
    },
  })
}

/**
 * Hook pour mettre à jour un sinistre
 */
export const useUpdateSinistre = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof sinistreService.update>[1] }) =>
      sinistreService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sinistres'] })
      queryClient.invalidateQueries({ queryKey: ['sinistre', variables.id] })
    },
  })
}

/**
 * Hook pour uploader un document sur un sinistre existant
 */
export const useUploadSinistreDocument = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      sinistreId,
      file,
      typeDocument,
      description,
    }: {
      sinistreId: number
      file: File
      typeDocument: string
      description?: string
    }) => sinistreService.uploadDocument(sinistreId, file, typeDocument, description),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sinistre', variables.sinistreId] })
    },
  })
}

/**
 * Hook pour récupérer les statistiques des sinistres
 */
export const useSinistreStats = () => {
  return useQuery({
    queryKey: ['sinistres-stats'],
    queryFn: () => sinistreService.getStats(),
  })
}
