// src/features/contrats/cofiga/CofigaContractsList.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, FileText, Filter, Plus, Eye, Edit 
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useCofigaContracts } from '@/hooks/useCofigaContracts'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CofigaContrat } from '@/types/cofiga'

// Fonctions utilitaires sécurisées
const getStatusColor = (status?: string) => {
  const colors: Record<string, string> = {
    actif: 'bg-green-100 text-green-800 border-green-200',
    'en attente': 'bg-blue-100 text-blue-800 border-blue-200',
    en_attente: 'bg-blue-100 text-blue-800 border-blue-200',
    suspendu: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    resilie: 'bg-red-100 text-red-800 border-red-200',
    résilié: 'bg-red-100 text-red-800 border-red-200',
    termine: 'bg-gray-100 text-gray-800 border-gray-200',
    terminé: 'bg-gray-100 text-gray-800 border-gray-200',
    sinistre: 'bg-orange-100 text-orange-800 border-orange-200',
  }
  const key = (status || '').toLowerCase()
  return colors[key] || 'bg-gray-100 text-gray-800 border-gray-200'
}

const getCategorieColor = (categorie?: string) => {
  const colors: Record<string, string> = {
    'commerçants': 'bg-purple-100 text-purple-800 border-purple-200',
    'salariés du public': 'bg-blue-100 text-blue-800 border-blue-200',
    'salariés du privé': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'autre': 'bg-gray-100 text-gray-800 border-gray-200',
  }
  const key = (categorie || '').toLowerCase()
  return colors[key] || 'bg-gray-100 text-gray-800 border-gray-200'
}

export const CofigaContractsList = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [categorieFilter, setCategorieFilter] = useState<string>('')
  const [statutFilter, setStatutFilter] = useState<string>('')

  const {
    data,
    isLoading,
    isError,
    refetch,
    error
  } = useCofigaContracts({
    search: search || undefined,
    categorie: categorieFilter || undefined,
    statut: statutFilter || undefined,
  })

  // Filtrer les contrats côté client selon la recherche
  const allContrats = Array.isArray(data?.data) ? data.data : []
  const contrats = search.trim() 
    ? allContrats.filter((c: CofigaContrat) => 
        `${c.nom} ${c.prenom}`.toLowerCase().includes(search.toLowerCase()) ||
        c.numero_police?.toLowerCase().includes(search.toLowerCase()) ||
        c.telephone?.includes(search)
      )
    : allContrats

  console.log('🏦 COFIGA - Contrats reçus:', contrats.length, contrats.slice(0, 2))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Chargement des contrats COFIGA..." />
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
    <div className="space-y-6 p-6 min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
            🏦 Contrats COFIGA
          </h1>
          <p className="text-gray-600">
            Micro-assurance Prêts COFIGA • {contrats.length} contrat(s) trouvé(s)
          </p>
        </div>
        <Button
          onClick={() => navigate('/contrats/nouveau/cofiga')}
          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg px-6"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouveau Contrat
        </Button>
      </div>

      {/* Barre de recherche et filtres */}
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
              <select
                value={categorieFilter}
                onChange={(e) => setCategorieFilter(e.target.value)}
                className="h-11 px-3 border rounded-md text-sm"
              >
                <option value="">Toutes catégories</option>
                <option value="Commerçants">Commerçants</option>
                <option value="Salariés du public">Salariés du public</option>
                <option value="Salariés du privé">Salariés du privé</option>
                <option value="Autre">Autre</option>
              </select>
              <select
                value={statutFilter}
                onChange={(e) => setStatutFilter(e.target.value)}
                className="h-11 px-3 border rounded-md text-sm"
              >
                <option value="">Tous statuts</option>
                <option value="actif">Actif</option>
                <option value="en_attente">En attente</option>
                <option value="suspendu">Suspendu</option>
                <option value="resilie">Résilié</option>
                <option value="termine">Terminé</option>
              </select>
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
        <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 border-b">
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
                Aucun contrat COFIGA trouvé
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Créez votre premier contrat COFIGA pour commencer à gérer vos micro-assurances.
              </p>
              <Button
                onClick={() => navigate('/contrats/nouveau/cofiga')}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg px-8"
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
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Catégorie</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-900 uppercase tracking-wider">Montant Prêt</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-900 uppercase tracking-wider">Cotisation</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Date Effet</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-900 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contrats.map((contrat: CofigaContrat) => (
                    <tr
                      key={contrat.id}
                      className="cursor-pointer hover:bg-violet-50 transition-all duration-200"
                      onClick={() => navigate(`/contrats/cofiga/${contrat.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-violet-600 font-semibold">
                        #{contrat.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap max-w-[220px] truncate font-medium text-gray-900">
                        {contrat.nom} {contrat.prenom}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-medium text-gray-700">
                        {contrat.numero_police || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategorieColor(contrat.categorie)}`}>
                          {contrat.categorie || 'N/A'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(contrat.statut)}`}>
                          {contrat.statut || 'N/A'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-violet-600 text-lg">
                        {formatCurrency(contrat.montant_pret_assure || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-gray-700">
                        {formatCurrency(contrat.cotisation_totale || 0)}
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
                            navigate(`/contrats/cofiga/${contrat.id}`)
                          }}
                          className="h-8 w-8 p-0 hover:bg-violet-100"
                          title="Voir détails"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/contrats/cofiga/${contrat.id}/edit`)
                          }}
                          className="h-8 w-8 p-0 hover:bg-purple-100"
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

export default CofigaContractsList
