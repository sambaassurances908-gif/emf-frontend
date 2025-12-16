// src/components/sinistres/DelaiPaiementIndicator.tsx
import { DelaiPaiement } from '@/types/sinistre.types';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface DelaiPaiementIndicatorProps {
  delai: DelaiPaiement | null | undefined;
  className?: string;
  compact?: boolean;
}

/**
 * Composant indicateur de délai de paiement (Règle C - 10 jours)
 * Affiche l'état du délai de paiement avec code couleur et icône
 */
export const DelaiPaiementIndicator = ({ 
  delai, 
  className = '',
  compact = false 
}: DelaiPaiementIndicatorProps) => {
  if (!delai) return null;

  // Déterminer le style selon l'état du délai
  const getConfig = () => {
    if (delai.depasse) {
      return {
        bgClass: 'bg-red-50 border-red-200',
        textClass: 'text-red-700',
        icon: XCircle,
        iconClass: 'text-red-500',
        title: 'Délai de paiement dépassé !',
        titleClass: 'text-red-800 font-bold'
      };
    }
    if (delai.jours_restants <= 3) {
      return {
        bgClass: 'bg-yellow-50 border-yellow-200',
        textClass: 'text-yellow-700',
        icon: AlertTriangle,
        iconClass: 'text-yellow-500',
        title: 'Délai de paiement urgent',
        titleClass: 'text-yellow-800 font-semibold'
      };
    }
    return {
      bgClass: 'bg-green-50 border-green-200',
      textClass: 'text-green-700',
      icon: CheckCircle,
      iconClass: 'text-green-500',
      title: 'Délai de paiement',
      titleClass: 'text-green-800 font-medium'
    };
  };

  const config = getConfig();
  const Icon = config.icon;

  // Version compacte pour les listes
  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg ${config.bgClass} border ${className}`}>
        <Icon size={14} className={config.iconClass} />
        <span className={`text-xs font-medium ${config.textClass}`}>
          {delai.depasse 
            ? `Dépassé de ${Math.abs(delai.jours_restants)}j`
            : `${delai.jours_restants}j restants`
          }
        </span>
      </div>
    );
  }

  // Version complète
  return (
    <div className={`p-4 rounded-xl border ${config.bgClass} ${className}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.bgClass}`}>
          <Icon size={20} className={config.iconClass} />
        </div>
        <div className="flex-1">
          <h4 className={`text-sm ${config.titleClass}`}>{config.title}</h4>
          <div className="mt-1 space-y-0.5">
            <p className={`text-xs ${config.textClass}`}>
              Échéance : <span className="font-medium">{formatDate(delai.date_echeance)}</span>
            </p>
            {delai.depasse ? (
              <p className="text-xs text-red-700 font-bold flex items-center gap-1">
                <AlertTriangle size={12} />
                Délai dépassé de {Math.abs(delai.jours_restants)} jour(s)
              </p>
            ) : (
              <p className={`text-xs ${config.textClass}`}>
                <span className="font-semibold">{delai.jours_restants}</span> jour(s) restant(s)
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Barre de progression */}
      <div className="mt-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              delai.depasse 
                ? 'bg-red-500' 
                : delai.jours_restants <= 3 
                  ? 'bg-yellow-500' 
                  : 'bg-green-500'
            }`}
            style={{ 
              width: `${delai.depasse ? 100 : Math.max(0, 100 - (delai.jours_restants / 10 * 100))}%` 
            }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-gray-500">Début: {formatDate(delai.date_debut)}</span>
          <span className="text-[10px] text-gray-500">Fin: {formatDate(delai.date_echeance)}</span>
        </div>
      </div>
    </div>
  );
};

export default DelaiPaiementIndicator;
