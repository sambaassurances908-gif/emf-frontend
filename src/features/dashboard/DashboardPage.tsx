// src/features/dashboard/DashboardPage.tsx
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useSinistresEvolution } from '@/hooks/useSinistresEvolution';
import { 
  FileText, 
  AlertCircle, 
  Wallet, 
  CheckCircle, 
  TrendingUp,
  Calendar,
  AlertTriangle,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  User,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Eye,
  Clock,
  XCircle,
  CheckCircle2,
  Hourglass,
  ArrowRight,
} from 'lucide-react';
import { formatCurrencyShort, formatCurrency, formatDate } from '@/lib/utils';
import api from '@/lib/api';
import { DashboardStats, EmfStats, SinistreRecent } from '@/types/dashboard.types';
import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

// Palette colorée pour les EMF
const EMF_COLORS: Record<string, string> = {
  BAMBOO: '#10B981',   // Vert émeraude
  COFIDEC: '#3B82F6',  // Bleu
  BCEG: '#F59E0B',     // Orange
  EDG: '#8B5CF6',      // Violet
  SODEC: '#EC4899',    // Rose
};
const CHART_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#F43F5E'];
const ACCENT_COLOR = '#10B981';

// Types de tri
type SortField = 'total' | 'montant_total' | 'prime_collectee' | 'cotisation_totale_ttc' | 'sigle';
type SortOrder = 'asc' | 'desc';
type PeriodFilter = 'week' | 'month' | 'quarter' | 'year';

// EMF Slugs
const EMF_SLUGS: Record<number, string> = {
  1: 'bamboo',
  2: 'cofidec',
  3: 'bceg',
  4: 'edg',
  5: 'sodec',
};

const getEmfSlug = (emfId: number): string | null => {
  return EMF_SLUGS[emfId] || null;
};

// Statuts sinistres
const SINISTRE_STATUTS = {
  en_attente: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', icon: Hourglass },
  en_cours: { label: 'En cours', color: 'bg-blue-100 text-blue-700', icon: Clock },
  valide: { label: 'Validé', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  rejete: { label: 'Rejeté', color: 'bg-red-100 text-red-700', icon: XCircle },
  paye: { label: 'Payé', color: 'bg-emerald-100 text-emerald-700', icon: Wallet },
  cloture: { label: 'Clôturé', color: 'bg-gray-100 text-gray-700', icon: CheckCircle },
};

// Composant StatCard style Finve
const StatCard = ({ 
  title, 
  amount, 
  percent, 
  isPositive,
  icon: Icon,
  onClick
}: { 
  title: string; 
  amount: string; 
  percent?: string; 
  isPositive?: boolean;
  icon?: React.ComponentType<{ className?: string; size?: number }>;
  onClick?: () => void;
}) => (
  <div 
    className={`bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50 ${onClick ? 'cursor-pointer hover:shadow-lg hover:border-gray-200 transition-all duration-200' : ''}`}
    onClick={onClick}
  >
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
            <Icon size={20} className="text-gray-600" />
          </div>
        )}
        <h3 className="text-sm font-bold text-gray-700">{title}</h3>
      </div>
      <MoreHorizontal size={20} className="text-gray-300 cursor-pointer hover:text-gray-500" />
    </div>
    <div className="flex items-center gap-3">
      <span className="text-2xl font-bold text-gray-900">{amount}</span>
      {percent && (
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
          {isPositive ? '+' : '-'}{percent}%
        </span>
      )}
    </div>
  </div>
);

