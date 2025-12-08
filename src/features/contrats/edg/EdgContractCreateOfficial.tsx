// src/features/contrats/edg/EdgContractCreateOfficial.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, CheckCircle, AlertCircle, Mail, Phone, MapPin, Printer } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { useCreateEdgContract } from '@/hooks/useEdgContracts'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatCurrency } from '@/lib/utils'
import logoSamba from '@/assets/logo-samba.png'

// --- Form Input Component ---
interface FormInputProps {
  label?: string
  value?: string | number
  onChange?: (value: string) => void
  type?: string
  placeholder?: string
  required?: boolean
  error?: string
  className?: string
  disabled?: boolean
}

const FormInput: React.FC<FormInputProps> = ({ 
  label, 
  value = '', 
  onChange, 
  type = 'text', 
  placeholder = '',
  required = false,
  error,
  className = "",
  disabled = false
}) => (
  <div className="flex items-end w-full">
    {label && (
      <span className="mr-1 whitespace-nowrap text-[11px] text-gray-800">
        {label}{required && <span className="text-red-500">*</span>}
      </span>
    )}
    <input
      type={type}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`flex-grow border-b-2 ${error ? 'border-red-400 bg-red-50' : 'border-gray-400'} text-[11px] px-1 py-0.5 min-h-[22px] font-semibold bg-transparent focus:outline-none focus:border-[#F48232] ${className}`}
    />
  </div>
)

// --- Checkbox Component ---
interface CheckboxProps {
  label: string
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
}

const Checkbox: React.FC<CheckboxProps> = ({ label, checked = false, onChange, disabled = false }) => (
  <label className="flex items-center mr-3 cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange?.(e.target.checked)}
      disabled={disabled}
      className="sr-only"
    />
    <div className={`w-4 h-4 border-2 border-black mr-1 flex items-center justify-center transition-colors ${checked ? 'bg-black' : 'bg-white'} ${!disabled && 'hover:bg-gray-100'}`}>
      {checked && <div className="w-2 h-2 bg-white" />}
    </div>
    <span className="text-[10px] text-gray-800">{label}</span>
  </label>
)

// --- Footer Component ---
const Footer: React.FC = () => {
  return (
    <div className="mt-auto pt-1 text-center text-[7px] text-gray-600 space-y-0 leading-tight">
      <div className="font-bold uppercase text-black text-[8px]">SAMB'A ASSURANCES GABON S.A.</div>
      <div>Société Anonyme avec Conseil d'Administration et Président Directeur Général.</div>
      <div>
        Entreprise de micro-assurance régie par le Code des Assurances CIMA et agréée par la CRCA sous le N° 0270 / L / CIMA / CRCA / PDT / 2024,
      </div>
      <div>
        et le Ministère de l'Economie et des Participations par l'Arrêté N° 036.24 / MEP, au capital de 610.000.000 de FCFA dont 536.000.000 de FCFA libérés.
      </div>
      <div className="mb-1">
        R.C.C.M : N° GA - LBV - 01 - 2024 - B14 - 00003 | N° STATISTIQUE : 202401003647 R
      </div>
      
      <div className="flex justify-between items-start border-t border-gray-300 pt-0.5 px-2">
        <div className="flex flex-col items-center w-1/3">
          <MapPin size={10} className="mb-0 text-gray-500" />
          <span>326 Rue Jean-Baptiste NDENDE</span>
          <span>Avenue de COINTET | Centre-Ville | Libreville</span>
        </div>
        <div className="flex flex-col items-center w-1/3">
          <Mail size={10} className="mb-0 text-gray-500" />
          <span>B.P : 22 215 | Libreville | Gabon</span>
          <span>Email : infos@samba-assurances.com</span>
        </div>
        <div className="flex flex-col items-center w-1/3">
          <Phone size={10} className="mb-0 text-gray-500" />
          <span>(+241) 060 08 62 62 - 074 40 41 41</span>
          <span>074 40 51 51</span>
        </div>
      </div>
    </div>
  )
}

