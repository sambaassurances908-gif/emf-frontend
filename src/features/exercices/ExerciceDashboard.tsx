import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { exerciceService } from '@/services/exercice.service';
import { ExerciceDashboardStats, Exercice, ExerciceComparaison, RapportExercice } from '@/types/exercice.types';
import {
    Calendar,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    ArrowRight,
    ArrowUpRight,
    ArrowDownRight,
    RefreshCw,
    Eye,
    Target,
    Activity,
    Wallet,
    Shield,
    Plus,
    MoreHorizontal,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart as RechartsPieChart,
    Pie,
    Cell
} from 'recharts';

// Palette de couleurs premium
const COLORS = {
    primary: '#10B981',
    secondary: '#3B82F6',
    warning: '#F59E0B',
    danger: '#EF4444',
    purple: '#8B5CF6',
    pink: '#EC4899',
    cyan: '#06B6D4',
};

const CHART_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];

// Fonction utilitaire pour formater la devise
const formatCurrency = (value: number) => {
    if (value == null || isNaN(value)) return '-';
    if (value >= 1000000000) {
        return `${(value / 1000000000).toFixed(1)} Mrd`;
    }
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)} M`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(0)} K`;
    }
    return new Intl.NumberFormat('fr-FR').format(value);
};

const formatCurrencyFull = (value: number) => {
    if (value == null || isNaN(value)) return '-';
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XAF',
        maximumFractionDigits: 0
    }).format(value);
};

// Composant StatCard Premium
interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ElementType;
    trend?: number;
    trendLabel?: string;
    color?: string;
    onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    trendLabel,
    color = COLORS.primary,
    onClick
}) => {
    return (
        <div
            className={`bg-white rounded-2xl p-6 shadow-soft border border-gray-100/50 transition-all duration-300 ${onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1' : ''}`}
            onClick={onClick}
        >
            <div className="flex items-start justify-between mb-4">
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${color}15` }}
                >
                    <Icon className="h-6 w-6" style={{ color }} />
                </div>
                {trend !== undefined && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                        }`}>
                        {trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {Math.abs(trend).toFixed(1)}%
                    </div>
                )}
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
            {trendLabel && <p className="text-xs text-gray-400 mt-1">{trendLabel}</p>}
        </div>
    );
};

