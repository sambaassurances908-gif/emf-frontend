// src/features/sinistres/bceg/BcegSinistreDeclarationForm.tsx
import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { 
  AlertCircle, 
  ArrowLeft, 
  FileText, 
  Calendar, 
  MapPin,
  CheckCircle,
  Info,
  DollarSign,
  FileCheck,
  Heart,
  Shield,
  Briefcase,
  Store,
  Upload
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

const SINISTRE_TYPES = [
  { value: 'deces', label: 'Décès', description: 'Décès de l\'assuré', icon: Heart, color: 'from-gray-600 to-gray-800', bgColor: 'bg-gray-50', borderColor: 'border-gray-300', textColor: 'text-gray-700' },
  { value: 'iad', label: 'Invalidité (IAD)', description: 'Invalidité Absolue et Définitive', icon: Shield, color: 'from-red-500 to-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-300', textColor: 'text-red-700' },
  { value: 'perte_emploi', label: 'Perte d\'emploi', description: 'Licenciement involontaire', icon: Briefcase, color: 'from-amber-500 to-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-300', textColor: 'text-amber-700' },
  { value: 'perte_activite', label: 'Perte d\'activité', description: 'Cessation d\'activité commerciale', icon: Store, color: 'from-orange-500 to-orange-700', bgColor: 'bg-orange-50', borderColor: 'border-orange-300', textColor: 'text-orange-700' },
]

const DOCUMENT_LIST = [
  { key: 'doc_piece_identite', label: 'Pièce d\'identité' },
  { key: 'doc_certificat_deces', label: 'Certificat de décès' },
  { key: 'doc_certificat_heredite', label: 'Certificat d\'hérédité' },
  { key: 'doc_proces_verbal', label: 'Procès-verbal (accident)' },
  { key: 'doc_certificat_licenciement', label: 'Certificat de licenciement' },
  { key: 'doc_certificat_arret_travail', label: 'Certificat d\'arrêt de travail' },
  { key: 'doc_proces_verbal_faillite', label: 'PV de faillite/liquidation' },
]

export const BcegSinistreDeclarationForm = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  const emfId = user?.emf_id || 3

  const urlContratId = searchParams.get('contrat_id') || ''
  const { data: contrats, isLoading: loadingContrats } = useBcegContratsForSinistre(emfId)
  const { mutate: createSinistre, isPending } = useCreateBcegSinistre()

  const [isContratPreselected, setIsContratPreselected] = useState(false)
  const [selectedContrat, setSelectedContrat] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    contrat_id: '',
    type_sinistre: '' as 'deces' | 'iad' | 'perte_emploi' | 'perte_activite' | '',
    date_sinistre: '',
    capital_restant_du: 0,
    montant_reclame: 0,
    lieu_sinistre: '',
    circonstances: '',
    doc_certificat_deces: false,
    doc_piece_identite: false,
    doc_certificat_heredite: false,
    doc_proces_verbal: false,
    doc_certificat_licenciement: false,
    doc_certificat_arret_travail: false,
    doc_proces_verbal_faillite: false,
    autres_documents: '',
  })

  const contratsArray = useMemo(() => {
    return Array.isArray(contrats) ? contrats : []
  }, [contrats])

  useEffect(() => {
    if (urlContratId && contratsArray.length > 0 && !isContratPreselected) {
      const contrat = contratsArray.find((c: any) => c.id.toString() === urlContratId)
      if (contrat) {
        setFormData(prev => ({
          ...prev,
          contrat_id: urlContratId,
          capital_restant_du: contrat?.capital_restant_du || contrat?.montant_pret || 0
        }))
        setSelectedContrat(contrat)
        setIsContratPreselected(true)
      }
    }
  }, [urlContratId, contratsArray, isContratPreselected])

  const handleContratChange = (contratId: string) => {
    const contrat = contratsArray.find((c: any) => c.id.toString() === contratId)
    setSelectedContrat(contrat || null)
    setFormData(prev => ({
      ...prev,
      contrat_id: contratId,
      capital_restant_du: contrat?.capital_restant_du || contrat?.montant_pret || 0
    }))
  }

  const getRequiredDocs = (): string[] => {
    switch (formData.type_sinistre) {
      case 'deces': return ['doc_certificat_deces', 'doc_piece_identite', 'doc_certificat_heredite', 'doc_proces_verbal']
      case 'iad': return ['doc_certificat_arret_travail', 'doc_piece_identite']
      case 'perte_emploi': return ['doc_certificat_licenciement', 'doc_piece_identite']
      case 'perte_activite': return ['doc_proces_verbal_faillite', 'doc_piece_identite']
      default: return []
    }
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

    // Payload selon le contrôleur Laravel SinistreController@store
    // Note: Les flags booléens (doc_*) ne sont PAS acceptés lors de la création
    // Ils sont mis à jour automatiquement par le backend lors de l'upload des fichiers
    const payload: BcegSinistreCreatePayload = {
      contrat_type: 'ContratBceg',
      contrat_id: parseInt(formData.contrat_id, 10),
      type_sinistre: formData.type_sinistre as 'deces' | 'iad' | 'perte_emploi' | 'perte_activite',
      date_sinistre: formData.date_sinistre,
      capital_restant_du: capitalRestantDu,
    }

    // Champs optionnels acceptés par le backend
    if (formData.circonstances && formData.circonstances.trim()) payload.circonstances = formData.circonstances.trim()
    if (formData.lieu_sinistre && formData.lieu_sinistre.trim()) payload.lieu_sinistre = formData.lieu_sinistre.trim()
    if (formData.montant_reclame && Number(formData.montant_reclame) > 0) payload.montant_reclame = Number(formData.montant_reclame)

    // Note: Les checkboxes servent uniquement d'indication pour l'utilisateur
    // Les documents seront uploadés après la création du sinistre via l'API uploadDocument

    console.log('📋 Payload BCEG:', payload)

    createSinistre(payload, {
      onSuccess: (response: any) => {
        alert(`✅ Sinistre déclaré avec succès!\n\nNuméro: ${response?.numero_sinistre || 'En attente'}`)
        navigate('/sinistres/bceg')
      },
      onError: (error: any) => {
        const validationErrors = error?.response?.data?.errors
        if (validationErrors) {
          const errorMessages = Object.entries(validationErrors)
            .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
            .join('\n')
          alert(`Erreurs de validation:\n${errorMessages}`)
        } else {
          const message = error?.response?.data?.message || error?.message || 'Erreur lors de la déclaration'
          alert(`❌ Erreur: ${message}`)
        }
      },
    })
  }

  if (loadingContrats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
        <LoadingSpinner size="lg" text="Chargement des contrats BCEG..." />
      </div>
    )
  }

  const requiredDocs = getRequiredDocs()
  const selectedTypeInfo = SINISTRE_TYPES.find(t => t.value === formData.type_sinistre)

  const steps = [
    { num: 1, label: 'Contrat', icon: FileText, completed: !!formData.contrat_id },
    { num: 2, label: 'Sinistre', icon: AlertCircle, completed: !!formData.type_sinistre && !!formData.date_sinistre },
    { num: 3, label: 'Documents', icon: Upload, completed: requiredDocs.length > 0 && requiredDocs.some(doc => (formData as any)[doc]) },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/sinistres/bceg')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4" />
              Retour aux sinistres
            </Button>
            <Badge className="bg-emerald-100 text-emerald-800 px-3 py-1">🏦 BCEG</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg mb-4">
            <AlertCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Déclaration de Sinistre</h1>
          <p className="text-slate-500 mt-2 max-w-xl mx-auto">Remplissez ce formulaire pour déclarer un sinistre sur un contrat BCEG.</p>
        </div>

        {/* Progress Steps */}
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
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><FileText className="h-5 w-5" /></div>
                <div>
                  <CardTitle className="text-lg">Contrat concerné</CardTitle>
                  <CardDescription className="text-emerald-100">Sélectionnez le contrat objet du sinistre</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-700 font-semibold flex items-center gap-2"><FileText className="h-4 w-4 text-emerald-500" />Contrat BCEG *</Label>
                  <select
                    value={formData.contrat_id}
                    onChange={(e) => handleContratChange(e.target.value)}
                    className={cn("mt-2 w-full h-12 px-3 text-base border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent", errors.contrat_id ? 'border-red-500' : 'border-slate-300')}
                  >
                    <option value="">-- Sélectionnez un contrat --</option>
                    {contratsArray.map((c: any) => (
                      <option key={c.id} value={c.id}>#{c.id} - {c.prenom} {c.nom} ({c.numero_convention || c.numero_police || 'Sans numéro'})</option>
                    ))}
                  </select>
                  {errors.contrat_id && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.contrat_id}</p>}
                </div>

                {selectedContrat && (
                  <div className="mt-4 p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200">
                    <div className="flex items-center gap-2 mb-4"><CheckCircle className="h-5 w-5 text-green-500" /><span className="font-semibold text-slate-800">Contrat sélectionné</span></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white p-3 rounded-xl shadow-sm"><div className="text-xs text-slate-500 mb-1">Assuré</div><div className="font-semibold text-slate-800 truncate">{selectedContrat.prenom} {selectedContrat.nom}</div></div>
                      <div className="bg-white p-3 rounded-xl shadow-sm"><div className="text-xs text-slate-500 mb-1">N° Police</div><div className="font-mono font-semibold text-slate-800">{selectedContrat.numero_convention || selectedContrat.numero_police || 'N/A'}</div></div>
                      <div className="bg-white p-3 rounded-xl shadow-sm"><div className="text-xs text-slate-500 mb-1">Montant prêt</div><div className="font-bold text-emerald-600">{formatCurrency(selectedContrat.montant_pret || 0)}</div></div>
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
                    <div key={type.value} onClick={() => setFormData({ ...formData, type_sinistre: type.value as any })} className={cn("relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg", isSelected ? `${type.borderColor} ${type.bgColor} shadow-lg scale-105` : "border-slate-200 bg-white hover:border-slate-300")}>
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
                  <Input value={formData.lieu_sinistre} onChange={(e) => setFormData({ ...formData, lieu_sinistre: e.target.value })} placeholder="Ex: Libreville, Port-Gentil" className="mt-2 h-12" />
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
            <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><FileCheck className="h-5 w-5" /></div>
                <div>
                  <CardTitle className="text-lg">Documents justificatifs</CardTitle>
                  <CardDescription className="text-teal-100">Cochez les documents que vous fournirez</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {formData.type_sinistre ? (
                <>
                  <div className="mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-3">
                    <Info className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-emerald-800">Documents requis pour: {selectedTypeInfo?.label}</p>
                      <p className="text-sm text-emerald-600 mt-1">Les documents marqués <span className="text-red-500 font-bold">Requis</span> sont obligatoires.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {DOCUMENT_LIST.map((doc) => {
                      const isRequired = requiredDocs.includes(doc.key)
                      const isChecked = (formData as any)[doc.key]
                      return (
                        <label key={doc.key} className={cn("flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all", isChecked ? "bg-green-50 border-green-300" : isRequired ? "bg-teal-50 border-teal-200 hover:border-teal-300" : "bg-slate-50 border-slate-200 hover:border-slate-300")}>
                          <Checkbox
                            checked={isChecked}
                            onChange={(e) => setFormData({ ...formData, [doc.key]: e.target.checked })}
                          />
                          <span className={cn("text-sm font-medium flex-1", isChecked ? "text-green-700" : "text-slate-700")}>{doc.label}</span>
                          {isRequired && <Badge className="bg-red-100 text-red-800 text-xs">Requis</Badge>}
                          {isChecked && <CheckCircle className="h-5 w-5 text-green-500" />}
                        </label>
                      )
                    })}
                  </div>

                  <div className="mt-6">
                    <Label className="text-slate-700 font-semibold">Autres documents (description)</Label>
                    <Input value={formData.autres_documents} onChange={(e) => setFormData({ ...formData, autres_documents: e.target.value })} placeholder="Description des autres documents fournis..." className="mt-2 h-12" />
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center"><FileCheck className="h-8 w-8 text-slate-300" /></div>
                  <p className="font-medium">Veuillez d'abord sélectionner un type de sinistre</p>
                  <p className="text-sm mt-1">Les documents requis s'afficheront ici.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Boutons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => navigate('/sinistres/bceg')} disabled={isPending} className="h-12 px-6 border-slate-300"><ArrowLeft className="h-4 w-4 mr-2" />Annuler</Button>
            <Button type="submit" className="h-12 px-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg" disabled={isPending}>
              {isPending ? (<><LoadingSpinner size="sm" /><span className="ml-2">Envoi en cours...</span></>) : (<><CheckCircle className="h-5 w-5 mr-2" />Déclarer le sinistre</>)}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
