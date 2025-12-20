// src/hooks/useSinistresEvolution.ts
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export interface SinistresEvolutionItem {
  mois: string
  declares: number
  regles: number
  rejetes: number
}

export interface SinistresEvolutionResponse {
  success: boolean
  data: SinistresEvolutionItem[]
}

/**
 * Hook pour récupérer l'évolution des sinistres sur l'année
 * Essaie d'abord l'endpoint dédié, sinon calcule à partir des sinistres
 */
export const useSinistresEvolution = (year?: number) => {
  const currentYear = year || new Date().getFullYear()
  
  return useQuery({
    queryKey: ['sinistres-evolution', currentYear],
    queryFn: async (): Promise<SinistresEvolutionItem[]> => {
      try {
        // Essayer d'abord l'endpoint dédié
        const response = await api.get<SinistresEvolutionResponse>(
          '/sinistres/statistiques/evolution',
          { params: { annee: currentYear } }
        )
        if (response.data.success && response.data.data) {
          return response.data.data
        }
      } catch (error) {
        console.log('⚠️ Endpoint evolution non disponible, calcul manuel...')
      }
      
      // Fallback: récupérer tous les sinistres de l'année et calculer
      try {
        const sinistresResponse = await api.get('/sinistres', {
          params: {
            date_debut: `${currentYear}-01-01`,
            date_fin: `${currentYear}-12-31`,
            per_page: 1000 // Récupérer tous les sinistres de l'année
          }
        })
        
        const sinistres = sinistresResponse.data?.data?.data || sinistresResponse.data?.data || []
        
        // Noms des mois en français
        const moisNoms = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc']
        
        // Initialiser les données par mois
        const evolutionData: SinistresEvolutionItem[] = moisNoms.map(mois => ({
          mois,
          declares: 0,
          regles: 0,
          rejetes: 0
        }))
        
        // Compter les sinistres par mois
        sinistres.forEach((sinistre: any) => {
          const dateDeclaration = sinistre.date_declaration || sinistre.created_at
          if (!dateDeclaration) return
          
          const date = new Date(dateDeclaration)
          const moisIndex = date.getMonth()
          
          if (moisIndex >= 0 && moisIndex < 12) {
            evolutionData[moisIndex].declares++
            
            // Compter les réglés (payés ou clôturés)
            if (sinistre.statut === 'paye' || sinistre.statut === 'cloture') {
              evolutionData[moisIndex].regles++
            }
            
            // Compter les rejetés
            if (sinistre.statut === 'rejete') {
              evolutionData[moisIndex].rejetes++
            }
          }
        })
        
        return evolutionData
      } catch (fallbackError) {
        console.error('❌ Erreur récupération sinistres:', fallbackError)
        // Retourner des données vides pour tous les mois
        const moisNoms = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc']
        return moisNoms.map(mois => ({ mois, declares: 0, regles: 0, rejetes: 0 }))
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })
}
