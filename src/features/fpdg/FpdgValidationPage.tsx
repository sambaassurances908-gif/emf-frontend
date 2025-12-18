// src/features/fpdg/FpdgValidationPage.tsx

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  FileCheck, 
  CheckCircle2,
  Eye,
  RefreshCw,
  Building2,
  AlertCircle,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { fpdgService } from '@/services/fpdg.service';
import { comptableService } from '@/services/comptable.service';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export const FpdgValidationPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedQuittance, setSelectedQuittance] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Récupérer les quittances en attente de validation
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['fpdg-quittances-validation'],
    queryFn: () => comptableService.getQuittancesEnAttente({ per_page: 50 }),
  });

  const quittancesRaw = data?.data as any;
  const quittances = Array.isArray(quittancesRaw) ? quittancesRaw : (quittancesRaw?.data || []);
  
  // Filtrer uniquement celles en attente de validation
  const quittancesAValider = quittances.filter((q: any) => 
    q.statut === 'en_attente' || !q.date_validation
  );

  // Mutation pour valider
  const validateMutation = useMutation({
    mutationFn: async ({ sinistreId, quittanceId }: { sinistreId: number; quittanceId: number }) => {
      return fpdgService.validerQuittance(sinistreId, quittanceId);
    },
    onSuccess: () => {
      toast.success('Quittance validée avec succès');
      queryClient.invalidateQueries({ queryKey: ['fpdg-quittances-validation'] });
      setShowConfirmModal(false);
      setSelectedQuittance(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la validation');
    }
  });

  const handleValidate = (quittance: any) => {
    setSelectedQuittance(quittance);
    setShowConfirmModal(true);
  };

  const confirmValidation = () => {
    if (selectedQuittance) {
      validateMutation.mutate({
        sinistreId: selectedQuittance.sinistre_id,
        quittanceId: selectedQuittance.id
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileCheck className="text-amber-500" />
            Validation des Quittances
          </h1>
          <p className="text-gray-600">Quittances en attente de validation FPDG</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-amber-50 rounded-xl border border-amber-200">
            <span className="text-sm font-semibold text-amber-700">
              {quittancesAValider.length} en attente
            </span>
          </div>
          <Button variant="outline" onClick={() => refetch()} size="sm">
            <RefreshCw size={16} className="mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Info box */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-amber-800">Rôle du Valideur</h3>
            <p className="text-sm text-amber-700 mt-1">
              En tant que FPDG, vous validez les quittances avant leur paiement. 
              Cette validation atteste que le dossier est complet et conforme.
            </p>
          </div>
        </div>
      </div>

      {/* Liste */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : quittancesAValider.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="h-12 w-12 text-emerald-500" />}
          title="Aucune quittance à valider"
          description="Toutes les quittances ont été validées"
        />
      ) : (
        <div className="grid gap-4">
          {quittancesAValider.map((quittance: any) => (
            <div 
              key={quittance.id}
              className="bg-white p-5 rounded-2xl shadow-soft border border-gray-100 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <FileCheck className="text-amber-600" size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{quittance.reference}</h3>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                        {quittance.type || 'Indemnité'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Sinistre: {quittance.sinistre_reference || `#${quittance.sinistre_id}`}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Building2 size={12} />
                        {quittance.emf_nom || quittance.emf_sigle || '-'}
                      </div>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-400">
                        Créée le {formatDate(quittance.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Montant</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(quittance.montant)}</p>
                    <p className="text-xs text-gray-500">{quittance.beneficiaire}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/sinistres/detail/${quittance.sinistre_id}`)}
                    >
                      <Eye size={16} className="mr-1" />
                      Dossier
                    </Button>
                    <Button
                      size="sm"
                      className="bg-amber-500 hover:bg-amber-600"
                      onClick={() => handleValidate(quittance)}
                    >
                      <Check size={16} className="mr-1" />
                      Valider
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
        title="Confirmer la validation"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Êtes-vous sûr de vouloir valider cette quittance ?
          </p>
          {selectedQuittance && (
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="font-semibold text-gray-900">{selectedQuittance.reference}</p>
              <p className="text-sm text-gray-500">Bénéficiaire: {selectedQuittance.beneficiaire}</p>
              <p className="text-lg font-bold text-amber-600 mt-2">
                {formatCurrency(selectedQuittance.montant)}
              </p>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
              Annuler
            </Button>
            <Button 
              className="bg-amber-500 hover:bg-amber-600"
              onClick={confirmValidation}
              disabled={validateMutation.isPending}
            >
              {validateMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Validation...
                </>
              ) : (
                <>
                  <Check size={16} className="mr-1" />
                  Confirmer la validation
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FpdgValidationPage;
