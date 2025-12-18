import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { 
  ArrowLeft, CheckCircle, XCircle, 
  FileText, Download, Eye, Clock,
  User, Phone, Mail, AlertCircle, Shield, Building2,
  CreditCard, History, Send, FileCheck, Ban, Lock,
  X, Maximize2, Briefcase, FileImage, Printer, Receipt
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { sinistreService } from '@/services/sinistre.service';
import { SinistreStatut } from '@/types/sinistre.types';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { 
  QuittancePrint, 
  QuittanceGenerationModal,
  QuittanceListItem,
  type QuittanceData 
} from '@/components/quittances';

// Configuration des statuts avec workflow - Correspond au backend Laravel
const STATUTS_CONFIG: Record<SinistreStatut, { 
  label: string; 
  color: string; 
  bgColor: string;
  icon: React.ElementType;
  nextStatuts: SinistreStatut[];
  description: string;
  step: number;
}> = {
  en_cours: { 
    label: 'En cours', 
    color: 'text-yellow-700', 
    bgColor: 'bg-yellow-100',
    icon: Clock,
    nextStatuts: ['en_instruction', 'rejete'],
    description: 'Sinistre déclaré, en attente de réception des documents',
    step: 1
  },
  en_instruction: { 
    label: 'En instruction', 
    color: 'text-blue-700', 
    bgColor: 'bg-blue-100',
    icon: FileCheck,
    nextStatuts: ['en_reglement', 'rejete'],
    description: 'Documents reçus, dossier en cours d\'analyse',
    step: 2
  },
  en_reglement: { 
    label: 'En règlement', 
    color: 'text-indigo-700', 
    bgColor: 'bg-indigo-100',
    icon: History,
    nextStatuts: ['en_paiement', 'rejete'],
    description: 'Analyse terminée, en cours de règlement',
    step: 3
  },
  en_paiement: { 
    label: 'En paiement', 
    color: 'text-purple-700', 
    bgColor: 'bg-purple-100',
    icon: Shield,
    nextStatuts: ['paye', 'rejete'],
    description: 'Validé, en attente de versement',
    step: 4
  },
  paye: { 
    label: 'Payé', 
    color: 'text-emerald-700', 
    bgColor: 'bg-emerald-100',
    icon: CreditCard,
    nextStatuts: ['cloture'],
    description: 'Indemnisation versée',
    step: 5
  },
  rejete: { 
    label: 'Rejeté', 
    color: 'text-red-700', 
    bgColor: 'bg-red-100',
    icon: XCircle,
    nextStatuts: ['cloture'],
    description: 'Sinistre refusé',
    step: 6
  },
  cloture: { 
    label: 'Clôturé', 
    color: 'text-gray-700', 
    bgColor: 'bg-gray-100',
    icon: Ban,
    nextStatuts: [],
    description: 'Dossier définitivement clôturé',
    step: 7
  },
};

// Configuration EMF
const EMF_CONFIG: Record<number, { label: string; color: string; bgColor: string }> = {
  1: { label: 'BAMBOO', color: 'text-green-700', bgColor: 'bg-green-100' },
  2: { label: 'COFIDEC', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  3: { label: 'BCEG', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  4: { label: 'EDG', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  5: { label: 'SODEC', color: 'text-red-700', bgColor: 'bg-red-100' },
};

export const SinistreTraitementPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Vérification des droits - Admin, FPDG ou Gestionnaire peuvent traiter les sinistres
  const { isAdmin, peutValiderSinistre, user } = useAuthStore();
  const canAccessPage = isAdmin() || peutValiderSinistre();
  
  // Debug: afficher les infos utilisateur
  console.log('👤 User:', user?.name, '| Role:', user?.role, '| canAccessPage:', canAccessPage);
  
  // États des modals
  const [showStatutModal, setShowStatutModal] = useState(false);
  const [showValiderModal, setShowValiderModal] = useState(false);
  const [showRejeterModal, setShowRejeterModal] = useState(false);
  const [showPayerModal, setShowPayerModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<{ url: string; name: string; type: string } | null>(null);
  const [previewError, setPreviewError] = useState(false);
  
  // États pour les quittances
  const [showQuittanceModal, setShowQuittanceModal] = useState(false);
  const [quittances, setQuittances] = useState<QuittanceData[]>([]);
  const [previewQuittance, setPreviewQuittance] = useState<QuittanceData | null>(null);
  
  // États des formulaires
  const [newStatut, setNewStatut] = useState<SinistreStatut | ''>('');
  const [observations, setObservations] = useState('');
  const [montantAccorde, setMontantAccorde] = useState('');
  const [motifRejet, setMotifRejet] = useState('');
  const [modePaiement, setModePaiement] = useState('');
  const [referencePaiement, setReferencePaiement] = useState('');
  const [datePaiement, setDatePaiement] = useState(new Date().toISOString().split('T')[0]);

  // URL de base du storage Laravel (sans /api)
  const storageBaseUrl = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api').replace('/api', '') + '/storage/';

  // Vérification d'accès - Si pas autorisé (admin, fpdg, gestionnaire), afficher page d'accès refusé
  if (!canAccessPage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
          <Lock className="h-10 w-10 text-red-500" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h2>
          <p className="text-gray-600 max-w-md">
            Cette page de traitement des sinistres est réservée aux administrateurs SAMBA.
            Seuls les administrateurs peuvent valider, rejeter ou modifier le statut des sinistres.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/sinistres')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la liste
          </Button>
          <Button onClick={() => navigate('/dashboard')}>
            Aller au tableau de bord
          </Button>
        </div>
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl max-w-md">
          <p className="text-sm text-amber-800">
            <strong>Note :</strong> Si vous pensez avoir besoin d'accès à cette fonctionnalité, 
            veuillez contacter votre administrateur système.
          </p>
        </div>
      </div>
    );
  }

  // Récupération du sinistre
  const { data: sinistreResponse, isLoading, error } = useQuery({
    queryKey: ['sinistre-traitement', id],
    queryFn: async () => {
      return await sinistreService.getById(Number(id));
    },
    enabled: !!id,
  });

  const sinistre = sinistreResponse?.data;
  const documentsComplets = sinistreResponse?.documents_complets;
  const delaiTraitement = sinistreResponse?.delai_traitement_ecoule;

  // Debug: afficher les infos du sinistre
  console.log('📋 Sinistre:', sinistre?.numero_sinistre, '| Statut:', sinistre?.statut, '| ID:', id);

  // Requête dédiée pour charger les quittances via GET /sinistres/{id}/quittances
  const { data: quittancesFromApi, refetch: refetchQuittances } = useQuery({
    queryKey: ['sinistre-quittances', id],
    queryFn: async () => {
      if (!id) return [];
      try {
        const quittances = await sinistreService.getQuittances(Number(id));
        console.log(`✅ Quittances chargées via API: ${quittances.length}`);
        return quittances;
      } catch (e: any) {
        if (e.response?.status !== 404) {
          console.warn('⚠️ Erreur chargement quittances:', e.message);
        }
        return [];
      }
    },
    enabled: !!id && !!sinistre,
  });

  // Convertir les quittances API en QuittanceData pour le composant
  useEffect(() => {
    if (quittancesFromApi && quittancesFromApi.length > 0 && sinistre) {
      const quittancesData = quittancesFromApi.map((q: any) => ({
        reference: q.reference,
        type: (q.type === 'capital_sans_interets' || q.type === 'capital_restant_du' ? 'emf' : 'prevoyance') as 'emf' | 'prevoyance',
        sinistre: sinistre,
        montant: q.montant,
        montantEnLettres: `${formatCurrency(q.montant)} CFA`,
        beneficiaire: q.beneficiaire_nom || q.beneficiaire,
        statut: q.statut,
        dateCreation: q.created_at,
        dateValidation: q.date_validation,
        datePaiement: q.date_paiement,
        id: q.id
      })) as QuittanceData[];
      setQuittances(quittancesData);
    } else if (quittancesFromApi && quittancesFromApi.length === 0) {
      // Pas de quittances pour ce sinistre
      setQuittances([]);
    }
  }, [quittancesFromApi, sinistre]);

  // Configuration du statut actuel
  const currentStatutConfig = useMemo(() => {
    if (!sinistre?.statut) return null;
    return STATUTS_CONFIG[sinistre.statut as SinistreStatut] || STATUTS_CONFIG.en_cours;
  }, [sinistre?.statut]);

  // Options de statut suivant
  const nextStatutOptions = useMemo(() => {
    if (!currentStatutConfig) return [];
    return currentStatutConfig.nextStatuts.map(statut => ({
      value: statut,
      label: STATUTS_CONFIG[statut].label,
    }));
  }, [currentStatutConfig]);

  // EMF info
  const emfId = sinistre?.emf_id || sinistre?.contrat?.emf_id || sinistre?.contrat?.emf?.id;
  const emfConfig = emfId ? EMF_CONFIG[emfId] : null;

  // Mutation pour changer le statut
  const updateStatutMutation = useMutation({
    mutationFn: async (data: { statut: SinistreStatut; observations?: string }) => {
      return await sinistreService.update(Number(id), data);
    },
    onSuccess: () => {
      toast.success('Statut mis à jour avec succès');
      queryClient.invalidateQueries({ queryKey: ['sinistre-traitement', id] });
      queryClient.invalidateQueries({ queryKey: ['all-sinistres'] });
      setShowStatutModal(false);
      setNewStatut('');
      setObservations('');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    },
  });

  // Mutation pour clôturer le sinistre
  const cloturerMutation = useMutation({
    mutationFn: async () => {
      return await sinistreService.cloturer(Number(id));
    },
    onSuccess: () => {
      toast.success('Sinistre clôturé avec succès');
      queryClient.invalidateQueries({ queryKey: ['sinistre-traitement', id] });
      queryClient.invalidateQueries({ queryKey: ['all-sinistres'] });
      setShowStatutModal(false);
      setNewStatut('');
      setObservations('');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la clôture');
    },
  });

  // Mutation pour valider (passer en paiement avec montant)
  const validerMutation = useMutation({
    mutationFn: async (data: { montant_indemnisation: number; observations?: string }) => {
      return await sinistreService.update(Number(id), {
        statut: 'en_paiement' as SinistreStatut,
        ...data,
      });
    },
    onSuccess: () => {
      toast.success('Sinistre validé - En attente de paiement');
      queryClient.invalidateQueries({ queryKey: ['sinistre-traitement', id] });
      queryClient.invalidateQueries({ queryKey: ['all-sinistres'] });
      setShowValiderModal(false);
      setMontantAccorde('');
      setObservations('');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la validation');
    },
  });

  // Mutation pour rejeter
  const rejeterMutation = useMutation({
    mutationFn: async (data: { motif_rejet: string }) => {
      return await sinistreService.update(Number(id), {
        statut: 'rejete' as SinistreStatut,
        ...data,
      });
    },
    onSuccess: () => {
      toast.success('Sinistre rejeté');
      queryClient.invalidateQueries({ queryKey: ['sinistre-traitement', id] });
      queryClient.invalidateQueries({ queryKey: ['all-sinistres'] });
      setShowRejeterModal(false);
      setMotifRejet('');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Erreur lors du rejet');
    },
  });

  // Mutation pour payer
  const payerMutation = useMutation({
    mutationFn: async (data: { mode_paiement: string; reference_paiement: string; date_paiement: string }) => {
      return await sinistreService.update(Number(id), {
        statut: 'paye' as SinistreStatut,
        montant_paye: sinistre?.montant_indemnisation,
        ...data,
      });
    },
    onSuccess: () => {
      toast.success('Paiement enregistré avec succès');
      queryClient.invalidateQueries({ queryKey: ['sinistre-traitement', id] });
      queryClient.invalidateQueries({ queryKey: ['all-sinistres'] });
      setShowPayerModal(false);
      setModePaiement('');
      setReferencePaiement('');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement du paiement');
    },
  });

  // Handlers
  const handleChangeStatut = () => {
    if (!newStatut) {
      toast.error('Veuillez sélectionner un nouveau statut');
      return;
    }
    
    // Utiliser l'endpoint dédié pour la clôture
    if (newStatut === 'cloture') {
      cloturerMutation.mutate();
    } else {
      updateStatutMutation.mutate({ statut: newStatut, observations: observations || undefined });
    }
  };

  const handleValider = () => {
    if (!montantAccorde || parseFloat(montantAccorde) <= 0) {
      toast.error('Veuillez saisir un montant valide');
      return;
    }
    validerMutation.mutate({
      montant_indemnisation: parseFloat(montantAccorde),
      observations: observations || undefined,
    });
  };

  const handleRejeter = () => {
    if (!motifRejet.trim()) {
      toast.error('Veuillez saisir le motif de rejet');
      return;
    }
    rejeterMutation.mutate({ motif_rejet: motifRejet });
  };

  const handlePayer = () => {
    if (!modePaiement || !referencePaiement) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    payerMutation.mutate({
      mode_paiement: modePaiement,
      reference_paiement: referencePaiement,
      date_paiement: datePaiement,
    });
  };

  // Obtenir le chemin du fichier depuis le document ou depuis les champs du sinistre
  const getFilePath = useCallback((doc: { type_document: string; chemin_fichier?: string }): string | null => {
    if (doc.chemin_fichier) return doc.chemin_fichier;
    
    if (!sinistre) return null;
    
    const typeDoc = doc.type_document.replace(/^fichier_/, '');
    const fieldName = `fichier_${typeDoc}`;
    return sinistre[fieldName as keyof typeof sinistre] as string | null;
  }, [sinistre]);

  // Handler pour prévisualiser un document - Via l'API pour contourner CORS/symlink
  const handlePreviewDocument = useCallback(async (doc: { type_document: string; nom_fichier: string; extension: string; chemin_fichier?: string }) => {
    const filePath = getFilePath(doc);
    
    if (!filePath) {
      toast.error('Document non disponible');
      return;
    }

    const fileType = doc.extension?.toLowerCase() || filePath.split('.').pop()?.toLowerCase() || 'pdf';
    
    console.log('📄 Preview document:', { 
      originalFilePath: filePath, 
      typeDocument: doc.type_document,
      fileType,
      sinistreId: id
    });

    try {
      // Télécharger via l'API pour contourner les problèmes de CORS/symlink
      toast.loading('Chargement du document...', { id: 'preview-loading' });
      const blob = await sinistreService.downloadDocumentByPath(Number(id), filePath);
      const blobUrl = URL.createObjectURL(blob);
      toast.dismiss('preview-loading');
      
      setPreviewDocument({
        url: blobUrl,
        name: doc.nom_fichier || doc.type_document,
        type: fileType
      });
      setPreviewError(false);
      setShowPreviewModal(true);
    } catch (error) {
      toast.dismiss('preview-loading');
      console.error('❌ Erreur prévisualisation:', error);
      
      // Fallback: essayer l'URL directe du storage
      let cleanPath = filePath.replace(/\/+/g, '/').replace(/^\//, '');
      if (cleanPath.startsWith('storage/')) {
        cleanPath = cleanPath.replace('storage/', '');
      }
      const fileUrl = storageBaseUrl + cleanPath;
      
      console.log('🔄 Fallback URL directe:', fileUrl);
      
      setPreviewDocument({
        url: fileUrl,
        name: doc.nom_fichier || doc.type_document,
        type: fileType
      });
      setPreviewError(false);
      setShowPreviewModal(true);
    }
  }, [getFilePath, storageBaseUrl, id]);

  // Handler pour télécharger un document - Via l'API pour contourner CORS/symlink
  const handleDownloadDocument = useCallback(async (doc: { type_document: string; nom_fichier: string; chemin_fichier?: string }) => {
    const filePath = getFilePath(doc);
    
    if (!filePath) {
      toast.error('Document non disponible');
      return;
    }

    console.log('📥 Download document:', { filePath, typeDocument: doc.type_document, sinistreId: id });

    try {
      toast.loading('Téléchargement...', { id: 'download-loading' });
      const blob = await sinistreService.downloadDocumentByPath(Number(id), filePath);
      toast.dismiss('download-loading');
      
      // Créer un lien de téléchargement
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = doc.nom_fichier || `${doc.type_document}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      toast.success('Document téléchargé');
    } catch (error) {
      toast.dismiss('download-loading');
      console.error('❌ Erreur téléchargement:', error);
      
      // Fallback: ouvrir l'URL directe
      let cleanPath = filePath.replace(/\/+/g, '/').replace(/^\//, '');
      if (cleanPath.startsWith('storage/')) {
        cleanPath = cleanPath.replace('storage/', '');
      }
      const fileUrl = storageBaseUrl + cleanPath;
      console.log('🔄 Fallback URL directe:', fileUrl);
      window.open(fileUrl, '_blank');
    }
  }, [getFilePath, storageBaseUrl, id]);

  // Fermer la modal de prévisualisation
  const closePreviewModal = useCallback(() => {
    setPreviewDocument(null);
    setShowPreviewModal(false);
    setPreviewError(false);
  }, []);

  // Loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Chargement du sinistre..." />
      </div>
    );
  }

  // Error
  if (error || !sinistre) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-16 w-16 text-red-500" />
        <h2 className="text-xl font-semibold text-gray-900">Sinistre non trouvé</h2>
        <p className="text-gray-600">Le sinistre demandé n'existe pas ou vous n'avez pas les droits d'accès.</p>
        <Button onClick={() => navigate('/sinistres')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la liste
        </Button>
      </div>
    );
  }

  const StatusIcon = currentStatutConfig?.icon || AlertCircle;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/sinistres')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {sinistre.numero_sinistre}
              </h1>
              {emfConfig && (
                <Badge className={`${emfConfig.bgColor} ${emfConfig.color}`}>
                  {emfConfig.label}
                </Badge>
              )}
            </div>
            <p className="text-gray-600 mt-1">
              Police: {sinistre.numero_police || sinistre.contrat?.numero_police || 'N/A'}
            </p>
          </div>
        </div>
        
        {/* Actions rapides */}
        <div className="flex flex-wrap items-center gap-2">
          {currentStatutConfig && nextStatutOptions.length > 0 && (
            <Button variant="outline" onClick={() => setShowStatutModal(true)}>
              <Send className="h-4 w-4 mr-2" />
              Changer statut
            </Button>
          )}
          
          {/* Actions pour statut en_cours */}
          {sinistre.statut === 'en_cours' && (
            <>
              <Button 
                onClick={() => {
                  setNewStatut('en_instruction');
                  setShowStatutModal(true);
                }} 
                className="bg-blue-600 hover:bg-blue-700"
              >
                <FileCheck className="h-4 w-4 mr-2" />
                Passer en Instruction
              </Button>
              <Button variant="danger" onClick={() => setShowRejeterModal(true)}>
                <XCircle className="h-4 w-4 mr-2" />
                Rejeter
              </Button>
            </>
          )}
          
          {/* Actions pour statut en_instruction */}
          {sinistre.statut === 'en_instruction' && (
            <>
              <Button 
                onClick={() => {
                  setNewStatut('en_reglement');
                  setShowStatutModal(true);
                }} 
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <History className="h-4 w-4 mr-2" />
                Passer en Règlement
              </Button>
              <Button variant="danger" onClick={() => setShowRejeterModal(true)}>
                <XCircle className="h-4 w-4 mr-2" />
                Rejeter
              </Button>
            </>
          )}
          
          {sinistre.statut === 'en_reglement' && (
            <>
              {/* Bouton Générer Quittances */}
              <Button 
                onClick={() => setShowQuittanceModal(true)} 
                className="bg-amber-600 hover:bg-amber-700"
              >
                <Receipt className="h-4 w-4 mr-2" />
                Générer Quittances
              </Button>
              <Button onClick={() => setShowValiderModal(true)} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Valider (En paiement)
              </Button>
              <Button variant="danger" onClick={() => setShowRejeterModal(true)}>
                <XCircle className="h-4 w-4 mr-2" />
                Rejeter
              </Button>
            </>
          )}
          
          {sinistre.statut === 'en_paiement' && (
            <>
              {/* Afficher les quittances si générées */}
              {quittances.length > 0 && (
                <Button 
                  variant="outline"
                  onClick={() => setPreviewQuittance(quittances[0])}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Voir Quittances ({quittances.length})
                </Button>
              )}
              <Button onClick={() => setShowPayerModal(true)} className="bg-emerald-600 hover:bg-emerald-700">
                <CreditCard className="h-4 w-4 mr-2" />
                Enregistrer paiement
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Statut actuel - Carte mise en avant */}
      <Card className={`border-2 ${currentStatutConfig?.bgColor} border-opacity-50`}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl ${currentStatutConfig?.bgColor} flex items-center justify-center`}>
                <StatusIcon className={`h-7 w-7 ${currentStatutConfig?.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Statut actuel</p>
                <p className={`text-2xl font-bold ${currentStatutConfig?.color}`}>
                  {currentStatutConfig?.label}
                </p>
                <p className="text-sm text-gray-500 mt-1">{currentStatutConfig?.description}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <p className="text-gray-500">Délai traitement</p>
                <p className={`text-lg font-bold ${
                  typeof delaiTraitement === 'number' && delaiTraitement > 15 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {delaiTraitement || sinistre.delai_traitement_jours || 0} jours
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-500">Documents</p>
                <p className={`text-lg font-bold ${documentsComplets ? 'text-green-600' : 'text-orange-600'}`}>
                  {documentsComplets ? 'Complets' : 'Incomplets'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline des statuts possibles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Workflow de traitement
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Workflow principal */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {(['en_cours', 'en_instruction', 'en_reglement', 'en_paiement', 'paye', 'cloture'] as SinistreStatut[]).map((statut, index, arr) => {
              const config = STATUTS_CONFIG[statut];
              const isActive = sinistre.statut === statut;
              const isPast = getStatutOrder(sinistre.statut as SinistreStatut) > getStatutOrder(statut);
              const isRejected = sinistre.statut === 'rejete';
              const Icon = config.icon;
              
              return (
                <div key={statut} className="flex items-center">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    isActive 
                      ? `${config.bgColor} ${config.color} ring-2 ring-offset-2 ring-current` 
                      : isPast 
                        ? 'bg-green-100 text-green-700' 
                        : isRejected
                          ? 'bg-gray-100 text-gray-400 line-through'
                          : 'bg-gray-50 text-gray-400'
                  }`}>
                    <Icon className="h-4 w-4" />
                    <span className="text-xs font-medium whitespace-nowrap">{config.label}</span>
                    {isPast && <CheckCircle className="h-3 w-3" />}
                  </div>
                  {index < arr.length - 1 && (
                    <div className={`w-6 h-0.5 mx-1 ${isPast ? 'bg-green-400' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Indicateur de rejet si applicable */}
          {sinistre.statut === 'rejete' && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium text-red-700">
                Dossier rejeté - Le sinistre a été refusé
              </span>
            </div>
          )}
          
          {/* Légende */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-100 border border-green-300" />
              <span>Étape complétée</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-yellow-100 border-2 border-yellow-500" />
              <span>Étape actuelle</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-gray-50 border border-gray-200" />
              <span>Étape à venir</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grille principale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations du Sinistre */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Détails du sinistre
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Infos principales du sinistre */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <InfoItem label="Type de sinistre" value={sinistre.type_sinistre} />
              <InfoItem label="Date survenance" value={formatDate(sinistre.date_sinistre)} />
              <InfoItem label="Date déclaration" value={formatDate(sinistre.date_declaration)} />
              <InfoItem label="Capital restant dû" value={formatCurrency(sinistre.capital_restant_du)} />
              <InfoItem label="Montant réclamé" value={formatCurrency(sinistre.montant_reclame || 0)} />
              {sinistre.lieu_sinistre && (
                <InfoItem label="Lieu" value={sinistre.lieu_sinistre} />
              )}
            </div>

            {/* Informations du Contrat */}
            {sinistre.contrat && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="h-5 w-5 text-slate-600" />
                  <p className="text-sm font-semibold text-slate-700">Informations du contrat</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">N° Police</p>
                    <p className="font-medium text-slate-900">{sinistre.numero_police || sinistre.contrat.numero_police || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Assuré</p>
                    <p className="font-medium text-slate-900">
                      {sinistre.nom_assure || sinistre.contrat.nom_prenom || sinistre.contrat.nom_prenom_assure_principal || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Montant prêt assuré</p>
                    <p className="font-medium text-slate-900">{formatCurrency(sinistre.contrat.montant_pret_assure || 0)}</p>
                  </div>
                  {sinistre.contrat.duree_pret_mois && (
                    <div>
                      <p className="text-xs text-slate-500">Durée du prêt</p>
                      <p className="font-medium text-slate-900">{sinistre.contrat.duree_pret_mois} mois</p>
                    </div>
                  )}
                  {sinistre.contrat.date_effet && (
                    <div>
                      <p className="text-xs text-slate-500">Date d'effet</p>
                      <p className="font-medium text-slate-900">{formatDate(sinistre.contrat.date_effet)}</p>
                    </div>
                  )}
                  {sinistre.contrat.date_fin_echeance && (
                    <div>
                      <p className="text-xs text-slate-500">Fin échéance</p>
                      <p className="font-medium text-slate-900">{formatDate(sinistre.contrat.date_fin_echeance)}</p>
                    </div>
                  )}
                  {sinistre.contrat.capital_restant_du && (
                    <div>
                      <p className="text-xs text-slate-500">Capital restant (contrat)</p>
                      <p className="font-medium text-slate-900">{formatCurrency(sinistre.contrat.capital_restant_du)}</p>
                    </div>
                  )}
                  {sinistre.contrat.emf && (
                    <div>
                      <p className="text-xs text-slate-500">EMF</p>
                      <p className="font-medium text-slate-900">{sinistre.contrat.emf.sigle || sinistre.contrat.emf.nom}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-slate-500">Type contrat</p>
                    <p className="font-medium text-slate-900">
                      {sinistre.contrat_type?.replace('Contrat', '').replace('Emf', '') || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Garanties du contrat */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <p className="text-sm font-semibold text-slate-700">Garanties souscrites</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(sinistre.contrat.garantie_deces_iad || sinistre.contrat.garantie_prevoyance_deces_iad) && (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                        Décès / IAD
                        {sinistre.contrat.cotisation_deces_iad && (
                          <span className="ml-1 text-blue-600">({formatCurrency(sinistre.contrat.cotisation_deces_iad)})</span>
                        )}
                      </span>
                    )}
                    {sinistre.contrat.garantie_prevoyance && (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                        Prévoyance
                        {sinistre.contrat.option_prevoyance && (
                          <span className="ml-1">(Option {sinistre.contrat.option_prevoyance})</span>
                        )}
                        {sinistre.contrat.prime_unique_prevoyance && (
                          <span className="ml-1 text-purple-600">({formatCurrency(sinistre.contrat.prime_unique_prevoyance)})</span>
                        )}
                        {sinistre.contrat.cotisation_prevoyance && (
                          <span className="ml-1 text-purple-600">({formatCurrency(sinistre.contrat.cotisation_prevoyance)})</span>
                        )}
                      </span>
                    )}
                    {sinistre.contrat.garantie_perte_emploi && (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                        Perte d'emploi
                        {sinistre.contrat.cotisation_perte_emploi && (
                          <span className="ml-1 text-amber-600">({formatCurrency(sinistre.contrat.cotisation_perte_emploi)})</span>
                        )}
                      </span>
                    )}
                    {!sinistre.contrat.garantie_deces_iad && 
                     !sinistre.contrat.garantie_prevoyance_deces_iad && 
                     !sinistre.contrat.garantie_prevoyance && 
                     !sinistre.contrat.garantie_perte_emploi && (
                      <span className="text-sm text-slate-500 italic">Aucune garantie spécifiée</span>
                    )}
                  </div>
                  {sinistre.contrat.cotisation_totale_ttc && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Cotisation totale TTC</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(sinistre.contrat.cotisation_totale_ttc)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Circonstances */}
            {sinistre.circonstances && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm font-medium text-gray-600 mb-2">Circonstances</p>
                <p className="text-gray-900">{sinistre.circonstances}</p>
              </div>
            )}

            {/* Montant accordé */}
            {sinistre.montant_indemnisation && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700 font-medium">Montant accordé</p>
                    <p className="text-2xl font-bold text-green-900">
                      {formatCurrency(sinistre.montant_indemnisation)}
                    </p>
                  </div>
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
              </div>
            )}

            {/* Observations */}
            {sinistre.observations && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-700 font-medium mb-2">Observations</p>
                <p className="text-blue-900">{sinistre.observations}</p>
              </div>
            )}

            {/* Motif de rejet */}
            {sinistre.motif_rejet && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <XCircle className="h-6 w-6 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-700 font-medium mb-1">Motif de rejet</p>
                    <p className="text-red-900">{sinistre.motif_rejet}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Info paiement */}
            {sinistre.date_paiement && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <CreditCard className="h-6 w-6 text-emerald-600" />
                  <p className="text-sm text-emerald-700 font-medium">Paiement effectué</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-emerald-600">Date</p>
                    <p className="font-medium text-emerald-900">{formatDate(sinistre.date_paiement)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-emerald-600">Montant</p>
                    <p className="font-medium text-emerald-900">{formatCurrency(sinistre.montant_paye || sinistre.montant_indemnisation || 0)}</p>
                  </div>
                  {(sinistre as any).mode_paiement && (
                    <div>
                      <p className="text-xs text-emerald-600">Mode</p>
                      <p className="font-medium text-emerald-900">{(sinistre as any).mode_paiement}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Informations Assuré */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Assuré
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {sinistre.nom_assure || sinistre.contrat?.nom_prenom || sinistre.contrat?.nom_prenom_assure_principal || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500">Assuré principal</p>
                </div>
              </div>
              
              {(sinistre.telephone_assure || sinistre.telephone_declarant) && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Téléphone</p>
                    <p className="font-medium text-gray-900">{sinistre.telephone_assure || sinistre.telephone_declarant}</p>
                  </div>
                </div>
              )}

              {sinistre.email_declarant && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Mail className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900 text-sm break-all">{sinistre.email_declarant}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informations Contrat - Enrichies */}
          {sinistre.contrat && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Contrat associé
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Numéro de police */}
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-xs text-blue-600 font-medium uppercase tracking-wider">N° Police</p>
                  <p className="font-bold text-blue-900 text-lg">{sinistre.contrat.numero_police}</p>
                </div>

                {/* Nom assuré */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Assuré principal</p>
                    <p className="font-semibold text-gray-900">
                      {sinistre.contrat.nom_prenom || sinistre.contrat.nom_prenom_assure_principal || sinistre.nom_assure || 'Non renseigné'}
                    </p>
                  </div>
                </div>

                {/* Montant prêt */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Montant du prêt</p>
                    <p className="font-semibold text-green-700">{formatCurrency(sinistre.contrat.montant_pret_assure)}</p>
                  </div>
                </div>

                {/* Capital restant dû */}
                {sinistre.contrat.capital_restant_du && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Capital restant dû</p>
                      <p className="font-semibold text-amber-700">{formatCurrency(sinistre.contrat.capital_restant_du)}</p>
                    </div>
                  </div>
                )}

                {/* EMF */}
                {sinistre.contrat.emf && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Établissement (EMF)</p>
                      <p className="font-semibold text-purple-700">{sinistre.contrat.emf.sigle || sinistre.contrat.emf.nom}</p>
                    </div>
                  </div>
                )}

                <div className="border-t pt-3 mt-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      const emfKey = emfId ? ['bamboo', 'cofidec', 'bceg', 'edg', 'sodec'][emfId - 1] : '';
                      if (emfKey) {
                        navigate(`/contrats/${emfKey}/${sinistre.contrat_id}`);
                      }
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Voir tous les détails du contrat
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documents avec prévisualisation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Documents depuis la relation documents */}
              {sinistre.documents && sinistre.documents.length > 0 ? (
                <div className="space-y-3">
                  {sinistre.documents.map((doc) => {
                    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(
                      doc.extension?.toLowerCase() || doc.nom_fichier?.split('.').pop()?.toLowerCase() || ''
                    );
                    const isPdf = (doc.extension?.toLowerCase() || doc.nom_fichier?.split('.').pop()?.toLowerCase()) === 'pdf';
                    const canPreview = isImage || isPdf;
                    
                    return (
                      <div
                        key={doc.id}
                        className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isPdf ? 'bg-red-100' : isImage ? 'bg-blue-100' : 'bg-gray-200'
                            }`}>
                              {isPdf ? (
                                <FileText className="h-5 w-5 text-red-600" />
                              ) : isImage ? (
                                <FileImage className="h-5 w-5 text-blue-600" />
                              ) : (
                                <FileText className="h-5 w-5 text-gray-600" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 text-sm truncate">
                                {doc.type_document?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || doc.nom_fichier}
                              </p>
                              <p className="text-xs text-gray-500 truncate">{doc.nom_fichier}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded">
                                  {doc.extension?.toUpperCase() || 'PDF'}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {(doc.taille / 1024).toFixed(1)} KB
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {canPreview && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                onClick={() => handlePreviewDocument({...doc, chemin_fichier: doc.chemin_fichier})}
                                title="Prévisualiser"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleDownloadDocument(doc)}
                              title="Télécharger"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Documents depuis les champs fichier_* du sinistre */
                (() => {
                  const documentFields = [
                    { key: 'fichier_tableau_amortissement', label: 'Tableau d\'amortissement', type: 'tableau_amortissement' },
                    { key: 'fichier_acte_deces', label: 'Acte de décès', type: 'acte_deces' },
                    { key: 'fichier_certificat_deces', label: 'Certificat de décès', type: 'certificat_deces' },
                    { key: 'fichier_certificat_arret_travail', label: 'Certificat d\'arrêt de travail', type: 'certificat_arret_travail' },
                    { key: 'fichier_certificat_licenciement', label: 'Certificat de licenciement', type: 'certificat_licenciement' },
                    { key: 'fichier_proces_verbal', label: 'Procès verbal', type: 'proces_verbal' },
                    { key: 'fichier_proces_verbal_faillite', label: 'PV de faillite', type: 'proces_verbal_faillite' },
                    { key: 'fichier_piece_identite', label: 'Pièce d\'identité', type: 'piece_identite' },
                    { key: 'fichier_certificat_heredite', label: 'Certificat d\'hérédité', type: 'certificat_heredite' },
                    { key: 'fichier_autres_documents', label: 'Autres documents', type: 'autres_documents' },
                  ];
                  
                  const availableDocs = documentFields.filter(field => 
                    sinistre[field.key as keyof typeof sinistre]
                  );
                  
                  if (availableDocs.length > 0) {
                    return (
                      <div className="space-y-3">
                        {availableDocs.map((field) => (
                          <div
                            key={field.key}
                            className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 min-w-0 flex-1">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-red-100">
                                  <FileText className="h-5 w-5 text-red-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-gray-900 text-sm">
                                    {field.label}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded">
                                      PDF
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  onClick={() => handlePreviewDocument({ 
                                    type_document: field.type, 
                                    nom_fichier: `${field.label}.pdf`,
                                    extension: 'pdf'
                                  })}
                                  title="Prévisualiser"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => handleDownloadDocument({ 
                                    type_document: field.type, 
                                    nom_fichier: `${field.label}.pdf` 
                                  })}
                                  title="Télécharger"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  
                  return (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">Aucun document uploadé</p>
                      <p className="text-xs text-gray-400 mt-1">Les documents seront affichés ici une fois téléchargés</p>
                    </div>
                  );
                })()
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal Changer Statut */}
      <Modal
        isOpen={showStatutModal}
        onClose={() => setShowStatutModal(false)}
        title="Changer le statut"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600">Statut actuel</p>
            <div className="flex items-center gap-2 mt-1">
              <StatusIcon className={`h-5 w-5 ${currentStatutConfig?.color}`} />
              <span className={`font-medium ${currentStatutConfig?.color}`}>
                {currentStatutConfig?.label}
              </span>
            </div>
          </div>
          
          <Select
            label="Nouveau statut"
            placeholder="Sélectionner un statut"
            value={newStatut}
            onChange={(e) => setNewStatut(e.target.value as SinistreStatut)}
            options={nextStatutOptions}
          />
          
          <Textarea
            label="Observations (optionnel)"
            placeholder="Ajouter des observations..."
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            rows={3}
          />
          
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowStatutModal(false)}
            >
              Annuler
            </Button>
            <Button
              className="flex-1"
              onClick={handleChangeStatut}
              disabled={updateStatutMutation.isPending || !newStatut}
              isLoading={updateStatutMutation.isPending}
            >
              Confirmer
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Valider - Passer en paiement */}
      <Modal
        isOpen={showValiderModal}
        onClose={() => setShowValiderModal(false)}
        title="Valider le sinistre - Passer en paiement"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-sm text-green-700">Montant réclamé / Capital restant dû</p>
            <p className="text-2xl font-bold text-green-900">
              {formatCurrency(sinistre.montant_reclame || sinistre.capital_restant_du)}
            </p>
          </div>
          
          <Input
            label="Montant d'indemnisation accordé (FCFA)"
            type="number"
            placeholder="Saisir le montant à indemniser"
            value={montantAccorde}
            onChange={(e) => setMontantAccorde(e.target.value)}
          />
          
          <Textarea
            label="Observations (optionnel)"
            placeholder="Justification de la décision..."
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            rows={3}
          />
          
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowValiderModal(false)}
            >
              Annuler
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={handleValider}
              disabled={validerMutation.isPending}
              isLoading={validerMutation.isPending}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Valider
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Rejeter */}
      <Modal
        isOpen={showRejeterModal}
        onClose={() => setShowRejeterModal(false)}
        title="Rejeter le sinistre"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-sm text-red-700 font-medium">
                Cette action est irréversible
              </p>
            </div>
          </div>
          
          <Textarea
            label="Motif de rejet"
            placeholder="Expliquez la raison du rejet..."
            value={motifRejet}
            onChange={(e) => setMotifRejet(e.target.value)}
            rows={4}
            required
          />
          
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowRejeterModal(false)}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleRejeter}
              disabled={rejeterMutation.isPending || !motifRejet.trim()}
              isLoading={rejeterMutation.isPending}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rejeter
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Payer */}
      <Modal
        isOpen={showPayerModal}
        onClose={() => setShowPayerModal(false)}
        title="Enregistrer le paiement"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <p className="text-sm text-emerald-700">Montant à payer</p>
            <p className="text-2xl font-bold text-emerald-900">
              {formatCurrency(sinistre.montant_indemnisation || 0)}
            </p>
          </div>
          
          <Input
            label="Date de paiement"
            type="date"
            value={datePaiement}
            onChange={(e) => setDatePaiement(e.target.value)}
          />
          
          <Select
            label="Mode de paiement"
            placeholder="Sélectionner"
            value={modePaiement}
            onChange={(e) => setModePaiement(e.target.value)}
            options={[
              { value: 'virement', label: 'Virement bancaire' },
              { value: 'cheque', label: 'Chèque' },
              { value: 'especes', label: 'Espèces' },
              { value: 'mobile_money', label: 'Mobile Money' },
            ]}
          />
          
          <Input
            label="Référence de paiement"
            placeholder="Numéro de transaction, chèque..."
            value={referencePaiement}
            onChange={(e) => setReferencePaiement(e.target.value)}
          />
          
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowPayerModal(false)}
            >
              Annuler
            </Button>
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              onClick={handlePayer}
              disabled={payerMutation.isPending}
              isLoading={payerMutation.isPending}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Confirmer paiement
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Prévisualisation Document */}
      {showPreviewModal && previewDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closePreviewModal}
          />
          
          {/* Container */}
          <div className="relative w-full max-w-5xl h-[90vh] mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
              <div className="flex items-center gap-3">
                {previewDocument.type === 'pdf' ? (
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-red-600" />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileImage className="h-5 w-5 text-blue-600" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 truncate max-w-md">
                    {previewDocument.name}
                  </h3>
                  <p className="text-xs text-gray-500 uppercase">
                    Fichier {previewDocument.type}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = previewDocument.url;
                    link.download = previewDocument.name;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    toast.success('Document téléchargé');
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(previewDocument.url, '_blank')}
                  title="Ouvrir dans un nouvel onglet"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={closePreviewModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-auto bg-gray-100 p-4">
              {previewError ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="h-10 w-10 text-red-500" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">Fichier non trouvé</p>
                  <p className="text-sm text-gray-600 text-center max-w-md mb-4">
                    Le fichier n'existe pas sur le serveur ou n'a pas été téléversé correctement.
                    Vérifiez que le symlink storage Laravel est configuré.
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md">
                    <p className="text-xs font-mono text-amber-800 break-all">
                      {previewDocument.url}
                    </p>
                  </div>
                  <Button
                    className="mt-4"
                    variant="outline"
                    onClick={() => window.open(previewDocument.url, '_blank')}
                  >
                    <Maximize2 className="h-4 w-4 mr-2" />
                    Essayer dans un nouvel onglet
                  </Button>
                </div>
              ) : previewDocument.type === 'pdf' ? (
                <iframe
                  src={previewDocument.url}
                  className="w-full h-full rounded-lg bg-white shadow-inner"
                  title="Prévisualisation PDF"
                  onError={() => setPreviewError(true)}
                />
              ) : ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(previewDocument.type) ? (
                <div className="flex items-center justify-center h-full">
                  <img
                    src={previewDocument.url}
                    alt={previewDocument.name}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                    onError={() => setPreviewError(true)}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <FileText className="h-16 w-16 mb-4" />
                  <p className="text-lg font-medium">Aperçu non disponible</p>
                  <p className="text-sm">Ce type de fichier ne peut pas être prévisualisé</p>
                  <Button
                    className="mt-4"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = previewDocument.url;
                      link.download = previewDocument.name;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger le fichier
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Génération Quittances */}
      {sinistre && (
        <QuittanceGenerationModal
          isOpen={showQuittanceModal}
          onClose={() => setShowQuittanceModal(false)}
          sinistre={sinistre}
          onGenerate={(generatedQuittances) => {
            // Refetch les quittances depuis l'API pour avoir les données à jour
            refetchQuittances();
            toast.success(`${generatedQuittances.length} quittance(s) générée(s) avec succès`);
            // Les quittances sont maintenant en attente de validation
          }}
        />
      )}

      {/* Modal Prévisualisation Quittance */}
      {previewQuittance && (
        <Modal
          isOpen={!!previewQuittance}
          onClose={() => setPreviewQuittance(null)}
          title="Prévisualisation de la Quittance"
          size="xl"
        >
          <div className="overflow-auto max-h-[75vh]">
            <div className="transform scale-[0.65] origin-top">
              <QuittancePrint 
                quittance={previewQuittance} 
                showSignatures={true}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t print:hidden">
            <Button
              variant="outline"
              onClick={() => setPreviewQuittance(null)}
            >
              Fermer
            </Button>
            {previewQuittance.statut === 'validee_fpdg' && (
              <Button onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimer
              </Button>
            )}
          </div>
        </Modal>
      )}

      {/* Section Quittances générées (visible si en_reglement ou en_paiement) */}
      {quittances.length > 0 && (sinistre.statut === 'en_reglement' || sinistre.statut === 'en_paiement' || sinistre.statut === 'paye') && (
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <Receipt className="h-5 w-5" />
              Quittances générées ({quittances.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quittances.map((quittance, index) => (
                <QuittanceListItem
                  key={quittance.reference || index}
                  quittance={quittance}
                  userRole="admin_samba"
                  onPreview={() => setPreviewQuittance(quittance)}
                />
              ))}
            </div>
            
            {quittances.some(q => q.statut === 'rejetee') && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Quittance(s) rejetée(s)
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Veuillez corriger les informations et régénérer les quittances.
                    </p>
                    <Button
                      size="sm"
                      className="mt-2 bg-amber-600 hover:bg-amber-700"
                      onClick={() => setShowQuittanceModal(true)}
                    >
                      Régénérer les quittances
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {quittances.every(q => q.statut === 'en_attente_comptable') && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <p className="text-sm text-blue-800">
                    Les quittances sont en attente de validation par le comptable.
                  </p>
                </div>
              </div>
            )}
            
            {quittances.some(q => q.statut === 'en_attente_fpdg' || q.statut === 'validee_comptable') && (
              <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-500" />
                  <p className="text-sm text-purple-800">
                    En attente de validation finale par le FPDG.
                  </p>
                </div>
              </div>
            )}
            
            {quittances.every(q => q.statut === 'validee_fpdg') && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <p className="text-sm text-green-800">
                    Toutes les quittances sont validées et prêtes pour le paiement.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Composant helper pour afficher les infos
const InfoItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-medium text-gray-900">{value || 'N/A'}</p>
  </div>
);

// Helper pour l'ordre des statuts - Correspond au workflow backend
function getStatutOrder(statut: SinistreStatut): number {
  const order: Record<SinistreStatut, number> = {
    en_cours: 1,
    en_instruction: 2,
    en_reglement: 3,
    en_paiement: 4,
    paye: 5,
    rejete: 5,
    cloture: 6,
  };
  return order[statut] || 0;
}
