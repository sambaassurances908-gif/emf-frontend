// src/features/comptable/ComptableDashboard.tsx

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Wallet, 
  AlertTriangle, 
  TrendingUp,
  Download,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  Receipt,
  Banknote,
  AlertCircle,
  MoreHorizontal,
  Building2,
  ChevronDown,
  ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { comptableService } from '@/services/comptable.service';
import { formatCurrency, formatCurrencyShort } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';
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
  Area,
  AreaChart
} from 'recharts';

// Palette de couleurs
const GRAY_SHADES = ['#374151', '#4B5563', '#6B7280', '#9CA3AF', '#D1D5DB'];
const ACCENT_COLOR = '#10B981';
const EMF_COLORS: Record<string, string> = {
  'BAMBOO': '#10B981',
  'COFIDEC': '#6366F1',
  'BCEG': '#F59E0B',
  'EDG': '#EF4444',
  'SODEC': '#8B5CF6',
};

// Composant StatCard
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

// Custom tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-3 py-2 rounded-xl shadow-xl border border-gray-100 z-20">
        <div className="text-[10px] text-gray-400 font-bold mb-0.5">{payload[0].name || payload[0].payload?.name}</div>
        <div className="text-sm font-bold text-gray-900">
          {typeof payload[0].value === 'number' && payload[0].value > 1000 
            ? formatCurrencyShort(payload[0].value) 
            : payload[0].value}
        </div>
      </div>
    );
  }
  return null;
};

