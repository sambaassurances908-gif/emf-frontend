// src/hooks/useSinistreValidation.ts
import { SinistreErrorCode } from '@/types/sinistre.types';
import { AxiosError } from 'axios';

/**
 * Messages d'erreur personnalisés pour les erreurs de validation sinistre (Règle A)
 * Ces messages sont plus explicites et contextuels que les messages du backend
 */
const ERROR_MESSAGES: Record<SinistreErrorCode, (context?: Record<string, any>) => string> = {
  SINISTRE_DECES_HORS_COUVERTURE: (ctx) => 
    `Le sinistre décès ne peut pas être déclaré car la date du décès${ctx?.date_sinistre ? ` (${formatDateFr(ctx.date_sinistre)})` : ''} est antérieure à la date de création du contrat${ctx?.date_creation_contrat ? ` (${formatDateFr(ctx.date_creation_contrat)})` : ''}.`,
  
  SINISTRE_MALADIE_DELAI_CARENCE: (ctx) => 
    `Le sinistre maladie ne peut pas être déclaré pendant le délai de carence. La couverture débute${ctx?.date_fin_carence ? ` le ${formatDateFr(ctx.date_fin_carence)}` : ' après le délai de carence'}.`,
  
  CONTRAT_NON_VALIDE: () => 
    'Le contrat associé n\'est pas actif. Impossible de déclarer un sinistre sur un contrat inactif.',
  
  CONTRAT_EXPIRE: () => 
    'Le contrat a expiré. Impossible de déclarer un sinistre sur un contrat expiré.',
  
  SINISTRE_NON_MODIFIABLE: () => 
    'Ce sinistre est clôturé ou archivé et ne peut plus être modifié. Consultez l\'archive pour plus d\'informations.',
  
  TRANSITION_NON_AUTORISEE: (ctx) => {
    const transitions = ctx?.transitions_possibles?.join(', ');
    return `Changement de statut non autorisé.${transitions ? ` Transitions possibles : ${transitions}.` : ''}`;
  },
  
  QUITTANCE_NON_TROUVEE: () => 
    'La quittance demandée n\'existe pas ou a été supprimée.',
  
  QUITTANCE_DEJA_VALIDEE: () => 
    'Cette quittance a déjà été validée. Elle est en attente de paiement.',
  
  QUITTANCE_DEJA_PAYEE: () => 
    'Cette quittance a déjà été payée. Consultez l\'historique des paiements.',
  
  PERMISSION_REFUSEE: () => 
    'Vous n\'avez pas les permissions nécessaires pour effectuer cette action. Contactez votre administrateur.',
};

/**
 * Formate une date en français
 */
function formatDateFr(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

/**
 * Hook pour gérer les erreurs de validation sinistre
 */
export function useSinistreValidation() {
  /**
   * Extrait et formate le message d'erreur depuis une erreur Axios
   */
  const getErrorMessage = (error: unknown): string => {
    // Erreur Axios avec réponse du backend
    if (isAxiosError(error) && error.response?.data) {
      const data = error.response.data as any;
      
      // Format d'erreur structuré du backend
      if (data.error?.code && isValidErrorCode(data.error.code)) {
        const errorCode = data.error.code as SinistreErrorCode;
        const messageGenerator = ERROR_MESSAGES[errorCode];
        return messageGenerator(data.error.context);
      }
      
      // Message d'erreur simple du backend
      if (data.error?.message) {
        return data.error.message;
      }
      
      if (data.message) {
        return data.message;
      }
      
      // Erreurs de validation Laravel
      if (data.errors) {
        const firstError = Object.values(data.errors)[0];
        if (Array.isArray(firstError) && firstError.length > 0) {
          return firstError[0];
        }
      }
    }
    
    // Erreur JavaScript standard
    if (error instanceof Error) {
      return error.message;
    }
    
    // Fallback
    return 'Une erreur inattendue est survenue. Veuillez réessayer.';
  };

  /**
   * Vérifie si une erreur est une erreur de validation de sinistre
   */
  const isValidationError = (error: unknown): boolean => {
    if (isAxiosError(error) && error.response?.data) {
      const data = error.response.data as any;
      return !!data.error?.code || !!data.errors;
    }
    return false;
  };

  /**
   * Extrait le code d'erreur depuis une erreur
   */
  const getErrorCode = (error: unknown): SinistreErrorCode | null => {
    if (isAxiosError(error) && error.response?.data) {
      const code = (error.response.data as any)?.error?.code;
      if (isValidErrorCode(code)) {
        return code;
      }
    }
    return null;
  };

  /**
   * Extrait le contexte d'erreur depuis une erreur
   */
  const getErrorContext = (error: unknown): Record<string, any> | null => {
    if (isAxiosError(error) && error.response?.data) {
      return (error.response.data as any)?.error?.context || null;
    }
    return null;
  };

  /**
   * Vérifie si l'erreur est liée au délai de carence
   */
  const isDelaiCarenceError = (error: unknown): boolean => {
    return getErrorCode(error) === 'SINISTRE_MALADIE_DELAI_CARENCE';
  };

  /**
   * Vérifie si l'erreur est liée à la couverture
   */
  const isCouvertureError = (error: unknown): boolean => {
    return getErrorCode(error) === 'SINISTRE_DECES_HORS_COUVERTURE';
  };

  /**
   * Vérifie si l'erreur est liée aux permissions
   */
  const isPermissionError = (error: unknown): boolean => {
    return getErrorCode(error) === 'PERMISSION_REFUSEE' || 
           (isAxiosError(error) && error.response?.status === 403);
  };

  /**
   * Vérifie si le sinistre n'est plus modifiable
   */
  const isNonModifiableError = (error: unknown): boolean => {
    return getErrorCode(error) === 'SINISTRE_NON_MODIFIABLE';
  };

  return {
    getErrorMessage,
    getErrorCode,
    getErrorContext,
    isValidationError,
    isDelaiCarenceError,
    isCouvertureError,
    isPermissionError,
    isNonModifiableError,
  };
}

/**
 * Type guard pour vérifier si c'est une erreur Axios
 */
function isAxiosError(error: unknown): error is AxiosError {
  return !!(error as AxiosError)?.isAxiosError;
}

/**
 * Type guard pour vérifier si c'est un code d'erreur valide
 */
function isValidErrorCode(code: string): code is SinistreErrorCode {
  return code in ERROR_MESSAGES;
}

export default useSinistreValidation;
