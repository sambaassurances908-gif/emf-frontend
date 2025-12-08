import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, FileText, Filter, Plus, Eye, Edit, Trash2, Download 
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useSodecContracts } from '@/hooks/useSodecContracts'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatCurrency, formatDate } from '@/lib/utils'
import { SodecContrat } from '@/types/sodec'

// Fonctions utilitaires sécurisées
const getStatusColor = (status?: string) => 
  status === 'actif' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'

const getOptionColor = (option?: string) => 
  option === 'option_a' ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-blue-100 text-blue-800 border-blue-200'

export const SodecContractsList = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const emfId = user?.emf_id || 5

  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    statut: '',
    option: '',
    categorie: ''
  })

  const {
    data: contrats = [],
    isLoading,
    isError,
    refetch,
    error
  } = useSodecContracts(emfId, { search, ...filters })

  console.log('📋 FINAL - Contrats reçus:', contrats.length, contrats.slice(0, 2))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Chargement des contrats SODEC..." />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 p-8">
        <div className="text-red-600 font-semibold text-lg">
          ❌ Erreur chargement contrats
        </div>
        <p className="text-red-500 text-sm">{error instanceof Error ? error.message : 'Erreur inconnue'}</p>
        <Button variant="outline" onClick={() => refetch()} className="w-full max-w-xs">
          🔄 Réessayer
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            📋 Contrats SODEC
          </h1>
          <p className="text-gray-600">
            EMF #{emfId} • {contrats.length} contrat(s) trouvé(s)
          </p>
        </div>
        <Button
          onClick={() => navigate('/contrats/nouveau/sodec')}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg px-6"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouveau Contrat
        </Button>
      </div>

      {/* Barre de recherche */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, numéro de police, téléphone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetch()}
                className="h-11"
              >
                <Filter className="h-4 w-4 mr-1" />
                Actualiser
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau */}
      <Card className="shadow-xl">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-6 w-6" />
            Liste des contrats ({contrats.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {contrats.length === 0 ? (
            <div className="text-center py-16 px-4">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucun contrat SODEC trouvé
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Créez votre premier contrat SODEC pour commencer à gérer vos micro-assurances.
              </p>
              <Button
                onClick={() => navigate('/contrats/nouveau/sodec')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg px-8"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Créer premier contrat
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Assuré</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Police</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Option</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-900 uppercase tracking-wider">Montant Prêt</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Date Effet</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-900 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contrats.map((contrat: SodecContrat) => (
                    <tr
                      key={contrat.id}
                      className="cursor-pointer hover:bg-indigo-50 transition-all duration-200"
                      onClick={() => navigate(`/contrats/sodec/${contrat.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-indigo-600 font-semibold">
                        #{contrat.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap max-w-[220px] truncate font-medium text-gray-900">
                        {contrat.nom_prenom}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-medium text-gray-700">
                        {contrat.numero_police || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`px-3 py-1 rounded-full text-xs font-semibold ${getOptionColor(contrat.option_prevoyance)}`}>
                          {contrat.option_prevoyance?.toUpperCase() || 'N/A'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-indigo-600 text-lg">
                        {formatCurrency(contrat.montant_pret_assure || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {formatDate(contrat.date_effet) || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/contrats/sodec/${contrat.id}`)
                          }}
                          className="h-8 w-8 p-0 hover:bg-indigo-100"
                          title="Voir détails"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/contrats/sodec/${contrat.id}/edit`)
                          }}
                          className="h-8 w-8 p-0 hover:bg-blue-100"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
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
