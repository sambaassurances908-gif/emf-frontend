import { useEffect } from 'react'
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import {
    Plus,
    FileText,
    AlertCircle,
    CheckCircle,
    XCircle,
    Clock,
    TrendingUp,
    MoreHorizontal,
    CalendarClock,
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { useAgrProStats } from '@/hooks/useAgrProStats'
import { useAgrProRecentContracts } from '@/hooks/useAgrProRecentContracts'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import logoAgrPro from '@/assets/logo agrpro.jpg'
import { formatCurrency } from '@/lib/utils'
import { AgrProContrat } from '@/types/agrpro'

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

export const AgrProDashboard = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const navigate = useNavigate()
    const location = useLocation()
    const { user, setUser } = useAuthStore()

    const emfIdFromState = (location.state as { emf_id?: number })?.emf_id
    const emfIdFromStorage = localStorage.getItem('emf_id')
    const emfIdFromUser = user?.emf_id
    const emfId =
        emfIdFromState || emfIdFromUser || (emfIdFromStorage ? parseInt(emfIdFromStorage) : 8)

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
    } = useAgrProStats(emfId)

    const { data: contrats = [], isLoading: contratsLoading } = useAgrProRecentContracts(emfId, 5)

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

    if (statsLoading || contratsLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-samba-bg">
                <LoadingSpinner size="lg" text={`Chargement du dashboard AGR PRO...`} />
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
                        Impossible de charger les statistiques AGR PRO.
                    </p>
                    <p className="text-sm text-red-400 mb-6">
                        {(statsErrorObj as Error)?.message || 'Erreur inconnue'}
                    </p>
                    <Button
                        onClick={() => window.location.reload()}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl"
                    >
                        Réessayer
                    </Button>
                </div>
            </div>
        )
    }

    const totalContrats = stats?.total ?? 0
    const contratsActifs = stats?.actifs ?? 0
    const pourcentageActifs =
        totalContrats > 0 ? ((contratsActifs / totalContrats) * 100).toFixed(1) : '0'

    return (
        <div className="min-h-screen bg-samba-bg p-8">
            {/* Header */}
            <header className="flex justify-between items-center mb-10 flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <img
                        src={logoAgrPro}
                        alt="Logo AGR PRO"
                        className="h-14 w-14 rounded-2xl object-cover shadow-soft"
                    />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard AGR PRO</h1>
                        <p className="text-sm text-gray-400 mt-1">
                            Bienvenue {user?.name} - Gestion micro-assurance
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => navigate('/sinistres/nouveau/agrpro')}
                        variant="outline"
                        className="border-2 border-rose-200 text-rose-600 hover:bg-rose-50 font-bold rounded-xl px-4 py-2"
                    >
                        <AlertCircle className="h-5 w-5 mr-2" />
                        Déclarer Sinistre
                    </Button>
                    <Button
                        onClick={() => navigate('/contrats/nouveau/agrpro')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-4 py-2 shadow-lg shadow-emerald-600/20"
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

                    <div className="inline-flex items-center gap-2 bg-gray-900 text-white px-3 py-1.5 rounded-full text-xs font-medium mb-8">
                        <span className="font-bold">EMF</span>{' '}
                        <span className="text-gray-400">AGR PRO #{emfId}</span>
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
                            <span className="font-bold text-samba-blue">
                                {formatCompact(stats?.montant_total_assure ?? 0)} FCFA
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
                        title="Expire dans 30j"
                        value={stats?.expire_30_jours ?? 0}
                        subtitle="Contrats à renouveler"
                        icon={CalendarClock}
                        iconBg="bg-orange-50"
                        iconColor="text-orange-600"
                        valueColor="text-orange-600"
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

                {/* Prime TTC - Full Width */}
                <div className="col-span-12 bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <TrendingUp className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-600">Total Prime TTC</h3>
                                <p className="text-3xl font-extrabold text-gray-900">
                                    {formatCurrency(stats?.cotisation_totale ?? 0)}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-8 text-center">
                            <div>
                                <p className="text-xs text-gray-400">Capital Assuré</p>
                                <p className="text-lg font-bold text-samba-blue">
                                    {formatCurrency(stats?.montant_total_assure ?? 0)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Prêt Moyen</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {formatCurrency(stats?.montant_moyen_pret ?? 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Répartition par ville */}
                <div className="col-span-12 bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-700">Répartition par Ville</h3>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                                {Object.keys(stats?.par_ville || {}).length} villes
                            </span>
                            <MoreHorizontal size={20} className="text-gray-300" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {Object.entries(stats?.par_ville || {}).length > 0 ? (
                            Object.entries(stats?.par_ville || {})
                                .sort(([, a], [, b]) => (b as number) - (a as number))
                                .slice(0, 6)
                                .map(([ville, count], i) => {
                                    const colors = [
                                        'bg-emerald-50 text-emerald-600',
                                        'bg-blue-50 text-blue-600',
                                        'bg-purple-50 text-purple-600',
                                        'bg-amber-50 text-amber-600',
                                        'bg-rose-50 text-rose-600',
                                        'bg-gray-100 text-gray-600',
                                    ];
                                    return (
                                        <div key={ville} className={`text-center p-4 rounded-2xl ${colors[i % colors.length].split(' ')[0]}`}>
                                            <p className={`text-2xl font-bold ${colors[i % colors.length].split(' ')[1]}`}>{count as number}</p>
                                            <p className="text-sm text-gray-600 mt-1 truncate" title={ville}>{ville}</p>
                                        </div>
                                    );
                                })
                        ) : (
                            <div className="col-span-full text-center py-8 text-gray-400">
                                <p>Aucune donnée de ville disponible</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions rapides */}
                <div className="col-span-12 lg:col-span-4">
                    <ActionCard
                        title="Nouveau Contrat"
                        subtitle="Créer un contrat AGR PRO"
                        icon={Plus}
                        gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
                        onClick={() => navigate('/contrats/nouveau/agrpro')}
                    />
                </div>
                <div className="col-span-12 lg:col-span-4">
                    <ActionCard
                        title="Mes Contrats"
                        subtitle={`${totalContrats} contrats`}
                        icon={FileText}
                        gradient="bg-gradient-to-br from-emerald-500 to-emerald-400"
                        onClick={() => navigate('/contrats/agrpro')}
                    />
                </div>
                <div className="col-span-12 lg:col-span-4">
                    <ActionCard
                        title="Déclarer Sinistre"
                        subtitle="Nouvelle déclaration"
                        icon={AlertCircle}
                        gradient="bg-gradient-to-br from-rose-500 to-rose-600"
                        onClick={() => navigate('/sinistres/nouveau/agrpro')}
                    />
                </div>

                {/* Contrats récents */}
                <div className="col-span-12 bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-700">Contrats Récents</h3>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/contrats/agrpro')}
                                className="flex items-center gap-1 text-xs font-bold text-samba-blue bg-samba-blue/10 px-3 py-1.5 rounded-lg hover:bg-samba-blue/20"
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
                                        <th className="font-medium py-3 text-center">Statut</th>
                                        <th className="font-medium py-3 text-center">Montant Prêt</th>
                                        <th className="font-medium py-3 text-center">Durée</th>
                                        <th className="font-medium py-3 text-center">Prime Totale</th>
                                        <th className="font-medium py-3 text-center">N° Police</th>
                                        <th className="font-medium py-3 text-center">Date Effet</th>
                                        <th className="font-medium py-3 text-right pr-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm font-medium text-gray-700">
                                    {contrats.map((contrat: AgrProContrat) => (
                                        <tr
                                            key={contrat.id}
                                            className="hover:bg-gray-50 transition-colors cursor-pointer group"
                                            onClick={() => navigate(`/contrats/agrpro/${contrat.id}`)}
                                        >
                                            <td className="py-4 border-b border-gray-50">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                                        <span className="text-emerald-600 font-bold text-sm">
                                                            {(contrat.nom || contrat.nom_prenom || '?').charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-gray-900 block">
                                                            {contrat.nom_prenom || `${contrat.nom || ''} ${contrat.prenom || ''}`}
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                            {contrat.ville || 'Ville non renseignée'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 text-center border-b border-gray-50">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                                                        contrat.statut
                                                    )}`}
                                                >
                                                    {contrat.statut === 'en_attente' ? 'En attente' : contrat.statut}
                                                </span>
                                            </td>
                                            <td className="py-4 text-center font-bold text-gray-900 border-b border-gray-50">
                                                {formatCurrency(contrat.montant_pret_assure || 0)}
                                            </td>
                                            <td className="py-4 text-center text-gray-600 border-b border-gray-50">
                                                <span className="bg-gray-100 px-2 py-1 rounded-lg text-xs font-bold">
                                                    {contrat.duree_pret || 0} mois
                                                </span>
                                            </td>
                                            <td className="py-4 text-center font-bold text-emerald-600 border-b border-gray-50">
                                                {formatCurrency(contrat.prime_totale || 0)}
                                            </td>
                                            <td className="py-4 text-center text-gray-500 border-b border-gray-50">
                                                <span className="font-mono text-xs bg-gray-50 px-2 py-1 rounded">
                                                    {contrat.numero_police || 'En attente'}
                                                </span>
                                            </td>
                                            <td className="py-4 text-center text-gray-500 border-b border-gray-50">
                                                {contrat.date_effet
                                                    ? new Date(contrat.date_effet).toLocaleDateString('fr-FR')
                                                    : '-'}
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
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="h-10 w-10 text-gray-300" />
                            </div>
                            <p className="text-gray-600 font-medium">Aucun contrat pour le moment</p>
                            <p className="text-sm text-gray-400 mt-2">Créez votre premier contrat</p>
                            <Button
                                onClick={() => navigate('/contrats/nouveau/agrpro')}
                                className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
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
