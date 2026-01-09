import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { exerciceService } from '@/services/exercice.service';
import { RapportExercice } from '@/types/exercice.types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
    ArrowLeft,
    RefreshCw,
    Lock,
    Unlock,
    Calendar,
    TrendingUp,
    TrendingDown,
    FileText,
    AlertTriangle,
    BarChart3,
    Target,
    Building2,
    Activity,
    Wallet,
    Shield,
    Sparkles
} from 'lucide-react';
import { ClotureModal } from './components/ClotureModal';
import { ReouvertureModal } from './components/ReouvertureModal';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from 'recharts';

// Palette de couleurs
const COLORS = {
    primary: '#10B981',
    secondary: '#3B82F6',
    warning: '#F59E0B',
    danger: '#EF4444',
    purple: '#8B5CF6',
    pink: '#EC4899',
    cyan: '#06B6D4',
    gray: '#6B7280',
};

const CHART_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#EF4444', '#14B8A6'];

// Formatage devise
const formatCurrency = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '-';
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XAF',
        maximumFractionDigits: 0
    }).format(num);
};

const formatCurrencyShort = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '-';
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)} Mrd`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)} M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)} K`;
    return new Intl.NumberFormat('fr-FR').format(num);
};

// Composant StatCard
interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ElementType;
    color?: string;
    trend?: 'up' | 'down' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color = COLORS.primary,
    trend
}) => (
    <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100/50">
        <div className="flex items-start justify-between mb-4">
            <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${color}15` }}
            >
                <Icon className="h-6 w-6" style={{ color }} />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' :
                    trend === 'down' ? 'bg-red-50 text-red-600' :
                        'bg-gray-50 text-gray-600'
                    }`}>
                    {trend === 'up' ? <TrendingUp className="h-3 w-3" /> :
                        trend === 'down' ? <TrendingDown className="h-3 w-3" /> :
                            <Activity className="h-3 w-3" />}
                </div>
            )}
        </div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
);

// Tooltip personnalisé
const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-xl border border-gray-100">
                <p className="font-semibold text-gray-900">{payload[0].name}</p>
                <p className="text-sm text-gray-600">{payload[0].value} contrats</p>
            </div>
        );
    }
    return null;
};

