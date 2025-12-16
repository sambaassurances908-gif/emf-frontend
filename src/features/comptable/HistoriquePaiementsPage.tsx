// src/features/comptable/HistoriquePaiementsPage.tsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Download,
  Building2,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { comptableService } from '@/services/comptable.service';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ModePaiement } from '@/types/sinistre.types';
import toast from 'react-hot-toast';

const EMF_OPTIONS = [
  { value: '', label: 'Tous les EMFs' },
  { value: '1', label: 'BAMBOO' },
  { value: '2', label: 'COFIDEC' },
  { value: '3', label: 'BCEG' },
  { value: '4', label: 'EDG' },
  { value: '5', label: 'SODEC' },
];

const MODE_PAIEMENT_OPTIONS = [
  { value: '', label: 'Tous les modes' },
  { value: 'virement', label: 'Virement' },
  { value: 'cheque', label: 'Chèque' },
  { value: 'especes', label: 'Espèces' },
  { value: 'mobile_money', label: 'Mobile Money' },
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

export const HistoriquePaiementsPage = () => {
  const { user } = useAuthStore();
  const [selectedEmfId, setSelectedEmfId] = useState('');
  const [modePaiement, setModePaiement] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [page, setPage] = useState(1);

  const userEmfId = user?.emf_id;
  const effectiveEmfId = userEmfId || (selectedEmfId ? Number(selectedEmfId) : undefined);

  const { data, isLoading } = useQuery({
    queryKey: ['comptable', 'historique', effectiveEmfId, modePaiement, dateDebut, dateFin, page],
    queryFn: () => comptableService.getHistoriquePaiements({
      emf_id: effectiveEmfId,
      mode_paiement: modePaiement as ModePaiement || undefined,
      date_debut: dateDebut || undefined,
      date_fin: dateFin || undefined,
      page,
      per_page: 20,
    }),
  });

  const paiements = data?.data || [];
  const meta = data?.meta;

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
    setModePaiement('');
    setDateDebut('');
    setDateFin('');
    setPage(1);
  };

  const hasFilters = selectedEmfId || modePaiement || dateDebut || dateFin;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Historique des paiements</h1>
          <p className="text-gray-600 mt-1">
            Consultez l'historique complet des paiements effectués
          </p>
        </div>
        <Button onClick={handleExport}>
          <Download size={16} className="mr-2" />
          Exporter CSV
        </Button>
      </div>

      {/* Filtres */}
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            {!userEmfId && (
              <div className="w-40">
                <label className="block text-xs font-medium text-gray-500 mb-1">EMF</label>
                <Select
                  value={selectedEmfId}
                  onChange={(e) => { setSelectedEmfId(e.target.value); setPage(1); }}
                  options={EMF_OPTIONS}
                />
              </div>
            )}
            <div className="w-40">
              <label className="block text-xs font-medium text-gray-500 mb-1">Mode paiement</label>
              <Select
                value={modePaiement}
                onChange={(e) => { setModePaiement(e.target.value); setPage(1); }}
                options={MODE_PAIEMENT_OPTIONS}
              />
            </div>
            <div className="w-40">
              <label className="block text-xs font-medium text-gray-500 mb-1">Date début</label>
              <Input
                type="date"
                value={dateDebut}
                onChange={(e) => { setDateDebut(e.target.value); setPage(1); }}
              />
            </div>
            <div className="w-40">
              <label className="block text-xs font-medium text-gray-500 mb-1">Date fin</label>
              <Input
                type="date"
                value={dateFin}
                onChange={(e) => { setDateFin(e.target.value); setPage(1); }}
              />
            </div>
            {hasFilters && (
              <Button variant="ghost" onClick={clearFilters} className="text-gray-500">
                Effacer filtres
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tableau */}
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center p-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : paiements.length === 0 ? (
            <EmptyState
              icon={<CheckCircle className="h-12 w-12" />}
              title="Aucun paiement"
              description="Aucun paiement ne correspond à vos critères"
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Référence</TableHead>
                    <TableHead>Sinistre</TableHead>
                    <TableHead>Bénéficiaire</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>N° Transaction</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Payé par</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paiements.map((paiement) => {
                    const ModeIcon = MODE_PAIEMENT_ICONS[paiement.mode_paiement] || CreditCard;
                    return (
                      <TableRow key={paiement.id} className="hover:bg-gray-50">
                        <TableCell className="font-mono text-sm">
                          {paiement.reference}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-gray-600">
                          {paiement.sinistre_numero}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {paiement.emf && (
                              <Badge variant="secondary" className="text-xs">
                                {paiement.emf.sigle}
                              </Badge>
                            )}
                            <span className="text-sm">{paiement.beneficiaire}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-emerald-600">
                          {formatCurrency(paiement.montant)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <ModeIcon size={14} className="text-gray-400" />
                            <span className="text-sm">
                              {MODE_PAIEMENT_LABELS[paiement.mode_paiement]}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-gray-500">
                          {paiement.numero_transaction || '-'}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(paiement.date_paiement)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {paiement.paye_par?.name || '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {meta && meta.last_page > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    Page {meta.current_page} sur {meta.last_page} ({meta.total} résultats)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                    >
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === meta.last_page}
                      onClick={() => setPage(p => p + 1)}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoriquePaiementsPage;
