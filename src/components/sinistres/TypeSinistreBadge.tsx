// src/components/sinistres/TypeSinistreBadge.tsx
import { Badge } from '@/components/ui/Badge';
import { SinistreType } from '@/types/sinistre.types';
import { 
  Skull, 
  HeartPulse, 
  Briefcase, 
  Store, 
  Stethoscope,
  LucideIcon
} from 'lucide-react';

interface TypeConfig {
  label: string;
  className: string;
  icon: LucideIcon;
}

const TYPE_CONFIG: Record<SinistreType, TypeConfig> = {
  deces: { 
    label: 'Décès', 
    className: 'bg-black text-white',
    icon: Skull 
  },
  iad: { 
    label: 'IAD', 
    className: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: HeartPulse 
  },
  perte_emploi: { 
    label: 'Perte d\'emploi', 
    className: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    icon: Briefcase 
  },
  perte_activite: { 
    label: 'Perte d\'activité', 
    className: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    icon: Store 
  },
  maladie: { 
    label: 'Maladie', 
    className: 'bg-pink-100 text-pink-800 border-pink-200',
    icon: Stethoscope 
  },
};

interface TypeSinistreBadgeProps {
  type: SinistreType;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showFullLabel?: boolean;
}

export const TypeSinistreBadge = ({ 
  type, 
  showIcon = true,
  size = 'md',
  showFullLabel = false
}: TypeSinistreBadgeProps) => {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.deces;
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

  // Labels courts pour l'affichage compact
  const shortLabels: Record<SinistreType, string> = {
    deces: 'Décès',
    iad: 'IAD',
    perte_emploi: 'Perte emploi',
    perte_activite: 'Perte activité',
    maladie: 'Maladie'
  };

  const label = showFullLabel ? config.label : shortLabels[type];

  return (
    <Badge 
      className={`
        ${config.className} 
        ${sizeClasses[size]} 
        font-medium border inline-flex items-center gap-1
      `}
    >
      {showIcon && <Icon size={iconSizes[size]} />}
      {label}
    </Badge>
  );
};

/**
 * Helper pour obtenir le label d'un type de sinistre
 */
export const getTypeLabel = (type: SinistreType): string => {
  return TYPE_CONFIG[type]?.label || type;
};

/**
 * Helper pour obtenir le label court d'un type de sinistre
 */
export const getTypeShortLabel = (type: SinistreType): string => {
  const shortLabels: Record<SinistreType, string> = {
    deces: 'Décès',
    iad: 'IAD',
    perte_emploi: 'Perte emploi',
    perte_activite: 'Perte activité',
    maladie: 'Maladie'
  };
  return shortLabels[type] || type;
};

export default TypeSinistreBadge;
