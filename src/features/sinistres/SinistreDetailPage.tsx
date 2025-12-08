import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { 
  ArrowLeft, CheckCircle, XCircle, DollarSign, 
  FileText, Upload, Download, Trash2, Eye, Calendar,
  User, Phone, Mail, AlertCircle
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { sinistreService } from '@/services/sinistre.service';
import { SinistreDocument } from '@/types/sinistre.types';
import toast from 'react-hot-toast';

export const SinistreDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [showValiderModal, setShowValiderModal] = useState(false);
  const [showRejeterModal, setShowRejeterModal] = useState(false);
  const [showPayerModal, setShowPayerModal] = useState(false);
  const [montantAccorde, setMontantAccorde] = useState('');
  const [observations, setObservations] = useState('');
  const [motifRejet, setMotifRejet] = useState('');
  const [modePaiement, setModePaiement] = useState('');
  const [referencePaiement, setReferencePaiement] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: sinistreResponse, isLoading } = useQuery({
    queryKey: ['sinistre', id],
    queryFn: async () => {
      return await sinistreService.getById(Number(id));
    },
  });

  const sinistre = sinistreResponse?.data;

  const validerMutation = useMutation({
    mutationFn: (data: { montant_accorde: number; observations?: string }) => 
      sinistreService.valider(Number(id), data),
    onSuccess: () => {
      toast.success('Sinistre validé avec succès');
      queryClient.invalidateQueries({ queryKey: ['sinistre', id] });
      setShowValiderModal(false);
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la validation');
    },
  });

  const rejeterMutation = useMutation({
    mutationFn: (data: { motif_rejet: string }) => 
      sinistreService.rejeter(Number(id), data),
    onSuccess: () => {
      toast.success('Sinistre rejeté');
      queryClient.invalidateQueries({ queryKey: ['sinistre', id] });
      setShowRejeterModal(false);
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Erreur lors du rejet');
    },
  });

  const payerMutation = useMutation({
    mutationFn: (data: { mode_paiement: string; reference_paiement: string }) => 
      sinistreService.payer(Number(id), data),
    onSuccess: () => {
      toast.success('Paiement enregistré avec succès');
      queryClient.invalidateQueries({ queryKey: ['sinistre', id] });
      setShowPayerModal(false);
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Erreur lors du paiement');
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => sinistreService.uploadDocument(Number(id), formData),
    onSuccess: () => {
      toast.success('Document uploadé avec succès');
      queryClient.invalidateQueries({ queryKey: ['sinistre', id] });
      setSelectedFile(null);
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'upload');
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: (documentId: number) => sinistreService.deleteDocument(Number(id), documentId),
    onSuccess: () => {
      toast.success('Document supprimé');
      queryClient.invalidateQueries({ queryKey: ['sinistre', id] });
    },
  });

  const handleValider = () => {
    if (!montantAccorde) {
      toast.error('Veuillez saisir le montant accordé');
      return;
    }
    validerMutation.mutate({
      montant_accorde: parseFloat(montantAccorde),
      observations,
    });
  };

  const handleRejeter = () => {
    if (!motifRejet) {
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
    });
  };

  const handleFileUpload = () => {
    if (!selectedFile) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }

    const formData = new FormData();
    formData.append('document', selectedFile);

    uploadMutation.mutate(formData);
  };

  const getStatusColor = (statut: string) => {
    const colors: Record<string, string> = {
      en_attente: 'bg-yellow-100 text-yellow-800',
      en_cours: 'bg-blue-100 text-blue-800',
      valide: 'bg-green-100 text-green-800',
      rejete: 'bg-red-100 text-red-800',
      paye: 'bg-purple-100 text-purple-800',
      cloture: 'bg-gray-100 text-gray-800',
    };
    return colors[statut] || 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      deces: 'bg-black text-white',
      iad: 'bg-orange-100 text-orange-800',
      maladie: 'bg-pink-100 text-pink-800',
      perte_emploi: 'bg-indigo-100 text-indigo-800',
      prevoyance: 'bg-cyan-100 text-cyan-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Chargement du sinistre..." />
      </div>
    );
  }

  if (!sinistre) {
    return <div>Sinistre non trouvé</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/sinistres')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Sinistre {sinistre.numero_sinistre}
            </h1>
            <p className="text-gray-600 mt-1">
              Police: {sinistre.numero_police}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {sinistre.statut === 'en_cours' && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowValiderModal(true)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Valider
              </Button>
              <Button
                variant="danger"
                onClick={() => setShowRejeterModal(true)}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rejeter
              </Button>
            </>
          )}
          {sinistre.statut === 'valide' && (
            <Button onClick={() => setShowPayerModal(true)}>
              <DollarSign className="h-4 w-4 mr-2" />
              Enregistrer Paiement
            </Button>
          )}
        </div>
      </div>

      {/* Statut et Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Statut</p>
                <Badge className={`mt-2 ${getStatusColor(sinistre.statut)}`}>
                  {sinistre.statut}
                </Badge>
              </div>
              <AlertCircle className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <Badge className={`mt-2 ${getTypeColor(sinistre.type_sinistre)}`}>
                  {sinistre.type_sinistre}
                </Badge>
              </div>
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Montant Réclamé</p>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {formatCurrency(sinistre.montant_reclame)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Délai Traitement</p>
                <p className={`text-xl font-bold mt-1 ${
                  (sinistre.delai_traitement_jours ?? 0) > 15 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {sinistre.delai_traitement_jours ?? 0} jours
                </p>
              </div>
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Détails */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations du Sinistre */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informations du Sinistre</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Date de survenance</p>
                <p className="font-medium text-gray-900">
                  {formatDate(sinistre.date_survenance)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date de déclaration</p>
                <p className="font-medium text-gray-900">
                  {formatDate(sinistre.date_declaration)}
                </p>
              </div>
              {sinistre.date_reception_dossier && (
                <div>
                  <p className="text-sm text-gray-600">Dossier reçu le</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(sinistre.date_reception_dossier)}
                  </p>
                </div>
              )}
              {sinistre.cause_sinistre && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Cause</p>
                  <p className="font-medium text-gray-900">{sinistre.cause_sinistre}</p>
                </div>
              )}
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Description</p>
                <p className="font-medium text-gray-900">{sinistre.description}</p>
              </div>
            </div>

            {sinistre.montant_accorde && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">Montant accordé</p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(sinistre.montant_accorde)}
                </p>
              </div>
            )}

            {sinistre.observations && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">Observations</p>
                <p className="text-sm text-blue-900 mt-1">{sinistre.observations}</p>
              </div>
            )}

            {sinistre.motif_rejet && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">Motif de rejet</p>
                <p className="text-sm text-red-900 mt-1">{sinistre.motif_rejet}</p>
              </div>
            )}

            {sinistre.date_paiement && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-purple-700">Date de paiement</p>
                    <p className="font-medium text-purple-900">
                      {formatDate(sinistre.date_paiement)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-purple-700">Mode de paiement</p>
                    <p className="font-medium text-purple-900">{sinistre.mode_paiement}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-purple-700">Référence</p>
                    <p className="font-medium text-purple-900 font-mono">
                      {sinistre.reference_paiement}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informations de l'Assuré */}
        <Card>
          <CardHeader>
            <CardTitle>Informations Assuré</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Nom complet</p>
                <p className="font-medium text-gray-900">{sinistre.nom_assure}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Phone className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Téléphone</p>
                <p className="font-medium text-gray-900">{sinistre.telephone_assure}</p>
              </div>
            </div>
            {sinistre.email_assure && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Mail className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{sinistre.email_assure}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Documents */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Documents</CardTitle>
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
                    <FileText className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">{doc.nom}</p>
                      <p className="text-sm text-gray-500">
                        {(doc.taille / 1024).toFixed(2)} KB - {formatDate(doc.uploaded_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(doc.url, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(doc.url, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm('Supprimer ce document ?')) {
                          deleteDocumentMutation.mutate(doc.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
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

      {/* Modal Valider */}
      <Modal
        isOpen={showValiderModal}
        onClose={() => setShowValiderModal(false)}
        title="Valider le Sinistre"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Montant accordé (FCFA)"
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
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowValiderModal(false)}
            >
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
              disabled={rejeterMutation.isPending}
              isLoading={rejeterMutation.isPending}
            >
              Rejeter
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Payer */}
      <Modal
        isOpen={showPayerModal}
        onClose={() => setShowPayerModal(false)}
        title="Enregistrer le Paiement"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-700">Montant à payer</p>
            <p className="text-2xl font-bold text-purple-900">
              {formatCurrency(sinistre.montant_accorde || 0)}
            </p>
          </div>
          <Input
            label="Mode de paiement"
            placeholder="Ex: Virement, Chèque, Espèces..."
            value={modePaiement}
            onChange={(e) => setModePaiement(e.target.value)}
          />
          <Input
            label="Référence de paiement"
            placeholder="Numéro de transaction, chèque..."
            value={referencePaiement}
            onChange={(e) => setReferencePaiement(e.target.value)}
          />
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowPayerModal(false)}
            >
              Annuler
            </Button>
            <Button
              className="flex-1"
              onClick={handlePayer}
              disabled={payerMutation.isPending}
              isLoading={payerMutation.isPending}
            >
              Enregistrer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
