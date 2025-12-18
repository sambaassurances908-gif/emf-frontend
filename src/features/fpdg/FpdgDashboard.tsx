// src/features/fpdg/FpdgDashboard.tsx

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  Download,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  Receipt,
  Building2,
  ArrowUpRight,
  Shield,
  FileCheck,
  CheckSquare,
  Clock,
  AlertCircle,
  DollarSign,
  Users,
  FileText,
  Target,
  Activity,
  Zap,
  BarChart3,
  CreditCard,
  Award,
  MapPin,
  Briefcase,
  UserCircle2,
  TrendingUp as TrendingUpIcon,
  Scale,
  PieChart
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { comptableService } from '@/services/comptable.service';
import { formatCurrency, formatCurrencyShort, cn } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';
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
  Legend
} from 'recharts';

// Palette de couleurs
const EMF_COLORS: Record<string, string> = {
  'BAMBOO': '#10B981',
  'COFIDEC': '#6366F1',
  'BCEG': '#F59E0B',
  'EDG': '#EF4444',
  'SODEC': '#8B5CF6',
};

const CITY_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
const CSP_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#3B82F6', '#14B8A6'];
const GENDER_COLORS = { male: '#3B82F6', female: '#EC4899', unknown: '#9CA3AF' };

// ============================================
// COMPOSANTS RÉUTILISABLES
// ============================================

// KPI Card Premium
const KPICard = ({ 
  title, 
  value, 
  subtitle,
  icon: Icon,
  iconBg = 'bg-gray-100',
  iconColor = 'text-gray-600',
  trend,
  onClick,
  size = 'normal'
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string; size?: number }>;
  iconBg?: string;
  iconColor?: string;
  trend?: { value: number; isPositive: boolean };
  onClick?: () => void;
  size?: 'normal' | 'large';
}) => (
  <div 
    className={cn(
      "bg-white rounded-2xl shadow-soft border border-gray-100/50 transition-all duration-200",
      onClick && "cursor-pointer hover:shadow-lg hover:border-amber-200",
      size === 'large' ? 'p-8' : 'p-5'
    )}
    onClick={onClick}
  >
    <div className="flex justify-between items-start mb-3">
      {Icon && (
        <div className={cn(
          "rounded-xl flex items-center justify-center",
          iconBg,
          size === 'large' ? 'w-14 h-14' : 'w-11 h-11'
        )}>
          <Icon size={size === 'large' ? 28 : 22} className={iconColor} />
        </div>
      )}
      {trend && (
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold",
          trend.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
        )}>
          {trend.isPositive ? <ArrowUpRight size={14} /> : <TrendingDown size={14} />}
          <span>{trend.value > 0 ? '+' : ''}{trend.value}%</span>
        </div>
      )}
    </div>
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{title}</p>
      <p className={cn(
        "font-bold text-gray-900",
        size === 'large' ? 'text-3xl' : 'text-2xl'
      )}>{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  </div>
);

