import { useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { 
  Plus, 
  FileText, 
  AlertCircle, 
  Wallet,
  CheckCircle,
  Users,
  Shield
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore } from '@/store/authStore'
import { useSodecStats } from '@/hooks/useSodecStats'
import { useSodecRecentContracts } from '@/hooks/useSodecRecentContracts'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatCurrency } from '@/lib/utils'
import { SodecContrat } from '@/types/sodec'

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

export const SodecDashboard = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, setUser } = useAuthStore()

  // Récupérer emf_id depuis state (LoginPage) ou localStorage ou user ou défaut à 5 (SODEC)
  const emfIdFromState = (location.state as { emf_id?: number })?.emf_id
  const emfIdFromStorage = localStorage.getItem('emf_id')
  const emfIdFromUser = user?.emf_id
  const emfId = emfIdFromState || emfIdFromUser || (emfIdFromStorage ? parseInt(emfIdFromStorage) : 5)

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

    console.log('🌸 SodecDashboard emf_id:', emfId, '| user.role:', user?.role)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emfId])

  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
    error: statsErrorObj,
  } = useSodecStats(emfId)

  const {
    data: contrats = [],
    isLoading: contratsLoading,
  } = useSodecRecentContracts(emfId, 5)

  const getStatusColor = (statut: string): string => {
    const colors: Record<string, string> = {
      actif: 'bg-green-100 text-green-800',
      en_attente: 'bg-yellow-100 text-yellow-800',
      suspendu: 'bg-orange-100 text-orange-800',
      resilie: 'bg-red-100 text-red-800',
      termine: 'bg-gray-100 text-gray-800',
      sinistre: 'bg-purple-100 text-purple-800',
    }
    return colors[statut?.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getOptionBadge = (option: string): string => {
    return option === 'option_a' 
      ? 'bg-blue-100 text-blue-800 border-blue-200' 
      : 'bg-indigo-100 text-indigo-800 border-indigo-200'
  }

  const getOptionLabel = (option: string): string => {
    return option === 'option_a' 
      ? 'Protection Prévoyance1 Décès - IAD2' 
      : 'Protection Prévoyance Décès - IAD'
  }

  if (statsLoading || contratsLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <LoadingSpinner size="lg" text={`Chargement du dashboard SODEC... (EMF #${emfId})`} />
      </div>
    )
  }

  if (statsError) {
    return (
      <div className="p-6 text-center text-red-600 bg-red-50 rounded-lg mx-6 mt-6">
        <h2 className="text-lg font-semibold">Erreur de chargement</h2>
        <p>Impossible de charger les statistiques SODEC (EMF #{emfId}).</p>
        <p className="text-sm mt-1 text-red-400">
          {(statsErrorObj as Error)?.message || 'Erreur inconnue'}
        </p>
        <div className="mt-4 space-y-2 text-xs text-red-500 bg-red-100 p-3 rounded">
          <p>🔍 Debug: emf_id={emfId} | localStorage: {localStorage.getItem('emf_id')}</p>
        </div>
        <Button onClick={() => window.location.reload()} className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
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
    <div className="space-y-6 p-6 min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 flex items-center gap-2">
              🌸 Dashboard SODEC EMF #{emfId}
            </h1>
            <p className="text-gray-600">
              Bonjour {user?.name} - Gestion des contrats micro-assurance SODEC
            </p>
            <p className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full mt-1 inline-block border border-indigo-200">
              EMF ID: {emfId} | {totalContrats} contrats
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/sinistres/nouveau?sodec=1&emf_id=' + emfId)}
              variant="outline"
              className="border-orange-500 text-orange-600 hover:bg-orange-50"
            >
              <AlertCircle className="h-5 w-5 mr-2" />
              Déclarer Sinistre
            </Button>
            <Button
              onClick={() => navigate('/contrats/nouveau/sodec')}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nouveau Contrat
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid - Ligne 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-indigo-500 hover:shadow-lg transition-shadow bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Contrats</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalContrats}</p>
                <p className="text-xs text-gray-500 mt-1">+{stats?.nouveaux_mois ?? 0} ce mois</p>
              </div>
              <div className="h-14 w-14 bg-indigo-100 rounded-xl flex items-center justify-center">
                <FileText className="h-7 w-7 text-indigo-600" />
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
                <p className="text-sm font-medium text-gray-600">Capital Total Assuré</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCompact(stats?.montant_total_assure ?? 0)} FCFA
                </p>
                <p className="text-xs text-gray-500 mt-1">Somme des prêts</p>
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

      {/* Stats Grid - Ligne 2 SODEC spécifiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Option A</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">{stats?.option_a ?? 0}</p>
                <p className="text-xs text-gray-500 mt-1">Protection Prévoyance1 Décès - IAD2</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Option B</p>
                <p className="text-2xl font-bold text-indigo-600 mt-2">{stats?.option_b ?? 0}</p>
                <p className="text-xs text-gray-500 mt-1">Protection Prévoyance Décès - IAD</p>
              </div>
              <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Retraités</p>
                <p className="text-2xl font-bold text-purple-600 mt-2">{stats?.retraites ?? 0}</p>
                <p className="text-xs text-gray-500 mt-1">Catégorie spéciale</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Assurés Associés</p>
                <p className="text-2xl font-bold text-pink-600 mt-2">
                  {stats?.assures_associes?.total || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.assures_associes?.adultes || 0} adultes + {stats?.assures_associes?.enfants || 0} enfants
                </p>
              </div>
              <div className="h-12 w-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-pink-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Répartition par catégorie */}
      {stats && (
        <Card className="shadow-xl bg-white">
          <CardHeader className="border-b">
            <CardTitle className="text-xl">Répartition par Catégorie Socioprofessionnelle (EMF #{emfId})</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                <p className="text-2xl font-bold text-indigo-600">
                  {stats.par_categorie?.commercants ?? 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">🛒 Commerçants</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                <p className="text-2xl font-bold text-green-600">
                  {stats.par_categorie?.salaries_public ?? 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">🏛️ Salariés Public</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
                <p className="text-2xl font-bold text-purple-600">
                  {stats.par_categorie?.salaries_prive ?? 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">💼 Salariés Privé</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-100">
                <p className="text-2xl font-bold text-orange-600">
                  {stats.par_categorie?.retraites ?? 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">👴 Retraités</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-2xl font-bold text-gray-600">
                  {stats.par_categorie?.autre ?? 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">➕ Autres</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions rapides */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          className="cursor-pointer hover:shadow-xl transition-all border-2 border-transparent hover:border-indigo-500 hover:-translate-y-1 bg-white"
          onClick={() => navigate('/contrats/nouveau/sodec')}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Plus className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">Nouveau Contrat</h3>
                <p className="text-sm text-gray-600">Prévoyance1 ou Prévoyance + Associés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-xl transition-all border-2 border-transparent hover:border-indigo-500 hover:-translate-y-1 bg-white"
          onClick={() => navigate('/contrats/sodec')}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">Mes Contrats</h3>
                <p className="text-sm text-gray-600">{totalContrats} contrats SODEC</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-xl transition-all border-2 border-transparent hover:border-indigo-500 hover:-translate-y-1 bg-white"
          onClick={() => navigate('/comparateur/sodec')}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">Comparer Protections</h3>
                <p className="text-sm text-gray-600">Prévoyance1 vs Prévoyance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contrats récents */}
      <Card className="shadow-xl bg-white">
        <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                📋 Contrats Récents SODEC (EMF #{emfId})
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">Les 5 derniers contrats créés</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/contrats/sodec')}
              className="border-indigo-500 text-indigo-600 hover:bg-indigo-50"
            >
              Voir tout
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {contrats.length > 0 ? (
            <div className="space-y-4">
              {contrats.map((contrat: SodecContrat) => (
                <div
                  key={contrat.id}
                  className="flex items-center justify-between p-4 border rounded-xl hover:border-indigo-500 hover:bg-indigo-50 cursor-pointer transition-all"
                  onClick={() => navigate(`/contrats/sodec/${contrat.id}`)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-12 w-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <p className="font-semibold text-gray-900 truncate">
                          {contrat.nom_prenom}
                        </p>
                        <Badge className={getStatusColor(contrat.statut)}>
                          {contrat.statut}
                        </Badge>
                        <Badge className={getOptionBadge(contrat.option_prevoyance)}>
                          {getOptionLabel(contrat.option_prevoyance)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        N° {contrat.numero_police || 'N/A'}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 flex-wrap">
                        <span>
                          📅 Effet: {new Date(contrat.date_effet).toLocaleDateString('fr-FR')}
                        </span>
                        <span className="font-semibold text-indigo-600">
                          💰 {formatCurrency(contrat.montant_pret_assure)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {contrat.nombre_assures_associes || 0} associé(s)
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
                onClick={() => navigate('/contrats/nouveau/sodec')}
                className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
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
