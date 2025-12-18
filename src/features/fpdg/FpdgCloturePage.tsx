// src/features/fpdg/FpdgCloturePage.tsx

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  CheckSquare, 
  CheckCircle2,
  Eye,
  RefreshCw,
  Building2,
  AlertTriangle,
  Lock,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { fpdgService } from '@/services/fpdg.service';
import { sinistreService } from '@/services/sinistre.service';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export const FpdgCloturePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedSinistre, setSelectedSinistre] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [motifCloture, setMotifCloture] = useState('');

  // Récupérer les sinistres pouvant être clôturés
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['fpdg-sinistres-cloture'],
    queryFn: async () => {
      // Sinistres validés/payés qui peuvent être clôturés
      const response = await sinistreService.getAll({ 
        statut: 'paye' as any,
        per_page: 50 
      });
      return response;
    },
  });

  const sinistres = data?.data || [];
  
  // Filtrer ceux qui peuvent être clôturés
  const sinistresACloturer = sinistres.filter((s: any) => 
    s.statut === 'paye' || s.statut === 'valide'
  );

  // Mutation pour clôturer
  const clotureMutation = useMutation({
    mutationFn: async ({ sinistreId, motif }: { sinistreId: number; motif: string }) => {
      return fpdgService.cloturerSinistre(sinistreId, { motif_cloture: motif });
    },
    onSuccess: () => {
      toast.success('Sinistre clôturé avec succès');
      queryClient.invalidateQueries({ queryKey: ['fpdg-sinistres-cloture'] });
      setShowConfirmModal(false);
      setSelectedSinistre(null);
      setMotifCloture('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la clôture');
    }
  });

  const handleCloture = (sinistre: any) => {
    setSelectedSinistre(sinistre);
    setShowConfirmModal(true);
  };

  const confirmCloture = () => {
    if (selectedSinistre) {
      clotureMutation.mutate({
        sinistreId: selectedSinistre.id,
        motif: motifCloture || 'Dossier complet - Toutes les indemnités ont été payées'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CheckSquare className="text-blue-500" />
            Clôture des Sinistres
          </h1>
          <p className="text-gray-600">Sinistres prêts pour clôture définitive</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-blue-50 rounded-xl border border-blue-200">
            <span className="text-sm font-semibold text-blue-700">
              {sinistresACloturer.length} à clôturer
            </span>
          </div>
          <Button variant="outline" onClick={() => refetch()} size="sm">
            <RefreshCw size={16} className="mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Warning box */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-red-800">Action irréversible</h3>
            <p className="text-sm text-red-700 mt-1">
              La clôture d'un sinistre est une action <strong>définitive et irréversible</strong>. 
              Assurez-vous que toutes les indemnités ont été payées et que le dossier est complet.
            </p>
          </div>
        </div>
      </div>

      {/* Liste */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : sinistresACloturer.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="h-12 w-12 text-emerald-500" />}
          title="Aucun sinistre à clôturer"
          description="Aucun sinistre n'est prêt pour la clôture"
        />
      ) : (
        <div className="grid gap-4">
          {sinistresACloturer.map((sinistre: any) => (
            <div 
              key={sinistre.id}
              className="bg-white p-5 rounded-2xl shadow-soft border border-gray-100 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <CheckSquare className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{sinistre.reference}</h3>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        sinistre.statut === 'paye' ? 'bg-green-100 text-green-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {sinistre.statut === 'paye' ? 'Payé' : 'Validé'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {sinistre.type_sinistre} - {sinistre.assure_nom || sinistre.contrat?.nom_complet}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Building2 size={12} />
                        {sinistre.emf?.sigle || sinistre.contrat_type?.replace('Contrat', '')}
                      </div>
                      <span className="text-xs text-gray-400">•</span>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar size={12} />
                        Déclaré le {formatDate(sinistre.date_declaration || sinistre.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Montant indemnisé</p>
                    <p className="text-xl font-bold text-emerald-600">
                      {formatCurrency(sinistre.montant_total_indemnise || sinistre.capital_restant_du || 0)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {sinistre.quittances_payees || 0}/{sinistre.quittances_total || 0} quittances payées
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/sinistres/detail/${sinistre.id}`)}
                    >
                      <Eye size={16} className="mr-1" />
                      Dossier
                    </Button>
                    <Button
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600"
                      onClick={() => handleCloture(sinistre)}
                    >
                      <Lock size={16} className="mr-1" />
                      Clôturer
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmation */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirmer la clôture"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle size={18} />
              <span className="font-semibold text-sm">Cette action est irréversible</span>
            </div>
          </div>

          {selectedSinistre && (
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="font-semibold text-gray-900">{selectedSinistre.reference}</p>
              <p className="text-sm text-gray-500">
                {selectedSinistre.type_sinistre} - {selectedSinistre.assure_nom}
              </p>
              <p className="text-lg font-bold text-emerald-600 mt-2">
                {formatCurrency(selectedSinistre.montant_total_indemnise || selectedSinistre.capital_restant_du || 0)}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motif de clôture (optionnel)
            </label>
            <Input
              placeholder="Ex: Dossier complet, toutes indemnités versées"
              value={motifCloture}
              onChange={(e) => setMotifCloture(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
              Annuler
            </Button>
            <Button 
              className="bg-blue-500 hover:bg-blue-600"
              onClick={confirmCloture}
              disabled={clotureMutation.isPending}
            >
              {clotureMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Clôture...
                </>
              ) : (
                <>
                  <Lock size={16} className="mr-1" />
                  Clôturer définitivement
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FpdgCloturePage;
