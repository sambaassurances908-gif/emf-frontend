// src/features/sinistres/sodec/SodecSinistreDeclarationForm.tsx
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { 
  AlertCircle, 
  Upload, 
  X, 
  FileText, 
  MapPin, 
  DollarSign, 
  CheckCircle,
  ArrowLeft,
  Calendar,
  Shield,
  Heart,
  Briefcase,
  Store,
  FileCheck,
  Info
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useSodecContratsForSinistre, useCreateSodecSinistre } from '@/hooks/useSodecSinistres'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { SinistreType, SinistreCreatePayload } from '@/types/sinistre.types'
import { formatCurrency, cn } from '@/lib/utils'

const SINISTRE_TYPES = [
  { value: 'deces', label: 'Décès', description: 'Décès de l\'assuré', icon: Heart, color: 'from-gray-600 to-gray-800', bgColor: 'bg-gray-50', borderColor: 'border-gray-300', textColor: 'text-gray-700' },
  { value: 'iad', label: 'Invalidité (IAD)', description: 'Invalidité Absolue et Définitive', icon: Shield, color: 'from-red-500 to-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-300', textColor: 'text-red-700' },
  { value: 'perte_emploi', label: 'Perte d\'emploi', description: 'Licenciement involontaire', icon: Briefcase, color: 'from-amber-500 to-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-300', textColor: 'text-amber-700' },
  { value: 'perte_activite', label: 'Perte d\'activité', description: 'Cessation d\'activité commerciale', icon: Store, color: 'from-orange-500 to-orange-700', bgColor: 'bg-orange-50', borderColor: 'border-orange-300', textColor: 'text-orange-700' },
]