export const ExerciceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [rapport, setRapport] = useState<RapportExercice | null>(null);
    const [exerciceComplet, setExerciceComplet] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isClotureModalOpen, setIsClotureModalOpen] = useState(false);
    const [isReouvertureModalOpen, setIsReouvertureModalOpen] = useState(false);
    const [isRecalculating, setIsRecalculating] = useState(false);

    const fetchData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            // Récupérer le rapport ET les données complètes de l'exercice
            const [rapportData, exerciceData] = await Promise.all([
                exerciceService.getRapport(parseInt(id)),
                exerciceService.getById(parseInt(id))
            ]);
            setRapport(rapportData);
            setExerciceComplet(exerciceData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleRecalculate = async () => {
        if (!id) return;
        setIsRecalculating(true);
        try {
            await exerciceService.recalculer(parseInt(id));
            await fetchData();
        } catch (e) {
            console.error(e);
        } finally {
            setIsRecalculating(false);
        }
    };

    // Calculs dérivés
    const rapportData = useMemo(() => {
        if (!rapport) return null;
        return (rapport as any).data || rapport;
    }, [rapport]);

    // Utiliser exerciceComplet (qui a les dates) en priorité, sinon fallback sur rapportData.exercice
    const exercice = useMemo(() => {
        if (exerciceComplet) {
            return exerciceComplet;
        }
        return rapportData?.exercice;
    }, [exerciceComplet, rapportData]);

    const production = rapportData?.production;
    const sinistralite = rapportData?.sinistralite;
    const repartition_contrats = rapportData?.repartition_contrats;
    const resultat_technique = rapportData?.resultat_technique;

    // Données pour le graphique de répartition
    const repartitionData = useMemo(() => {
        if (!repartition_contrats) return [];
        return Object.entries(repartition_contrats).map(([name, value], index) => ({
            name: name.replace(/_/g, ' ').toUpperCase(),
            value: value as number,
            color: CHART_COLORS[index % CHART_COLORS.length]
        }));
    }, [repartition_contrats]);

    // Données pour le graphique primes vs sinistres
    const performanceData = useMemo(() => {
        if (!production || !sinistralite) return [];
        const primes = parseFloat(production.total_primes_emises || '0');
        const sinistres = parseFloat(sinistralite.total_payes || '0');
        const marge = primes - sinistres;
        return [
            { name: 'Primes', value: primes, fill: COLORS.primary },
            { name: 'Sinistres', value: sinistres, fill: COLORS.warning },
            { name: 'Marge', value: Math.max(0, marge), fill: COLORS.secondary }
        ];
    }, [production, sinistralite]);

    // Ratio S/P
    const ratioSP = useMemo(() => {
        if (!production || !sinistralite) return 0;
        const primes = parseFloat(production.total_primes_emises || '0');
        const sinistres = parseFloat(sinistralite.total_payes || '0');
        if (primes === 0) return 0;
        return (sinistres / primes) * 100;
    }, [production, sinistralite]);

    // Jours restants
    const joursRestants = useMemo(() => {
        if (!exercice?.date_fin) return 0;
        const fin = new Date(exercice.date_fin);
        const now = new Date();
        const diff = fin.getTime() - now.getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }, [exercice]);

    // Progression
    const progression = useMemo(() => {
        if (!exercice?.date_debut || !exercice?.date_fin) return 0;
        const debut = new Date(exercice.date_debut).getTime();
        const fin = new Date(exercice.date_fin).getTime();
        const now = new Date().getTime();
        const total = fin - debut;
        if (total <= 0) return 0;
        const elapsed = now - debut;
        return Math.min(100, Math.max(0, (elapsed / total) * 100));
    }, [exercice]);

    if (loading && !rapport) {
        return (
            <div className="flex-1 p-8 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="h-12 w-64 bg-gray-200 rounded-xl animate-pulse" />
                    <div className="h-40 bg-white rounded-3xl animate-pulse shadow-soft" />
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-36 bg-white rounded-2xl animate-pulse shadow-soft" />
                        ))}
                    </div>
                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="h-80 bg-white rounded-3xl animate-pulse shadow-soft" />
                        <div className="h-80 bg-white rounded-3xl animate-pulse shadow-soft" />
                    </div>
                </div>
            </div>
        );
    }

    if (!rapport || !exercice) {
        return (
            <div className="flex-1 p-8 bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Rapport non trouvé</h3>
                    <p className="text-gray-500 mb-4">Les données de cet exercice ne sont pas disponibles.</p>
                    <Button variant="primary" onClick={() => navigate('/exercices')}>
                        Retour aux exercices
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header avec navigation */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate('/exercices')}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Retour
                    </Button>
                </div>

                {/* Bannière principale */}
                <div className={`rounded-3xl p-6 text-white shadow-xl ${exercice.statut === 'ouvert'
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500'
                    : 'bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800'
                    }`}>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                <Sparkles className="h-8 w-8" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h1 className="text-3xl font-bold">Exercice {exercice.annee}</h1>
                                    <Badge
                                        variant={exercice.statut === 'ouvert' ? 'success' : 'secondary'}
                                        className="bg-white/20 text-white border-0"
                                    >
                                        {exercice.statut === 'ouvert' ? 'En cours' : 'Clôturé'}
                                    </Badge>
                                </div>
                                <p className="text-white/80 text-sm">
                                    <Calendar className="h-4 w-4 inline mr-1" />
                                    {exercice.date_debut && exercice.date_fin ? (
                                        <>
                                            {new Date(exercice.date_debut).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                            {' → '}
                                            {new Date(exercice.date_fin).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                        </>
                                    ) : (
                                        'Dates non définies'
                                    )}
                                </p>
                            </div>
                        </div>

                        {exercice.statut === 'ouvert' && (
                            <div className="flex flex-wrap items-center gap-6">
                                <div className="text-center">
                                    <p className="text-4xl font-bold">{joursRestants}</p>
                                    <p className="text-white/80 text-sm">jours restants</p>
                                </div>

                                <div className="hidden sm:block w-px h-12 bg-white/30" />

                                <div className="flex-1 min-w-[200px] max-w-xs">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-white/80">Progression</span>
                                        <span className="font-semibold">{progression.toFixed(0)}%</span>
                                    </div>
                                    <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-white rounded-full transition-all duration-500"
                                            style={{ width: `${progression}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                onClick={handleRecalculate}
                                disabled={isRecalculating}
                                className="bg-white/20 hover:bg-white/30 border-0 text-white backdrop-blur-sm gap-2"
                            >
                                <RefreshCw className={`h-4 w-4 ${isRecalculating ? 'animate-spin' : ''}`} />
                                Recalculer
                            </Button>
                            {exercice.statut === 'ouvert' ? (
                                <Button
                                    variant="secondary"
                                    onClick={() => setIsClotureModalOpen(true)}
                                    className="bg-red-500/80 hover:bg-red-500 border-0 text-white gap-2"
                                >
                                    <Lock className="h-4 w-4" />
                                    Clôturer
                                </Button>
                            ) : (
                                <Button
                                    variant="secondary"
                                    onClick={() => setIsReouvertureModalOpen(true)}
                                    className="bg-emerald-500/80 hover:bg-emerald-500 border-0 text-white gap-2"
                                >
                                    <Unlock className="h-4 w-4" />
                                    Réouvrir
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Statistiques principales */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Contrats"
                        value={production?.nombre_contrats || 0}
                        subtitle="Contrats émis"
                        icon={FileText}
                        color={COLORS.secondary}
                    />
                    <StatCard
                        title="Primes Émises"
                        value={formatCurrencyShort(production?.total_primes_emises || 0)}
                        subtitle={formatCurrency(production?.total_primes_emises || 0)}
                        icon={Wallet}
                        color={COLORS.primary}
                        trend="up"
                    />
                    <StatCard
                        title="Sinistres Payés"
                        value={formatCurrencyShort(sinistralite?.total_payes || 0)}
                        subtitle={`${sinistralite?.nombre_sinistres || 0} sinistres`}
                        icon={AlertTriangle}
                        color={COLORS.warning}
                    />
                    <StatCard
                        title="Ratio S/P"
                        value={`${ratioSP.toFixed(1)}%`}
                        subtitle={ratioSP <= 50 ? 'Objectif atteint' : 'Au-dessus de la cible'}
                        icon={Target}
                        color={ratioSP <= 50 ? COLORS.primary : COLORS.danger}
                        trend={ratioSP <= 50 ? 'up' : 'down'}
                    />
                </div>

                {/* Graphiques */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Répartition par EMF */}
                    <div className="bg-white rounded-3xl p-6 shadow-soft border border-gray-100/50">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                    <Building2 className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Répartition par EMF</h3>
                                    <p className="text-sm text-gray-500">Nombre de contrats par institution</p>
                                </div>
                            </div>
                        </div>

                        {repartitionData.length > 0 ? (
                            <div className="flex flex-col lg:flex-row items-center gap-6">
                                <div className="w-full lg:w-1/2 h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={repartitionData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={90}
                                                paddingAngle={3}
                                                dataKey="value"
                                            >
                                                {repartitionData.map((entry, index) => (
                                                    <Cell key={index} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="w-full lg:w-1/2 space-y-3">
                                    {repartitionData.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: item.color }}
                                                />
                                                <span className="text-sm font-medium text-gray-700">{item.name}</span>
                                            </div>
                                            <span className="font-bold text-gray-900">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="h-[250px] flex items-center justify-center text-gray-400">
                                Aucune donnée disponible
                            </div>
                        )}
                    </div>

                    {/* Performance financière */}
                    <div className="bg-white rounded-3xl p-6 shadow-soft border border-gray-100/50">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                                    <BarChart3 className="h-5 w-5 text-emerald-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Performance Financière</h3>
                                    <p className="text-sm text-gray-500">Primes, sinistres et marge</p>
                                </div>
                            </div>
                        </div>

                        {performanceData.length > 0 ? (
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={performanceData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
                                        <XAxis type="number" tickFormatter={(v) => formatCurrencyShort(v)} />
                                        <YAxis type="category" dataKey="name" width={80} />
                                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                        <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                                            {performanceData.map((entry, index) => (
                                                <Cell key={index} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-[250px] flex items-center justify-center text-gray-400">
                                Aucune donnée disponible
                            </div>
                        )}
                    </div>
                </div>

                {/* Détails sinistralité */}
                <div className="bg-white rounded-3xl p-6 shadow-soft border border-gray-100/50">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                            <Shield className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Détails Sinistralité</h3>
                            <p className="text-sm text-gray-500">Analyse des sinistres de l'exercice</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="p-4 bg-gray-50 rounded-2xl">
                            <p className="text-sm text-gray-500 mb-1">Sinistres Déclarés</p>
                            <p className="text-2xl font-bold text-gray-900">{sinistralite?.nombre_sinistres || 0}</p>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-2xl">
                            <p className="text-sm text-orange-600 mb-1">Montant Déclaré</p>
                            <p className="text-2xl font-bold text-orange-700">
                                {formatCurrencyShort(sinistralite?.total_declares || 0)}
                            </p>
                            <p className="text-xs text-orange-500 mt-1">
                                {formatCurrency(sinistralite?.total_declares || 0)}
                            </p>
                        </div>
                        <div className="p-4 bg-emerald-50 rounded-2xl">
                            <p className="text-sm text-emerald-600 mb-1">Montant Payé</p>
                            <p className="text-2xl font-bold text-emerald-700">
                                {formatCurrencyShort(sinistralite?.total_payes || 0)}
                            </p>
                            <p className="text-xs text-emerald-500 mt-1">
                                {formatCurrency(sinistralite?.total_payes || 0)}
                            </p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-2xl">
                            <p className="text-sm text-purple-600 mb-1">Provisions</p>
                            <p className="text-2xl font-bold text-purple-700">
                                {formatCurrencyShort(sinistralite?.provisions || 0)}
                            </p>
                            <p className="text-xs text-purple-500 mt-1">
                                {formatCurrency(sinistralite?.provisions || 0)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Résultat technique */}
                {resultat_technique && (
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">Résultat Technique</h3>
                                <p className="text-sm text-gray-400">Synthèse de l'exercice</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <p className="text-sm text-gray-400 mb-1">Primes Nettes</p>
                                <p className="text-2xl font-bold text-emerald-400">
                                    {formatCurrencyShort(resultat_technique.primes || 0)}
                                </p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <p className="text-sm text-gray-400 mb-1">Charge Sinistres</p>
                                <p className="text-2xl font-bold text-amber-400">
                                    {formatCurrencyShort(resultat_technique.sinistres || 0)}
                                </p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <p className="text-sm text-gray-400 mb-1">Marge Technique</p>
                                <p className={`text-2xl font-bold ${(resultat_technique.marge || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                                    }`}>
                                    {formatCurrencyShort(resultat_technique.marge || 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <ClotureModal
                isOpen={isClotureModalOpen}
                onClose={() => setIsClotureModalOpen(false)}
                exerciceId={exercice.id}
                onSuccess={() => {
                    setIsClotureModalOpen(false);
                    fetchData();
                }}
            />
            <ReouvertureModal
                isOpen={isReouvertureModalOpen}
                onClose={() => setIsReouvertureModalOpen(false)}
                exerciceId={exercice.id}
                onSuccess={() => {
                    setIsReouvertureModalOpen(false);
                    fetchData();
                }}
            />
        </div>
    );
};
