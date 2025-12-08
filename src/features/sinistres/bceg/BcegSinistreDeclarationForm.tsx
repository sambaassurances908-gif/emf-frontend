// src/features/sinistres/bceg/BcegSinistreDeclarationForm.tsx
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  AlertCircle, 
  ArrowLeft, 
  FileText, 
  Calendar, 
  MapPin,
  User,
  Phone,
  Mail,
  Building2,
  CheckCircle,
  Info,
  Wallet,
  Users,
  FileCheck
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useBcegContratsForSinistre, useCreateBcegSinistre, BcegSinistreCreatePayload } from '@/hooks/useBcegSinistres'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import { Checkbox } from '@/components/ui/Checkbox'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatCurrency, cn } from '@/lib/utils'

const TYPES_SINISTRE = [
  { value: 'deces', label: 'Décès', description: 'Décès de l\'assuré pendant la durée du prêt' },
  { value: 'iad', label: 'Invalidité Absolue et Définitive (IAD)', description: 'Invalidité permanente totale de l\'assuré' },
  { value: 'perte_emploi', label: 'Perte d\'emploi', description: 'Licenciement involontaire de l\'assuré' },
  { value: 'perte_activite', label: 'Perte d\'activité', description: 'Cessation d\'activité (faillite, liquidation)' },
]

const QUALITES_DECLARANT = [
  'Assuré',
  'Époux/Épouse',
  'Enfant',
  'Parent',
  'Héritier',
  'Mandataire',
  'Autre',
]

