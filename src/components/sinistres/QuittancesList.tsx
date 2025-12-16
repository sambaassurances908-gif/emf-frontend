// src/components/sinistres/QuittancesList.tsx
import { useState } from 'react';
import { Quittance, TypeQuittance, QuittanceStatut, ModePaiement } from '@/types/sinistre.types';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  CheckCircle, 
  CreditCard, 
  Clock, 
  XCircle, 
  Wallet,
  Building2,
  User,
  FileText,
  AlertCircle,
  Info
} from 'lucide-react';

interface QuittancesListProps {
  quittances: Quittance[];
  avecPrevoyance?: boolean;
  onValider?: (quittanceId: number) => Promise<void>;
  onPayer?: (quittanceId: number, paiement: { mode_paiement: ModePaiement; numero_transaction?: string }) => Promise<void>;
  isLoading?: boolean;
}

// Configuration des types de quittance
const TYPE_QUITTANCE_CONFIG: Record<TypeQuittance, { label: string; icon: typeof Building2; description: string }> = {
  capital_sans_interets: {
    label: 'Capital sans intérêts',
    icon: Building2,
    description: 'Remboursement à l\'EMF'
  },
  capital_restant_du: {
    label: 'Capital restant dû',
    icon: Wallet,
    description: 'Capital restant à rembourser'
  },
  capital_prevoyance: {
    label: 'Capital prévoyance',
    icon: User,
    description: 'Versement au bénéficiaire'
  },
  indemnite_journaliere: {
    label: 'Indemnité journalière',
    icon: FileText,
    description: 'Indemnisation journalière'
  },
  frais_medicaux: {
    label: 'Frais médicaux',
    icon: FileText,
    description: 'Remboursement des frais médicaux'
  }
};

// Configuration des statuts de quittance
const STATUT_QUITTANCE_CONFIG: Record<QuittanceStatut, { label: string; className: string; icon: typeof Clock }> = {
  en_attente: {
    label: 'En attente',
    className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: Clock
  },
  validee: {
    label: 'Validée',
    className: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: CheckCircle
  },
  payee: {
    label: 'Payée',
    className: 'bg-green-100 text-green-700 border-green-200',
    icon: CreditCard
  },
  annulee: {
    label: 'Annulée',
    className: 'bg-red-100 text-red-700 border-red-200',
    icon: XCircle
  }
};

// Options de mode de paiement
const MODES_PAIEMENT = [
  { value: 'virement', label: 'Virement bancaire' },
  { value: 'cheque', label: 'Chèque' },
  { value: 'especes', label: 'Espèces' },
  { value: 'mobile_money', label: 'Mobile Money' },
];

