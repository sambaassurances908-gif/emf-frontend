import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Select } from '@/components/ui/Select';
import { FileText, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieLabelRenderProps
} from 'recharts';
import api from '@/lib/api';
import { useState } from 'react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface EvolutionContrat {
  mois: string;
  nouveaux: number;
  actifs: number;
  resilies: number;
}

interface EmfData {
  id: number;
  emf_sigle: string;
  total: number;
  [key: string]: string | number; // Index signature pour Recharts
}

interface TypeContrat {
  type: string;
  nombre: number;
  montant_total: number;
}

interface SinistreParType {
  type: string;
  nombre: number;
  montant_total: number;
}

interface TopEmf {
  id: number;
  sigle: string;
  total_contrats: number;
  montant_total: number;
}

interface ActiviteRecente {
  id: number;
  description: string;
  user_name: string;
  date: string;
}

interface StatistiquesData {
  contrats_actifs: number;
  croissance_contrats: number;
  montant_total_assure: number;
  croissance_montant: number;
  sinistres_en_cours: number;
  sinistres_en_attente: number;
  taux_reglement: number;
  delai_moyen_reglement: number;
  evolution_contrats: EvolutionContrat[];
  par_emf: EmfData[];
  par_type: TypeContrat[];
  sinistres_par_type: SinistreParType[];
  taux_validation: number;
  delai_moyen_traitement: number;
  taux_sinistralite: number;
  nombre_sinistres: number;
  top_emfs: TopEmf[];
  activites_recentes: ActiviteRecente[];
}

export const StatistiquesPage = () => {
  const [periode, setPeriode] = useState('30');

  const { data: stats, isLoading } = useQuery<StatistiquesData>({
    queryKey: ['statistiques-globales', periode],
    queryFn: async () => {
      const response = await api.get('/statistiques/globales', {
        params: { periode },
      });
      return response.data.data;
    },
  });

  // Custom label pour le PieChart
  const renderCustomLabel = (props: PieLabelRenderProps) => {
    const { name, percent } = props;
    if (!name || percent === undefined) return '';
    return `${name} ${(percent * 100).toFixed(0)}%`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Chargement des statistiques..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Statistiques</h1>
          <p className="text-gray-600 mt-1">
            Vue d'ensemble de l'activité
          </p>
        </div>
        <Select
          value={periode}
          onChange={(e) => setPeriode(e.target.value)}
          options={[
            { value: '7', label: '7 derniers jours' },
            { value: '30', label: '30 derniers jours' },
            { value: '90', label: '3 derniers mois' },
            { value: '365', label: '12 derniers mois' },
          ]}
          className="w-48"
        />
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Contrats Actifs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.contrats_actifs || 0}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  +{stats?.croissance_contrats || 0}% vs période précédente
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Montant Total Assuré</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(stats?.montant_total_assure || 0)}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  +{stats?.croissance_montant || 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sinistres en Cours</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">
                  {stats?.sinistres_en_cours || 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {stats?.sinistres_en_attente || 0} en attente
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taux de Règlement</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.taux_reglement || 0}%
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Délai moyen: {stats?.delai_moyen_reglement || 0}j
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution des contrats */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution des Contrats</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.evolution_contrats || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mois" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="nouveaux" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Nouveaux"
                />
                <Line 
                  type="monotone" 
                  dataKey="actifs" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Actifs"
                />
                <Line 
                  type="monotone" 
                  dataKey="resilies" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Résiliés"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition par EMF */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par EMF/Banque</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats?.par_emf || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total"
                  nameKey="emf_sigle"
                >
                  {(stats?.par_emf || []).map((entry: EmfData, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Types de contrats */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition par Type de Contrat</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.par_type || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="nombre" fill="#3b82f6" name="Nombre de contrats" />
              <Bar dataKey="montant_total" fill="#10b981" name="Montant total (millions)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Statistiques des sinistres */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Par type de sinistre */}
        <Card>
          <CardHeader>
            <CardTitle>Sinistres par Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(stats?.sinistres_par_type || []).map((item: SinistreParType) => (
                <div key={item.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.type}</p>
                      <p className="text-sm text-gray-500">{item.nombre} sinistres</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(item.montant_total)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-green-700">Taux de validation</p>
                <p className="text-2xl font-bold text-green-900">
                  {stats?.taux_validation || 0}%
                </p>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${stats?.taux_validation || 0}%` }}
                />
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-blue-700">Délai moyen de traitement</p>
                <p className="text-2xl font-bold text-blue-900">
                  {stats?.delai_moyen_traitement || 0}j
                </p>
              </div>
              <p className="text-xs text-blue-600">
                Objectif: 15 jours maximum
              </p>
            </div>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-purple-700">Taux de sinistralité</p>
                <p className="text-2xl font-bold text-purple-900">
                  {stats?.taux_sinistralite || 0}%
                </p>
              </div>
              <p className="text-xs text-purple-600">
                {stats?.nombre_sinistres || 0} sinistres sur {stats?.contrats_actifs || 0} contrats
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top EMFs */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 EMFs par Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(stats?.top_emfs || []).map((emf: TopEmf, index: number) => (
                <div key={emf.id} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{emf.sigle}</p>
                    <p className="text-sm text-gray-500">{emf.total_contrats} contrats</p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(emf.montant_total)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dernières activités */}
        <Card>
          <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(stats?.activites_recentes || []).map((activite: ActiviteRecente) => (
                <div key={activite.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activite.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activite.user_name} • {activite.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
