// src/features/dashboard/DashboardPage.tsx
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
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
  CartesianGrid
} from 'recharts';

// Palette minimaliste - gris et une couleur d'accent
const GRAY_SHADES = ['#374151', '#4B5563', '#6B7280', '#9CA3AF', '#D1D5DB'];
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
  const emfPieData = emfDataFromDetails.map((emf: EmfStats, index: number) => ({
    name: emf.emf?.sigle || 'Inconnu',
    value: emf.total,
    montant: emf.montant_total,
    fill: GRAY_SHADES[index % GRAY_SHADES.length]
  }));

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

        {/* Row 3: Performance EMF & Par Agence */}
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
                
                return (
                  <div 
                    key={emf.emf_id} 
                    className="group cursor-pointer p-3 -mx-3 rounded-xl hover:bg-gray-50 transition-colors"
                    onClick={() => navigate(emfSlug ? `/dashboard/${emfSlug}` : `/contrats?emf_id=${emf.emf_id}`)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: GRAY_SHADES[index % GRAY_SHADES.length] }}
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
                          <span className="font-bold text-emerald-600">{formatCurrencyShort(emf.cotisation_totale_ttc || 0)}</span>
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
                          backgroundColor: index === 0 ? ACCENT_COLOR : GRAY_SHADES[index % GRAY_SHADES.length]
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
                    {emfPieData.map((_entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={GRAY_SHADES[index % GRAY_SHADES.length]} />
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
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: GRAY_SHADES[index % GRAY_SHADES.length] }}
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

        {/* Row 5: KPIs */}
        <div className="col-span-12 bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-700">Indicateurs Clés</h3>
            <MoreHorizontal size={20} className="text-gray-300" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div 
              className="text-center p-6 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => navigate('/statistiques')}
            >
              <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-gray-900">
                {tauxCroissance > 0 ? '+' : ''}{tauxCroissance.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-1 font-medium">Croissance</p>
            </div>

            <div 
              className="text-center p-6 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => navigate('/contrats?statut=en_attente')}
            >
              <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-gray-900">{stats?.contrats_en_attente || 0}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">En Attente</p>
            </div>

            <div 
              className="text-center p-6 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => navigate('/contrats?statut=expire')}
            >
              <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-gray-900">{stats?.contrats_expires_mois || 0}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">Expirés ce Mois</p>
            </div>

            <div 
              className="text-center p-6 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => navigate('/statistiques')}
            >
              <Wallet className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-gray-900">{formatCurrencyShort(stats?.prime_totale_collectee || 0)}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">Primes</p>
            </div>
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
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                              style={{ backgroundColor: GRAY_SHADES[index % GRAY_SHADES.length] }}
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

        {/* Row 7: Contrats Récents & Sinistres */}
        <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-700">Contrats Récents</h3>
            <button 
              onClick={() => navigate('/contrats')}
              className="text-xs font-bold text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              Voir tout <ArrowRight size={14} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100">
                  <th className="font-medium py-3">N° Police</th>
                  <th className="font-medium py-3">Client</th>
                  <th className="font-medium py-3">EMF</th>
                  <th className="font-medium py-3 text-right">Montant</th>
                  <th className="font-medium py-3 text-right">Prime</th>
                  <th className="font-medium py-3 text-center">Statut</th>
                  <th className="font-medium py-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {stats?.contrats_recents && stats.contrats_recents.length > 0 ? (
                  stats.contrats_recents.slice(0, 5).map((contrat: any, index: number) => (
                    <tr 
                      key={`contrat-${contrat.id}-${index}`} 
                      className="hover:bg-gray-50 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/contrats/${contrat.id}`)}
                    >
                      <td className="py-3 border-b border-gray-50 font-mono text-xs text-gray-600">{contrat.numero_police}</td>
                      <td className="py-3 border-b border-gray-50 font-medium text-gray-900">{contrat.nom_prenom}</td>
                      <td className="py-3 border-b border-gray-50 text-gray-500">{contrat.emf?.sigle || 'N/A'}</td>
                      <td className="py-3 border-b border-gray-50 text-right font-semibold text-gray-900">{formatCurrency(contrat.montant_pret_assure)}</td>
                      <td className="py-3 border-b border-gray-50 text-right font-semibold text-emerald-600">{formatCurrency(contrat.cotisation_totale_ttc || contrat.prime_collectee || 0)}</td>
                      <td className="py-3 border-b border-gray-50 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                          contrat.statut === 'actif' ? 'bg-green-100 text-green-700' :
                          contrat.statut === 'en_attente' ? 'bg-yellow-100 text-yellow-700' :
                          contrat.statut === 'expire' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {contrat.statut}
                        </span>
                      </td>
                      <td className="py-3 border-b border-gray-50 text-right text-gray-400 text-xs">{formatDate(contrat.created_at)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">Aucun contrat récent</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sinistres - Timeline */}
        <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-700">Activité Sinistres</h3>
            <button 
              onClick={() => navigate('/sinistres')}
              className="text-xs font-bold text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              Voir tout <ArrowRight size={14} />
            </button>
          </div>

          {/* Stats rapides sinistres */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div 
              className="bg-yellow-50 rounded-xl p-3 text-center cursor-pointer hover:bg-yellow-100 transition-colors"
              onClick={() => navigate('/sinistres?statut=en_cours')}
            >
              <Hourglass className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-yellow-700">{stats?.sinistres_en_cours || 0}</p>
              <p className="text-[10px] text-yellow-600 font-medium">En cours</p>
            </div>
            <div 
              className="bg-green-50 rounded-xl p-3 text-center cursor-pointer hover:bg-green-100 transition-colors"
              onClick={() => navigate('/sinistres?statut=paye')}
            >
              <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-green-700">{stats?.taux_reglement || 0}%</p>
              <p className="text-[10px] text-green-600 font-medium">Réglés</p>
            </div>
          </div>

          {/* Timeline sinistres */}
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {stats?.sinistres_recents && stats.sinistres_recents.length > 0 ? (
              stats.sinistres_recents.map((sinistre: SinistreRecent) => {
                const statutInfo = SINISTRE_STATUTS[sinistre.statut as keyof typeof SINISTRE_STATUTS] || SINISTRE_STATUTS.en_attente;
                const StatutIcon = statutInfo.icon;
                
                return (
                  <div 
                    key={sinistre.id}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/sinistres/${sinistre.id}`)}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${statutInfo.color}`}>
                      <StatutIcon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900 truncate">{sinistre.type_sinistre}</p>
                        <ArrowRight size={12} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-xs text-gray-500 truncate">{sinistre.numero_police}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${statutInfo.color}`}>
                          {statutInfo.label}
                        </span>
                        <span className="text-[10px] text-gray-400">{formatDate(sinistre.date_declaration)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Aucun sinistre récent</p>
              </div>
            )}
          </div>

          {/* Bouton voir tous les sinistres */}
          {stats?.sinistres_recents && stats.sinistres_recents.length > 0 && (
            <button 
              onClick={() => navigate('/sinistres')}
              className="w-full mt-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              Voir tous les sinistres <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
