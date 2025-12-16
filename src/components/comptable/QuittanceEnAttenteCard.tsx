// src/components/comptable/QuittanceEnAttenteCard.tsx

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CreditCard, 
  Building2, 
  User, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Wallet,
  Banknote,
  Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { QuittanceEnAttente } from '@/types/comptable.types';
import { ModePaiement } from '@/types/sinistre.types';
import { sinistreService } from '@/services/sinistre.service';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface QuittanceEnAttenteCardProps {
  quittance: QuittanceEnAttente;
  showEmf?: boolean;
  compact?: boolean;
}

const MODE_PAIEMENT_OPTIONS = [
  { value: 'virement', label: 'Virement bancaire', icon: Building2 },
  { value: 'cheque', label: 'Chèque', icon: CreditCard },
  { value: 'especes', label: 'Espèces', icon: Banknote },
  { value: 'mobile_money', label: 'Mobile Money', icon: Smartphone },
];

const TYPE_QUITTANCE_LABELS: Record<string, { label: string; icon: typeof Building2 }> = {
  capital_sans_interets: { label: 'Capital sans intérêts', icon: Building2 },
  capital_restant_du: { label: 'Capital restant dû', icon: Wallet },
  capital_prevoyance: { label: 'Capital prévoyance', icon: User },
  indemnite_journaliere: { label: 'Indemnité journalière', icon: Clock },
  frais_medicaux: { label: 'Frais médicaux', icon: CreditCard },
};

export const QuittanceEnAttenteCard = ({ 
  quittance, 
  showEmf = true,
  compact = false 
}: QuittanceEnAttenteCardProps) => {
  const queryClient = useQueryClient();
  const [showPayerModal, setShowPayerModal] = useState(false);
  const [modePaiement, setModePaiement] = useState<ModePaiement>('virement');
  const [numeroTransaction, setNumeroTransaction] = useState('');

  // Mutation pour payer la quittance
  const payerMutation = useMutation({
    mutationFn: () => sinistreService.payerQuittance(
      quittance.sinistre_id,
      quittance.id,
      { mode_paiement: modePaiement, numero_transaction: numeroTransaction || undefined }
    ),
    onSuccess: () => {
      toast.success('Paiement enregistré avec succès');
      queryClient.invalidateQueries({ queryKey: ['comptable'] });
      queryClient.invalidateQueries({ queryKey: ['sinistre'] });
      setShowPayerModal(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors du paiement');
    },
  });

  const typeConfig = TYPE_QUITTANCE_LABELS[quittance.type] || { 
    label: quittance.type, 
    icon: CreditCard 
  };
  const TypeIcon = typeConfig.icon;

  const delai = quittance.sinistre?.delai_paiement;
  const isUrgent = delai?.depasse;
  const isProche = delai && !delai.depasse && delai.jours_restants <= 3;

  if (compact) {
    return (
      <div className={`flex items-center justify-between p-3 rounded-lg border ${
        isUrgent ? 'border-red-200 bg-red-50' : isProche ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200 bg-gray-50'
      }`}>
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <TypeIcon size={16} className="text-gray-400 flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-mono text-sm font-medium truncate">{quittance.reference}</p>
            <p className="text-xs text-gray-500">{quittance.beneficiaire}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{formatCurrency(quittance.montant)}</span>
          <Button
            size="sm"
            onClick={() => setShowPayerModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <CreditCard size={14} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`p-4 rounded-xl border transition-all hover:shadow-md ${
        isUrgent 
          ? 'border-red-200 bg-red-50/50' 
          : isProche 
            ? 'border-yellow-200 bg-yellow-50/50' 
            : 'border-gray-200 bg-white'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isUrgent ? 'bg-red-100' : isProche ? 'bg-yellow-100' : 'bg-gray-100'
            }`}>
              <TypeIcon size={18} className={
                isUrgent ? 'text-red-600' : isProche ? 'text-yellow-600' : 'text-gray-600'
              } />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold">{quittance.reference}</span>
                {isUrgent && (
                  <Badge className="bg-red-100 text-red-700 text-xs">
                    <AlertTriangle size={10} className="mr-1" />
                    Urgent
                  </Badge>
                )}
                {isProche && !isUrgent && (
                  <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                    <Clock size={10} className="mr-1" />
                    Proche échéance
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-0.5">{typeConfig.label}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">{formatCurrency(quittance.montant)}</p>
            <p className="text-xs text-gray-500">
              {quittance.statut === 'validee' ? 'Validée' : 'En attente'}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Bénéficiaire</span>
            <span className="font-medium">{quittance.beneficiaire}</span>
          </div>
          {quittance.sinistre && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Sinistre</span>
              <span className="font-mono text-xs">{quittance.sinistre.numero_sinistre}</span>
            </div>
          )}
          {showEmf && quittance.emf && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">EMF</span>
              <Badge variant="secondary">{quittance.emf.sigle}</Badge>
            </div>
          )}
          {delai && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Échéance</span>
              <span className={`font-medium ${isUrgent ? 'text-red-600' : isProche ? 'text-yellow-600' : 'text-gray-700'}`}>
                {formatDate(delai.date_echeance)}
                {delai.jours_restants < 0 
                  ? ` (dépassé de ${Math.abs(delai.jours_restants)}j)`
                  : ` (${delai.jours_restants}j restants)`
                }
              </span>
            </div>
          )}
        </div>

        <div className="mt-4">
          <Button
            onClick={() => setShowPayerModal(true)}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            disabled={quittance.statut !== 'validee'}
          >
            <CreditCard size={16} className="mr-2" />
            Payer cette quittance
          </Button>
          {quittance.statut !== 'validee' && (
            <p className="text-xs text-center text-gray-500 mt-2">
              Cette quittance doit d'abord être validée
            </p>
          )}
        </div>
      </div>

      {/* Modal de paiement */}
      <Modal
        isOpen={showPayerModal}
        onClose={() => setShowPayerModal(false)}
        title="Enregistrer le paiement"
      >
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-sm font-semibold">{quittance.reference}</p>
                <p className="text-sm text-gray-600">{quittance.beneficiaire}</p>
              </div>
              <p className="text-xl font-bold text-emerald-600">
                {formatCurrency(quittance.montant)}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mode de paiement *
            </label>
            <Select
              value={modePaiement}
              onChange={(e) => setModePaiement(e.target.value as ModePaiement)}
              options={MODE_PAIEMENT_OPTIONS.map(opt => ({
                value: opt.value,
                label: opt.label
              }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numéro de transaction
            </label>
            <Input
              value={numeroTransaction}
              onChange={(e) => setNumeroTransaction(e.target.value)}
              placeholder="Ex: VIR-2024-12345"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optionnel - Référence du virement, chèque ou transaction
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowPayerModal(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={() => payerMutation.mutate()}
              disabled={payerMutation.isPending}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {payerMutation.isPending ? (
                'Traitement...'
              ) : (
                <>
                  <CheckCircle size={16} className="mr-2" />
                  Confirmer le paiement
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default QuittanceEnAttenteCard;
