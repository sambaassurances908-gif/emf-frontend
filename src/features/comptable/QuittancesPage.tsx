// src/features/comptable/QuittancesPage.tsx

import { useState, useRef, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useReactToPrint } from 'react-to-print';
import { 
  Search, 
  Filter,
  Receipt,
  CheckCircle2,
  Clock,
  CreditCard,
  RefreshCw,
  Eye,
  Printer,
  X,
  Building2,
  User,
  FileText,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Wallet,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Shield,
  Briefcase,
  CheckCircle,
  Info
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { sinistreService } from '@/services/sinistre.service';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import logoSamba from '@/assets/logo-samba.png';
import signatureTechnique from '@/assets/signature-technique.png';
import signatureFpdg from '@/assets/signature-fpdg.png';

// Options de filtrage
const EMF_OPTIONS = [
  { value: '', label: 'Tous les EMFs' },
  { value: '1', label: 'BAMBOO' },
  { value: '2', label: 'COFIDEC' },
  { value: '3', label: 'BCEG' },
  { value: '4', label: 'EDG' },
  { value: '5', label: 'SODEC' },
];

const MODE_PAIEMENT_OPTIONS = [
  { value: 'virement', label: 'Virement bancaire', icon: Building2 },
  { value: 'cheque', label: 'Chèque', icon: CreditCard },
  { value: 'especes', label: 'Espèces', icon: Wallet },
  { value: 'mobile_money', label: 'Mobile Money', icon: Phone },
];

const TYPE_QUITTANCE_LABELS: Record<string, { label: string; icon: typeof Building2; color: string }> = {
  capital_sans_interets: { label: 'Capital sans intérêts (EMF)', icon: Building2, color: 'text-blue-600 bg-blue-100' },
  capital_restant_du: { label: 'Capital restant dû', icon: Wallet, color: 'text-emerald-600 bg-emerald-100' },
  capital_prevoyance: { label: 'Capital prévoyance', icon: User, color: 'text-purple-600 bg-purple-100' },
  indemnite_journaliere: { label: 'Indemnité journalière', icon: Clock, color: 'text-orange-600 bg-orange-100' },
  frais_medicaux: { label: 'Frais médicaux', icon: Shield, color: 'text-red-600 bg-red-100' },
};

// Interface pour les quittances enrichies
interface QuittanceEnrichie {
  id: number;
  reference: string;
  type: string;
  statut: string;
  montant: number;
  beneficiaire: string;
  beneficiaire_nom?: string;
  beneficiaire_type?: string;
  created_at?: string;
  date_validation?: string;
  sinistre_id: number;
  sinistre: {
    id: number;
    numero_sinistre: string;
    numero_police?: string;
    type_sinistre: string;
    date_sinistre: string;
    date_declaration?: string;
    capital_restant_du: number;
    nom_assure?: string;
    statut: string;
    contrat?: {
      id: number;
      numero_police: string;
      nom_prenom?: string;
      nom_prenom_assure_principal?: string;
      montant_pret_assure?: number;
      capital_restant_du?: number;
      duree_pret_mois?: number;
      date_effet?: string;
      date_fin_echeance?: string;
      garantie_prevoyance?: boolean;
      option_prevoyance?: 'A' | 'B';
      emf?: {
        id: number;
        nom: string;
        sigle: string;
      };
    };
    contrat_type?: string;
  };
  emf_nom?: string;
}

// Composant pour afficher une info
const InfoItem = ({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: React.ElementType }) => (
  <div className="flex items-start gap-2">
    {Icon && <Icon size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />}
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value || 'N/A'}</p>
    </div>
  </div>
);

