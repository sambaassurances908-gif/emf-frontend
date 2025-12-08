import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Shield, Users, Calendar, CheckCircle, AlertCircle, Phone, Mail, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore } from '@/store/authStore'
import { useCreateSodecContract } from '@/hooks/useCreateSodecContract'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatCurrency } from '@/lib/utils'

export const SodecContractCreate = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const emfId = user?.emf_id || 5

  const [formData, setFormData] = useState({
    emf_id: emfId,
    nom_prenom: '',
    adresse_assure: '',
    ville_assure: '',
    telephone_assure: '',
    email_assure: '',
    date_naissance: '',
    numero_police: '',
    categorie: 'commercants' as 'commercants' | 'salaries_public' | 'salaries_prive' | 'retraites' | 'autre',
    autre_categorie_precision: '',
    option_prevoyance: 'option_a' as 'option_a' | 'option_b',
    montant_pret_assure: 5000000,
    duree_pret_mois: 12,
    date_effet: '',
    beneficiaire_deces: '',
    garantie_prevoyance: true,
    garantie_deces_iad: true,
    garantie_perte_emploi: false,
    type_contrat_travail: 'non_applicable' as 'cdi' | 'cdd_plus_9_mois' | 'cdd_moins_9_mois' | 'non_applicable',
    agence: ''
  })

  const [assuresAssocies, setAssuresAssocies] = useState<Array<{
    type_assure: string
    nom: string
    prenom: string
    date_naissance: string
    lieu_naissance: string
    contact: string
    adresse: string
  }>>([])

  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [submitError, setSubmitError] = useState('')

  const { mutate: createContract, isPending, isSuccess, isError, error } = useCreateSodecContract()

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setFormData(prev => ({ ...prev, date_effet: today }))
  }, [])

  useEffect(() => {
    if (isError && error?.response?.status === 422) {
      const validationErrors = error.response.data.errors || {}
      console.error('🔴 Erreurs validation Laravel:', validationErrors)
      setErrors(validationErrors)
      const firstErrorKey = Object.keys(validationErrors)[0]
      if (firstErrorKey) {
        const firstError = validationErrors[firstErrorKey]
        setSubmitError(Array.isArray(firstError) ? firstError[0] : firstError as string)
      }
    } else if (isError) {
      setSubmitError('Erreur serveur. Réessayez.')
    }
  }, [isError, error])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string[]> = {}

    // Validation des champs obligatoires
    if (!formData.nom_prenom.trim()) {
      newErrors.nom_prenom = ['Nom et prénom obligatoires']
    }
    if (!formData.adresse_assure.trim()) {
      newErrors.adresse_assure = ['Adresse obligatoire']
    }
    if (!formData.ville_assure.trim()) {
      newErrors.ville_assure = ['Ville obligatoire']
    }
    if (!formData.telephone_assure.trim()) {
      newErrors.telephone_assure = ['Téléphone obligatoire']
    }
    if (formData.montant_pret_assure <= 0) {
      newErrors.montant_pret_assure = ['Montant invalide']
    }
    if (!formData.date_effet) {
      newErrors.date_effet = ["Date d'effet obligatoire"]
    }
    if (formData.categorie === 'autre' && !formData.autre_categorie_precision.trim()) {
      newErrors.autre_categorie_precision = ['Précision obligatoire pour "Autre"']
    }

    // Validation garanties obligatoires
    if (!formData.garantie_prevoyance) {
      newErrors.garantie_prevoyance = ['La garantie prévoyance est obligatoire']
    }
    if (!formData.garantie_deces_iad) {
      newErrors.garantie_deces_iad = ['La garantie décès IAD est obligatoire']
    }

    // Validation type contrat travail si perte emploi activée
    if (formData.garantie_perte_emploi && (!formData.type_contrat_travail || formData.type_contrat_travail === 'non_applicable')) {
      newErrors.type_contrat_travail = ['Type contrat travail obligatoire pour la garantie perte emploi']
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setSubmitError('')

    if (!validateForm()) {
      console.error('❌ Validation échouée:', errors)
      return
    }

    // Construction du payload avec TOUS les champs obligatoires
    const payload = {
      emf_id: Number(formData.emf_id),
      nom_prenom: String(formData.nom_prenom).trim(),
      adresse_assure: String(formData.adresse_assure).trim(),
      ville_assure: String(formData.ville_assure).trim(),
      telephone_assure: String(formData.telephone_assure).trim(),
      email_assure: formData.email_assure?.trim() || null,
      date_naissance: formData.date_naissance || null,
      numero_police: formData.numero_police?.trim() || null,
      categorie: formData.categorie,
      autre_categorie_precision: formData.autre_categorie_precision?.trim() || null,
      option_prevoyance: formData.option_prevoyance,
      montant_pret_assure: Number(formData.montant_pret_assure),
      duree_pret_mois: Number(formData.duree_pret_mois),
      date_effet: formData.date_effet,
      beneficiaire_deces: formData.beneficiaire_deces?.trim() || null,
      garantie_prevoyance: Boolean(formData.garantie_prevoyance),
      garantie_deces_iad: Boolean(formData.garantie_deces_iad),
      garantie_perte_emploi: Boolean(formData.garantie_perte_emploi),
      type_contrat_travail: formData.garantie_perte_emploi 
        ? formData.type_contrat_travail 
        : 'non_applicable',
      agence: formData.agence?.trim() || null,
      assures_associes: assuresAssocies.filter(a => 
        a.nom?.trim() && 
        a.prenom?.trim() && 
        a.lieu_naissance?.trim()
      )
    }

    console.log('📤 Payload FINAL envoyé:', JSON.stringify(payload, null, 2))

    createContract(payload, {
      onSuccess: (data) => {
        console.log('✅ Contrat créé avec succès:', data)
        navigate(`/contrats/sodec/${data.data.id}`, {
          state: { success: 'Contrat créé avec succès !' }
        })
      },
      onError: (err: any) => {
        console.error('❌ Erreur lors de la création:', err)
      }
    })
  }

  const addAssureAssocie = () => {
    if (assuresAssocies.length < 6) {
      const types = ['conjoint', 'conjoint_2', 'enfant_1', 'enfant_2', 'enfant_3', 'enfant_4']
      const nextType = types[assuresAssocies.length]
      setAssuresAssocies(prev => [...prev, {
        type_assure: nextType,
        nom: '',
        prenom: '',
        date_naissance: '',
        lieu_naissance: '',
        contact: '',
        adresse: ''
      }])
    }
  }

  const updateAssureAssocie = (index: number, field: string, value: string) => {
    setAssuresAssocies(prev => prev.map((a, i) =>
      i === index ? { ...a, [field]: value } : a
    ))
  }

  const removeAssureAssocie = (index: number) => {
    setAssuresAssocies(prev => prev.filter((_, i) => i !== index))
  }

  const cotisationSimulee = formData.option_prevoyance === 'option_a'
    ? 30000 + (formData.montant_pret_assure * 0.015)
    : 15000 + (formData.montant_pret_assure * 0.015)

  const getFieldError = (field: string): string | undefined => {
    return errors[field]?.[0]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/contrats/sodec')} className="hover:bg-indigo-100">
            <ArrowLeft className="h-5 w-5 mr-1" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              🌸 Nouveau Contrat SODEC
            </h1>
            <p className="text-gray-600">EMF #{emfId} - {user?.name}</p>
          </div>
        </div>

        {/* Message Succès */}
        {isSuccess && (
          <Card className="border-green-200 bg-green-50 border-2">
            <CardContent className="p-4 flex items-center gap-3 text-green-800">
              <CheckCircle className="h-6 w-6" />
              <span>✅ Contrat créé avec succès ! Redirection...</span>
            </CardContent>
          </Card>
        )}

        {/* Message Erreur 422 - DÉTAILLÉ */}
        {submitError && (
          <Card className="border-red-200 bg-red-50 border-2">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 text-red-800 mb-4">
                <AlertCircle className="h-6 w-6" />
                <span className="font-semibold">{submitError}</span>
              </div>
              {Object.entries(errors).map(([field, messages]) => (
                <div key={field} className="text-sm text-red-700 bg-red-100 p-2 rounded mb-2">
                  ⚠️ <strong>{field.replace(/_/g, ' ').toUpperCase()}:</strong> {Array.isArray(messages) ? messages[0] : messages}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Assuré Principal - CHAMPS OBLIGATOIRES */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                👤 Assuré Principal
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Nom & Prénom OBLIGATOIRE */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom & Prénom <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.nom_prenom}
                    onChange={(e) => setFormData({...formData, nom_prenom: e.target.value})}
                    placeholder="Pierre Obame"
                    className={getFieldError('nom_prenom') ? 'border-red-300 focus:ring-red-500' : ''}
                    required
                  />
                  {getFieldError('nom_prenom') && <p className="mt-1 text-sm text-red-600">{getFieldError('nom_prenom')}</p>}
                </div>

                {/* Adresse OBLIGATOIRE */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Adresse <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.adresse_assure}
                    onChange={(e) => setFormData({...formData, adresse_assure: e.target.value})}
                    placeholder="Quartier Louis, Libreville"
                    className={getFieldError('adresse_assure') ? 'border-red-300 focus:ring-red-500' : ''}
                    required
                  />
                  {getFieldError('adresse_assure') && <p className="mt-1 text-sm text-red-600">{getFieldError('adresse_assure')}</p>}
                </div>

                {/* Ville OBLIGATOIRE */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Ville <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.ville_assure}
                    onChange={(e) => setFormData({...formData, ville_assure: e.target.value})}
                    placeholder="Libreville"
                    className={getFieldError('ville_assure') ? 'border-red-300 focus:ring-red-500' : ''}
                    required
                  />
                  {getFieldError('ville_assure') && <p className="mt-1 text-sm text-red-600">{getFieldError('ville_assure')}</p>}
                </div>

                {/* Téléphone OBLIGATOIRE */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Téléphone <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    value={formData.telephone_assure}
                    onChange={(e) => setFormData({...formData, telephone_assure: e.target.value})}
                    placeholder="06 12 34 56 78"
                    className={getFieldError('telephone_assure') ? 'border-red-300 focus:ring-red-500' : ''}
                    required
                  />
                  {getFieldError('telephone_assure') && <p className="mt-1 text-sm text-red-600">{getFieldError('telephone_assure')}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email
                  </label>
                  <Input
                    type="email"
                    value={formData.email_assure}
                    onChange={(e) => setFormData({...formData, email_assure: e.target.value})}
                    placeholder="pierre@example.com"
                  />
                </div>

                {/* Catégorie OBLIGATOIRE */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie <span className="text-red-500">*</span></label>
                  <select
                    value={formData.categorie}
                    onChange={(e) => setFormData({...formData, categorie: e.target.value as any})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="commercants">🛒 Commerçants</option>
                    <option value="salaries_public">🏛️ Salariés Public</option>
                    <option value="salaries_prive">💼 Salariés Privé</option>
                    <option value="retraites">👴 Retraités</option>
                    <option value="autre">➕ Autre</option>
                  </select>
                </div>

                {/* Précision Autre catégorie */}
                {formData.categorie === 'autre' && (
                  <div className="lg:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Précision "Autre" <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.autre_categorie_precision}
                      onChange={(e) => setFormData({...formData, autre_categorie_precision: e.target.value})}
                      placeholder="Profession/Activité précise"
                      className={getFieldError('autre_categorie_precision') ? 'border-red-300 focus:ring-red-500' : ''}
                      required
                    />
                    {getFieldError('autre_categorie_precision') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('autre_categorie_precision')}</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Option Prévoyance & Financier */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                💰 Option Prévoyance & Financier
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Option <span className="text-red-500">*</span></label>
                  <select
                    value={formData.option_prevoyance}
                    onChange={(e) => setFormData({...formData, option_prevoyance: e.target.value as any})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="option_a">Option A - Complète (30k FCFA)</option>
                    <option value="option_b">Option B - Base (15k FCFA)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Montant Prêt (FCFA) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={formData.montant_pret_assure}
                    onChange={(e) => setFormData({...formData, montant_pret_assure: parseInt(e.target.value) || 0})}
                    className={`text-right ${getFieldError('montant_pret_assure') ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="5 000 000"
                    min={1}
                    required
                  />
                  {getFieldError('montant_pret_assure') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('montant_pret_assure')}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Durée (mois) <span className="text-red-500">*</span></label>
                  <Input
                    type="number"
                    value={formData.duree_pret_mois}
                    onChange={(e) => setFormData({...formData, duree_pret_mois: parseInt(e.target.value) || 0})}
                    min={1}
                    max={72}
                    placeholder="12"
                    required
                  />
                </div>
              </div>

              {/* Cotisation estimée */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Cotisation estimée :</span>
                  <Badge className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    {formatCurrency(cotisationSimulee)}
                  </Badge>
                </div>
              </div>

              {/* Garanties OBLIGATOIRES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border-2 border-indigo-200">
                <div className="md:col-span-2 mb-2">
                  <p className="text-sm font-semibold text-indigo-700">🔒 Garanties Obligatoires</p>
                </div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.garantie_prevoyance}
                    onChange={(e) => setFormData({...formData, garantie_prevoyance: e.target.checked})}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium">✅ Garantie Prévoyance <span className="text-red-500">*</span></span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.garantie_deces_iad}
                    onChange={(e) => setFormData({...formData, garantie_deces_iad: e.target.checked})}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium">✅ Garantie Décès IAD <span className="text-red-500">*</span></span>
                </label>
                
                {(getFieldError('garantie_prevoyance') || getFieldError('garantie_deces_iad')) && (
                  <div className="md:col-span-2 text-sm text-red-600 bg-red-100 p-2 rounded">
                    ⚠️ Les deux garanties ci-dessus sont obligatoires
                  </div>
                )}

                <div className="md:col-span-2 mt-2 pt-2 border-t border-gray-300">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Garantie Optionnelle</p>
                </div>
                
                <label className="flex items-center space-x-2 md:col-span-2">
                  <input
                    type="checkbox"
                    checked={formData.garantie_perte_emploi}
                    onChange={(e) => setFormData({...formData, garantie_perte_emploi: e.target.checked})}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium">💼 Garantie Perte d'Emploi (+2%)</span>
                </label>
                
                {formData.garantie_perte_emploi && (
                  <div className="md:col-span-2 pl-6 pt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type contrat travail <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.type_contrat_travail}
                      onChange={(e) => setFormData({...formData, type_contrat_travail: e.target.value as any})}
                      className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        getFieldError('type_contrat_travail') ? 'border-red-300' : 'border-gray-300'
                      }`}
                      required={formData.garantie_perte_emploi}
                    >
                      <option value="cdi">📋 CDI</option>
                      <option value="cdd_plus_9_mois">📅 CDD &gt; 9 mois</option>
                      <option value="cdd_moins_9_mois">📅 CDD &lt; 9 mois</option>
                    </select>
                    {getFieldError('type_contrat_travail') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('type_contrat_travail')}</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Date Effet & Infos Complémentaires */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                  <Calendar className="h-4 w-4" />
                  Date Effet <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={formData.date_effet}
                  onChange={(e) => setFormData({...formData, date_effet: e.target.value})}
                  className={getFieldError('date_effet') ? 'border-red-300 focus:ring-red-500' : ''}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
                {getFieldError('date_effet') && <p className="mt-1 text-sm text-red-600">{getFieldError('date_effet')}</p>}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Numéro Police</label>
                  <Input
                    value={formData.numero_police}
                    onChange={(e) => setFormData({...formData, numero_police: e.target.value})}
                    placeholder="SOD-2025-XXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Agence</label>
                  <Input
                    value={formData.agence}
                    onChange={(e) => setFormData({...formData, agence: e.target.value})}
                    placeholder="Agence SODEC Libreville"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bénéficiaire Décès</label>
                  <Input
                    value={formData.beneficiaire_deces}
                    onChange={(e) => setFormData({...formData, beneficiaire_deces: e.target.value})}
                    placeholder="Marie Nguema (épouse)"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Assurés Associés (OPTIONNEL) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                👨‍👩‍👧‍👦 Assurés Associés (Optionnel - Max 5)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              {assuresAssocies.map((assure, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className="font-medium">
                      {assure.type_assure.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeAssureAssocie(index)}
                    >
                      Supprimer
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <Input
                      placeholder="Nom *"
                      value={assure.nom}
                      onChange={(e) => updateAssureAssocie(index, 'nom', e.target.value)}
                    />
                    <Input
                      placeholder="Prénom *"
                      value={assure.prenom}
                      onChange={(e) => updateAssureAssocie(index, 'prenom', e.target.value)}
                    />
                    <Input
                      type="date"
                      value={assure.date_naissance}
                      onChange={(e) => updateAssureAssocie(index, 'date_naissance', e.target.value)}
                    />
                    <Input
                      placeholder="Lieu naissance *"
                      value={assure.lieu_naissance}
                      onChange={(e) => updateAssureAssocie(index, 'lieu_naissance', e.target.value)}
                    />
                    <Input
                      placeholder="Contact"
                      value={assure.contact}
                      onChange={(e) => updateAssureAssocie(index, 'contact', e.target.value)}
                    />
                    <Input
                      placeholder="Adresse"
                      value={assure.adresse}
                      onChange={(e) => updateAssureAssocie(index, 'adresse', e.target.value)}
                    />
                  </div>
                </div>
              ))}
              {assuresAssocies.length < 5 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addAssureAssocie}
                  className="w-full border-dashed border-2 hover:bg-indigo-50"
                  disabled={isPending}
                >
                  <Users className="h-4 w-4 mr-2" />
                  ➕ Ajouter assuré associé ({5 - assuresAssocies.length} restant(s))
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t bg-gray-50 rounded-lg p-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/contrats/sodec')}
              className="flex-1"
              disabled={isPending}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg flex items-center justify-center gap-2 text-white font-semibold text-lg py-3"
            >
              {isPending ? (
                <>
                  <LoadingSpinner size="sm" />
                  Création en cours...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Créer Contrat SODEC
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