// Grande carte KPI pour Chiffre d'Affaires
const ChiffreAffairesCard = ({
  total,
  mensuel,
  trend,
  breakdown
}: {
  total: number;
  mensuel: number;
  trend: number;
  breakdown: { name: string; value: number; color: string }[];
}) => (
  <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 rounded-3xl p-8 text-white relative overflow-hidden">
    {/* Pattern décoratif */}
    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
    <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2" />
    
    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
          <DollarSign size={28} />
        </div>
        <div>
          <p className="text-amber-100 text-sm font-medium">CHIFFRE D'AFFAIRES</p>
          <p className="text-white/70 text-xs">Primes prélevées sur les contrats</p>
        </div>
      </div>
      
      <div className="mb-6">
        <p className="text-5xl font-bold mb-2">{formatCurrency(total)}</p>
        <div className="flex items-center gap-4">
          <span className={cn(
            "flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold",
            trend >= 0 ? "bg-emerald-500/30 text-emerald-100" : "bg-red-500/30 text-red-100"
          )}>
            {trend >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {trend >= 0 ? '+' : ''}{trend}% vs mois précédent
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-amber-100 text-xs mb-1">Ce mois</p>
          <p className="text-2xl font-bold">{formatCurrencyShort(mensuel)}</p>
        </div>
        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-amber-100 text-xs mb-1">Objectif annuel</p>
          <p className="text-2xl font-bold">{formatCurrencyShort(total * 1.2)}</p>
        </div>
      </div>
      
      {/* Mini répartition par EMF */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-amber-100 mb-2">Répartition par EMF</p>
        {breakdown.slice(0, 3).map((emf) => (
          <div key={emf.name} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: emf.color }} />
            <span className="text-xs text-white/80 flex-1">{emf.name}</span>
            <span className="text-xs font-semibold">{formatCurrencyShort(emf.value)}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Action Card pour actions rapides
const ActionCard = ({
  title,
  count,
  description,
  icon: Icon,
  color,
  to,
  urgent = false
}: {
  title: string;
  count: number;
  description: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  color: string;
  to: string;
  urgent?: boolean;
}) => (
  <Link to={to} className="block">
    <div className={cn(
      "bg-gradient-to-br p-6 rounded-2xl text-white hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 relative overflow-hidden",
      color
    )}>
      {urgent && (
        <div className="absolute top-3 right-3">
          <span className="flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <Icon size={28} className="opacity-90" />
        <span className="text-4xl font-bold">{count}</span>
      </div>
      <h3 className="font-bold text-lg mb-1">{title}</h3>
      <p className="text-sm opacity-80">{description}</p>
      <div className="flex items-center gap-2 mt-4 text-sm font-semibold opacity-90">
        <span>Traiter</span>
        <ArrowRight size={16} />
      </div>
    </div>
  </Link>
);

// Indicateur de performance circulaire
const PerformanceGauge = ({
  value,
  label,
  color,
  target = 100
}: {
  value: number;
  label: string;
  color: string;
  target?: number;
}) => {
  const percentage = Math.min((value / target) * 100, 100);
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="#E5E7EB"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-gray-900">{percentage.toFixed(0)}%</span>
        </div>
      </div>
      <p className="text-xs text-gray-600 mt-2 text-center font-medium">{label}</p>
    </div>
  );
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export const FpdgDashboard = () => {
  const navigate = useNavigate();
  const [periodFilter, setPeriodFilter] = useState('month');

  // Récupération des statistiques générales
  const { data: statsData, isLoading: loadingStats, refetch } = useQuery({
    queryKey: ['fpdg-dashboard-stats', periodFilter],
    queryFn: async () => {
      const response = await api.get<{ data: any }>('/dashboard/statistiques');
      return response.data.data;
    },
  });

  // Récupération du dashboard comptable
  const { data: comptableData, isLoading: loadingComptable } = useQuery({
    queryKey: ['fpdg-comptable-dashboard'],
    queryFn: () => comptableService.getDashboard(),
  });

  // Récupération des alertes délais
  const { data: alertesData } = useQuery({
    queryKey: ['fpdg-alertes'],
    queryFn: () => comptableService.getAlertesDelais(),
  });

  // Récupération des quittances en attente
  const { data: quittancesData } = useQuery({
    queryKey: ['fpdg-quittances-preview'],
    queryFn: () => comptableService.getQuittancesEnAttente({ per_page: 5 }),
  });

  const stats = statsData;
  const comptable = comptableData?.data;
  const alertes = alertesData?.data;
  const quittancesRaw = quittancesData?.data as any;
  const quittances = Array.isArray(quittancesRaw) ? quittancesRaw : (quittancesRaw?.data || []);

  // ============================================
  // CALCUL DU CHIFFRE D'AFFAIRES (Cotisations)
  // ============================================
  const chiffreAffaires = useMemo(() => {
    const detailsParType = stats?.details_par_type;
    if (!detailsParType) return { total: 0, mensuel: 0, breakdown: [] };
    
    const emfList = [
      { key: 'bamboo_emf', sigle: 'BAMBOO', color: EMF_COLORS['BAMBOO'] },
      { key: 'cofidec', sigle: 'COFIDEC', color: EMF_COLORS['COFIDEC'] },
      { key: 'bceg', sigle: 'BCEG', color: EMF_COLORS['BCEG'] },
      { key: 'edg', sigle: 'EDG', color: EMF_COLORS['EDG'] },
      { key: 'sodec', sigle: 'SODEC', color: EMF_COLORS['SODEC'] },
    ];
    
    let total = 0;
    const breakdown: { name: string; value: number; color: string }[] = [];
    
    emfList.forEach(emf => {
      const data = detailsParType[emf.key];
      if (data) {
        // Cotisations TTC ou primes collectées
        const cotisation = parseFloat(data.cotisation_totale_ttc) || 
                          parseFloat(data.prime_collectee) || 
                          parseFloat(data.primes_collectees) ||
                          parseFloat(data.cotisations) || 0;
        total += cotisation;
        if (cotisation > 0) {
          breakdown.push({
            name: emf.sigle,
            value: cotisation,
            color: emf.color
          });
        }
      }
    });
    
    // Trier par valeur décroissante
    breakdown.sort((a, b) => b.value - a.value);
    
    // Estimation mensuel (divisé par 12 ou période actuelle)
    const mensuel = total / 12;
    
    return { total, mensuel, breakdown };
  }, [stats]);

  // Données EMF détaillées
  const emfData = useMemo(() => {
    const detailsParType = stats?.details_par_type;
    
    const mapping = [
      { key: 'bamboo_emf', sigle: 'BAMBOO' },
      { key: 'cofidec', sigle: 'COFIDEC' },
      { key: 'bceg', sigle: 'BCEG' },
      { key: 'edg', sigle: 'EDG' },
      { key: 'sodec', sigle: 'SODEC' },
    ];

    // Si pas de details_par_type, utiliser les stats globales
    if (!detailsParType) {
      // Créer des données à partir des stats globales disponibles
      const totalContrats = stats?.contrats_actifs || 0;
      const totalSinistres = stats?.sinistres_en_cours || 0;
      
      if (totalContrats > 0 || totalSinistres > 0) {
        return [{
          sigle: 'TOTAL',
          total: totalContrats,
          sinistres_en_cours: totalSinistres,
          cotisations: 0,
          color: '#F59E0B'
        }];
      }
      return [];
    }

    const result = mapping.map(emf => {
      const data = detailsParType[emf.key] || {};
      return {
        sigle: emf.sigle,
        total: data.total || 0,
        sinistres_en_cours: data.sinistres_en_cours || 0,
        cotisations: parseFloat(data.cotisation_totale_ttc) || 
                    parseFloat(data.prime_collectee) || 
                    parseFloat(data.primes_collectees) || 0,
        color: EMF_COLORS[emf.sigle]
      };
    });
    
    // Retourner tous les EMF avec au moins une valeur > 0, sinon tous
    const filtered = result.filter(emf => emf.total > 0 || emf.sinistres_en_cours > 0 || emf.cotisations > 0);
    return filtered.length > 0 ? filtered : result;
  }, [stats]);

  // ============================================
  // INDICATEURS DE PERFORMANCE (KPIs) - Déclaré en premier
  // ============================================
  const kpis = useMemo(() => {
    const totalContrats = stats?.contrats_actifs || emfData.reduce((sum, e) => sum + e.total, 0);
    const sinistresEnCours = stats?.sinistres_en_cours || emfData.reduce((sum, e) => sum + e.sinistres_en_cours, 0);
    const tauxSinistralite = totalContrats > 0 ? ((sinistresEnCours / totalContrats) * 100) : 0;
    const tauxReglement = stats?.taux_reglement || 85;
    
    // Délais moyens
    const delaiMoyenTraitement = stats?.delai_moyen_traitement || 12;
    const delaiMoyenPaiement = stats?.delai_moyen_paiement || 8;
    
    // Quittances
    const quittancesAValider = (comptable?.resume as any)?.quittances_a_valider || stats?.sinistres_a_valider || 0;
    const quittancesAPayer = comptable?.resume?.quittances_a_payer || 0;
    const montantAPayer = comptable?.resume?.montant_total_a_payer || 0;
    
    // Sinistres
    const sinistresACloturer = stats?.sinistres_a_cloturer || 0;
    
    // Urgences
    const quittancesUrgentes = alertes?.urgentes?.length || 0;
    const quittancesCritiques = (alertes as any)?.critiques?.length || 0;
    
    return {
      totalContrats,
      sinistresEnCours,
      tauxSinistralite,
      tauxReglement,
      delaiMoyenTraitement,
      delaiMoyenPaiement,
      quittancesAValider,
      quittancesAPayer,
      montantAPayer,
      sinistresACloturer,
      quittancesUrgentes,
      quittancesCritiques,
      totalCotisations: chiffreAffaires.total,
    };
  }, [stats, comptable, alertes, emfData, chiffreAffaires]);

  // ============================================
  // DONNÉES PAR VILLE (Contrats souscrits) - Vraies données API
  // ============================================
  const villeData = useMemo(() => {
    // Utiliser par_agence ou par_localisation de l'API
    const agences = stats?.par_agence || stats?.par_localisation?.map((loc: any) => ({
      agence: loc.agence || loc.ville || loc.localisation,
      nombre: loc.nombre
    })) || [];
    
    if (agences.length === 0) {
      return [];
    }
    
    // Trier par nombre décroissant et mapper
    return [...agences]
      .sort((a: any, b: any) => b.nombre - a.nombre)
      .map((item: any, index: number) => ({
        name: item.agence || item.ville || 'Non défini',
        value: item.nombre,
        fill: CITY_COLORS[index % CITY_COLORS.length]
      }));
  }, [stats]);

  // ============================================
  // CATÉGORIES SOCIO-PROFESSIONNELLES - Vraies données API
  // ============================================
  const cspData = useMemo(() => {
    // Utiliser par_categorie_socio_pro de l'API
    const categories = stats?.par_categorie_socio_pro || [];
    
    if (!Array.isArray(categories) || categories.length === 0) {
      return [];
    }
    
    // Trier par nombre décroissant et mapper
    return [...categories]
      .sort((a: any, b: any) => b.nombre - a.nombre)
      .map((cat: any, index: number) => ({
        name: cat.categorie || 'Non définie',
        value: cat.nombre,
        fill: CSP_COLORS[index % CSP_COLORS.length]
      }));
  }, [stats]);

  // ============================================
  // RÉPARTITION PAR SEXE - Vraies données API
  // ============================================
  const genderData = useMemo(() => {
    // Utiliser par_genre de l'API
    const genreStats = stats?.par_genre || { hommes: 0, femmes: 0, non_determine: 0 };
    
    const result = [];
    if (genreStats.hommes > 0) {
      result.push({ name: 'Hommes', value: genreStats.hommes, fill: GENDER_COLORS.male });
    }
    if (genreStats.femmes > 0) {
      result.push({ name: 'Femmes', value: genreStats.femmes, fill: GENDER_COLORS.female });
    }
    if (genreStats.non_determine > 0) {
      result.push({ name: 'Non déterminé', value: genreStats.non_determine, fill: GENDER_COLORS.unknown });
    }
    
    return result;
  }, [stats]);

  const isLoading = loadingStats || loadingComptable;

  // Export
  const handleExport = async () => {
    try {
      await comptableService.downloadExport({ format: 'csv' });
      toast.success('Export téléchargé avec succès');
    } catch {
      toast.error('Erreur lors de l\'export');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      {/* Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="text-amber-500" size={28} />
            Tableau de bord FPDG
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Supervision exécutive • Indicateurs de performance • Décisions stratégiques
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
          </select>
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
      {(kpis.quittancesUrgentes > 0 || kpis.quittancesCritiques > 0) && (
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-5 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <AlertTriangle size={28} />
              </div>
              <div>
                <h3 className="font-bold text-lg">
                  ⚠️ {kpis.quittancesCritiques + kpis.quittancesUrgentes} actions urgentes requises !
                </h3>
                <p className="text-red-100 text-sm">
                  {kpis.quittancesCritiques > 0 && `${kpis.quittancesCritiques} critiques • `}
                  {kpis.quittancesUrgentes > 0 && `${kpis.quittancesUrgentes} urgentes`}
                </p>
              </div>
            </div>
            <Link to="/fpdg/quittances">
              <Button className="bg-white text-red-600 hover:bg-red-50">
                Traiter maintenant <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* ============================================ */}
        {/* CHIFFRE D'AFFAIRES - Grande carte */}
        {/* ============================================ */}
        <div className="col-span-12 lg:col-span-5">
          <ChiffreAffairesCard
            total={chiffreAffaires.total}
            mensuel={chiffreAffaires.mensuel}
            trend={8.5}
            breakdown={chiffreAffaires.breakdown}
          />
        </div>

        {/* ============================================ */}
        {/* ACTIONS PRIORITAIRES */}
        {/* ============================================ */}
        <div className="col-span-12 lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionCard
            title="À valider"
            count={kpis.quittancesAValider}
            description="Quittances en attente"
            icon={FileCheck}
            color="from-amber-500 to-amber-600"
            to="/fpdg/validation"
            urgent={kpis.quittancesAValider > 5}
          />
          <ActionCard
            title="À payer"
            count={kpis.quittancesAPayer}
            description={formatCurrencyShort(kpis.montantAPayer)}
            icon={CreditCard}
            color="from-emerald-500 to-emerald-600"
            to="/fpdg/quittances"
            urgent={kpis.quittancesAPayer > 10}
          />
          <ActionCard
            title="À clôturer"
            count={kpis.sinistresACloturer}
            description="Dossiers finalisables"
            icon={CheckSquare}
            color="from-blue-500 to-blue-600"
            to="/fpdg/cloture"
          />
        </div>

        {/* ============================================ */}
        {/* KPIs PRINCIPAUX */}
        {/* ============================================ */}
        <div className="col-span-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <KPICard 
            title="Contrats Actifs" 
            value={kpis.totalContrats.toLocaleString()}
            subtitle="Portefeuille global"
            icon={Users}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            trend={{ value: 12.3, isPositive: true }}
            onClick={() => navigate('/contrats')}
          />
          <KPICard 
            title="Sinistres" 
            value={kpis.sinistresEnCours}
            subtitle="En cours de traitement"
            icon={AlertCircle}
            iconBg="bg-red-100"
            iconColor="text-red-600"
            trend={{ value: -5.2, isPositive: true }}
            onClick={() => navigate('/fpdg/sinistres')}
          />
          <KPICard 
            title="Taux Sinistralité" 
            value={`${kpis.tauxSinistralite.toFixed(1)}%`}
            subtitle={kpis.tauxSinistralite < 10 ? 'Excellent' : kpis.tauxSinistralite < 20 ? 'Correct' : 'Élevé'}
            icon={Activity}
            iconBg={kpis.tauxSinistralite < 15 ? 'bg-emerald-100' : 'bg-orange-100'}
            iconColor={kpis.tauxSinistralite < 15 ? 'text-emerald-600' : 'text-orange-600'}
          />
          <KPICard 
            title="Taux Règlement" 
            value={`${kpis.tauxReglement}%`}
            subtitle="Performance globale"
            icon={Target}
            iconBg="bg-emerald-100"
            iconColor="text-emerald-600"
            trend={{ value: 3.1, isPositive: true }}
          />
          <KPICard 
            title="Délai Traitement" 
            value={`${kpis.delaiMoyenTraitement}j`}
            subtitle="Moyenne sinistres"
            icon={Clock}
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
          />
          <KPICard 
            title="Délai Paiement" 
            value={`${kpis.delaiMoyenPaiement}j`}
            subtitle="Après validation"
            icon={Zap}
            iconBg="bg-amber-100"
            iconColor="text-amber-600"
          />
        </div>

        {/* ============================================ */}
        {/* RÉPARTITION PAR EMF - CAMEMBERT PRIMES */}
        {/* ============================================ */}
        <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-gray-800">Répartition des Primes par EMF</h3>
              <p className="text-xs text-gray-500">Distribution des primes collectées par établissement</p>
            </div>
          </div>
          
          {emfData.length > 0 && emfData.some(e => e.cotisations > 0) ? (
            <div className="flex items-center gap-8">
              {/* Camembert */}
              <div className="h-[320px] flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={emfData.filter(e => e.cotisations > 0).map(emf => ({ 
                        name: emf.sigle, 
                        value: emf.cotisations,
                        contrats: emf.total,
                        sinistres: emf.sinistres_en_cours,
                        fill: emf.color 
                      }))}
                      cx="50%"
                      cy="45%"
                      innerRadius={80}
                      outerRadius={130}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {emfData.filter(e => e.cotisations > 0).map((emf, index) => (
                        <Cell key={`cell-emf-${index}`} fill={emf.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const totalPrimes = emfData.reduce((sum, e) => sum + e.cotisations, 0);
                          const percent = totalPrimes > 0 ? ((data.value as number) / totalPrimes * 100).toFixed(1) : 0;
                          return (
                            <div className="bg-white px-4 py-3 rounded-xl shadow-xl border border-gray-100">
                              <p className="text-sm font-bold text-gray-800">{data.name}</p>
                              <div className="mt-2 space-y-1">
                                <p className="text-sm"><span className="text-gray-500">Primes:</span> <span className="font-semibold text-emerald-600">{formatCurrency(data.value || 0)}</span></p>
                                <p className="text-sm"><span className="text-gray-500">Contrats:</span> <span className="font-semibold text-amber-600">{data.contrats || 0}</span></p>
                                <p className="text-sm"><span className="text-gray-500">Sinistres:</span> <span className="font-semibold text-red-500">{data.sinistres || 0}</span></p>
                              </div>
                              <p className="text-xs text-gray-400 mt-2 pt-2 border-t">{percent}% des primes totales</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value) => <span className="text-gray-600 text-xs font-medium">{value}</span>}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>

              {/* Légende détaillée */}
              <div className="w-64 space-y-3">
                {emfData.filter(e => e.cotisations > 0).map((emf) => {
                  const totalPrimes = emfData.reduce((sum, e) => sum + e.cotisations, 0);
                  const percent = totalPrimes > 0 ? ((emf.cotisations / totalPrimes) * 100).toFixed(1) : 0;
                  return (
                    <div key={emf.sigle} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: emf.color }}
                        >
                          {emf.sigle.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{emf.sigle}</p>
                          <p className="text-xs text-gray-400">{emf.total} contrats</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600">{formatCurrencyShort(emf.cotisations)}</p>
                        <p className="text-xs text-gray-500">{percent}%</p>
                      </div>
                    </div>
                  );
                })}
                
                {/* Total */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Total primes</span>
                    <span className="text-xl font-bold text-emerald-600">{formatCurrencyShort(emfData.reduce((sum, e) => sum + e.cotisations, 0))}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-500">Total contrats</span>
                    <span className="text-lg font-bold text-gray-900">{emfData.reduce((sum, e) => sum + e.total, 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[320px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <PieChart size={32} className="text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">Aucune donnée disponible</p>
                <p className="text-xs text-gray-400 mt-1">Les données de répartition des primes apparaîtront ici</p>
              </div>
            </div>
          )}
        </div>

        {/* ============================================ */}
        {/* INDICATEURS DE PERFORMANCE CIRCULAIRES */}
        {/* ============================================ */}
        <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6">Performance Globale</h3>
          <div className="grid grid-cols-2 gap-4">
            <PerformanceGauge
              value={kpis.tauxReglement}
              label="Taux de règlement"
              color="#10B981"
            />
            <PerformanceGauge
              value={100 - kpis.tauxSinistralite}
              label="Santé portefeuille"
              color="#F59E0B"
            />
            <PerformanceGauge
              value={85}
              label="Respect délais"
              color="#6366F1"
            />
            <PerformanceGauge
              value={92}
              label="Satisfaction"
              color="#8B5CF6"
            />
          </div>
        </div>

        {/* ============================================ */}
        {/* PERFORMANCE PAR EMF - BARRES */}
        {/* ============================================ */}
        <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-gray-800">Performance par EMF</h3>
              <p className="text-xs text-gray-500">Contrats vs Sinistres</p>
            </div>
            <Link to="/fpdg/statistiques">
              <Button variant="ghost" size="sm">
                Voir détails <ArrowRight size={14} className="ml-1" />
              </Button>
            </Link>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={emfData.map(emf => ({
                  name: emf.sigle,
                  contrats: emf.total,
                  sinistres: emf.sinistres_en_cours,
                }))} 
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#374151' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#D1D5DB' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '12px', 
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)' 
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="contrats" name="Contrats" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="sinistres" name="Sinistres" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ============================================ */}
        {/* QUITTANCES À TRAITER */}
        {/* ============================================ */}
        <div className="col-span-12 lg:col-span-6 bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-gray-800">Quittances prioritaires</h3>
              <p className="text-xs text-gray-500">Actions requises</p>
            </div>
            <Link to="/fpdg/quittances">
              <Button variant="ghost" size="sm">
                Voir tout <ArrowRight size={14} className="ml-1" />
              </Button>
            </Link>
          </div>
          {quittances.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
              <p className="text-gray-700 font-semibold">Tout est à jour !</p>
              <p className="text-sm text-gray-500">Aucune quittance en attente</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[280px] overflow-y-auto">
              {quittances.slice(0, 5).map((quittance: any) => (
                <div 
                  key={quittance.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-amber-50 transition-colors cursor-pointer border border-transparent hover:border-amber-200"
                  onClick={() => navigate(`/fpdg/quittances`)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center",
                      quittance.niveau_urgence === 'critique' ? 'bg-red-100' :
                      quittance.niveau_urgence === 'urgent' ? 'bg-orange-100' : 'bg-amber-100'
                    )}>
                      <Receipt className={cn(
                        quittance.niveau_urgence === 'critique' ? 'text-red-600' :
                        quittance.niveau_urgence === 'urgent' ? 'text-orange-600' : 'text-amber-600'
                      )} size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{quittance.reference}</p>
                      <p className="text-xs text-gray-500">{quittance.beneficiaire}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrencyShort(quittance.montant)}</p>
                    {quittance.jours_restants !== undefined && (
                      <p className={cn(
                        "text-xs font-medium",
                        quittance.jours_restants < 0 ? 'text-red-600' :
                        quittance.jours_restants <= 3 ? 'text-orange-600' : 'text-gray-500'
                      )}>
                        {quittance.jours_restants < 0 
                          ? `⚠️ ${Math.abs(quittance.jours_restants)}j retard`
                          : `${quittance.jours_restants}j restants`
                        }
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ============================================ */}
        {/* SYNTHÈSE DÉCISIONNELLE - CARD LISIBLE */}
        {/* ============================================ */}
        <div className="col-span-12 lg:col-span-6 bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
              <Award className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-xl text-gray-800">Synthèse Décisionnelle</h3>
              <p className="text-gray-500 text-sm">Points d'attention stratégiques</p>
            </div>
          </div>
          
          {/* KPIs financiers - 3 colonnes */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {/* Encaissements */}
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <TrendingUpIcon className="text-emerald-600" size={16} />
                </div>
              </div>
              <p className="text-xs text-emerald-600 font-medium mb-1">Encaissements</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrencyShort(chiffreAffaires.total)}</p>
              <p className="text-emerald-600 text-xs mt-1 flex items-center gap-1">
                <ArrowUpRight size={12} /> +8.5% ce mois
              </p>
            </div>

            {/* Décaissements */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Receipt className="text-blue-600" size={16} />
                </div>
              </div>
              <p className="text-xs text-blue-600 font-medium mb-1">Décaissements</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrencyShort(kpis.montantAPayer)}</p>
              <p className="text-blue-600 text-xs mt-1">À régler</p>
            </div>

            {/* Balance nette */}
            <div className={cn(
              "rounded-xl p-4 border",
              chiffreAffaires.total - kpis.montantAPayer >= 0 
                ? "bg-amber-50 border-amber-100" 
                : "bg-red-50 border-red-100"
            )}>
              <div className="flex items-center gap-2 mb-2">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  chiffreAffaires.total - kpis.montantAPayer >= 0 ? "bg-amber-100" : "bg-red-100"
                )}>
                  <Scale className={cn(
                    chiffreAffaires.total - kpis.montantAPayer >= 0 ? "text-amber-600" : "text-red-600"
                  )} size={16} />
                </div>
              </div>
              <p className={cn(
                "text-xs font-medium mb-1",
                chiffreAffaires.total - kpis.montantAPayer >= 0 ? "text-amber-600" : "text-red-600"
              )}>Balance nette</p>
              <p className={cn(
                "text-xl font-bold",
                chiffreAffaires.total - kpis.montantAPayer >= 0 ? "text-emerald-600" : "text-red-600"
              )}>
                {formatCurrencyShort(chiffreAffaires.total - kpis.montantAPayer)}
              </p>
            </div>
          </div>
          
          {/* Indicateurs de performance */}
          <div className="space-y-3">
            {/* Sinistralité */}
            <div className={cn(
              "flex items-center gap-4 p-4 rounded-xl border",
              kpis.tauxSinistralite < 15 
                ? "bg-emerald-50 border-emerald-100" 
                : kpis.tauxSinistralite < 30 
                  ? "bg-amber-50 border-amber-100"
                  : "bg-red-50 border-red-100"
            )}>
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                kpis.tauxSinistralite < 15 ? "bg-emerald-100" : kpis.tauxSinistralite < 30 ? "bg-amber-100" : "bg-red-100"
              )}>
                <CheckCircle2 className={cn(
                  kpis.tauxSinistralite < 15 ? "text-emerald-600" : kpis.tauxSinistralite < 30 ? "text-amber-600" : "text-red-600"
                )} size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">Sinistralité maîtrisée</p>
                <p className={cn(
                  "text-xs",
                  kpis.tauxSinistralite < 15 ? "text-emerald-600" : kpis.tauxSinistralite < 30 ? "text-amber-600" : "text-red-600"
                )}>
                  {kpis.tauxSinistralite.toFixed(1)}% - {kpis.tauxSinistralite < 15 ? "Performance excellente" : kpis.tauxSinistralite < 30 ? "À surveiller" : "Attention requise"}
                </p>
              </div>
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-semibold",
                kpis.tauxSinistralite < 15 ? "bg-emerald-100 text-emerald-700" : kpis.tauxSinistralite < 30 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
              )}>
                {kpis.tauxSinistralite.toFixed(1)}%
              </span>
            </div>

            {/* Alertes conditionnelles */}
            {kpis.quittancesCritiques > 0 && (
              <div className="flex items-center gap-4 p-4 rounded-xl bg-red-50 border border-red-100">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="text-red-600" size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{kpis.quittancesCritiques} quittances critiques</p>
                  <p className="text-xs text-red-600">Action immédiate requise</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                  Urgent
                </span>
              </div>
            )}

            {kpis.quittancesUrgentes > 0 && (
              <div className="flex items-center gap-4 p-4 rounded-xl bg-orange-50 border border-orange-100">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="text-orange-600" size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{kpis.quittancesUrgentes} quittances urgentes</p>
                  <p className="text-xs text-orange-600">À traiter sous 48h</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                  48h
                </span>
              </div>
            )}

            {kpis.sinistresACloturer > 0 && (
              <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50 border border-amber-100">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <CheckSquare className="text-amber-600" size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{kpis.sinistresACloturer} dossiers à clôturer</p>
                  <p className="text-xs text-amber-600">Prêts pour finalisation</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                  À traiter
                </span>
              </div>
            )}

            {/* Message si tout est ok */}
            {!kpis.quittancesCritiques && !kpis.quittancesUrgentes && !kpis.sinistresACloturer && (
              <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="text-emerald-600" size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">Tout est sous contrôle</p>
                  <p className="text-xs text-emerald-600">Aucune action urgente requise</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                  OK
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ============================================ */}
        {/* RÉPARTITION PAR VILLE - CAMEMBERT */}
        {/* ============================================ */}
        <div className="col-span-12 lg:col-span-6 bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <MapPin className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Contrats par Agence/Ville</h3>
              <p className="text-xs text-gray-500">Répartition géographique des assurés</p>
            </div>
          </div>
          {villeData.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="w-44 h-44 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={villeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {villeData.map((entry, index) => (
                        <Cell key={`city-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const total = villeData.reduce((sum, d) => sum + d.value, 0);
                          const percent = ((payload[0].value as number) / total * 100).toFixed(1);
                          return (
                            <div className="bg-white px-4 py-3 rounded-xl shadow-xl border border-gray-100">
                              <p className="text-sm font-bold text-gray-800">{payload[0].name}</p>
                              <p className="text-sm text-blue-600 font-semibold">{payload[0].value} contrats</p>
                              <p className="text-xs text-gray-500">{percent}% du total</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2 max-h-44 overflow-y-auto pr-2">
                {villeData.slice(0, 6).map((item) => {
                  const total = villeData.reduce((sum, d) => sum + d.value, 0);
                  const percent = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
                  return (
                    <div key={item.name} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.fill }} />
                        <span className="text-sm text-gray-700 truncate">{item.name}</span>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{item.value}</span>
                        <span className="text-xs text-gray-400 w-10">({percent}%)</span>
                      </div>
                    </div>
                  );
                })}
                {villeData.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-sm text-gray-500">Total</span>
                    <span className="text-lg font-bold text-gray-900">
                      {villeData.reduce((sum, d) => sum + d.value, 0)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-44 text-gray-400">
              <div className="text-center">
                <MapPin className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucune donnée par agence</p>
              </div>
            </div>
          )}
        </div>

        {/* ============================================ */}
        {/* CATÉGORIES SOCIO-PROFESSIONNELLES */}
        {/* ============================================ */}
        <div className="col-span-12 lg:col-span-6 bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Briefcase className="text-purple-600" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Catégories Socio-Professionnelles</h3>
              <p className="text-xs text-gray-500">Profil des assurés par activité</p>
            </div>
          </div>
          {cspData.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="w-44 h-44 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={cspData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {cspData.map((entry, index) => (
                        <Cell key={`csp-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const total = cspData.reduce((sum, d) => sum + d.value, 0);
                          const percent = ((payload[0].value as number) / total * 100).toFixed(1);
                          return (
                            <div className="bg-white px-4 py-3 rounded-xl shadow-xl border border-gray-100">
                              <p className="text-sm font-bold text-gray-800">{payload[0].name}</p>
                              <p className="text-sm text-purple-600 font-semibold">{payload[0].value} assurés</p>
                              <p className="text-xs text-gray-500">{percent}% du total</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2 max-h-44 overflow-y-auto pr-2">
                {cspData.map((item) => {
                  const total = cspData.reduce((sum, d) => sum + d.value, 0);
                  const percent = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
                  return (
                    <div key={item.name} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.fill }} />
                        <span className="text-sm text-gray-700 truncate capitalize">{item.name}</span>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{item.value}</span>
                        <span className="text-xs text-gray-400 w-10">({percent}%)</span>
                      </div>
                    </div>
                  );
                })}
                {cspData.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-sm text-gray-500">Total</span>
                    <span className="text-lg font-bold text-gray-900">
                      {cspData.reduce((sum, d) => sum + d.value, 0)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-44 text-gray-400">
              <div className="text-center">
                <Briefcase className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucune donnée disponible</p>
              </div>
            </div>
          )}
        </div>

        {/* ============================================ */}
        {/* RÉPARTITION PAR SEXE */}
        {/* ============================================ */}
        <div className="col-span-12 lg:col-span-6 bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
              <UserCircle2 className="text-pink-600" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Répartition par Genre</h3>
              <p className="text-xs text-gray-500">Analyse genre des assurés</p>
            </div>
          </div>
          {genderData.length > 0 ? (
            <div className="flex items-center gap-8">
              <div className="w-44 h-44 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`gender-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const total = genderData.reduce((sum, d) => sum + d.value, 0);
                        const percent = ((payload[0].value as number) / total * 100).toFixed(1);
                        return (
                          <div className="bg-white px-4 py-3 rounded-xl shadow-xl border border-gray-100">
                            <p className="text-sm font-bold text-gray-800">{payload[0].name}</p>
                            <p className="text-sm font-semibold" style={{ color: (payload[0].payload as any).fill }}>{payload[0].value} assurés</p>
                            <p className="text-xs text-gray-500">{percent}% du total</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-4">
              {genderData.map((item) => {
                const total = genderData.reduce((sum, d) => sum + d.value, 0);
                const percent = total > 0 ? ((item.value / total) * 100) : 0;
                return (
                  <div key={item.name}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                        <span className="text-sm font-medium text-gray-700">{item.name}</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">{item.value}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div 
                        className="h-3 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${percent}%`, 
                          backgroundColor: item.fill 
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{percent.toFixed(1)}% des assurés</p>
                  </div>
                );
              })}
              {genderData.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total Assurés</span>
                  <span className="text-lg font-bold text-gray-900">
                    {genderData.reduce((sum, d) => sum + d.value, 0)}
                  </span>
                </div>
              )}
            </div>
          </div>
          ) : (
            <div className="flex items-center justify-center h-44 text-gray-400">
              <div className="text-center">
                <UserCircle2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucune donnée disponible</p>
              </div>
            </div>
          )}
        </div>

        {/* ============================================ */}
        {/* ACCÈS RAPIDES */}
        {/* ============================================ */}
        <div className="col-span-12 bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6">Accès Rapides</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {[
              { icon: AlertTriangle, label: 'Sinistres', to: '/fpdg/sinistres', color: 'bg-red-50 text-red-600 hover:bg-red-100' },
              { icon: FileCheck, label: 'Valider', to: '/fpdg/validation', color: 'bg-amber-50 text-amber-600 hover:bg-amber-100' },
              { icon: CreditCard, label: 'Payer', to: '/fpdg/quittances', color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' },
              { icon: CheckSquare, label: 'Clôturer', to: '/fpdg/cloture', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
              { icon: BarChart3, label: 'Stats', to: '/fpdg/statistiques', color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
              { icon: Clock, label: 'Historique', to: '/fpdg/historique', color: 'bg-gray-50 text-gray-600 hover:bg-gray-100' },
              { icon: FileText, label: 'Rapports', to: '/fpdg/rapports', color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' },
              { icon: Building2, label: 'EMF', to: '/emfs', color: 'bg-teal-50 text-teal-600 hover:bg-teal-100' },
            ].map((item) => (
              <Link key={item.to} to={item.to} className="block">
                <div className={cn(
                  "text-center p-4 rounded-xl transition-all duration-200",
                  item.color
                )}>
                  <item.icon className="h-6 w-6 mx-auto mb-2" />
                  <p className="text-xs font-semibold">{item.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FpdgDashboard;