export const SodecSinistreDeclarationForm = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  const emfId = user?.emf_id || 5

  const urlContratId = searchParams.get('contrat_id') || ''
  const { data: contrats, isLoading: loadingContrats } = useSodecContratsForSinistre(emfId)
  const { mutate: createSinistre, isPending } = useCreateSodecSinistre()

  const [selectedContrat, setSelectedContrat] = useState<any>(null)
  const [isContratPreselected, setIsContratPreselected] = useState(false)

  const [formData, setFormData] = useState({
    contrat_id: '',
    type_sinistre: '' as SinistreType | '',
    date_sinistre: '',
    circonstances: '',
    lieu_sinistre: '',
    capital_restant_du: 0,
    montant_reclame: 0,
  })

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

  useEffect(() => {
    if (urlContratId && contrats && !isContratPreselected) {
      const contrat = contrats.find((c: any) => c.id === parseInt(urlContratId))
      if (contrat) {
        setFormData(prev => ({ ...prev, contrat_id: urlContratId }))
        setSelectedContrat(contrat)
        setIsContratPreselected(true)
      }
    }
  }, [urlContratId, contrats, isContratPreselected])

  useEffect(() => {
    if (formData.contrat_id && contrats) {
      const contrat = contrats.find((c: any) => c.id === parseInt(formData.contrat_id))
      setSelectedContrat(contrat || null)
      if (contrat) {
        setFormData(prev => ({ ...prev, capital_restant_du: contrat.capital_restant_du || contrat.montant_credit || 0 }))
      }
    } else {
      setSelectedContrat(null)
    }
  }, [formData.contrat_id, contrats])

  const getRequiredDocuments = (type: SinistreType | ''): string[] => {
    switch (type) {
      case 'deces': return ['fichier_certificat_deces', 'fichier_acte_deces', 'fichier_piece_identite', 'fichier_certificat_heredite', 'fichier_tableau_amortissement']
      case 'iad': return ['fichier_certificat_arret_travail', 'fichier_piece_identite', 'fichier_tableau_amortissement']
      case 'perte_emploi': return ['fichier_certificat_licenciement', 'fichier_piece_identite', 'fichier_tableau_amortissement']
      case 'perte_activite': return ['fichier_proces_verbal_faillite', 'fichier_piece_identite', 'fichier_tableau_amortissement']
      default: return []
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

    // S'assurer que capital_restant_du est un nombre valide
    const capitalRestantDu = typeof formData.capital_restant_du === 'string'
      ? parseFloat(formData.capital_restant_du)
      : Number(formData.capital_restant_du)

    const payload: SinistreCreatePayload = {
      contrat_type: 'ContratSodec',
      contrat_id: parseInt(formData.contrat_id, 10),
      type_sinistre: formData.type_sinistre as SinistreType,
      date_sinistre: formData.date_sinistre,
      capital_restant_du: capitalRestantDu,
    }

    if (formData.circonstances && formData.circonstances.trim()) payload.circonstances = formData.circonstances.trim()
    if (formData.lieu_sinistre && formData.lieu_sinistre.trim()) payload.lieu_sinistre = formData.lieu_sinistre.trim()
    if (formData.montant_reclame && Number(formData.montant_reclame) > 0) payload.montant_reclame = Number(formData.montant_reclame)

    Object.entries(documents).forEach(([key, file]) => {
      if (file instanceof File) (payload as any)[key] = file
    })

    console.log('📋 Payload SODEC:', payload)

    createSinistre(payload, {
      onSuccess: (response) => {
        alert(`✅ Sinistre déclaré avec succès!\n\nNuméro: ${response.numero_sinistre || 'En attente'}`)
        navigate('/sinistres/sodec')
      },
      onError: (error: any) => {
        const validationErrors = error?.response?.data?.errors
        if (validationErrors) {
          const errorMessages = Object.entries(validationErrors)
            .map(([field, messages]) => `• ${field}: ${(messages as string[]).join(', ')}`)
            .join('\n')
          alert(`❌ Erreurs de validation:\n\n${errorMessages}`)
        } else {
          const message = error?.response?.data?.message || error?.message || 'Erreur lors de la déclaration'
          alert(`❌ Erreur: ${message}`)
        }
      },
    })
  }

  if (loadingContrats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-rose-50">
        <LoadingSpinner size="lg" text="Chargement des contrats SODEC..." />
      </div>
    )
  }

  const requiredDocs = getRequiredDocuments(formData.type_sinistre)
  const selectedTypeInfo = SINISTRE_TYPES.find(t => t.value === formData.type_sinistre)

  const steps = [
    { num: 1, label: 'Contrat', icon: FileText, completed: !!formData.contrat_id },
    { num: 2, label: 'Sinistre', icon: AlertCircle, completed: !!formData.type_sinistre && !!formData.date_sinistre },
    { num: 3, label: 'Documents', icon: Upload, completed: requiredDocs.length > 0 && requiredDocs.some(doc => documents[doc]) },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50 to-purple-50">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/sinistres/sodec')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4" />
              Retour aux sinistres
            </Button>
            <Badge className="bg-rose-100 text-rose-800 px-3 py-1">🏦 SODEC</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-500 to-purple-600 rounded-2xl shadow-lg mb-4">
            <AlertCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Déclaration de Sinistre</h1>
          <p className="text-slate-500 mt-2 max-w-xl mx-auto">Remplissez ce formulaire pour déclarer un sinistre sur un contrat SODEC.</p>
        </div>

        <div className="mb-10">
          <div className="flex items-center justify-center gap-2 md:gap-4">
            {steps.map((step, index) => (
              <div key={step.num} className="flex items-center">
                <div className={cn("flex items-center gap-2 px-3 py-2 rounded-full transition-all", step.completed ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500")}>
                  <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold", step.completed ? "bg-green-500 text-white" : "bg-slate-300 text-white")}>
                    {step.completed ? <CheckCircle className="w-4 h-4" /> : step.num}
                  </div>
                  <span className="hidden md:inline text-sm font-medium">{step.label}</span>
                </div>
                {index < steps.length - 1 && <div className={cn("w-8 md:w-16 h-1 mx-1 rounded-full", step.completed ? "bg-green-300" : "bg-slate-200")} />}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* CARD 1: Contrat */}
          <Card className="overflow-hidden border-0 shadow-xl bg-white">
            <CardHeader className="bg-gradient-to-r from-rose-500 to-rose-600 text-white py-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><FileText className="h-5 w-5" /></div>
                <div>
                  <CardTitle className="text-lg">Contrat concerné</CardTitle>
                  <CardDescription className="text-rose-100">Sélectionnez le contrat objet du sinistre</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-700 font-semibold flex items-center gap-2"><FileText className="h-4 w-4 text-rose-500" />Contrat SODEC *</Label>
                  <Select id="contrat" value={formData.contrat_id} onChange={(e) => setFormData({ ...formData, contrat_id: e.target.value })} className={cn("mt-2 h-12 text-base", errors.contrat_id ? 'border-red-500' : 'border-slate-300')}>
                    <option value="">-- Sélectionnez un contrat --</option>
                    {contrats?.map((c: any) => (<option key={c.id} value={c.id}>#{c.id} - {c.nom_prenom_assure_principal} ({c.numero_police || 'Sans numéro'})</option>))}
                  </Select>
                  {errors.contrat_id && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.contrat_id}</p>}
                </div>
                {selectedContrat && (
                  <div className="mt-4 p-5 bg-gradient-to-br from-rose-50 to-purple-50 rounded-2xl border border-rose-200">
                    <div className="flex items-center gap-2 mb-4"><CheckCircle className="h-5 w-5 text-green-500" /><span className="font-semibold text-slate-800">Contrat sélectionné</span></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white p-3 rounded-xl shadow-sm"><div className="text-xs text-slate-500 mb-1">Assuré</div><div className="font-semibold text-slate-800 truncate">{selectedContrat.nom_prenom_assure_principal}</div></div>
                      <div className="bg-white p-3 rounded-xl shadow-sm"><div className="text-xs text-slate-500 mb-1">N° Police</div><div className="font-mono font-semibold text-slate-800">{selectedContrat.numero_police || 'N/A'}</div></div>
                      <div className="bg-white p-3 rounded-xl shadow-sm"><div className="text-xs text-slate-500 mb-1">Montant crédit</div><div className="font-bold text-rose-600">{formatCurrency(selectedContrat.montant_credit || 0)}</div></div>
                      <div className="bg-white p-3 rounded-xl shadow-sm"><div className="text-xs text-slate-500 mb-1">Statut</div><Badge className={cn("font-medium", selectedContrat.statut === 'actif' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800')}>{selectedContrat.statut?.toUpperCase()}</Badge></div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* CARD 2: Type de sinistre */}
          <Card className="overflow-hidden border-0 shadow-xl bg-white">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><AlertCircle className="h-5 w-5" /></div>
                <div>
                  <CardTitle className="text-lg">Type de sinistre</CardTitle>
                  <CardDescription className="text-orange-100">Sélectionnez le type de sinistre à déclarer</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {SINISTRE_TYPES.map((type) => {
                  const Icon = type.icon
                  const isSelected = formData.type_sinistre === type.value
                  return (
                    <div key={type.value} onClick={() => setFormData({ ...formData, type_sinistre: type.value as SinistreType })} className={cn("relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg", isSelected ? `${type.borderColor} ${type.bgColor} shadow-lg scale-105` : "border-slate-200 bg-white hover:border-slate-300")}>
                      {isSelected && <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-md"><CheckCircle className="w-4 h-4 text-white" /></div>}
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-3 mx-auto", isSelected ? `bg-gradient-to-br ${type.color}` : "bg-slate-100")}><Icon className={cn("h-6 w-6", isSelected ? "text-white" : "text-slate-500")} /></div>
                      <div className="text-center"><div className={cn("font-semibold text-sm", isSelected ? type.textColor : "text-slate-700")}>{type.label}</div><div className="text-xs text-slate-500 mt-1 hidden md:block">{type.description}</div></div>
                    </div>
                  )
                })}
              </div>
              {errors.type_sinistre && <p className="text-red-500 text-sm mb-4 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.type_sinistre}</p>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <Label className="text-slate-700 font-semibold flex items-center gap-2"><Calendar className="h-4 w-4 text-orange-500" />Date du sinistre *</Label>
                  <Input type="date" value={formData.date_sinistre} onChange={(e) => setFormData({ ...formData, date_sinistre: e.target.value })} max={new Date().toISOString().split('T')[0]} className={cn("mt-2 h-12", errors.date_sinistre ? 'border-red-500' : '')} />
                  {errors.date_sinistre && <p className="text-red-500 text-sm mt-1">{errors.date_sinistre}</p>}
                </div>
                <div>
                  <Label className="text-slate-700 font-semibold flex items-center gap-2"><MapPin className="h-4 w-4 text-orange-500" />Lieu du sinistre</Label>
                  <Input value={formData.lieu_sinistre} onChange={(e) => setFormData({ ...formData, lieu_sinistre: e.target.value })} placeholder="Ex: Libreville, Franceville" className="mt-2 h-12" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <Label className="text-slate-700 font-semibold flex items-center gap-2"><DollarSign className="h-4 w-4 text-orange-500" />Capital restant dû (FCFA) *</Label>
                  <Input type="number" value={formData.capital_restant_du} onChange={(e) => setFormData({ ...formData, capital_restant_du: parseFloat(e.target.value) || 0 })} className={cn("mt-2 h-12", errors.capital_restant_du ? 'border-red-500' : '')} />
                  {errors.capital_restant_du && <p className="text-red-500 text-sm mt-1">{errors.capital_restant_du}</p>}
                </div>
                <div>
                  <Label className="text-slate-700 font-semibold flex items-center gap-2"><DollarSign className="h-4 w-4 text-slate-400" />Montant réclamé (optionnel)</Label>
                  <Input type="number" value={formData.montant_reclame || ''} onChange={(e) => setFormData({ ...formData, montant_reclame: parseFloat(e.target.value) || 0 })} placeholder="0" className="mt-2 h-12" />
                </div>
              </div>

              <div className="mt-4">
                <Label className="text-slate-700 font-semibold">Circonstances du sinistre</Label>
                <Textarea value={formData.circonstances} onChange={(e) => setFormData({ ...formData, circonstances: e.target.value })} placeholder="Décrivez les circonstances du sinistre en détail..." rows={4} className="mt-2" />
              </div>
            </CardContent>
          </Card>

          {/* CARD 3: Documents */}
          <Card className="overflow-hidden border-0 shadow-xl bg-white">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Upload className="h-5 w-5" /></div>
                <div>
                  <CardTitle className="text-lg">Documents justificatifs</CardTitle>
                  <CardDescription className="text-purple-100">Joignez les pièces requises pour votre déclaration</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {formData.type_sinistre ? (
                <>
                  <div className="mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-200 flex items-start gap-3">
                    <Info className="h-5 w-5 text-indigo-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-indigo-800">Documents requis pour: {selectedTypeInfo?.label}</p>
                      <p className="text-sm text-indigo-600 mt-1">Les documents marqués d'un <span className="text-red-500 font-bold">*</span> sont obligatoires.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(documentLabels).map(([key, label]) => {
                      const isRequired = requiredDocs.includes(key)
                      const file = documents[key]
                      return (
                        <div key={key} className={cn("p-4 rounded-xl border-2 transition-all", file ? "border-green-300 bg-green-50" : isRequired ? "border-purple-300 bg-purple-50" : "border-slate-200 bg-slate-50")}>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="font-medium text-slate-700 flex items-center gap-2"><FileCheck className={cn("h-4 w-4", file ? "text-green-500" : isRequired ? "text-purple-500" : "text-slate-400")} />{label}{isRequired && <span className="text-red-500">*</span>}</Label>
                            {file && <Button type="button" variant="ghost" size="sm" onClick={() => handleFileChange(key, null)} className="text-red-500 hover:bg-red-100 h-7 w-7 p-0"><X className="h-4 w-4" /></Button>}
                          </div>
                          {file ? <div className="flex items-center gap-2 text-green-700"><CheckCircle className="h-5 w-5" /><span className="text-sm truncate">{file.name}</span></div> : <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(key, e.target.files?.[0] || null)} className="text-sm h-10 cursor-pointer" />}
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center"><Upload className="h-8 w-8 text-slate-300" /></div>
                  <p className="font-medium">Veuillez d'abord sélectionner un type de sinistre</p>
                  <p className="text-sm mt-1">Les documents requis s'afficheront ici.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Boutons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => navigate('/sinistres/sodec')} disabled={isPending} className="h-12 px-6 border-slate-300"><ArrowLeft className="h-4 w-4 mr-2" />Annuler</Button>
            <Button type="submit" className="h-12 px-8 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-700 hover:to-purple-700 shadow-lg" disabled={isPending}>
              {isPending ? (<><LoadingSpinner size="sm" /><span className="ml-2">Envoi en cours...</span></>) : (<><CheckCircle className="h-5 w-5 mr-2" />Déclarer le sinistre</>)}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
