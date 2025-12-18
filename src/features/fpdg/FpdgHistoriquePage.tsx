// src/features/fpdg/FpdgHistoriquePage.tsx

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  History, 
  Search, 
  CheckCircle2, 
  CreditCard, 
  Lock, 
  RefreshCw,
  Calendar,
  FileText,
  Download,
  ChevronRight,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { sinistreService } from '@/services/sinistre.service';
import { Sinistre } from '@/types/sinistre.types';
import { Link } from 'react-router-dom';

const STATUT_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  paye: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Payé' },
  cloture: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Clôturé' },
  rejete: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejeté' },
};

const STATUT_ICONS: Record<string, typeof CheckCircle2> = {
  paye: CreditCard,
  cloture: Lock,
  rejete: Lock,
};

export const FpdgHistoriquePage = () => {
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState<string>('');
  const [emfFilter, setEmfFilter] = useState<string>('');
  const [page] = useState(1);

  // Récupérer les sinistres payés
  const { data: payesData, isLoading: loadingPayes } = useQuery({
    queryKey: ['fpdg-historique-payes', page, search],
    queryFn: async () => {
      const response = await sinistreService.getAll({
        statut: 'paye',
        search: search || undefined,
        page,
        per_page: 25,
      });
      return response;
    },
  });

  // Récupérer les sinistres clôturés
  const { data: cloturesData, isLoading: loadingClotures } = useQuery({
    queryKey: ['fpdg-historique-clotures', page, search],
    queryFn: async () => {
      const response = await sinistreService.getAll({
        statut: 'cloture',
        search: search || undefined,
        page,
        per_page: 25,
      });
      return response;
    },
  });

  const isLoading = loadingPayes || loadingClotures;

  // Combiner et trier les sinistres
  const allSinistres = useMemo(() => {
    const payes = payesData?.data || [];
    const clotures = cloturesData?.data || [];
    
    let combined = [...payes, ...clotures];
    
    // Filtrer par statut si sélectionné
    if (statutFilter) {
      combined = combined.filter(s => s.statut === statutFilter);
    }
    
    // Filtrer par EMF si sélectionné
    if (emfFilter) {
      combined = combined.filter(s => 
        s.contrat?.emf?.id?.toString() === emfFilter || 
        s.emf_id?.toString() === emfFilter
      );
    }
    
    // Trier par date de mise à jour (plus récent d'abord)
    combined.sort((a, b) => 
      new Date(b.updated_at || b.date_sinistre).getTime() - 
      new Date(a.updated_at || a.date_sinistre).getTime()
    );
    
    return combined;
  }, [payesData, cloturesData, statutFilter, emfFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: allSinistres.length,
    payes: allSinistres.filter(s => s.statut === 'paye').length,
    clotures: allSinistres.filter(s => s.statut === 'cloture').length,
    montantTotal: allSinistres.reduce((acc, s) => acc + (s.montant_indemnisation || 0), 0),
  }), [allSinistres]);

  const handleExport = () => {
    // Export CSV
    const headers = ['Date', 'Référence', 'Assuré', 'Type', 'EMF', 'Montant', 'Statut'];
    const rows = allSinistres.map(s => [
      formatDate(s.updated_at || s.date_sinistre),
      s.numero_sinistre,
      s.nom_assure || s.contrat?.nom_prenom || 'N/A',
      s.type_sinistre,
      s.contrat?.emf?.sigle || 'N/A',
      s.montant_indemnisation?.toString() || '0',
      STATUT_COLORS[s.statut]?.label || s.statut,
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `historique-fpdg-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const refetch = () => {
    // React Query gère automatiquement le refetch via les queryKey
    window.location.reload();
  };

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
            <History className="text-amber-500" />
            Historique des Actions
          </h1>
          <p className="text-gray-600">Journal de toutes vos actions FPDG</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} size="sm">
            <Download size={16} className="mr-2" />
            Exporter
          </Button>
          <Button variant="outline" onClick={() => refetch()} size="sm">
            <RefreshCw size={16} className="mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="text-gray-600" size={18} />
            <span className="text-sm font-medium text-gray-700">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="text-emerald-600" size={18} />
            <span className="text-sm font-medium text-emerald-700">Payés</span>
          </div>
          <p className="text-2xl font-bold text-emerald-900">{stats.payes}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="text-purple-600" size={18} />
            <span className="text-sm font-medium text-purple-700">Clôturés</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">{stats.clotures}</p>
        </div>
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="text-amber-600" size={18} />
            <span className="text-sm font-medium text-amber-700">Montant indemnisé</span>
          </div>
          <p className="text-lg font-bold text-amber-900">{formatCurrency(stats.montantTotal)}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-xl shadow-soft border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Rechercher par référence..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={statutFilter}
            onChange={(e) => setStatutFilter(e.target.value)}
            options={[
              { value: '', label: 'Tous les statuts' },
              { value: 'paye', label: 'Payés' },
              { value: 'cloture', label: 'Clôturés' },
            ]}
            className="w-full md:w-48"
          />
          <Select
            value={emfFilter}
            onChange={(e) => setEmfFilter(e.target.value)}
            options={[
              { value: '', label: 'Tous les EMF' },
              { value: '1', label: 'BAMBOO' },
              { value: '2', label: 'COFIDEC' },
              { value: '3', label: 'BCEG' },
              { value: '4', label: 'EDG' },
              { value: '5', label: 'SODEC' },
            ]}
            className="w-full md:w-48"
          />
        </div>
      </div>

      {/* Liste des sinistres */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Sinistres traités</h3>
          <p className="text-sm text-gray-500">Sinistres payés et clôturés</p>
        </div>

        <div className="divide-y divide-gray-100">
          {allSinistres.length === 0 ? (
            <EmptyState
              icon={<History className="text-gray-300" size={48} />}
              title="Aucun sinistre trouvé"
              description="Aucun sinistre payé ou clôturé ne correspond à vos critères"
            />
          ) : (
            allSinistres.map((sinistre: Sinistre) => {
              const statutInfo = STATUT_COLORS[sinistre.statut] || { bg: 'bg-gray-100', text: 'text-gray-700', label: sinistre.statut };
              const Icon = STATUT_ICONS[sinistre.statut] || FileText;
              
              return (
                <Link 
                  key={sinistre.id} 
                  to={`/sinistres/${sinistre.id}/traitement`}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                      statutInfo.bg, statutInfo.text
                    )}>
                      <Icon size={20} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={cn(statutInfo.bg, statutInfo.text, "text-xs")}>
                              {statutInfo.label}
                            </Badge>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs font-medium text-gray-500">
                              {sinistre.contrat?.emf?.sigle || 'N/A'}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {sinistre.numero_sinistre}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {sinistre.nom_assure || sinistre.contrat?.nom_prenom || 'N/A'}
                            {' - '}
                            <span className="text-xs text-gray-400">
                              {sinistre.type_sinistre?.toUpperCase()}
                            </span>
                          </p>
                          {sinistre.montant_indemnisation && (
                            <p className="text-sm font-semibold text-emerald-600 mt-1">
                              {formatCurrency(sinistre.montant_indemnisation)}
                            </p>
                          )}
                        </div>

                        {/* Date & Action */}
                        <div className="text-right flex-shrink-0 flex items-center gap-3">
                          <div>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Calendar size={12} />
                              {formatDate(sinistre.updated_at || sinistre.date_sinistre)}
                            </div>
                            {sinistre.contrat?.emf && (
                              <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                                <Building2 size={12} />
                                {sinistre.contrat.emf.sigle}
                              </div>
                            )}
                          </div>
                          <ChevronRight size={16} className="text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default FpdgHistoriquePage;
