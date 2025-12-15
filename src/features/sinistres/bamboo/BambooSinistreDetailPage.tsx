// src/features/sinistres/bamboo/BambooSinistreDetailPage.tsx
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, AlertCircle, User, Calendar, FileText, 
  CheckCircle, XCircle, Clock, DollarSign, Printer
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import axios from '@/lib/axios'

const getStatutColor = (statut?: string) => {
  switch (statut) {
    case 'valide': return 'bg-green-100 text-green-800 border-green-200'
    case 'en_cours': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'en_attente': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'refuse': return 'bg-red-100 text-red-800 border-red-200'
    case 'cloture': return 'bg-gray-100 text-gray-800 border-gray-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getTypeLabel = (type?: string) => {
  const labels: Record<string, string> = {
    'deces': 'Décès',
    'iad': 'Invalidité Absolue et Définitive',
    'perte_emploi': 'Perte d\'emploi',
    'autre': 'Autre'
  }
  return labels[type || ''] || type || 'N/A'
}

const getStatutLabel = (statut?: string) => {
  const labels: Record<string, string> = {
    'en_attente': 'En attente',
    'en_cours': 'En cours de traitement',
    'valide': 'Validé',
    'refuse': 'Refusé',
    'cloture': 'Clôturé'
  }
  return labels[statut || ''] || statut || 'N/A'
}

const getStatutIcon = (statut?: string) => {
  switch (statut) {
    case 'valide': return <CheckCircle className="h-5 w-5 text-green-600" />
    case 'en_cours': return <Clock className="h-5 w-5 text-blue-600" />
    case 'en_attente': return <Clock className="h-5 w-5 text-yellow-600" />
    case 'refuse': return <XCircle className="h-5 w-5 text-red-600" />
    default: return <AlertCircle className="h-5 w-5 text-gray-600" />
  }
}

export const BambooSinistreDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: sinistre, isLoading, isError } = useQuery({
    queryKey: ['bamboo-sinistre', id],
    queryFn: async () => {
      const response = await axios.get(`/sinistres/${id}`)
      const rawData = response.data
      if (rawData?.success && rawData?.data) return rawData.data
      if (rawData?.data) return rawData.data
      return rawData
    },
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Chargement du sinistre..." />
      </div>
    )
  }

  if (isError || !sinistre) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <AlertCircle className="h-16 w-16 text-red-500" />
        <h2 className="text-xl font-semibold text-gray-900">Sinistre non trouvé</h2>
        <Button onClick={() => navigate('/sinistres/bamboo')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la liste
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/sinistres/bamboo')}
              className="mb-2 hover:bg-blue-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la liste
            </Button>
            <h1 className="text-3xl font-bold text-blue-600 flex items-center gap-3">
              <AlertCircle className="h-8 w-8" />
              Sinistre {sinistre.numero_sinistre || `#${sinistre.id}`}
            </h1>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimer
            </Button>
          </div>
        </div>

        {/* Statut Banner */}
        <Card className={`border-2 ${getStatutColor(sinistre.statut)}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatutIcon(sinistre.statut)}
                <div>
                  <p className="text-sm font-medium text-gray-600">Statut actuel</p>
                  <p className="text-lg font-bold">{getStatutLabel(sinistre.statut)}</p>
                </div>
              </div>
              <Badge className={`text-lg px-4 py-2 ${getStatutColor(sinistre.statut)}`}>
                {getStatutLabel(sinistre.statut)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informations du sinistre */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                Informations du sinistre
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">N° Sinistre</p>
                  <p className="font-bold text-blue-600">{sinistre.numero_sinistre || `SIN-${sinistre.id}`}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-semibold">{getTypeLabel(sinistre.type_sinistre)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date de survenance</p>
                  <p className="font-semibold">{formatDate(sinistre.date_survenance)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date de déclaration</p>
                  <p className="font-semibold">{formatDate(sinistre.date_declaration || sinistre.created_at)}</p>
                </div>
              </div>
              {sinistre.description && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Description</p>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{sinistre.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Montants */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Montants
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Montant réclamé</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(sinistre.montant_reclame || 0)}
                  </p>
                </div>
                {sinistre.montant_approuve !== undefined && sinistre.montant_approuve !== null && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Montant approuvé</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(sinistre.montant_approuve)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Informations du contrat */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                Contrat associé
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">N° Police</p>
                  <p className="font-bold text-purple-600">{sinistre.contrat?.numero_police || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Montant assuré</p>
                  <p className="font-semibold">{formatCurrency(sinistre.contrat?.montant_pret_assure || 0)}</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/contrats/bamboo/${sinistre.contrat_id}`)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Voir le contrat
              </Button>
            </CardContent>
          </Card>

          {/* Assuré */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-orange-600" />
                Assuré
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Nom & Prénom</p>
                <p className="text-lg font-bold text-gray-900">{sinistre.contrat?.nom_prenom || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">EMF</p>
                <p className="font-semibold">{sinistre.contrat?.emf?.sigle || 'BAMBOO'} - {sinistre.contrat?.emf?.nom || ''}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents */}
        {sinistre.documents && sinistre.documents.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-600" />
                Documents justificatifs ({sinistre.documents.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sinistre.documents.map((doc: any, index: number) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                  >
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{doc.nom || `Document ${index + 1}`}</p>
                      <p className="text-sm text-gray-500">{doc.type || 'PDF'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              Historique
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Sinistre déclaré</p>
                  <p className="text-sm text-gray-500">{formatDate(sinistre.created_at)}</p>
                </div>
              </div>
              {sinistre.updated_at !== sinistre.created_at && (
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Dernière mise à jour</p>
                    <p className="text-sm text-gray-500">{formatDate(sinistre.updated_at)}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