// Composant QuittancePrint pour l'impression
const QuittancePrintDocument = ({ quittance }: { quittance: QuittanceEnrichie }) => {
  const sinistre = quittance.sinistre;
  const contrat = sinistre?.contrat;
  
  const typeLabel = quittance.type === 'capital_sans_interets' 
    ? 'Remboursement Capital (EMF)' 
    : quittance.type === 'capital_prevoyance'
      ? 'Capital Prévoyance (Bénéficiaire)'
      : quittance.type === 'capital_restant_du'
        ? 'Capital Restant Dû'
        : quittance.type || 'Quittance';
  
  const dureeContrat = contrat?.date_effet && contrat?.date_fin_echeance
    ? `Du ${formatDate(contrat.date_effet)} au ${formatDate(contrat.date_fin_echeance)}`
    : 'N/A';

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
          <span>: {sinistre?.numero_sinistre}</span>
        </div>
        <div className="flex">
          <span className="font-bold w-48">Date du Sinistre</span>
          <span>: {formatDate(sinistre?.date_sinistre)}</span>
        </div>
        <div className="flex">
          <span className="font-bold w-48">Date de déclaration</span>
          <span>: {formatDate(sinistre?.date_declaration || sinistre?.date_sinistre)}</span>
        </div>
        <div className="flex">
          <span className="font-bold w-48">Durée du contrat</span>
          <span>: {dureeContrat}</span>
        </div>
        <div className="flex">
          <span className="font-bold w-48">Assuré Principal</span>
          <span>: {sinistre?.nom_assure || contrat?.nom_prenom || contrat?.nom_prenom_assure_principal || 'N/A'}</span>
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
          Fait à Libreville, le {formatDate(new Date().toISOString())}
        </div>

        <div className="flex justify-between px-4">
          {/* Left Signature - Responsable Technique (toujours visible pour le comptable) */}
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
          {/* Right Signature - FPDG (toujours visible car validée pour le comptable) */}
          <div className="w-[30%]">
            <div className="font-bold mb-2 text-[11px] text-right">Le Président Directeur Général</div>
            <div className="relative h-20 w-32 ml-auto flex items-center justify-center">
              <img 
                src={signatureFpdg} 
                alt="Signature PDG" 
                className="h-full w-auto object-contain"
              />
            </div>
          </div>
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
};

