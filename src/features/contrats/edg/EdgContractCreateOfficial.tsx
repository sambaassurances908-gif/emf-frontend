// src/features/contrats/edg/EdgContractCreateOfficial.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, CheckCircle, AlertCircle, Mail, Phone, MapPin, Printer } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { useCreateEdgContract } from '@/hooks/useEdgContracts'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { LimitesDepasseesModal, type ContratCreationResponse } from '@/components/ui/LimitesDepasseesModal'
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
  <div className="flex items-end w-full min-w-0 overflow-hidden">
    {label && (
      <span className="mr-2 whitespace-nowrap text-sm text-gray-800 flex-shrink-0">
        {label}{required && <span className="text-red-500">*</span>}
      </span>
    )}
    <input
      type={type}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`flex-grow min-w-0 border-b ${error ? 'border-red-400 bg-red-50' : 'border-gray-800'} bg-transparent text-sm px-1 py-0.5 focus:outline-none focus:border-[#F48232] ${className}`}
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
  <label className="flex items-center mr-4 cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange?.(e.target.checked)}
      disabled={disabled}
      className="sr-only"
    />
    <div className={`w-5 h-5 border-2 border-black mr-2 flex items-center justify-center transition-colors bg-white ${!disabled && 'hover:bg-gray-100'}`}>
      {checked && (
        <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
    <span className="text-sm text-gray-800">{label}</span>
  </label>
)

// --- Logo Component ---
const Logo: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center w-32">
      <img src={logoSamba} alt="SAMB'A Assurances" className="h-20 w-auto" />
    </div>
  )
}

// --- Footer Component ---
const Footer: React.FC<{ pageNum?: number }> = ({ pageNum = 1 }) => {
  return (
    <div className="mt-auto pt-8 text-center text-[10px] text-gray-600 space-y-1">
      <div className="font-bold uppercase text-black">SAMB'A ASSURANCES GABON S.A.</div>
      <div>Société Anonyme avec Conseil d'Administration et Président Directeur Général.</div>
      <div>
        Entreprise de micro-assurance régie par le Code des Assurances CIMA et agréée par la CRCA sous le N° 0270 / L / CIMA / CRCA / PDT / 2024,
      </div>
      <div>
        et le Ministère de l'Economie et des Participations par l'Arrêté N° 036.24 / MEP, au capital de 610.000.000 de FCFA dont 536.000.000 de FCFA libérés.
      </div>
      <div>
        R.C.C.M : N° GA - LBV - 01 - 2024 - B14 - 00003 | N° STATISTIQUE : 202401003647 R
      </div>

      <div className="flex justify-between items-end mt-4 px-8 border-t border-gray-300 pt-2 relative">
        <div className="flex flex-col items-center w-1/3">
          <MapPin size={16} className="mb-1 text-gray-500" />
          <span>326 Rue Jean-Baptiste NDENDE</span>
          <span>Avenue de COINTET | Centre-Ville | Libreville</span>
        </div>
        <div className="flex flex-col items-center w-1/3">
          <Mail size={16} className="mb-1 text-gray-500" />
          <span>B.P : 22 215 | Libreville | Gabon</span>
          <span>Email : infos@samba-assurances.com</span>
        </div>
        <div className="flex flex-col items-center w-1/3">
          <Phone size={16} className="mb-1 text-gray-500" />
          <span>(+241) 060 08 62 62 - 074 40 41 41</span>
          <span>074 40 51 51</span>
        </div>
        <div className="absolute right-8 bottom-4 border border-black px-2 py-0.5 font-bold text-sm">
          {pageNum}
        </div>
      </div>
    </div>
  )
}

