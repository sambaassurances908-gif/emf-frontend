// src/features/fpdg/FpdgQuittancesPage.tsx
// Version complètement refaite pour éviter les redirections

import { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Receipt, 
  CheckCircle2,
  Eye,
  RefreshCw,
  Building2,
  Check,
  Clock,
  Filter,
  Printer,
  X,
  FileText,
  User,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Ban,
  RotateCcw,
  Undo2,
  MapPin,
  Mail,
  Phone
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { sinistreService } from '@/services/sinistre.service';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useReactToPrint } from 'react-to-print';
import logoSamba from '@/assets/logo-samba.png';
import signatureTechnique from '@/assets/signature-technique.png';
import signatureFpdg from '@/assets/signature-fpdg.png';

// Type pour le statut des quittances
type QuittanceStatut = 'en_attente' | 'validee' | 'payee' | 'annulee';

// Interface pour les quittances
interface Quittance {
  id: number;
  reference: string;
  type: string;
  statut: QuittanceStatut;
  montant: number;
  beneficiaire: string;
  beneficiaire_nom?: string;
  beneficiaire_type?: string;
  sinistre_reference?: string;
  created_at?: string;
  sinistre_id?: number;
}

// Interface pour les sinistres
interface Sinistre {
  id: number;
  numero_sinistre: string;
  numero_police?: string;
  statut: string;
  type_sinistre?: string;
  nom_assure?: string;
  date_sinistre?: string;
  contrat?: {
    nom_prenom?: string;
    numero_police?: string;
    date_effet?: string;
    date_fin_echeance?: string;
    emf?: {
      sigle?: string;
      nom?: string;
    };
  };
  quittances?: Quittance[];
}

