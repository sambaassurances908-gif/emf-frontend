// src/components/sinistres/SinistreWorkflow.tsx
import { Sinistre, SinistreStatut } from '@/types/sinistre.types';
import { 
  FileText, 
  FileSearch, 
  Calculator, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Archive,
  ChevronRight 
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface SinistreWorkflowProps {
  sinistre: Sinistre;
  className?: string;
}

interface WorkflowStep {
  key: SinistreStatut;
  label: string;
  icon: typeof FileText;
  description: string;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  { key: 'en_cours', label: 'Déclaré', icon: FileText, description: 'Sinistre déclaré' },
  { key: 'en_instruction', label: 'Instruction', icon: FileSearch, description: 'Analyse du dossier' },
  { key: 'en_reglement', label: 'Règlement', icon: Calculator, description: 'Calcul indemnisation' },
  { key: 'en_paiement', label: 'Paiement', icon: CreditCard, description: 'En attente de paiement' },
  { key: 'paye', label: 'Payé', icon: CheckCircle2, description: 'Indemnisation versée' },
  { key: 'cloture', label: 'Clôturé', icon: Archive, description: 'Dossier archivé' },
];

const STATUT_ORDER: Record<SinistreStatut, number> = {
  en_cours: 0,
  en_instruction: 1,
  en_reglement: 2,
  en_paiement: 3,
  paye: 4,
  cloture: 5,
  rejete: -1,
};

/**
 * Composant Workflow visuel pour suivre l'avancement d'un sinistre
 */
export const SinistreWorkflow = ({ sinistre, className = '' }: SinistreWorkflowProps) => {
  const currentIndex = STATUT_ORDER[sinistre.statut] ?? -1;
  const isRejete = sinistre.statut === 'rejete';

  // Si rejeté, afficher un workflow spécial
  if (isRejete) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="font-semibold text-red-800">Sinistre Rejeté</p>
            <p className="text-sm text-red-600">
              {sinistre.date_decision && `Le ${formatDate(sinistre.date_decision)}`}
            </p>
            {sinistre.motif_rejet && (
              <p className="text-sm text-red-700 mt-1 italic">
                Motif : {sinistre.motif_rejet}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {WORKFLOW_STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isPending = index > currentIndex;
        const Icon = step.icon;

        return (
          <div key={step.key} className="flex items-center gap-3">
            {/* Icône avec état */}
            <div 
              className={`
                w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all
                ${isCompleted ? 'bg-emerald-100 text-emerald-600' : ''}
                ${isCurrent ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-300 ring-offset-2' : ''}
                ${isPending ? 'bg-gray-100 text-gray-400' : ''}
              `}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <Icon className="w-5 h-5" />
              )}
            </div>

            {/* Texte */}
            <div className="flex-1 min-w-0">
              <p 
                className={`
                  text-sm font-medium truncate
                  ${isCompleted ? 'text-emerald-700' : ''}
                  ${isCurrent ? 'text-blue-700' : ''}
                  ${isPending ? 'text-gray-400' : ''}
                `}
              >
                {step.label}
              </p>
              {isCurrent && (
                <p className="text-xs text-blue-500">{step.description}</p>
              )}
            </div>

            {/* Indicateur de progression */}
            {index < WORKFLOW_STEPS.length - 1 && (
              <ChevronRight 
                size={16} 
                className={isCompleted ? 'text-emerald-400' : 'text-gray-300'} 
              />
            )}
          </div>
        );
      })}

      {/* Dates importantes */}
      <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-500">
        <div className="flex justify-between">
          <span>Déclaré le</span>
          <span className="font-medium text-gray-700">{formatDate(sinistre.date_declaration)}</span>
        </div>
        {sinistre.date_reception_documents && (
          <div className="flex justify-between">
            <span>Dossier reçu le</span>
            <span className="font-medium text-gray-700">{formatDate(sinistre.date_reception_documents)}</span>
          </div>
        )}
        {sinistre.date_traitement && (
          <div className="flex justify-between">
            <span>Traité le</span>
            <span className="font-medium text-gray-700">{formatDate(sinistre.date_traitement)}</span>
          </div>
        )}
        {sinistre.date_paiement && (
          <div className="flex justify-between">
            <span>Payé le</span>
            <span className="font-medium text-emerald-600">{formatDate(sinistre.date_paiement)}</span>
          </div>
        )}
        {sinistre.date_cloture && (
          <div className="flex justify-between">
            <span>Clôturé le</span>
            <span className="font-medium text-purple-600">{formatDate(sinistre.date_cloture)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SinistreWorkflow;
