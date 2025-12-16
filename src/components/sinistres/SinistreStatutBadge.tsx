// src/components/sinistres/SinistreStatutBadge.tsx
import { Badge } from '@/components/ui/Badge';
import { SinistreStatut } from '@/types/sinistre.types';
import { 
  Clock, 
  FileSearch, 
  Calculator, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Archive,
  LucideIcon
} from 'lucide-react';

interface StatutConfig {
  label: string;
  className: string;
  icon: LucideIcon;
}

const STATUT_CONFIG: Record<SinistreStatut, StatutConfig> = {
  en_cours: { 
    label: 'En cours', 
    className: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: Clock 
  },
  en_instruction: { 
    label: 'En instruction', 
    className: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: FileSearch 
  },
  en_reglement: { 
    label: 'En règlement', 
    className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: Calculator 
  },
  en_paiement: { 
    label: 'En paiement', 
    className: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: CreditCard 
  },
  paye: { 
    label: 'Payé', 
    className: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle2 
  },
  rejete: { 
    label: 'Rejeté', 
    className: 'bg-red-100 text-red-700 border-red-200',
    icon: XCircle 
  },
  cloture: { 
    label: 'Clôturé', 
    className: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: Archive 
  },
};

interface SinistreStatutBadgeProps {
  statut: SinistreStatut;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const SinistreStatutBadge = ({ 
  statut, 
  showIcon = true,
  size = 'md' 
}: SinistreStatutBadgeProps) => {
  const config = STATUT_CONFIG[statut] || STATUT_CONFIG.en_cours;
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  const iconSizes = {
    sm: 10,
    md: 12,
    lg: 14
  };

  return (
    <Badge 
      className={`
        ${config.className} 
        ${sizeClasses[size]} 
        font-medium border inline-flex items-center gap-1
      `}
    >
      {showIcon && <Icon size={iconSizes[size]} />}
      {config.label}
    </Badge>
  );
};

/**
 * Helper pour obtenir le label d'un statut
 */
export const getStatutLabel = (statut: SinistreStatut): string => {
  return STATUT_CONFIG[statut]?.label || statut;
};

/**
 * Helper pour obtenir la classe CSS d'un statut
 */
export const getStatutClassName = (statut: SinistreStatut): string => {
  return STATUT_CONFIG[statut]?.className || 'bg-gray-100 text-gray-700';
};

export default SinistreStatutBadge;
