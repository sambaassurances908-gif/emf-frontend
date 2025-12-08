// src/features/contrats/bamboo/BambooContractCreateOfficial.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, CheckCircle, AlertCircle, Mail, Phone, MapPin, Printer } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { useCreateBambooContract } from '@/hooks/useBambooContracts'
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

export const BambooContractCreateOfficial = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const emfId = user?.emf_id || 1 // BAMBOO = 1

  const [formData, setFormData] = useState({
    emf_id: emfId,
    nom_prenom: '',
    adresse_assure: '',
    ville_assure: '',
    telephone_assure: '',
    email_assure: '',
    numero_police: '',
    categorie: '' as 'commercants' | 'salaries_public' | 'salaries_prive' | 'retraites' | 'autre' | '',
    autre_categorie_precision: '',
    montant_pret_assure: '',
    duree_pret_mois: '',
    date_effet: '',
    date_fin_echeance: '',
    beneficiaire_prevoyance: '',
    garantie_prevoyance_deces_iad: true,
    garantie_deces_iad: true,
    garantie_perte_emploi: false,
    type_contrat_travail: '' as 'cdi' | 'cdd_plus_9_mois' | 'cdd_moins_9_mois' | 'non_applicable' | '',
    agence: '',
    lieu_signature: 'Libreville',
    date_signature: new Date().toISOString().split('T')[0]
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState('')

  const { mutate: createContract, isPending, isSuccess, isError, error } = useCreateBambooContract()

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
    const axiosError = error as any
    if (isError && axiosError?.response?.status === 422) {
      const validationErrors = axiosError.response.data.errors || {}
      const newErrors: Record<string, string> = {}
      Object.entries(validationErrors).forEach(([key, messages]) => {
        newErrors[key] = Array.isArray(messages) ? messages[0] : messages as string
      })
      setErrors(newErrors)
      setSubmitError('Veuillez corriger les erreurs dans le formulaire')
    } else if (isError) {
      setSubmitError('Erreur serveur. Réessayez.')
    }
  }, [isError, error])

  // Calcul cotisation BAMBOO
  // Prévoyance: 10 000 FCFA (prime unique)
  // Décès/IAD: 1,00% du montant du prêt
  // Perte d'emploi: 1,50% du montant du prêt (optionnel)
  const montant = parseInt(formData.montant_pret_assure) || 0
  const duree = parseInt(formData.duree_pret_mois) || 0
  const cotisationPrevoyance = formData.garantie_prevoyance_deces_iad ? 10000 : 0
  const tauxDeces = 0.01 // 1,00%
  const tauxPerteEmploi = formData.garantie_perte_emploi ? 0.015 : 0 // 1,50%
  const cotisationDeces = montant * tauxDeces
  const cotisationPerteEmploi = montant * tauxPerteEmploi
  const cotisationTotale = cotisationPrevoyance + cotisationDeces + cotisationPerteEmploi

  // Validation des règles métier BAMBOO
  const montantMaxPret = 5000000 // 5.000.000 FCFA
  const dureeMaxPret = 48 // 48 mois
  const montantMaxPerteEmploi = 2500000 // 2.500.000 FCFA

  const validateBusinessRules = () => {
    const warnings: string[] = []
    
    // Montant max prêt
    if (montant > montantMaxPret) {
      warnings.push(`Montant prêt (${formatCurrency(montant)}) dépasse le max: ${formatCurrency(montantMaxPret)}`)
    }
    
    // Durée max
    if (duree > dureeMaxPret) {
      warnings.push(`Durée (${duree} mois) dépasse le max: ${dureeMaxPret} mois`)
    }
    
    // Perte d'emploi: montant max
    if (formData.garantie_perte_emploi && montant > montantMaxPerteEmploi) {
      warnings.push(`Perte d'emploi: montant (${formatCurrency(montant)}) dépasse max: ${formatCurrency(montantMaxPerteEmploi)}`)
    }
    
    return warnings
  }

  const businessWarnings = validateBusinessRules()

  const categories = [
    { key: 'commercants' as const, label: 'Commerçants' },
    { key: 'salaries_public' as const, label: 'Salariés du public' },
    { key: 'salaries_prive' as const, label: 'Salariés du privé' },
    { key: 'retraites' as const, label: 'Retraités' },
  ]

  const getCategorieLabel = () => {
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
      console.log('📋 BAMBOO - Validation des champs obligatoires...')
      
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
      if (!formData.montant_pret_assure) {
        newErrors.montant_pret_assure = 'Le montant du prêt est obligatoire'
      }
      if (!formData.duree_pret_mois) {
        newErrors.duree_pret_mois = 'La durée du prêt est obligatoire'
      }
      if (!formData.date_effet) {
        newErrors.date_effet = 'La date d\'effet est obligatoire'
      }
      if (!formData.categorie) {
        newErrors.categorie = 'Veuillez sélectionner une catégorie'
      }
      if (!formData.type_contrat_travail) {
        newErrors.type_contrat_travail = 'Veuillez sélectionner un type de contrat de travail'
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

      const payload = {
        emf_id: Number(formData.emf_id),
        nom_prenom: formData.nom_prenom.trim(),
        adresse_assure: formData.adresse_assure.trim(),
        ville_assure: formData.ville_assure.trim(),
        telephone_assure: formData.telephone_assure.trim(),
        email_assure: formData.email_assure?.trim() || undefined,
        numero_police: formData.numero_police?.trim() || undefined,
        categorie: formData.categorie as 'commercants' | 'salaries_public' | 'salaries_prive' | 'retraites' | 'autre',
        autre_categorie_precision: formData.autre_categorie_precision?.trim() || undefined,
        montant_pret_assure: parseInt(formData.montant_pret_assure),
        duree_pret_mois: parseInt(formData.duree_pret_mois),
        date_effet: formData.date_effet,
        beneficiaire_prevoyance: formData.beneficiaire_prevoyance?.trim() || undefined,
        garantie_prevoyance: formData.garantie_prevoyance_deces_iad ? 1 : 0,
        garantie_prevoyance_deces_iad: formData.garantie_prevoyance_deces_iad ? 1 : 0,
        garantie_deces_iad: formData.garantie_deces_iad ? 1 : 0,
        garantie_perte_emploi: formData.garantie_perte_emploi ? 1 : 0,
        type_contrat_travail: formData.type_contrat_travail,
        agence: formData.agence?.trim() || undefined,
        statut: 'actif',
      }

      console.log('📤 Payload BAMBOO:', JSON.stringify(payload, null, 2))

      createContract(payload as any, {
        onSuccess: (data: any) => {
          console.log('✅ Contrat BAMBOO créé avec succès! ID:', data.id || data.data?.id)
          navigate(`/contrats/bamboo/${data.id || data.data?.id}`, {
            state: { success: 'Contrat créé avec succès !' }
          })
        },
        onError: (error: any) => {
          console.error('❌ Erreur création BAMBOO:', error.response?.data?.message || error.message)
          console.error('❌ Détails erreur:', JSON.stringify(error.response?.data, null, 2))
          if (error.response?.status === 422) {
            const validationErrors = error.response.data.errors || {}
            console.error('❌ Erreurs de validation backend:', validationErrors)
            const errorMessages = Object.entries(validationErrors)
              .map(([field, msgs]) => `• ${field}: ${Array.isArray(msgs) ? msgs[0] : msgs}`)
              .join('\n')
            setSubmitError(`❌ Erreurs de validation:\n${errorMessages || error.response?.data?.message || 'Erreur inconnue'}`)
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
        <Button variant="ghost" onClick={() => navigate('/contrats/bamboo')} className="hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 mr-1" />
          Retour à la liste
        </Button>
        <h1 className="text-lg font-bold text-[#F48232]">Nouveau Contrat BAMBOO-EMF</h1>
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
              Contrat Prévoyance & Crédits BAMBOO-EMF
            </h1>
            <p className="text-[8px] text-gray-500">Contrat régi par les dispositions du Code des assurances CIMA</p>
            <div className="text-[9px] font-bold text-gray-700 leading-tight">
              Visas DNA N°005/24 et N°008/24 - Convention N° : 511/111.701/0325
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
                  value={formData.montant_pret_assure}
                  onChange={(v) => setFormData({...formData, montant_pret_assure: v})}
                  type="number"
                  placeholder="Ex: 2000000"
                  required
                  error={errors.montant_pret_assure}
                />
                <FormInput 
                  label="Durée du prêt :" 
                  value={formData.duree_pret_mois}
                  onChange={(v) => setFormData({...formData, duree_pret_mois: v})}
                  type="number"
                  placeholder="Ex: 12"
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

            {/* Section: Assuré/Emprunteur */}
            <div className="flex border-b border-[#F48232]">
              <div className="w-28 flex-shrink-0 p-1.5 bg-orange-50 italic border-r border-[#F48232] flex flex-col justify-center text-xs">
                Assuré/Emprunteur
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
                <div className="flex gap-2">
                  <FormInput 
                    label="Adresse :" 
                    value={formData.adresse_assure}
                    onChange={(v) => setFormData({...formData, adresse_assure: v})}
                    placeholder="Ex: Quartier Louis"
                    required
                    error={errors.adresse_assure}
                    className="flex-grow-[2]"
                  />
                  <FormInput 
                    label="Ville :" 
                    value={formData.ville_assure}
                    onChange={(v) => setFormData({...formData, ville_assure: v})}
                    placeholder="Ex: Libreville"
                    required
                    error={errors.ville_assure}
                    className="flex-grow-[1]"
                  />
                </div>
                <div className="flex gap-2">
                  <FormInput 
                    label="Téléphone :" 
                    value={formData.telephone_assure}
                    onChange={(v) => setFormData({...formData, telephone_assure: v})}
                    placeholder="Ex: 06 12 34 56"
                    required
                    error={errors.telephone_assure}
                    className="flex-grow-[1]"
                  />
                  <FormInput 
                    label="Email:" 
                    value={formData.email_assure}
                    onChange={(v) => setFormData({...formData, email_assure: v})}
                    placeholder="Ex: email@example.com"
                    type="email"
                    className="flex-grow-[2]"
                  />
                </div>
                <div className="flex flex-wrap items-center mt-1 gap-y-1">
                  <span className="mr-1 text-xs">Catégorie{errors.categorie && <span className="text-red-500">*</span>} :</span>
                  {categories.map(cat => (
                    <Checkbox 
                      key={cat.key} 
                      label={cat.label} 
                      checked={formData.categorie === cat.key}
                      onChange={() => setFormData({...formData, categorie: cat.key})}
                    />
                  ))}
                  <div className="flex items-center ml-1">
                    <Checkbox 
                      label="Autre à préciser :" 
                      checked={formData.categorie === 'autre'}
                      onChange={() => setFormData({...formData, categorie: 'autre'})}
                    />
                    <input
                      type="text"
                      value={formData.autre_categorie_precision}
                      onChange={(e) => setFormData({...formData, autre_categorie_precision: e.target.value})}
                      className="border-b border-gray-400 w-24 ml-1 text-xs font-semibold bg-transparent focus:outline-none focus:border-[#F48232]"
                      disabled={formData.categorie !== 'autre'}
                    />
                  </div>
                </div>
                {/* Affichage catégorie sélectionnée */}
                {categorieLabel && (
                  <div className="text-xs font-bold text-[#F48232] print:block hidden">
                    → Catégorie sélectionnée : {categorieLabel}
                  </div>
                )}
                {/* Type de contrat de travail */}
                <div className="flex flex-wrap items-center mt-1 gap-y-1">
                  <span className="mr-1 text-xs">Type de contrat de travail{errors.type_contrat_travail && <span className="text-red-500">*</span>} :</span>
                  <Checkbox 
                    label="CDI" 
                    checked={formData.type_contrat_travail === 'cdi'}
                    onChange={() => setFormData({...formData, type_contrat_travail: 'cdi'})}
                  />
                  <Checkbox 
                    label="CDD > 9 mois" 
                    checked={formData.type_contrat_travail === 'cdd_plus_9_mois'}
                    onChange={() => setFormData({...formData, type_contrat_travail: 'cdd_plus_9_mois'})}
                  />
                  <Checkbox 
                    label="CDD < 9 mois" 
                    checked={formData.type_contrat_travail === 'cdd_moins_9_mois'}
                    onChange={() => setFormData({...formData, type_contrat_travail: 'cdd_moins_9_mois'})}
                  />
                  <Checkbox 
                    label="Non applicable" 
                    checked={formData.type_contrat_travail === 'non_applicable'}
                    onChange={() => setFormData({...formData, type_contrat_travail: 'non_applicable'})}
                  />
                </div>
                {/* Bénéficiaire Prévoyance */}
                <div className="mt-2 pt-2 border-t border-dashed border-gray-300">
                  <FormInput 
                    label="Bénéficiaire de la garantie Prévoyance :" 
                    value={formData.beneficiaire_prevoyance}
                    onChange={(v) => setFormData({...formData, beneficiaire_prevoyance: v})}
                    placeholder="Ex: Marie NGUEMA (épouse)"
                  />
                </div>
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
                  <span className="font-bold text-xs">BAMBOO-EMF</span>
                </div>
                <div className="flex gap-2">
                  <div className="flex items-end flex-grow">
                    <span className="mr-1 whitespace-nowrap text-xs">Adresse :</span>
                    <span className="font-bold mr-2 text-xs">B.P. 16.100, Boulevard Triomphal</span>
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
                  <span className="mr-1 text-xs">Ville :</span>
                  <span className="font-bold text-xs mr-4">Libreville – Gabon</span>
                  <span className="mr-1 text-xs">Téléphone :</span>
                  <span className="font-bold text-xs mr-4">60 41 21 21 / 77 41 21 21</span>
                  <span className="mr-1 text-xs">Email :</span>
                  <span className="font-bold text-xs">service.client@bamboo-emf.com</span>
                </div>
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
                      <th className="p-1 w-[40%] text-left pl-2"></th>
                      <th className="border-l border-r border-[#F48232] p-1 w-[20%]">Type de cible</th>
                      <th className="border-r border-[#F48232] p-1 w-[10%]">Option</th>
                      <th className="border-r border-[#F48232] p-1 w-[10%]">Taux</th>
                      <th className="p-1 w-[20%]">Prime unique</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Prévoyance Décès - IAD */}
                    <tr className={`border-b border-[#F48232] ${formData.garantie_prevoyance_deces_iad ? 'bg-orange-50' : ''}`}>
                      <td className="p-1 text-left pl-2 font-medium bg-gray-100">Prévoyance Décès - IAD</td>
                      <td className="border-l border-r border-[#F48232] p-1 text-[#F48232]">Toute catégorie</td>
                      <td className="border-r border-[#F48232] p-1">
                        <div className="flex justify-center">
                          <label className="cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={formData.garantie_prevoyance_deces_iad}
                              onChange={(e) => setFormData({...formData, garantie_prevoyance_deces_iad: e.target.checked})}
                              className="sr-only"
                            />
                            <div className={`w-6 h-4 border border-black ${formData.garantie_prevoyance_deces_iad ? 'bg-black' : 'bg-white hover:bg-gray-100'}`}></div>
                          </label>
                        </div>
                      </td>
                      <td className="border-r border-[#F48232] p-1 bg-gray-200 text-gray-500">N/A</td>
                      <td className="p-1 text-[#F48232] font-bold">10 000 FCFA</td>
                    </tr>
                    {/* Décès – IAD */}
                    <tr className={`border-b border-[#F48232] ${formData.garantie_deces_iad ? 'bg-orange-50' : ''}`}>
                      <td className="p-1 text-left pl-2 font-medium bg-gray-100">Décès – Invalidité Absolue et Définitive (IAD)</td>
                      <td className="border-l border-r border-[#F48232] p-1 text-[#F48232]">Toute catégorie</td>
                      <td className="border-r border-[#F48232] p-1">
                        <div className="flex justify-center">
                          <label className="cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={formData.garantie_deces_iad}
                              onChange={(e) => setFormData({...formData, garantie_deces_iad: e.target.checked})}
                              className="sr-only"
                            />
                            <div className={`w-6 h-4 border border-black ${formData.garantie_deces_iad ? 'bg-black' : 'bg-white hover:bg-gray-100'}`}></div>
                          </label>
                        </div>
                      </td>
                      <td className="border-r border-[#F48232] p-1 text-[#F48232] font-bold">1,00%</td>
                      <td className="p-1 bg-gray-200 text-gray-500">N/A</td>
                    </tr>
                    {/* Perte d'emploi */}
                    <tr className={`${formData.garantie_perte_emploi ? 'bg-orange-50' : ''}`}>
                      <td className="p-1 text-left pl-2 font-medium bg-gray-100">Perte d'emploi ou d'activités (garantie optionnelle)</td>
                      <td className="border-l border-r border-[#F48232] p-1 text-[#F48232] leading-tight">Salariés du Privé<br/>& Commerçants</td>
                      <td className="border-r border-[#F48232] p-1">
                        <div className="flex justify-center">
                          <label className="cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={formData.garantie_perte_emploi}
                              onChange={(e) => setFormData({...formData, garantie_perte_emploi: e.target.checked})}
                              className="sr-only"
                            />
                            <div className={`w-6 h-4 border border-black ${formData.garantie_perte_emploi ? 'bg-black' : 'bg-white hover:bg-gray-100'}`}></div>
                          </label>
                        </div>
                      </td>
                      <td className="border-r border-[#F48232] p-1 text-[#F48232] font-bold">1,50%</td>
                      <td className="p-1 bg-gray-200 text-gray-500">N/A</td>
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
                  <span className="text-[10px]">FCFA TTC (Montant prêt x taux) + 10.000 FCFA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footnotes */}
          <div className="mt-2 space-y-0.5 text-[9px] text-black font-bold">
            <p>(1) La Prévoyance est d'un montant maximal de 250.000 FCFA et pour une durée égale à la durée du prêt accordé à l'Assuré.</p>
            <p>(2) Le montant maximal du prêt couvert est de FCFA 5.000.000 pour une durée de 48 mois.</p>
            <p>(3) La durée maximale d'indemnisation pour la garantie Perte d'emploi ou d'Activités est de 06 mois pour un montant maximal de couverture de FCFA 2.500.000.</p>
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
                <div className="mb-1 font-bold text-xs">Le Souscripteur</div>
                <div className="border border-black h-16 p-0.5 text-gray-300 font-bold text-center flex items-center justify-center text-[9px] bg-white shadow-sm">
                  Signature et cachet
                </div>
              </div>

              <div className="w-[35%] flex flex-col items-center justify-end pb-2 font-bold text-[9px] space-y-0.5">
                <div className="flex gap-4">
                  <span>Feuillet 1 : Assuré</span>
                  <span>Feuillet 2 : BAMBOO-EMF</span>
                </div>
                <div className="flex gap-4">
                  <span>Feuillet 3 : SAMB'A</span>
                  <span>Feuillet 4 : Souche</span>
                </div>
              </div>

              <div className="w-[30%]">
                <div className="mb-1 font-bold text-xs text-right">BAMBOO-EMF P/C de l'Assureur</div>
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
            onClick={() => navigate('/contrats/bamboo')}
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
                Créer le Contrat BAMBOO-EMF
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default BambooContractCreateOfficial
