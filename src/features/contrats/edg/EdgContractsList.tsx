import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, FileText, Filter, Plus, Eye, Edit, Car, HeartHandshake, ShieldCheck
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useEdgContracts } from '@/hooks/useEdgContracts'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatCurrency, formatDate } from '@/lib/utils'
import { EdgContrat } from '@/types/edg'

// Fonctions utilitaires sécurisées
const getStatusColor = (status?: string) => {
  switch (status) {
    case 'actif':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'en_attente':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'suspendu':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'resilie':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'termine':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getTierColor = (montant?: number) => {
  // VIP si montant > 25M
  if (montant && montant > 25000000) {
    return 'bg-purple-100 text-purple-800 border-purple-200'
  }
  return 'bg-blue-100 text-blue-800 border-blue-200'
}

const getTierLabel = (montant?: number) => {
  if (montant && montant > 25000000) {
    return 'VIP'
  }
  return 'STANDARD'
}

export const EdgContractsList = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [isNewContractModalOpen, setIsNewContractModalOpen] = useState(false)

  const {
    data: allContrats = [],
    isLoading,
    isError,
    refetch,
    error
  } = useEdgContracts({ search })

  // Filtrer par recherche côté client si nécessaire
  const contrats = allContrats.filter((c: EdgContrat) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      c.nom_prenom?.toLowerCase().includes(searchLower) ||
      c.numero_police?.toLowerCase().includes(searchLower) ||
      c.telephone_assure?.toLowerCase().includes(searchLower)
    )
  })

  console.log('📋 EDG - Contrats reçus:', contrats.length, contrats.slice(0, 2))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Chargement des contrats EDG..." />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 p-8">
        <div className="text-red-600 font-semibold text-lg">
          ❌ Erreur chargement contrats EDG
        </div>
        <p className="text-red-500 text-sm">{error instanceof Error ? error.message : 'Erreur inconnue'}</p>
        <Button variant="outline" onClick={() => refetch()} className="w-full max-w-xs">
          🔄 Réessayer
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            📋 Contrats EDG
          </h1>
          <p className="text-gray-600">
            {contrats.length} contrat(s) trouvé(s)
          </p>
        </div>
        <Button
          onClick={() => setIsNewContractModalOpen(true)}
          className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-lg px-6"
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
        <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b">
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-6 w-6" />
            Liste des contrats EDG ({contrats.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {contrats.length === 0 ? (
            <div className="text-center py-16 px-4">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucun contrat EDG trouvé
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Créez votre premier contrat EDG pour commencer à gérer vos micro-assurances.
              </p>
              <Button
                onClick={() => setIsNewContractModalOpen(true)}
                className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-lg px-8"
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
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Tier</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-900 uppercase tracking-wider">Montant Prêt</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Date Effet</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-900 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contrats.map((contrat: any) => (
                    <tr
                      key={contrat.id}
                      className="cursor-pointer hover:bg-teal-50 transition-all duration-200"
                      onClick={() => {
                        if (contrat.source === 'taxi_perte_recette') {
                          navigate(`/contrats/edg-taxi-perte-recette/${contrat.id}`)
                        } else if (contrat.source === 'taxi_prevoyance_deces') {
                          navigate(`/contrats/edg-taxi-prevoyance-deces/${contrat.id}`)
                        } else {
                          navigate(`/contrats/edg/${contrat.id}`)
                        }
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-teal-600 font-semibold">
                        <div className="flex items-center gap-2">
                          {contrat.source === 'taxi_perte_recette' && <Car className="h-4 w-4 text-orange-500" />}
                          {contrat.source === 'taxi_prevoyance_deces' && <HeartHandshake className="h-4 w-4 text-purple-600" />}
                          #{contrat.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap max-w-[220px] truncate font-medium text-gray-900">
                        {contrat.nom_prenom}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-medium text-gray-700">
                        {contrat.numero_police || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`px-3 py-1 rounded-full text-xs font-semibold ${getTierColor(contrat.montant_pret_assure)}`}>
                          {getTierLabel(contrat.montant_pret_assure)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-teal-600 text-lg">
                        {formatCurrency(contrat.montant_pret_assure || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {formatDate(contrat.date_effet) || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(contrat.statut)}`}>
                          {contrat.statut?.toUpperCase() || 'N/A'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (contrat.source === 'taxi_perte_recette') {
                              navigate(`/contrats/edg-taxi-perte-recette/${contrat.id}`)
                            } else if (contrat.source === 'taxi_prevoyance_deces') {
                              navigate(`/contrats/edg-taxi-prevoyance-deces/${contrat.id}`)
                            } else {
                              navigate(`/contrats/edg/${contrat.id}`)
                            }
                          }}
                          className="h-8 w-8 p-0 hover:bg-teal-100"
                          title="Voir détails"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (contrat.source === 'taxi_perte_recette') {
                              navigate(`/contrats/edg-taxi-perte-recette/${contrat.id}/edit`)
                            } else if (contrat.source === 'taxi_prevoyance_deces') {
                              navigate(`/contrats/edg-taxi-prevoyance-deces/${contrat.id}/edit`)
                            } else {
                              navigate(`/contrats/edg/${contrat.id}/edit`)
                            }
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

      <Modal
        isOpen={isNewContractModalOpen}
        onClose={() => setIsNewContractModalOpen(false)}
        title="Nouveau Contrat EDG"
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-2">
          <div
            onClick={() => {
              setIsNewContractModalOpen(false)
              navigate('/contrats/nouveau/edg-standard')
            }}
            className="border-2 border-gray-100 hover:border-teal-600 hover:bg-teal-50 rounded-2xl p-6 cursor-pointer transition-all flex flex-col items-center text-center group"
          >
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-8 w-8 text-teal-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">EDG Standard</h3>
            <p className="text-xs text-gray-500">
              Assurance emprunteur classique pour les crédits et micro-crédits.
            </p>
          </div>

          <div
            onClick={() => {
              setIsNewContractModalOpen(false)
              navigate('/contrats/nouveau/edg-taxi-perte-recette')
            }}
            className="border-2 border-gray-100 hover:border-orange-500 hover:bg-orange-50 rounded-2xl p-6 cursor-pointer transition-all flex flex-col items-center text-center group"
          >
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Car className="h-8 w-8 text-orange-500" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">TAXI - Perte Recette</h3>
            <p className="text-xs text-gray-500">
              Garantie de revenus pour les chauffeurs en cas d'immobilisation.
            </p>
          </div>

          <div
            onClick={() => {
              setIsNewContractModalOpen(false)
              navigate('/contrats/nouveau/edg-taxi-prevoyance-deces')
            }}
            className="border-2 border-gray-100 hover:border-purple-600 hover:bg-purple-50 rounded-2xl p-6 cursor-pointer transition-all flex flex-col items-center text-center group"
          >
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <HeartHandshake className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">TAXI - Prévoyance Décès</h3>
            <p className="text-xs text-gray-500">
              Protection familiale et frais funéraires pour les transporteurs.
            </p>
          </div>
        </div>
      </Modal>
    </div >
  )
}