export const EdgContractCreateOfficial = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const emfId = user?.emf_id || 3 // EDG = 3

  const [formData, setFormData] = useState({
    emf_id: emfId,
    nom_prenom: '',
    adresse_assure: '',
    ville_assure: '',
    telephone_assure: '',
    email_assure: '',
    numero_police: '',
    categorie: '' as 'commercants' | 'salaries_public' | 'salaries_prive' | 'retraites' | 'vip' | 'autre' | '',
    autre_categorie_precision: '',
    montant_pret: '',
    duree_pret_mois: '',
    date_effet: '',
    date_fin_echeance: '',
    beneficiaire_deces: '',
    garantie_prevoyance: true,
    garantie_deces_iad: true,
    garantie_vip: false,
    agence: '',
    lieu_signature: 'Libreville',
    date_signature: new Date().toISOString().split('T')[0]
  })

  const [assuresAssocies, setAssuresAssocies] = useState({
    assure1: { nom: '', prenom: '', date_naissance: '', lieu_naissance: '', contact: '' },
    assure2: { nom: '', prenom: '', date_naissance: '', lieu_naissance: '', contact: '' },
    assure3: { nom: '', prenom: '', date_naissance: '', lieu_naissance: '', contact: '' },
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState('')

  const { mutate: createContract, isPending, isSuccess, isError, error } = useCreateEdgContract()

  // Calculer la date de fin automatiquement
  useEffect(() => {
    if (formData.date_effet && formData.duree_pret_mois) {
      const dateEffet = new Date(formData.date_effet)
      const duree = parseInt(formData.duree_pret_mois) || 0
      dateEffet.setMonth(dateEffet.getMonth() + duree)
      setFormData(prev => ({ ...prev, date_fin_echeance: dateEffet.toISOString().split('T')[0] }))
    }
  }, [formData.date_effet, formData.duree_pret_mois])

  useEffect(() => {
    if (isError && error) {
      const axiosError = error as any
      if (axiosError?.response?.status === 422) {
        const validationErrors = axiosError.response.data.errors || {}
        const newErrors: Record<string, string> = {}
        Object.entries(validationErrors).forEach(([key, messages]) => {
          newErrors[key] = Array.isArray(messages) ? messages[0] : messages as string
        })
        setErrors(newErrors)
        setSubmitError('Veuillez corriger les erreurs dans le formulaire')
      } else {
        setSubmitError('Erreur serveur. Réessayez.')
      }
    }
  }, [isError, error])

  // Calcul cotisation EDG
  // Prévoyance: 25 000 FCFA (prime unique)
  // Décès/IAD Standard: 2,50% du montant du prêt
  // Décès/IAD VIP: 3,50% du montant du prêt
  const montant = parseInt(formData.montant_pret) || 0
  const duree = parseInt(formData.duree_pret_mois) || 0
  const isVip = formData.garantie_vip || formData.categorie === 'vip'
  const cotisationPrevoyance = formData.garantie_prevoyance ? 25000 : 0
  const tauxDeces = isVip ? 0.035 : 0.025 // 3,50% VIP ou 2,50% standard
  const cotisationDeces = formData.garantie_deces_iad ? montant * tauxDeces : 0
  const cotisationTotale = cotisationPrevoyance + cotisationDeces

  // Validation des règles métier EDG
  const montantMaxPretVip = 65000000 // 65.000.000 FCFA pour VIP
  const montantMaxPretStandard = 25000000 // 25.000.000 FCFA pour les autres
  const dureeMaxVip = 36 // 36 mois pour VIP
  const dureeMaxStandard = 60 // 60 mois pour les autres
  // Note: Âge max couverture = 70 ans (vérifié côté backend)

  const validateBusinessRules = () => {
    const warnings: string[] = []
    
    const montantMax = isVip ? montantMaxPretVip : montantMaxPretStandard
    const dureeMax = isVip ? dureeMaxVip : dureeMaxStandard
    
    // Montant max prêt
    if (montant > montantMax) {
      warnings.push(`Montant prêt (${formatCurrency(montant)}) dépasse le max ${isVip ? 'VIP' : 'standard'}: ${formatCurrency(montantMax)}`)
    }
    
    // Durée max
    if (duree > dureeMax) {
      warnings.push(`Durée (${duree} mois) dépasse le max ${isVip ? 'VIP' : 'standard'}: ${dureeMax} mois`)
    }
    
    return warnings
  }

  const businessWarnings = validateBusinessRules()
  const _isContractValid = businessWarnings.length === 0 // Utilisé pour validation

  const categories = [
    { key: 'commercants' as const, label: 'Commerçants' },
    { key: 'salaries_public' as const, label: 'Salariés du public' },
    { key: 'salaries_prive' as const, label: 'Salariés du privé' },
    { key: 'retraites' as const, label: 'Retraités' },
  ]

  const getCategorieLabel = () => {
    if (formData.categorie === 'vip') return 'VIP'
    const cat = categories.find(c => c.key === formData.categorie)
    if (cat) return cat.label
    if (formData.categorie === 'autre' && formData.autre_categorie_precision) {
      return formData.autre_categorie_precision
    }
    return ''
  }

  const categorieLabel = getCategorieLabel()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setSubmitError('')

    try {
      console.log('═══════════════════════════════════════════════════════════════')
      console.log('📋 EDG - Validation des champs obligatoires...')
      
      const newErrors: Record<string, string> = {}
      
      if (!formData.nom_prenom.trim()) {
        newErrors.nom_prenom = 'Le nom et prénom sont obligatoires'
      }
      if (!formData.adresse_assure.trim()) {
        newErrors.adresse_assure = 'L\'adresse est obligatoire'
      }
      if (!formData.ville_assure.trim()) {
        newErrors.ville_assure = 'La ville est obligatoire'
      }
      if (!formData.telephone_assure.trim()) {
        newErrors.telephone_assure = 'Le téléphone est obligatoire'
      }
      if (!formData.montant_pret) {
        newErrors.montant_pret = 'Le montant du prêt est obligatoire'
      }
      if (!formData.duree_pret_mois) {
        newErrors.duree_pret_mois = 'La durée du prêt est obligatoire'
      }
      if (!formData.date_effet) {
        newErrors.date_effet = 'La date d\'effet est obligatoire'
      }
      // Si VIP est coché, pas besoin de catégorie car on utilisera 'commercants' par défaut
      if (!formData.categorie && !formData.garantie_vip) {
        newErrors.categorie = 'Veuillez sélectionner une catégorie'
      }

      if (Object.keys(newErrors).length > 0) {
        console.error('❌ VALIDATION ÉCHOUÉE - Champs manquants:', Object.keys(newErrors))
        setErrors(newErrors)
        setSubmitError(`⚠️ ${Object.keys(newErrors).length} champ(s) obligatoire(s) manquant(s)`)
        return
      }
      
      console.log('✅ Tous les champs obligatoires sont remplis')

      if (businessWarnings.length > 0) {
        console.warn('⚠️ Avertissements règles métier:', businessWarnings)
        const confirmContinue = window.confirm(
          `⚠️ Attention: Le contrat ne respecte pas certaines conditions:\n\n${businessWarnings.join('\n')}\n\nLe contrat sera créé avec le statut "En attente".\n\nContinuer quand même ?`
        )
        if (!confirmContinue) {
          return
        }
      }

      // Construire les assurés associés
      const assuresArray: Array<{
        type_assure: string
        nom: string
        prenom: string
        date_naissance: string
        lieu_naissance: string
        contact?: string
      }> = []
      
      if (assuresAssocies.assure1.nom?.trim() && assuresAssocies.assure1.lieu_naissance?.trim()) {
        assuresArray.push({ 
          type_assure: 'assure_associe_1', 
          nom: assuresAssocies.assure1.nom.trim(),
          prenom: assuresAssocies.assure1.prenom?.trim() || '',
          date_naissance: assuresAssocies.assure1.date_naissance || '',
          lieu_naissance: assuresAssocies.assure1.lieu_naissance.trim(),
          contact: assuresAssocies.assure1.contact?.trim() || ''
        })
      }
      
      if (assuresAssocies.assure2.nom?.trim() && assuresAssocies.assure2.lieu_naissance?.trim()) {
        assuresArray.push({ 
          type_assure: 'assure_associe_2', 
          nom: assuresAssocies.assure2.nom.trim(),
          prenom: assuresAssocies.assure2.prenom?.trim() || '',
          date_naissance: assuresAssocies.assure2.date_naissance || '',
          lieu_naissance: assuresAssocies.assure2.lieu_naissance.trim(),
          contact: assuresAssocies.assure2.contact?.trim() || ''
        })
      }
      
      if (assuresAssocies.assure3.nom?.trim() && assuresAssocies.assure3.lieu_naissance?.trim()) {
        assuresArray.push({ 
          type_assure: 'assure_associe_3', 
          nom: assuresAssocies.assure3.nom.trim(),
          prenom: assuresAssocies.assure3.prenom?.trim() || '',
          date_naissance: assuresAssocies.assure3.date_naissance || '',
          lieu_naissance: assuresAssocies.assure3.lieu_naissance.trim(),
          contact: assuresAssocies.assure3.contact?.trim() || ''
        })
      }

      // Déterminer la catégorie valide (le backend n'accepte pas 'vip' comme catégorie)
      // Si VIP est coché mais pas de catégorie, on met 'commercants' par défaut
      let categorieValide = formData.categorie
      if (categorieValide === 'vip' || !categorieValide) {
        categorieValide = 'commercants' // Catégorie par défaut pour VIP
      }

      const payload = {
        emf_id: Number(formData.emf_id),
        nom_prenom: formData.nom_prenom.trim(),
        adresse_assure: formData.adresse_assure.trim(),
        ville_assure: formData.ville_assure.trim(),
        telephone_assure: formData.telephone_assure.trim(),
        email_assure: formData.email_assure?.trim() || undefined,
        numero_police: formData.numero_police?.trim() || undefined,
        // Le backend attend: 'commercants', 'salaries_public', 'salaries_prive', 'retraites', 'autre'
        categorie: categorieValide as 'commercants' | 'salaries_public' | 'salaries_prive' | 'retraites' | 'autre',
        autre_categorie_precision: formData.autre_categorie_precision?.trim() || undefined,
        // ✅ Le backend attend 'montant_pret_assure' et non 'montant_pret'
        montant_pret_assure: parseInt(formData.montant_pret),
        duree_pret_mois: parseInt(formData.duree_pret_mois),
        date_effet: formData.date_effet,
        beneficiaire_deces: formData.beneficiaire_deces?.trim() || undefined,
        garantie_prevoyance: formData.garantie_prevoyance,
        garantie_deces_iad: formData.garantie_deces_iad,
        // ✅ Le backend attend 'est_vip' (boolean) et non 'garantie_vip'
        est_vip: formData.garantie_vip || formData.categorie === 'vip',
        agence: formData.agence?.trim() || undefined,
        statut: 'actif',
        ...(assuresArray.length > 0 ? { assures_associes: assuresArray } : {})
      }

      console.log('📤 Payload EDG:', JSON.stringify(payload, null, 2))

      createContract(payload, {
        onSuccess: (data) => {
          console.log('✅ Contrat EDG créé avec succès! ID:', data.id || data.data?.id)
          navigate(`/contrats/edg/${data.id || data.data?.id}`, {
            state: { success: 'Contrat créé avec succès !' }
          })
        },
        onError: (error: any) => {
          console.error('❌ Erreur création EDG:', error.response?.data?.message || error.message)
          if (error.response?.status === 422) {
            const validationErrors = error.response.data.errors || {}
            const errorMessages = Object.entries(validationErrors)
              .map(([field, msgs]) => `• ${field}: ${Array.isArray(msgs) ? msgs[0] : msgs}`)
              .join('\n')
            setSubmitError(`❌ Erreurs de validation:\n${errorMessages}`)
          } else {
            setSubmitError(`❌ Erreur: ${error.response?.data?.message || error.message}`)
          }
        }
      })

    } catch (error: any) {
      console.error('💥 ERREUR INATTENDUE:', error)
      setSubmitError(`💥 Erreur inattendue: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-4 px-4">
      {/* Toolbar */}
      <div className="max-w-[210mm] mx-auto mb-4 flex items-center justify-between bg-white rounded-lg shadow p-3">
        <Button variant="ghost" onClick={() => navigate('/contrats/edg')} className="hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 mr-1" />
          Retour à la liste
        </Button>
        <h1 className="text-lg font-bold text-[#F48232]">Nouveau Contrat EDG</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="border-gray-300"
          >
            <Printer className="h-4 w-4 mr-1" />
            Imprimer
          </Button>
        </div>
      </div>

      {/* Messages */}
      {isSuccess && (
        <div className="max-w-[210mm] mx-auto mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-800">
          <CheckCircle className="h-6 w-6" />
          <span>✅ Contrat créé avec succès ! Redirection...</span>
        </div>
      )}

      {submitError && (
        <div className="max-w-[210mm] mx-auto mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-800">
          <AlertCircle className="h-6 w-6" />
          <span className="whitespace-pre-line">{submitError}</span>
        </div>
      )}

      {/* Avertissements règles métier */}
      {businessWarnings.length > 0 && (
        <div className="max-w-[210mm] mx-auto mb-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg text-yellow-800">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5" />
            <span className="font-bold">⚠️ Conditions non respectées</span>
          </div>
          <ul className="list-disc list-inside text-sm space-y-1">
            {businessWarnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      {/* Indicateur de statut prévu */}
      <div className="max-w-[210mm] mx-auto mb-4 flex items-center justify-center gap-2">
        <span className="text-sm text-gray-600">Statut prévu :</span>
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1">
          <CheckCircle className="h-4 w-4" /> Actif
        </span>
        {isVip && (
          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
            Client VIP
          </span>
        )}
      </div>

      {/* Formulaire style contrat officiel */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white w-[210mm] min-h-[297mm] p-[6mm] shadow-xl relative flex flex-col mx-auto">
          
          {/* Header */}
          <div className="flex flex-col items-center mb-2">
            <div className="mb-0">
              <img src={logoSamba} alt="SAMB'A Assurances" className="h-[85px] w-auto" />
            </div>
            <h1 className="text-[#F48232] text-base font-bold uppercase text-center leading-none mt-1">
              Contrat Prévoyance Crédits EDG
            </h1>
            <p className="text-[8px] text-gray-500">Contrat régi par les dispositions du Code des assurances CIMA</p>
            <div className="text-[9px] font-bold text-gray-700 leading-tight">
              Visas DNA N°005/24 et N°008/24 - Convention N° : 501/111.112/0624
            </div>
            <h2 className="text-[#F48232] text-sm font-bold uppercase mt-1">
              Conditions Particulières
            </h2>
          </div>

          {/* Form Body - Table Structure */}
          <div className="border border-[#F48232] w-full flex flex-col text-[10px]">
            
            {/* Section: Couverture */}
            <div className="flex border-b border-[#F48232]">
              <div className="w-28 flex-shrink-0 p-1.5 bg-orange-50 italic border-r border-[#F48232] flex items-center text-xs">
                Couverture
              </div>
              <div className="flex-grow p-1.5 grid grid-cols-2 gap-x-4 gap-y-1">
                <FormInput 
                  label="Montant du prêt assuré :" 
                  value={formData.montant_pret}
                  onChange={(v) => setFormData({...formData, montant_pret: v})}
                  type="number"
                  placeholder="Ex: 10000000"
                  required
                  error={errors.montant_pret}
                />
                <FormInput 
                  label="Durée du prêt :" 
                  value={formData.duree_pret_mois}
                  onChange={(v) => setFormData({...formData, duree_pret_mois: v})}
                  type="number"
                  placeholder="Ex: 24"
                  required
                  error={errors.duree_pret_mois}
                />
                <FormInput 
                  label="Date d'effet :" 
                  value={formData.date_effet}
                  onChange={(v) => setFormData({...formData, date_effet: v})}
                  type="date"
                  required
                  error={errors.date_effet}
                />
                <FormInput 
                  label="Date de fin d'échéance :" 
                  value={formData.date_fin_echeance}
                  disabled
                />
              </div>
            </div>

            {/* Section: Assuré principal */}
            <div className="flex border-b border-[#F48232]">
              <div className="w-28 flex-shrink-0 p-1.5 bg-orange-50 italic border-r border-[#F48232] flex flex-col justify-center text-xs">
                Assuré principal<br/>
                <span className="text-[9px] not-italic">Personne assurée</span>
              </div>
              <div className="flex-grow p-1.5 space-y-1">
                <FormInput 
                  label="Nom & Prénom :" 
                  value={formData.nom_prenom}
                  onChange={(v) => setFormData({...formData, nom_prenom: v})}
                  placeholder="Ex: Jean NGUEMA"
                  required
                  error={errors.nom_prenom}
                />
                <FormInput 
                  label="Adresse :" 
                  value={formData.adresse_assure}
                  onChange={(v) => setFormData({...formData, adresse_assure: v})}
                  placeholder="Ex: Quartier Louis"
                  required
                  error={errors.adresse_assure}
                />
                <div className="flex gap-2">
                  <FormInput 
                    label="Téléphone :" 
                    value={formData.telephone_assure}
                    onChange={(v) => setFormData({...formData, telephone_assure: v})}
                    placeholder="Ex: 06 12 34 56"
                    required
                    error={errors.telephone_assure}
                  />
                  <FormInput 
                    label="Ville :" 
                    value={formData.ville_assure}
                    onChange={(v) => setFormData({...formData, ville_assure: v})}
                    placeholder="Ex: Libreville"
                    required
                    error={errors.ville_assure}
                  />
                  <FormInput 
                    label="Email:" 
                    value={formData.email_assure}
                    onChange={(v) => setFormData({...formData, email_assure: v})}
                    placeholder="Ex: email@example.com"
                    type="email"
                  />
                </div>
                <div className="flex flex-wrap items-center mt-1 gap-y-1">
                  <span className="mr-1 text-xs">Catégorie{errors.categorie && <span className="text-red-500">*</span>} :</span>
                  {categories.map(cat => (
                    <Checkbox 
                      key={cat.key} 
                      label={cat.label} 
                      checked={formData.categorie === cat.key}
                      onChange={() => setFormData({...formData, categorie: cat.key, garantie_vip: false})}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  <Checkbox 
                    label="Autre à préciser :" 
                    checked={formData.categorie === 'autre'}
                    onChange={() => setFormData({...formData, categorie: 'autre', garantie_vip: false})}
                  />
                  <input
                    type="text"
                    value={formData.autre_categorie_precision}
                    onChange={(e) => setFormData({...formData, autre_categorie_precision: e.target.value})}
                    className="border-b border-gray-400 w-32 text-xs font-semibold bg-transparent focus:outline-none focus:border-[#F48232]"
                    disabled={formData.categorie !== 'autre'}
                  />
                </div>
                {/* Affichage catégorie sélectionnée */}
                {categorieLabel && (
                  <div className="text-xs font-bold text-[#F48232] print:block hidden">
                    → Catégorie sélectionnée : {categorieLabel}
                  </div>
                )}
              </div>
            </div>

            {/* Section: Souscripteur / EMF */}
            <div className="flex border-b border-[#F48232]">
              <div className="w-28 flex-shrink-0 p-1.5 bg-orange-50 italic border-r border-[#F48232] flex items-center text-xs">
                Souscripteur / EMF
              </div>
              <div className="flex-grow p-1.5 space-y-1">
                <div className="flex items-end">
                  <span className="mr-1 whitespace-nowrap text-xs text-gray-800">Raison sociale :</span>
                  <span className="font-bold text-xs">EPARGNE ET DEVELOPPEMENT DU GABON « EDG »</span>
                </div>
                <div className="flex gap-2">
                  <div className="flex items-end flex-grow">
                    <span className="mr-1 whitespace-nowrap text-xs">Adresse :</span>
                    <span className="font-bold mr-2 text-xs">B.P. 14.736 Libreville - Gabon</span>
                  </div>
                  <FormInput 
                    label="Agence :" 
                    value={formData.agence}
                    onChange={(v) => setFormData({...formData, agence: v})}
                    placeholder="Ex: Agence Centre"
                    className="w-32"
                  />
                </div>
                <div className="flex items-end">
                  <span className="mr-1 text-xs">Téléphone :</span>
                  <span className="font-bold text-xs mr-4">065 08 05 69 / 65 02 81 97</span>
                  <span className="mr-1 text-xs">Email :</span>
                  <span className="font-bold text-xs">service.clientele@edgmfgabon.com</span>
                </div>
              </div>
            </div>

            {/* Section: Assurés associés */}
            <div className="flex border-b border-[#F48232]">
              <div className="w-28 flex-shrink-0 p-1.5 bg-orange-50 italic border-r border-[#F48232] flex items-center text-xs">
                Assurés associés
              </div>
              <div className="flex-grow">
                <table className="w-full text-left text-[10px] border-collapse">
                  <thead>
                    <tr className="bg-orange-100 font-bold text-center">
                      <th className="border-b border-r border-[#F48232] p-0.5 w-24">Assurés</th>
                      <th className="border-b border-r border-[#F48232] p-0.5">Nom</th>
                      <th className="border-b border-r border-[#F48232] p-0.5">Prénom</th>
                      <th className="border-b border-r border-[#F48232] p-0.5 w-20">Date naissance</th>
                      <th className="border-b border-r border-[#F48232] p-0.5 w-16">Lieu naissance</th>
                      <th className="border-b border-[#F48232] p-0.5 w-24">Contact & Adresse</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(['assure1', 'assure2', 'assure3'] as const).map((assureKey, idx) => (
                      <tr key={assureKey} className="h-6">
                        <td className="border-b border-r border-[#F48232] p-0.5 font-bold bg-orange-50/50">Assuré associé {idx + 1}</td>
                        <td className="border-b border-r border-[#F48232] p-0">
                          <input 
                            type="text" 
                            value={assuresAssocies[assureKey].nom}
                            onChange={(e) => setAssuresAssocies({...assuresAssocies, [assureKey]: {...assuresAssocies[assureKey], nom: e.target.value}})}
                            className="w-full h-full px-1 text-[10px] font-semibold bg-transparent border-0 focus:outline-none focus:bg-orange-50"
                          />
                        </td>
                        <td className="border-b border-r border-[#F48232] p-0">
                          <input 
                            type="text" 
                            value={assuresAssocies[assureKey].prenom}
                            onChange={(e) => setAssuresAssocies({...assuresAssocies, [assureKey]: {...assuresAssocies[assureKey], prenom: e.target.value}})}
                            className="w-full h-full px-1 text-[10px] font-semibold bg-transparent border-0 focus:outline-none focus:bg-orange-50"
                          />
                        </td>
                        <td className="border-b border-r border-[#F48232] p-0">
                          <input 
                            type="date" 
                            value={assuresAssocies[assureKey].date_naissance}
                            onChange={(e) => setAssuresAssocies({...assuresAssocies, [assureKey]: {...assuresAssocies[assureKey], date_naissance: e.target.value}})}
                            className="w-full h-full px-1 text-[10px] font-semibold bg-transparent border-0 focus:outline-none focus:bg-orange-50"
                          />
                        </td>
                        <td className="border-b border-r border-[#F48232] p-0">
                          <input 
                            type="text" 
                            value={assuresAssocies[assureKey].lieu_naissance}
                            onChange={(e) => setAssuresAssocies({...assuresAssocies, [assureKey]: {...assuresAssocies[assureKey], lieu_naissance: e.target.value}})}
                            className="w-full h-full px-1 text-[10px] font-semibold bg-transparent border-0 focus:outline-none focus:bg-orange-50"
                          />
                        </td>
                        <td className="border-b border-[#F48232] p-0">
                          <input 
                            type="text" 
                            value={assuresAssocies[assureKey].contact}
                            onChange={(e) => setAssuresAssocies({...assuresAssocies, [assureKey]: {...assuresAssocies[assureKey], contact: e.target.value}})}
                            className="w-full h-full px-1 text-[9px] font-semibold bg-transparent border-0 focus:outline-none focus:bg-orange-50"
                          />
                        </td>
                      </tr>
                    ))}
                    {/* Bénéficiaire décès */}
                    <tr className="h-7">
                      <td colSpan={6} className="p-1.5">
                        <div className="flex items-end">
                          <span className="font-bold text-xs mr-2 whitespace-nowrap">Bénéficiaire en cas de décès de l'Assuré principal :</span>
                          <input 
                            type="text" 
                            value={formData.beneficiaire_deces}
                            onChange={(e) => setFormData({...formData, beneficiaire_deces: e.target.value})}
                            placeholder="Nom et coordonnées du bénéficiaire"
                            className="flex-grow border-b border-gray-400 text-[10px] font-semibold bg-transparent focus:outline-none focus:border-[#F48232]"
                          />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section: Garanties */}
            <div className="flex border-b border-[#F48232]">
              <div className="w-28 flex-shrink-0 p-1.5 bg-orange-50 italic border-r border-[#F48232] flex items-center text-xs">
                Garanties
              </div>
              <div className="flex-grow">
                <table className="w-full text-center text-[10px] border-collapse">
                  <thead>
                    <tr className="border-b border-[#F48232] font-bold bg-orange-100">
                      <th className="p-1 w-[40%] text-left pl-2">Protections</th>
                      <th className="border-l border-r border-[#F48232] p-1 w-[20%]">Type de cible</th>
                      <th className="border-r border-[#F48232] p-1 w-[10%]">Option</th>
                      <th className="border-r border-[#F48232] p-1 w-[10%]">Taux</th>
                      <th className="p-1 w-[20%]">Prime unique</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Prévoyance */}
                    <tr className={`border-b border-[#F48232] ${formData.garantie_prevoyance ? 'bg-orange-50' : ''}`}>
                      <td className="p-1 text-left pl-2 font-medium bg-gray-100">Prévoyance</td>
                      <td className="border-l border-r border-[#F48232] p-1 text-[#F48232]">Toute catégorie</td>
                      <td className="border-r border-[#F48232] p-1">
                        <div className="flex justify-center">
                          <label className="cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={formData.garantie_prevoyance}
                              onChange={(e) => setFormData({...formData, garantie_prevoyance: e.target.checked})}
                              className="sr-only"
                            />
                            <div className={`w-6 h-4 border border-black rounded-sm ${formData.garantie_prevoyance ? 'bg-black' : 'bg-white hover:bg-gray-100'}`}></div>
                          </label>
                        </div>
                      </td>
                      <td className="border-r border-[#F48232] p-1 text-[#F48232]">N/A</td>
                      <td className="p-1 text-[#F48232] font-bold">25 000 FCFA</td>
                    </tr>
                    {/* Assurance Crédits Décès/IAD Standard */}
                    <tr className={`border-b border-[#F48232] ${formData.garantie_deces_iad && !isVip ? 'bg-orange-50' : ''}`}>
                      <td className="p-1 text-left pl-2 font-medium bg-gray-100">Assurance Crédits Décès/IAD</td>
                      <td className="border-l border-r border-[#F48232] p-1 text-[#F48232]">Toute catégorie</td>
                      <td className="border-r border-[#F48232] p-1">
                        <div className="flex justify-center">
                          <label className="cursor-pointer">
                            <input 
                              type="radio" 
                              name="type_contrat"
                              checked={formData.garantie_deces_iad && !formData.garantie_vip}
                              onChange={() => setFormData({...formData, garantie_deces_iad: true, garantie_vip: false, categorie: formData.categorie === 'vip' ? '' : formData.categorie})}
                              className="sr-only"
                            />
                            <div className={`w-6 h-4 border border-black rounded-sm ${formData.garantie_deces_iad && !formData.garantie_vip ? 'bg-black' : 'bg-white hover:bg-gray-100'}`}></div>
                          </label>
                        </div>
                      </td>
                      <td className="border-r border-[#F48232] p-1 text-[#F48232] font-bold">2,50%</td>
                      <td className="p-1 text-[#F48232]">N/A</td>
                    </tr>
                    {/* Assurance Crédits Décès/IAD VIP */}
                    <tr className={`${formData.garantie_vip ? 'bg-orange-50' : ''}`}>
                      <td className="p-1 text-left pl-2 font-medium bg-gray-100">Assurance Crédits Décès/IAD - VIP</td>
                      <td className="border-l border-r border-[#F48232] p-1 text-[#F48232] font-bold">VIP</td>
                      <td className="border-r border-[#F48232] p-1">
                        <div className="flex justify-center">
                          <label className="cursor-pointer">
                            <input 
                              type="radio" 
                              name="type_contrat"
                              checked={formData.garantie_vip}
                              onChange={() => setFormData({...formData, garantie_deces_iad: true, garantie_vip: true, categorie: 'vip'})}
                              className="sr-only"
                            />
                            <div className={`w-6 h-4 border border-black rounded-sm ${formData.garantie_vip ? 'bg-black' : 'bg-white hover:bg-gray-100'}`}></div>
                          </label>
                        </div>
                      </td>
                      <td className="border-r border-[#F48232] p-1 text-[#F48232] font-bold">3,50%</td>
                      <td className="p-1 text-[#F48232]">N/A</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section: Cotisations */}
            <div className="flex bg-orange-50/50">
              <div className="w-28 flex-shrink-0 p-1.5 bg-orange-50 italic border-r border-[#F48232] flex items-center text-xs">
                Cotisations
              </div>
              <div className="flex-grow p-2">
                <div className="font-bold flex items-end">
                  <span className="text-xs">Cotisation totale :</span>
                  <span className="flex-grow mx-2 border-b-2 border-black text-center font-extrabold text-[#F48232] text-base">
                    {cotisationTotale > 0 ? formatCurrency(cotisationTotale) : '___________'}
                  </span>
                  <span className="text-[10px]">FCFA TTC (Montant prêt x taux) + Cotisation Prévoyance</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footnotes */}
          <div className="mt-2 space-y-0.5 text-[9px] text-black font-bold">
            <p>(1) La Prévoyance est d'un capital maximal de 1.000.000 FCFA, soit FCFA 250.000 par assuré.</p>
            <p>(2) Le montant maximal du prêt couvert est de 65.000.000 FCFA pour les VIP et de 25.000.000 FCFA pour les autres catégories.</p>
            <p>(3) La durée maximale de couverture est de 36 mois pour les VIP et de 60 mois pour les autres catégories.</p>
            <p>(4) Âge maximum de couverture : 70 ans.</p>
          </div>

          {/* Signatures */}
          <div className="mt-auto mb-2">
            <div className="text-right mb-2 pr-8 font-medium text-[10px]">
              Fait à <input 
                type="text" 
                value={formData.lieu_signature}
                onChange={(e) => setFormData({...formData, lieu_signature: e.target.value})}
                className="border-b border-black px-2 mx-1 font-semibold bg-transparent focus:outline-none focus:border-[#F48232] w-24"
              />, 
              le <input 
                type="date" 
                value={formData.date_signature}
                onChange={(e) => setFormData({...formData, date_signature: e.target.value})}
                className="border-b border-black px-2 mx-1 font-semibold bg-transparent focus:outline-none focus:border-[#F48232]"
              />
            </div>

            <div className="flex justify-between px-4">
              <div className="w-[30%]">
                <div className="mb-1 font-bold text-xs">L'Assuré</div>
                <div className="border border-black h-16 p-0.5 text-gray-300 font-bold text-center flex items-center justify-center text-[9px] bg-white shadow-sm">
                  Signature
                </div>
              </div>

              <div className="w-[35%] flex flex-col items-center justify-end pb-2 font-bold text-[9px] space-y-0.5">
                <div className="flex gap-6">
                  <span>Feuillet 1 : Assuré</span>
                  <span>Feuillet 2 : EDG</span>
                </div>
                <div className="flex gap-6">
                  <span>Feuillet 3 : SAMB'A</span>
                  <span>Feuillet 4 : Souche</span>
                </div>
              </div>

              <div className="w-[30%]">
                <div className="mb-1 font-bold text-xs text-right">Le Souscripteur EDG P/C L'Assureur</div>
                <div className="border border-black h-16 p-0.5 text-gray-300 font-bold text-center flex items-center justify-center text-[9px] bg-white shadow-sm">
                  Signature et cachet
                </div>
              </div>
            </div>
          </div>

          <Footer />
        </div>

        {/* Bouton de soumission en dehors du "PDF" */}
        <div className="max-w-[210mm] mx-auto mt-6 flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/contrats/edg')}
            className="flex-1"
            disabled={isPending}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="flex-1 bg-[#F48232] hover:bg-[#e0742a] text-white font-semibold text-lg py-3"
          >
            {isPending ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Création en cours...</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Créer le Contrat EDG
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default EdgContractCreateOfficial