// Composant Card pour une quittance
const QuittanceCard = ({ 
  quittance, 
  onPreview, 
  onPay,
  isExpanded,
  onToggle
}: { 
  quittance: QuittanceEnrichie; 
  onPreview: () => void;
  onPay: () => void;
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  const typeConfig = TYPE_QUITTANCE_LABELS[quittance.type] || { 
    label: quittance.type, 
    icon: Receipt, 
    color: 'text-gray-600 bg-gray-100' 
  };
  const TypeIcon = typeConfig.icon;
  const sinistre = quittance.sinistre;
  const contrat = sinistre?.contrat;

  return (
    <Card className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-all overflow-hidden">
      {/* Header de la quittance */}
      <div 
        className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Info principale */}
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${typeConfig.color.split(' ')[1]}`}>
              <TypeIcon className={typeConfig.color.split(' ')[0]} size={28} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-bold text-gray-900 font-mono">{quittance.reference}</h3>
                <Badge className="bg-blue-100 text-blue-700">
                  Validée - Prête à payer
                </Badge>
              </div>
              <p className="text-sm text-gray-600 font-medium">{quittance.beneficiaire_nom || quittance.beneficiaire}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <FileText size={12} />
                  {sinistre?.numero_sinistre}
                </span>
                <span className="flex items-center gap-1">
                  <Building2 size={12} />
                  {quittance.emf_nom || contrat?.emf?.sigle || 'N/A'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {formatDate(quittance.created_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Montant et actions */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold text-emerald-600">
                {formatCurrency(quittance.montant)}
              </p>
              <p className="text-xs text-gray-500">{typeConfig.label}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={(e) => { e.stopPropagation(); onPreview(); }}
                title="Prévisualiser"
              >
                <Eye size={16} />
              </Button>
              <Button 
                onClick={(e) => { e.stopPropagation(); onPay(); }}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <CreditCard size={16} className="mr-2" />
                Payer
              </Button>
            </div>
            <button onClick={onToggle} className="p-1 hover:bg-gray-100 rounded">
              {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* Détails étendus */}
      {isExpanded && (
        <div className="border-t bg-gray-50 p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informations du Sinistre */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle size={16} className="text-orange-500" />
                Informations du Sinistre
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <InfoItem label="N° Sinistre" value={sinistre?.numero_sinistre} icon={FileText} />
                <InfoItem label="Type" value={sinistre?.type_sinistre} icon={Shield} />
                <InfoItem label="Date sinistre" value={formatDate(sinistre?.date_sinistre)} icon={Calendar} />
                <InfoItem label="Capital restant dû" value={formatCurrency(sinistre?.capital_restant_du || 0)} icon={Wallet} />
                <InfoItem label="Assuré" value={sinistre?.nom_assure || contrat?.nom_prenom} icon={User} />
                <InfoItem label="Statut" value={sinistre?.statut?.replace(/_/g, ' ')} icon={CheckCircle} />
              </div>
            </div>

            {/* Informations du Contrat */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Briefcase size={16} className="text-blue-500" />
                Informations du Contrat
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <InfoItem label="N° Police" value={contrat?.numero_police} icon={FileText} />
                <InfoItem label="EMF" value={contrat?.emf?.sigle || contrat?.emf?.nom} icon={Building2} />
                <InfoItem label="Montant prêt" value={formatCurrency(contrat?.montant_pret_assure || 0)} icon={CreditCard} />
                <InfoItem label="Durée" value={contrat?.duree_pret_mois ? `${contrat.duree_pret_mois} mois` : 'N/A'} icon={Clock} />
                <InfoItem label="Date effet" value={formatDate(contrat?.date_effet)} icon={Calendar} />
                <InfoItem label="Fin échéance" value={formatDate(contrat?.date_fin_echeance)} icon={Calendar} />
              </div>
              {contrat?.garantie_prevoyance && (
                <div className="mt-3 pt-3 border-t">
                  <Badge className="bg-purple-100 text-purple-700">
                    <Shield size={12} className="mr-1" />
                    Garantie Prévoyance {contrat.option_prevoyance ? `(Option ${contrat.option_prevoyance})` : ''}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export const QuittancesPage = () => {
  const queryClient = useQueryClient();
  const printRef = useRef<HTMLDivElement>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmf, setSelectedEmf] = useState('');
  const [expandedQuittances, setExpandedQuittances] = useState<Set<number>>(new Set());
  
  // Modal de prévisualisation
  const [previewQuittance, setPreviewQuittance] = useState<QuittanceEnrichie | null>(null);
  
  // Modal de paiement
  const [selectedQuittance, setSelectedQuittance] = useState<QuittanceEnrichie | null>(null);
  const [paymentData, setPaymentData] = useState({
    reference_paiement: '',
    mode_paiement: 'virement',
    numero_transaction: '',
    date_paiement: new Date().toISOString().split('T')[0],
  });

  // Fonction d'impression
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: previewQuittance ? `Quittance_${previewQuittance.reference}` : 'Quittance',
  });

  // Récupération des sinistres avec leurs quittances
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['comptable', 'sinistres-quittances', selectedEmf],
    queryFn: async () => {
      const response = await sinistreService.getAll({
        emf_id: selectedEmf ? Number(selectedEmf) : undefined,
        per_page: 100,
      });
      
      const sinistresAvecQuittances = await Promise.all(
        (response.data || []).map(async (sinistre: any) => {
          try {
            const quittances = await sinistreService.getQuittances(sinistre.id);
            return { ...sinistre, quittances: quittances || [] };
          } catch (e: any) {
            if (e.response?.status !== 404) {
              console.warn(`Erreur récupération quittances sinistre ${sinistre.id}`);
            }
            return { ...sinistre, quittances: [] };
          }
        })
      );
      
      return { ...response, data: sinistresAvecQuittances };
    },
  });

  // Extraire et enrichir les quittances validées
  const allQuittances: QuittanceEnrichie[] = useMemo(() => {
    const sinistres = data?.data || [];
    return sinistres.flatMap((sinistre: any) => {
      const quittances = sinistre.quittances || [];
      return quittances
        .filter((q: any) => q.statut === 'validee')
        .map((q: any) => ({
          ...q,
          sinistre_id: sinistre.id,
          sinistre: {
            id: sinistre.id,
            numero_sinistre: sinistre.numero_sinistre,
            numero_police: sinistre.numero_police || sinistre.contrat?.numero_police,
            type_sinistre: sinistre.type_sinistre,
            date_sinistre: sinistre.date_sinistre,
            date_declaration: sinistre.date_declaration,
            capital_restant_du: sinistre.capital_restant_du,
            nom_assure: sinistre.nom_assure || sinistre.contrat?.nom_prenom,
            statut: sinistre.statut,
            contrat: sinistre.contrat,
            contrat_type: sinistre.contrat_type,
          },
          emf_nom: sinistre.contrat?.emf?.sigle || sinistre.contrat?.emf?.nom || 'N/A',
        }));
    });
  }, [data]);

  // Filtrage
  const filteredQuittances = useMemo(() => {
    return allQuittances.filter((q) => {
      const matchSearch = !searchTerm || 
        q.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.beneficiaire?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.beneficiaire_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.sinistre?.numero_sinistre?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchSearch;
    });
  }, [allQuittances, searchTerm]);

  // Stats
  const stats = useMemo(() => ({
    total: filteredQuittances.length,
    montantTotal: filteredQuittances.reduce((acc, q) => acc + (q.montant || 0), 0),
  }), [filteredQuittances]);

  // Mutation pour payer une quittance
  const payerMutation = useMutation({
    mutationFn: ({ sinistreId, quittanceId, data }: { sinistreId: number; quittanceId: number; data: any }) =>
      sinistreService.payerQuittance(sinistreId, quittanceId, data),
    onSuccess: () => {
      toast.success('Paiement enregistré avec succès ! Une notification a été envoyée au FPDG et à l\'Admin SAMBA.');
      setSelectedQuittance(null);
      setPaymentData({
        reference_paiement: '',
        mode_paiement: 'virement',
        numero_transaction: '',
        date_paiement: new Date().toISOString().split('T')[0],
      });
      queryClient.invalidateQueries({ queryKey: ['comptable'] });
      queryClient.invalidateQueries({ queryKey: ['sinistre'] });
      queryClient.invalidateQueries({ queryKey: ['fpdg'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors du paiement');
    },
  });

  const toggleExpand = useCallback((id: number) => {
    setExpandedQuittances(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handlePay = () => {
    if (!selectedQuittance) return;
    if (!paymentData.reference_paiement.trim()) {
      toast.error('Veuillez saisir une référence de paiement');
      return;
    }
    
    payerMutation.mutate({
      sinistreId: selectedQuittance.sinistre_id,
      quittanceId: selectedQuittance.id,
      data: {
        mode_paiement: paymentData.mode_paiement,
        numero_transaction: paymentData.numero_transaction || paymentData.reference_paiement,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Receipt className="text-emerald-500" />
            Quittances à payer
          </h1>
          <p className="text-gray-600">Gérez les paiements des sinistres validés par le FPDG</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw size={16} className="mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center">
                <Receipt className="text-white" size={28} />
              </div>
              <div>
                <p className="text-sm text-emerald-600 font-medium">Quittances à payer</p>
                <p className="text-3xl font-bold text-emerald-700">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center">
                <Wallet className="text-white" size={28} />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Montant total</p>
                <p className="text-2xl font-bold text-blue-700">{formatCurrency(stats.montantTotal)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center">
                <Clock className="text-white" size={28} />
              </div>
              <div>
                <p className="text-sm text-amber-600 font-medium">Délai de paiement</p>
                <p className="text-2xl font-bold text-amber-700">10 jours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Rechercher par référence, bénéficiaire, sinistre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={selectedEmf}
              onChange={(e) => setSelectedEmf(e.target.value)}
              options={EMF_OPTIONS}
            />
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Filter size={16} />
              {filteredQuittances.length} quittance(s) trouvée(s)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des quittances */}
      {filteredQuittances.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="h-12 w-12" />}
          title="Aucune quittance en attente de paiement"
          description="Toutes les quittances validées ont été payées"
        />
      ) : (
        <div className="space-y-4">
          {filteredQuittances.map((quittance) => (
            <QuittanceCard
              key={quittance.id}
              quittance={quittance}
              onPreview={() => setPreviewQuittance(quittance)}
              onPay={() => setSelectedQuittance(quittance)}
              isExpanded={expandedQuittances.has(quittance.id)}
              onToggle={() => toggleExpand(quittance.id)}
            />
          ))}
        </div>
      )}

      {/* Modal de prévisualisation */}
      <Modal
        isOpen={!!previewQuittance}
        onClose={() => setPreviewQuittance(null)}
        title="Prévisualisation de la Quittance"
        size="xl"
      >
        {previewQuittance && (
          <div className="space-y-4">
            {/* Actions en haut */}
            <div className="flex justify-between items-center pb-4 border-b">
              <div className="flex items-center gap-2 text-gray-600">
                <FileText size={20} />
                <span className="font-medium">{previewQuittance.reference}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePrint()}
                >
                  <Printer size={16} className="mr-1" />
                  Imprimer
                </Button>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => {
                    setPreviewQuittance(null);
                    setSelectedQuittance(previewQuittance);
                  }}
                >
                  <CreditCard size={16} className="mr-1" />
                  Payer
                </Button>
              </div>
            </div>

            {/* Contenu pour impression - Format A4 avec scroll */}
            <div className="overflow-auto max-h-[800px] rounded-xl border border-gray-200">
              <div ref={printRef}>
                <QuittancePrintDocument quittance={previewQuittance} />
              </div>
            </div>

            {/* Actions en bas */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setPreviewQuittance(null)}>
                <X size={16} className="mr-1" />
                Fermer
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de paiement */}
      <Modal
        isOpen={!!selectedQuittance}
        onClose={() => setSelectedQuittance(null)}
        title="Enregistrer le paiement"
        size="lg"
      >
        {selectedQuittance && (
          <div className="space-y-6">
            {/* Résumé de la quittance */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-mono font-bold text-gray-900 text-lg">{selectedQuittance.reference}</p>
                  <p className="text-sm text-gray-600">{selectedQuittance.beneficiaire_nom || selectedQuittance.beneficiaire}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-emerald-600">
                    {formatCurrency(selectedQuittance.montant)}
                  </p>
                  <Badge className="bg-blue-100 text-blue-700 mt-1">
                    {TYPE_QUITTANCE_LABELS[selectedQuittance.type]?.label || selectedQuittance.type}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <FileText size={14} />
                  <span>Sinistre: {selectedQuittance.sinistre?.numero_sinistre}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Building2 size={14} />
                  <span>EMF: {selectedQuittance.emf_nom}</span>
                </div>
              </div>
            </div>

            {/* Info importante */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-medium text-blue-800">Notification automatique</p>
                  <p className="text-xs text-blue-600 mt-1">
                    Une fois le paiement enregistré, le FPDG et l'Admin SAMBA recevront une notification 
                    pour procéder à la clôture du sinistre.
                  </p>
                </div>
              </div>
            </div>

            {/* Formulaire de paiement */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode de paiement *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {MODE_PAIEMENT_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isSelected = paymentData.mode_paiement === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setPaymentData(prev => ({ ...prev, mode_paiement: option.value }))}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                          isSelected 
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon size={24} className={isSelected ? 'text-emerald-500' : 'text-gray-400'} />
                        <span className="font-medium">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Référence du paiement *
                </label>
                <Input
                  value={paymentData.reference_paiement}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, reference_paiement: e.target.value }))}
                  placeholder="Ex: VIR-2024-001234"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de transaction (optionnel)
                </label>
                <Input
                  value={paymentData.numero_transaction}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, numero_transaction: e.target.value }))}
                  placeholder="Numéro de transaction bancaire"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date du paiement
                </label>
                <Input
                  type="date"
                  value={paymentData.date_paiement}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, date_paiement: e.target.value }))}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setSelectedQuittance(null)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handlePay}
                disabled={!paymentData.reference_paiement.trim() || payerMutation.isPending}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                {payerMutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} className="mr-2" />
                    Confirmer le paiement
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default QuittancesPage;