export const BcegSinistreDeclarationForm = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const emfId = user?.emf_id || 3

  const { data: contrats, isLoading: loadingContrats } = useBcegContratsForSinistre(emfId)
  const { mutate: createSinistre, isPending } = useCreateBcegSinistre()

  const [formData, setFormData] = useState({
    contrat_id: '',
    type_sinistre: '' as 'deces' | 'iad' | 'perte_emploi' | 'perte_activite' | '',
    date_sinistre: '',
    
    // Déclarant
    nom_declarant: '',
    prenom_declarant: '',
    qualite_declarant: '',
    telephone_declarant: '',
    email_declarant: '',
    
    // Détails
    capital_restant_du: '',
    montant_reclame: '',
    lieu_sinistre: '',
    circonstances: '',
    
    // Documents
    doc_certificat_deces: false,
    doc_piece_identite: false,
    doc_certificat_heredite: false,
    doc_proces_verbal: false,
    doc_certificat_licenciement: false,
    doc_certificat_arret_travail: false,
    doc_proces_verbal_faillite: false,
    autres_documents: '',
  })

  const [selectedContrat, setSelectedContrat] = useState<any>(null)

  const contratsArray = useMemo(() => {
    return Array.isArray(contrats) ? contrats : []
  }, [contrats])

  const handleContratChange = (contratId: string) => {
    const contrat = contratsArray.find((c: any) => c.id.toString() === contratId)
    setSelectedContrat(contrat || null)
    
    // Pré-remplir le capital restant dû si disponible
    setFormData(prev => ({
      ...prev,
      contrat_id: contratId,
      capital_restant_du: contrat?.capital_restant_du?.toString() || contrat?.montant_pret?.toString() || ''
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.contrat_id || !formData.type_sinistre || !formData.date_sinistre) {
      alert('Veuillez remplir tous les champs obligatoires (contrat, type, date)')
      return
    }

    if (!formData.nom_declarant || !formData.prenom_declarant || !formData.qualite_declarant || !formData.telephone_declarant) {
      alert('Veuillez remplir les informations du déclarant')
      return
    }

    if (!formData.capital_restant_du) {
      alert('Veuillez indiquer le capital restant dû')
      return
    }

    const payload: BcegSinistreCreatePayload = {
      contrat_type: 'ContratBceg',
      contrat_id: parseInt(formData.contrat_id),
      type_sinistre: formData.type_sinistre as 'deces' | 'iad' | 'perte_emploi' | 'perte_activite',
      date_sinistre: formData.date_sinistre,
      nom_declarant: formData.nom_declarant,
      prenom_declarant: formData.prenom_declarant,
      qualite_declarant: formData.qualite_declarant,
      telephone_declarant: formData.telephone_declarant,
      capital_restant_du: parseFloat(formData.capital_restant_du),
    }

    // Ajouter les champs optionnels
    if (formData.email_declarant) payload.email_declarant = formData.email_declarant
    if (formData.circonstances) payload.circonstances = formData.circonstances
    if (formData.lieu_sinistre) payload.lieu_sinistre = formData.lieu_sinistre
    if (formData.montant_reclame) payload.montant_reclame = parseFloat(formData.montant_reclame)
    
    // Documents
    if (formData.doc_certificat_deces) payload.doc_certificat_deces = true
    if (formData.doc_piece_identite) payload.doc_piece_identite = true
    if (formData.doc_certificat_heredite) payload.doc_certificat_heredite = true
    if (formData.doc_proces_verbal) payload.doc_proces_verbal = true
    if (formData.doc_certificat_licenciement) payload.doc_certificat_licenciement = true
    if (formData.doc_certificat_arret_travail) payload.doc_certificat_arret_travail = true
    if (formData.doc_proces_verbal_faillite) payload.doc_proces_verbal_faillite = true
    if (formData.autres_documents) payload.autres_documents = formData.autres_documents

    console.log('📤 Payload sinistre BCEG:', payload)

    createSinistre(payload, {
      onSuccess: () => {
        alert('✅ Sinistre déclaré avec succès !')
        navigate('/sinistres')
      },
      onError: (error: any) => {
        console.error('❌ Erreur création sinistre:', error)
        console.error('❌ Response data:', error?.response?.data)
        console.error('❌ Validation errors:', error?.response?.data?.errors)
        
        // Afficher les erreurs de validation détaillées
        const validationErrors = error?.response?.data?.errors
        if (validationErrors) {
          const errorMessages = Object.entries(validationErrors)
            .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
            .join('\n')
          alert(`Erreurs de validation:\n${errorMessages}`)
        } else {
          const message = error?.response?.data?.message || error?.response?.data?.error || 'Erreur lors de la déclaration du sinistre'
          alert(message)
        }
      },
    })
  }

  // Documents requis selon le type de sinistre
  const getRequiredDocs = () => {
    switch (formData.type_sinistre) {
      case 'deces':
        return ['doc_certificat_deces', 'doc_piece_identite', 'doc_certificat_heredite', 'doc_proces_verbal']
      case 'iad':
        return ['doc_certificat_arret_travail', 'doc_piece_identite']
      case 'perte_emploi':
        return ['doc_certificat_licenciement', 'doc_piece_identite']
      case 'perte_activite':
        return ['doc_proces_verbal_faillite', 'doc_piece_identite']
      default:
        return []
    }
  }

  if (loadingContrats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
        <LoadingSpinner size="lg" text="Chargement des contrats BCEG..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/sinistres')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Retour aux sinistres
          </Button>
        </div>

        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-700 flex items-center justify-center gap-3">
            <AlertCircle className="h-10 w-10 text-emerald-600" />
            Déclaration de Sinistre BCEG
          </h1>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Remplissez ce formulaire pour déclarer un sinistre sur un contrat d'assurance emprunteur BCEG.
          </p>
        </div>

        {/* Alerte informative */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800">Délais de déclaration</p>
              <p className="text-sm text-blue-700">
                Le sinistre doit être déclaré dans les <strong>180 jours</strong> suivant sa survenance.
                Le délai de prescription est de <strong>2 ans</strong>.
              </p>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sélection du contrat */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" />
                Contrat concerné
              </CardTitle>
              <CardDescription>Sélectionnez le contrat BCEG concerné par le sinistre</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="contrat">Contrat BCEG *</Label>
                  <select
                    id="contrat"
                    value={formData.contrat_id}
                    onChange={(e) => handleContratChange(e.target.value)}
                    required
                    className={cn(
                      "mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm",
                      "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    )}
                  >
                    <option value="">-- Sélectionnez un contrat --</option>
                    {contratsArray.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        #{c.id} - {c.prenom} {c.nom} - {c.numero_convention || c.numero_police || 'Sans numéro'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Aperçu du contrat sélectionné */}
                {selectedContrat && (
                  <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <h4 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Contrat sélectionné
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{selectedContrat.prenom} {selectedContrat.nom}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{selectedContrat.telephone_assure || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <span>{selectedContrat.agence || selectedContrat.banque_sigle}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Montant prêt:</span>
                        <span className="ml-2 font-bold text-emerald-700">
                          {formatCurrency(Number(selectedContrat.montant_pret) || 0)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Statut:</span>
                        <Badge className="ml-2 bg-green-100 text-green-800">
                          {selectedContrat.statut?.toUpperCase()}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-gray-500">Garanties:</span>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {selectedContrat.garantie_deces_iad && (
                            <Badge className="bg-blue-100 text-blue-800 text-xs">Décès/IAD</Badge>
                          )}
                          {selectedContrat.garantie_prevoyance && (
                            <Badge className="bg-purple-100 text-purple-800 text-xs">Prévoyance</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Type de sinistre */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Type de sinistre
              </CardTitle>
              <CardDescription>Sélectionnez le type de sinistre à déclarer</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TYPES_SINISTRE.map((type) => (
                  <div
                    key={type.value}
                    onClick={() => setFormData({ ...formData, type_sinistre: type.value as any })}
                    className={cn(
                      "p-4 rounded-lg border-2 cursor-pointer transition-all",
                      formData.type_sinistre === type.value
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-orange-300"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                        formData.type_sinistre === type.value
                          ? "border-orange-500 bg-orange-500"
                          : "border-gray-300"
                      )}>
                        {formData.type_sinistre === type.value && (
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{type.label}</p>
                        <p className="text-xs text-gray-500">{type.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Date et lieu du sinistre */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="date_sinistre">Date du sinistre *</Label>
                  <div className="relative mt-1">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="date_sinistre"
                      type="date"
                      value={formData.date_sinistre}
                      onChange={(e) => setFormData({ ...formData, date_sinistre: e.target.value })}
                      required
                      className="pl-10"
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="lieu_sinistre">Lieu du sinistre</Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="lieu_sinistre"
                      type="text"
                      value={formData.lieu_sinistre}
                      onChange={(e) => setFormData({ ...formData, lieu_sinistre: e.target.value })}
                      placeholder="Ex: Libreville, Hôpital..."
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations du déclarant */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Informations du déclarant
              </CardTitle>
              <CardDescription>Personne effectuant la déclaration du sinistre</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="nom_declarant">Nom du déclarant *</Label>
                  <Input
                    id="nom_declarant"
                    type="text"
                    value={formData.nom_declarant}
                    onChange={(e) => setFormData({ ...formData, nom_declarant: e.target.value.toUpperCase() })}
                    placeholder="MOUSSAVOU"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="prenom_declarant">Prénom du déclarant *</Label>
                  <Input
                    id="prenom_declarant"
                    type="text"
                    value={formData.prenom_declarant}
                    onChange={(e) => setFormData({ ...formData, prenom_declarant: e.target.value })}
                    placeholder="Marie"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="qualite_declarant">Qualité / Lien avec l'assuré *</Label>
                  <select
                    id="qualite_declarant"
                    value={formData.qualite_declarant}
                    onChange={(e) => setFormData({ ...formData, qualite_declarant: e.target.value })}
                    required
                    className={cn(
                      "mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    )}
                  >
                    <option value="">-- Sélectionnez --</option>
                    {QUALITES_DECLARANT.map((q) => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="telephone_declarant">Téléphone du déclarant *</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="telephone_declarant"
                      type="tel"
                      value={formData.telephone_declarant}
                      onChange={(e) => setFormData({ ...formData, telephone_declarant: e.target.value })}
                      placeholder="+241 77 12 34 56"
                      required
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="email_declarant">Email du déclarant (optionnel)</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email_declarant"
                      type="email"
                      value={formData.email_declarant}
                      onChange={(e) => setFormData({ ...formData, email_declarant: e.target.value })}
                      placeholder="email@example.com"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Montants */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-purple-600" />
                Informations financières
              </CardTitle>
              <CardDescription>Capital restant dû et montant réclamé</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="capital_restant_du">Capital restant dû (FCFA) *</Label>
                  <Input
                    id="capital_restant_du"
                    type="number"
                    value={formData.capital_restant_du}
                    onChange={(e) => setFormData({ ...formData, capital_restant_du: e.target.value })}
                    placeholder="5000000"
                    required
                    min="0"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Montant du capital restant à rembourser sur le prêt
                  </p>
                </div>

                <div>
                  <Label htmlFor="montant_reclame">Montant réclamé (FCFA)</Label>
                  <Input
                    id="montant_reclame"
                    type="number"
                    value={formData.montant_reclame}
                    onChange={(e) => setFormData({ ...formData, montant_reclame: e.target.value })}
                    placeholder="5000000"
                    min="0"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Circonstances */}
              <div>
                <Label htmlFor="circonstances">Circonstances du sinistre</Label>
                <Textarea
                  id="circonstances"
                  rows={4}
                  value={formData.circonstances}
                  onChange={(e) => setFormData({ ...formData, circonstances: e.target.value })}
                  placeholder="Décrivez les circonstances du sinistre en détail..."
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Documents justificatifs */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-green-600" />
                Documents justificatifs
              </CardTitle>
              <CardDescription>
                Cochez les documents que vous fournirez (à joindre ultérieurement)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                  formData.doc_piece_identite ? "bg-green-50 border-green-300" : "hover:bg-gray-50"
                )}>
                  <Checkbox
                    checked={formData.doc_piece_identite}
                    onChange={(e) => setFormData({ ...formData, doc_piece_identite: e.target.checked })}
                  />
                  <span className="text-sm">Pièce d'identité</span>
                  {getRequiredDocs().includes('doc_piece_identite') && (
                    <Badge className="bg-red-100 text-red-800 text-xs ml-auto">Requis</Badge>
                  )}
                </label>

                <label className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                  formData.doc_certificat_deces ? "bg-green-50 border-green-300" : "hover:bg-gray-50"
                )}>
                  <Checkbox
                    checked={formData.doc_certificat_deces}
                    onChange={(e) => setFormData({ ...formData, doc_certificat_deces: e.target.checked })}
                  />
                  <span className="text-sm">Certificat de décès</span>
                  {getRequiredDocs().includes('doc_certificat_deces') && (
                    <Badge className="bg-red-100 text-red-800 text-xs ml-auto">Requis</Badge>
                  )}
                </label>

                <label className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                  formData.doc_certificat_heredite ? "bg-green-50 border-green-300" : "hover:bg-gray-50"
                )}>
                  <Checkbox
                    checked={formData.doc_certificat_heredite}
                    onChange={(e) => setFormData({ ...formData, doc_certificat_heredite: e.target.checked })}
                  />
                  <span className="text-sm">Certificat d'hérédité</span>
                  {getRequiredDocs().includes('doc_certificat_heredite') && (
                    <Badge className="bg-red-100 text-red-800 text-xs ml-auto">Requis</Badge>
                  )}
                </label>

                <label className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                  formData.doc_proces_verbal ? "bg-green-50 border-green-300" : "hover:bg-gray-50"
                )}>
                  <Checkbox
                    checked={formData.doc_proces_verbal}
                    onChange={(e) => setFormData({ ...formData, doc_proces_verbal: e.target.checked })}
                  />
                  <span className="text-sm">Procès-verbal (accident)</span>
                  {getRequiredDocs().includes('doc_proces_verbal') && (
                    <Badge className="bg-red-100 text-red-800 text-xs ml-auto">Requis</Badge>
                  )}
                </label>

                <label className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                  formData.doc_certificat_licenciement ? "bg-green-50 border-green-300" : "hover:bg-gray-50"
                )}>
                  <Checkbox
                    checked={formData.doc_certificat_licenciement}
                    onChange={(e) => setFormData({ ...formData, doc_certificat_licenciement: e.target.checked })}
                  />
                  <span className="text-sm">Certificat de licenciement</span>
                  {getRequiredDocs().includes('doc_certificat_licenciement') && (
                    <Badge className="bg-red-100 text-red-800 text-xs ml-auto">Requis</Badge>
                  )}
                </label>

                <label className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                  formData.doc_certificat_arret_travail ? "bg-green-50 border-green-300" : "hover:bg-gray-50"
                )}>
                  <Checkbox
                    checked={formData.doc_certificat_arret_travail}
                    onChange={(e) => setFormData({ ...formData, doc_certificat_arret_travail: e.target.checked })}
                  />
                  <span className="text-sm">Certificat d'arrêt de travail</span>
                  {getRequiredDocs().includes('doc_certificat_arret_travail') && (
                    <Badge className="bg-red-100 text-red-800 text-xs ml-auto">Requis</Badge>
                  )}
                </label>

                <label className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                  formData.doc_proces_verbal_faillite ? "bg-green-50 border-green-300" : "hover:bg-gray-50"
                )}>
                  <Checkbox
                    checked={formData.doc_proces_verbal_faillite}
                    onChange={(e) => setFormData({ ...formData, doc_proces_verbal_faillite: e.target.checked })}
                  />
                  <span className="text-sm">PV de faillite/liquidation</span>
                  {getRequiredDocs().includes('doc_proces_verbal_faillite') && (
                    <Badge className="bg-red-100 text-red-800 text-xs ml-auto">Requis</Badge>
                  )}
                </label>
              </div>

              <div className="mt-4">
                <Label htmlFor="autres_documents">Autres documents</Label>
                <Input
                  id="autres_documents"
                  type="text"
                  value={formData.autres_documents}
                  onChange={(e) => setFormData({ ...formData, autres_documents: e.target.value })}
                  placeholder="Description des autres documents fournis..."
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Boutons d'action */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/sinistres')}
              disabled={isPending}
              size="lg"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg"
              disabled={isPending || !formData.contrat_id || !formData.type_sinistre || !formData.date_sinistre}
              size="lg"
            >
              {isPending ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Envoi en cours...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Déclarer le sinistre
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
