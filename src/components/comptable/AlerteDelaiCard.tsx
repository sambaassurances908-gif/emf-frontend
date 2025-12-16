// src/components/comptable/AlerteDelaiCard.tsx

import { AlertTriangle, Clock, XCircle, CheckCircle } from 'lucide-react';
import { AlerteDelai, ALERTE_NIVEAUX } from '@/types/comptable.types';
import { formatCurrency } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface AlerteDelaiCardProps {
  alerte: AlerteDelai;
  onAction?: (quittanceId: number) => void;
}

/**
 * Card d'alerte de délai de paiement
 */
export const AlerteDelaiCard = ({ alerte, onAction }: AlerteDelaiCardProps) => {
  const config = ALERTE_NIVEAUX[alerte.niveau];
  
  const getIcon = () => {
    switch (alerte.niveau) {
      case 'urgente':
        return <XCircle className="text-red-500" size={20} />;
      case 'proche_echeance':
        return <AlertTriangle className="text-yellow-500" size={20} />;
      default:
        return <CheckCircle className="text-green-500" size={20} />;
    }
  };

  return (
    <div className={`p-4 rounded-xl border ${config.borderClass} ${config.bgClass}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <Link 
              to={`/sinistres/${alerte.reference.split('-')[1]}`}
              className={`font-semibold ${config.textClass} hover:underline`}
            >
              {alerte.reference}
            </Link>
            <span className={`text-sm font-bold ${config.textClass}`}>
              {formatCurrency(alerte.montant)}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Sinistre: <span className="font-medium">{alerte.sinistre_numero}</span>
          </p>
          <p className="text-sm text-gray-600">
            Bénéficiaire: <span className="font-medium">{alerte.beneficiaire}</span>
          </p>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1 text-xs">
              <Clock size={12} className="text-gray-400" />
              <span className={config.textClass}>
                {alerte.jours_restants < 0 
                  ? `Dépassé de ${Math.abs(alerte.jours_restants)} jour(s)`
                  : `${alerte.jours_restants} jour(s) restant(s)`
                }
              </span>
            </div>
            {onAction && (
              <button
                onClick={() => onAction(alerte.quittance_id)}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
              >
                Traiter →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlerteDelaiCard;