export const EdgContractCreateOfficial = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { mutate: createContract, isError, error, isSuccess, isPending } = useCreateEdgContract()

  // ═══════════════════════════════════════════════════════════════════
  // 🔒 VÉRIFICATION EMF - EDG = emf_id 4
  // ═══════════════════════════════════════════════════════════════════
  const userEmfId = user?.emf_id
  const userEmfSigle = user?.emf?.sigle?.toUpperCase() || ''
  const isEdgUser = userEmfId === 4 || userEmfSigle.includes('EDG') || user?.role === 'admin'
  const emfName = userEmfSigle || (userEmfId === 1 ? 'BAMBOO' : userEmfId === 2 ? 'COFIDEC' : userEmfId === 3 ? 'BCEG' : userEmfId === 4 ? 'EDG' : userEmfId === 5 ? 'SODEC' : 'inconnu')

  // IMPORTANT: Toujours utiliser emf_id = 4 pour EDG (pas depuis user qui peut être incorrect)
  const emfId = 4

  const [formData, setFormData] = useState({
    emf_id: emfId,
    nom_prenom: '',
    date_naissance: '',
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
    beneficiaire_telephone: '',
    numero_compte_protege: '',
    capital_compte_protege: '',
    garantie_compte_protege: true,
    garantie_deces_iad: true,
    garantie_vip: false,
    agence: '',
    lieu_signature: 'Libreville',
    date_signature: new Date().toISOString().split('T')[0]
  })

  // Assurés associés - Non utilisés dans ce formulaire mais gardés pour compatibilité backend
  const assuresAssocies = {
    assure1: { nom: '', prenom: '', date_naissance: '', lieu_naissance: '', contact: '' },
    assure2: { nom: '', prenom: '', date_naissance: '', lieu_naissance: '', contact: '' },
    assure3: { nom: '', prenom: '', date_naissance: '', lieu_naissance: '', contact: '' },
  }

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState('')
  const [showLimitesModal, setShowLimitesModal] = useState(false)
  const [createdContrat, setCreatedContrat] = useState<ContratCreationResponse | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Calcul de l'âge à la fin de couverture
  const calculateAgeAtEndOfCoverage = () => {
    if (!formData.date_naissance || !formData.date_fin_echeance) return null
    const dateNaissance = new Date(formData.date_naissance)
    const dateFinCouverture = new Date(formData.date_fin_echeance)
    let age = dateFinCouverture.getFullYear() - dateNaissance.getFullYear()
    const monthDiff = dateFinCouverture.getMonth() - dateNaissance.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && dateFinCouverture.getDate() < dateNaissance.getDate())) {
      age--
    }
    return age
  }

  const ageAtEndOfCoverage = calculateAgeAtEndOfCoverage()

  // Validation continue des règles métier
  useEffect(() => {
    const errors: Record<string, string> = {}
    const montant = parseInt(formData.montant_pret) || 0
    const duree = parseInt(formData.duree_pret_mois) || 0
    const capital = parseInt(formData.capital_compte_protege) || 0
    const isVipMode = formData.garantie_vip || formData.categorie === 'vip'

    // Règle (2) Montant
    const maxMontant = isVipMode ? 65000000 : 25000000
    if (montant > maxMontant) {
      errors.montant_pret = `Max ${isVipMode ? '65 000 000' : '25 000 000'} FCFA`
    }

    // Règle (3) Durée
    const maxDuree = isVipMode ? 36 : 60
    if (duree > maxDuree) {
      errors.duree_pret_mois = `Max ${maxDuree} mois${isVipMode ? ' (VIP)' : ''}`
    }

    // Règle (1) Capital Compte Protégé
    if (capital > 250000) {
      errors.capital_compte_protege = "Max 250 000 FCFA"
    }

    // Règle (4) Âge
    if (ageAtEndOfCoverage !== null && ageAtEndOfCoverage > 70) {
      errors.date_naissance = "Âge max fin de couverture : 70 ans"
    }

    setValidationErrors(errors)
  }, [formData.montant_pret, formData.duree_pret_mois, formData.capital_compte_protege, formData.garantie_vip, formData.categorie, ageAtEndOfCoverage])

  // ═══════════════════════════════════════════════════════════════════
  // 🔒 VALIDATION PROGRESSIVE - Activation des sections par étapes
  // ═══════════════════════════════════════════════════════════════════

  // Section 1: Couverture Prêt (toujours active)
  const isSection1Complete = Boolean(
    formData.montant_pret &&
    formData.duree_pret_mois &&
    formData.date_effet &&
    !validationErrors.montant_pret &&
    !validationErrors.duree_pret_mois
  )

  // Section 2: Assuré (active si Section 1 complète)
  const isSection2Enabled = isSection1Complete
  const isSection2Complete = Boolean(
    formData.nom_prenom.trim() &&
    formData.adresse_assure.trim() &&
    formData.ville_assure.trim() &&
    formData.telephone_assure.trim() &&
    (formData.categorie || formData.garantie_vip)
  )

  // Section 3: Souscripteur/EMF (active si Section 2 complète)
  const isSection3Enabled = isSection2Complete

  // Section 4: Compte Protégé+ (active si Section 2 complète)
  const isSection4Enabled = isSection2Complete

  // Section 5: Garanties (active si Section 2 complète)
  const isSection5Enabled = isSection2Complete

  // Bouton de création: actif si tous les champs obligatoires sont remplis
  const isFormComplete = isSection1Complete && isSection2Complete

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
  // Compte Protégé+: 15 000 FCFA (prime unique)
  // Décès/IAD Standard: 2,50% du montant du prêt
  // Décès/IAD VIP: 3,50% du montant du prêt
  const montant = parseInt(formData.montant_pret) || 0
  const duree = parseInt(formData.duree_pret_mois) || 0
  const isVip = formData.garantie_vip || formData.categorie === 'vip'
  const cotisationCompteProtege = formData.garantie_compte_protege ? 15000 : 0
  const tauxDeces = isVip ? 0.035 : 0.025 // 3,50% VIP ou 2,50% standard
  const cotisationDeces = formData.garantie_deces_iad ? montant * tauxDeces : 0
  const cotisationTotale = cotisationCompteProtege + cotisationDeces

  // Validation des règles métier EDG
  const montantMaxPretVip = 65000000 // 65.000.000 FCFA pour VIP
  const montantMaxPretStandard = 25000000 // 25.000.000 FCFA pour les autres
  const dureeMaxVip = 36 // 36 mois pour VIP
  const dureeMaxStandard = 60 // 60 mois pour les autres
  const capitalCompteProtegeMax = 250000 // 250.000 FCFA max
  const ageMaxCouverture = 70 // 70 ans max


  const capitalCompteProtege = parseInt(formData.capital_compte_protege) || 0

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

    // Capital Compte Protégé max 250 000 FCFA
    if (capitalCompteProtege > capitalCompteProtegeMax) {
      warnings.push(`Capital Compte Protégé (${formatCurrency(capitalCompteProtege)}) dépasse le maximum: ${formatCurrency(capitalCompteProtegeMax)}`)
    }

    // Âge max à la fin de couverture: 70 ans
    if (ageAtEndOfCoverage !== null && ageAtEndOfCoverage > ageMaxCouverture) {
      warnings.push(`Âge à la fin de couverture (${ageAtEndOfCoverage} ans) dépasse le maximum: ${ageMaxCouverture} ans`)
    }

    return warnings
  }

  const businessWarnings = validateBusinessRules()

  // ═══════════════════════════════════════════════════════════════════
  // 🔒 VÉRIFICATION D'ACCÈS - Après tous les hooks (Rules of Hooks)
  // ═══════════════════════════════════════════════════════════════════
  if (!isEdgUser) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-[210mm] mx-auto">
          <div className="bg-red-50 border border-red-300 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-red-700 mb-2">Accès non autorisé</h1>
            <p className="text-red-600 mb-4">
              Vous êtes connecté avec un compte <strong>{emfName}</strong>.
              <br />
              Ce formulaire est réservé aux utilisateurs EDG.
            </p>
            <Button
              onClick={() => navigate(-1)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
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
        date_naissance: formData.date_naissance || undefined,
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
        // ✅ Champs Compte Protégé+ / Bénéficiaire
        numero_compte_protege: formData.numero_compte_protege?.trim() || undefined,
        capital_compte_protege: formData.capital_compte_protege ? parseInt(formData.capital_compte_protege) : undefined,
        beneficiaire_deces: formData.beneficiaire_deces?.trim() || undefined,
        beneficiaire_telephone: formData.beneficiaire_telephone?.trim() || undefined,
        // ✅ Garanties - Le backend attend garantie_prevoyance ET garantie_compte_protege
        garantie_compte_protege: formData.garantie_compte_protege,
        garantie_prevoyance: formData.garantie_compte_protege, // Même valeur que compte_protege
        garantie_deces_iad: formData.garantie_deces_iad,
        // ✅ Le backend attend 'est_vip' (boolean) et non 'garantie_vip'
        est_vip: formData.garantie_vip || formData.categorie === 'vip',
        agence: formData.agence?.trim() || undefined,
        // ✅ Signature
        lieu_signature: formData.lieu_signature?.trim() || 'Libreville',
        date_signature: formData.date_signature || new Date().toISOString().split('T')[0],
        statut: 'actif' as const,
        ...(assuresArray.length > 0 ? { assures_associes: assuresArray } : {})
      }

      console.log('📤 Payload EDG:', JSON.stringify(payload, null, 2))

      createContract(payload, {
        onSuccess: (data) => {
          console.log('✅ Contrat EDG créé avec succès! ID:', data.id || data.data?.id)
          // Afficher le modal avec le résultat
          setCreatedContrat({
            id: data.id || data.data?.id,
            numero_police: data.numero_police || data.data?.numero_police,
            statut: data.statut || data.data?.statut,
            limites_depassees: data.limites_depassees || data.data?.limites_depassees || false,
            motif_attente: data.motif_attente || data.data?.motif_attente || null
          })
          setShowLimitesModal(true)
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

      {/* 🔒 Indicateur de progression */}
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
            ⚠️ Remplissez les informations de l'assuré (Nom, Adresse, Ville, Téléphone, Catégorie) pour activer le bouton de création.
          </p>
        )}
      </div>

      {/* Formulaire style contrat officiel */}
      <form onSubmit={handleSubmit}>
        <div className="page bg-white w-[210mm] min-h-[297mm] p-[10mm] shadow-xl relative flex flex-col mx-auto">

          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <Logo />
            <h1 className="text-xl font-extrabold uppercase mt-4 text-center leading-tight tracking-wide text-[#F48232]">
              CONTRAT PREVOYANCE CREDITS EDG
            </h1>
            <p className="text-xs text-black font-semibold mt-1">Contrat régi par les dispositions du Code des assurances CIMA</p>
            <div className="text-sm font-bold text-black mt-1">
              Visas DNA N°005/24 et N°008/24 - Convention N°: 501/111.112/0624
            </div>
            <div className="w-full flex flex-col items-center mt-4 mb-2">
              <h3 className="text-black text-xl font-bold uppercase text-[#F48232]/80">
                CONDITIONS PARTICULIERES
              </h3>
            </div>
          </div>

          {/* Form Body - Table Structure */}
          <div className="border-2 border-[#F48232] w-full flex flex-col text-sm">

            {/* Section: Couverture Prêt */}
            <div className="flex border-b border-[#F48232]">
              <div className="w-32 flex-shrink-0 p-3 bg-orange-50 italic border-r border-[#F48232] flex items-center text-gray-900 font-serif text-xs">Couverture Prêt</div>
              <div className="flex-grow p-2 space-y-3 overflow-hidden">
                <div className="flex justify-end">
                  <Checkbox
                    label="Client VIP (Plafond 65M / 36 mois)"
                    checked={formData.garantie_vip}
                    onChange={(checked) => setFormData({ ...formData, garantie_vip: checked, categorie: checked ? 'vip' : 'commercants' })}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-600 mb-1">N° Police</span>
                    <input
                      value={formData.numero_police}
                      onChange={(e) => setFormData({ ...formData, numero_police: e.target.value })}
                      placeholder="EDG-2024-001"
                      className="border-b border-gray-800 bg-transparent text-sm px-1 py-0.5 focus:outline-none focus:border-[#F48232] w-full"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-600 mb-1">Montant <span className="text-red-500">*</span></span>
                    <input
                      type="number"
                      value={formData.montant_pret}
                      onChange={(e) => setFormData({ ...formData, montant_pret: e.target.value })}
                      placeholder="10000000"
                      className={`border-b ${validationErrors.montant_pret ? 'border-red-500 bg-red-50' : (errors.montant_pret ? 'border-red-400 bg-red-50' : 'border-gray-800')} bg-transparent text-sm px-1 py-0.5 focus:outline-none focus:border-[#F48232] w-full`}
                    />
                    {validationErrors.montant_pret && <span className="text-[10px] text-red-600 font-bold mt-0.5">{validationErrors.montant_pret}</span>}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-600 mb-1">Durée (mois) <span className="text-red-500">*</span></span>
                    <input
                      type="number"
                      value={formData.duree_pret_mois}
                      onChange={(e) => setFormData({ ...formData, duree_pret_mois: e.target.value })}
                      placeholder="24"
                      className={`border-b ${validationErrors.duree_pret_mois ? 'border-red-500 bg-red-50' : (errors.duree_pret_mois ? 'border-red-400 bg-red-50' : 'border-gray-800')} bg-transparent text-sm px-1 py-0.5 focus:outline-none focus:border-[#F48232] w-full`}
                    />
                    {validationErrors.duree_pret_mois && <span className="text-[10px] text-red-600 font-bold mt-0.5">{validationErrors.duree_pret_mois}</span>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Date d'effet :"
                    value={formData.date_effet}
                    onChange={(v) => setFormData({ ...formData, date_effet: v })}
                    type="date"
                    required
                    error={errors.date_effet}
                  />
                  <FormInput
                    label="Fin d'échéance :"
                    value={formData.date_fin_echeance}
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Section: Assuré */}
            <div className={`flex border-b border-[#F48232] ${!isSection2Enabled ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="w-32 flex-shrink-0 p-3 bg-orange-50 italic border-r border-[#F48232] flex flex-col justify-center text-gray-900 font-serif text-xs">
                <span>Assuré</span>
                {!isSection2Enabled && <span className="text-[10px] text-orange-600 mt-1">🔒 Remplir Prêt</span>}
              </div>
              <div className="flex-grow p-2 space-y-2 overflow-hidden">
                <div className="grid grid-cols-2 gap-3">
                  <FormInput
                    label="Nom & Prénom :"
                    value={formData.nom_prenom}
                    onChange={(v) => setFormData({ ...formData, nom_prenom: v })}
                    placeholder="Ex: Jean NGUEMA"
                    required
                    error={errors.nom_prenom}
                    disabled={!isSection2Enabled}
                  />
                  <FormInput
                    label="Date de naissance :"
                    value={formData.date_naissance}
                    onChange={(v) => setFormData({ ...formData, date_naissance: v })}
                    type="date"
                    required
                    error={errors.date_naissance}
                    disabled={!isSection2Enabled}
                  />
                </div>
                <FormInput
                  label="Adresse :"
                  value={formData.adresse_assure}
                  onChange={(v) => setFormData({ ...formData, adresse_assure: v })}
                  placeholder="Ex: Quartier Louis"
                  required
                  error={errors.adresse_assure}
                  disabled={!isSection2Enabled}
                />
                <div className="grid grid-cols-3 gap-2 overflow-hidden">
                  <div className="overflow-hidden">
                    <FormInput
                      label="Tél :"
                      value={formData.telephone_assure}
                      onChange={(v) => setFormData({ ...formData, telephone_assure: v })}
                      placeholder="06XXXXXX"
                      required
                      error={errors.telephone_assure}
                      disabled={!isSection2Enabled}
                    />
                  </div>
                  <div className="overflow-hidden">
                    <FormInput
                      label="Ville :"
                      value={formData.ville_assure}
                      onChange={(v) => setFormData({ ...formData, ville_assure: v })}
                      placeholder="Libreville"
                      error={errors.ville_assure}
                      disabled={!isSection2Enabled}
                    />
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-end w-full">
                      <span className="mr-1 whitespace-nowrap text-sm text-gray-800">Email:</span>
                      <input
                        type="email"
                        value={formData.email_assure}
                        onChange={(e) => setFormData({ ...formData, email_assure: e.target.value })}
                        placeholder="email@ex.com"
                        disabled={!isSection2Enabled}
                        className={`w-full border-b border-gray-800 bg-transparent text-sm px-1 py-0.5 focus:outline-none focus:border-[#F48232] ${!isSection2Enabled ? 'cursor-not-allowed' : ''}`}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex items-start gap-x-4">
                    <span className="text-sm text-gray-800 whitespace-nowrap pt-0.5">Catégorie :</span>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                      <Checkbox
                        label="Commerçants"
                        checked={formData.categorie === 'commercants'}
                        onChange={() => setFormData({ ...formData, categorie: 'commercants', garantie_vip: false })}
                        disabled={!isSection2Enabled}
                      />
                      <Checkbox
                        label="Salariés du public"
                        checked={formData.categorie === 'salaries_public'}
                        onChange={() => setFormData({ ...formData, categorie: 'salaries_public', garantie_vip: false })}
                        disabled={!isSection2Enabled}
                      />
                      <Checkbox
                        label="Salariés du privé"
                        checked={formData.categorie === 'salaries_prive'}
                        onChange={() => setFormData({ ...formData, categorie: 'salaries_prive', garantie_vip: false })}
                        disabled={!isSection2Enabled}
                      />
                      <Checkbox
                        label="Retraités"
                        checked={formData.categorie === 'retraites'}
                        onChange={() => setFormData({ ...formData, categorie: 'retraites', garantie_vip: false })}
                        disabled={!isSection2Enabled}
                      />
                      <div className="flex items-center col-span-2">
                        <Checkbox
                          label="Autre :"
                          checked={formData.categorie === 'autre'}
                          onChange={() => setFormData({ ...formData, categorie: 'autre', garantie_vip: false })}
                          disabled={!isSection2Enabled}
                        />
                        <input
                          type="text"
                          value={formData.autre_categorie_precision}
                          onChange={(e) => setFormData({ ...formData, autre_categorie_precision: e.target.value })}
                          className="border-b border-gray-400 flex-grow bg-transparent focus:outline-none focus:border-[#F48232] text-sm ml-1"
                          placeholder="Préciser..."
                          disabled={!isSection2Enabled || formData.categorie !== 'autre'}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Souscripteur / EMF */}
            <div className={`flex border-b border-[#F48232] ${!isSection3Enabled ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="w-32 flex-shrink-0 p-3 bg-orange-50 italic border-r border-[#F48232] flex flex-col justify-center text-gray-900 font-serif text-xs">
                <span>Souscripteur / EMF</span>
                {!isSection3Enabled && <span className="text-[10px] text-orange-600 mt-1">🔒 Remplir Assuré</span>}
              </div>
              <div className="flex-grow p-2 space-y-2 text-xs overflow-hidden">
                <div className="flex items-end">
                  <span className="mr-2 whitespace-nowrap text-gray-800 text-sm">Raison sociale :</span>
                  <span className="font-bold text-sm truncate">EDG « Epargne et Développement du Gabon »</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-end">
                    <span className="mr-2 whitespace-nowrap text-gray-800 text-sm">Adresse :</span>
                    <span className="font-medium text-sm">B.P. 14.736 Libreville</span>
                  </div>
                  <FormInput
                    label="Agence :"
                    value={formData.agence}
                    onChange={(v) => setFormData({ ...formData, agence: v })}
                    placeholder="Agence Centre"
                    disabled={!isSection3Enabled}
                  />
                </div>
                <div className="flex items-end text-sm">
                  <span className="text-gray-800">Tél : 065 08 05 69 | Email : service.clientele@edgmfgabon.com</span>
                </div>
              </div>
            </div>

            {/* Section: Compte Protégé+ / Bénéficiaire */}
            <div className={`flex border-b border-[#F48232] ${!isSection4Enabled ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="w-32 flex-shrink-0 p-3 bg-orange-50 italic border-r border-[#F48232] flex flex-col justify-center text-gray-900 font-serif text-xs">
                <span>Compte Protégé+</span>
                {!isSection4Enabled && <span className="text-[10px] text-orange-600 mt-1">🔒 Remplir Assuré</span>}
              </div>
              <div className="flex-grow min-w-0 p-2 space-y-2">
                <div className="flex items-end gap-2">
                  <span className="text-sm text-gray-800 whitespace-nowrap flex-shrink-0">N° Compte :</span>
                  <input
                    type="text"
                    value={formData.numero_compte_protege}
                    onChange={(e) => setFormData({ ...formData, numero_compte_protege: e.target.value })}
                    placeholder="Ex: CP-2024-001234"
                    disabled={!isSection4Enabled}
                    className="flex-1 min-w-0 border-b border-gray-800 bg-transparent text-sm px-1 py-0.5 focus:outline-none focus:border-[#F48232]"
                  />
                </div>
                <div className="flex items-end gap-4">
                  <div className="flex items-end gap-2 flex-1 min-w-0">
                    <span className="text-sm text-gray-800 whitespace-nowrap flex-shrink-0">Bénéficiaire :</span>
                    <input
                      type="text"
                      value={formData.beneficiaire_deces}
                      onChange={(e) => setFormData({ ...formData, beneficiaire_deces: e.target.value })}
                      placeholder="Nom complet"
                      disabled={!isSection4Enabled}
                      className="flex-1 min-w-0 border-b border-gray-800 bg-transparent text-sm px-1 py-0.5 focus:outline-none focus:border-[#F48232]"
                    />
                  </div>
                  <div className="flex items-end gap-2 w-36 flex-shrink-0">
                    <span className="text-sm text-gray-800 whitespace-nowrap">Tél :</span>
                    <input
                      type="text"
                      value={formData.beneficiaire_telephone}
                      onChange={(e) => setFormData({ ...formData, beneficiaire_telephone: e.target.value })}
                      placeholder="06XXXXXX"
                      disabled={!isSection4Enabled}
                      className="flex-1 min-w-0 border-b border-gray-800 bg-transparent text-sm px-1 py-0.5 focus:outline-none focus:border-[#F48232]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Garanties */}
            <div className={`flex border-b border-[#F48232] ${!isSection5Enabled ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="w-32 flex-shrink-0 p-3 bg-orange-50 italic border-r border-[#F48232] flex flex-col justify-center text-gray-900 font-serif text-xs">
                <span>Garanties</span>
                {!isSection5Enabled && <span className="text-[10px] text-orange-600 mt-1">🔒 Remplir Assuré</span>}
              </div>
              <div className="flex-grow">
                <table className="w-full text-center text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#F48232] font-bold bg-orange-100">
                      <th className="p-1 border-r border-[#F48232] w-[40%]">Garanties</th>
                      <th className="p-1 border-r border-[#F48232] w-[25%]">Type de cible</th>
                      <th className="p-1 border-r border-[#F48232] w-[10%]">Option</th>
                      <th className="p-1 border-r border-[#F48232] w-[10%]">Taux</th>
                      <th className="p-1 w-[15%]">Prime unique</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Row 1: Compte Protégé+ */}
                    <tr className={`border-b border-[#F48232] bg-white hover:bg-orange-50/50 ${formData.garantie_compte_protege ? 'bg-orange-50' : ''}`}>
                      <td className="p-1 border-r border-[#F48232] text-left pl-2 font-medium bg-gray-100">Compte Protégé+</td>
                      <td className="p-1 border-r border-[#F48232] text-[#F48232]">Toute catégorie</td>
                      <td className="p-1 border-r border-[#F48232]">
                        <label className={`flex justify-center ${isSection5Enabled ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                          <input
                            type="checkbox"
                            checked={formData.garantie_compte_protege}
                            onChange={(e) => setFormData({ ...formData, garantie_compte_protege: e.target.checked })}
                            disabled={!isSection5Enabled}
                            className="sr-only"
                          />
                          <div className="w-8 h-4 border border-black rounded-sm flex items-center justify-center bg-white">
                            {formData.garantie_compte_protege && (
                              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </label>
                      </td>
                      <td className="p-1 border-r border-[#F48232] text-[#F48232]">N/A</td>
                      <td className="p-1 text-[#F48232] font-bold">15.000</td>
                    </tr>
                    {/* Row 2: Assurance Crédits Décès/IAD */}
                    <tr className={`border-b border-[#F48232] bg-white hover:bg-orange-50/50 ${formData.garantie_deces_iad && !isVip ? 'bg-orange-50' : ''}`}>
                      <td className="p-1 border-r border-[#F48232] text-left pl-2 font-medium bg-gray-100">Assurance Crédits Décès/IAD</td>
                      <td className="p-1 border-r border-[#F48232] text-[#F48232]">Toute catégorie</td>
                      <td className="p-1 border-r border-[#F48232]">
                        <label className={`flex justify-center ${isSection5Enabled ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                          <input
                            type="radio"
                            name="type_contrat"
                            checked={formData.garantie_deces_iad && !formData.garantie_vip}
                            onChange={() => setFormData({ ...formData, garantie_deces_iad: true, garantie_vip: false, categorie: formData.categorie === 'vip' ? '' : formData.categorie })}
                            disabled={!isSection5Enabled}
                            className="sr-only"
                          />
                          <div className="w-8 h-4 border border-black rounded-sm flex items-center justify-center bg-white">
                            {formData.garantie_deces_iad && !formData.garantie_vip && (
                              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </label>
                      </td>
                      <td className="p-1 border-r border-[#F48232] text-[#F48232] font-bold">2,50%</td>
                      <td className="p-1 text-[#F48232]">N/A</td>
                    </tr>
                    {/* Row 3: Assurance Crédits Décès/IAD - VIP */}
                    <tr className={`bg-white hover:bg-orange-50/50 ${formData.garantie_vip ? 'bg-orange-50' : ''}`}>
                      <td className="p-1 border-r border-[#F48232] text-left pl-2 font-medium bg-gray-100">Assurance Crédits Décès/IAD - VIP</td>
                      <td className="p-1 border-r border-[#F48232] text-[#F48232] font-bold">VIP</td>
                      <td className="p-1 border-r border-[#F48232]">
                        <label className={`flex justify-center ${isSection5Enabled ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                          <input
                            type="radio"
                            name="type_contrat"
                            checked={formData.garantie_vip}
                            onChange={() => setFormData({ ...formData, garantie_deces_iad: true, garantie_vip: true, categorie: 'vip' })}
                            disabled={!isSection5Enabled}
                            className="sr-only"
                          />
                          <div className="w-8 h-4 border border-black rounded-sm flex items-center justify-center bg-white">
                            {formData.garantie_vip && (
                              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </label>
                      </td>
                      <td className="p-1 border-r border-[#F48232] text-[#F48232] font-bold">3,50%</td>
                      <td className="p-1 text-[#F48232]">N/A</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section: Cotisations */}
            <div className="flex bg-orange-50 border-t border-[#F48232]">
              <div className="w-32 flex-shrink-0 p-3 italic border-r border-[#F48232] flex items-center text-gray-900 font-serif text-xs">Cotisations</div>
              <div className="flex-grow p-3">
                <div className="font-bold flex items-end text-sm">
                  <span className="whitespace-nowrap">Cotisation totale :</span>
                  <span className="flex-grow mx-2 border-b-2 border-black text-center font-mono text-lg text-[#F48232]">
                    {cotisationTotale > 0 ? formatCurrency(cotisationTotale) : '___________'}
                  </span>
                  <span className="whitespace-nowrap">FCFA TTC (Montant prêt x taux) + 15.000 FCFA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footnotes */}
          <div className="mt-4 text-[10px] font-bold space-y-1 text-black">
            <p>
              (1) Le capital garanti maximum du Compte Protégé est de FCFA 250.000 par compte.
            </p>
            <p>
              (2) Le montant maximal du prêt couvert est de 65.000.000 FCFA pour les VIP et de 25.000.000 FCFA pour les autres catégories
            </p>
            <p>
              (3) La durée maximale de couverture est de 36 mois pour les VIP et de 60 mois pour les autres catégories.
            </p>
            <p>
              (4) Âge maximum de couverture : 70 ans.
            </p>
          </div>

          {/* Signatures */}
          <div className="mt-auto mb-4">
            <div className="text-right mb-6 pr-4 font-medium">
              Fait à <input
                type="text"
                value={formData.lieu_signature}
                onChange={(e) => setFormData({ ...formData, lieu_signature: e.target.value })}
                className="border-b border-black w-32 inline-block mx-1 text-center font-handwriting bg-transparent focus:outline-none focus:border-[#F48232]"
              />, le <input
                type="text"
                value={formData.date_signature ? new Date(formData.date_signature).toLocaleDateString('fr-FR', { day: '2-digit' }) : ''}
                readOnly
                className="border-b border-black w-8 text-center inline-block bg-transparent"
              /> / <input
                type="text"
                value={formData.date_signature ? new Date(formData.date_signature).toLocaleDateString('fr-FR', { month: '2-digit' }) : ''}
                readOnly
                className="border-b border-black w-8 text-center inline-block bg-transparent"
              /> / <input
                type="text"
                value={formData.date_signature ? new Date(formData.date_signature).toLocaleDateString('fr-FR', { year: 'numeric' }) : ''}
                readOnly
                className="border-b border-black w-12 text-center inline-block bg-transparent"
              />
            </div>

            <div className="flex justify-between items-start pt-2">
              <div className="w-[45%] flex flex-col">
                <span className="font-bold mb-2 ml-4">L'Assuré</span>
                <div className="border border-black h-24 w-full flex items-center justify-center text-gray-300 text-sm bg-white shadow-sm">
                  Signature
                </div>
              </div>

              <div className="w-[45%] flex flex-col">
                <span className="font-bold mb-2 text-right mr-4">Le Souscripteur EDG P/C L'Assureur</span>
                <div className="border border-black h-24 w-full flex items-center justify-center text-gray-300 text-sm bg-white shadow-sm">
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
                Créer le Contrat EDG
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Modal de résultat de création */}
      <LimitesDepasseesModal
        isOpen={showLimitesModal}
        onClose={() => setShowLimitesModal(false)}
        onNavigate={() => {
          if (createdContrat) {
            navigate(`/contrats/edg/${createdContrat.id}`, {
              state: { success: createdContrat.statut === 'actif' ? 'Contrat créé avec succès !' : 'Contrat créé en attente de validation.' }
            })
          }
        }}
        contrat={createdContrat}
        emfType="edg"
      />
    </div>
  )
}

export default EdgContractCreateOfficial
