// src/features/contrats/arianefinance/ArianeFinanceContractCreateOfficial.tsx
import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, CheckCircle, AlertCircle, Mail, Phone, MapPin, Printer } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { useCreateArianeFinanceContract } from '@/hooks/useArianeFinanceContracts'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatCurrency } from '@/lib/utils'
import logoSamba from '@/assets/logo-samba.png'

// --- Constantes ARIANE FINANCE ---
const ARIANE_FINANCE_EMF_ID = 9
const TAUX_DECES_IAD = 1.05 // 1.05%
const MONTANT_MAX_PRET = 4000000 // 4 000 000 FCFA
const PROTECTION_FORFAITAIRE = 250000 // 250 000 FCFA
const PRIME_PROTECTION = 5000 // 5 000 FCFA

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
  <div className="flex flex-col w-full">
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
    {error && <span className="text-[9px] text-red-500 font-medium ml-auto mt-0.5">{error}</span>}
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
  <div
    className={`flex items-center mr-3 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
    onClick={() => !disabled && onChange?.(!checked)}
  >
    <div className={`w-4 h-4 border-2 border-black mr-1 flex items-center justify-center transition-colors ${checked ? 'bg-white' : disabled ? 'bg-gray-200' : 'bg-white hover:bg-orange-50'}`}>
      {checked && (
        <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
    <span className="text-[10px] text-gray-800">{label}</span>
  </div>
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

// --- Catégories disponibles ---
const categories = [
  { key: 'commercants' as const, label: 'Commerçants' },
  { key: 'salaries_public' as const, label: 'Salariés du public' },
  { key: 'salaries_prive' as const, label: 'Salariés du privé' },
  { key: 'retraites' as const, label: 'Retraités' },
]

export const ArianeFinanceContractCreateOfficial = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // Vérification EMF
  const userEmfId = user?.emf_id
  const userEmfSigle = user?.emf?.sigle?.toUpperCase() || ''
  const isArianeFinanceUser = userEmfId === ARIANE_FINANCE_EMF_ID || userEmfSigle.includes('ARIANE') || user?.role === 'admin'
  const emfName = userEmfSigle || 'inconnu'

  const [formData, setFormData] = useState({
    emf_id: ARIANE_FINANCE_EMF_ID,
    // Couverture
    montant_pret_assure: '',
    duree_pret: '',
    date_effet: '',
    date_fin_echeance: '',
    // Assuré
    nom: '',
    prenom: '',
    adresse: '',
    ville: '',
    telephone: '',
    email: '',
    // Catégorie
    categorie: '' as 'commercants' | 'salaries_public' | 'salaries_prive' | 'retraites' | 'autre' | '',
    autre_categorie_precision: '',
    // Bénéficiaire protection forfaitaire
    beneficiaire_nom: '',
    beneficiaire_prenom: '',
    beneficiaire_telephone: '',
    // Garanties
    garantie_protection_forfaitaire: true,
    garantie_deces_iad: true,
    // Signature
    lieu_signature: 'Libreville',
    date_signature: new Date().toISOString().split('T')[0]
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState('')

  const { mutate: createContract, isPending, isSuccess } = useCreateArianeFinanceContract()

  // Validation des règles métier
  const formErrors = useMemo(() => {
    const montant = parseInt(formData.montant_pret_assure) || 0
    const errs: { montant_pret_assure?: string } = {}
    if (montant > MONTANT_MAX_PRET) errs.montant_pret_assure = `Max ${formatCurrency(MONTANT_MAX_PRET)}`
    return errs
  }, [formData.montant_pret_assure])

  // Calcul date fin automatique
  const calculatedDateFinEcheance = useMemo(() => {
    if (formData.date_effet && formData.duree_pret) {
      const dateEffet = new Date(formData.date_effet)
      const duree = parseInt(formData.duree_pret) || 0
      if (!isNaN(dateEffet.getTime()) && duree > 0) {
        dateEffet.setMonth(dateEffet.getMonth() + duree)
        return dateEffet.toISOString().split('T')[0]
      }
    }
    return ''
  }, [formData.date_effet, formData.duree_pret])

  // Calcul prime totale
  const montant = parseInt(formData.montant_pret_assure) || 0
  const primeDecesIAD = Math.round(montant * (TAUX_DECES_IAD / 100))
  const primeTotale = (formData.garantie_protection_forfaitaire ? PRIME_PROTECTION : 0) + primeDecesIAD

  // Validation progressive
  const isSection1Complete = Boolean(
    formData.montant_pret_assure &&
    formData.duree_pret &&
    formData.date_effet &&
    !formErrors.montant_pret_assure
  )

  const isSection2Enabled = isSection1Complete
  const isSection2Complete = Boolean(
    formData.nom.trim() &&
    formData.prenom.trim() &&
    formData.telephone.trim() &&
    formData.categorie
  )

  const isSection3Enabled = isSection2Complete
  const isSection4Enabled = isSection2Complete
  const isSection5Enabled = isSection2Complete

  const isFormComplete = isSection1Complete && isSection2Complete

  // Validation règles métier
  const validateBusinessRules = () => {
    const warnings: string[] = []
    if (montant > MONTANT_MAX_PRET) {
      warnings.push(`Montant prêt (${formatCurrency(montant)}) dépasse le max: ${formatCurrency(MONTANT_MAX_PRET)}`)
    }
    return warnings
  }

  const businessWarnings = validateBusinessRules()

  const getCategorieLabel = () => {
    const cat = categories.find(c => c.key === formData.categorie)
    if (cat) return cat.label
    if (formData.categorie === 'autre' && formData.autre_categorie_precision) {
      return formData.autre_categorie_precision
    }
    return ''
  }

  const categorieLabel = getCategorieLabel()

  // Vérification accès
  if (!isArianeFinanceUser) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-[210mm] mx-auto">
          <div className="bg-red-50 border border-red-300 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-red-700 mb-2">Accès non autorisé</h1>
            <p className="text-red-600 mb-4">
              Vous êtes connecté avec un compte <strong>{emfName}</strong>.
              <br />
              Ce formulaire est réservé aux utilisateurs ARIANE FINANCE.
            </p>
            <Button onClick={() => navigate(-1)} className="bg-red-600 hover:bg-red-700 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setSubmitError('')

    const newErrors: Record<string, string> = {}

    if (!formData.nom.trim()) newErrors.nom = 'Obligatoire'
    if (!formData.prenom.trim()) newErrors.prenom = 'Obligatoire'
    if (!formData.telephone.trim()) newErrors.telephone = 'Obligatoire'
    if (!formData.montant_pret_assure) newErrors.montant_pret_assure = 'Obligatoire'
    if (!formData.duree_pret) newErrors.duree_pret = 'Obligatoire'
    if (!formData.date_effet) newErrors.date_effet = 'Obligatoire'
    if (!formData.categorie) newErrors.categorie = 'Sélectionnez une catégorie'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setSubmitError(`⚠️ ${Object.keys(newErrors).length} champ(s) obligatoire(s) manquant(s)`)
      return
    }

    if (businessWarnings.length > 0) {
      const confirmContinue = window.confirm(
        `⚠️ Attention:\n\n${businessWarnings.join('\n')}\n\nContinuer quand même ?`
      )
      if (!confirmContinue) return
    }

    const payload = {
      emf_id: ARIANE_FINANCE_EMF_ID,
      montant_pret_assure: parseInt(formData.montant_pret_assure),
      duree_pret: parseInt(formData.duree_pret),
      date_effet: formData.date_effet,
      date_fin_echeance: calculatedDateFinEcheance || undefined,
      nom: formData.nom.trim(),
      prenom: formData.prenom.trim(),
      adresse: formData.adresse?.trim() || undefined,
      ville: formData.ville?.trim() || undefined,
      telephone: formData.telephone.trim(),
      email: formData.email?.trim() || undefined,
      categorie: formData.categorie,
      beneficiaire_nom: formData.beneficiaire_nom?.trim() || undefined,
      beneficiaire_prenom: formData.beneficiaire_prenom?.trim() || undefined,
      beneficiaire_telephone: formData.beneficiaire_telephone?.trim() || undefined,
      taux_deces_iad: TAUX_DECES_IAD,
      statut: 'actif',
    }

    createContract(payload, {
      onSuccess: (data) => {
        const contractId = 'id' in data ? data.id : (data as { data?: { id?: number } }).data?.id
        navigate(`/contrats/ariane-finance/${contractId}`, {
          state: { success: 'Contrat créé avec succès !' }
        })
      },
      onError: (error: { response?: { status?: number; data?: { errors?: Record<string, string | string[]>; message?: string } }; message?: string }) => {
        if (error.response?.status === 422) {
          const validationErrors = error.response.data?.errors || {}
          const newErrors: Record<string, string> = {}
          Object.entries(validationErrors).forEach(([key, messages]) => {
            newErrors[key] = Array.isArray(messages) ? messages[0] : messages as string
          })
          setErrors(newErrors)
          setSubmitError(`❌ Erreurs de validation`)
        } else {
          setSubmitError(`❌ Erreur: ${error.response?.data?.message || error.message}`)
        }
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-100 py-4 px-4">
      {/* Toolbar */}
      <div className="max-w-[210mm] mx-auto mb-4 flex items-center justify-between bg-white rounded-lg shadow p-3">
        <Button variant="ghost" onClick={() => navigate('/contrats/ariane-finance')} className="hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 mr-1" />
          Retour à la liste
        </Button>
        <h1 className="text-lg font-bold text-[#F48232]">Nouveau Contrat ARIANE FINANCE</h1>
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

      {/* Indicateur de progression */}
      <div className="max-w-[210mm] mx-auto mb-4 bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">Progression du formulaire :</span>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-2 py-1 rounded ${isSection1Complete ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {isSection1Complete ? <CheckCircle className="h-4 w-4" /> : <span className="w-4 h-4 rounded-full border-2 border-current" />}
              <span>Prêt</span>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded ${isSection2Complete ? 'bg-green-100 text-green-700' : isSection2Enabled ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-400'}`}>
              {isSection2Complete ? <CheckCircle className="h-4 w-4" /> : <span className="w-4 h-4 rounded-full border-2 border-current" />}
              <span>Assuré</span>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded ${isFormComplete ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
              {isFormComplete ? <CheckCircle className="h-4 w-4" /> : <span className="w-4 h-4 rounded-full border-2 border-current" />}
              <span>Prêt à créer</span>
            </div>
          </div>
        </div>
        {!isSection1Complete && (
          <p className="text-xs text-orange-600 mt-2">
            ⚠️ Remplissez d'abord les informations du prêt (Montant, Durée, Date d'effet) pour débloquer la section Assuré.
          </p>
        )}
        {isSection1Complete && !isSection2Complete && (
          <p className="text-xs text-orange-600 mt-2">
            ⚠️ Remplissez les informations de l'assuré (Nom, Prénom, Téléphone, Catégorie) pour activer le bouton de création.
          </p>
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
              Contrat Décès Emprunteur : ARIANE FINANCE
            </h1>
            <p className="text-[8px] text-gray-500">Contrat régi par les dispositions du Code des assurances CIMA</p>
            <div className="text-[9px] font-bold text-gray-700 leading-tight">
              Convention N° : 504.111/0724
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
                {/* Numéro de police - Auto-généré */}
                <div className="col-span-2 flex items-end">
                  <span className="mr-1 whitespace-nowrap text-[11px] text-gray-800">N° Police :</span>
                  <span className="flex-grow border-b-2 border-gray-400 text-[11px] px-1 py-0.5 font-semibold text-gray-500 italic">
                    (Auto-généré à la création)
                  </span>
                </div>
                <FormInput
                  label="Montant du prêt assuré :"
                  value={formData.montant_pret_assure}
                  onChange={(v) => setFormData({ ...formData, montant_pret_assure: v })}
                  type="number"
                  placeholder="Ex: 2000000"
                  required
                  error={errors.montant_pret_assure || formErrors.montant_pret_assure}
                />
                <FormInput
                  label="Durée du prêt (mois) :"
                  value={formData.duree_pret}
                  onChange={(v) => setFormData({ ...formData, duree_pret: v })}
                  type="number"
                  placeholder="Ex: 12"
                  required
                  error={errors.duree_pret}
                />
                <FormInput
                  label="Date d'effet :"
                  value={formData.date_effet}
                  onChange={(v) => setFormData({ ...formData, date_effet: v })}
                  type="date"
                  required
                  error={errors.date_effet}
                />
                <FormInput
                  label="Date de fin d'échéance :"
                  value={calculatedDateFinEcheance}
                  disabled
                />
              </div>
            </div>

            {/* Section: Assuré/Emprunteur */}
            <div className={`flex border-b border-[#F48232] ${!isSection2Enabled ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="w-28 flex-shrink-0 p-1.5 bg-orange-50 italic border-r border-[#F48232] flex flex-col justify-center text-xs">
                Assuré/Emprunteur
                {!isSection2Enabled && <span className="text-[10px] text-orange-600 mt-1">🔒 Remplir Prêt</span>}
              </div>
              <div className="flex-grow p-1.5 space-y-1">
                <div className="flex gap-2">
                  <FormInput
                    label="Nom :"
                    value={formData.nom}
                    onChange={(v) => setFormData({ ...formData, nom: v })}
                    placeholder="Ex: NGUEMA"
                    required
                    error={errors.nom}
                    disabled={!isSection2Enabled}
                  />
                  <FormInput
                    label="Prénom :"
                    value={formData.prenom}
                    onChange={(v) => setFormData({ ...formData, prenom: v })}
                    placeholder="Ex: Jean"
                    required
                    error={errors.prenom}
                    disabled={!isSection2Enabled}
                  />
                </div>
                <div className="flex gap-2">
                  <FormInput
                    label="Adresse :"
                    value={formData.adresse}
                    onChange={(v) => setFormData({ ...formData, adresse: v })}
                    placeholder="Ex: Quartier Louis"
                    className="flex-grow-[2]"
                    disabled={!isSection2Enabled}
                  />
                  <FormInput
                    label="Ville :"
                    value={formData.ville}
                    onChange={(v) => setFormData({ ...formData, ville: v })}
                    placeholder="Ex: Libreville"
                    className="flex-grow-[1]"
                    disabled={!isSection2Enabled}
                  />
                </div>
                <div className="flex gap-2">
                  <FormInput
                    label="Téléphone :"
                    value={formData.telephone}
                    onChange={(v) => setFormData({ ...formData, telephone: v })}
                    placeholder="Ex: 06 12 34 56"
                    required
                    error={errors.telephone}
                    className="flex-grow-[1]"
                    disabled={!isSection2Enabled}
                  />
                  <FormInput
                    label="Email :"
                    value={formData.email}
                    onChange={(v) => setFormData({ ...formData, email: v })}
                    placeholder="Ex: email@example.com"
                    type="email"
                    className="flex-grow-[2]"
                    disabled={!isSection2Enabled}
                  />
                </div>
                {/* Catégorie */}
                <div className="flex flex-wrap items-center mt-1 gap-x-4 gap-y-1">
                  <span className="mr-1 text-xs">Catégorie{errors.categorie && <span className="text-red-500">*</span>} :</span>
                  {categories.map(cat => (
                    <Checkbox
                      key={cat.key}
                      label={cat.label}
                      checked={formData.categorie === cat.key}
                      onChange={() => setFormData({ ...formData, categorie: cat.key })}
                      disabled={!isSection2Enabled}
                    />
                  ))}
                  <Checkbox
                    label="Autre"
                    checked={formData.categorie === 'autre'}
                    onChange={() => setFormData({ ...formData, categorie: 'autre' })}
                    disabled={!isSection2Enabled}
                  />
                  <div className="flex items-center">
                    <span className="text-[10px] text-gray-800 mr-1">à préciser :</span>
                    <input
                      type="text"
                      value={formData.autre_categorie_precision}
                      onChange={(e) => setFormData({ ...formData, autre_categorie_precision: e.target.value })}
                      className="border-b border-gray-400 w-24 text-xs font-semibold bg-transparent focus:outline-none focus:border-[#F48232]"
                      disabled={!isSection2Enabled || formData.categorie !== 'autre'}
                      placeholder="Préciser..."
                    />
                  </div>
                </div>
                {/* Affichage catégorie sélectionnée */}
                {categorieLabel && (
                  <div className="text-xs font-bold text-[#F48232] print:block hidden">
                    → Catégorie sélectionnée : {categorieLabel}
                  </div>
                )}
              </div>
            </div>

            {/* Section: Bénéficiaire du prêt (ARIANE FINANCE) */}
            <div className={`flex border-b border-[#F48232] ${!isSection3Enabled ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="w-28 flex-shrink-0 p-1.5 bg-orange-50 italic border-r border-[#F48232] flex flex-col justify-center text-xs">
                Bénéficiaire du prêt
                {!isSection3Enabled && <span className="text-[10px] text-orange-600 mt-1">🔒 Remplir Assuré</span>}
              </div>
              <div className="flex-grow p-1.5 space-y-1">
                <div className="flex items-end">
                  <span className="mr-1 whitespace-nowrap text-xs text-gray-800">Raison sociale :</span>
                  <span className="font-bold text-xs">ARIANE FINANCE</span>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-end flex-grow">
                    <span className="mr-1 whitespace-nowrap text-xs">RCCM :</span>
                    <span className="flex-grow border-b border-gray-300"></span>
                  </div>
                  <div className="flex items-end flex-grow">
                    <span className="mr-1 whitespace-nowrap text-xs">Adresse :</span>
                    <span className="flex-grow border-b border-gray-300"></span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-end flex-grow">
                    <span className="mr-1 text-xs">Ville :</span>
                    <span className="flex-grow border-b border-gray-300"></span>
                  </div>
                  <div className="flex items-end flex-grow">
                    <span className="mr-1 text-xs">Téléphone :</span>
                    <span className="flex-grow border-b border-gray-300"></span>
                  </div>
                  <div className="flex items-end flex-grow">
                    <span className="mr-1 text-xs">Email :</span>
                    <span className="flex-grow border-b border-gray-300"></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Bénéficiaire Protection Forfaitaire */}
            <div className={`flex border-b border-[#F48232] ${!isSection3Enabled ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="w-28 flex-shrink-0 p-1.5 bg-orange-50 italic border-r border-[#F48232] flex flex-col justify-center text-xs leading-tight">
                Bénéficiaire Protection Forfaitaire
                {!isSection3Enabled && <span className="text-[10px] text-orange-600 mt-1">🔒</span>}
              </div>
              <div className="flex-grow p-1.5 space-y-1">
                <div className="flex gap-2">
                  <FormInput
                    label="Nom :"
                    value={formData.beneficiaire_nom}
                    onChange={(v) => setFormData({ ...formData, beneficiaire_nom: v })}
                    placeholder="Nom du bénéficiaire"
                    disabled={!isSection3Enabled}
                  />
                  <FormInput
                    label="Prénom :"
                    value={formData.beneficiaire_prenom}
                    onChange={(v) => setFormData({ ...formData, beneficiaire_prenom: v })}
                    placeholder="Prénom du bénéficiaire"
                    disabled={!isSection3Enabled}
                  />
                  <FormInput
                    label="Téléphone :"
                    value={formData.beneficiaire_telephone}
                    onChange={(v) => setFormData({ ...formData, beneficiaire_telephone: v })}
                    placeholder="Téléphone"
                    disabled={!isSection3Enabled}
                  />
                </div>
              </div>
            </div>

            {/* Section: Garanties */}
            <div className={`flex border-b border-[#F48232] ${!isSection4Enabled ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="w-28 flex-shrink-0 p-1.5 bg-orange-50 italic border-r border-[#F48232] flex flex-col justify-center text-xs">
                Garanties
                {!isSection4Enabled && <span className="text-[10px] text-orange-600 mt-1">🔒 Remplir Assuré</span>}
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
                    {/* Protection forfaitaire Prévoyance */}
                    <tr className={`border-b border-[#F48232] ${formData.garantie_protection_forfaitaire ? 'bg-orange-50' : ''}`}>
                      <td className="p-1 text-left pl-2 font-medium bg-gray-100">Protection forfaitaire Prévoyance¹ Décès - IAD²</td>
                      <td className="border-l border-r border-[#F48232] p-1 text-[#F48232]">Toute catégorie</td>
                      <td className="border-r border-[#F48232] p-1">
                        <div className="flex justify-center">
                          <label className="cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.garantie_protection_forfaitaire}
                              onChange={(e) => setFormData({ ...formData, garantie_protection_forfaitaire: e.target.checked })}
                              className="sr-only"
                            />
                            <div className={`w-6 h-4 border border-black ${formData.garantie_protection_forfaitaire ? 'bg-black' : 'bg-white hover:bg-gray-100'}`}></div>
                          </label>
                        </div>
                      </td>
                      <td className="border-r border-[#F48232] p-1 bg-gray-200 text-gray-500">N/A</td>
                      <td className="p-1 text-[#F48232] font-bold">{formatCurrency(PRIME_PROTECTION).replace(' FCFA', '')} FCFA</td>
                    </tr>
                    {/* Décès – IAD */}
                    <tr className={`${formData.garantie_deces_iad ? 'bg-orange-50' : ''}`}>
                      <td className="p-1 text-left pl-2 font-medium bg-gray-100">Décès – Invalidité Absolue et Définitive (IAD)</td>
                      <td className="border-l border-r border-[#F48232] p-1 text-[#F48232]">Toute catégorie</td>
                      <td className="border-r border-[#F48232] p-1">
                        <div className="flex justify-center">
                          <label className="cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.garantie_deces_iad}
                              onChange={(e) => setFormData({ ...formData, garantie_deces_iad: e.target.checked })}
                              className="sr-only"
                            />
                            <div className={`w-6 h-4 border border-black ${formData.garantie_deces_iad ? 'bg-black' : 'bg-white hover:bg-gray-100'}`}></div>
                          </label>
                        </div>
                      </td>
                      <td className="border-r border-[#F48232] p-1 text-[#F48232] font-bold">{TAUX_DECES_IAD}%</td>
                      <td className="p-1 bg-gray-200 text-gray-500">N/A</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section: Cotisations */}
            <div className={`flex bg-orange-50/50 ${!isSection5Enabled ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="w-28 flex-shrink-0 p-1.5 bg-orange-50 italic border-r border-[#F48232] flex flex-col justify-center text-xs">
                Cotisations
                {!isSection5Enabled && <span className="text-[10px] text-orange-600 mt-1">🔒 Remplir Assuré</span>}
              </div>
              <div className="flex-grow p-2">
                <div className="font-bold flex items-end">
                  <span className="text-xs">Cotisation totale :</span>
                  <span className="flex-grow mx-2 border-b-2 border-black text-center font-extrabold text-[#F48232] text-base">
                    {primeTotale > 0 ? formatCurrency(primeTotale) : '___________'}
                  </span>
                  <span className="text-[10px]">FCFA TTC</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footnotes */}
          <div className="mt-2 space-y-0.5 text-[9px] text-black font-bold">
            <p>(1) La protection forfaitaire est d'un montant de {formatCurrency(PROTECTION_FORFAITAIRE)} en cas de décès ou d'invalidité absolue et définitive.</p>
            <p>(2) Le montant maximal du prêt couvert est de {formatCurrency(MONTANT_MAX_PRET)}.</p>
          </div>

          {/* Signatures */}
          <div className="mt-auto mb-2">
            <div className="text-right mb-2 pr-8 font-medium text-[10px]">
              Fait à <input
                type="text"
                value={formData.lieu_signature}
                onChange={(e) => setFormData({ ...formData, lieu_signature: e.target.value })}
                className="border-b border-black px-2 mx-1 font-semibold bg-transparent focus:outline-none focus:border-[#F48232] w-24"
                placeholder="Libreville"
              />,
              le <input
                type="date"
                value={formData.date_signature}
                onChange={(e) => setFormData({ ...formData, date_signature: e.target.value })}
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
                  <span>Feuillet 1 : SAMB'A ASSURANCES</span>
                  <span>Feuillet 2 : ARIANE FINANCE</span>
                </div>
                <div className="flex gap-4">
                  <span>Feuillet 3 : Assuré</span>
                  <span>Feuillet 4 : Souche</span>
                </div>
              </div>

              <div className="w-[30%]">
                <div className="mb-1 font-bold text-xs text-right">L'Assureur</div>
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
            onClick={() => navigate('/contrats/ariane-finance')}
            className="flex-1"
            disabled={isPending}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isPending || !isFormComplete}
            className={`flex-1 text-white font-semibold text-lg py-3 ${isFormComplete
              ? 'bg-[#F48232] hover:bg-[#e0742a]'
              : 'bg-gray-400 cursor-not-allowed'
              }`}
            title={!isFormComplete ? 'Veuillez remplir tous les champs obligatoires' : ''}
          >
            {isPending ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Création en cours...</span>
              </>
            ) : !isFormComplete ? (
              <>
                <AlertCircle className="h-5 w-5 mr-2" />
                Remplir les champs obligatoires
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Créer le Contrat ARIANE FINANCE
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ArianeFinanceContractCreateOfficial
