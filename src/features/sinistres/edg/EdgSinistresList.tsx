// src/features/sinistres/edg/EdgSinistresList.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, AlertCircle, Filter, Plus, Eye } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import axios from '@/lib/axios'
import { useAuthStore } from '@/store/authStore'

const EDG_EMF_ID = 4

const getStatutColor = (statut?: string) => {
  switch (statut) {
    case 'valide': return 'bg-green-100 text-green-800 border-green-200'
    case 'en_cours': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'en_attente': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'refuse': return 'bg-red-100 text-red-800 border-red-200'
    case 'cloture': return 'bg-gray-100 text-gray-800 border-gray-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getTypeLabel = (type?: string) => {
  const labels: Record<string, string> = {
    'deces': 'Décès',
    'iad': 'IAD',
    'perte_emploi': 'Perte d\'emploi',
    'autre': 'Autre'
  }
  return labels[type || ''] || type || 'N/A'
}

const getStatutLabel = (statut?: string) => {
  const labels: Record<string, string> = {
    'en_attente': 'En attente',
    'en_cours': 'En cours',
    'valide': 'Validé',
    'refuse': 'Refusé',
    'cloture': 'Clôturé'
  }
  return labels[statut || ''] || statut || 'N/A'
}

export const EdgSinistresList = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const emfId = user?.emf_id || EDG_EMF_ID

  const [search, setSearch] = useState('')

  const { data: sinistres = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['edg-sinistres', emfId, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        emf_id: emfId.toString(),
        contrat_type: 'ContratEdg',
        ...(search && { search }),
        per_page: '50'
      })
      const response = await axios.get(`/sinistres?${params}`)
      const rawData = response.data
      if (rawData?.data?.data) return rawData.data.data
      if (Array.isArray(rawData?.data)) return rawData.data
      if (Array.isArray(rawData)) return rawData
      return []
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Chargement des sinistres EDG..." />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 p-8">
        <div className="text-red-600 font-semibold text-lg">❌ Erreur chargement sinistres</div>
        <Button variant="outline" onClick={() => refetch()}>🔄 Réessayer</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
            ⚠️ Sinistres EDG
          </h1>
          <p className="text-gray-600">{sinistres.length} sinistre(s) trouvé(s)</p>
        </div>
        <Button
          onClick={() => navigate('/sinistres/nouveau/edg')}
          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg px-6"
        >
          <Plus className="h-5 w-5 mr-2" />
          Déclarer un sinistre
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-11" />
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="h-11">
              <Filter className="h-4 w-4 mr-1" /> Actualiser
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xl">
        <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 border-b">
          <CardTitle className="flex items-center gap-2 text-xl">
            <AlertCircle className="h-6 w-6 text-violet-600" />
            Liste des sinistres ({sinistres.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {sinistres.length === 0 ? (
            <div className="text-center py-16 px-4">
              <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun sinistre EDG</h3>
              <Button onClick={() => navigate('/sinistres/nouveau/edg')} className="bg-gradient-to-r from-violet-600 to-purple-600">
                <Plus className="h-5 w-5 mr-2" /> Déclarer un sinistre
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase">N° Sinistre</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase">Assuré</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase">Date</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-900 uppercase">Montant</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase">Statut</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-900 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sinistres.map((sinistre: any) => (
                    <tr key={sinistre.id} className="cursor-pointer hover:bg-violet-50" onClick={() => navigate(`/sinistres/edg/${sinistre.id}`)}>
                      <td className="px-6 py-4 font-mono text-violet-600 font-semibold">{sinistre.numero_sinistre || `SIN-${sinistre.id}`}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{sinistre.contrat?.nom_prenom || 'N/A'}</td>
                      <td className="px-6 py-4"><Badge className="bg-violet-100 text-violet-800">{getTypeLabel(sinistre.type_sinistre)}</Badge></td>
                      <td className="px-6 py-4 text-sm">{formatDate(sinistre.date_survenance)}</td>
                      <td className="px-6 py-4 text-right font-bold text-violet-600">{formatCurrency(sinistre.montant_reclame || 0)}</td>
                      <td className="px-6 py-4"><Badge className={getStatutColor(sinistre.statut)}>{getStatutLabel(sinistre.statut)}</Badge></td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/sinistres/edg/${sinistre.id}`) }} className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