// Dropdown component
const Dropdown = ({ 
  label, 
  options, 
  value, 
  onChange 
}: { 
  label: string; 
  options: { value: string; label: string }[]; 
  value: string; 
  onChange: (value: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find(o => o.value === value);
  
  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
      >
        {selected?.label || label} <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-1 min-w-[140px] z-20">
            {options.map(option => (
              <button
                key={option.value}
                onClick={() => { onChange(option.value); setIsOpen(false); }}
                className={`w-full px-3 py-2 text-left text-xs font-medium hover:bg-gray-50 transition-colors ${value === option.value ? 'text-gray-900 bg-gray-50' : 'text-gray-600'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const DashboardPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  // États pour les filtres et tris
  const [emfSortField, setEmfSortField] = useState<SortField>('cotisation_totale_ttc');
  const [emfSortOrder, setEmfSortOrder] = useState<SortOrder>('desc');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('month');

  useEffect(() => {
    if (user?.emf_id && user.emf_id > 0) {
      const emfDashboards: Record<number, string> = {
        1: '/dashboard/bamboo',
        2: '/dashboard/cofidec',
        3: '/dashboard/bceg',
        4: '/dashboard/edg',
        5: '/dashboard/sodec',
      };
      
      const dashboardPath = emfDashboards[user.emf_id];
      if (dashboardPath) {
        navigate(dashboardPath, { replace: true });
      }
    }
  }, [user, navigate]);

  const { data: stats, isLoading, isError, error } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get<{ data: DashboardStats }>('/dashboard/statistiques');
      return response.data.data;
    },
    enabled: !user?.emf_id || user.emf_id === 0,
  });

  // Construire par_emf à partir de details_par_type (source fiable)
  const emfDataFromDetails = useMemo(() => {
    // Toujours utiliser details_par_type car c'est la source fiable
    const detailsParType = (stats as any)?.details_par_type;
    if (!detailsParType) return [];
    
    const emfMapping: { key: string; id: number; sigle: string }[] = [
      { key: 'bamboo_emf', id: 1, sigle: 'BAMBOO' },
      { key: 'cofidec', id: 2, sigle: 'COFIDEC' },
      { key: 'bceg', id: 3, sigle: 'BCEG' },
      { key: 'edg', id: 4, sigle: 'EDG' },
      { key: 'sodec', id: 5, sigle: 'SODEC' },
    ];
    
    // Inclure TOUS les EMF (même ceux avec 0 contrats pour visibilité)
    return emfMapping.map(emf => ({
      emf_id: emf.id,
      emf: { sigle: emf.sigle },
      total: detailsParType[emf.key]?.total || 0,
      montant_total: parseFloat(detailsParType[emf.key]?.montant_total) || 0,
      prime_collectee: parseFloat(detailsParType[emf.key]?.prime_collectee || detailsParType[emf.key]?.primes_collectees) || 0,
      cotisation_totale_ttc: parseFloat(detailsParType[emf.key]?.cotisation_totale_ttc) || 0,
    }));
  }, [stats]);

  // Calculs
  const tauxCroissance = stats?.evolution_contrats && stats.evolution_contrats.length > 1
    ? ((stats.evolution_contrats[stats.evolution_contrats.length - 1]?.total || 0) - 
       (stats.evolution_contrats[stats.evolution_contrats.length - 2]?.total || 0)) / 
       (stats.evolution_contrats[stats.evolution_contrats.length - 2]?.total || 1) * 100
    : 0;

  const tauxSinistralite = stats?.contrats_actifs
    ? ((stats?.sinistres_en_cours || 0) / stats.contrats_actifs) * 100
    : 0;

  // Données pour graphiques
  const emfPieData = emfDataFromDetails.map((emf: EmfStats, index: number) => {
    const sigle = emf.emf?.sigle?.toUpperCase() || 'INCONNU';
    return {
      name: emf.emf?.sigle || 'Inconnu',
      value: emf.total,
      montant: emf.montant_total,
      fill: EMF_COLORS[sigle] || CHART_COLORS[index % CHART_COLORS.length]
    };
  });

  const genreStats = stats?.par_genre || { hommes: 0, femmes: 0, non_determine: 0 };
  const totalGenre = genreStats.hommes + genreStats.femmes + genreStats.non_determine;

  // Regrouper par agence
  const agencesData = useMemo(() => {
    const agences = stats?.par_agence || stats?.par_localisation?.map((loc: any) => ({
      agence: loc.agence || loc.ville || loc.localisation,
      nombre: loc.nombre
    })) || [];
    
    const totalAgences = agences.reduce((acc: number, ag: any) => acc + ag.nombre, 0);
    return { agences, total: totalAgences };
  }, [stats]);

  // EMF triés selon les options de tri
  const sortedEmfData = useMemo(() => {
    if (!emfDataFromDetails || emfDataFromDetails.length === 0) return [];
    
    const sorted = [...emfDataFromDetails].sort((a, b) => {
      let comparison = 0;
      switch (emfSortField) {
        case 'total':
          comparison = a.total - b.total;
          break;
        case 'montant_total':
          comparison = a.montant_total - b.montant_total;
          break;
        case 'prime_collectee':
          comparison = (a.prime_collectee || 0) - (b.prime_collectee || 0);
          break;
        case 'cotisation_totale_ttc':
          comparison = (a.cotisation_totale_ttc || 0) - (b.cotisation_totale_ttc || 0);
          break;
        case 'sigle':
          comparison = (a.emf?.sigle || '').localeCompare(b.emf?.sigle || '');
          break;
      }
      return emfSortOrder === 'desc' ? -comparison : comparison;
    });
    
    return sorted;
  }, [emfDataFromDetails, emfSortField, emfSortOrder]);

  // Données pour bar chart mensuel - utiliser les données du backend directement
  const monthlyData = stats?.evolution_contrats?.map((item: any, index: number, arr: any[]) => ({
    name: item.mois || `Mois ${index + 1}`,
    value: item.total || 0,
    isHighlight: index === arr.length - 1
  })) || [];

  // Récupérer l'évolution des sinistres depuis la base de données
  const { data: sinistresEvolutionRaw, isLoading: isLoadingSinistresEvolution } = useSinistresEvolution();

  // Transformer les données pour les graphiques
  const sinistresEvolutionData = useMemo(() => {
    if (!sinistresEvolutionRaw || sinistresEvolutionRaw.length === 0) {
      // Données vides par défaut
      const moisNoms = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
      return moisNoms.map(mois => ({ name: mois, declares: 0, regles: 0, rejetes: 0 }));
    }
    return sinistresEvolutionRaw.map(item => ({
      name: item.mois,
      declares: item.declares,
      regles: item.regles,
      rejetes: item.rejetes
    }));
  }, [sinistresEvolutionRaw]);

  // Custom tooltip minimaliste
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-3 py-2 rounded-xl shadow-xl border border-gray-100 z-20">
          <div className="text-[10px] text-gray-400 font-bold mb-0.5">{payload[0].name}</div>
          <div className="text-sm font-bold text-gray-900">{payload[0].value}</div>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip pour les sinistres
  const SinistresCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-3 rounded-xl shadow-xl border border-gray-100 z-20">
          <div className="text-xs text-gray-500 font-bold mb-2">{label}</div>
          {payload.map((item: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-600 capitalize">{item.dataKey}:</span>
              <span className="font-bold text-gray-900">{item.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (user?.emf_id && user.emf_id > 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-[#FAFAFA]">
        <LoadingSpinner size="lg" text="Redirection..." />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-[#FAFAFA]">
        <LoadingSpinner size="lg" text="Chargement du tableau de bord..." />
      </div>
    );
  }

  if (isError) {
    const errorMessage = (error as any)?.response?.data?.message || (error as Error).message;
    const isCotisationError = errorMessage?.includes('cotisation_totale_ht');
    
    return (
      <div className="p-6 text-center bg-red-50 rounded-3xl mx-6 mt-6 border border-red-100">
        <h2 className="text-lg font-bold text-red-600">Une erreur est survenue</h2>
        <p className="mt-2 text-sm text-red-500">Impossible de charger les données.</p>
        {isCotisationError ? (
          <div className="mt-3 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
            <p className="text-xs text-yellow-700 font-medium">
              ⚠️ Erreur backend : La colonne <code className="bg-yellow-100 px-1 rounded">cotisation_totale_ht</code> n'existe pas.
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              Remplacez <code className="bg-yellow-100 px-1 rounded">cotisation_totale_ht</code> par <code className="bg-yellow-100 px-1 rounded">cotisation_totale_ttc</code> dans le DashboardController.php
            </p>
          </div>
        ) : (
          <p className="text-xs mt-1 text-red-400">{errorMessage}</p>
        )}
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">
            Vue d'ensemble du portefeuille SAMB'A Assurances
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Dropdown
            label="Période"
            value={periodFilter}
            onChange={(v) => setPeriodFilter(v as PeriodFilter)}
            options={[
              { value: 'week', label: 'Cette semaine' },
              { value: 'month', label: 'Ce mois' },
              { value: 'quarter', label: 'Ce trimestre' },
              { value: 'year', label: 'Cette année' },
            ]}
          />
        </div>
      </header>

      {/* Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Row 1: Balance Card & Chart */}
        <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50 flex flex-col justify-between h-[320px]">
          <div className="flex justify-between items-start">
            <span className="font-bold text-gray-700">Portefeuille</span>
            <MoreHorizontal size={20} className="text-gray-300" />
          </div>
          
          <div>
            <div className="text-4xl font-extrabold text-gray-900 mb-4">
              {formatCurrencyShort(stats?.montant_total_assure || 0)}
            </div>
            <div className="flex items-center gap-2 mb-6">
              {tauxCroissance >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm font-bold ${tauxCroissance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {tauxCroissance >= 0 ? '+' : ''}{tauxCroissance.toFixed(1)}%
              </span>
              <span className="text-xs text-gray-400">vs mois dernier</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Contrats actifs:</span>
              <span className="font-bold text-gray-900">{stats?.contrats_actifs || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Primes collectées:</span>
              <span className="font-bold text-gray-900">{formatCurrencyShort(stats?.prime_totale_collectee || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">EMF partenaires:</span>
              <span className="font-bold text-gray-900">{emfDataFromDetails.length || 0}</span>
            </div>
          </div>
        </div>

        {/* Graphique évolution mensuelle */}
        <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50 h-[320px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-700">Évolution des Contrats</h3>
            <div className="flex items-center gap-3">
              <Dropdown
                label="Période"
                value={periodFilter}
                onChange={(v) => setPeriodFilter(v as PeriodFilter)}
                options={[
                  { value: 'month', label: '12 derniers mois' },
                  { value: 'quarter', label: '4 trimestres' },
                  { value: 'year', label: '5 dernières années' },
                ]}
              />
              <MoreHorizontal size={20} className="text-gray-300" />
            </div>
          </div>

          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 500 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#D1D5DB', fontWeight: 500 }}
                  tickFormatter={(value) => value > 0 ? value : ''}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                <Bar 
                  dataKey="value" 
                  radius={[6, 6, 0, 0]}
                  maxBarSize={28}
                >
                  {monthlyData.map((entry: any, index: number) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isHighlight ? ACCENT_COLOR : '#E5E7EB'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 2: Stats Cards */}
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <StatCard 
            title="Contrats Actifs" 
            amount={String(stats?.contrats_actifs || 0)} 
            percent={Math.abs(tauxCroissance).toFixed(1)} 
            isPositive={tauxCroissance >= 0}
            icon={FileText}
            onClick={() => navigate('/contrats?statut=actif')}
          />
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <StatCard 
            title="Sinistres en Cours" 
            amount={String(stats?.sinistres_en_cours || 0)} 
            percent="3.1" 
            isPositive={false}
            icon={AlertCircle}
            onClick={() => navigate('/sinistres?statut=en_cours')}
          />
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <StatCard 
            title="Taux Règlement" 
            amount={`${stats?.taux_reglement || 0}%`}
            percent="5.4" 
            isPositive={true}
            icon={CheckCircle}
          />
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <StatCard 
            title="Sinistralité" 
            amount={`${tauxSinistralite.toFixed(1)}%`}
            icon={TrendingUp}
          />
        </div>

        {/* Row 3: Indicateurs Clés */}
        <div className="col-span-12 bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-700">Indicateurs Clés</h3>
            <MoreHorizontal size={20} className="text-gray-300" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div 
              className="text-center p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl cursor-pointer hover:from-gray-100 hover:to-gray-200 transition-all group"
              onClick={() => navigate('/statistiques')}
            >
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:shadow transition-shadow">
                <TrendingUp className="h-6 w-6 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {tauxCroissance > 0 ? '+' : ''}{tauxCroissance.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-1 font-medium">Croissance</p>
            </div>

            <div 
              className="text-center p-5 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl cursor-pointer hover:from-yellow-100 hover:to-amber-100 transition-all group"
              onClick={() => navigate('/contrats?statut=en_attente')}
            >
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:shadow transition-shadow">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats?.contrats_en_attente || 0}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">Contrats en Attente</p>
            </div>

            <div 
              className="text-center p-5 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl cursor-pointer hover:from-red-100 hover:to-orange-100 transition-all group"
              onClick={() => navigate('/contrats?statut=expire')}
            >
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:shadow transition-shadow">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats?.contrats_expires_mois || 0}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">Expirés ce Mois</p>
            </div>

            <div 
              className="text-center p-5 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl cursor-pointer hover:from-emerald-100 hover:to-green-100 transition-all group"
              onClick={() => navigate('/statistiques')}
            >
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:shadow transition-shadow">
                <Wallet className="h-6 w-6 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrencyShort(stats?.prime_totale_collectee || 0)}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">Primes Collectées</p>
            </div>

            <div 
              className="text-center p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-all group"
              onClick={() => navigate('/sinistres?statut=en_cours')}
            >
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:shadow transition-shadow">
                <AlertCircle className="h-6 w-6 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats?.sinistres_en_cours || 0}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">Sinistres en Cours</p>
            </div>

            <div 
              className="text-center p-5 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl cursor-pointer hover:from-purple-100 hover:to-violet-100 transition-all group"
              onClick={() => navigate('/statistiques')}
            >
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:shadow transition-shadow">
                <CheckCircle className="h-6 w-6 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats?.taux_reglement || 0}%</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">Taux Règlement</p>
            </div>
          </div>
        </div>

        {/* Row 4: Évolution des Sinistres - Graphique courbe et barres */}
        <div className="col-span-12 bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-gray-700">Évolution des Sinistres</h3>
              <p className="text-xs text-gray-400 mt-1">
                Tendance sur l'année {new Date().getFullYear()} (données réelles)
              </p>
            </div>
            <div className="flex items-center gap-4">
              {isLoadingSinistresEvolution && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <div className="w-3 h-3 border-2 border-gray-300 border-t-emerald-500 rounded-full animate-spin"></div>
                  Chargement...
                </div>
              )}
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-xs text-gray-500">Déclarés</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-xs text-gray-500">Réglés</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <span className="text-xs text-gray-500">Rejetés</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Graphique en courbes (LineChart) */}
            <div>
              <p className="text-xs text-gray-400 font-medium mb-3">Courbe de tendance</p>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sinistresEvolutionData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 11, fill: '#9CA3AF' }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: '#9CA3AF' }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<SinistresCustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="declares" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="regles" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="rejetes" 
                      stroke="#F87171" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: '#F87171', strokeWidth: 2, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Graphique en aires (AreaChart) */}
            <div>
              <p className="text-xs text-gray-400 font-medium mb-3">Volume cumulé</p>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sinistresEvolutionData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorDeclares" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorRegles" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 11, fill: '#9CA3AF' }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: '#9CA3AF' }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<SinistresCustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="declares" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorDeclares)"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="regles" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRegles)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Stats résumées */}
          <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {sinistresEvolutionData.reduce((acc, item) => acc + item.declares, 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Total déclarés</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">
                {sinistresEvolutionData.reduce((acc, item) => acc + item.regles, 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Total réglés</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">
                {sinistresEvolutionData.reduce((acc, item) => acc + item.rejetes, 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Total rejetés</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {sinistresEvolutionData.length > 0 
                  ? Math.round(sinistresEvolutionData.reduce((acc, item) => acc + item.regles, 0) / 
                    sinistresEvolutionData.reduce((acc, item) => acc + item.declares, 0) * 100) || 0
                  : 0}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Taux de règlement</p>
            </div>
          </div>
        </div>

        {/* Row 5: Performance EMF & Par Agence */}
        <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-700">Performance par EMF</h3>
            <div className="flex items-center gap-3">
              <Dropdown
                label="Trier"
                value={emfSortField}
                onChange={(v) => setEmfSortField(v as SortField)}
                options={[
                  { value: 'cotisation_totale_ttc', label: 'Par cotisations' },
                  { value: 'total', label: 'Par contrats' },
                ]}
              />
              <MoreHorizontal size={20} className="text-gray-300" />
            </div>
          </div>

          <div className="space-y-4">
            {sortedEmfData.length > 0 ? (
              sortedEmfData.map((emf: any, index: number) => {
                const totalCotisations = emfDataFromDetails.reduce((acc: number, e: any) => acc + (e.cotisation_totale_ttc || 0), 0);
                const percentage = totalCotisations > 0 
                  ? ((emf.cotisation_totale_ttc || 0) / totalCotisations * 100)
                  : 0;
                const emfSlug = getEmfSlug(emf.emf_id);
                const sigle = emf.emf?.sigle?.toUpperCase() || 'INCONNU';
                const emfColor = EMF_COLORS[sigle] || CHART_COLORS[index % CHART_COLORS.length];
                
                return (
                  <div 
                    key={emf.emf_id} 
                    className="group cursor-pointer p-3 -mx-3 rounded-xl hover:bg-gray-50 transition-colors"
                    onClick={() => navigate(emfSlug ? `/dashboard/${emfSlug}` : `/contrats?emf_id=${emf.emf_id}`)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm"
                          style={{ backgroundColor: emfColor }}
                        >
                          {(emf.emf?.sigle || 'N').charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 text-sm">{emf.emf?.sigle || 'Inconnu'}</span>
                          <span className="text-xs text-gray-400 ml-2">{emf.total} contrats</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-bold" style={{ color: emfColor }}>{formatCurrencyShort(emf.cotisation_totale_ttc || 0)}</span>
                          <span className="text-xs text-gray-400 ml-2">{percentage.toFixed(1)}%</span>
                        </div>
                        <ArrowRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500 group-hover:opacity-80"
                        style={{ 
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: emfColor
                        }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-400">Aucune donnée disponible</div>
            )}
          </div>
        </div>

        {/* Par Agence */}
        <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-700">Par Agence</h3>
            <MoreHorizontal size={20} className="text-gray-300" />
          </div>

          <div className="space-y-3">
            {agencesData.agences.length > 0 ? (
              agencesData.agences.slice(0, 5).map((agence: any, index: number) => {
                const pourcentage = agencesData.total > 0 
                  ? ((agence.nombre / agencesData.total) * 100).toFixed(0) 
                  : 0;
                return (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/contrats?agence=${encodeURIComponent(agence.agence)}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                        <Building2 size={14} className="text-gray-500" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{agence.agence}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">{agence.nombre}</span>
                      <span className="text-xs text-gray-400">({pourcentage}%)</span>
                      <ArrowRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Building2 className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Aucune donnée par agence</p>
              </div>
            )}

            {agencesData.agences.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm text-gray-500">Total</span>
                <span className="text-lg font-bold text-gray-900">{agencesData.total}</span>
              </div>
            )}
          </div>
        </div>

        {/* Row 4: Pie Charts */}
        <div className="col-span-12 lg:col-span-6 bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-700">Répartition par EMF</h3>
            <MoreHorizontal size={20} className="text-gray-300" />
          </div>
          
          {emfPieData.length > 0 ? (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <RechartsPieChart>
                  <Pie
                    data={emfPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {emfPieData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill || CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span className="text-gray-600 text-xs">{value}</span>}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-gray-400">
              Aucune donnée
            </div>
          )}
        </div>

        {/* Genre Stats */}
        <div className="col-span-12 lg:col-span-6 bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-700">Répartition par Genre</h3>
            <MoreHorizontal size={20} className="text-gray-300" />
          </div>

          <div className="space-y-6">
            {/* Hommes */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <User size={24} className="text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-700">Hommes</span>
                  <span className="text-lg font-bold text-gray-900">{genreStats.hommes}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-gray-600 h-2 rounded-full"
                    style={{ width: `${totalGenre > 0 ? (genreStats.hommes / totalGenre) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Femmes */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <User size={24} className="text-gray-400" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-700">Femmes</span>
                  <span className="text-lg font-bold text-gray-900">{genreStats.femmes}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-gray-400 h-2 rounded-full"
                    style={{ width: `${totalGenre > 0 ? (genreStats.femmes / totalGenre) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-gray-500 font-medium">Total Assurés</span>
              <span className="text-2xl font-bold text-gray-900">{totalGenre}</span>
            </div>
          </div>
        </div>

        {/* Catégories Socio-Professionnelles */}
        <div className="col-span-12 lg:col-span-6 bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-700">Catégories Socio-Professionnelles</h3>
            <MoreHorizontal size={20} className="text-gray-300" />
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {stats?.par_categorie_socio_pro && stats.par_categorie_socio_pro.length > 0 ? (
              (() => {
                const totalCategories = stats.par_categorie_socio_pro.reduce((acc, cat) => acc + cat.nombre, 0);
                const sortedCategories = [...stats.par_categorie_socio_pro].sort((a, b) => b.nombre - a.nombre);
                
                return sortedCategories.map((categorie, index) => {
                  const percentage = totalCategories > 0 
                    ? ((categorie.nombre / totalCategories) * 100).toFixed(1) 
                    : 0;
                  
                  return (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/contrats?categorie_socio_pro=${encodeURIComponent(categorie.categorie)}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm"
                          style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                        >
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {categorie.categorie || 'Non définie'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{categorie.nombre}</span>
                        <span className="text-xs text-gray-400">({percentage}%)</span>
                        <ArrowRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  );
                });
              })()
            ) : (
              <div className="text-center py-8">
                <User className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Aucune donnée disponible</p>
              </div>
            )}

            {stats?.par_categorie_socio_pro && stats.par_categorie_socio_pro.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm text-gray-500">Total</span>
                <span className="text-lg font-bold text-gray-900">
                  {stats.par_categorie_socio_pro.reduce((acc, cat) => acc + cat.nombre, 0)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Row 6: Table EMF - Triée par nombre de contrats */}
        <div className="col-span-12 bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-700">Détails par EMF</h3>
            <div className="flex items-center gap-3">
              <Dropdown
                label="Trier par"
                value={emfSortField}
                onChange={(v) => setEmfSortField(v as SortField)}
                options={[
                  { value: 'total', label: 'Nb Contrats' },
                  { value: 'montant_total', label: 'Montant' },
                  { value: 'sigle', label: 'Nom EMF' },
                ]}
              />
              <button 
                onClick={() => setEmfSortOrder(emfSortOrder === 'desc' ? 'asc' : 'desc')}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                title={emfSortOrder === 'desc' ? 'Ordre décroissant' : 'Ordre croissant'}
              >
                {emfSortOrder === 'desc' ? (
                  <ChevronDown size={16} className="text-gray-500" />
                ) : (
                  <ChevronUp size={16} className="text-gray-500" />
                )}
              </button>
              <MoreHorizontal size={20} className="text-gray-300" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100">
                  <th className="font-medium py-3">#</th>
                  <th className="font-medium py-3">EMF</th>
                  <th 
                    className="font-medium py-3 text-center cursor-pointer hover:text-gray-600"
                    onClick={() => { setEmfSortField('total'); setEmfSortOrder(emfSortOrder === 'desc' ? 'asc' : 'desc'); }}
                  >
                    Contrats {emfSortField === 'total' && (emfSortOrder === 'desc' ? '↓' : '↑')}
                  </th>
                  <th 
                    className="font-medium py-3 text-center cursor-pointer hover:text-gray-600"
                    onClick={() => { setEmfSortField('montant_total'); setEmfSortOrder(emfSortOrder === 'desc' ? 'asc' : 'desc'); }}
                  >
                    Montant Total {emfSortField === 'montant_total' && (emfSortOrder === 'desc' ? '↓' : '↑')}
                  </th>
                  <th className="font-medium py-3 text-center">Moyenne</th>
                  <th className="font-medium py-3 text-center">Part</th>
                  <th className="font-medium py-3 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium text-gray-700">
                {sortedEmfData.length > 0 ? (
                  sortedEmfData.map((emf: EmfStats, index: number) => {
                    const percentage = stats?.contrats_actifs 
                      ? ((emf.total / stats.contrats_actifs) * 100)
                      : 0;
                    const moyenne = emf.total > 0 ? emf.montant_total / emf.total : 0;
                    const emfSlug = getEmfSlug(emf.emf_id);
                    
                    return (
                      <tr 
                        key={emf.emf_id} 
                        className="hover:bg-gray-50 transition-colors cursor-pointer group"
                        onClick={() => navigate(emfSlug ? `/dashboard/${emfSlug}` : `/contrats?emf_id=${emf.emf_id}`)}
                      >
                        <td className="py-4 border-b border-gray-50 text-gray-400 text-xs">{index + 1}</td>
                        <td className="py-4 border-b border-gray-50">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm"
                              style={{ backgroundColor: EMF_COLORS[(emf.emf?.sigle || '').toUpperCase()] || CHART_COLORS[index % CHART_COLORS.length] }}
                            >
                              {(emf.emf?.sigle || 'N').charAt(0)}
                            </div>
                            <span className="font-bold text-gray-900">{emf.emf?.sigle || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="py-4 text-center font-bold text-gray-900 border-b border-gray-50">{emf.total}</td>
                        <td className="py-4 text-center font-semibold text-gray-900 border-b border-gray-50">{formatCurrencyShort(emf.montant_total)}</td>
                        <td className="py-4 text-center text-gray-500 border-b border-gray-50">{formatCurrencyShort(moyenne)}</td>
                        <td className="py-4 text-center border-b border-gray-50">
                          <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                            {percentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-4 text-right pr-4 border-b border-gray-50">
                          <Eye size={16} className="inline text-gray-300 group-hover:text-gray-600 transition-colors" />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">Aucune donnée</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sinistres - Timeline améliorée */}
        <div className="col-span-12 lg:col-span-6 bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-bold text-gray-700">Activité Sinistres</h3>
            <button 
              onClick={() => navigate('/sinistres')}
              className="text-xs font-bold text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              Voir tout <ArrowRight size={14} />
            </button>
          </div>

          {/* Stats rapides sinistres - grille 3 colonnes */}     
          <div className="grid grid-cols-3 gap-2 mb-5">
            <div 
              className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-3 text-center cursor-pointer hover:from-yellow-100 hover:to-amber-100 transition-all"
              onClick={() => navigate('/sinistres?statut=en_cours')}
            >
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mx-auto mb-2 shadow-sm">
                <Hourglass className="h-4 w-4 text-yellow-600" />
              </div>
              <p className="text-lg font-bold text-gray-900">{stats?.sinistres_en_cours || 0}</p>
              <p className="text-[10px] text-gray-500 font-medium">En cours</p>
            </div>
            <div 
              className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 text-center cursor-pointer hover:from-green-100 hover:to-emerald-100 transition-all"
              onClick={() => navigate('/sinistres?statut=paye')}
            >
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mx-auto mb-2 shadow-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-lg font-bold text-gray-900">{stats?.taux_reglement || 0}%</p>
              <p className="text-[10px] text-gray-500 font-medium">Réglés</p>
            </div>
            <div 
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 text-center cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-all"
              onClick={() => navigate('/sinistres?statut=en_attente')}
            >
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mx-auto mb-2 shadow-sm">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-lg font-bold text-gray-900">{(stats as any)?.sinistres_en_attente || 0}</p>
              <p className="text-[10px] text-gray-500 font-medium">En attente</p>
            </div>
          </div>

          {/* Séparateur */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-100"></div>
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Derniers sinistres</span>
            <div className="flex-1 h-px bg-gray-100"></div>
          </div>

          {/* Timeline sinistres */}
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {stats?.sinistres_recents && stats.sinistres_recents.length > 0 ? (
              stats.sinistres_recents.map((sinistre: SinistreRecent, index: number) => {
                const statutInfo = SINISTRE_STATUTS[sinistre.statut as keyof typeof SINISTRE_STATUTS] || SINISTRE_STATUTS.en_attente;
                const StatutIcon = statutInfo.icon;
                
                return (
                  <div 
                    key={sinistre.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group border border-transparent hover:border-gray-100"
                    onClick={() => navigate(`/sinistres/${sinistre.id}`)}
                  >
                    {/* Indicateur de timeline */}
                    <div className="flex flex-col items-center">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${statutInfo.color}`}>
                        <StatutIcon size={16} />
                      </div>
                      {index < (stats?.sinistres_recents?.length || 0) - 1 && (
                        <div className="w-0.5 h-3 bg-gray-100 mt-1"></div>
                      )}
                    </div>
                    
                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-900 truncate">{sinistre.type_sinistre}</p>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">{formatDate(sinistre.date_declaration)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 font-mono truncate">{sinistre.numero_police}</span>
                        <span className="text-gray-300">•</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${statutInfo.color}`}>
                          {statutInfo.label}
                        </span>
                      </div>
                    </div>
                    
                    <ArrowRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="h-7 w-7 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-400">Aucun sinistre récent</p>
                <p className="text-xs text-gray-300 mt-1">Les nouveaux sinistres apparaîtront ici</p>
              </div>
            )}
          </div>

          {/* Bouton voir tous les sinistres */}
          {stats?.sinistres_recents && stats.sinistres_recents.length > 0 && (
            <button 
              onClick={() => navigate('/sinistres')}
              className="w-full mt-4 py-3 bg-gray-900 hover:bg-gray-800 rounded-xl text-sm font-bold text-white transition-colors flex items-center justify-center gap-2"
            >
              Gérer les sinistres <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
