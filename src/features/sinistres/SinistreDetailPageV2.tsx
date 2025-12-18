// src/features/sinistres/SinistreDetailPageV2.tsx
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useAuthStore } from '@/store/authStore';
import { useSinistreValidation } from '@/hooks/useSinistreValidation';
import { sinistreService } from '@/services/sinistre.service';
import { 
  SinistreStatutBadge, 
  TypeSinistreBadge, 
  DelaiPaiementIndicator,
  QuittancesList,
  SinistreWorkflow,
  ArchiveBadge
} from '@/components/sinistres';
import { SinistreNonModifiableAlert } from '@/components/sinistres/ArchiveBadge';
import { SinistreDocument, ModePaiement } from '@/types/sinistre.types';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Eye, 
  Calendar,
  User, 
  Phone,
  AlertCircle,
  Archive,
  Lock,
  Wallet,
  Building2,
  FileCheck,
  Settings,
  History
} from 'lucide-react';

export const SinistreDetailPageV2 = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Permissions depuis le store
  const { 
    peutValiderSinistre, 
    peutCloturerSinistre,
    estLecteurSeul,
    isAdmin
  } = useAuthStore();
  
  // Vérifier si l'utilisateur peut traiter les sinistres (admin ou gestionnaire)
  const canTraiterSinistre = isAdmin() || peutValiderSinistre();
  
  // Hook de validation pour les messages d'erreur
  const { getErrorMessage } = useSinistreValidation();
  
  // États locaux
  const [showValiderModal, setShowValiderModal] = useState(false);
  const [showRejeterModal, setShowRejeterModal] = useState(false);
  const [showCloturerModal, setShowCloturerModal] = useState(false);
  const [montantAccorde, setMontantAccorde] = useState('');
  const [observations, setObservations] = useState('');
  const [motifRejet, setMotifRejet] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Récupération du sinistre avec quittances et délai
  const { data: sinistreResponse, isLoading, isError, error } = useQuery({
    queryKey: ['sinistre', id],
    queryFn: () => sinistreService.getById(Number(id)),
    enabled: !!id,
  });

  const sinistre = sinistreResponse?.data;
  const quittances = sinistreResponse?.quittances || sinistre?.quittances || [];
  const delaiPaiement = sinistreResponse?.delai_paiement || sinistre?.delai_paiement;
  const estModifiable = sinistreResponse?.est_modifiable !== false && !sinistre?.est_archive;

  // Vérification si le contrat a la prévoyance
  const avecPrevoyance = useMemo(() => {
    if (!sinistre?.contrat) return false;
    return !!(
      sinistre.contrat.garantie_prevoyance ||
      sinistre.contrat.garantie_prevoyance_deces_iad ||
      sinistre.contrat.avec_prevoyance ||
      sinistre.contrat.option_prevoyance
    );
  }, [sinistre]);

  // Permissions calculées - étendues pour tous les statuts
  const canPasserEnInstruction = canTraiterSinistre && sinistre?.statut === 'en_cours' && estModifiable;
  const canPasserEnReglement = canTraiterSinistre && sinistre?.statut === 'en_instruction' && estModifiable;
  const canValiderEnPaiement = canTraiterSinistre && sinistre?.statut === 'en_reglement' && estModifiable;
  const canRejeter = canTraiterSinistre && ['en_cours', 'en_instruction', 'en_reglement'].includes(sinistre?.statut || '') && estModifiable;
  const canCloturer = peutCloturerSinistre() && sinistre?.statut === 'paye' && !sinistre?.est_archive;
  const isReadOnly = estLecteurSeul() || !estModifiable;

  // ==========================================
  // MUTATIONS
  // ==========================================

  // Valider sinistre (passage en instruction)
  const validerMutation = useMutation({
    mutationFn: (data: { montant_accorde: number; observations?: string }) => 
      sinistreService.valider(Number(id), data),
    onSuccess: () => {
      toast.success('Sinistre passé en instruction');
      queryClient.invalidateQueries({ queryKey: ['sinistre', id] });
      setShowValiderModal(false);
      setMontantAccorde('');
      setObservations('');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  // Passer en règlement
  const passerEnReglementMutation = useMutation({
    mutationFn: () => sinistreService.passerEnReglement(Number(id)),
    onSuccess: () => {
      toast.success('Sinistre passé en règlement');
      queryClient.invalidateQueries({ queryKey: ['sinistre', id] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  // Rejeter sinistre
  const rejeterMutation = useMutation({
    mutationFn: (data: { motif_rejet: string }) => 
      sinistreService.rejeter(Number(id), data),
    onSuccess: () => {
      toast.success('Sinistre rejeté');
      queryClient.invalidateQueries({ queryKey: ['sinistre', id] });
      setShowRejeterModal(false);
      setMotifRejet('');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  // Valider une quittance
  const validerQuittanceMutation = useMutation({
    mutationFn: (quittanceId: number) => 
      sinistreService.validerQuittance(Number(id), quittanceId),
    onSuccess: () => {
      toast.success('Quittance validée');
      queryClient.invalidateQueries({ queryKey: ['sinistre', id] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  // Payer une quittance
  const payerQuittanceMutation = useMutation({
    mutationFn: ({ quittanceId, paiement }: { 
      quittanceId: number; 
      paiement: { mode_paiement: ModePaiement; numero_transaction?: string } 
    }) => sinistreService.payerQuittance(Number(id), quittanceId, paiement),
    onSuccess: () => {
      toast.success('Quittance payée avec succès');
      queryClient.invalidateQueries({ queryKey: ['sinistre', id] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  // Clôturer sinistre
  const cloturerMutation = useMutation({
    mutationFn: () => sinistreService.cloturer(Number(id)),
    onSuccess: () => {
      toast.success('Sinistre clôturé et archivé');
      queryClient.invalidateQueries({ queryKey: ['sinistre', id] });
      setShowCloturerModal(false);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  // Télécharger archive
  const telechargerArchiveMutation = useMutation({
    mutationFn: () => sinistreService.telechargerArchive(Number(id)),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `archive_sinistre_${sinistre?.numero_sinistre}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Archive téléchargée');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  // Upload document
  const uploadMutation = useMutation({
    mutationFn: (file: File) => 
      sinistreService.uploadDocument(Number(id), file, 'document', ''),
    onSuccess: () => {
      toast.success('Document uploadé avec succès');
      queryClient.invalidateQueries({ queryKey: ['sinistre', id] });
      setSelectedFile(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  // Supprimer document
  const deleteDocumentMutation = useMutation({
    mutationFn: (documentId: number) => 
      sinistreService.deleteDocument(Number(id), documentId),
    onSuccess: () => {
      toast.success('Document supprimé');
      queryClient.invalidateQueries({ queryKey: ['sinistre', id] });
    },
  });

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleValider = () => {
    if (!montantAccorde) {
      toast.error('Veuillez saisir le montant accordé');
      return;
    }
    validerMutation.mutate({
      montant_accorde: parseFloat(montantAccorde),
      observations: observations || undefined,
    });
  };

  const handleRejeter = () => {
    if (!motifRejet) {
      toast.error('Veuillez saisir le motif de rejet');
      return;
    }
    rejeterMutation.mutate({ motif_rejet: motifRejet });
  };

  const handleValiderQuittance = async (quittanceId: number) => {
    await validerQuittanceMutation.mutateAsync(quittanceId);
  };

  const handlePayerQuittance = async (
    quittanceId: number, 
    paiement: { mode_paiement: ModePaiement; numero_transaction?: string }
  ) => {
    await payerQuittanceMutation.mutateAsync({ quittanceId, paiement });
  };

  const handleCloturer = () => {
    cloturerMutation.mutate();
  };

  const handleFileUpload = () => {
    if (!selectedFile) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }
    uploadMutation.mutate(selectedFile);
  };

  // ==========================================
  // RENDER
  // ==========================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Chargement du sinistre..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900">Erreur de chargement</h2>
        <p className="text-gray-600 mt-2">{getErrorMessage(error)}</p>
        <Button className="mt-4" onClick={() => navigate('/sinistres')}>
          Retour à la liste
        </Button>
      </div>
    );
  }

  if (!sinistre) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900">Sinistre non trouvé</h2>
        <Button className="mt-4" onClick={() => navigate('/sinistres')}>
          Retour à la liste
        </Button>
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold text-gray-900">
                {sinistre.numero_sinistre}
              </h1>
              <SinistreStatutBadge statut={sinistre.statut} />
              <ArchiveBadge 
                isArchive={sinistre.est_archive} 
                fichierArchive={sinistre.fichier_archive}
                onDownload={() => telechargerArchiveMutation.mutate()}
              />
            </div>
            <p className="text-gray-600 mt-1">
              Police: {sinistre.numero_police || sinistre.contrat?.numero_police}
            </p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Bouton vers page de traitement complète */}
          {canTraiterSinistre && estModifiable && (
            <Button 
              variant="outline" 
              onClick={() => navigate(`/sinistres/traitement/${id}`)}
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              <Settings className="h-4 w-4 mr-2" />
              Traitement complet
            </Button>
          )}
          
          {/* Actions selon le statut */}
          {canPasserEnInstruction && (
            <Button onClick={() => setShowValiderModal(true)} className="bg-blue-600 hover:bg-blue-700">
              <FileCheck className="h-4 w-4 mr-2" />
              Passer en Instruction
            </Button>
          )}
          
          {canPasserEnReglement && (
            <Button 
              onClick={() => passerEnReglementMutation.mutate()}
              disabled={passerEnReglementMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <History className="h-4 w-4 mr-2" />
              {passerEnReglementMutation.isPending ? 'En cours...' : 'Passer en Règlement'}
            </Button>
          )}
          
          {canValiderEnPaiement && (
            <Button onClick={() => setShowValiderModal(true)} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Valider (En paiement)
            </Button>
          )}
          
          {canRejeter && (
            <Button variant="danger" onClick={() => setShowRejeterModal(true)}>
              <XCircle className="h-4 w-4 mr-2" />
              Rejeter
            </Button>
          )}
          
          {canCloturer && (
            <Button 
              variant="outline" 
              onClick={() => setShowCloturerModal(true)}
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <Archive className="h-4 w-4 mr-2" />
              Clôturer
            </Button>
          )}
        </div>
      </div>

      {/* Alerte sinistre non modifiable */}
      {!estModifiable && <SinistreNonModifiableAlert />}

      {/* Délai de paiement (Règle C) */}
      {sinistre.statut === 'en_paiement' && delaiPaiement && (
        <DelaiPaiementIndicator delai={delaiPaiement} />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Type de sinistre</p>
                <div className="mt-2">
                  <TypeSinistreBadge type={sinistre.type_sinistre} size="lg" />
                </div>
              </div>
              <FileText className="h-8 w-8 text-gray-300" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Capital restant dû</p>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {formatCurrency(sinistre.capital_restant_du)}
                </p>
              </div>
              <Wallet className="h-8 w-8 text-gray-300" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Indemnisation</p>
                <p className="text-xl font-bold text-emerald-600 mt-1">
                  {formatCurrency(sinistre.montant_indemnisation || 0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-gray-300" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Délai traitement</p>
                <p className={`text-xl font-bold mt-1 ${
                  (sinistre.delai_traitement_jours ?? 0) > 15 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {sinistre.delai_traitement_jours ?? 0} jours
                </p>
              </div>
              <Calendar className="h-8 w-8 text-gray-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations du sinistre */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-gray-500" />
                Informations du Sinistre
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Date du sinistre</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(sinistre.date_sinistre)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date de déclaration</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(sinistre.date_declaration)}
                  </p>
                </div>
                {sinistre.lieu_sinistre && (
                  <div>
                    <p className="text-sm text-gray-500">Lieu</p>
                    <p className="font-medium text-gray-900">{sinistre.lieu_sinistre}</p>
                  </div>
                )}
                {sinistre.date_reception_documents && (
                  <div>
                    <p className="text-sm text-gray-500">Documents reçus le</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(sinistre.date_reception_documents)}
                    </p>
                  </div>
                )}
              </div>

              {sinistre.circonstances && (
                <div>
                  <p className="text-sm text-gray-500">Circonstances</p>
                  <p className="font-medium text-gray-900 mt-1">{sinistre.circonstances}</p>
                </div>
              )}

              {/* Montant accordé */}
              {sinistre.montant_indemnisation && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-sm text-emerald-700">Montant d'indemnisation accordé</p>
                  <p className="text-2xl font-bold text-emerald-900">
                    {formatCurrency(sinistre.montant_indemnisation)}
                  </p>
                </div>
              )}

              {/* Observations */}
              {sinistre.observations && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-sm text-blue-700 font-medium">Observations</p>
                  <p className="text-sm text-blue-900 mt-1">{sinistre.observations}</p>
                </div>
              )}

              {/* Motif rejet */}
              {sinistre.motif_rejet && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-700 font-medium">Motif de rejet</p>
                  <p className="text-sm text-red-900 mt-1">{sinistre.motif_rejet}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quittances (Règle B) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-500" />
                Quittances
              </CardTitle>
            </CardHeader>
            <CardContent>
              <QuittancesList
                quittances={quittances}
                avecPrevoyance={avecPrevoyance}
                onValider={!isReadOnly ? handleValiderQuittance : undefined}
                onPayer={!isReadOnly ? handlePayerQuittance : undefined}
                isLoading={validerQuittanceMutation.isPending || payerQuittanceMutation.isPending}
              />
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-500" />
                  Documents
                </CardTitle>
                {!isReadOnly && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="max-w-xs"
                    />
                    <Button
                      size="sm"
                      onClick={handleFileUpload}
                      disabled={!selectedFile || uploadMutation.isPending}
                      isLoading={uploadMutation.isPending}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {sinistre.documents && sinistre.documents.length > 0 ? (
                <div className="space-y-2">
                  {sinistre.documents.map((doc: SinistreDocument) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900">{doc.nom_fichier}</p>
                          <p className="text-sm text-gray-500">
                            {doc.type_document} - {formatDate(doc.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                        {!isReadOnly && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (confirm('Supprimer ce document ?')) {
                                deleteDocumentMutation.mutate(doc.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">
                  Aucun document uploadé
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Workflow */}
          <Card>
            <CardHeader>
              <CardTitle>Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <SinistreWorkflow sinistre={sinistre} />
            </CardContent>
          </Card>

          {/* Informations Assuré */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-gray-500" />
                Assuré
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nom complet</p>
                  <p className="font-medium text-gray-900">
                    {sinistre.nom_assure || sinistre.contrat?.nom_prenom}
                  </p>
                </div>
              </div>
              {sinistre.telephone_assure && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Téléphone</p>
                    <p className="font-medium text-gray-900">{sinistre.telephone_assure}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informations Contrat */}
          {sinistre.contrat && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-gray-500" />
                  Contrat
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">N° Police</span>
                  <span className="font-mono font-medium">{sinistre.contrat.numero_police}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Montant prêt</span>
                  <span className="font-medium">{formatCurrency(sinistre.contrat.montant_pret_assure)}</span>
                </div>
                {sinistre.contrat.emf && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">EMF</span>
                    <span className="font-medium">{sinistre.contrat.emf.sigle}</span>
                  </div>
                )}
                {avecPrevoyance && (
                  <div className="mt-3 p-2 bg-blue-50 rounded-lg text-xs text-blue-700">
                    ✓ Garantie prévoyance incluse
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ==========================================
          MODALS
          ========================================== */}

      {/* Modal Valider */}
      <Modal
        isOpen={showValiderModal}
        onClose={() => setShowValiderModal(false)}
        title="Valider le Sinistre"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Montant d'indemnisation (FCFA)"
            type="number"
            placeholder="0"
            value={montantAccorde}
            onChange={(e) => setMontantAccorde(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observations (optionnel)
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Observations..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowValiderModal(false)}>
              Annuler
            </Button>
            <Button
              className="flex-1"
              onClick={handleValider}
              disabled={validerMutation.isPending}
              isLoading={validerMutation.isPending}
            >
              Valider
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Rejeter */}
      <Modal
        isOpen={showRejeterModal}
        onClose={() => setShowRejeterModal(false)}
        title="Rejeter le Sinistre"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motif de rejet <span className="text-red-600">*</span>
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={4}
              placeholder="Expliquez le motif du rejet..."
              value={motifRejet}
              onChange={(e) => setMotifRejet(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowRejeterModal(false)}>
              Annuler
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleRejeter}
              disabled={rejeterMutation.isPending}
              isLoading={rejeterMutation.isPending}
            >
              Rejeter
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Clôturer (Règle E) */}
      <Modal
        isOpen={showCloturerModal}
        onClose={() => setShowCloturerModal(false)}
        title="Clôturer et Archiver le Sinistre"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
            <div className="flex items-center gap-3">
              <Archive className="h-8 w-8 text-purple-600" />
              <div>
                <p className="font-medium text-purple-800">Clôture définitive</p>
                <p className="text-sm text-purple-600">
                  Cette action est irréversible. Le sinistre sera archivé et ne pourra plus être modifié.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Attention</span>
            </div>
            <ul className="mt-2 text-sm text-yellow-700 space-y-1 list-disc list-inside">
              <li>Toutes les quittances doivent être payées</li>
              <li>Le dossier sera archivé avec tous ses documents</li>
              <li>Un fichier PDF récapitulatif sera généré</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowCloturerModal(false)}>
              Annuler
            </Button>
            <Button
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              onClick={handleCloturer}
              disabled={cloturerMutation.isPending}
              isLoading={cloturerMutation.isPending}
            >
              <Lock className="h-4 w-4 mr-2" />
              Confirmer la clôture
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SinistreDetailPageV2;