// Badge de statut - Composant simple
function StatutBadge({ statut }: { statut: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    'en_attente': { bg: 'bg-amber-100', text: 'text-amber-700', label: 'En attente' },
    'validee': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Validée' },
    'payee': { bg: 'bg-green-100', text: 'text-green-700', label: 'Payée' },
    'annulee': { bg: 'bg-red-100', text: 'text-red-700', label: 'Annulée' },
  };
  const c = config[statut] || { bg: 'bg-gray-100', text: 'text-gray-700', label: statut };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

// Composant de prévisualisation de quittance - Format A4
function QuittancePreview({ quittance, sinistre }: { quittance: Quittance; sinistre?: Sinistre }) {
  const typeLabel = quittance.type === 'capital_sans_interets' 
    ? 'Remboursement Capital (EMF)' 
    : quittance.type === 'capital_prevoyance'
      ? 'Capital Prévoyance (Bénéficiaire)'
      : quittance.type === 'capital_restant_du'
        ? 'Capital Restant Dû'
        : quittance.type || 'Quittance';

  const contrat = sinistre?.contrat;
  const dureeContrat = contrat?.date_effet && contrat?.date_fin_echeance
    ? `Du ${formatDate(contrat.date_effet)} au ${formatDate(contrat.date_fin_echeance)}`
    : 'N/A';

  // Fonction pour convertir le montant en lettres
  const nombreEnLettres = (nombre: number): string => {
    const unites = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
    const dizaines = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];
    const exceptions = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize'];
    
    if (nombre === 0) return 'zéro';
    if (nombre < 0) return 'moins ' + nombreEnLettres(-nombre);
    
    let result = '';
    
    if (nombre >= 1000000) {
      const millions = Math.floor(nombre / 1000000);
      result += millions === 1 ? 'un million ' : nombreEnLettres(millions) + ' millions ';
      nombre %= 1000000;
    }
    
    if (nombre >= 1000) {
      const milliers = Math.floor(nombre / 1000);
      result += milliers === 1 ? 'mille ' : nombreEnLettres(milliers) + ' mille ';
      nombre %= 1000;
    }
    
    if (nombre >= 100) {
      const centaines = Math.floor(nombre / 100);
      result += centaines === 1 ? 'cent ' : unites[centaines] + ' cent ';
      nombre %= 100;
    }
    
    if (nombre > 0) {
      if (nombre < 10) {
        result += unites[nombre];
      } else if (nombre < 17) {
        result += exceptions[nombre - 10];
      } else if (nombre < 20) {
        result += 'dix-' + unites[nombre - 10];
      } else {
        const dizaine = Math.floor(nombre / 10);
        const unite = nombre % 10;
        
        if (dizaine === 7 || dizaine === 9) {
          result += unite === 1 
            ? dizaines[dizaine - 1] + ' et ' + exceptions[unite]
            : dizaines[dizaine - 1] + '-' + exceptions[unite];
        } else {
          if (unite === 0) {
            result += dizaines[dizaine];
          } else if (unite === 1 && dizaine !== 8) {
            result += dizaines[dizaine] + ' et un';
          } else {
            result += dizaines[dizaine] + '-' + unites[unite];
          }
        }
      }
    }
    
    return result.trim();
  };

  const montantEnLettres = nombreEnLettres(quittance.montant).charAt(0).toUpperCase() + 
    nombreEnLettres(quittance.montant).slice(1) + ' francs CFA';

  return (
    <div className="bg-white w-[210mm] min-h-[297mm] p-[8mm] shadow-xl relative flex flex-col text-black font-serif mx-auto print:shadow-none">
      {/* Header - Fixé en haut */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <img src={logoSamba} alt="SAMB'A Assurances" className="h-[120px] w-auto" />
        </div>
        <div className="border-2 border-black px-5 py-3 mt-4">
          <h1 className="text-lg font-bold font-serif tracking-wide">
            QUITTANCE DE REGLEMENT {quittance.reference}
          </h1>
        </div>
      </div>

      {/* Contenu principal centré verticalement */}
      <div className="flex-grow flex flex-col justify-center">
        {/* Details List - Aligné à gauche */}
        <div className="space-y-2 text-[12px] leading-relaxed mb-8 pl-4">
        <div className="flex">
          <span className="font-bold w-48">Police N°</span>
          <span>: {sinistre?.numero_police || contrat?.numero_police || 'N/A'}</span>
        </div>
        <div className="flex">
          <span className="font-bold w-48">Sinistre N°</span>
          <span>: {sinistre?.numero_sinistre || quittance.sinistre_reference || 'N/A'}</span>
        </div>
        <div className="flex">
          <span className="font-bold w-48">Date du Sinistre</span>
          <span>: {formatDate(sinistre?.date_sinistre)}</span>
        </div>
        <div className="flex">
          <span className="font-bold w-48">Durée du contrat</span>
          <span>: {dureeContrat}</span>
        </div>
        <div className="flex">
          <span className="font-bold w-48">Assuré Principal</span>
          <span>: {sinistre?.nom_assure || contrat?.nom_prenom || 'N/A'}</span>
        </div>
        <div className="flex">
          <span className="font-bold w-48">Type de règlement</span>
          <span>: {typeLabel}</span>
        </div>
      </div>

        {/* Content Body - Aligné à gauche */}
        <div className="space-y-4 text-[13px] mb-8 pl-4">
        {quittance.type === 'capital_prevoyance' ? (
          <>
            <div className="flex items-start text-justify">
              <span className="mr-2 font-bold">-</span>
              <div>
                <span className="font-bold">Garantie :</span> Décès de l'assuré principal ou d'un assuré associé, 
                l'assureur verse dans les 10 jours sous réserves d'un acte de décès, le capital forfaitaire 
                prévus aux conditions particulières au(x) bénéficiaire(s) désigné(s) par l'assuré principal.
              </div>
            </div>
            <div className="flex items-start flex-col pl-3">
              <div className="flex items-start -ml-3">
                <span className="mr-2 font-bold">-</span>
                <div>
                  <span className="font-bold">Capital forfaitaire :</span> &nbsp;&nbsp;&nbsp;&nbsp; 
                  {formatCurrency(quittance.montant)} (à reverser à {quittance.beneficiaire_nom || quittance.beneficiaire})
                </div>
              </div>
              <div className="font-bold italic mt-1 self-center text-sm">
                ({montantEnLettres})
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start text-justify">
              <span className="mr-2 font-bold">-</span>
              <div>
                <span className="font-bold">Garantie :</span> Décès / Invalidité Absolue et Définitive (IAD) - 
                Remboursement du capital restant dû à l'EMF
              </div>
            </div>
            <div className="flex items-start flex-col pl-3">
              <div className="flex items-start -ml-3">
                <span className="mr-2 font-bold">-</span>
                <div>
                  <span className="font-bold">Capital restant dû (sans intérêts) :</span> &nbsp;&nbsp;&nbsp;&nbsp; 
                  {formatCurrency(quittance.montant)} (à reverser à {quittance.beneficiaire_nom || quittance.beneficiaire})
                </div>
              </div>
              <div className="font-bold italic mt-1 self-center text-sm">
                ({montantEnLettres})
              </div>
            </div>
          </>
        )}
      </div>

        {/* Total Amount Box - Centré */}
        <div className="flex justify-center my-8">
          <div className="border-2 border-black px-10 py-4 shadow-sm bg-gray-50">
            <span className="font-bold text-lg">Montant total à payer est : {formatCurrency(quittance.montant)}</span>
          </div>
        </div>
      </div>

      {/* Date & Signatures - Fixé en bas */}
      <div className="mt-auto mb-2">
        <div className="text-right mb-4 pr-8 text-[12px]">
          Fait à Libreville, le {formatDate(quittance.created_at || new Date().toISOString())}
        </div>

        <div className="flex justify-between px-4">
          {/* Left Signature - Responsable Technique (toujours visible car quittance générée) */}
          <div className="w-[30%]">
            <div className="font-bold mb-2 text-[11px]">Le Responsable Technique</div>
            <div className="relative h-16 w-28">
              <img 
                src={signatureTechnique} 
                alt="Signature Responsable Technique" 
                className="h-full w-auto object-contain"
              />
            </div>
          </div>
          <div className="w-[35%] flex flex-col items-center justify-end pb-2 font-bold text-[8px] space-y-0">
            <div className="flex gap-3">
              <span>Feuillet 1 : Assuré</span>
              <span>Feuillet 2 : EMF</span>
            </div>
            <div className="flex gap-3">
              <span>Feuillet 3 : SAMB'A</span>
              <span>Feuillet 4 : Souche</span>
            </div>
          </div>
          {/* Right Signature - FPDG (visible si validée ou payée) */}
          <div className="w-[30%]">
            <div className="font-bold mb-2 text-[11px] text-right">Le Président Directeur Général</div>
            <div className="relative h-20 w-32 ml-auto flex items-center justify-center">
              {quittance.statut === 'validee' || quittance.statut === 'payee' ? (
                <img 
                  src={signatureFpdg} 
                  alt="Signature PDG" 
                  className="h-full w-auto object-contain"
                />
              ) : (
                <div className="border border-gray-300 border-dashed h-full w-full flex items-center justify-center rounded-lg">
                  <span className="text-gray-400 text-[9px] text-center px-1">
                    {quittance.statut === 'en_attente' ? 'En attente validation' : 'Signature & Cachet'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statut Badge */}
      <div className="print:hidden mb-1">
        <div className={`text-center py-1.5 px-3 rounded-lg text-xs font-medium ${
          quittance.statut === 'validee' || quittance.statut === 'payee' ? 'bg-green-100 text-green-800' :
          quittance.statut === 'en_attente' ? 'bg-yellow-100 text-yellow-800' :
          quittance.statut === 'annulee' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {quittance.statut === 'validee' && '✓ Quittance validée - En attente de paiement'}
          {quittance.statut === 'payee' && '✓ Quittance payée'}
          {quittance.statut === 'en_attente' && '⏳ En attente de validation FPDG'}
          {quittance.statut === 'annulee' && '❌ Quittance annulée'}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-1 text-center text-[7px] text-gray-600 space-y-0 leading-tight">
        <div className="font-bold uppercase text-black text-[8px]">SAMB'A ASSURANCES GABON S.A.</div>
        <div>Société Anonyme avec Conseil d'Administration et Président Directeur Général.</div>
        <div>Entreprise de micro-assurance régie par le Code des Assurances CIMA et agréée par la CRCA sous le N° 0270 / L / CIMA / CRCA / PDT / 2024</div>
        <div className="mb-1">R.C.C.M : N° GA - LBV - 01 - 2024 - B14 - 00003 | N° STATISTIQUE : 202401003647 R</div>
        
        <div className="flex justify-between items-start border-t border-gray-300 pt-0.5 px-2">
          <div className="flex flex-col items-center w-1/3">
            <MapPin size={10} className="mb-0 text-gray-500" />
            <span>326 Rue Jean-Baptiste NDENDE | Libreville</span>
          </div>
          <div className="flex flex-col items-center w-1/3">
            <Mail size={10} className="mb-0 text-gray-500" />
            <span>infos@samba-assurances.com</span>
          </div>
          <div className="flex flex-col items-center w-1/3">
            <Phone size={10} className="mb-0 text-gray-500" />
            <span>(+241) 060 08 62 62 - 074 40 41 41</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Bouton personnalisé qui ne déclenche jamais de submit
function ActionButton({ 
  children, 
  onClick, 
  className = '', 
  disabled = false,
  variant = 'primary',
  size = 'md',
  title
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md';
  title?: string;
}) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
  };

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      onClick();
    }
  }, [onClick, disabled]);

  return (
    <button
      type="button"
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
}

// Card d'un sinistre avec ses quittances
function SinistreQuittancesCard({
  sinistre,
  onValidate,
  onAnnuler,
  onRemettreAttente,
  onReactiver,
  onPreview,
  onViewSinistre,
}: {
  sinistre: Sinistre;
  onValidate: (quittance: Quittance) => void;
  onAnnuler: (quittance: Quittance) => void;
  onRemettreAttente: (quittance: Quittance) => void;
  onReactiver: (quittance: Quittance) => void;
  onPreview: (quittance: Quittance, sinistre: Sinistre) => void;
  onViewSinistre: (sinistreId: number) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const quittances = sinistre.quittances || [];
  
  const stats = {
    total: quittances.length,
    enAttente: quittances.filter((q) => q.statut === 'en_attente').length,
    validees: quittances.filter((q) => q.statut === 'validee').length,
    montantTotal: quittances.reduce((acc, q) => acc + (q.montant || 0), 0),
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'capital_sans_interets': 'Capital EMF',
      'capital_prevoyance': 'Prévoyance',
      'capital_restant_du': 'Capital Restant',
      'indemnite_journaliere': 'Indemnité J.',
      'frais_medicaux': 'Frais Médicaux',
    };
    return labels[type] || type;
  };

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
      {/* Header du sinistre */}
      <div 
        className="p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={toggleExpanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <FileText className="text-amber-600" size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900">{sinistre.numero_sinistre}</h3>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  sinistre.statut === 'en_reglement' ? 'bg-purple-100 text-purple-700' :
                  sinistre.statut === 'en_paiement' ? 'bg-blue-100 text-blue-700' :
                  sinistre.statut === 'paye' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {sinistre.statut?.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <User size={14} />
                  {sinistre.contrat?.nom_prenom || sinistre.nom_assure || 'N/A'}
                </span>
                <span className="flex items-center gap-1">
                  <Building2 size={14} />
                  {sinistre.contrat?.emf?.sigle || sinistre.contrat?.emf?.nom || 'N/A'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3">
              {stats.enAttente > 0 && (
                <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold">
                  {stats.enAttente} à valider
                </span>
              )}
              {stats.validees > 0 && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">
                {stats.validees} validées
                </span>
              )}
              <span className="font-bold text-gray-900">
                {formatCurrency(stats.montantTotal)}
              </span>
            </div>
            
            <ActionButton 
              variant="ghost" 
              size="sm"
              onClick={() => onViewSinistre(sinistre.id)}
            >
              <Eye size={16} />
            </ActionButton>
            
            {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
          </div>
        </div>
      </div>

      {/* Liste des quittances */}
      {isExpanded && (
        <div className="divide-y divide-gray-100">
          {quittances.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Aucune quittance pour ce sinistre
            </div>
          ) : (
            quittances.map((quittance) => {
              const isEnAttente = quittance.statut === 'en_attente';
              const isValidee = quittance.statut === 'validee';
              const isAnnulee = quittance.statut === 'annulee';
              const isPayee = quittance.statut === 'payee';
              
              const quittanceWithSinistre = { ...quittance, sinistre_id: sinistre.id };
              
              return (
                <div 
                  key={quittance.id} 
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        quittance.type === 'capital_sans_interets' || quittance.type === 'capital_restant_du'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-purple-100 text-purple-600'
                      }`}>
                        {quittance.type === 'capital_sans_interets' || quittance.type === 'capital_restant_du'
                          ? <Building2 size={18} />
                          : <User size={18} />
                        }
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-gray-900">
                            {quittance.reference}
                          </span>
                          <StatutBadge statut={quittance.statut} />
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                          <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                            {getTypeLabel(quittance.type)}
                          </span>
                          <span>→ {quittance.beneficiaire_nom || quittance.beneficiaire}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right mr-4">
                        <p className="font-bold text-lg text-gray-900">
                          {formatCurrency(quittance.montant)}
                        </p>
                        {quittance.created_at && (
                          <p className="text-xs text-gray-400">
                            {formatDate(quittance.created_at)}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <ActionButton
                          variant="ghost"
                          size="sm"
                          title="Prévisualiser"
                          onClick={() => onPreview(quittance, sinistre)}
                        >
                          <Eye size={16} />
                        </ActionButton>
                        
                        {isEnAttente && (
                          <>
                            <ActionButton
                              size="sm"
                              className="bg-amber-500 hover:bg-amber-600 text-white"
                              onClick={() => onValidate(quittanceWithSinistre)}
                              title="Valider cette quittance"
                            >
                              <Check size={16} className="mr-1" />
                              Valider
                            </ActionButton>
                            <ActionButton
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              title="Annuler"
                              onClick={() => onAnnuler(quittanceWithSinistre)}
                            >
                              <Ban size={16} />
                            </ActionButton>
                          </>
                        )}
                        
                        {isValidee && (
                          <>
                            <span className="text-xs text-blue-600 font-medium px-2 py-1 bg-blue-50 rounded">
                              En attente de paiement (Comptable)
                            </span>
                            <ActionButton
                              size="sm"
                              variant="outline"
                              className="border-amber-500 text-amber-600 hover:bg-amber-50"
                              onClick={() => onRemettreAttente(quittanceWithSinistre)}
                              title="Remettre en attente de validation"
                            >
                              <Undo2 size={16} className="mr-1" />
                              Remettre
                            </ActionButton>
                          </>
                        )}
                        
                        {isAnnulee && (
                          <ActionButton
                            size="sm"
                            variant="outline"
                            className="border-blue-500 text-blue-600 hover:bg-blue-50"
                            onClick={() => onReactiver(quittanceWithSinistre)}
                            title="Réactiver cette quittance"
                          >
                            <RotateCcw size={16} className="mr-1" />
                            Réactiver
                          </ActionButton>
                        )}
                        
                        {isPayee && (
                          <span className="text-xs text-gray-400 italic">Statut final</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// Composant principal
export function FpdgQuittancesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filterStatut, setFilterStatut] = useState<string>('');
  
  // États pour les modals
  const [selectedQuittance, setSelectedQuittance] = useState<Quittance | null>(null);
  const [actionType, setActionType] = useState<'annuler' | 'remettre_attente' | 'reactiver' | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  
  // État pour la prévisualisation
  const [previewData, setPreviewData] = useState<{ quittance: Quittance; sinistre: Sinistre } | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  
  // Fonction d'impression
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: previewData ? `Quittance_${previewData.quittance.reference}` : 'Quittance',
  });

  // Récupérer les sinistres avec leurs quittances
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['fpdg-sinistres-quittances', filterStatut],
    queryFn: async () => {
      const response = await sinistreService.getAll({ 
        per_page: 100,
        inclure_archives: false
      });
      
      const sinistresAvecQuittances = await Promise.all(
        (response.data || []).map(async (sinistre: Sinistre) => {
          try {
            const quittances = await sinistreService.getQuittances(sinistre.id);
            return { ...sinistre, quittances: quittances || [] };
          } catch (e: unknown) {
            const error = e as { response?: { status?: number } };
            if (error.response?.status !== 404) {
              console.warn(`Erreur quittances sinistre ${sinistre.id}`);
            }
            return { ...sinistre, quittances: [] };
          }
        })
      );
      
      const filtered = sinistresAvecQuittances.filter(
        (s) => s.quittances && s.quittances.length > 0
      );
      
      return { ...response, data: filtered };
    },
  });

  const sinistresAvecQuittances: Sinistre[] = data?.data || [];
  
  // Calculer les stats globales
  const allQuittances = sinistresAvecQuittances.flatMap((s) => 
    (s.quittances || []).map((q) => ({ ...q, sinistre_id: s.id }))
  );
  
  const stats = {
    total: allQuittances.length,
    enAttente: allQuittances.filter((q) => q.statut === 'en_attente').length,
    validees: allQuittances.filter((q) => q.statut === 'validee').length,
    payees: allQuittances.filter((q) => q.statut === 'payee').length,
    montantTotal: allQuittances.reduce((acc, q) => acc + (q.montant || 0), 0),
    montantEnAttente: allQuittances.filter((q) => q.statut === 'en_attente').reduce((acc, q) => acc + (q.montant || 0), 0),
    montantAPayer: allQuittances.filter((q) => q.statut === 'validee').reduce((acc, q) => acc + (q.montant || 0), 0),
  };

  // Filtrer les sinistres selon le filtre
  const filteredSinistres = filterStatut 
    ? sinistresAvecQuittances.filter((s) => {
        const quittances = s.quittances || [];
        if (filterStatut === 'a_valider') {
          return quittances.some((q) => q.statut === 'en_attente');
        } else if (filterStatut === 'validees') {
          return quittances.some((q) => q.statut === 'validee');
        }
        return true;
      })
    : sinistresAvecQuittances;

  // Mutation pour valider (directement, sans modal)
  const validateMutation = useMutation({
    mutationFn: async ({ sinistreId, quittanceId }: { sinistreId: number; quittanceId: number }) => {
      console.log('[VALIDATE] Début validation:', { sinistreId, quittanceId });
      console.log('[VALIDATE] Token:', localStorage.getItem('token')?.substring(0, 20) + '...');
      console.log('[VALIDATE] User:', localStorage.getItem('user'));
      
      try {
        const result = await sinistreService.validerQuittance(sinistreId, quittanceId);
        console.log('[VALIDATE] Résultat:', result);
        return result;
      } catch (error: unknown) {
        const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
        console.error('[VALIDATE] Erreur HTTP:', axiosError.response?.status);
        console.error('[VALIDATE] Erreur message:', axiosError.response?.data?.message);
        
        // Si c'est une erreur 401, ne pas laisser l'intercepteur rediriger
        if (axiosError.response?.status === 401) {
          throw new Error('Session expirée ou permissions insuffisantes. Veuillez vous reconnecter.');
        }
        throw error;
      }
    },
    onSuccess: () => {
      console.log('[VALIDATE] Succès!');
      toast.success('Quittance validée avec succès');
      queryClient.invalidateQueries({ queryKey: ['fpdg-sinistres-quittances'] });
    },
    onError: (error: unknown) => {
      const err = error as { message?: string; response?: { data?: { message?: string } } };
      console.error('[VALIDATE] Erreur finale:', error);
      toast.error(err.message || err.response?.data?.message || 'Erreur lors de la validation');
    }
  });

  // Mutation pour annuler
  const annulerMutation = useMutation({
    mutationFn: async ({ sinistreId, quittanceId, motif }: { sinistreId: number; quittanceId: number; motif?: string }) => {
      return sinistreService.annulerQuittance(sinistreId, quittanceId, motif);
    },
    onSuccess: () => {
      toast.success('Quittance annulée');
      queryClient.invalidateQueries({ queryKey: ['fpdg-sinistres-quittances'] });
      closeActionModal();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Erreur lors de l\'annulation');
    }
  });

  // Mutation pour modifier le statut (remettre en attente, réactiver)
  const modifierStatutMutation = useMutation({
    mutationFn: async (payload: { sinistreId: number; quittanceId: number; data: { statut: QuittanceStatut; observations?: string } }) => {
      return sinistreService.modifierStatutQuittance(payload.sinistreId, payload.quittanceId, payload.data);
    },
    onSuccess: () => {
      const messages: Record<string, string> = {
        'remettre_attente': 'Quittance remise en attente',
        'reactiver': 'Quittance réactivée avec succès',
      };
      toast.success(messages[actionType || ''] || 'Statut modifié avec succès');
      queryClient.invalidateQueries({ queryKey: ['fpdg-sinistres-quittances'] });
      closeActionModal();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Erreur lors de la modification du statut');
    }
  });

  // État pour l'annulation/motif
  const [motifAnnulation, setMotifAnnulation] = useState('');

  // Handlers - utilisation de useCallback pour éviter les re-renders
  const handleValidate = useCallback((quittance: Quittance) => {
    console.log('[HANDLER] Validation directe:', quittance);
    if (quittance.sinistre_id && quittance.id) {
      validateMutation.mutate({
        sinistreId: quittance.sinistre_id,
        quittanceId: quittance.id
      });
    }
  }, [validateMutation]);

  const handleAnnuler = useCallback((quittance: Quittance) => {
    setSelectedQuittance(quittance);
    setActionType('annuler');
    setShowActionModal(true);
  }, []);

  const handleRemettreAttente = useCallback((quittance: Quittance) => {
    setSelectedQuittance(quittance);
    setActionType('remettre_attente');
    setShowActionModal(true);
  }, []);

  const handleReactiver = useCallback((quittance: Quittance) => {
    setSelectedQuittance(quittance);
    setActionType('reactiver');
    setShowActionModal(true);
  }, []);

  const handlePreview = useCallback((quittance: Quittance, sinistre: Sinistre) => {
    setPreviewData({ quittance, sinistre });
    setShowPreviewModal(true);
  }, []);

  const handleViewSinistre = useCallback((sinistreId: number) => {
    navigate(`/sinistres/traitement/${sinistreId}`);
  }, [navigate]);

  const confirmAction = useCallback(() => {
    if (!selectedQuittance || !selectedQuittance.sinistre_id) {
      console.error('Pas de quittance sélectionnée ou sinistre_id manquant');
      return;
    }
    
    console.log('[CONFIRM] Action:', actionType, selectedQuittance);

    switch (actionType) {
      case 'annuler':
        annulerMutation.mutate({
          sinistreId: selectedQuittance.sinistre_id,
          quittanceId: selectedQuittance.id,
          motif: motifAnnulation || undefined
        });
        break;
        
      case 'remettre_attente':
        modifierStatutMutation.mutate({
          sinistreId: selectedQuittance.sinistre_id,
          quittanceId: selectedQuittance.id,
          data: {
            statut: 'en_attente',
            observations: motifAnnulation || 'Remise en attente de validation'
          }
        });
        break;
        
      case 'reactiver':
        modifierStatutMutation.mutate({
          sinistreId: selectedQuittance.sinistre_id,
          quittanceId: selectedQuittance.id,
          data: {
            statut: 'en_attente',
            observations: motifAnnulation || 'Réactivation de la quittance'
          }
        });
        break;
    }
  }, [selectedQuittance, actionType, motifAnnulation, modifierStatutMutation, annulerMutation]);

  const closeActionModal = useCallback(() => {
    setShowActionModal(false);
    setSelectedQuittance(null);
    setActionType(null);
    setMotifAnnulation('');
  }, []);

  const closePreview = useCallback(() => {
    setPreviewData(null);
    setShowPreviewModal(false);
  }, []);

  const isPending = validateMutation.isPending || annulerMutation.isPending || modifierStatutMutation.isPending;

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const toggleFilterAValider = useCallback(() => {
    setFilterStatut(prev => prev === 'a_valider' ? '' : 'a_valider');
  }, []);

  const toggleFilterValidees = useCallback(() => {
    setFilterStatut(prev => prev === 'validees' ? '' : 'validees');
  }, []);

  const clearFilter = useCallback(() => {
    setFilterStatut('');
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Receipt className="text-amber-500" />
            Gestion des Quittances
          </h1>
          <p className="text-gray-600">Validation des quittances par sinistre</p>
        </div>
        <ActionButton variant="outline" onClick={handleRefresh} size="sm">
          <RefreshCw size={16} className="mr-2" />
          Actualiser
        </ActionButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div 
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            filterStatut === 'a_valider' ? 'bg-amber-100 border-amber-300 ring-2 ring-amber-500' : 'bg-amber-50 border-amber-100 hover:bg-amber-100'
          }`}
          onClick={toggleFilterAValider}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
              <Clock className="text-white" size={24} />
            </div>
            <div>
              <p className="text-sm text-amber-600 font-medium">À valider</p>
              <p className="text-2xl font-bold text-gray-900">{stats.enAttente}</p>
              <p className="text-xs text-gray-500">{formatCurrency(stats.montantEnAttente)}</p>
            </div>
          </div>
        </div>
        
        <div 
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            filterStatut === 'validees' ? 'bg-blue-100 border-blue-300 ring-2 ring-blue-500' : 'bg-blue-50 border-blue-100 hover:bg-blue-100'
          }`}
          onClick={toggleFilterValidees}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="text-white" size={24} />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Validées</p>
              <p className="text-2xl font-bold text-gray-900">{stats.validees}</p>
              <p className="text-xs text-gray-500">En attente comptable</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="text-white" size={24} />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Payées</p>
              <p className="text-2xl font-bold text-gray-900">{stats.payees}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-500 rounded-xl flex items-center justify-center">
              <Receipt className="text-white" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Total</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.montantTotal)}</p>
              <p className="text-xs text-gray-500">{stats.total} quittance(s)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtre actif */}
      {filterStatut && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Filtre actif:</span>
          <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700 flex items-center gap-2">
            <Filter size={14} />
            {filterStatut === 'a_valider' ? 'Sinistres avec quittances à valider' : 'Sinistres avec quittances validées'}
            <button type="button" onClick={clearFilter} className="ml-1 hover:text-red-500">×</button>
          </span>
        </div>
      )}

      {/* Liste des sinistres */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredSinistres.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="h-12 w-12 text-emerald-500" />}
          title="Aucune quittance"
          description={filterStatut ? "Aucun sinistre avec quittances dans cette catégorie" : "Aucun sinistre avec quittances à traiter"}
        />
      ) : (
        <div className="space-y-4">
          {filteredSinistres.map((sinistre) => (
            <SinistreQuittancesCard
              key={sinistre.id}
              sinistre={sinistre}
              onValidate={handleValidate}
              onAnnuler={handleAnnuler}
              onRemettreAttente={handleRemettreAttente}
              onReactiver={handleReactiver}
              onPreview={handlePreview}
              onViewSinistre={handleViewSinistre}
            />
          ))}
        </div>
      )}

      {/* Modal Action */}
      <Modal
        isOpen={showActionModal}
        onClose={closeActionModal}
        title={
          actionType === 'remettre_attente' ? 'Remettre en attente' :
          actionType === 'reactiver' ? 'Réactiver la quittance' :
          'Annuler la quittance'
        }
      >
        <div className="space-y-4">
          {selectedQuittance && (
            <div className={`p-4 rounded-xl ${
              actionType === 'annuler' ? 'bg-red-50 border border-red-100' : 
              actionType === 'reactiver' ? 'bg-blue-50 border border-blue-100' :
              actionType === 'remettre_attente' ? 'bg-amber-50 border border-amber-100' :
              'bg-gray-50'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-mono font-semibold text-gray-900">{selectedQuittance.reference}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Bénéficiaire: {selectedQuittance.beneficiaire_nom || selectedQuittance.beneficiaire}
                  </p>
                </div>
                <StatutBadge statut={selectedQuittance.statut} />
              </div>
              <p className="text-2xl font-bold text-emerald-600 mt-3">
                {formatCurrency(selectedQuittance.montant)}
              </p>
            </div>
          )}

          {/* ANNULER */}
          {actionType === 'annuler' && (
            <>
              <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-red-500 mt-0.5" size={20} />
                  <div>
                    <p className="font-medium text-red-800">Attention</p>
                    <p className="text-sm text-red-600 mt-1">
                      Cette action va annuler la quittance. Elle pourra être réactivée ultérieurement si nécessaire.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motif d'annulation (optionnel)
                </label>
                <Input
                  placeholder="Raison de l'annulation..."
                  value={motifAnnulation}
                  onChange={(e) => setMotifAnnulation(e.target.value)}
                />
              </div>
            </>
          )}

          {/* REMETTRE EN ATTENTE */}
          {actionType === 'remettre_attente' && (
            <>
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                <div className="flex items-start gap-3">
                  <Undo2 className="text-amber-500 mt-0.5" size={20} />
                  <div>
                    <p className="font-medium text-amber-800">Remettre en attente</p>
                    <p className="text-sm text-amber-600 mt-1">
                      Cette action va remettre la quittance en attente de validation.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raison (optionnel)
                </label>
                <Input
                  placeholder="Raison de la remise en attente..."
                  value={motifAnnulation}
                  onChange={(e) => setMotifAnnulation(e.target.value)}
                />
              </div>
            </>
          )}

          {/* RÉACTIVER */}
          {actionType === 'reactiver' && (
            <>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-start gap-3">
                  <RotateCcw className="text-blue-500 mt-0.5" size={20} />
                  <div>
                    <p className="font-medium text-blue-800">Réactiver la quittance</p>
                    <p className="text-sm text-blue-600 mt-1">
                      Cette action va réactiver la quittance annulée et la remettre en attente de validation.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raison de la réactivation (optionnel)
                </label>
                <Input
                  placeholder="Raison de la réactivation..."
                  value={motifAnnulation}
                  onChange={(e) => setMotifAnnulation(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <ActionButton variant="outline" onClick={closeActionModal}>
              Annuler
            </ActionButton>
            <ActionButton 
              className={
                actionType === 'remettre_attente' ? 'bg-amber-500 hover:bg-amber-600 text-white' :
                actionType === 'reactiver' ? 'bg-blue-500 hover:bg-blue-600 text-white' :
                'bg-red-500 hover:bg-red-600 text-white'
              }
              onClick={confirmAction}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {actionType === 'remettre_attente' ? 'En cours...' :
                   actionType === 'reactiver' ? 'Réactivation...' :
                   'Annulation...'}
                </>
              ) : (
                <>
                  {actionType === 'annuler' && <Ban size={16} className="mr-1" />}
                  {actionType === 'remettre_attente' && <Undo2 size={16} className="mr-1" />}
                  {actionType === 'reactiver' && <RotateCcw size={16} className="mr-1" />}
                  {actionType === 'remettre_attente' ? 'Remettre en attente' :
                   actionType === 'reactiver' ? 'Réactiver' :
                   'Confirmer l\'annulation'}
                </>
              )}
            </ActionButton>
          </div>
        </div>
      </Modal>

      {/* Modal de Prévisualisation */}
      <Modal
        isOpen={showPreviewModal}
        onClose={closePreview}
        title="Prévisualisation de la Quittance"
        size="xl"
      >
        <div className="space-y-4">
          {/* Actions en haut */}
          <div className="flex justify-between items-center pb-4 border-b">
            <div className="flex items-center gap-2 text-gray-600">
              <FileText size={20} />
              <span className="font-medium">{previewData?.quittance.reference}</span>
            </div>
            <div className="flex gap-2">
              <ActionButton
                variant="outline"
                size="sm"
                onClick={() => {
                  if (previewData?.sinistre?.id) {
                    navigate(`/sinistres/traitement/${previewData.sinistre.id}`);
                  }
                }}
              >
                <Eye size={16} className="mr-1" />
                Voir sinistre
              </ActionButton>
              <ActionButton
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => handlePrint()}
              >
                <Printer size={16} className="mr-1" />
                Imprimer
              </ActionButton>
            </div>
          </div>

          {/* Contenu - Format A4 avec scroll */}
          <div className="overflow-auto max-h-[800px] rounded-xl border border-gray-200">
            <div ref={printRef} className="print:p-0">
              {previewData && (
                <QuittancePreview 
                  quittance={previewData.quittance} 
                  sinistre={previewData.sinistre}
                />
              )}
            </div>
          </div>

          {/* Actions rapides */}
          {previewData && (
            <div className="flex justify-between items-center pt-4 border-t">
              <ActionButton variant="outline" onClick={closePreview}>
                <X size={16} className="mr-1" />
                Fermer
              </ActionButton>
              <div className="flex gap-2">
                {previewData.quittance.statut === 'en_attente' && (
                  <ActionButton
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                    onClick={() => {
                      closePreview();
                      handleValidate({ ...previewData.quittance, sinistre_id: previewData.sinistre.id });
                    }}
                  >
                    <Check size={16} className="mr-1" />
                    Valider
                  </ActionButton>
                )}
                {previewData.quittance.statut === 'validee' && (
                  <span className="text-sm text-blue-600 font-medium px-3 py-2 bg-blue-50 rounded-lg flex items-center gap-2">
                    <Clock size={16} />
                    En attente de paiement (Comptable)
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default FpdgQuittancesPage;
