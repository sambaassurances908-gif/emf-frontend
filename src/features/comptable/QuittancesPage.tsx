// src/features/comptable/QuittancesPage.tsx

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  Filter,
  Receipt,
  CheckCircle2,
  Clock,
  CreditCard,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { comptableService } from '@/services/comptable.service';
import { sinistreService } from '@/services/sinistre.service';
import { formatCurrency } from '@/lib/utils';
import { QuittanceEnAttente } from '@/types/comptable.types';
import toast from 'react-hot-toast';

// Options de filtrage
const URGENCE_OPTIONS = [
  { value: '', label: 'Toutes les urgences' },
  { value: 'critique', label: '🔴 Critique (dépassé)' },
  { value: 'urgent', label: '🟠 Urgent (< 3 jours)' },
  { value: 'normal', label: '🟢 Normal' },
];

const EMF_OPTIONS = [
  { value: '', label: 'Tous les EMFs' },
  { value: '1', label: 'BAMBOO' },
  { value: '2', label: 'COFIDEC' },
  { value: '3', label: 'BCEG' },
  { value: '4', label: 'EDG' },
  { value: '5', label: 'SODEC' },
];

export const QuittancesPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmf, setSelectedEmf] = useState('');
  const [selectedUrgence, setSelectedUrgence] = useState('');
  const [page, setPage] = useState(1);
  
  // Modal de paiement
  const [selectedQuittance, setSelectedQuittance] = useState<QuittanceEnAttente | null>(null);
  const [paymentData, setPaymentData] = useState({
    reference_paiement: '',
    mode_paiement: 'virement',
    date_paiement: new Date().toISOString().split('T')[0],
  });

  // Récupération des quittances
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['comptable', 'quittances', selectedEmf, page],
    queryFn: () => comptableService.getQuittancesEnAttente({
      emf_id: selectedEmf ? Number(selectedEmf) : undefined,
      page,
      per_page: 20,
    }),
  });

  // Mutation pour payer une quittance
  const payerMutation = useMutation({
    mutationFn: ({ sinistreId, quittanceId, data }: { sinistreId: number; quittanceId: number; data: any }) =>
      sinistreService.payerQuittance(sinistreId, quittanceId, data),
    onSuccess: () => {
      toast.success('Paiement enregistré avec succès');
      setSelectedQuittance(null);
      queryClient.invalidateQueries({ queryKey: ['comptable'] });
    },
    onError: () => {
      toast.error('Erreur lors du paiement');
    },
  });

  const rawData = data?.data as any;
  const quittances: QuittanceEnAttente[] = Array.isArray(rawData) ? rawData : (rawData?.data || []);
  const meta = rawData?.meta;

  // Filtrage local par recherche et urgence
  const filteredQuittances = quittances.filter((q) => {
    const matchSearch = !searchTerm || 
      q.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.beneficiaire?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchUrgence = !selectedUrgence || (q as any).niveau_urgence === selectedUrgence;
    
    return matchSearch && matchUrgence;
  });

  const getUrgenceBadge = (niveau: string) => {
    switch (niveau) {
      case 'critique':
        return <Badge className="bg-red-100 text-red-700">Critique</Badge>;
      case 'urgent':
        return <Badge className="bg-orange-100 text-orange-700">Urgent</Badge>;
      default:
        return <Badge className="bg-green-100 text-green-700">Normal</Badge>;
    }
  };

  const handlePayer = () => {
    if (!selectedQuittance) return;
    payerMutation.mutate({
      sinistreId: selectedQuittance.sinistre_id,
      quittanceId: selectedQuittance.id,
      data: paymentData,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quittances à payer</h1>
          <p className="text-gray-600">Gérez les paiements des sinistres validés</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw size={16} className="mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Filtres */}
      <Card className="rounded-xl border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={selectedEmf}
              onChange={(e) => setSelectedEmf(e.target.value)}
              options={EMF_OPTIONS}
            />
            <Select
              value={selectedUrgence}
              onChange={(e) => setSelectedUrgence(e.target.value)}
              options={URGENCE_OPTIONS}
            />
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Filter size={16} />
              {filteredQuittances.length} quittance(s)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des quittances */}
      {filteredQuittances.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="h-12 w-12" />}
          title="Aucune quittance en attente"
          description="Toutes les quittances ont été payées"
        />
      ) : (
        <div className="grid gap-4">
          {filteredQuittances.map((quittance) => {
            const urgence = (quittance as any).niveau_urgence || 'normal';
            const dateEcheance = (quittance as any).date_echeance;
            const joursRestants = (quittance as any).jours_restants;
            const emfNom = (quittance as any).emf_nom;
            
            return (
              <Card key={quittance.id} className="rounded-xl border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Info principale */}
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        urgence === 'critique' ? 'bg-red-100' :
                        urgence === 'urgent' ? 'bg-orange-100' : 'bg-blue-100'
                      }`}>
                        <Receipt className={`${
                          urgence === 'critique' ? 'text-red-600' :
                          urgence === 'urgent' ? 'text-orange-600' : 'text-blue-600'
                        }`} size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900">{quittance.reference}</h3>
                          {getUrgenceBadge(urgence)}
                        </div>
                        <p className="text-sm text-gray-600">{quittance.beneficiaire}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          {dateEcheance && (
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              Échéance: {new Date(dateEcheance).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                          {joursRestants !== undefined && (
                            <span className={`font-medium ${
                              joursRestants < 0 ? 'text-red-600' :
                              joursRestants <= 3 ? 'text-orange-600' : 'text-gray-600'
                            }`}>
                              {joursRestants < 0 
                                ? `${Math.abs(joursRestants)} jours de retard`
                                : `${joursRestants} jours restants`
                              }
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Montant et actions */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(quittance.montant)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {emfNom || 'EMF non spécifié'}
                        </p>
                      </div>
                      <Button 
                        onClick={() => setSelectedQuittance(quittance)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <CreditCard size={16} className="mr-2" />
                        Payer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Précédent
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} sur {meta.last_page}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => p + 1)}
            disabled={page >= meta.last_page}
          >
            Suivant
          </Button>
        </div>
      )}

      {/* Modal de paiement */}
      <Modal
        isOpen={!!selectedQuittance}
        onClose={() => setSelectedQuittance(null)}
        title="Enregistrer le paiement"
      >
        {selectedQuittance && (
          <div className="space-y-4">
            {/* Résumé */}
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">{selectedQuittance.reference}</p>
                  <p className="text-sm text-gray-600">{selectedQuittance.beneficiaire}</p>
                </div>
                <p className="text-xl font-bold text-blue-600">
                  {formatCurrency(selectedQuittance.montant)}
                </p>
              </div>
            </div>

            {/* Formulaire */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Référence du paiement *
                </label>
                <Input
                  value={paymentData.reference_paiement}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, reference_paiement: e.target.value }))}
                  placeholder="Ex: VIR-2024-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mode de paiement
                </label>
                <Select
                  value={paymentData.mode_paiement}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, mode_paiement: e.target.value }))}
                  options={[
                    { value: 'virement', label: 'Virement bancaire' },
                    { value: 'cheque', label: 'Chèque' },
                    { value: 'especes', label: 'Espèces' },
                    { value: 'mobile_money', label: 'Mobile Money' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date du paiement
                </label>
                <Input
                  type="date"
                  value={paymentData.date_paiement}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, date_paiement: e.target.value }))}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setSelectedQuittance(null)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handlePayer}
                disabled={!paymentData.reference_paiement || payerMutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {payerMutation.isPending ? 'Traitement...' : 'Confirmer le paiement'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default QuittancesPage;