export const QuittancesList = ({ 
  quittances, 
  avecPrevoyance = false,
  onValider,
  onPayer,
  isLoading = false
}: QuittancesListProps) => {
  const { peutValiderSinistre, peutPayerQuittance } = useAuthStore();
  const [showPaiementModal, setShowPaiementModal] = useState(false);
  const [selectedQuittance, setSelectedQuittance] = useState<Quittance | null>(null);
  const [modePaiement, setModePaiement] = useState<ModePaiement>('virement');
  const [numeroTransaction, setNumeroTransaction] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const montantTotal = quittances.reduce((sum, q) => sum + q.montant, 0);
  const peutValider = peutValiderSinistre();
  const peutPayer = peutPayerQuittance();

  const handleValider = async (quittanceId: number) => {
    if (!onValider) return;
    setIsSubmitting(true);
    try {
      await onValider(quittanceId);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenPaiementModal = (quittance: Quittance) => {
    setSelectedQuittance(quittance);
    setModePaiement('virement');
    setNumeroTransaction('');
    setShowPaiementModal(true);
  };

  const handlePayer = async () => {
    if (!onPayer || !selectedQuittance) return;
    setIsSubmitting(true);
    try {
      await onPayer(selectedQuittance.id, {
        mode_paiement: modePaiement,
        numero_transaction: numeroTransaction || undefined
      });
      setShowPaiementModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (quittances.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <AlertCircle className="h-10 w-10 mx-auto mb-2 text-gray-300" />
        <p>Aucune quittance générée</p>
        <p className="text-sm mt-1">Les quittances seront générées lors du règlement</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header avec total */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Quittances</h3>
        <div className="text-right">
          <span className="text-sm text-gray-500">Total : </span>
          <span className="text-lg font-bold text-emerald-600">{formatCurrency(montantTotal)}</span>
        </div>
      </div>

      {/* Info prévoyance */}
      {avecPrevoyance && (
        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
          <Info size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-blue-800 font-medium">Contrat avec garantie prévoyance</p>
            <p className="text-xs text-blue-600 mt-0.5">
              2 quittances générées : une pour l'EMF (capital sans intérêts) et une pour le bénéficiaire (capital prévoyance)
            </p>
          </div>
        </div>
      )}

      {/* Liste des quittances */}
      <div className="space-y-3">
        {quittances.map((quittance) => {
          const typeConfig = TYPE_QUITTANCE_CONFIG[quittance.type];
          const statutConfig = STATUT_QUITTANCE_CONFIG[quittance.statut];
          const TypeIcon = typeConfig?.icon || FileText;
          const StatutIcon = statutConfig?.icon || Clock;

          return (
            <div 
              key={quittance.id}
              className="border rounded-xl p-4 hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex justify-between items-start">
                {/* Infos quittance */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <TypeIcon size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="font-mono text-sm font-medium text-gray-900">
                      {quittance.reference}
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5">{quittance.beneficiaire}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {typeConfig?.label || quittance.type}
                    </p>
                  </div>
                </div>

                {/* Montant et statut */}
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(quittance.montant)}
                  </p>
                  <Badge className={`mt-1 ${statutConfig?.className} inline-flex items-center gap-1 text-xs`}>
                    <StatutIcon size={10} />
                    {statutConfig?.label || quittance.statut}
                  </Badge>
                </div>
              </div>

              {/* Infos de validation/paiement */}
              {quittance.date_validation && (
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                  <span>Validée le {formatDate(quittance.date_validation)}</span>
                  {quittance.valideur && (
                    <span> par {quittance.valideur.name}</span>
                  )}
                </div>
              )}
              {quittance.date_paiement && (
                <div className="mt-2 text-xs text-green-600">
                  <span>Payée le {formatDate(quittance.date_paiement)}</span>
                  {quittance.mode_paiement && (
                    <span> ({quittance.mode_paiement})</span>
                  )}
                  {quittance.numero_transaction && (
                    <span className="font-mono ml-1">#{quittance.numero_transaction}</span>
                  )}
                </div>
              )}

              {/* Actions */}
              {!quittance.date_paiement && (
                <div className="mt-3 flex gap-2">
                  {quittance.statut === 'en_attente' && peutValider && onValider && (
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => handleValider(quittance.id)}
                      disabled={isLoading || isSubmitting}
                      className="flex items-center gap-1"
                    >
                      <CheckCircle size={14} />
                      Valider
                    </Button>
                  )}
                  {quittance.statut === 'validee' && peutPayer && onPayer && (
                    <Button 
                      size="sm"
                      onClick={() => handleOpenPaiementModal(quittance)}
                      disabled={isLoading || isSubmitting}
                      className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700"
                    >
                      <CreditCard size={14} />
                      Payer
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Résumé par statut */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-gray-600">
              En attente: {quittances.filter(q => q.statut === 'en_attente').length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-gray-600">
              Validées: {quittances.filter(q => q.statut === 'validee').length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-gray-600">
              Payées: {quittances.filter(q => q.statut === 'payee').length}
            </span>
          </div>
        </div>
      </div>

      {/* Modal Paiement */}
      <Modal
        isOpen={showPaiementModal}
        onClose={() => setShowPaiementModal(false)}
        title="Enregistrer le paiement"
        size="md"
      >
        {selectedQuittance && (
          <div className="space-y-4">
            {/* Récap quittance */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600">Quittance</p>
              <p className="font-mono font-medium">{selectedQuittance.reference}</p>
              <p className="text-2xl font-bold text-emerald-600 mt-2">
                {formatCurrency(selectedQuittance.montant)}
              </p>
              <p className="text-sm text-gray-500 mt-1">{selectedQuittance.beneficiaire}</p>
            </div>

            {/* Mode de paiement */}
            <Select
              label="Mode de paiement"
              value={modePaiement}
              onChange={(e) => setModePaiement(e.target.value as ModePaiement)}
              options={MODES_PAIEMENT}
            />

            {/* Numéro de transaction */}
            <Input
              label="Numéro de transaction (optionnel)"
              placeholder="Ex: VIR-2024-001234"
              value={numeroTransaction}
              onChange={(e) => setNumeroTransaction(e.target.value)}
            />

            {/* Boutons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowPaiementModal(false)}
              >
                Annuler
              </Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                onClick={handlePayer}
                disabled={isSubmitting}
                isLoading={isSubmitting}
              >
                <CreditCard size={16} className="mr-2" />
                Confirmer le paiement
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default QuittancesList;
