// src/lib/utils.ts

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utilitaire Tailwind CSS pour merger les classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formate une devise en XAF/XOF (CEMAC)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formate une date courte (JJ/MM/AAAA)
 */
export function formatDate(dateInput: string | Date | null | undefined): string {
  // Vérifier si la date est null, undefined ou une chaîne vide
  if (!dateInput) {
    return '-';
  }

  // Essayer de créer un objet Date
  const date = new Date(dateInput);

  // Vérifier si la date est valide
  if (isNaN(date.getTime())) {
    return '-';
  }

  // Formater la date
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

/**
 * Formate une date longue (ex: 25 novembre 2025)
 */
export function formatDateLong(dateInput: string | Date | null | undefined): string {
  if (!dateInput) {
    return '-';
  }

  const date = new Date(dateInput);

  if (isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/**
 * Formate une date et heure (JJ/MM/AAAA HH:MM)
 */
export function formatDateTime(dateInput: string | Date | null | undefined): string {
  if (!dateInput) {
    return '-';
  }

  const date = new Date(dateInput);

  if (isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Couleur du badge selon le statut contrat
 */
export function getStatusColor(statut: string): string {
  const colors: Record<string, string> = {
    actif: 'bg-green-100 text-green-800',
    en_attente: 'bg-yellow-100 text-yellow-800',
    suspendu: 'bg-orange-100 text-orange-800',
    resilie: 'bg-red-100 text-red-800',
    termine: 'bg-gray-100 text-gray-800',
    sinistre: 'bg-purple-100 text-purple-800',
  };
  return colors[statut.toLowerCase()] || 'bg-gray-100 text-gray-800';
}

/**
 * Couleur spécifique pour les options SODEC
 */
export function getOptionColor(option: string): string {
  const colors: Record<string, string> = {
    option_a: 'bg-blue-100 text-blue-800 border-blue-200',
    option_b: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  };
  return colors[option.toLowerCase()] || 'bg-gray-100 text-gray-800';
}

/**
 * Variant Badge UI selon statut
 */
export function getStatusVariant(
  statut: string
): 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'> = {
    actif: 'success',
    en_attente: 'warning',
    suspendu: 'warning',
    resilie: 'destructive',
    termine: 'secondary',
    sinistre: 'destructive',
    regle: 'success',
    rejete: 'destructive',
    en_cours: 'default',
  };
  return variants[statut.toLowerCase()] || 'default';
}

/**
 * Formate un nombre avec séparateurs milliers
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value);
}

/**
 * Calcule le pourcentage avec arrondi
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Tronque un texte avec points de suspension
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Vérifie si une date est expirée
 */
export function isExpired(dateInput: string | Date | null | undefined): boolean {
  if (!dateInput) return false;
  
  const date = new Date(dateInput);
  
  if (isNaN(date.getTime())) return false;
  
  return date < new Date();
}

/**
 * Calcule les jours restants jusqu'à une date
 */
export function getDaysRemaining(dateInput: string | Date | null | undefined): number {
  if (!dateInput) return 0;
  
  const date = new Date(dateInput);
  
  if (isNaN(date.getTime())) return 0;
  
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Debounce utilitaire pour les inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * ✅ NOUVEAU : Format spécifique SODEC pour les stats
 */
export function formatSodecStats(value: any): string {
  if (typeof value === 'number') return formatNumber(value);
  if (typeof value === 'string' && !isNaN(Number(value))) {
    return formatCurrency(Number(value));
  }
  return value?.toString() || '0';
}

/**
 * ✅ NOUVEAU : Couleur pour catégories SODEC
 */
export function getCategorieColor(categorie: string): string {
  const colors: Record<string, string> = {
    commercants: 'bg-indigo-100 text-indigo-800',
    salaries_public: 'bg-green-100 text-green-800',
    salaries_prive: 'bg-purple-100 text-purple-800',
    retraites: 'bg-orange-100 text-orange-800',
    autre: 'bg-gray-100 text-gray-800',
  };
  return colors[categorie.toLowerCase()] || 'bg-gray-100 text-gray-800';
}