// Composant Tooltip personnalisé pour les graphiques
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-gray-100">
                <p className="font-semibold text-gray-900 mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-gray-600">{entry.name}:</span>
                        <span className="font-semibold text-gray-900">
                            {formatCurrencyFull(entry.value)}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export const ExerciceDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<ExerciceDashboardStats | null>(null);
    const [allExercices, setAllExercices] = useState<Exercice[]>([]);
    const [comparaison, setComparaison] = useState<ExerciceComparaison[]>([]);
    const [rapportsExercices, setRapportsExercices] = useState<Map<number, RapportExercice>>(new Map());
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const [dashboardData, listData] = await Promise.all([
                exerciceService.getDashboard(),
                exerciceService.getAll()
            ]);
            setStats(dashboardData);

            // Handle potential paginated response structure
            let exercicesList: Exercice[] = [];
            if (listData && (listData as any).data) {
                exercicesList = (listData as any).data;
            } else if (Array.isArray(listData)) {
                exercicesList = listData;
            }
            setAllExercices(exercicesList);

            // Récupérer les données de comparaison pour les 5 dernières années
            if (exercicesList.length > 0) {
                const annees = exercicesList
                    .slice(0, 5)
                    .map(e => e.annee)
                    .sort((a, b) => a - b);

                try {
                    const compData = await exerciceService.comparer(annees);
                    if (Array.isArray(compData)) {
                        setComparaison(compData);
                    }
                } catch (e) {
                    console.log('Comparaison data not available, fetching individual reports');
                }

                // Récupérer les rapports individuels de chaque exercice pour avoir les vraies données
                const rapportsMap = new Map<number, RapportExercice>();
                const exercicesToFetch = exercicesList.slice(0, 5);

                await Promise.all(
                    exercicesToFetch.map(async (exercice) => {
                        try {
                            const rapport = await exerciceService.getRapport(exercice.id);
                            if (rapport) {
                                rapportsMap.set(exercice.annee, rapport);
                            }
                        } catch (e) {
                            console.log(`Rapport non disponible pour exercice ${exercice.annee}`);
                        }
                    })
                );
                setRapportsExercices(rapportsMap);
            }

        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchData();
    };

    // Calculs dérivés
    const exerciceCourant = stats?.exercice_courant;
    const statsGlobales = stats?.stats_globales;



    const exerciceOuvert = useMemo(() => {
        return allExercices.find(e => e.statut === 'ouvert');
    }, [allExercices]);

    const exercicesClotures = useMemo(() => {
        return allExercices.filter(e => e.statut === 'cloture');
    }, [allExercices]);

    // Données pour le graphique d'évolution
    const evolutionData = useMemo(() => {
        // Si nous avons des données de comparaison de l'API, les utiliser
        if (comparaison.length > 0) {
            return comparaison
                .sort((a, b) => a.annee - b.annee)
                .map(c => ({
                    name: String(c.annee),
                    primes: c.total_primes || 0,
                    sinistres: c.total_sinistres || 0,
                    marge: c.marge || 0
                }));
        }

        // Utiliser les vrais rapports d'exercices si disponibles
        if (rapportsExercices.size > 0 && allExercices.length > 0) {
            const data = allExercices
                .slice(0, 5)
                .sort((a, b) => a.annee - b.annee)
                .map(e => {
                    const rapport = rapportsExercices.get(e.annee);
                    if (rapport) {
                        // Convertir les strings en nombres (les valeurs viennent du backend comme strings)
                        const primes = parseFloat(rapport.production?.total_primes_emises?.replace(/[^\d.-]/g, '') || '0') || 0;
                        const sinistres = parseFloat(rapport.sinistralite?.total_payes?.replace(/[^\d.-]/g, '') || '0') || 0;
                        const marge = rapport.resultat_technique?.marge || (primes - sinistres);
                        return {
                            name: String(e.annee),
                            primes,
                            sinistres,
                            marge
                        };
                    }
                    return null;
                })
                .filter((item): item is { name: string; primes: number; sinistres: number; marge: number } => item !== null);

            if (data.length > 0) {
                return data;
            }
        }

        // Fallback: utiliser les stats globales si rien d'autre n'est disponible
        if (allExercices.length > 0 && statsGlobales) {
            return allExercices
                .slice(0, 5)
                .sort((a, b) => a.annee - b.annee)
                .map((e) => ({
                    name: String(e.annee),
                    primes: statsGlobales.total_primes || 0,
                    sinistres: statsGlobales.total_sinistres || 0,
                    marge: statsGlobales.marge || 0
                }));
        }

        // Données par défaut si rien n'est disponible
        return [];
    }, [comparaison, allExercices, statsGlobales, rapportsExercices]);

    // Données pour le graphique circulaire
    const pieData = useMemo(() => {
        if (!statsGlobales) return [];
        return [
            { name: 'Primes', value: statsGlobales.total_primes, color: COLORS.primary },
            { name: 'Sinistres', value: statsGlobales.total_sinistres, color: COLORS.danger },
            { name: 'Marge', value: Math.max(0, statsGlobales.marge), color: COLORS.secondary },
        ].filter(item => item.value > 0);
    }, [statsGlobales]);

    // Utiliser en priorité exerciceOuvert de la liste (qui a les dates)
    // sinon fallback sur exercice_courant de l'API
    const exerciceActif = useMemo(() => {
        // Priorité à exerciceOuvert car il provient de la liste complète avec toutes les données
        if (exerciceOuvert && exerciceOuvert.date_debut && exerciceOuvert.date_fin) {
            return exerciceOuvert;
        }
        // Fallback sur exerciceCourant de l'API si il a les dates
        if (exerciceCourant && exerciceCourant.date_debut && exerciceCourant.date_fin) {
            return exerciceCourant;
        }
        // Sinon retourner exerciceOuvert même sans dates
        return exerciceOuvert || exerciceCourant;
    }, [exerciceOuvert, exerciceCourant]);

    // Fonction helper pour calculer les jours restants
    const calculerJoursRestants = (dateFin: string | undefined): number => {
        if (!dateFin) return 0;
        try {
            const fin = new Date(dateFin);
            if (isNaN(fin.getTime())) return 0;
            const now = new Date();
            const diff = fin.getTime() - now.getTime();
            const jours = Math.ceil(diff / (1000 * 60 * 60 * 24));
            return isNaN(jours) ? 0 : Math.max(0, jours);
        } catch {
            return 0;
        }
    };

    // Fonction helper pour calculer la progression
    const calculerProgression = (dateDebut: string | undefined, dateFin: string | undefined): number => {
        if (!dateDebut || !dateFin) return 0;
        try {
            const debut = new Date(dateDebut).getTime();
            const fin = new Date(dateFin).getTime();
            if (isNaN(debut) || isNaN(fin)) return 0;
            const now = new Date().getTime();
            const total = fin - debut;
            if (total <= 0) return 0;
            const elapsed = now - debut;
            const progress = (elapsed / total) * 100;
            return isNaN(progress) ? 0 : Math.min(100, Math.max(0, progress));
        } catch {
            return 0;
        }
    };

    // Jours restants dans l'exercice actif
    const joursRestants = useMemo(() => {
        return calculerJoursRestants(exerciceActif?.date_fin);
    }, [exerciceActif]);

    // Progression de l'exercice
    const progressionExercice = useMemo(() => {
        return calculerProgression(exerciceActif?.date_debut, exerciceActif?.date_fin);
    }, [exerciceActif]);

    if (loading) {
        return (
            <div className="flex-1 p-8 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto">
                    <div className="h-10 w-64 bg-gray-200 rounded-xl animate-pulse mb-8" />
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-40 bg-white rounded-2xl animate-pulse shadow-soft" />
                        ))}
                    </div>
                    <div className="grid gap-6 lg:grid-cols-3 mb-8">
                        <div className="lg:col-span-2 h-80 bg-white rounded-2xl animate-pulse shadow-soft" />
                        <div className="h-80 bg-white rounded-2xl animate-pulse shadow-soft" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                                <Calendar className="h-5 w-5 text-white" />
                            </div>
                            Tableau de Bord des Exercices
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Vue d'ensemble de la performance financière par exercice
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="secondary"
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="gap-2"
                        >
                            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                            Actualiser
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/exercices/nouveau')}
                            className="gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Nouvel Exercice
                        </Button>
                    </div>
                </div>

                {/* Exercice Courant Banner */}
                {exerciceActif && (
                    <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-6 text-white shadow-xl">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                    <Sparkles className="h-8 w-8" />
                                </div>
                                <div>
                                    <p className="text-emerald-100 text-sm font-medium">Exercice en cours</p>
                                    <h2 className="text-3xl font-bold">{exerciceActif.annee}</h2>
                                    <p className="text-emerald-100 text-sm">
                                        {exerciceActif.date_debut && exerciceActif.date_fin ? (
                                            <>
                                                {new Date(exerciceActif.date_debut).toLocaleDateString('fr-FR')} - {new Date(exerciceActif.date_fin).toLocaleDateString('fr-FR')}
                                            </>
                                        ) : (
                                            'Dates non définies'
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-6">
                                <div className="text-center">
                                    <p className="text-4xl font-bold">{joursRestants}</p>
                                    <p className="text-emerald-100 text-sm">jours restants</p>
                                </div>

                                <div className="hidden sm:block w-px h-12 bg-white/30" />

                                <div className="flex-1 min-w-[200px] max-w-xs">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-emerald-100">Progression</span>
                                        <span className="font-semibold">{progressionExercice.toFixed(0)}%</span>
                                    </div>
                                    <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-white rounded-full transition-all duration-500"
                                            style={{ width: `${progressionExercice}%` }}
                                        />
                                    </div>
                                </div>

                                <Button
                                    variant="secondary"
                                    onClick={() => navigate(`/exercices/${exerciceActif.id}`)}
                                    className="bg-white/20 hover:bg-white/30 border-0 text-white backdrop-blur-sm gap-2"
                                >
                                    Voir les détails
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Cards Row */}
                {statsGlobales && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Total Primes Émises"
                            value={formatCurrency(statsGlobales.total_primes)}
                            subtitle={formatCurrencyFull(statsGlobales.total_primes)}
                            icon={Wallet}
                            trend={statsGlobales.progression_annuelle}
                            trendLabel="vs année précédente"
                            color={COLORS.primary}
                        />
                        <StatCard
                            title="Sinistres Payés"
                            value={formatCurrency(statsGlobales.total_sinistres)}
                            subtitle={formatCurrencyFull(statsGlobales.total_sinistres)}
                            icon={AlertTriangle}
                            color={COLORS.warning}
                        />
                        <StatCard
                            title="Marge Technique"
                            value={formatCurrency(statsGlobales.marge)}
                            subtitle={formatCurrencyFull(statsGlobales.marge)}
                            icon={TrendingUp}
                            color={statsGlobales.marge >= 0 ? COLORS.secondary : COLORS.danger}
                        />
                        <StatCard
                            title="Ratio S/P"
                            value={`${statsGlobales.ratio_sp.toFixed(1)}%`}
                            subtitle={statsGlobales.ratio_sp <= 50 ? "Objectif atteint" : "Au-dessus de la cible"}
                            icon={Target}
                            color={statsGlobales.ratio_sp <= 50 ? COLORS.primary : COLORS.danger}
                        />
                    </div>
                )}

                {/* Graphiques Row */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Graphique d'évolution */}
                    <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-soft border border-gray-100/50">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Évolution Annuelle</h3>
                                <p className="text-sm text-gray-500">Comparaison primes vs sinistres</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                    <span className="text-xs text-gray-500">Primes</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                                    <span className="text-xs text-gray-500">Sinistres</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={evolutionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorPrimes" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorSinistres" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={COLORS.warning} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={COLORS.warning} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 12, fill: '#9CA3AF' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 12, fill: '#9CA3AF' }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(value) => formatCurrency(value)}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="primes"
                                        name="Primes"
                                        stroke={COLORS.primary}
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorPrimes)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="sinistres"
                                        name="Sinistres"
                                        stroke={COLORS.warning}
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorSinistres)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Répartition */}
                    <div className="bg-white rounded-3xl p-6 shadow-soft border border-gray-100/50">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Répartition</h3>
                            <MoreHorizontal className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsPieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-3 mt-4">
                            {pieData.map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <span className="text-sm text-gray-600">{item.name}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {formatCurrency(item.value)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Indicateurs de Performance */}
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="bg-white rounded-3xl p-6 shadow-soft border border-gray-100/50">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                <Activity className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Exercices Ouverts</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {exerciceOuvert ? 1 : 0}
                                </p>
                            </div>
                        </div>
                        {exerciceOuvert && (
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                                <span className="text-sm font-medium text-blue-700">
                                    Exercice {exerciceOuvert.annee}
                                </span>
                                <Badge variant="success">En cours</Badge>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-soft border border-gray-100/50">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                                <CheckCircle className="h-5 w-5 text-gray-500" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Exercices Clôturés</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {exercicesClotures.length}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {exercicesClotures.slice(0, 3).map(e => (
                                <span
                                    key={e.id}
                                    className="px-2 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-600"
                                >
                                    {e.annee}
                                </span>
                            ))}
                            {exercicesClotures.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-400">
                                    +{exercicesClotures.length - 3}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-soft border border-gray-100/50">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                                <Shield className="h-5 w-5 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Performance Globale</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {statsGlobales && statsGlobales.ratio_sp <= 50 ? 'Excellente' : 'À surveiller'}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Objectif S/P</span>
                                <span className="font-medium text-gray-900">&lt; 50%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Actuel</span>
                                <span className={`font-medium ${statsGlobales && statsGlobales.ratio_sp <= 50 ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {statsGlobales?.ratio_sp.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Liste des Exercices */}
                <div className="bg-white rounded-3xl p-6 shadow-soft border border-gray-100/50">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Historique des Exercices</h3>
                            <p className="text-sm text-gray-500">Tous les exercices comptables</p>
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate('/exercices')}
                            className="gap-2"
                        >
                            Voir tout
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                                    <th className="font-medium pb-4">Année</th>
                                    <th className="font-medium pb-4">Période</th>
                                    <th className="font-medium pb-4">Statut</th>
                                    <th className="font-medium pb-4 text-center">Jours restants</th>
                                    {comparaison.length > 0 && (
                                        <>
                                            <th className="font-medium pb-4 text-right">Primes</th>
                                            <th className="font-medium pb-4 text-right">Sinistres</th>
                                            <th className="font-medium pb-4 text-right">Marge</th>
                                        </>
                                    )}
                                    <th className="font-medium pb-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allExercices.length === 0 ? (
                                    <tr>
                                        <td colSpan={comparaison.length > 0 ? 8 : 5} className="py-8 text-center text-gray-400">
                                            Aucun exercice trouvé
                                        </td>
                                    </tr>
                                ) : (
                                    allExercices.slice(0, 5).map((exercice, index) => {
                                        const compData = comparaison.find(c => c.annee === exercice.annee);
                                        return (
                                            <tr
                                                key={exercice.id}
                                                className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer group"
                                                onClick={() => navigate(`/exercices/${exercice.id}`)}
                                            >
                                                <td className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                                                            style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                                                        >
                                                            {String(exercice.annee).slice(-2)}
                                                        </div>
                                                        <span className="font-bold text-gray-900">{exercice.annee}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 text-sm text-gray-600">
                                                    {exercice.date_debut && exercice.date_fin ? (
                                                        <>
                                                            {new Date(exercice.date_debut).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} - {new Date(exercice.date_fin).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-400">Non définie</span>
                                                    )}
                                                </td>
                                                <td className="py-4">
                                                    <Badge variant={exercice.statut === 'ouvert' ? 'success' : 'secondary'}>
                                                        {exercice.statut === 'ouvert' ? 'En cours' : 'Clôturé'}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 text-center">
                                                    {exercice.statut === 'ouvert' ? (
                                                        (() => {
                                                            const jours = calculerJoursRestants(exercice.date_fin);
                                                            return (
                                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${jours > 30 ? 'bg-emerald-100 text-emerald-700' :
                                                                    jours > 7 ? 'bg-amber-100 text-amber-700' :
                                                                        'bg-red-100 text-red-700'
                                                                    }`}>
                                                                    {jours} jours
                                                                </span>
                                                            );
                                                        })()
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">Terminé</span>
                                                    )}
                                                </td>
                                                {comparaison.length > 0 && (
                                                    <>
                                                        <td className="py-4 text-right font-semibold text-gray-900">
                                                            {compData && compData.total_primes != null ? formatCurrency(compData.total_primes) : '-'}
                                                        </td>
                                                        <td className="py-4 text-right font-semibold text-gray-900">
                                                            {compData && compData.total_sinistres != null ? formatCurrency(compData.total_sinistres) : '-'}
                                                        </td>
                                                        <td className="py-4 text-right">
                                                            <span className={`font-semibold ${compData && compData.marge != null && compData.marge >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                                {compData && compData.marge != null ? formatCurrency(compData.marge) : '-'}
                                                            </span>
                                                        </td>
                                                    </>
                                                )}
                                                <td className="py-4 text-right">
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity gap-1"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/exercices/${exercice.id}`);
                                                        }}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        Détails
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {allExercices.length > 5 && (
                        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                            <Button
                                variant="secondary"
                                onClick={() => navigate('/exercices')}
                                className="gap-2"
                            >
                                Voir les {allExercices.length - 5} autres exercices
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
