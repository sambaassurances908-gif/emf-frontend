import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Calendar, DollarSign } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import api from '@/lib/api'

interface Contrat {
  id: number
  numero_contrat: string
  nom_assure: string
  prenom_assure: string
  montant_assure: number
  date_effet: string
  statut: string
  type_contrat: string
}

interface RecentContractsProps {
  emfId: number
  limit?: number
}

export const RecentContracts = ({ emfId, limit = 5 }: RecentContractsProps) => {
  const navigate = useNavigate()
  const [contrats, setContrats] = useState<Contrat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContrats = async () => {
      try {
        const response = await api.get(`/contrats?emf_id=${emfId}&limit=${limit}`)
        setContrats(response.data.data || [])
      } catch (error) {
        console.error('Erreur chargement contrats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchContrats()
  }, [emfId, limit])

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 rounded"></div>
        ))}
      </div>
    )
  }

  if (contrats.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Aucun contrat pour le moment</p>
        <p className="text-sm text-gray-500 mt-2">
          Créez votre premier contrat pour commencer
        </p>
      </div>
    )
  }

  const getStatusColor = (statut: string) => {
    const colors: Record<string, string> = {
      actif: 'bg-green-100 text-green-800',
      suspendu: 'bg-yellow-100 text-yellow-800',
      resilie: 'bg-red-100 text-red-800',
      expire: 'bg-gray-100 text-gray-800',
    }
    return colors[statut] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-4">
      {contrats.map((contrat) => (
        <div
          key={contrat.id}
          onClick={() => navigate(`/contrats/${contrat.id}`)}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-4 flex-1">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-gray-900 truncate">
                  {contrat.nom_assure} {contrat.prenom_assure}
                </p>
                <Badge className={getStatusColor(contrat.statut)}>
                  {contrat.statut}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 truncate">
                N° {contrat.numero_contrat}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(contrat.date_effet).toLocaleDateString('fr-FR')}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'XOF',
                  }).format(contrat.montant_assure)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
