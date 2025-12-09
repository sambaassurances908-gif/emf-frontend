// src/features/sinistres/cofidec/CofidecSinistreDeclarationForm.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Upload, X, User, Phone, Mail, FileText, MapPin, DollarSign, CheckCircle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useCofidecContratsForSinistre, useCreateCofidecSinistre } from '@/hooks/useCofidecSinistres'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { SinistreType, SinistreCreatePayload } from '@/types/sinistre.types'
import { formatCurrency } from '@/lib/utils'

export const CofidecSinistreDeclarationForm = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const emfId = user?.emf_id || 1

  const { data: contrats, isLoading: loadingContrats } = useCofidecContratsForSinistre(emfId)
  const { mutate: createSinistre, isPending } = useCreateCofidecSinistre()

  // État du contrat sélectionné
  const [selectedContrat, setSelectedContrat] = useState<any>(null)

  // Formulaire principal
  const [formData, setFormData] = useState({
    contrat_id: '',
    type_sinistre: '' as SinistreType | '',
    date_sinistre: '',
    
    // Informations du déclarant
    nom_declarant: '',
    prenom_declarant: '',
    qualite_declarant: '',
    telephone_declarant: '',
    email_declarant: '',
    
    // Détails du sinistre
    circonstances: '',
    lieu_sinistre: '',
    capital_restant_du: 0,
    montant_reclame: 0,
  })

  // Documents
  const [documents, setDocuments] = useState<Record<string, File | null>>({
    fichier_tableau_amortissement: null,
    fichier_acte_deces: null,
    fichier_certificat_arret_travail: null,
    fichier_certificat_deces: null,
    fichier_certificat_licenciement: null,
    fichier_proces_verbal: null,
    fichier_proces_verbal_faillite: null,
    fichier_piece_identite: null,
    fichier_certificat_heredite: null,
    fichier_autres_documents: null,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Mettre à jour le contrat sélectionné
  useEffect(() => {
    if (formData.contrat_id && contrats) {
      const contrat = contrats.find((c: any) => c.id === parseInt(formData.contrat_id))
      setSelectedContrat(contrat || null)
      if (contrat) {
        setFormData(prev => ({
          ...prev,
          capital_restant_du: contrat.capital_restant_du || contrat.montant_pret || 0,
        }))
      }
    } else {
      setSelectedContrat(null)
    }
  }, [formData.contrat_id, contrats])

  // Documents requis selon le type de sinistre
  const getRequiredDocuments = (type: SinistreType | ''): string[] => {
    switch (type) {
      case 'deces':
        return ['fichier_certificat_deces', 'fichier_acte_deces', 'fichier_piece_identite', 'fichier_certificat_heredite', 'fichier_tableau_amortissement']
      case 'iad':
        return ['fichier_certificat_arret_travail', 'fichier_piece_identite', 'fichier_tableau_amortissement']
      case 'perte_emploi':
        return ['fichier_certificat_licenciement', 'fichier_piece_identite', 'fichier_tableau_amortissement']
      case 'perte_activite':
        return ['fichier_proces_verbal_faillite', 'fichier_piece_identite', 'fichier_tableau_amortissement']
      default:
        return []
    }
  }

  const documentLabels: Record<string, string> = {
    fichier_tableau_amortissement: 'Tableau d\'amortissement',
    fichier_acte_deces: 'Acte de décès',
    fichier_certificat_arret_travail: 'Certificat d\'arrêt de travail',
    fichier_certificat_deces: 'Certificat de décès',
    fichier_certificat_licenciement: 'Certificat de licenciement',
    fichier_proces_verbal: 'Procès-verbal',
    fichier_proces_verbal_faillite: 'Procès-verbal de faillite',
    fichier_piece_identite: 'Pièce d\'identité',
    fichier_certificat_heredite: 'Certificat d\'hérédité',
    fichier_autres_documents: 'Autres documents',
  }

  const handleFileChange = (key: string, file: File | null) => {
    setDocuments(prev => ({ ...prev, [key]: file }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.contrat_id) newErrors.contrat_id = 'Veuillez sélectionner un contrat'
    if (!formData.type_sinistre) newErrors.type_sinistre = 'Veuillez sélectionner un type de sinistre'
    if (!formData.date_sinistre) newErrors.date_sinistre = 'Veuillez saisir la date du sinistre'
    if (!formData.nom_declarant) newErrors.nom_declarant = 'Veuillez saisir le nom du déclarant'
    if (!formData.prenom_declarant) newErrors.prenom_declarant = 'Veuillez saisir le prénom du déclarant'
    if (!formData.qualite_declarant) newErrors.qualite_declarant = 'Veuillez saisir la qualité du déclarant'
    if (!formData.telephone_declarant) newErrors.telephone_declarant = 'Veuillez saisir le téléphone du déclarant'
    if (formData.capital_restant_du <= 0) newErrors.capital_restant_du = 'Le capital restant dû doit être supérieur à 0'

    if (formData.date_sinistre && new Date(formData.date_sinistre) > new Date()) {
      newErrors.date_sinistre = 'La date du sinistre ne peut pas être dans le futur'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const payload: Omit<SinistreCreatePayload, 'contrat_type'> = {
      contrat_id: parseInt(formData.contrat_id),
      type_sinistre: formData.type_sinistre as SinistreType,
      date_sinistre: formData.date_sinistre,
      nom_declarant: formData.nom_declarant,
      prenom_declarant: formData.prenom_declarant,
      qualite_declarant: formData.qualite_declarant,
      telephone_declarant: formData.telephone_declarant,
      capital_restant_du: formData.capital_restant_du,
      contrat_type: 'ContratCofidec',
    }

    if (formData.email_declarant) payload.email_declarant = formData.email_declarant
    if (formData.circonstances) payload.circonstances = formData.circonstances
    if (formData.lieu_sinistre) payload.lieu_sinistre = formData.lieu_sinistre
    if (formData.montant_reclame > 0) payload.montant_reclame = formData.montant_reclame

    Object.entries(documents).forEach(([key, file]) => {
      if (file) (payload as any)[key] = file
    })

    createSinistre(payload, {
      onSuccess: (response) => {
        alert(`✅ Sinistre déclaré avec succès!\n\nNuméro: ${response.numero_sinistre || 'En attente'}`)
        navigate('/sinistres/cofidec')
      },
      onError: (error: any) => {
        const message = error?.response?.data?.message || error?.message || 'Erreur lors de la déclaration'
        alert(`❌ Erreur: ${message}`)
      },
    })
  }

  if (loadingContrats) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <LoadingSpinner size="lg" text="Chargement des contrats..." />
      </div>
    )
  }

  const requiredDocs = getRequiredDocuments(formData.type_sinistre)

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl p-6 shadow-lg">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <AlertCircle className="h-8 w-8" />
            Déclaration de Sinistre COFIDEC
          </h1>
          <p className="mt-2 text-yellow-100">
            Remplissez ce formulaire pour déclarer un sinistre sur un contrat COFIDEC.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sélection du contrat */}
          <Card className="shadow-lg">
            <CardHeader className="bg-yellow-50 border-b">
              <CardTitle className="flex items-center gap-2 text-yellow-700">
                <FileText className="h-5 w-5" />
                1. Contrat concerné
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="contrat" className="text-gray-700 font-medium">Sélectionnez le contrat *</Label>
                  <Select
                    id="contrat"
                    value={formData.contrat_id}
                    onChange={(e) => setFormData({ ...formData, contrat_id: e.target.value })}
                    className={errors.contrat_id ? 'border-red-500' : ''}
                  >
                    <option value="">-- Choisir un contrat --</option>
                    {contrats?.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.numero_police} - {c.nom_prenom} ({formatCurrency(c.montant_pret || 0)})
                      </option>
                    ))}
                  </Select>
                  {errors.contrat_id && <p className="text-red-500 text-sm mt-1">{errors.contrat_id}</p>}
                </div>

                {selectedContrat && (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-yellow-800 mb-2">Informations du contrat</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-gray-600">Assuré:</span><span className="font-medium ml-2">{selectedContrat.nom_prenom}</span></div>
                      <div><span className="text-gray-600">N° Police:</span><span className="font-medium ml-2">{selectedContrat.numero_police}</span></div>
                      <div><span className="text-gray-600">Montant:</span><span className="font-medium ml-2 text-yellow-600">{formatCurrency(selectedContrat.montant_pret || 0)}</span></div>
                      <div><span className="text-gray-600">Statut:</span><span className={`font-medium ml-2 ${selectedContrat.statut === 'actif' ? 'text-green-600' : 'text-orange-600'}`}>{selectedContrat.statut}</span></div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Type et date du sinistre */}
          <Card className="shadow-lg">
            <CardHeader className="bg-orange-50 border-b">
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <AlertCircle className="h-5 w-5" />
                2. Informations sur le sinistre
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type_sinistre" className="text-gray-700 font-medium">Type de sinistre *</Label>
                  <Select
                    id="type_sinistre"
                    value={formData.type_sinistre}
                    onChange={(e) => setFormData({ ...formData, type_sinistre: e.target.value as SinistreType })}
                    className={errors.type_sinistre ? 'border-red-500' : ''}
                  >
                    <option value="">-- Sélectionner --</option>
                    <option value="deces">⚫ Décès</option>
                    <option value="iad">🏥 Invalidité Absolue et Définitive (IAD)</option>
                    <option value="perte_emploi">💼 Perte d'emploi</option>
                    <option value="perte_activite">🏪 Perte d'activité</option>
                  </Select>
                  {errors.type_sinistre && <p className="text-red-500 text-sm mt-1">{errors.type_sinistre}</p>}
                </div>

                <div>
                  <Label htmlFor="date_sinistre" className="text-gray-700 font-medium">Date du sinistre *</Label>
                  <Input
                    id="date_sinistre"
                    type="date"
                    value={formData.date_sinistre}
                    onChange={(e) => setFormData({ ...formData, date_sinistre: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                    className={errors.date_sinistre ? 'border-red-500' : ''}
                  />
                  {errors.date_sinistre && <p className="text-red-500 text-sm mt-1">{errors.date_sinistre}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lieu_sinistre" className="text-gray-700 font-medium"><MapPin className="h-4 w-4 inline mr-1" />Lieu du sinistre</Label>
                  <Input id="lieu_sinistre" value={formData.lieu_sinistre} onChange={(e) => setFormData({ ...formData, lieu_sinistre: e.target.value })} placeholder="Ex: Libreville, Owendo" />
                </div>
                <div>
                  <Label htmlFor="capital_restant_du" className="text-gray-700 font-medium"><DollarSign className="h-4 w-4 inline mr-1" />Capital restant dû (FCFA) *</Label>
                  <Input id="capital_restant_du" type="number" value={formData.capital_restant_du} onChange={(e) => setFormData({ ...formData, capital_restant_du: parseFloat(e.target.value) || 0 })} className={errors.capital_restant_du ? 'border-red-500' : ''} />
                  {errors.capital_restant_du && <p className="text-red-500 text-sm mt-1">{errors.capital_restant_du}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="circonstances" className="text-gray-700 font-medium">Circonstances du sinistre</Label>
                <Textarea id="circonstances" rows={4} value={formData.circonstances} onChange={(e) => setFormData({ ...formData, circonstances: e.target.value })} placeholder="Décrivez les circonstances du sinistre..." />
              </div>
            </CardContent>
          </Card>

          {/* Informations du déclarant */}
          <Card className="shadow-lg">
            <CardHeader className="bg-green-50 border-b">
              <CardTitle className="flex items-center gap-2 text-green-700">
                <User className="h-5 w-5" />
                3. Informations du déclarant
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nom_declarant" className="text-gray-700 font-medium">Nom *</Label>
                  <Input id="nom_declarant" value={formData.nom_declarant} onChange={(e) => setFormData({ ...formData, nom_declarant: e.target.value })} placeholder="Nom du déclarant" className={errors.nom_declarant ? 'border-red-500' : ''} />
                  {errors.nom_declarant && <p className="text-red-500 text-sm mt-1">{errors.nom_declarant}</p>}
                </div>
                <div>
                  <Label htmlFor="prenom_declarant" className="text-gray-700 font-medium">Prénom *</Label>
                  <Input id="prenom_declarant" value={formData.prenom_declarant} onChange={(e) => setFormData({ ...formData, prenom_declarant: e.target.value })} placeholder="Prénom du déclarant" className={errors.prenom_declarant ? 'border-red-500' : ''} />
                  {errors.prenom_declarant && <p className="text-red-500 text-sm mt-1">{errors.prenom_declarant}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="qualite_declarant" className="text-gray-700 font-medium">Qualité / Lien avec l'assuré *</Label>
                  <Select id="qualite_declarant" value={formData.qualite_declarant} onChange={(e) => setFormData({ ...formData, qualite_declarant: e.target.value })} className={errors.qualite_declarant ? 'border-red-500' : ''}>
                    <option value="">-- Sélectionner --</option>
                    <option value="assure">Assuré lui-même</option>
                    <option value="conjoint">Conjoint(e)</option>
                    <option value="enfant">Enfant</option>
                    <option value="parent">Parent</option>
                    <option value="beneficiaire">Bénéficiaire désigné</option>
                    <option value="mandataire">Mandataire</option>
                    <option value="autre">Autre</option>
                  </Select>
                  {errors.qualite_declarant && <p className="text-red-500 text-sm mt-1">{errors.qualite_declarant}</p>}
                </div>
                <div>
                  <Label htmlFor="telephone_declarant" className="text-gray-700 font-medium"><Phone className="h-4 w-4 inline mr-1" />Téléphone *</Label>
                  <Input id="telephone_declarant" type="tel" value={formData.telephone_declarant} onChange={(e) => setFormData({ ...formData, telephone_declarant: e.target.value })} placeholder="Ex: +241 XX XX XX XX" className={errors.telephone_declarant ? 'border-red-500' : ''} />
                  {errors.telephone_declarant && <p className="text-red-500 text-sm mt-1">{errors.telephone_declarant}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="email_declarant" className="text-gray-700 font-medium"><Mail className="h-4 w-4 inline mr-1" />Email (optionnel)</Label>
                <Input id="email_declarant" type="email" value={formData.email_declarant} onChange={(e) => setFormData({ ...formData, email_declarant: e.target.value })} placeholder="email@exemple.com" />
              </div>
            </CardContent>
          </Card>

          {/* Documents justificatifs */}
          <Card className="shadow-lg">
            <CardHeader className="bg-purple-50 border-b">
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Upload className="h-5 w-5" />
                4. Documents justificatifs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {formData.type_sinistre ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Les documents marqués d'un <span className="text-red-500 font-bold">*</span> sont requis pour ce type de sinistre.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(documentLabels).map(([key, label]) => {
                      const isRequired = requiredDocs.includes(key)
                      const file = documents[key]
                      return (
                        <div key={key} className={`p-4 border rounded-lg ${isRequired ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
                          <Label className="text-gray-700 font-medium flex items-center gap-2">{label}{isRequired && <span className="text-red-500">*</span>}</Label>
                          <div className="mt-2 flex items-center gap-2">
                            <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(key, e.target.files?.[0] || null)} className="text-sm" />
                            {file && (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <Button type="button" variant="outline" size="sm" onClick={() => handleFileChange(key, null)} className="text-red-500 hover:bg-red-50"><X className="h-4 w-4" /></Button>
                              </div>
                            )}
                          </div>
                          {file && <p className="text-xs text-green-600 mt-1">{file.name}</p>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Upload className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Veuillez d'abord sélectionner un type de sinistre pour voir les documents requis.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Boutons d'action */}
          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={() => navigate('/sinistres/cofidec')} disabled={isPending} className="border-gray-400">Annuler</Button>
            <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600 px-8" disabled={isPending}>
              {isPending ? (<><LoadingSpinner size="sm" /><span className="ml-2">Envoi en cours...</span></>) : (<><CheckCircle className="h-5 w-5 mr-2" />Déclarer le sinistre</>)}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
