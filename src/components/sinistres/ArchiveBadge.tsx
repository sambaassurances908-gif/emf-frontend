// src/components/sinistres/ArchiveBadge.tsx
import { Badge } from '@/components/ui/Badge';
import { Archive, Lock, Download } from 'lucide-react';

interface ArchiveBadgeProps {
  isArchive: boolean;
  fichierArchive?: string;
  onDownload?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Badge visuel pour indiquer qu'un sinistre est archivé (Règle E)
 */
export const ArchiveBadge = ({ 
  isArchive, 
  fichierArchive,
  onDownload,
  size = 'md' 
}: ArchiveBadgeProps) => {
  if (!isArchive) return null;

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
    <div className="inline-flex items-center gap-2">
      <Badge 
        className={`
          bg-purple-100 text-purple-700 border-purple-200 
          ${sizeClasses[size]} 
          font-medium border inline-flex items-center gap-1
        `}
      >
        <Archive size={iconSizes[size]} />
        Archivé
        <Lock size={iconSizes[size]} className="ml-1 opacity-60" />
      </Badge>

      {fichierArchive && onDownload && (
        <button
          onClick={onDownload}
          className="p-1 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-600 transition-colors"
          title="Télécharger l'archive"
        >
          <Download size={iconSizes[size]} />
        </button>
      )}
    </div>
  );
};

/**
 * Alerte pour indiquer qu'un sinistre n'est plus modifiable
 */
export const SinistreNonModifiableAlert = ({ className = '' }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-200 ${className}`}>
      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
        <Lock className="w-5 h-5 text-yellow-600" />
      </div>
      <div>
        <p className="font-medium text-yellow-800">Sinistre non modifiable</p>
        <p className="text-sm text-yellow-600">
          Ce sinistre est clôturé et archivé. Aucune modification n'est possible.
        </p>
      </div>
    </div>
  );
};

export default ArchiveBadge;
