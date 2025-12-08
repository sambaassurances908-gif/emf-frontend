// src/features/dashboard/DashboardPage.tsx
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { 
  FileText, 
  AlertCircle, 
  DollarSign, 
  CheckCircle, 
  Building2, 
  TrendingUp,
  Users,
  Calendar,
  AlertTriangle,
  Activity,
  PieChart,
  BarChart3,
  MapPin,
  Briefcase,
  UserCheck,
  User,
  UserCircle2
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { StatsCard } from './components/StatsCard';
import { ContratChart } from './components/ContratChart';
import { RecentContracts } from './components/RecentContracts';
import { SinistresWidget } from './components/SinistresWidget';
import api from '@/lib/api';
import { DashboardStats, EmfStats } from '@/types/dashboard.types';

export const DashboardPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // ✅ Redirection si l'utilisateur a un emf_id (pas superadmin)
  useEffect(() => {
    if (user?.emf_id) {
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
    enabled: !user?.emf_id,
  });

  if (user?.emf_id) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-white">
        <LoadingSpinner size="lg" text="Redirection..." />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-white">
        <LoadingSpinner size="lg" text="Chargement du tableau de bord..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center text-red-600 bg-red-50 rounded-lg mx-6 mt-6">
        <h2 className="text-lg font-semibold">Une erreur est survenue</h2>
        <p className="mt-2">Impossible de charger les données du tableau de bord.</p>
        <p className="text-sm mt-1 text-red-400">{(error as Error).message}</p>
      </div>
    );
  }

  // Calculs additionnels pour statistiques avancées
  const tauxCroissance = stats?.evolution_contrats && stats.evolution_contrats.length > 1
    ? ((stats.evolution_contrats[stats.evolution_contrats.length - 1]?.total || 0) - 
       (stats.evolution_contrats[stats.evolution_contrats.length - 2]?.total || 0)) / 
       (stats.evolution_contrats[stats.evolution_contrats.length - 2]?.total || 1) * 100
    : 0;

  const montantMoyenParContrat = stats?.contrats_actifs 
    ? (stats.montant_total_assure || 0) / stats.contrats_actifs 
    : 0;

  const tauxSinistralite = stats?.contrats_actifs
    ? ((stats?.sinistres_en_cours || 0) / stats.contrats_actifs) * 100
    : 0;

  // ✅ Données de localisation depuis l'API
  const localisations = stats?.par_localisation || [];
  const totalLocalisations = localisations.reduce((acc: number, loc: any) => acc + loc.nombre, 0);

  // ✅ Données catégories socio-professionnelles depuis l'API
  const categoriesSocioPro = stats?.par_categorie_socio_pro || [];
  const totalCategories = categoriesSocioPro.reduce((acc: number, cat: any) => acc + cat.nombre, 0);

  // ✅ Données de genre depuis l'API (basées sur les prénoms)
  const genreStats = stats?.par_genre || {
    hommes: 0,
    femmes: 0,
    non_determine: 0,
  };
  const totalGenre = genreStats.hommes + genreStats.femmes + genreStats.non_determine;

  // Couleurs pour les catégories socio-pro
  const couleursCategories: Record<string, string> = {
    commercants: 'bg-blue-500',
    'commerçants': 'bg-blue-500',
    salaries_prive: 'bg-green-500',
    'salariés secteur privé': 'bg-green-500',
    salaries_public: 'bg-purple-500',
    'salariés secteur public': 'bg-purple-500',
    retraites: 'bg-orange-500',
    'retraités': 'bg-orange-500',
    autre: 'bg-gray-500',
    autres: 'bg-gray-500',
  };

  const getCouleurCategorie = (categorie: string): string => {
    const key = categorie.toLowerCase().replace(/[éè]/g, 'e');
    return couleursCategories[key] || 'bg-indigo-500';
  };

  return (
    <div className="space-y-6 p-6 min-h-screen bg-white">
      {/* Header avec badge superadmin */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Tableau de bord Global
            </h1>
            <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold rounded-full">
              SUPERADMIN
            </span>
          </div>
          <p className="text-gray-600 mt-2 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Vue d'ensemble du service technique micro-assurance - Bonjour {user?.name}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Dernière mise à jour</p>
          <p className="text-sm font-medium text-gray-700">{new Date().toLocaleString('fr-FR')}</p>
        </div>
      </div>

      {/* Stats Grid Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Contrats Actifs"
          value={stats?.contrats_actifs || 0}
          icon={FileText}
          trend={{ value: Math.abs(tauxCroissance), isPositive: tauxCroissance > 0 }}
          color="blue"
        />
        <StatsCard
          title="Montant Total Assuré"
          value={formatCurrency(stats?.montant_total_assure || 0)}
          icon={DollarSign}
          trend={{ value: 8, isPositive: true }}
          color="green"
        />
        <StatsCard
          title="Sinistres en Cours"
          value={stats?.sinistres_en_cours || 0}
          icon={AlertCircle}
          trend={{ value: 3, isPositive: false }}
          color="orange"
        />
        <StatsCard
          title="Taux de Règlement"
          value={`${stats?.taux_reglement || 0}%`}
          icon={CheckCircle}
          trend={{ value: 5, isPositive: true }}
          color="purple"
        />
      </div>

      {/* Stats Grid Avancées - Service Technique */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-blue-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Montant Moyen / Contrat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-700">
              {formatCurrency(montantMoyenParContrat)}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Moyenne calculée sur {stats?.contrats_actifs || 0} contrats actifs
            </p>
          </CardContent>
        </Card>

        <Card className="border border-amber-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Taux de Sinistralité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-700">
              {tauxSinistralite.toFixed(2)}%
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {stats?.sinistres_en_cours || 0} sinistres sur {stats?.contrats_actifs || 0} contrats
            </p>
          </CardContent>
        </Card>

        <Card className="border border-purple-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              EMF Partenaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-700">
              {stats?.par_emf?.length || 0}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Institutions actives dans le réseau
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section Indicateurs de Performance */}
      <Card className="border-2 border-indigo-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="flex items-center gap-2 text-indigo-900">
            <BarChart3 className="h-5 w-5" />
            Indicateurs de Performance Technique
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Croissance mensuelle */}
            <div className="text-center p-4 border border-blue-200 rounded-lg shadow-sm">
              <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-700">
                {tauxCroissance > 0 ? '+' : ''}{tauxCroissance.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-600 mt-1">Croissance mensuelle</p>
            </div>

            {/* Contrats en attente */}
            <div className="text-center p-4 border border-yellow-200 rounded-lg shadow-sm">
              <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-700">
                {stats?.contrats_en_attente || 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">Contrats en attente</p>
            </div>

            {/* Contrats expirés ce mois */}
            <div className="text-center p-4 border border-red-200 rounded-lg shadow-sm">
              <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-700">
                {stats?.contrats_expires_mois || 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">Expirés ce mois</p>
            </div>

            {/* Prime totale collectée */}
            <div className="text-center p-4 border border-green-200 rounded-lg shadow-sm">
              <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-700">
                {formatCurrency(stats?.prime_totale_collectee || 0)}
              </p>
              <p className="text-xs text-gray-600 mt-1">Primes collectées</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ✅ NOUVEAU: Section Localisation, Genre & Catégories Socio-Pro */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Localisation des Assurés */}
        <Card className="border-2 border-emerald-200 shadow-sm">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="flex items-center gap-2 text-emerald-900">
              <MapPin className="h-5 w-5" />
              Localisation Géographique
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {localisations.length > 0 ? (
              <div className="space-y-4">
                {localisations.map((loc: any, index: number) => {
                  const pourcentage = totalLocalisations > 0 
                    ? ((loc.nombre / totalLocalisations) * 100).toFixed(1) 
                    : 0;
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 border-2 border-emerald-200 rounded-lg flex items-center justify-center bg-white">
                            <MapPin className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{loc.ville || loc.localisation}</p>
                            <p className="text-sm text-gray-600">{loc.nombre} assurés</p>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-emerald-700">
                          {pourcentage}%
                        </span>
                      </div>
                      {/* Barre de progression */}
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${pourcentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Total */}
                <div className="mt-6 p-4 border-2 border-emerald-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-emerald-600" />
                      <span className="font-semibold text-gray-700">Total</span>
                    </div>
                    <span className="text-2xl font-bold text-emerald-700">
                      {totalLocalisations}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Aucune donnée de localisation</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ✅ Répartition par Genre */}
        <Card className="border-2 border-pink-200 shadow-sm">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="flex items-center gap-2 text-pink-900">
              <UserCircle2 className="h-5 w-5" />
              Répartition par Genre
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Hommes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 border-2 border-blue-200 rounded-lg flex items-center justify-center bg-white">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Hommes</p>
                      <p className="text-sm text-gray-600">{genreStats.hommes} assurés</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-blue-700">
                    {totalGenre > 0 ? ((genreStats.hommes / totalGenre) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${totalGenre > 0 ? (genreStats.hommes / totalGenre) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Femmes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 border-2 border-pink-200 rounded-lg flex items-center justify-center bg-white">
                      <User className="h-5 w-5 text-pink-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Femmes</p>
                      <p className="text-sm text-gray-600">{genreStats.femmes} assurées</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-pink-700">
                    {totalGenre > 0 ? ((genreStats.femmes / totalGenre) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-pink-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${totalGenre > 0 ? (genreStats.femmes / totalGenre) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Non déterminé */}
              {genreStats.non_determine > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 border-2 border-gray-200 rounded-lg flex items-center justify-center bg-white">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Non déterminé</p>
                        <p className="text-sm text-gray-600">{genreStats.non_determine} personnes</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-gray-700">
                      {totalGenre > 0 ? ((genreStats.non_determine / totalGenre) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-gray-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${totalGenre > 0 ? (genreStats.non_determine / totalGenre) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="mt-6 p-4 border-2 border-pink-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-pink-600" />
                    <span className="font-semibold text-gray-700">Total Assurés</span>
                  </div>
                  <span className="text-2xl font-bold text-pink-700">
                    {totalGenre}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Catégories Socio-Professionnelles */}
        <Card className="border-2 border-indigo-200 shadow-sm">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="flex items-center gap-2 text-indigo-900">
              <Briefcase className="h-5 w-5" />
              Catégories Socio-Pro
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {categoriesSocioPro.length > 0 ? (
              <div className="space-y-4">
                {categoriesSocioPro.map((cat: any, index: number) => {
                  const pourcentage = totalCategories > 0 
                    ? ((cat.nombre / totalCategories) * 100).toFixed(1) 
                    : 0;
                  const couleur = getCouleurCategorie(cat.categorie);
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 border-2 ${couleur.replace('bg-', 'border-')} rounded-lg flex items-center justify-center bg-white`}>
                            <UserCheck className={`h-5 w-5 ${couleur.replace('bg-', 'text-')}`} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{cat.categorie}</p>
                            <p className="text-sm text-gray-600">{cat.nombre} personnes</p>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-indigo-700">
                          {pourcentage}%
                        </span>
                      </div>
                      {/* Barre de progression avec couleur personnalisée */}
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`${couleur} h-2.5 rounded-full transition-all duration-500`}
                          style={{ width: `${pourcentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Total */}
                <div className="mt-6 p-4 border-2 border-indigo-200 rounded-lg">
                  <div className="flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-indigo-600" />
                      <span className="font-semibold text-gray-700">Total</span>
                    </div>
                    <span className="text-2xl font-bold text-indigo-700">
                      {totalCategories}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Aucune donnée de catégorie</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ContratChart data={stats?.evolution_contrats || []} />
        
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-indigo-600" />
              Répartition par EMF
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {stats?.par_emf && stats.par_emf.length > 0 ? (
                stats.par_emf.map((emf: EmfStats) => {
                  const percentage = stats.contrats_actifs 
                    ? ((emf.total / stats.contrats_actifs) * 100).toFixed(1)
                    : 0;
                  
                  return (
                    <div
                      key={emf.emf_id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-all duration-200 border border-gray-200"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 border-2 border-blue-200 rounded-lg flex items-center justify-center flex-shrink-0 bg-white">
                          <Building2 className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {emf.emf?.sigle || 'Inconnu'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-gray-600">{emf.total} contrats</p>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                              {percentage}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 whitespace-nowrap">
                          {formatCurrency(emf.montant_total)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatCurrency(emf.montant_total / emf.total)}/contrat
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Aucune donnée disponible</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau Analytique par EMF */}
      <Card className="border-2 border-blue-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Activity className="h-5 w-5" />
            Analyse Détaillée par EMF
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">EMF</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Contrats</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Montant Total</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Moyenne</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Part (%)</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats?.par_emf && stats.par_emf.length > 0 ? (
                  stats.par_emf.map((emf: EmfStats, index: number) => {
                    const percentage = stats.contrats_actifs 
                      ? ((emf.total / stats.contrats_actifs) * 100)
                      : 0;
                    const moyenne = emf.total > 0 ? emf.montant_total / emf.total : 0;
                    
                    return (
                      <tr 
                        key={emf.emf_id} 
                        className={`hover:bg-blue-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 border border-blue-200 rounded-lg flex items-center justify-center bg-white">
                              <Building2 className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="font-medium text-gray-900">
                              {emf.emf?.sigle || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-900">
                          {emf.total}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-900">
                          {formatCurrency(emf.montant_total)}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-700">
                          {formatCurrency(moyenne)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {percentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Actif
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Aucune donnée disponible
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentContracts contracts={stats?.contrats_recents || []} />
        </div>
        <div>
          <SinistresWidget sinistres={stats?.sinistres_recents || []} />
        </div>
      </div>
    </div>
  );
};
