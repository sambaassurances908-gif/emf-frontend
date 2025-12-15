import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, CheckCircle, AlertCircle, Mail, Phone, MapPin, Printer } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { useCreateSodecContract } from '@/hooks/useCreateSodecContract'
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

export const SodecContractCreateOfficial = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  // ═══════════════════════════════════════════════════════════════════
  // 🔒 VÉRIFICATION EMF - SODEC = emf_id 5
  // ═══════════════════════════════════════════════════════════════════
  const userEmfId = user?.emf_id
  const userEmfSigle = user?.emf?.sigle?.toUpperCase() || ''
  const isSodecUser = userEmfId === 5 || userEmfSigle.includes('SODEC') || user?.role === 'admin'
  const emfName = userEmfSigle || (userEmfId === 1 ? 'BAMBOO' : userEmfId === 2 ? 'COFIDEC' : userEmfId === 3 ? 'BCEG' : userEmfId === 4 ? 'EDG' : userEmfId === 5 ? 'SODEC' : 'inconnu')

  // IMPORTANT: Toujours utiliser emf_id = 5 pour SODEC (pas depuis user qui peut être incorrect)
  const emfId = 5

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
    option_prevoyance: '' as 'option_a' | 'option_b' | '',
    montant_pret_assure: '',
    duree_pret_mois: '',
    date_effet: '',
    date_fin_echeance: '',
    // Bénéficiaire complet
    beneficiaire_deces_nom: '',
    beneficiaire_deces_prenom: '',
    beneficiaire_deces_date_naissance: '',
    beneficiaire_deces_lieu_naissance: '',
    beneficiaire_deces_contact: '',
    garantie_perte_emploi: false,
    agence: '',
    lieu_signature: 'Libreville',
    date_signature: new Date().toISOString().split('T')[0]
  })

  const [assuresAssocies, setAssuresAssocies] = useState({
    conjoint: { nom: '', prenom: '', date_naissance: '', lieu_naissance: '', contact: '' },
    enfant1: { nom: '', prenom: '', date_naissance: '', lieu_naissance: '', contact: '' },
    enfant2: { nom: '', prenom: '', date_naissance: '', lieu_naissance: '', contact: '' },
    enfant3: { nom: '', prenom: '', date_naissance: '', lieu_naissance: '', contact: '' },
    enfant4: { nom: '', prenom: '', date_naissance: '', lieu_naissance: '', contact: '' },
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState('')
  const [showLimitesModal, setShowLimitesModal] = useState(false)
  const [createdContrat, setCreatedContrat] = useState<ContratCreationResponse | null>(null)

  // ═══════════════════════════════════════════════════════════════════
  // 🔒 VALIDATION PROGRESSIVE - Activation des sections par étapes
  // ═══════════════════════════════════════════════════════════════════
  
  // Section 1: Couverture Prêt (toujours active) - Option prévoyance n'est pas obligatoire pour débloquer
  const isSection1Complete = Boolean(
    formData.montant_pret_assure && 
    formData.duree_pret_mois && 
    formData.date_effet
  )

  // Section 2: Assuré (active si Section 1 complète)
  const isSection2Enabled = isSection1Complete
  const isSection2Complete = Boolean(
    formData.nom_prenom.trim() && 
    formData.adresse_assure.trim() && 
    formData.ville_assure.trim() && 
    formData.telephone_assure.trim() &&
    formData.categorie
  )

  // Section 3+ (active si Section 2 complète)
  const isSection3Enabled = isSection2Complete
  const isSection4Enabled = isSection2Complete
  const isSection5Enabled = isSection2Complete

  // Bouton de création: actif si tous les champs obligatoires sont remplis
  const isFormComplete = isSection1Complete && isSection2Complete

  const { mutate: createContract, isPending, isSuccess, isError, error } = useCreateSodecContract()

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
    if (isError && error?.response?.status === 422) {
      const validationErrors = error.response.data.errors || {}
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

  // Calcul cotisation
  const montant = parseInt(formData.montant_pret_assure) || 0
  const duree = parseInt(formData.duree_pret_mois) || 0
  const cotisationPrevoyance = formData.option_prevoyance === 'option_a' ? 30000 : formData.option_prevoyance === 'option_b' ? 15000 : 0
  const tauxDeces = 0.015
  const tauxPerteEmploi = formData.garantie_perte_emploi ? 0.025 : 0  // 2,5% pour perte d'emploi
  const cotisationTotale = cotisationPrevoyance + (montant * tauxDeces) + (montant * tauxPerteEmploi)

  // Validation des règles métier pour statut "actif"
  const isRetraite = formData.categorie === 'retraites'
  const montantMaxPret = isRetraite ? 5000000 : 20000000
  const dureeMaxDeces = isRetraite ? 36 : 72
  const dureeMaxPerteEmploi = 48
  const montantMaxPerteEmploi = 5000000

  const validateBusinessRules = () => {
    const warnings: string[] = []
    
    // (1) Prévoyance décès max
    // Option A: 2.000.000 FCFA max, Option B: 1.000.000 FCFA max
    // Ces montants sont fixes, pas de validation nécessaire
    
    // (2) Montant max prêt
    if (montant > montantMaxPret) {
      warnings.push(`Montant prêt (${formatCurrency(montant)}) dépasse le max ${isRetraite ? 'retraités' : 'autres'}: ${formatCurrency(montantMaxPret)}`)
    }
    
    // (3) Durée max décès
    if (duree > dureeMaxDeces) {
      warnings.push(`Durée (${duree} mois) dépasse le max ${isRetraite ? 'retraités' : 'autres'}: ${dureeMaxDeces} mois`)
    }
    
    // (4) Perte d'emploi: durée max 48 mois, montant max 5.000.000
    if (formData.garantie_perte_emploi) {
      if (duree > dureeMaxPerteEmploi) {
        warnings.push(`Perte d'emploi: durée (${duree} mois) dépasse max: ${dureeMaxPerteEmploi} mois`)
      }
      if (montant > montantMaxPerteEmploi) {
        warnings.push(`Perte d'emploi: montant (${formatCurrency(montant)}) dépasse max: ${formatCurrency(montantMaxPerteEmploi)}`)
      }
    }
    
    return warnings
  }

  const businessWarnings = validateBusinessRules()
  const isContractValid = businessWarnings.length === 0

  // ═══════════════════════════════════════════════════════════════════
  // 🔒 VÉRIFICATION D'ACCÈS - Après tous les hooks (Rules of Hooks)
  // ═══════════════════════════════════════════════════════════════════
  if (!isSodecUser) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-[210mm] mx-auto">
          <div className="bg-red-50 border border-red-300 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-red-700 mb-2">Accès non autorisé</h1>
            <p className="text-red-600 mb-4">
              Vous êtes connecté avec un compte <strong>{emfName}</strong>.
              <br />
              Ce formulaire est réservé aux utilisateurs SODEC.
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

  const categories = [
    { key: 'commercants' as const, label: 'Commerçants' },
    { key: 'salaries_public' as const, label: 'Salariés du public' },
    { key: 'salaries_prive' as const, label: 'Salariés du privé' },
    { key: 'retraites' as const, label: 'Retraités' },
  ]

  // Label catégorie pour affichage
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
      // ═══════════════════════════════════════════════════════════════
      // ÉTAPE 1: VALIDATION DES CHAMPS OBLIGATOIRES
      // ═══════════════════════════════════════════════════════════════
      console.log('📋 ÉTAPE 1: Validation des champs obligatoires...')
      
      const newErrors: Record<string, string> = {}
      
      // Informations de l'assuré principal
      if (!formData.nom_prenom.trim()) {
        newErrors.nom_prenom = 'Le nom et prénom sont obligatoires'
        console.error('❌ Champ manquant: nom_prenom')
      }
      if (!formData.adresse_assure.trim()) {
        newErrors.adresse_assure = 'L\'adresse est obligatoire'
        console.error('❌ Champ manquant: adresse_assure')
      }
      if (!formData.ville_assure.trim()) {
        newErrors.ville_assure = 'La ville est obligatoire'
        console.error('❌ Champ manquant: ville_assure')
      }
      if (!formData.telephone_assure.trim()) {
        newErrors.telephone_assure = 'Le téléphone est obligatoire'
        console.error('❌ Champ manquant: telephone_assure')
      }
      
      // Informations du prêt
      if (!formData.montant_pret_assure) {
        newErrors.montant_pret_assure = 'Le montant du prêt est obligatoire'
        console.error('❌ Champ manquant: montant_pret_assure')
      }
      if (!formData.duree_pret_mois) {
        newErrors.duree_pret_mois = 'La durée du prêt est obligatoire'
        console.error('❌ Champ manquant: duree_pret_mois')
      }
      if (!formData.date_effet) {
        newErrors.date_effet = 'La date d\'effet est obligatoire'
        console.error('❌ Champ manquant: date_effet')
      }
      
      // Options et catégorie
      if (!formData.option_prevoyance) {
        newErrors.option_prevoyance = 'Veuillez sélectionner Option A ou Option B'
        console.error('❌ Champ manquant: option_prevoyance (Option A ou B)')
      }
      if (!formData.categorie) {
        newErrors.categorie = 'Veuillez sélectionner une catégorie (Commerçants, Salariés, etc.)'
        console.error('❌ Champ manquant: categorie')
      }

      // Si des erreurs de validation, on affiche les détails
      if (Object.keys(newErrors).length > 0) {
        console.error('═══════════════════════════════════════════════════════════════')
        console.error('❌ VALIDATION ÉCHOUÉE - Champs manquants:')
        Object.entries(newErrors).forEach(([field, message]) => {
          console.error(`   • ${field}: ${message}`)
        })
        console.error('═══════════════════════════════════════════════════════════════')
        
        setErrors(newErrors)
        setSubmitError(`⚠️ ${Object.keys(newErrors).length} champ(s) obligatoire(s) manquant(s):\n${Object.values(newErrors).join('\n')}`)
        return
      }
      
      console.log('✅ ÉTAPE 1: Tous les champs obligatoires sont remplis')

      // ═══════════════════════════════════════════════════════════════
      // ÉTAPE 2: VÉRIFICATION DES RÈGLES MÉTIER
      // ═══════════════════════════════════════════════════════════════
      console.log('📋 ÉTAPE 2: Vérification des règles métier...')
      
      if (businessWarnings.length > 0) {
        console.warn('⚠️ Avertissements règles métier:', businessWarnings)
        const confirmContinue = window.confirm(
          `⚠️ Attention: Le contrat ne respecte pas certaines conditions:\n\n${businessWarnings.join('\n')}\n\nLe contrat sera créé avec le statut "En attente".\n\nContinuer quand même ?`
        )
        if (!confirmContinue) {
          console.log('🚫 Création annulée par l\'utilisateur')
          return
        }
      }
      
      console.log('✅ ÉTAPE 2: Règles métier validées')

      // ═══════════════════════════════════════════════════════════════
      // ÉTAPE 3: CONSTRUCTION DES ASSURÉS ASSOCIÉS
      // ═══════════════════════════════════════════════════════════════
      console.log('📋 ÉTAPE 3: Construction des assurés associés...')
      
      const assuresArray: Array<{
        type_assure: string
        nom: string
        prenom: string
        date_naissance: string
        lieu_naissance: string
        contact?: string
      }> = []
      
      // Conjoint
      if (assuresAssocies.conjoint.nom?.trim() && assuresAssocies.conjoint.lieu_naissance?.trim()) {
        assuresArray.push({ 
          type_assure: 'conjoint', 
          nom: assuresAssocies.conjoint.nom.trim(),
          prenom: assuresAssocies.conjoint.prenom?.trim() || '',
          date_naissance: assuresAssocies.conjoint.date_naissance || '',
          lieu_naissance: assuresAssocies.conjoint.lieu_naissance.trim(),
          contact: assuresAssocies.conjoint.contact?.trim() || ''
        })
        console.log('   ✓ Conjoint ajouté:', assuresAssocies.conjoint.nom)
      }
      
      // Enfant 1
      if (assuresAssocies.enfant1.nom?.trim() && assuresAssocies.enfant1.lieu_naissance?.trim()) {
        assuresArray.push({ 
          type_assure: 'enfant_1', 
          nom: assuresAssocies.enfant1.nom.trim(),
          prenom: assuresAssocies.enfant1.prenom?.trim() || '',
          date_naissance: assuresAssocies.enfant1.date_naissance || '',
          lieu_naissance: assuresAssocies.enfant1.lieu_naissance.trim(),
          contact: assuresAssocies.enfant1.contact?.trim() || ''
        })
        console.log('   ✓ Enfant 1 ajouté:', assuresAssocies.enfant1.nom)
      }
      
      // Enfant 2
      if (assuresAssocies.enfant2.nom?.trim() && assuresAssocies.enfant2.lieu_naissance?.trim()) {
        assuresArray.push({ 
          type_assure: 'enfant_2', 
          nom: assuresAssocies.enfant2.nom.trim(),
          prenom: assuresAssocies.enfant2.prenom?.trim() || '',
          date_naissance: assuresAssocies.enfant2.date_naissance || '',
          lieu_naissance: assuresAssocies.enfant2.lieu_naissance.trim(),
          contact: assuresAssocies.enfant2.contact?.trim() || ''
        })
        console.log('   ✓ Enfant 2 ajouté:', assuresAssocies.enfant2.nom)
      }
      
      // Enfant 3
      if (assuresAssocies.enfant3.nom?.trim() && assuresAssocies.enfant3.lieu_naissance?.trim()) {
        assuresArray.push({ 
          type_assure: 'enfant_3', 
          nom: assuresAssocies.enfant3.nom.trim(),
          prenom: assuresAssocies.enfant3.prenom?.trim() || '',
          date_naissance: assuresAssocies.enfant3.date_naissance || '',
          lieu_naissance: assuresAssocies.enfant3.lieu_naissance.trim(),
          contact: assuresAssocies.enfant3.contact?.trim() || ''
        })
        console.log('   ✓ Enfant 3 ajouté:', assuresAssocies.enfant3.nom)
      }
      
      // Enfant 4
      if (assuresAssocies.enfant4.nom?.trim() && assuresAssocies.enfant4.lieu_naissance?.trim()) {
        assuresArray.push({ 
          type_assure: 'enfant_4', 
          nom: assuresAssocies.enfant4.nom.trim(),
          prenom: assuresAssocies.enfant4.prenom?.trim() || '',
          date_naissance: assuresAssocies.enfant4.date_naissance || '',
          lieu_naissance: assuresAssocies.enfant4.lieu_naissance.trim(),
          contact: assuresAssocies.enfant4.contact?.trim() || ''
        })
        console.log('   ✓ Enfant 4 ajouté:', assuresAssocies.enfant4.nom)
      }

      console.log(`✅ ÉTAPE 3: ${assuresArray.length} assuré(s) associé(s) préparé(s)`)

      // ═══════════════════════════════════════════════════════════════
      // ÉTAPE 4: CONSTRUCTION DU PAYLOAD
      // ═══════════════════════════════════════════════════════════════
      console.log('📋 ÉTAPE 4: Construction du payload...')

      const payload = {
        emf_id: Number(formData.emf_id),
        nom_prenom: formData.nom_prenom.trim(),
        adresse_assure: formData.adresse_assure.trim(),
        ville_assure: formData.ville_assure.trim(),
        telephone_assure: formData.telephone_assure.trim(),
        email_assure: formData.email_assure?.trim() || null,
        numero_police: formData.numero_police?.trim() || null,
        categorie: formData.categorie as 'commercants' | 'salaries_public' | 'salaries_prive' | 'retraites' | 'autre',
        autre_categorie_precision: formData.autre_categorie_precision?.trim() || null,
        option_prevoyance: formData.option_prevoyance as 'option_a' | 'option_b',
        montant_pret_assure: parseInt(formData.montant_pret_assure),
        duree_pret_mois: parseInt(formData.duree_pret_mois),
        date_effet: formData.date_effet,
        beneficiaire_deces: `${formData.beneficiaire_deces_nom} ${formData.beneficiaire_deces_prenom}`.trim() || null,
        beneficiaire_nom: formData.beneficiaire_deces_nom?.trim() || null,
        beneficiaire_prenom: formData.beneficiaire_deces_prenom?.trim() || null,
        beneficiaire_date_naissance: formData.beneficiaire_deces_date_naissance || null,
        beneficiaire_lieu_naissance: formData.beneficiaire_deces_lieu_naissance?.trim() || null,
        beneficiaire_contact: formData.beneficiaire_deces_contact?.trim() || null,
        garantie_prevoyance: true,
        garantie_deces_iad: true,
        garantie_perte_emploi: formData.garantie_perte_emploi,
        type_contrat_travail: (formData.garantie_perte_emploi ? 'cdi' : 'non_applicable') as 'cdi' | 'cdd_plus_9_mois' | 'cdd_moins_9_mois' | 'non_applicable',
        agence: formData.agence?.trim() || null,
        lieu_signature: formData.lieu_signature?.trim() || 'Libreville',
        date_signature: formData.date_signature || new Date().toISOString().split('T')[0],
        statut: (isContractValid ? 'actif' : 'en_attente') as 'actif' | 'en_attente',
        ...(assuresArray.length > 0 ? { assures_associes: assuresArray } : {})
      }

      console.log('✅ ÉTAPE 4: Payload construit')
      console.log('📤 Payload à envoyer:', JSON.stringify(payload, null, 2))

      // ═══════════════════════════════════════════════════════════════
      // ÉTAPE 5: ENVOI AU SERVEUR
      // ═══════════════════════════════════════════════════════════════
      console.log('📋 ÉTAPE 5: Envoi au serveur...')

      createContract(payload, {
        onSuccess: (data) => {
          console.log('═══════════════════════════════════════════════════════════════')
          console.log('✅ SUCCÈS: Contrat créé avec succès!')
          console.log('   ID:', data.data.id)
          console.log('   Numéro police:', data.data.numero_police)
          console.log('   Statut:', data.data.statut)
          console.log('   Limites dépassées:', data.data.limites_depassees)
          console.log('═══════════════════════════════════════════════════════════════')
          
          // Afficher le modal avec le résultat
          setCreatedContrat({
            id: data.data.id,
            numero_police: data.data.numero_police,
            statut: data.data.statut,
            limites_depassees: data.data.limites_depassees || false,
            motif_attente: data.data.motif_attente || null
          })
          setShowLimitesModal(true)
        },
        onError: (error: any) => {
          console.error('═══════════════════════════════════════════════════════════════')
          console.error('❌ ERREUR lors de la création du contrat')
          console.error('   Status:', error.response?.status)
          console.error('   Message:', error.response?.data?.message || error.message)
          
          if (error.response?.data?.errors) {
            console.error('   Erreurs de validation:')
            Object.entries(error.response.data.errors).forEach(([field, msgs]) => {
              console.error(`      • ${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            })
          }
          console.error('═══════════════════════════════════════════════════════════════')
          
          // Afficher erreur utilisateur
          if (error.response?.status === 422) {
            const validationErrors = error.response.data.errors || {}
            const errorMessages = Object.entries(validationErrors)
              .map(([field, msgs]) => `• ${field}: ${Array.isArray(msgs) ? msgs[0] : msgs}`)
              .join('\n')
            setSubmitError(`❌ Erreurs de validation:\n${errorMessages}`)
          } else if (error.response?.status === 500) {
            setSubmitError(`❌ Erreur serveur: ${error.response.data?.message || 'Erreur interne du serveur'}`)
          } else {
            setSubmitError(`❌ Erreur: ${error.message || 'Erreur inconnue'}`)
          }
        }
      })

    } catch (error: any) {
      // ═══════════════════════════════════════════════════════════════
      // GESTION DES ERREURS INATTENDUES
      // ═══════════════════════════════════════════════════════════════
      console.error('═══════════════════════════════════════════════════════════════')
      console.error('💥 ERREUR INATTENDUE dans handleSubmit')
      console.error('   Type:', error.name)
      console.error('   Message:', error.message)
      console.error('   Stack:', error.stack)
      console.error('═══════════════════════════════════════════════════════════════')
      
      setSubmitError(`💥 Erreur inattendue: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-4 px-4">
      {/* Toolbar */}
      <div className="max-w-[210mm] mx-auto mb-4 flex items-center justify-between bg-white rounded-lg shadow p-3">
        <Button variant="ghost" onClick={() => navigate('/contrats/sodec')} className="hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 mr-1" />
          Retour à la liste
        </Button>
        <h1 className="text-lg font-bold text-[#F48232]">Nouveau Contrat SODEC</h1>
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
          <span>{submitError}</span>
        </div>
      )}

      {/* Avertissements règles métier */}
      {businessWarnings.length > 0 && (
        <div className="max-w-[210mm] mx-auto mb-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg text-yellow-800">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5" />
            <span className="font-bold">⚠️ Conditions non respectées (le contrat sera créé avec statut "En attente")</span>
          </div>
          <ul className="list-disc list-inside text-sm space-y-1">
            {businessWarnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      {/* Indicateur de statut prévu */}
      <div className="max-w-[210mm] mx-auto mb-4 flex items-center justify-center gap-2">
        <span className="text-sm text-gray-600">Statut prévu :</span>
        {isContractValid ? (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1">
            <CheckCircle className="h-4 w-4" /> Actif
          </span>
        ) : (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium flex items-center gap-1">
            <AlertCircle className="h-4 w-4" /> En attente
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
            ⚠️ Remplissez d'abord les informations du prêt (Montant, Durée, Date d'effet, Option) pour débloquer la section Assuré.
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
        <div className="bg-white w-[210mm] min-h-[297mm] p-[6mm] shadow-xl relative flex flex-col mx-auto">
          
          {/* Header */}
          <div className="flex flex-col items-center mb-0">
            <div className="mb-0">
              <img src={logoSamba} alt="SAMB'A Assurances" className="h-[85px] w-auto" />
            </div>
            <h1 className="text-[#F48232] text-base font-bold uppercase text-center leading-none">
              Contrat Prévoyance Crédits SODEC
            </h1>
            <p className="text-[8px] text-gray-500">Contrat régi par les dispositions du Code des assurances CIMA</p>
            <div className="text-[9px] font-bold text-gray-700 leading-tight">
              Visas DNA N°005/24 et N°008/24
            </div>
            <div className="text-[9px] font-bold text-gray-700 leading-tight">
              Convention N° : 502.111.112/0125
            </div>
            <h2 className="text-[#F48232] text-sm font-bold uppercase">
              Conditions Particulières
            </h2>
          </div>

          {/* Form Body - Table Structure */}
          <div className="border border-[#F48232] w-full flex flex-col text-[10px]">
            
            {/* Section: Couverture */}
            <div className="flex border-b border-[#F48232]">
              <div className="w-24 flex-shrink-0 p-1.5 bg-orange-50 italic border-r border-[#F48232] flex items-center text-xs">
                Couverture
              </div>
              <div className="flex-grow p-1.5 grid grid-cols-2 gap-x-4 gap-y-1">
                <FormInput 
                  label="Numéro de police :" 
                  value={formData.numero_police}
                  onChange={(v) => setFormData({...formData, numero_police: v})}
                  placeholder="Auto-généré"
                />
                <div className="col-span-1"></div>
                <FormInput 
                  label="Montant du prêt assuré :" 
                  value={formData.montant_pret_assure}
                  onChange={(v) => setFormData({...formData, montant_pret_assure: v})}
                  type="number"
                  placeholder="Ex: 5000000"
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

            {/* Section: Assuré principal */}
            <div className={`flex border-b border-[#F48232] ${!isSection2Enabled ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="w-24 flex-shrink-0 p-1.5 bg-orange-50 italic border-r border-[#F48232] flex flex-col justify-center text-xs">
                Assuré principal<br/>
                <span className="text-[9px] not-italic">Personne assurée</span>
                {!isSection2Enabled && <span className="text-[10px] text-orange-600 mt-1">🔒 Remplir Prêt</span>}
              </div>
              <div className="flex-grow p-1.5 space-y-1">
                <FormInput 
                  label="Nom & Prénom :" 
                  value={formData.nom_prenom}
                  onChange={(v) => setFormData({...formData, nom_prenom: v})}
                  placeholder="Ex: Jean NGUEMA"
                  required
                  error={errors.nom_prenom}
                  disabled={!isSection2Enabled}
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
                    disabled={!isSection2Enabled}
                  />
                  <FormInput 
                    label="Ville :" 
                    value={formData.ville_assure}
                    onChange={(v) => setFormData({...formData, ville_assure: v})}
                    placeholder="Ex: Libreville"
                    required
                    error={errors.ville_assure}
                    className="flex-grow-[1]"
                    disabled={!isSection2Enabled}
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
                    disabled={!isSection2Enabled}
                  />
                  <FormInput 
                    label="Email:" 
                    value={formData.email_assure}
                    onChange={(v) => setFormData({...formData, email_assure: v})}
                    placeholder="Ex: email@example.com"
                    type="email"
                    className="flex-grow-[2]"
                    disabled={!isSection2Enabled}
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
                  <Checkbox 
                    label="Autre" 
                    checked={formData.categorie === 'autre'}
                    onChange={() => setFormData({...formData, categorie: 'autre'})}
                  />
                  <div className="flex items-center">
                    <span className="text-[10px] text-gray-800 mr-1">à préciser :</span>
                    <input
                      type="text"
                      value={formData.autre_categorie_precision}
                      onChange={(e) => setFormData({...formData, autre_categorie_precision: e.target.value})}
                      className="border-b border-gray-400 w-24 text-xs font-semibold bg-transparent focus:outline-none focus:border-[#F48232]"
                      disabled={formData.categorie !== 'autre'}
                    />
                  </div>
                </div>
                {/* Affichage catégorie sélectionnée pour impression */}
                {categorieLabel && (
                  <div className="text-xs font-bold text-[#F48232] print:block hidden">
                    → Catégorie sélectionnée : {categorieLabel}
                  </div>
                )}
              </div>
            </div>

            {/* Section: Souscripteur / EMF */}
            <div className={`flex border-b border-[#F48232] ${!isSection3Enabled ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="w-24 flex-shrink-0 p-1.5 bg-orange-50 italic border-r border-[#F48232] flex flex-col justify-center text-xs">
                Souscripteur / EMF
                {!isSection3Enabled && <span className="text-[10px] text-orange-600 mt-1">🔒 Remplir Assuré</span>}
              </div>
              <div className="flex-grow p-1.5 space-y-1">
                <div className="flex items-end">
                  <span className="mr-1 whitespace-nowrap text-xs text-gray-800">Raison sociale :</span>
                  <span className="font-bold text-xs">SOCIETE D'EPARGNE ET DE CREDIT (SODEC)</span>
                </div>
                <FormInput 
                  label="Agence :" 
                  value={formData.agence}
                  onChange={(v) => setFormData({...formData, agence: v})}
                  placeholder="Ex: Agence Libreville Centre"
                />
                <div className="flex gap-2">
                  <div className="flex items-end flex-grow">
                    <span className="mr-1 whitespace-nowrap text-xs">Adresse :</span>
                    <span className="font-bold mr-2 text-xs">B.P. 20.042</span>
                    <span className="whitespace-nowrap mr-1 text-xs">Ville :</span>
                    <span className="font-bold text-xs">Libreville – Gabon</span>
                  </div>
                  <div className="flex items-end">
                    <span className="mr-1 text-xs">Téléphone :</span>
                    <span className="font-bold text-xs">077 57 24 44 / 066 70 75 62</span>
                  </div>
                </div>
                <div className="flex items-end">
                  <span className="mr-1 text-xs">Email :</span>
                  <span className="font-bold border-b border-gray-300 w-full text-xs">secretariatsodec@gmail.com</span>
                </div>
              </div>
            </div>

            {/* Section: Assurés associés */}
            <div className={`flex border-b border-[#F48232] ${!isSection4Enabled ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="w-24 flex-shrink-0 p-1.5 bg-orange-50 italic border-r border-[#F48232] flex flex-col justify-center text-xs">
                Assurés associés
                {!isSection4Enabled && <span className="text-[10px] text-orange-600 mt-1">🔒 Remplir Assuré</span>}
              </div>
              <div className="flex-grow">
                <table className="w-full text-left text-[10px] border-collapse">
                  <thead>
                    <tr className="bg-orange-100 font-bold text-center">
                      <th className="border-b border-r border-[#F48232] p-0.5 w-20">Assurés</th>
                      <th className="border-b border-r border-[#F48232] p-0.5">Nom</th>
                      <th className="border-b border-r border-[#F48232] p-0.5">Prénom</th>
                      <th className="border-b border-r border-[#F48232] p-0.5 w-20">Date naissance</th>
                      <th className="border-b border-r border-[#F48232] p-0.5 w-16">Lieu naissance</th>
                      <th className="border-b border-[#F48232] p-0.5 w-20">Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Conjoint */}
                    <tr className="h-5">
                      <td className="border-b border-r border-[#F48232] p-0.5 font-bold bg-orange-50/50">Conjoint (e)</td>
                      <td className="border-b border-r border-[#F48232] p-0">
                        <input 
                          type="text" 
                          value={assuresAssocies.conjoint.nom}
                          onChange={(e) => setAssuresAssocies({...assuresAssocies, conjoint: {...assuresAssocies.conjoint, nom: e.target.value}})}
                          className="w-full h-full px-1 text-[10px] font-semibold bg-transparent border-0 focus:outline-none focus:bg-orange-50"
                        />
                      </td>
                      <td className="border-b border-r border-[#F48232] p-0">
                        <input 
                          type="text" 
                          value={assuresAssocies.conjoint.prenom}
                          onChange={(e) => setAssuresAssocies({...assuresAssocies, conjoint: {...assuresAssocies.conjoint, prenom: e.target.value}})}
                          className="w-full h-full px-1 text-[10px] font-semibold bg-transparent border-0 focus:outline-none focus:bg-orange-50"
                        />
                      </td>
                      <td className="border-b border-r border-[#F48232] p-0">
                        <input 
                          type="date" 
                          value={assuresAssocies.conjoint.date_naissance}
                          onChange={(e) => setAssuresAssocies({...assuresAssocies, conjoint: {...assuresAssocies.conjoint, date_naissance: e.target.value}})}
                          className="w-full h-full px-1 text-[10px] font-semibold bg-transparent border-0 focus:outline-none focus:bg-orange-50"
                        />
                      </td>
                      <td className="border-b border-r border-[#F48232] p-0">
                        <input 
                          type="text" 
                          value={assuresAssocies.conjoint.lieu_naissance}
                          onChange={(e) => setAssuresAssocies({...assuresAssocies, conjoint: {...assuresAssocies.conjoint, lieu_naissance: e.target.value}})}
                          className="w-full h-full px-1 text-[10px] font-semibold bg-transparent border-0 focus:outline-none focus:bg-orange-50"
                        />
                      </td>
                      <td className="border-b border-[#F48232] p-0">
                        <input 
                          type="text" 
                          value={assuresAssocies.conjoint.contact}
                          onChange={(e) => setAssuresAssocies({...assuresAssocies, conjoint: {...assuresAssocies.conjoint, contact: e.target.value}})}
                          className="w-full h-full px-1 text-[9px] font-semibold bg-transparent border-0 focus:outline-none focus:bg-orange-50"
                        />
                      </td>
                    </tr>
                    
                    {/* Enfants - Max 4 */}
                    {(['enfant1', 'enfant2', 'enfant3', 'enfant4'] as const).map((enfantKey, idx) => (
                      <tr key={enfantKey} className="h-5">
                        <td className="border-b border-r border-[#F48232] p-0.5 font-bold bg-orange-50/50">Enfant {idx + 1}</td>
                        <td className="border-b border-r border-[#F48232] p-0">
                          <input 
                            type="text" 
                            value={assuresAssocies[enfantKey].nom}
                            onChange={(e) => setAssuresAssocies({...assuresAssocies, [enfantKey]: {...assuresAssocies[enfantKey], nom: e.target.value}})}
                            className="w-full h-full px-1 text-[10px] font-semibold bg-transparent border-0 focus:outline-none focus:bg-orange-50"
                          />
                        </td>
                        <td className="border-b border-r border-[#F48232] p-0">
                          <input 
                            type="text" 
                            value={assuresAssocies[enfantKey].prenom}
                            onChange={(e) => setAssuresAssocies({...assuresAssocies, [enfantKey]: {...assuresAssocies[enfantKey], prenom: e.target.value}})}
                            className="w-full h-full px-1 text-[10px] font-semibold bg-transparent border-0 focus:outline-none focus:bg-orange-50"
                          />
                        </td>
                        <td className="border-b border-r border-[#F48232] p-0">
                          <input 
                            type="date" 
                            value={assuresAssocies[enfantKey].date_naissance}
                            onChange={(e) => setAssuresAssocies({...assuresAssocies, [enfantKey]: {...assuresAssocies[enfantKey], date_naissance: e.target.value}})}
                            className="w-full h-full px-1 text-[10px] font-semibold bg-transparent border-0 focus:outline-none focus:bg-orange-50"
                          />
                        </td>
                        <td className="border-b border-r border-[#F48232] p-0">
                          <input 
                            type="text" 
                            value={assuresAssocies[enfantKey].lieu_naissance}
                            onChange={(e) => setAssuresAssocies({...assuresAssocies, [enfantKey]: {...assuresAssocies[enfantKey], lieu_naissance: e.target.value}})}
                            className="w-full h-full px-1 text-[10px] font-semibold bg-transparent border-0 focus:outline-none focus:bg-orange-50"
                          />
                        </td>
                        <td className="border-b border-[#F48232] p-0">
                          <input 
                            type="text" 
                            value={assuresAssocies[enfantKey].contact}
                            onChange={(e) => setAssuresAssocies({...assuresAssocies, [enfantKey]: {...assuresAssocies[enfantKey], contact: e.target.value}})}
                            className="w-full h-full px-1 text-[9px] font-semibold bg-transparent border-0 focus:outline-none focus:bg-orange-50"
                          />
                        </td>
                      </tr>
                    ))}
                    
                    {/* Bénéficiaire décès */}
                    <tr className="h-7">
                      <td className="border-b border-r border-[#F48232] p-0.5 font-bold bg-orange-50/50 align-middle leading-tight text-[9px]">
                        Bénéficiaire en cas de décès
                      </td>
                      <td className="border-b border-r border-[#F48232] p-0">
                        <input 
                          type="text" 
                          value={formData.beneficiaire_deces_nom}
                          onChange={(e) => setFormData({...formData, beneficiaire_deces_nom: e.target.value})}
                          placeholder="Nom"
                          className="w-full h-full px-1 text-[10px] font-semibold bg-transparent border-0 focus:outline-none focus:bg-orange-50"
                        />
                      </td>
                      <td className="border-b border-r border-[#F48232] p-0">
                        <input 
                          type="text" 
                          value={formData.beneficiaire_deces_prenom}
                          onChange={(e) => setFormData({...formData, beneficiaire_deces_prenom: e.target.value})}
                          placeholder="Prénom"
                          className="w-full h-full px-1 text-[10px] font-semibold bg-transparent border-0 focus:outline-none focus:bg-orange-50"
                        />
                      </td>
                      <td className="border-b border-r border-[#F48232] p-0">
                        <input 
                          type="date" 
                          value={formData.beneficiaire_deces_date_naissance}
                          onChange={(e) => setFormData({...formData, beneficiaire_deces_date_naissance: e.target.value})}
                          className="w-full h-full px-1 text-[10px] font-semibold bg-transparent border-0 focus:outline-none focus:bg-orange-50"
                        />
                      </td>
                      <td className="border-b border-r border-[#F48232] p-0">
                        <input 
                          type="text" 
                          value={formData.beneficiaire_deces_lieu_naissance}
                          onChange={(e) => setFormData({...formData, beneficiaire_deces_lieu_naissance: e.target.value})}
                          placeholder="Lieu"
                          className="w-full h-full px-1 text-[10px] font-semibold bg-transparent border-0 focus:outline-none focus:bg-orange-50"
                        />
                      </td>
                      <td className="border-b border-[#F48232] p-0">
                        <input 
                          type="text" 
                          value={formData.beneficiaire_deces_contact}
                          onChange={(e) => setFormData({...formData, beneficiaire_deces_contact: e.target.value})}
                          placeholder="Contact"
                          className="w-full h-full px-1 text-[9px] font-semibold bg-transparent border-0 focus:outline-none focus:bg-orange-50"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section: Garanties */}
            <div className={`flex border-b border-[#F48232] ${!isSection5Enabled ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="w-24 flex-shrink-0 p-1.5 bg-orange-50 italic border-r border-[#F48232] flex flex-col justify-center text-xs">
                Garanties
                {!isSection5Enabled && <span className="text-[10px] text-orange-600 mt-1">🔒 Remplir Assuré</span>}
              </div>
              <div className="flex-grow">
                <table className="w-full text-center text-[10px] border-collapse">
                  <thead>
                    <tr className="border-b border-[#F48232] font-bold">
                      <th className="p-0.5 w-1/3 text-left pl-2"></th>
                      <th className="border-l border-r border-[#F48232] p-0.5 w-24">Type de cible</th>
                      <th className="border-r border-[#F48232] p-0.5 w-12">Option</th>
                      <th className="border-r border-[#F48232] p-0.5 w-12">Taux</th>
                      <th className="p-0.5 w-16">Prime unique</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#F48232] bg-orange-50/30">
                      <td className="p-0.5 text-left pl-2">Option A : Protection Prévoyance<sup>1</sup> Décès - IAD<sup>2</sup></td>
                      <td className="border-l border-r border-[#F48232] p-0.5 text-[#F48232]">Toute catégorie</td>
                      <td className="border-r border-[#F48232] p-0.5">
                        <div className="flex justify-center">
                          <label className="cursor-pointer">
                            <input 
                              type="radio" 
                              name="option_prevoyance" 
                              value="option_a"
                              checked={formData.option_prevoyance === 'option_a'}
                              onChange={() => setFormData({...formData, option_prevoyance: 'option_a'})}
                              className="sr-only"
                            />
                            <div className={`w-5 h-3 border border-black ${formData.option_prevoyance === 'option_a' ? 'bg-black' : 'bg-white hover:bg-gray-100'}`}></div>
                          </label>
                        </div>
                      </td>
                      <td className="border-r border-[#F48232] p-0.5 text-[#F48232]">N/A</td>
                      <td className="p-0.5 text-[#F48232] font-bold">30 000</td>
                    </tr>
                    <tr className="border-b border-[#F48232]">
                      <td className="p-0.5 text-left pl-2">Option B : Protection Prévoyance Décès - IAD</td>
                      <td className="border-l border-r border-[#F48232] p-0.5 text-[#F48232]">Toute catégorie</td>
                      <td className="border-r border-[#F48232] p-0.5">
                        <div className="flex justify-center">
                          <label className="cursor-pointer">
                            <input 
                              type="radio" 
                              name="option_prevoyance" 
                              value="option_b"
                              checked={formData.option_prevoyance === 'option_b'}
                              onChange={() => setFormData({...formData, option_prevoyance: 'option_b'})}
                              className="sr-only"
                            />
                            <div className={`w-5 h-3 border border-black rounded-full ${formData.option_prevoyance === 'option_b' ? 'bg-black' : 'bg-white hover:bg-gray-100'}`}></div>
                          </label>
                        </div>
                      </td>
                      <td className="border-r border-[#F48232] p-0.5 text-[#F48232]">N/A</td>
                      <td className="p-0.5 text-[#F48232] font-bold">15 000</td>
                    </tr>
                    <tr className="border-b border-[#F48232]">
                      <td className="p-0.5 text-left pl-2">Décès – invalidité absolue et définitive (IAD)</td>
                      <td className="border-l border-r border-[#F48232] p-0.5 text-[#F48232]">Toute catégorie</td>
                      <td className="border-r border-[#F48232] p-0.5">
                        <div className="flex justify-center">
                          <div className="w-5 h-3 bg-black border border-black rounded-full"></div>
                        </div>
                      </td>
                      <td className="border-r border-[#F48232] p-0.5 text-[#F48232]">1,50%</td>
                      <td className="p-0.5 text-[#F48232]">N/A</td>
                    </tr>
                    <tr>
                      <td className="p-0.5 text-left pl-2">Perte d'emploi ou d'activités (garantie optionnelle)</td>
                      <td className="border-l border-r border-[#F48232] p-0.5 text-[#F48232] leading-tight">Salariés du Privé<br/>& Commerçants</td>
                      <td className="border-r border-[#F48232] p-0.5">
                        <div className="flex justify-center items-center">
                          <label className="cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={formData.garantie_perte_emploi}
                              onChange={(e) => setFormData({...formData, garantie_perte_emploi: e.target.checked})}
                              className="sr-only"
                            />
                            <div className={`w-5 h-3 border border-black ${formData.garantie_perte_emploi ? 'bg-black' : 'bg-white hover:bg-gray-100'}`}></div>
                          </label>
                        </div>
                      </td>
                      <td className="border-r border-[#F48232] p-0.5 text-[#F48232]">2,50%</td>
                      <td className="p-0.5 text-[#F48232]">N/A</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section: Cotisations */}
            <div className="flex bg-orange-50/50">
              <div className="w-24 flex-shrink-0 p-1.5 bg-orange-50 italic border-r border-[#F48232] flex items-center text-xs">
                Cotisations
              </div>
              <div className="flex-grow p-2">
                <div className="font-bold flex items-end">
                  <span className="text-xs">Cotisation totale :</span>
                  <span className="flex-grow mx-2 border-b-2 border-black text-center font-extrabold text-[#F48232]">
                    {cotisationTotale > 0 ? formatCurrency(cotisationTotale) : '___________'}
                  </span>
                  <span className="text-[10px]">FCFA TTC (Montant prêt x taux) + Cotisation Prévoyance (A ou B)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Legal List & Footnotes */}
          <div className="mt-1 space-y-0.5 text-[8px] text-gray-700">
            <div className="italic">
              <p className="mb-0.5">
                <sup>1</sup> La Prévoyance décès prévoit en cas de décès ou d'IAD d'un membre de la famille, l'Assureur verse un capital forfaitaire :
                <span className="font-semibold mx-1">Option A:</span> 500 000 FCFA/adulte, 250 000 FCFA/enfant.
                <span className="font-semibold mx-1">Option B:</span> 250 000 FCFA/adulte, 125 000 FCFA/enfant.
              </p>
              <p>
                <sup>2</sup> L'IAD est reconnue si l'Assuré est définitivement incapable de se livrer à la moindre occupation et nécessite l'assistance d'une tierce personne.
              </p>
            </div>
            
            <div className="font-bold text-black grid grid-cols-1 gap-0.5 mt-1">
              <div className="flex"><span className="mr-1">(1)</span><p>La Prévoyance décès est d'un montant maximal de 2.000.000 FCFA (Option A) et 1.000.000 FCFA (Option B).</p></div>
              <div className="flex"><span className="mr-1">(2)</span><p>Le montant maximal du prêt couvert est de FCFA 5.000.000 (retraités) et FCFA 20.000.000 (autres).</p></div>
              <div className="flex"><span className="mr-1">(3)</span><p>Durée maximale décès : 36 mois (retraités), 72 mois (autres).</p></div>
              <div className="flex"><span className="mr-1">(4)</span><p>Perte d'emploi : durée max indemnisation 12 mois, couverture max 5.000.000 FCFA, durée couverture max 48 mois.</p></div>
            </div>
          </div>

          {/* Signatures */}
          <div className="mt-1 mb-0">
            <div className="text-right mb-0.5 pr-8 font-medium text-[9px]">
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

            <div className="flex justify-between px-2 text-[9px]">
              <div className="w-1/3">
                <div className="mb-0.5 font-medium">Le Souscripteur</div>
                <div className="border border-black h-10 p-0.5 text-gray-300 font-bold text-center flex items-center justify-center text-[8px]">
                  Signature et cachet
                </div>
              </div>

              <div className="w-1/3"></div>

              <div className="w-1/3">
                <div className="mb-0.5 font-medium text-right">Le Souscripteur P/C L'Assureur</div>
                <div className="border border-black h-10 p-0.5 text-gray-300 font-bold text-center flex items-center justify-center text-[8px]">
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
            onClick={() => navigate('/contrats/sodec')}
            className="flex-1"
            disabled={isPending}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isPending || !isFormComplete}
            className={`flex-1 text-white font-semibold text-lg py-3 ${
              isFormComplete 
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
                Créer le Contrat SODEC
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
            navigate(`/contrats/sodec/${createdContrat.id}`, {
              state: { success: createdContrat.statut === 'actif' ? 'Contrat créé avec succès !' : 'Contrat créé en attente de validation.' }
            })
          }
        }}
        contrat={createdContrat}
        emfType="sodec"
      />
    </div>
  )
}

export default SodecContractCreateOfficial
