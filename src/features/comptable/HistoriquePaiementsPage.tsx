// src/features/comptable/HistoriquePaiementsPage.tsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Download,
  Building2,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Receipt,
  FileCheck,
  Lock,
  Loader2,
  LucideIcon
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { sinistreService } from '@/services/sinistre.service';
import { comptableService } from '@/services/comptable.service';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ModePaiement, Sinistre, Quittance } from '@/types/sinistre.types';
import toast from 'react-hot-toast';

const EMF_OPTIONS = [
  { value: '', label: 'Tous les EMFs' },
  { value: '1', label: 'BAMBOO' },
  { value: '2', label: 'COFIDEC' },
  { value: '3', label: 'BCEG' },
  { value: '4', label: 'EDG' },
  { value: '5', label: 'SODEC' },
];

const MODE_PAIEMENT_ICONS: Record<ModePaiement, typeof Building2> = {
  virement: Building2,
  cheque: CreditCard,
  especes: Banknote,
  mobile_money: Smartphone,
};

const MODE_PAIEMENT_LABELS: Record<ModePaiement, string> = {
  virement: 'Virement',
  cheque: 'Chèque',
  especes: 'Espèces',
  mobile_money: 'Mobile Money',
};

const STATUT_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'paye', label: 'Payé' },
  { value: 'cloture', label: 'Clôturé' },
];

const TYPE_QUITTANCE_LABELS: Record<string, string> = {
  capital_sans_interets: 'Capital sans intérêts (EMF)',
  capital_restant_du: 'Capital restant dû',
  capital_prevoyance: 'Capital prévoyance',
  indemnite_journaliere: 'Indemnité journalière',
  frais_medicaux: 'Frais médicaux',
};

// Composant StatCard style Finve
const StatCard = ({ 
  icon: Icon,
  label, 
  value, 
  iconBg,
  iconColor
}: { 
  icon: LucideIcon;
  label: string; 
  value: string | number; 
  iconBg: string;
  iconColor: string;
}) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100/50">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center`}>
        <Icon size={24} className={iconColor} />
      </div>
      <div>
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
      </div>
    </div>
  </div>
);

