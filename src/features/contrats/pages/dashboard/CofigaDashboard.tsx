import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Plus,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  MoreHorizontal,
  ChevronDown,
  ShoppingBag,
  Building2,
  Briefcase,
  Users,
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { useCofigaStats } from '@/hooks/useCofigaContracts'
import { useCofigaContracts } from '@/hooks/useCofigaContracts'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatCurrency } from '@/lib/utils'
import { CofigaContrat, COFIGA_CONSTANTS } from '@/types/cofiga'

// Fonction pour formater les montants en format compact (1K, 1M, 1Md)
const formatCompact = (value: number): string => {
  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(1).replace('.0', '') + 'Md'
  }
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1).replace('.0', '') + 'M'
  }
  if (value >= 1_000) {
    return (value / 1_000).toFixed(1).replace('.0', '') + 'K'
  }
  return value.toString()
}

// Composant StatCard moderne
const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg,
  iconColor,
  valueColor = 'text-gray-900',
  trend,
  trendPositive,
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
  valueColor?: string
  trend?: string
  trendPositive?: boolean
}) => (
  <div className="bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50 hover:shadow-card-hover transition-all duration-300">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-sm font-bold text-gray-600">{title}</h3>
      <MoreHorizontal size={20} className="text-gray-300 cursor-pointer hover:text-gray-500" />
    </div>
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-3">
          <span className={`text-2xl font-extrabold ${valueColor}`}>{value}</span>
          {trend && (
            <span
              className={`text-xs font-bold px-2 py-1 rounded-full ${trendPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                }`}
            >
              {trendPositive ? '+' : '-'}
              {trend}%
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`h-14 w-14 ${iconBg} rounded-2xl flex items-center justify-center`}>
        <Icon className={`h-7 w-7 ${iconColor}`} />
      </div>
    </div>
  </div>
)

// Composant ActionCard moderne
const ActionCard = ({
  title,
  subtitle,
  icon: Icon,
  gradient,
  onClick,
}: {
  title: string
  subtitle: string
  icon: React.ElementType
  gradient: string
  onClick: () => void
}) => (
  <div
    className="bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50 cursor-pointer hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
    onClick={onClick}
  >
    <div className="flex items-center gap-4">
      <div
        className={`h-14 w-14 ${gradient} rounded-2xl flex items-center justify-center shadow-lg`}
      >
        <Icon className="h-7 w-7 text-white" />
      </div>
      <div>
        <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </div>
  </div>
)

export const CofigaDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, setUser } = useAuthStore()

  // COFIGA a l'emf_id = 7
  const emfId = 7

  useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emfId])

  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
    error: statsErrorObj,
  } = useCofigaStats()

  const { data: contratsData, isLoading: contratsLoading } = useCofigaContracts()
  const contrats = contratsData?.data?.slice(0, 5) || []

  const getStatusColor = (statut: string): string => {
    const colors: Record<string, string> = {
      actif: 'bg-green-50 text-green-600',
      en_attente: 'bg-amber-50 text-amber-600',
      'en attente': 'bg-amber-50 text-amber-600',
      suspendu: 'bg-yellow-50 text-yellow-600',
      resilie: 'bg-red-50 text-red-500',
      résilié: 'bg-red-50 text-red-500',
      termine: 'bg-gray-100 text-gray-600',
      terminé: 'bg-gray-100 text-gray-600',
      sinistre: 'bg-purple-50 text-purple-600',
    }
    const key = (statut || '').toLowerCase()
    return colors[key] || 'bg-gray-100 text-gray-600'
  }

  const getCategorieLabel = (categorie?: string) => {
    const labels: Record<string, string> = {
      'Commerçants': 'Commerçants',
      'Salariés du public': 'Sal. Public',
      'Salariés du privé': 'Sal. Privé',
      'Autre': 'Autre',
    }
    return labels[categorie || ''] || categorie || 'N/A'
  }

  if (statsLoading || contratsLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-samba-bg">
        <LoadingSpinner size="lg" text={`Chargement du dashboard COFIGA...`} />
      </div>
    )
  }

  if (statsError) {
    return (
      <div className="p-8 bg-samba-bg min-h-screen">
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-soft border border-red-100 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-500 mb-4">
            Impossible de charger les statistiques COFIGA.
          </p>
          <p className="text-sm text-red-400 mb-6">
            {(statsErrorObj as Error)?.message || 'Erreur inconnue'}
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-6 rounded-xl"
          >
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  const totalContrats = stats?.total_contrats ?? 0
  const contratsActifs = stats?.contrats_actifs ?? 0
  const pourcentageActifs =
    totalContrats > 0 ? ((contratsActifs / totalContrats) * 100).toFixed(1) : '0'

  return (
    <div className="min-h-screen bg-samba-bg p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-10 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">CO</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard COFIGA</h1>
            <p className="text-sm text-gray-400 mt-1">
              Bienvenue {user?.name} - Coopérative Financière du Gabon
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate('/sinistres/nouveau/cofiga')}
            variant="outline"
            className="border-2 border-rose-200 text-rose-600 hover:bg-rose-50 font-bold rounded-xl px-4 py-2"
          >
            <AlertCircle className="h-5 w-5 mr-2" />
            Déclarer Sinistre
          </Button>
          <Button
            onClick={() => navigate('/contrats/nouveau/cofiga')}
            className="bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl px-4 py-2 shadow-lg shadow-violet-600/20"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouveau Contrat
          </Button>
        </div>
      </header>

      {/* Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Balance Card */}
        <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50">
          <div className="flex justify-between items-start mb-6">
            <span className="font-bold text-gray-700">Résumé</span>
            <MoreHorizontal size={20} className="text-gray-300" />
          </div>

          <div className="text-4xl font-extrabold text-gray-900 mb-2">{totalContrats}</div>
          <p className="text-sm text-gray-500 mb-6">Contrats au total</p>

          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-violet-700 text-white px-3 py-1.5 rounded-full text-xs font-medium mb-8">
            <span className="font-bold">EMF</span>{' '}
            <span className="text-violet-200">COFIGA #{emfId}</span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Contrats actifs:</span>
              <span className="font-bold text-green-600">{contratsActifs}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Pourcentage actifs:</span>
              <span className="font-bold text-gray-900">{pourcentageActifs}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Capital assuré:</span>
              <span className="font-bold text-violet-600">
                {formatCompact(stats?.total_montants_assures ?? 0)} FCFA
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-2 gap-6">
          <StatCard
            title="Contrats Actifs"
            value={contratsActifs}
            subtitle={`${pourcentageActifs}% du total`}
            icon={CheckCircle}
            iconBg="bg-green-50"
            iconColor="text-green-600"
            valueColor="text-green-600"
            trend={pourcentageActifs}
            trendPositive={true}
          />
          <StatCard
            title="En Attente"
            value={stats?.en_attente ?? 0}
            subtitle="À valider"
            icon={Clock}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            valueColor="text-amber-600"
          />
          <StatCard
            title="Cotisations TTC"
            value={`${formatCompact(stats?.total_cotisations ?? 0)} FCFA`}
            subtitle="Total des cotisations"
            icon={TrendingUp}
            iconBg="bg-violet-50"
            iconColor="text-violet-600"
          />
          <StatCard
            title="Résiliés"
            value={stats?.resilie ?? 0}
            subtitle="Contrats terminés"
            icon={XCircle}
            iconBg="bg-red-50"
            iconColor="text-red-500"
            valueColor="text-red-500"
          />
        </div>

        {/* Répartition par catégorie */}
        <div className="col-span-12 bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-700">Répartition par Catégorie COFIGA</h3>
            <div className="flex items-center gap-3">
              <button type="button" className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg hover:bg-gray-100">
                Tous <ChevronDown size={14} />
              </button>
              <MoreHorizontal size={20} className="text-gray-300" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: 'Commerçants',
                value: stats?.par_categorie?.commercants ?? 0,
                color: 'bg-violet-50 text-violet-600',
                icon: ShoppingBag,
              },
              {
                label: 'Salariés Public',
                value: stats?.par_categorie?.salaries_public ?? 0,
                color: 'bg-blue-50 text-blue-600',
                icon: Building2,
              },
              {
                label: 'Salariés Privé',
                value: stats?.par_categorie?.salaries_prive ?? 0,
                color: 'bg-emerald-50 text-emerald-600',
                icon: Briefcase,
              },
              {
                label: 'Autre',
                value: stats?.par_categorie?.autre ?? 0,
                color: 'bg-gray-100 text-gray-600',
                icon: Users,
              },
            ].map((cat, i) => (
              <div key={i} className={`p-5 rounded-2xl ${cat.color.split(' ')[0]} border border-gray-100 text-center`}>
                <div className="flex justify-center mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center`}>
                    <cat.icon className={`h-5 w-5 ${cat.color.split(' ')[1]}`} />
                  </div>
                </div>
                <p className={`text-2xl font-bold ${cat.color.split(' ')[1]}`}>{cat.value}</p>
                <p className="text-sm text-gray-600 mt-1">{cat.label}</p>
              </div>
            ))}
          </div>

          {/* Tarification COFIGA */}
          <div className="mt-6 p-4 bg-violet-50 rounded-2xl">
            <h4 className="font-bold text-violet-700 mb-3">Tarification Unique COFIGA</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500">Taux garantie</p>
                <p className="font-bold text-violet-700">{COFIGA_CONSTANTS.TAUX_GARANTIE}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Prime fixe</p>
                <p className="font-bold text-violet-700">{formatCurrency(COFIGA_CONSTANTS.PRIME_UNIQUE)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Protection décès</p>
                <p className="font-bold text-violet-700">{formatCurrency(COFIGA_CONSTANTS.PROTECTION_FORFAITAIRE)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Max couvert</p>
                <p className="font-bold text-violet-700">{formatCompact(COFIGA_CONSTANTS.MONTANT_MAX_PRET)} / {COFIGA_CONSTANTS.DUREE_MAX_PRET} mois</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="col-span-12 lg:col-span-4">
          <ActionCard
            title="Nouveau Contrat"
            subtitle="Créer un contrat COFIGA"
            icon={Plus}
            gradient="bg-gradient-to-br from-violet-600 to-violet-700"
            onClick={() => navigate('/contrats/nouveau/cofiga')}
          />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <ActionCard
            title="Mes Contrats"
            subtitle={`${totalContrats} contrats`}
            icon={FileText}
            gradient="bg-gradient-to-br from-violet-500 to-violet-600"
            onClick={() => navigate('/contrats/cofiga')}
          />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <ActionCard
            title="Déclarer Sinistre"
            subtitle="Nouvelle déclaration"
            icon={AlertCircle}
            gradient="bg-gradient-to-br from-rose-500 to-rose-600"
            onClick={() => navigate('/sinistres/nouveau/cofiga')}
          />
        </div>

        {/* Contrats récents */}
        <div className="col-span-12 bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-700">Contrats Récents COFIGA</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/contrats/cofiga')}
                className="flex items-center gap-1 text-xs font-bold text-violet-600 bg-violet-50 px-3 py-1.5 rounded-lg hover:bg-violet-100"
              >
                Voir tout
              </button>
              <MoreHorizontal size={20} className="text-gray-300" />
            </div>
          </div>

          {contrats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-100">
                    <th className="font-medium py-3">Assuré</th>
                    <th className="font-medium py-3 text-center">Catégorie</th>
                    <th className="font-medium py-3 text-center">Statut</th>
                    <th className="font-medium py-3 text-center">Montant</th>
                    <th className="font-medium py-3 text-center">Cotisation</th>
                    <th className="font-medium py-3 text-center">Date Effet</th>
                    <th className="font-medium py-3 text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium text-gray-700">
                  {contrats.map((contrat: CofigaContrat) => (
                    <tr
                      key={contrat.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/contrats/cofiga/${contrat.id}`)}
                    >
                      <td className="py-4 border-b border-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center">
                            <span className="text-violet-600 font-bold text-sm">
                              {contrat.nom?.charAt(0) || 'A'}
                            </span>
                          </div>
                          <span className="font-bold text-gray-900">{contrat.nom} {contrat.prenom}</span>
                        </div>
                      </td>
                      <td className="py-4 text-center border-b border-gray-50">
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-violet-50 text-violet-600">
                          {getCategorieLabel(contrat.categorie)}
                        </span>
                      </td>
                      <td className="py-4 text-center border-b border-gray-50">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                            contrat.statut
                          )}`}
                        >
                          {contrat.statut}
                        </span>
                      </td>
                      <td className="py-4 text-center font-bold text-gray-900 border-b border-gray-50">
                        {formatCurrency(contrat.montant_pret_assure)}
                      </td>
                      <td className="py-4 text-center font-bold text-violet-600 border-b border-gray-50">
                        {formatCurrency(contrat.cotisation_totale || 0)}
                      </td>
                      <td className="py-4 text-center text-gray-500 border-b border-gray-50">
                        {new Date(contrat.date_effet).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-4 text-right pr-4 border-b border-gray-50">
                        <MoreHorizontal
                          size={18}
                          className="inline text-gray-300 cursor-pointer hover:text-gray-600"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-10 w-10 text-violet-300" />
              </div>
              <p className="text-gray-600 font-medium">Aucun contrat pour le moment</p>
              <p className="text-sm text-gray-400 mt-2">Créez votre premier contrat COFIGA</p>
              <Button
                onClick={() => navigate('/contrats/nouveau/cofiga')}
                className="mt-4 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl"
              >
                <Plus className="h-5 w-5 mr-2" />
                Créer un contrat
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CofigaDashboard