export const ComptableDashboard = () => {
  const navigate = useNavigate();
  const [periodFilter, setPeriodFilter] = useState('month');

  // Récupération du dashboard comptable
  const { 
    data: dashboardData, 
    isLoading: loadingComptable, 
    isError: errorComptable,
    refetch 
  } = useQuery({
    queryKey: ['comptable', 'dashboard'],
    queryFn: () => comptableService.getDashboard(),
    refetchInterval: 60000,
  });

  // Récupération des statistiques générales (comme le dashboard admin)
  const { data: statsData, isLoading: loadingStats } = useQuery({
    queryKey: ['dashboard-stats-comptable'],
    queryFn: async () => {
      const response = await api.get<{ data: any }>('/dashboard/statistiques');
      return response.data.data;
    },
  });

  // Récupération des quittances en attente
  const { data: quittancesData } = useQuery({
    queryKey: ['comptable', 'quittances-en-attente-preview'],
    queryFn: () => comptableService.getQuittancesEnAttente({ per_page: 5 }),
  });

  // Récupération des alertes
  const { data: alertesData } = useQuery({
    queryKey: ['comptable', 'alertes'],
    queryFn: () => comptableService.getAlertesDelais(),
  });

  const dashboard = dashboardData?.data;
  const stats = statsData;
  const quittancesRaw = quittancesData?.data as any;
  const quittances = Array.isArray(quittancesRaw) 
    ? quittancesRaw 
    : (quittancesRaw?.data || []);
  const alertes = alertesData?.data;

  // Construire données EMF à partir de details_par_type
  const emfDataFromDetails = useMemo(() => {
    const detailsParType = stats?.details_par_type;
    if (!detailsParType) return [];
    
    const emfMapping = [
      { key: 'bamboo_emf', id: 1, sigle: 'BAMBOO' },
      { key: 'cofidec', id: 2, sigle: 'COFIDEC' },
      { key: 'bceg', id: 3, sigle: 'BCEG' },
      { key: 'edg', id: 4, sigle: 'EDG' },
      { key: 'sodec', id: 5, sigle: 'SODEC' },
    ];
    
    return emfMapping.map(emf => ({
      emf_id: emf.id,
      sigle: emf.sigle,
      total: detailsParType[emf.key]?.total || 0,
      montant_total: parseFloat(detailsParType[emf.key]?.montant_total) || 0,
      prime_collectee: parseFloat(detailsParType[emf.key]?.prime_collectee || detailsParType[emf.key]?.primes_collectees) || 0,
      cotisation_totale_ttc: parseFloat(detailsParType[emf.key]?.cotisation_totale_ttc) || 0,
    }));
  }, [stats]);

  // Données pour le camembert des cotisations par EMF
  const cotisationsPieData = useMemo(() => {
    return emfDataFromDetails.map((emf) => ({
      name: emf.sigle,
      value: emf.cotisation_totale_ttc,
      fill: EMF_COLORS[emf.sigle] || GRAY_SHADES[emf.emf_id % GRAY_SHADES.length]
    })).filter(d => d.value > 0);
  }, [emfDataFromDetails]);

  // Données pour le bar chart des cotisations par EMF
  const cotisationsBarData = useMemo(() => {
    return emfDataFromDetails.map((emf, index) => ({
      name: emf.sigle,
      cotisations: emf.cotisation_totale_ttc,
      primes: emf.prime_collectee,
      fill: EMF_COLORS[emf.sigle] || GRAY_SHADES[index % GRAY_SHADES.length]
    })).sort((a, b) => b.cotisations - a.cotisations);
  }, [emfDataFromDetails]);

  // Données évolution mensuelle
  const evolutionData = stats?.evolution_contrats?.map((item: any, index: number, arr: any[]) => ({
    name: item.mois || `Mois ${index + 1}`,
    contrats: item.total || 0,
    isHighlight: index === arr.length - 1
  })) || [];

  // Total cotisations
  const totalCotisations = emfDataFromDetails.reduce((acc, emf) => acc + emf.cotisation_totale_ttc, 0);
  const totalPrimes = emfDataFromDetails.reduce((acc, emf) => acc + emf.prime_collectee, 0);

  // Export CSV
  const handleExport = async () => {
    try {
      await comptableService.downloadExport({ format: 'csv' });
      toast.success('Export téléchargé avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    }
  };

  const isLoading = loadingComptable || loadingStats;
  const isError = errorComptable;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={<AlertTriangle className="h-12 w-12" />}
        title="Erreur de chargement"
        description="Impossible de charger le tableau de bord"
        action={
          <Button onClick={() => refetch()}>Réessayer</Button>
        }
      />
    );
  }

  const quittancesUrgentes = alertes?.urgentes?.length || 0;

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord Comptable</h1>
          <p className="text-sm text-gray-400 mt-1">
            Suivi financier et cotisations par EMF
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Dropdown
            label="Période"
            value={periodFilter}
            onChange={(v) => setPeriodFilter(v)}
            options={[
              { value: 'week', label: 'Cette semaine' },
              { value: 'month', label: 'Ce mois' },
              { value: 'quarter', label: 'Ce trimestre' },
              { value: 'year', label: 'Cette année' },
            ]}
          />
          <Button variant="outline" onClick={() => refetch()} size="sm">
            <RefreshCw size={16} className="mr-2" />
            Actualiser
          </Button>
          <Button variant="outline" onClick={handleExport} size="sm">
            <Download size={16} className="mr-2" />
            Exporter
          </Button>
        </div>
      </header>

      {/* Alertes urgentes */}
      {quittancesUrgentes > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-3xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                <AlertTriangle className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-red-800">
                  {quittancesUrgentes} quittance{quittancesUrgentes > 1 ? 's' : ''} en retard
                </h3>
                <p className="text-sm text-red-600">Action requise</p>
              </div>
            </div>
            <Link to="/comptable/quittances">
              <Button className="bg-red-600 hover:bg-red-700">
                Voir <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Row 1: Portefeuille & Évolution */}
        <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50 flex flex-col justify-between h-[320px]">
          <div className="flex justify-between items-start">
            <span className="font-bold text-gray-700">Cotisations Totales</span>
            <MoreHorizontal size={20} className="text-gray-300" />
          </div>
          
          <div>
            <div className="text-4xl font-extrabold text-gray-900 mb-4">
              {formatCurrencyShort(totalCotisations)}
            </div>
            <div className="flex items-center gap-2 mb-6">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              <span className="text-sm font-bold text-green-600">Collectées</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Primes collectées:</span>
              <span className="font-bold text-emerald-600">{formatCurrencyShort(totalPrimes)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">EMF partenaires:</span>
              <span className="font-bold text-gray-900">{emfDataFromDetails.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Contrats actifs:</span>
              <span className="font-bold text-gray-900">{stats?.contrats_actifs || 0}</span>
            </div>
          </div>
        </div>

        {/* Évolution des contrats */}
        <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50 h-[320px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-700">Évolution des Contrats</h3>
            <MoreHorizontal size={20} className="text-gray-300" />
          </div>

          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolutionData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorContrats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={ACCENT_COLOR} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={ACCENT_COLOR} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#D1D5DB' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="contrats" stroke={ACCENT_COLOR} fill="url(#colorContrats)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 2: Stats Cards */}
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <StatCard 
            title="Quittances à payer" 
            amount={String(dashboard?.resume?.quittances_a_payer || 0)} 
            icon={Receipt}
            onClick={() => navigate('/comptable/quittances')}
          />
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <StatCard 
            title="Sinistres déclarés" 
            amount={String(stats?.sinistres_en_cours || 0)} 
            percent="3.1" 
            isPositive={false}
            icon={AlertCircle}
          />
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <StatCard 
            title="Montant à payer" 
            amount={formatCurrencyShort(dashboard?.resume?.montant_total_a_payer || 0)}
            icon={Wallet}
          />
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <StatCard 
            title="Taux règlement" 
            amount={`${stats?.taux_reglement || 0}%`}
            percent="5.4"
            isPositive={true}
            icon={CheckCircle2}
          />
        </div>

        {/* Row 3: Cotisations par EMF (Bar) & Camembert */}
        <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-700">Cotisations collectées par EMF</h3>
            <MoreHorizontal size={20} className="text-gray-300" />
          </div>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cotisationsBarData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280', fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#D1D5DB' }} tickFormatter={(value) => formatCurrencyShort(value)} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white px-4 py-3 rounded-xl shadow-xl border border-gray-100">
                          <p className="text-sm font-bold text-gray-900 mb-1">{payload[0].payload.name}</p>
                          <p className="text-xs text-emerald-600">Cotisations: {formatCurrency(payload[0].payload.cotisations)}</p>
                          <p className="text-xs text-gray-500">Primes: {formatCurrency(payload[0].payload.primes)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="cotisations" radius={[8, 8, 0, 0]} maxBarSize={50}>
                  {cotisationsBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Camembert répartition cotisations */}
        <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-700">Répartition par EMF</h3>
            <MoreHorizontal size={20} className="text-gray-300" />
          </div>
          
          {cotisationsPieData.length > 0 ? (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={cotisationsPieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {cotisationsPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const percent = totalCotisations > 0 
                          ? ((payload[0].value as number) / totalCotisations * 100).toFixed(1) 
                          : 0;
                        return (
                          <div className="bg-white px-3 py-2 rounded-xl shadow-xl border border-gray-100">
                            <p className="text-sm font-bold">{payload[0].name}</p>
                            <p className="text-xs text-emerald-600">{formatCurrency(payload[0].value as number)}</p>
                            <p className="text-xs text-gray-400">{percent}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
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

        {/* Row 4: Performance EMF détaillée */}
        <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-700">Performance par EMF</h3>
            <MoreHorizontal size={20} className="text-gray-300" />
          </div>

          <div className="space-y-4">
            {emfDataFromDetails.length > 0 ? (
              emfDataFromDetails.sort((a, b) => b.cotisation_totale_ttc - a.cotisation_totale_ttc).map((emf, index) => {
                const percentage = totalCotisations > 0 
                  ? (emf.cotisation_totale_ttc / totalCotisations * 100)
                  : 0;
                
                return (
                  <div 
                    key={emf.emf_id} 
                    className="group cursor-pointer p-3 -mx-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: EMF_COLORS[emf.sigle] || GRAY_SHADES[index % GRAY_SHADES.length] }}
                        >
                          {emf.sigle.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 text-sm">{emf.sigle}</span>
                          <span className="text-xs text-gray-400 ml-2">{emf.total} contrats</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-bold text-emerald-600">{formatCurrencyShort(emf.cotisation_totale_ttc)}</span>
                          <span className="text-xs text-gray-400 ml-2">{percentage.toFixed(1)}%</span>
                        </div>
                        <ArrowRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: EMF_COLORS[emf.sigle] || ACCENT_COLOR
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

        {/* Quittances en attente */}
        <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-700">Quittances à payer</h3>
            <Link to="/comptable/quittances">
              <Button variant="ghost" size="sm">
                Voir tout <ArrowRight size={14} className="ml-1" />
              </Button>
            </Link>
          </div>

          {quittances.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Tout est payé !</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {quittances.slice(0, 5).map((quittance: any) => (
                <div 
                  key={quittance.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Receipt size={14} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{quittance.reference}</p>
                      <p className="text-xs text-gray-500">{quittance.beneficiaire}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{formatCurrencyShort(quittance.montant)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Link to="/comptable/quittances" className="block mt-4">
            <Button variant="outline" className="w-full">
              Gérer les quittances
            </Button>
          </Link>
        </div>

        {/* Row 5: Accès rapides */}
        <div className="col-span-12 bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-700">Accès Rapides</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/comptable/quittances" className="block">
              <div className="text-center p-6 bg-emerald-50 rounded-2xl cursor-pointer hover:bg-emerald-100 transition-colors">
                <Receipt className="h-8 w-8 text-emerald-600 mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-900">Quittances</p>
                <p className="text-xs text-gray-500 mt-1">Gérer les paiements</p>
              </div>
            </Link>

            <Link to="/comptable/historique" className="block">
              <div className="text-center p-6 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors">
                <Banknote className="h-8 w-8 text-gray-600 mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-900">Historique</p>
                <p className="text-xs text-gray-500 mt-1">Paiements effectués</p>
              </div>
            </Link>

            <Link to="/comptable/rapport" className="block">
              <div className="text-center p-6 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors">
                <TrendingUp className="h-8 w-8 text-gray-600 mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-900">Rapports</p>
                <p className="text-xs text-gray-500 mt-1">Rapports financiers</p>
              </div>
            </Link>

            <div className="text-center p-6 bg-gray-50 rounded-2xl">
              <Building2 className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-900">{emfDataFromDetails.length}</p>
              <p className="text-xs text-gray-500 mt-1">EMF partenaires</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComptableDashboard;