// Composant pour afficher les quittances d'un sinistre
const SinistreQuittances = ({ sinistreId }: { sinistreId: number }) => {
  const { data: quittances, isLoading } = useQuery({
    queryKey: ['sinistre', sinistreId, 'quittances'],
    queryFn: () => sinistreService.getQuittances(sinistreId),
  });

  // Filtrer uniquement les quittances payées
  const quittancesPayees = (quittances || []).filter((q: Quittance) => q.statut === 'payee');

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
        <p className="text-sm text-gray-500 mt-2">Chargement des quittances...</p>
      </div>
    );
  }

  if (quittancesPayees.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <Receipt className="h-8 w-8 mx-auto mb-2 text-gray-300" />
        <p>Aucune quittance payée pour ce sinistre</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {quittancesPayees.map((quittance: Quittance) => {
        const ModeIcon = quittance.mode_paiement 
          ? MODE_PAIEMENT_ICONS[quittance.mode_paiement] || CreditCard
          : CreditCard;
        
        return (
          <div key={quittance.id} className="p-4 hover:bg-gray-50/50 transition-colors">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {/* Référence & Type */}
              <div>
                <p className="text-xs text-gray-400 mb-1">Référence</p>
                <p className="font-mono text-sm font-semibold text-gray-900">{quittance.reference}</p>
                <p className="text-xs text-emerald-500 mt-1">
                  {TYPE_QUITTANCE_LABELS[quittance.type] || quittance.type}
                </p>
              </div>
              
              {/* Bénéficiaire */}
              <div>
                <p className="text-xs text-gray-400 mb-1">Bénéficiaire</p>
                <p className="text-sm text-gray-700">{quittance.beneficiaire}</p>
              </div>
              
              {/* Montant */}
              <div>
                <p className="text-xs text-gray-400 mb-1">Montant</p>
                <p className="font-bold text-emerald-500">{formatCurrency(quittance.montant)}</p>
              </div>
              
              {/* Statut */}
              <div>
                <p className="text-xs text-gray-400 mb-1">Statut</p>
                <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                  <CheckCircle size={12} className="mr-1" />
                  Payée
                </Badge>
              </div>
              
              {/* Paiement */}
              <div>
                <p className="text-xs text-gray-400 mb-1">Paiement</p>
                {quittance.date_paiement ? (
                  <>
                    <div className="flex items-center gap-1.5">
                      <ModeIcon size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {quittance.mode_paiement ? MODE_PAIEMENT_LABELS[quittance.mode_paiement] : '-'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(quittance.date_paiement)}
                    </p>
                    {quittance.numero_transaction && (
                      <p className="font-mono text-xs text-gray-400">
                        {quittance.numero_transaction}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-400">-</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const HistoriquePaiementsPage = () => {
  const { user } = useAuthStore();
  const [selectedEmfId, setSelectedEmfId] = useState('');
  const [selectedStatut, setSelectedStatut] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [page, setPage] = useState(1);
  const [expandedSinistres, setExpandedSinistres] = useState<Set<number>>(new Set());

  const userEmfId = user?.emf_id;
  const effectiveEmfId = userEmfId || (selectedEmfId ? Number(selectedEmfId) : undefined);

  // Récupérer les sinistres payés et clôturés
  const { data: sinistresData, isLoading } = useQuery({
    queryKey: ['comptable', 'sinistres-clotures', effectiveEmfId, selectedStatut, dateDebut, dateFin, page],
    queryFn: async () => {
      // Récupérer les sinistres payés
      const payesResponse = await sinistreService.getAll({
        statut: 'paye',
        emf_id: effectiveEmfId,
        date_debut: dateDebut || undefined,
        date_fin: dateFin || undefined,
        page,
        per_page: 50,
      });

      // Récupérer les sinistres clôturés
      const cloturesResponse = await sinistreService.getAll({
        statut: 'cloture',
        emf_id: effectiveEmfId,
        date_debut: dateDebut || undefined,
        date_fin: dateFin || undefined,
        page,
        per_page: 50,
      });

      // Combiner les deux
      const allSinistres = [
        ...(payesResponse.data || []),
        ...(cloturesResponse.data || [])
      ];

      // Filtrer par statut si sélectionné
      let filteredSinistres = allSinistres;
      if (selectedStatut) {
        filteredSinistres = allSinistres.filter(s => s.statut === selectedStatut);
      }

      // Trier par date de sinistre (plus récent d'abord)
      filteredSinistres.sort((a, b) => 
        new Date(b.date_sinistre).getTime() - new Date(a.date_sinistre).getTime()
      );

      return {
        sinistres: filteredSinistres,
        meta: {
          total: filteredSinistres.length,
          current_page: page,
          last_page: 1,
        }
      };
    },
  });

  const sinistres = sinistresData?.sinistres || [];
  const meta = sinistresData?.meta;

  const toggleSinistre = (sinistreId: number) => {
    setExpandedSinistres(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sinistreId)) {
        newSet.delete(sinistreId);
      } else {
        newSet.add(sinistreId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedSinistres(new Set(sinistres.map((s: Sinistre) => s.id)));
  };

  const collapseAll = () => {
    setExpandedSinistres(new Set());
  };

  const handleExport = async () => {
    try {
      await comptableService.downloadExport({
        emf_id: effectiveEmfId,
        date_debut: dateDebut || undefined,
        date_fin: dateFin || undefined,
        format: 'csv',
      });
      toast.success('Export téléchargé');
    } catch {
      toast.error('Erreur lors de l\'export');
    }
  };

  const clearFilters = () => {
    setSelectedEmfId('');
    setSelectedStatut('');
    setDateDebut('');
    setDateFin('');
    setPage(1);
  };

  const hasFilters = selectedEmfId || selectedStatut || dateDebut || dateFin;

  const getStatutBadge = (statut: string) => {
    if (statut === 'paye') {
      return (
        <Badge className="bg-emerald-100 text-emerald-700 text-xs">
          <CheckCircle size={10} className="mr-1" />
          Payé
        </Badge>
      );
    }
    if (statut === 'cloture') {
      return (
        <Badge className="bg-gray-200 text-gray-700 text-xs">
          <Lock size={10} className="mr-1" />
          Clôturé
        </Badge>
      );
    }
    return <Badge className="text-xs">{statut}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Historique des sinistres</h1>
          <p className="text-gray-600 mt-1">
            Sinistres payés et clôturés avec leurs quittances
          </p>
        </div>
        <Button onClick={handleExport} className="bg-emerald-600 hover:bg-emerald-700">
          <Download size={16} className="mr-2" />
          Exporter CSV
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          icon={FileCheck}
          label="Sinistres traités"
          value={sinistres.length.toString()}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
        />
        <StatCard
          icon={CheckCircle}
          label="Sinistres clôturés"
          value={sinistres.filter((s: Sinistre) => s.statut === 'cloture').length.toString()}
          iconBg="bg-gray-200"
          iconColor="text-gray-600"
        />
      </div>

      {/* Filtres */}
      <Card className="rounded-2xl border-0 shadow-sm bg-white">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            {!userEmfId && (
              <div className="w-40">
                <label className="block text-xs font-medium text-gray-600 mb-1">EMF</label>
                <Select
                  value={selectedEmfId}
                  onChange={(e) => { setSelectedEmfId(e.target.value); setPage(1); }}
                  options={EMF_OPTIONS}
                />
              </div>
            )}
            <div className="w-40">
              <label className="block text-xs font-medium text-gray-600 mb-1">Statut</label>
              <Select
                value={selectedStatut}
                onChange={(e) => { setSelectedStatut(e.target.value); setPage(1); }}
                options={STATUT_OPTIONS}
              />
            </div>
            <div className="w-40">
              <label className="block text-xs font-medium text-gray-600 mb-1">Date début</label>
              <Input
                type="date"
                value={dateDebut}
                onChange={(e) => { setDateDebut(e.target.value); setPage(1); }}
              />
            </div>
            <div className="w-40">
              <label className="block text-xs font-medium text-gray-600 mb-1">Date fin</label>
              <Input
                type="date"
                value={dateFin}
                onChange={(e) => { setDateFin(e.target.value); setPage(1); }}
              />
            </div>
            {hasFilters && (
              <Button variant="ghost" onClick={clearFilters} className="text-gray-500 hover:text-gray-700">
                Effacer filtres
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      {sinistres.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 px-3 py-1">
              <AlertCircle size={14} className="mr-1" />
              {sinistres.length} sinistre{sinistres.length > 1 ? 's' : ''}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={expandAll} className="text-gray-600 border-gray-300">
              Tout déplier
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll} className="text-gray-600 border-gray-300">
              Tout replier
            </Button>
          </div>
        </div>
      )}

      {/* Liste des sinistres */}
      {isLoading ? (
        <div className="flex justify-center p-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : sinistres.length === 0 ? (
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardContent className="p-0">
            <EmptyState
              icon={<CheckCircle className="h-12 w-12 text-emerald-400" />}
              title="Aucun sinistre"
              description="Aucun sinistre payé ou clôturé ne correspond à vos critères"
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sinistres.map((sinistre: Sinistre) => {
            const isExpanded = expandedSinistres.has(sinistre.id);
            
            return (
              <Card key={sinistre.id} className="rounded-2xl border-0 shadow-sm overflow-hidden">
                {/* En-tête du sinistre - Style FINVE (gris + accent emerald) */}
                <div
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-700 to-gray-600 cursor-pointer hover:from-gray-600 hover:to-gray-500 transition-colors"
                  onClick={() => toggleSinistre(sinistre.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-gray-300">
                      {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-lg">
                          {sinistre.numero_sinistre}
                        </span>
                        {sinistre.contrat?.emf && (
                          <Badge className="bg-white/20 text-white text-xs">
                            {sinistre.contrat.emf.sigle}
                          </Badge>
                        )}
                        {getStatutBadge(sinistre.statut)}
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-gray-300 text-sm">
                          {sinistre.nom_assure || sinistre.contrat?.nom_prenom || 'N/A'}
                        </p>
                        <span className="text-gray-400 text-xs">•</span>
                        <p className="text-gray-400 text-xs">
                          {sinistre.type_sinistre?.toUpperCase()}
                        </p>
                        <span className="text-gray-400 text-xs">•</span>
                        <p className="text-gray-400 text-xs">
                          {formatDate(sinistre.date_sinistre)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-emerald-500 text-white text-xs">
                      Quittances payées
                    </Badge>
                    <p className="text-gray-300 text-xs mt-1">
                      Cliquez pour voir les détails
                    </p>
                  </div>
                </div>

                {/* Quittances payées du sinistre - Chargées via API */}
                {isExpanded && (
                  <CardContent className="p-0 bg-white">
                    <SinistreQuittances sinistreId={sinistre.id} />
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm">
          <p className="text-sm text-gray-600">
            Page {meta.current_page} sur {meta.last_page} ({meta.total} résultats)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="border-gray-300 text-gray-700"
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === meta.last_page}
              onClick={() => setPage(p => p + 1)}
              className="border-gray-300 text-gray-700"
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoriquePaiementsPage;
