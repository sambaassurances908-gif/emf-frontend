import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { 
  ArrowLeft, Edit, Building2, Phone, Mail, MapPin,
  FileText, DollarSign, Clock, TrendingUp, Users
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { emfService } from '@/services/emf.service';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface EmfUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export const EmfDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: emfResponse, isLoading } = useQuery({
    queryKey: ['emf', id],
    queryFn: async () => {
      return await emfService.getById(Number(id));
    },
  });

  const { data: statsResponse } = useQuery({
    queryKey: ['emf-stats', id],
    queryFn: async () => {
      return await emfService.getStats(Number(id));
    },
    enabled: !!id,
  });

  const emf = emfResponse?.data;
  const stats = statsResponse?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Chargement..." />
      </div>
    );
  }

  if (!emf) {
    return <div>EMF non trouvé</div>;
  }

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      actif: 'bg-green-100 text-green-800',
      inactif: 'bg-gray-100 text-gray-800',
      suspendu: 'bg-orange-100 text-orange-800',
    };
    return colors[statut] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/emfs')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{emf.sigle}</h1>
              <p className="text-gray-600 mt-1">{emf.raison_sociale}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatutColor(emf.statut)}>
            {emf.statut}
          </Badge>
          <Button onClick={() => navigate(`/emfs/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Contrats Actifs</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.contrats_actifs}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Montant Total Assuré</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {formatCurrency(stats.montant_total_assure)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Sinistres en Cours</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">
                    {stats.sinistres_en_cours}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Taux Sinistres</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.taux_sinistralite.toFixed(2)}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Informations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coordonnées */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informations de Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Adresse</p>
                <p className="font-medium text-gray-900">
                  {emf.adresse}, {emf.ville}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Phone className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Téléphone</p>
                <p className="font-medium text-gray-900">{emf.telephone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Mail className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{emf.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Limites */}
        <Card>
          <CardHeader>
            <CardTitle>Limites de Couverture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Montant max prêt</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(emf.montant_max_pret)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Durée max prêt</p>
              <p className="text-lg font-bold text-gray-900">
                {emf.duree_max_pret_mois} mois
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Taux commission</p>
              <p className="text-lg font-bold text-gray-900">
                {emf.taux_commission}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphique évolution */}
      {stats?.evolution && stats.evolution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Évolution des Contrats</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.evolution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mois" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="nouveaux" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Nouveaux contrats"
                />
                <Line 
                  type="monotone" 
                  dataKey="actifs" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Contrats actifs"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Utilisateurs */}
      {stats?.utilisateurs && stats.utilisateurs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs Associés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.utilisateurs.map((user: EmfUser) => (
                <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">{user.role}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
