// src/features/fpdg/FpdgStatistiquesPage.tsx

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, 
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  Users,
  Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { formatCurrency, formatCurrencyShort } from '@/lib/utils';
import api from '@/lib/api';
import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line
} from 'recharts';

const EMF_COLORS: Record<string, string> = {
  'BAMBOO': '#10B981',
  'COFIDEC': '#6366F1',
  'BCEG': '#F59E0B',
  'EDG': '#EF4444',
  'SODEC': '#8B5CF6',
};

export const FpdgStatistiquesPage = () => {
  const { data: statsData, isLoading, refetch } = useQuery({
    queryKey: ['fpdg-statistiques'],
    queryFn: async () => {
      const response = await api.get<{ data: any }>('/dashboard/statistiques');
      return response.data.data;
    },
  });

  const stats = statsData;

  // Données EMF
  const emfData = useMemo(() => {
    const detailsParType = stats?.details_par_type;
    if (!detailsParType) return [];
    
    const mapping = [
      { key: 'bamboo_emf', sigle: 'BAMBOO' },
      { key: 'cofidec', sigle: 'COFIDEC' },
      { key: 'bceg', sigle: 'BCEG' },
      { key: 'edg', sigle: 'EDG' },
      { key: 'sodec', sigle: 'SODEC' },
    ];

    return mapping.map(emf => ({
      sigle: emf.sigle,
      contrats: detailsParType[emf.key]?.total || 0,
      sinistres: detailsParType[emf.key]?.sinistres_en_cours || 0,
      cotisations: parseFloat(detailsParType[emf.key]?.cotisation_totale_ttc) || 0,
      primes: parseFloat(detailsParType[emf.key]?.prime_collectee || detailsParType[emf.key]?.primes_collectees) || 0,
      fill: EMF_COLORS[emf.sigle]
    })).filter(emf => emf.contrats > 0);
  }, [stats]);

  // Données évolution
  const evolutionData = stats?.evolution_contrats?.map((item: any, index: number) => ({
    name: item.mois || `M${index + 1}`,
    contrats: item.total || 0,
    sinistres: item.sinistres || 0,
  })) || [];

  // Données pour camembert cotisations
  const cotisationsPieData = emfData.map(emf => ({
    name: emf.sigle,
    value: emf.cotisations,
    fill: emf.fill
  }));

  const totalCotisations = emfData.reduce((acc, emf) => acc + emf.cotisations, 0);
  const totalContrats = emfData.reduce((acc, emf) => acc + emf.contrats, 0);
  const totalSinistres = emfData.reduce((acc, emf) => acc + emf.sinistres, 0);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="text-amber-500" />
            Statistiques Détaillées
          </h1>
          <p className="text-gray-600">Indicateurs clés de performance</p>
        </div>
        <Button variant="outline" onClick={() => refetch()} size="sm">
          <RefreshCw size={16} className="mr-2" />
          Actualiser
        </Button>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-soft border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="text-blue-600" size={20} />
            </div>
          </div>
          <p className="text-sm text-gray-500">Contrats actifs</p>
          <p className="text-2xl font-bold text-gray-900">{totalContrats}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-soft border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="text-red-600" size={20} />
            </div>
          </div>
          <p className="text-sm text-gray-500">Sinistres en cours</p>
          <p className="text-2xl font-bold text-gray-900">{totalSinistres}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-soft border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Wallet className="text-amber-600" size={20} />
            </div>
          </div>
          <p className="text-sm text-gray-500">Cotisations</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrencyShort(totalCotisations)}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-soft border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-emerald-600" size={20} />
            </div>
          </div>
          <p className="text-sm text-gray-500">Taux règlement</p>
          <p className="text-2xl font-bold text-emerald-600">{stats?.taux_reglement || 0}%</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Évolution temporelle */}
        <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
          <h3 className="font-bold text-gray-700 mb-6">Évolution mensuelle</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolutionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="contrats" name="Contrats" stroke="#F59E0B" strokeWidth={2} dot={{ fill: '#F59E0B' }} />
                <Line type="monotone" dataKey="sinistres" name="Sinistres" stroke="#EF4444" strokeWidth={2} dot={{ fill: '#EF4444' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Répartition cotisations */}
        <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
          <h3 className="font-bold text-gray-700 mb-6">Répartition Cotisations</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={cotisationsPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
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
                          <p className="text-xs text-amber-600">{formatCurrency(payload[0].value as number)}</p>
                          <p className="text-xs text-gray-400">{percent}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          {/* Légende */}
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {cotisationsPieData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.fill }} />
                <span className="text-xs text-gray-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Comparaison par EMF */}
        <div className="col-span-12 bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
          <h3 className="font-bold text-gray-700 mb-6">Performance par EMF</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={emfData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="sigle" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white px-4 py-3 rounded-xl shadow-xl border border-gray-100">
                          <p className="text-sm font-bold text-gray-900 mb-2">{label}</p>
                          {payload.map((p: any) => (
                            <p key={p.dataKey} className="text-xs" style={{ color: p.color }}>
                              {p.name}: {p.dataKey === 'cotisations' ? formatCurrency(p.value) : p.value}
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar dataKey="contrats" name="Contrats" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                <Bar dataKey="sinistres" name="Sinistres" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tableau récapitulatif */}
        <div className="col-span-12 bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
          <h3 className="font-bold text-gray-700 mb-6">Récapitulatif par EMF</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">EMF</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Contrats</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Sinistres</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Cotisations</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Primes</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Ratio S/C</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {emfData.map((emf) => (
                  <tr key={emf.sigle} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: emf.fill }} />
                        <span className="font-semibold text-gray-900">{emf.sigle}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">{emf.contrats}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={emf.sinistres > 0 ? 'text-red-600 font-medium' : 'text-gray-500'}>
                        {emf.sinistres}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-amber-600">{formatCurrency(emf.cotisations)}</td>
                    <td className="px-6 py-4 text-right font-medium text-emerald-600">{formatCurrency(emf.primes)}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        emf.contrats > 0 && (emf.sinistres / emf.contrats) > 0.1 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {emf.contrats > 0 ? ((emf.sinistres / emf.contrats) * 100).toFixed(1) : 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-semibold">
                <tr>
                  <td className="px-6 py-4 text-gray-900">TOTAL</td>
                  <td className="px-6 py-4 text-right text-gray-900">{totalContrats}</td>
                  <td className="px-6 py-4 text-right text-red-600">{totalSinistres}</td>
                  <td className="px-6 py-4 text-right text-amber-600">{formatCurrency(totalCotisations)}</td>
                  <td className="px-6 py-4 text-right text-emerald-600">
                    {formatCurrency(emfData.reduce((acc, emf) => acc + emf.primes, 0))}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">
                      {totalContrats > 0 ? ((totalSinistres / totalContrats) * 100).toFixed(1) : 0}%
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FpdgStatistiquesPage;
