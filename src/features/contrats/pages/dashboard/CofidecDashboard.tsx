import { useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { 
  Plus, 
  FileText, 
  AlertCircle, 
  TrendingUp, 
  Wallet,
  CheckCircle,
  XCircle,
  PauseCircle,
  Activity
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore } from '@/store/authStore'
import { useCofidecStats } from '@/hooks/useCofidecStats'
import { useCofidecRecentContracts } from '@/hooks/useCofidecRecentContracts'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatCurrency } from '@/lib/utils'
import { CofidecContrat } from '@/types/cofidec'

// Fonction pour formater les montants en format compact (1K, 1M, etc.)
const formatCompact = (value: number): string => {
  if (value >= 1000000000) {
    return (value / 1000000000).toFixed(1).replace(/\.0$/, '') + 'Md'
  }
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  }
  return value.toString()
}

export const CofidecDashboard = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, setUser } = useAuthStore()

  // Récupérer emf_id depuis state (LoginPage) ou localStorage ou user ou défaut à 2 (COFIDEC)
  const emfIdFromState = (location.state as { emf_id?: number })?.emf_id
  const emfIdFromStorage = localStorage.getItem('emf_id')
  const emfIdFromUser = user?.emf_id
  const emfId = emfIdFromState || emfIdFromUser || (emfIdFromStorage ? parseInt(emfIdFromStorage) : 2)

  useEffect(() => {
    // NE PAS modifier emf_id pour les admins - ils doivent garder emf_id=null
    if (user?.role !== 'admin') {
      localStorage.setItem('emf_id', emfId.toString())

      if (user && user.emf_id !== emfId) {
        const updatedUser = { ...user, emf_id: emfId }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }
    }

    searchParams.set('emf_id', emfId.toString())
    setSearchParams(searchParams)

    console.log('🏦 CofidecDashboard emf_id:', emfId, '| user.role:', user?.role)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emfId])

  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
    error: statsErrorObj,
  } = useCofidecStats(emfId)

  const {
    data: contrats = [],
    isLoading: contratsLoading,
  } = useCofidecRecentContracts(emfId, 5)

  const getStatusColor = (statut: string): string => {
    const colors: Record<string, string> = {
      actif: 'bg-green-100 text-green-800',
      en_attente: 'bg-blue-100 text-blue-800',
      suspendu: 'bg-yellow-100 text-yellow-800',
      resilie: 'bg-red-100 text-red-800',
      termine: 'bg-gray-100 text-gray-800',
      sinistre: 'bg-orange-100 text-orange-800',
    }
    return colors[statut?.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  if (statsLoading || contratsLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <LoadingSpinner size="lg" text={`Chargement du dashboard COFIDEC... (EMF #${emfId})`} />
      </div>
    )
  }

  if (statsError) {
    return (
      <div className="p-6 text-center text-red-600 bg-red-50 rounded-lg mx-6 mt-6">
        <h2 className="text-lg font-semibold">Erreur de chargement</h2>
        <p>Impossible de charger les statistiques COFIDEC (EMF #{emfId}).</p>
        <p className="text-sm mt-1 text-red-400">
          {(statsErrorObj as Error)?.message || 'Erreur inconnue'}
        </p>
        <div className="mt-4 space-y-2 text-xs text-red-500 bg-red-100 p-3 rounded">
          <p>🔍 Debug: emf_id={emfId} | localStorage: {localStorage.getItem('emf_id')}</p>
        </div>
        <Button onClick={() => window.location.reload()} className="mt-4 bg-yellow-600 hover:bg-yellow-700">
          Réessayer
        </Button>
      </div>
    )
  }

  const totalContrats = stats?.total ?? 0
  const contratsActifs = stats?.actifs ?? 0
  const pourcentageActifs =
    totalContrats > 0 ? ((contratsActifs / totalContrats) * 100).toFixed(1) : '0.0'

  return (
    <div className="space-y-6 p-6 min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-yellow-600 mb-2 flex items-center gap-2">
              🏦 Dashboard COFIDEC EMF #{emfId}
            </h1>
            <p className="text-gray-600">
              Bonjour {user?.name} - Gestion des contrats micro-assurance COFIDEC
            </p>
            <p className="text-xs text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full mt-1 inline-block">
              EMF ID: {emfId} | {totalContrats} contrats
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/sinistres/nouveau/cofidec')}
              variant="outline"
              className="border-orange-500 text-orange-600 hover:bg-orange-50"
            >
              <AlertCircle className="h-5 w-5 mr-2" />
              Déclarer Sinistre
            </Button>
            <Button
              onClick={() => navigate('/contrats/nouveau/cofidec')}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nouveau Contrat
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid - Ligne 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-yellow-500 hover:shadow-lg transition-shadow bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Contrats</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalContrats}</p>
                <p className="text-xs text-gray-500 mt-1">Tous statuts confondus</p>
              </div>
              <div className="h-14 w-14 bg-yellow-100 rounded-xl flex items-center justify-center">
                <FileText className="h-7 w-7 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-500 hover:shadow-lg transition-shadow bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Contrats Actifs</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{contratsActifs}</p>
                <p className="text-xs text-gray-500 mt-1">{pourcentageActifs}% du total</p>
              </div>
              <div className="h-14 w-14 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-7 w-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-500 hover:shadow-lg transition-shadow bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Montant Assuré</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCompact(stats?.montant_total_assure ?? 0)} FCFA
                </p>
                <p className="text-xs text-gray-500 mt-1">Capital total</p>
              </div>
              <div className="h-14 w-14 bg-purple-100 rounded-xl flex items-center justify-center">
                <Wallet className="h-7 w-7 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-orange-500 hover:shadow-lg transition-shadow bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Attente</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{stats?.en_attente ?? 0}</p>
                <p className="text-xs text-gray-500 mt-1">À valider</p>
              </div>
              <div className="h-14 w-14 bg-orange-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="h-7 w-7 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid - Ligne 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cotisations</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCompact(stats?.cotisation_totale ?? 0)} FCFA
                </p>
              </div>
              <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Résiliés</p>
                <p className="text-2xl font-bold text-red-600 mt-2">{stats?.resilie ?? 0}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Perte Emploi</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  {stats?.avec_perte_emploi ?? 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expire (30j)</p>
                <p className="text-2xl font-bold text-yellow-600 mt-2">
                  {stats?.expire_30_jours ?? 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <PauseCircle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Répartition par catégorie */}
      {stats && (
        <Card className="shadow-xl bg-white">
          <CardHeader className="border-b">
            <CardTitle className="text-xl">Répartition par Catégorie (EMF #{emfId})</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.par_categorie?.commercants ?? 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">Commerçants</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {stats.par_categorie?.salaries_public ?? 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">Sal. Public</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {stats.par_categorie?.salaries_prive ?? 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">Sal. Privé</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">
                  {stats.par_categorie?.retraites ?? 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">Retraités</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-600">
                  {stats.par_categorie?.autre ?? 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">Autres</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions rapides */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          className="cursor-pointer hover:shadow-xl transition-all border-2 border-transparent hover:border-yellow-500 hover:-translate-y-1 bg-white"
          onClick={() => navigate('/contrats/nouveau/cofidec')}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                <Plus className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">Nouveau Contrat</h3>
                <p className="text-sm text-gray-600">Créer un contrat COFIDEC</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-xl transition-all border-2 border-transparent hover:border-yellow-500 hover:-translate-y-1 bg-white"
          onClick={() => navigate('/contrats/cofidec')}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">Mes Contrats</h3>
                <p className="text-sm text-gray-600">{totalContrats} contrats</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-xl transition-all border-2 border-transparent hover:border-yellow-500 hover:-translate-y-1 bg-white"
          onClick={() => navigate('/sinistres/nouveau/cofidec')}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <AlertCircle className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">Déclarer Sinistre</h3>
                <p className="text-sm text-gray-600">Nouvelle déclaration COFIDEC</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contrats récents */}
      <Card className="shadow-xl bg-white">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Contrats Récents (EMF #{emfId})</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Les derniers contrats créés</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/contrats/cofidec')}
              className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
            >
              Voir tout
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {contrats.length > 0 ? (
            <div className="space-y-4">
              {contrats.map((contrat: CofidecContrat, index: number) => (
                <div
                  key={`cofidec-${contrat.id}-${index}`}
                  className="flex items-center justify-between p-4 border rounded-xl hover:border-yellow-500 hover:bg-yellow-50 cursor-pointer transition-all"
                  onClick={() => navigate(`/contrats/cofidec/${contrat.id}`)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900 truncate">
                          {contrat.nom_prenom}
                        </p>
                        <Badge className={getStatusColor(contrat.statut)}>
                          {contrat.statut}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        N° {contrat.numero_police || 'N/A'} | {contrat.emf?.sigle || 'COFIDEC'}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>
                          Effet: {new Date(contrat.date_effet).toLocaleDateString('fr-FR')}
                        </span>
                        <span className="font-semibold text-yellow-600">
                          {formatCurrency(contrat.montant_pret_assure)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Aucun contrat pour le moment</p>
              <p className="text-sm text-gray-500 mt-2">
                Créez votre premier contrat pour commencer
              </p>
              <Button
                onClick={() => navigate('/contrats/nouveau/cofidec')}
                className="mt-4 bg-yellow-600 hover:bg-yellow-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Créer un contrat
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
