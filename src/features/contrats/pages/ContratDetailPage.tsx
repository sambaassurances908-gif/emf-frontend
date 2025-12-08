import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ArrowLeft, FileText, User, CreditCard, Calendar, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import api from '@/lib/api';

export const ContratDetailPage = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();

  const { data: contrat, isLoading, error } = useQuery({
    queryKey: ['contrat', type, id],
    queryFn: async () => {
      // CORRECTION : Slash explicite au début
      // Si type = "bamboo-emf", l'URL finale doit être http://localhost:8000/api/bamboo-emf/contrats/1
      const endpoint = `/${type}/contrats/${id}`;
      
      console.log(`🌐 Tentative appel API: ${api.defaults.baseURL}${endpoint}`);
      
      const response = await api.get(endpoint);
      return response.data.data;
    },
    enabled: !!type && !!id,
    retry: false, // Désactiver le retry pour voir l'erreur tout de suite
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 flex-col gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-500">Chargement du contrat...</p>
      </div>
    );
  }

  if (error || !contrat) {
    const err = error as any;
    return (
      <div className="p-8 flex justify-center">
        <Card className="w-full max-w-lg border-red-200 bg-red-50 shadow-lg">
          <CardContent className="flex flex-col items-center text-center p-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Impossible de charger le contrat</h2>
            
            <div className="bg-white p-4 rounded-md border border-red-100 text-left w-full mb-6 font-mono text-xs overflow-auto">
              <p className="mb-1"><span className="font-bold">URL:</span> {`/${type}/contrats/${id}`}</p>
              <p className="mb-1"><span className="font-bold">Status:</span> {err?.response?.status || 'Erreur réseau'}</p>
              <p><span className="font-bold">Message:</span> {err?.response?.data?.message || err?.message}</p>
            </div>

            <Button variant="outline" onClick={() => navigate('/contrats')} className="bg-white hover:bg-gray-50">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la liste
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/contrats')}>
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                Contrat N° {contrat.numero_police || <span className="italic text-gray-400 text-lg">En attente</span>}
              </h1>
              <Badge className={getStatusColor(contrat.statut)}>{contrat.statut}</Badge>
            </div>
            <p className="text-gray-500 text-sm mt-1 capitalize">
              {type?.replace('-', ' ')} • Créé le {formatDate(contrat.created_at)}
            </p>
          </div>
        </div>
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          Télécharger PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="md:col-span-2 space-y-6">
          {/* Informations Client */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <User className="h-5 w-5 text-blue-600" />
                Assuré & Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <label className="text-sm font-medium text-gray-500">Nom et Prénom</label>
                <p className="text-base font-semibold text-gray-900 mt-1">
                  {contrat.nom_prenom || `${contrat.nom || ''} ${contrat.prenom || ''}`.trim() || '-'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Téléphone</label>
                <p className="text-base font-medium text-gray-900 mt-1">{contrat.telephone_assure || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-base font-medium text-gray-900 mt-1">{contrat.email_assure || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Adresse</label>
                <p className="text-base font-medium text-gray-900 mt-1">
                  {[contrat.adresse_assure, contrat.ville_assure].filter(Boolean).join(', ') || '-'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Détails Financiers */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <CreditCard className="h-5 w-5 text-green-600" />
                Détails du Financement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <p className="text-sm font-medium text-green-700 mb-1">Montant du Prêt Assuré</p>
                  <p className="text-2xl font-bold text-green-800">
                    {formatCurrency(Number(contrat.montant_pret_assure || contrat.montant_pret))}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <p className="text-sm font-medium text-blue-700 mb-1">Cotisation Totale (TTC)</p>
                  <p className="text-2xl font-bold text-blue-800">
                    {formatCurrency(Number(contrat.cotisation_totale_ttc || 0))}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 pt-4 border-t border-gray-100">
                <div>
                  <label className="text-sm text-gray-500">Durée du prêt</label>
                  <p className="font-medium text-gray-900">{contrat.duree_pret_mois} mois</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Taux Appliqué</label>
                  <p className="font-medium text-gray-900">{contrat.taux_applique ? `${contrat.taux_applique}%` : '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <Calendar className="h-5 w-5 text-orange-600" />
                Période & Validité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative pl-4 border-l-2 border-blue-200">
                <label className="text-xs font-bold text-blue-600 uppercase tracking-wide">Date d'effet</label>
                <p className="text-lg font-medium text-gray-900">{formatDate(contrat.date_effet)}</p>
              </div>
              
              <div className="relative pl-4 border-l-2 border-orange-200">
                <label className="text-xs font-bold text-orange-600 uppercase tracking-wide">Date d'expiration</label>
                <p className="text-lg font-medium text-gray-900">
                  {formatDate(contrat.date_fin_echeance || contrat.date_expiration) || <span className="text-gray-400 italic">Calculée à la validation</span>}
                </p>
              </div>

              <hr className="border-gray-100" />

              <div>
                <label className="text-sm text-gray-500">Agence</label>
                <p className="font-medium text-gray-900">{contrat.agence || 'Siège'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Gestionnaire</label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                    {(contrat.created_by?.name || 'A').charAt(0)}
                  </div>
                  <p className="font-medium text-gray-900">
                    {contrat.created_by?.name || contrat.user?.name || 'Admin Système'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
