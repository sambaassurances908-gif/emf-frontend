// src/features/contrats/bceg/BcegContractCreateOfficial.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Printer, Save, ArrowLeft, CheckCircle, AlertTriangle, AlertCircle, Lock } from 'lucide-react'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useAuthStore } from '@/store/authStore'
import { useCreateBcegContract } from '@/hooks/useBcegContracts'
import { Button } from '@/components/ui/Button'
import logoSamba from '@/assets/logo-samba.png'

// --- Logo Component ---
const Logo: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center mb-0">
      <img 
        src={logoSamba} 
        alt="SAMB'A Assurances" 
        className="h-[80px] w-auto"
      />
    </div>
  )
}

// --- Footer Component ---
const Footer: React.FC<{ pageNum: number }> = ({ pageNum }) => {
  return (
    <div className="border-t border-gray-300 pt-0.5 text-center text-[6px] text-gray-600 leading-none">
      <div className="font-bold uppercase text-black text-[7px]">SAMB'A ASSURANCES GABON S.A. - Société Anonyme avec Conseil d'Administration et Président Directeur Général</div>
      <div>Entreprise de micro-assurance régie par le Code des Assurances CIMA et agréée par la CRCA sous le N° 0270 / L / CIMA / CRCA / PDT / 2024</div>
      <div className="flex justify-between items-center px-1 mt-0.5">
        <span>326 Rue J.B. NDENDE | Av. de COINTET | Libreville</span>
        <span>B.P : 22 215 | Libreville | Gabon</span>
        <span>(+241) 060 08 62 62 - 074 40 41 41</span>
        <span className="border border-black px-1 font-bold text-[8px]">{pageNum}</span>
      </div>
    </div>
  )
}

// --- GarantieRow Component ---
const GarantieRow: React.FC<{
  label: string
  rate: string
  prime: string
  isSelected?: boolean
  onClick?: () => void
}> = ({ label, rate, prime, isSelected, onClick }) => (
  <tr className={`border-b border-[#F48232] last:border-0 hover:bg-orange-50/50 ${isSelected ? 'bg-orange-100' : ''}`}>
    <td className="p-1.5 text-left pl-3 border-r border-[#F48232] text-[10px]">{label}</td>
    <td className="p-1 border-r border-[#F48232]">
      <div 
        onClick={onClick}
        className={`w-6 h-4 border border-black rounded-sm mx-auto cursor-pointer transition-colors ${isSelected ? 'bg-[#F48232]' : 'bg-white hover:bg-orange-50'}`}
      />
    </td>
    <td className="p-1.5 border-r border-[#F48232] text-center text-[10px]">{rate}</td>
    <td className="p-1.5 text-center text-[10px]">{prime}</td>
  </tr>
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
    <div className={`w-4 h-4 border-2 border-black mr-2 flex items-center justify-center transition-colors ${checked ? 'bg-black' : 'bg-white'} ${!disabled && 'hover:bg-gray-100'}`}>
      {checked && <div className="w-2 h-2 bg-white" />}
    </div>
    <span className="text-xs text-gray-800">{label}</span>
  </label>
)

export const BcegContractCreateOfficial = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // ═══════════════════════════════════════════════════════════════════
  // 🔒 VÉRIFICATION EMF - BCEG = emf_id 3
  // ═══════════════════════════════════════════════════════════════════
  const userEmfId = user?.emf_id
  const userEmfSigle = user?.emf?.sigle?.toUpperCase() || ''
  const isBcegUser = userEmfId === 3 || userEmfSigle.includes('BCEG') || user?.role === 'admin'
  const emfName = userEmfSigle || (userEmfId === 1 ? 'BAMBOO' : userEmfId === 2 ? 'COFIDEC' : userEmfId === 3 ? 'BCEG' : userEmfId === 4 ? 'EDG' : userEmfId === 5 ? 'SODEC' : 'inconnu')

  // IMPORTANT: Toujours utiliser emf_id = 3 pour BCEG
  const emfId = 3

  const [formData, setFormData] = useState({
    emf_id: emfId,
    nom: '',
    prenom: '',
    adresse_assure: '',
    ville_assure: '',
    telephone_assure: '',
    email_assure: '',
    categorie: '' as 'commercants' | 'salaries_public' | 'salaries_prive' | 'retraites' | 'autre' | '',
    autre_categorie_precision: '',
    numero_police: '', // Auto-généré par le backend (format: BCEG-YYYYMMDD-XXXX)
    montant_pret: '',
    duree_pret_mois: '',
    date_effet: '',
    date_fin_echeance: '',
    beneficiaire_prevoyance_nom_prenom: '',
    beneficiaire_prevoyance_adresse: '',
    beneficiaire_prevoyance_contact: '',
    garantie_deces_iad: true,
    garantie_prevoyance: true,
    agence: '',
    lieu_signature: 'Libreville',
    date_signature: new Date().toISOString().split('T')[0],
    tranche_duree: '' as '' | 'max_24' | '24_36' | '36_48' | '48_60'
  })

  const [submitError, setSubmitError] = useState('')

  const { mutate: createContract, isPending, isError, error } = useCreateBcegContract()

  // ═══════════════════════════════════════════════════════════════════
  // 🔒 VALIDATION PROGRESSIVE - Activation des sections par étapes
  // ═══════════════════════════════════════════════════════════════════
  
  // Section 1: Couverture Prêt (toujours active)
  const isSection1Complete = Boolean(
    formData.montant_pret && 
    formData.duree_pret_mois && 
    formData.date_effet
  )

  // Section 2: Assuré (active si Section 1 complète)
  const isSection2Enabled = isSection1Complete
  const isSection2Complete = Boolean(
    formData.nom.trim() && 
    formData.prenom.trim() && 
    formData.adresse_assure.trim() && 
    formData.ville_assure.trim() && 
    formData.telephone_assure.trim()
  )

  // Section 3+ (active si Section 2 complète)
  const isSection3Enabled = isSection2Complete
  const isSection4Enabled = isSection2Complete
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

  // Auto-sélectionner la tranche de durée
  useEffect(() => {
    const duree = parseInt(formData.duree_pret_mois) || 0
    let tranche: '' | 'max_24' | '24_36' | '36_48' | '48_60' = ''
    if (duree > 0 && duree <= 24) tranche = 'max_24'
    else if (duree > 24 && duree <= 36) tranche = '24_36'
    else if (duree > 36 && duree <= 48) tranche = '36_48'
    else if (duree > 48 && duree <= 60) tranche = '48_60'
    setFormData(prev => ({ ...prev, tranche_duree: tranche }))
  }, [formData.duree_pret_mois])

  useEffect(() => {
    const axiosError = error as any
    if (isError && axiosError?.response?.status === 422) {
      const validationErrors = axiosError.response.data.errors || {}
      const newErrors: Record<string, string> = {}
      Object.entries(validationErrors).forEach(([key, messages]) => {
        newErrors[key] = Array.isArray(messages) ? messages[0] : messages as string
      })
      setSubmitError('Veuillez corriger les erreurs dans le formulaire')
    } else if (isError) {
      setSubmitError('Erreur serveur. Réessayez.')
    }
  }, [isError, error])

  // Calcul cotisation BCEG
  const montant = parseInt(formData.montant_pret) || 0
  const duree = parseInt(formData.duree_pret_mois) || 0
  
  // Taux selon durée
  const getTaux = () => {
    if (duree <= 24) return 0.01  // 1%
    if (duree <= 36) return 0.015 // 1.5%
    if (duree <= 48) return 0.0175 // 1.75%
    if (duree <= 60) return 0.02  // 2%
    return 0
  }
  
  const tauxApplique = getTaux()
  const cotisationDeces = montant * tauxApplique
  const cotisationPrevoyance = formData.garantie_prevoyance ? 10000 : 0
  const cotisationTotale = cotisationDeces + cotisationPrevoyance

  // Validation des règles métier
  const montantMaxPret = 20000000
  const dureeMaxPret = 60
  const isContractValid = montant > 0 && montant <= montantMaxPret && duree > 0 && duree <= dureeMaxPret

  // ═══════════════════════════════════════════════════════════════════
  // 🔒 VÉRIFICATION D'ACCÈS - Après tous les hooks (Rules of Hooks)
  // ═══════════════════════════════════════════════════════════════════
  if (!isBcegUser) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-[210mm] mx-auto">
          <div className="bg-red-50 border border-red-300 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-red-700 mb-2">Accès non autorisé</h1>
            <p className="text-red-600 mb-4">
              Vous êtes connecté avec un compte <strong>{emfName}</strong>.
              <br />
              Ce formulaire est réservé aux utilisateurs BCEG.
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
    
    console.log('═══════════════════════════════════════════════════════════════')
    console.log('📋 ÉTAPE 1: Validation des champs obligatoires...')

    // Validation
    const requiredFields = [
      { field: 'nom', label: 'Nom' },
      { field: 'prenom', label: 'Prénom' },
      { field: 'adresse_assure', label: 'Adresse' },
      { field: 'ville_assure', label: 'Ville' },
      { field: 'telephone_assure', label: 'Téléphone' },
      { field: 'montant_pret', label: 'Montant du prêt' },
      { field: 'duree_pret_mois', label: 'Durée du prêt' },
      { field: 'date_effet', label: 'Date d\'effet' },
      { field: 'beneficiaire_prevoyance_nom_prenom', label: 'Bénéficiaire prévoyance' },
    ]

    const missingFields: string[] = []
    requiredFields.forEach(({ field, label }) => {
      const value = formData[field as keyof typeof formData]
      if (!value || (typeof value === 'string' && !value.trim())) {
        missingFields.push(field)
        console.log(` ❌ Champ manquant: ${field} (${label})`)
      }
    })

    if (missingFields.length > 0) {
      setSubmitError(`Champs obligatoires manquants: ${missingFields.join(', ')}`)
      return
    }

    console.log('✅ ÉTAPE 1: Tous les champs obligatoires sont remplis')
    console.log('📋 ÉTAPE 2: Construction du payload...')

    const payload = {
      emf_id: Number(formData.emf_id),
      nom: formData.nom.trim(),
      prenom: formData.prenom.trim(),
      adresse_assure: formData.adresse_assure.trim(),
      ville_assure: formData.ville_assure.trim(),
      telephone_assure: formData.telephone_assure.trim(),
      email_assure: formData.email_assure?.trim() || undefined,
      categorie: formData.categorie || undefined,
      autre_categorie_precision: formData.categorie === 'autre' ? formData.autre_categorie_precision?.trim() : undefined,
      numero_police: formData.numero_police?.trim() || undefined,
      montant_pret: parseInt(formData.montant_pret),
      duree_pret_mois: parseInt(formData.duree_pret_mois),
      date_effet: formData.date_effet,
      beneficiaire_prevoyance_nom_prenom: formData.beneficiaire_prevoyance_nom_prenom.trim(),
      beneficiaire_prevoyance_adresse: formData.beneficiaire_prevoyance_adresse?.trim() || undefined,
      beneficiaire_prevoyance_contact: formData.beneficiaire_prevoyance_contact?.trim() || undefined,
      garantie_deces_iad: formData.garantie_deces_iad,
      garantie_prevoyance: formData.garantie_prevoyance,
      agence: formData.agence?.trim() || undefined,
      statut: isContractValid ? 'actif' : 'en_attente',
    }

    console.log('✅ ÉTAPE 2: Payload construit')
    console.log('📤 Payload à envoyer:', JSON.stringify(payload, null, 2))
    console.log('📋 ÉTAPE 3: Envoi au serveur...')

    createContract(payload as any, {
      onSuccess: (data) => {
        console.log('═══════════════════════════════════════════════════════════════')
        console.log('✅ SUCCÈS: Contrat BCEG créé avec succès!')
        console.log('   ID:', data.id)
        console.log('   Numéro police:', data.numero_police)
        console.log('═══════════════════════════════════════════════════════════════')
        
        navigate(`/contrats/bceg/${data.id}`, {
          state: { success: 'Contrat créé avec succès !' }
        })
      },
      onError: (error: any) => {
        console.error('═══════════════════════════════════════════════════════════════')
        console.error('❌ ERREUR lors de la création du contrat')
        console.error('   Status:', error.response?.status)
        console.error('   Message:', error.response?.data?.message || error.message)
        console.error('   Erreurs de validation:', error.response?.data?.errors)
        console.error('   Données reçues:', JSON.stringify(error.response?.data, null, 2))
        console.error('═══════════════════════════════════════════════════════════════')
        
        // Afficher les erreurs de validation détaillées
        if (error.response?.status === 422 && error.response?.data?.errors) {
          const validationErrors = error.response.data.errors
          const errorMessages = Object.entries(validationErrors)
            .map(([field, msgs]) => `• ${field}: ${Array.isArray(msgs) ? msgs[0] : msgs}`)
            .join('\n')
          setSubmitError(`Erreurs de validation:\n${errorMessages}`)
        } else {
          setSubmitError(error.response?.data?.message || 'Erreur lors de la création')
        }
      }
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR')
  }

  return (
    <div className="min-h-screen bg-gray-200 py-4 flex flex-col items-center">
      {/* Toolbar */}
      <div className="w-[210mm] mb-4 flex justify-between items-center bg-white p-3 rounded-lg shadow print:hidden">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        
        <div className="flex items-center gap-2">
          {isContractValid ? (
            <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
              <CheckCircle className="h-4 w-4" />
              Contrat valide - Statut: ACTIF
            </span>
          ) : (
            <span className="flex items-center gap-1 text-yellow-600 text-sm font-medium">
              <AlertTriangle className="h-4 w-4" />
              Contrat incomplet - Statut: EN ATTENTE
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isPending || !isFormComplete}
            className={`${
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
                <AlertCircle className="h-4 w-4 mr-2" />
                Remplir les champs obligatoires
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Créer le Contrat BCEG
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {submitError && (
        <div className="w-[210mm] mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded print:hidden">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <pre className="whitespace-pre-wrap text-sm">{submitError}</pre>
          </div>
        </div>
      )}

      {/* 🔒 Indicateur de progression */}
      <div className="w-[210mm] mb-4 bg-white rounded-lg shadow p-4 print:hidden">
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
            ⚠️ Remplissez les informations de l'assuré (Nom, Prénom, Adresse, Ville, Téléphone) pour activer le bouton de création.
          </p>
        )}
      </div>

      {/* PAGE 1 - Contrat BCEG */}
      <div className="bg-white w-[210mm] min-h-[297mm] p-[10mm] shadow-xl relative flex flex-col print:shadow-none print:p-[8mm]">
        {/* Header */}
        <div className="flex flex-col items-center mb-3">
          <Logo />
          <h1 className="text-[#F48232] text-lg font-extrabold uppercase mt-2 text-center leading-tight tracking-wide">
            CONTRAT COLLECTIF DE MICRO ASSURANCE BCEG
          </h1>
          <h2 className="text-[#F48232] text-lg font-extrabold uppercase text-center leading-tight tracking-wide mb-1">
            DÉCÈS EMPRUNTEUR & PRÉVOYANCE
          </h2>
          <p className="text-[10px] text-black font-semibold">Contrat régi par les dispositions du Code des Assurances CIMA</p>
          <div className="text-xs font-bold text-black mt-1">
            Visa DNA N°005/24 & 008/24 - Police N°: 509/111.701:0225
          </div>
          <div className="w-full border-b-2 border-[#F48232] mt-2 mb-1"></div>
          <h3 className="text-black text-base font-bold uppercase">
            CONDITIONS PARTICULIÈRES
          </h3>
        </div>

        {/* Form Body */}
        <div className="border-2 border-[#F48232] w-full flex flex-col text-sm">
          
          {/* Section: Couverture */}
          <div className="flex border-b border-[#F48232]">
            <div className="w-36 flex-shrink-0 p-2 bg-orange-50 italic border-r border-[#F48232] flex items-center text-gray-900 text-xs">
              Couverture
            </div>
            <div className="flex-grow p-2 space-y-2 overflow-hidden">
              {/* Numéro de police - Auto-généré */}
              <div className="flex items-end">
                <span className="text-xs text-gray-800 mr-2 whitespace-nowrap">N° Police :</span>
                <span className="flex-grow border-b border-gray-800 text-xs px-1 font-semibold text-gray-500 italic">
                  (Auto-généré à la création)
                </span>
              </div>
              <div className="flex gap-4">
                <div className="flex items-end flex-1 min-w-0">
                  <span className="text-xs text-gray-800 mr-2 whitespace-nowrap">Montant du prêt :</span>
                  <input 
                    type="number"
                    value={formData.montant_pret}
                    onChange={(e) => setFormData({...formData, montant_pret: e.target.value})}
                    className="flex-1 min-w-0 border-b border-gray-800 bg-transparent text-xs px-1 focus:outline-none focus:bg-orange-50 font-semibold text-right"
                    placeholder="0"
                  />
                  <span className="text-xs ml-1 flex-shrink-0">FCFA</span>
                </div>
                <div className="flex items-end flex-1 min-w-0">
                  <span className="text-xs text-gray-800 mr-2 whitespace-nowrap">Durée du prêt :</span>
                  <input 
                    type="number"
                    value={formData.duree_pret_mois}
                    onChange={(e) => setFormData({...formData, duree_pret_mois: e.target.value})}
                    className="flex-1 min-w-0 border-b border-gray-800 bg-transparent text-xs px-1 focus:outline-none focus:bg-orange-50 font-semibold text-center"
                    placeholder="0"
                    max="60"
                  />
                  <span className="text-xs ml-1 flex-shrink-0">mois</span>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex items-end flex-1 min-w-0">
                  <span className="text-xs text-gray-800 mr-2 whitespace-nowrap">Date d'effet :</span>
                  <input 
                    type="date"
                    value={formData.date_effet}
                    onChange={(e) => setFormData({...formData, date_effet: e.target.value})}
                    className="flex-1 min-w-0 border-b border-gray-800 bg-transparent text-xs px-1 focus:outline-none focus:bg-orange-50 font-semibold"
                  />
                </div>
                <div className="flex items-end flex-1 min-w-0">
                  <span className="text-xs text-gray-800 mr-2 whitespace-nowrap">Date fin échéance :</span>
                  <input 
                    type="date"
                    value={formData.date_fin_echeance}
                    readOnly
                    className="flex-1 min-w-0 border-b border-gray-800 bg-gray-100 text-xs px-1 font-semibold"
                  />
                </div>
              </div>
              {/* Date d'émission */}
              <div className="flex items-end">
                <span className="text-xs text-gray-800 mr-2 whitespace-nowrap">Date d'émission :</span>
                <span className="text-xs font-semibold">{formatDate(new Date().toISOString())}</span>
              </div>
            </div>
          </div>

          {/* Section: Assuré / Bénéficiaire du prêt */}
          <div className={`flex border-b border-[#F48232] ${!isSection2Enabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="w-36 flex-shrink-0 p-2 bg-orange-50 italic border-r border-[#F48232] flex items-center text-gray-900 text-xs leading-tight">
              {!isSection2Enabled && <Lock className="h-3 w-3 mr-1" />}
              Assuré/<br/>Bénéficiaire du prêt
            </div>
            <div className="flex-grow p-2 space-y-1.5">
              <div className="flex items-end">
                <span className="text-xs text-gray-800 mr-2 w-20">Nom :</span>
                <input 
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({...formData, nom: e.target.value})}
                  disabled={!isSection2Enabled}
                  className="flex-grow border-b border-gray-800 bg-transparent text-xs px-1 focus:outline-none focus:bg-orange-50 font-semibold disabled:bg-gray-100"
                />
              </div>
              <div className="flex items-end">
                <span className="text-xs text-gray-800 mr-2 w-20">Prénom :</span>
                <input 
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                  disabled={!isSection2Enabled}
                  className="flex-grow border-b border-gray-800 bg-transparent text-xs px-1 focus:outline-none focus:bg-orange-50 font-semibold disabled:bg-gray-100"
                />
              </div>
              <div className="flex items-end">
                <span className="text-xs text-gray-800 mr-2 w-20">Adresse :</span>
                <input 
                  type="text"
                  value={formData.adresse_assure}
                  onChange={(e) => setFormData({...formData, adresse_assure: e.target.value})}
                  disabled={!isSection2Enabled}
                  className="flex-grow border-b border-gray-800 bg-transparent text-xs px-1 focus:outline-none focus:bg-orange-50 font-semibold disabled:bg-gray-100"
                />
              </div>
              <div className="flex items-end">
                <span className="text-xs text-gray-800 mr-2 w-20">Ville :</span>
                <input 
                  type="text"
                  value={formData.ville_assure}
                  onChange={(e) => setFormData({...formData, ville_assure: e.target.value})}
                  disabled={!isSection2Enabled}
                  className="flex-grow border-b border-gray-800 bg-transparent text-xs px-1 focus:outline-none focus:bg-orange-50 font-semibold disabled:bg-gray-100"
                />
              </div>
              <div className="flex items-end">
                <span className="text-xs text-gray-800 mr-2 w-20">Tél / Email :</span>
                <input 
                  type="text"
                  value={formData.telephone_assure}
                  onChange={(e) => setFormData({...formData, telephone_assure: e.target.value})}
                  disabled={!isSection2Enabled}
                  className="flex-1 border-b border-gray-800 bg-transparent text-xs px-1 focus:outline-none focus:bg-orange-50 font-semibold disabled:bg-gray-100"
                  placeholder="Téléphone"
                />
                <span className="mx-2 text-gray-400">/</span>
                <input 
                  type="email"
                  value={formData.email_assure}
                  onChange={(e) => setFormData({...formData, email_assure: e.target.value})}
                  disabled={!isSection2Enabled}
                  className="flex-1 border-b border-gray-800 bg-transparent text-xs px-1 focus:outline-none focus:bg-orange-50 font-semibold disabled:bg-gray-100"
                  placeholder="Email"
                />
              </div>
              {/* Catégorie socio-professionnelle */}
              <div className="mt-1">
                <div className="flex items-start gap-x-3">
                  <span className="text-xs text-gray-800 whitespace-nowrap pt-0.5">Catégorie :</span>
                  <div className="grid grid-cols-3 gap-x-4 gap-y-1">
                    <Checkbox 
                      label="Commerçants" 
                      checked={formData.categorie === 'commercants'}
                      onChange={() => setFormData({...formData, categorie: 'commercants'})}
                      disabled={!isSection2Enabled}
                    />
                    <Checkbox 
                      label="Sal. public" 
                      checked={formData.categorie === 'salaries_public'}
                      onChange={() => setFormData({...formData, categorie: 'salaries_public'})}
                      disabled={!isSection2Enabled}
                    />
                    <Checkbox 
                      label="Sal. privé" 
                      checked={formData.categorie === 'salaries_prive'}
                      onChange={() => setFormData({...formData, categorie: 'salaries_prive'})}
                      disabled={!isSection2Enabled}
                    />
                    <Checkbox 
                      label="Retraités" 
                      checked={formData.categorie === 'retraites'}
                      onChange={() => setFormData({...formData, categorie: 'retraites'})}
                      disabled={!isSection2Enabled}
                    />
                    <div className="flex items-center col-span-2">
                      <Checkbox 
                        label="Autre :" 
                        checked={formData.categorie === 'autre'}
                        onChange={() => setFormData({...formData, categorie: 'autre'})}
                        disabled={!isSection2Enabled}
                      />
                      <input 
                        type="text"
                        value={formData.autre_categorie_precision}
                        onChange={(e) => setFormData({...formData, autre_categorie_precision: e.target.value})}
                        className="border-b border-gray-400 flex-grow bg-transparent focus:outline-none focus:border-[#F48232] text-xs ml-1"
                        placeholder="Préciser..."
                        disabled={!isSection2Enabled || formData.categorie !== 'autre'}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Souscripteur BCEG */}
          <div className={`flex border-b border-[#F48232] ${!isSection3Enabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="w-36 flex-shrink-0 p-2 bg-orange-50 italic border-r border-[#F48232] flex items-center text-gray-900 text-xs">
              {!isSection3Enabled && <Lock className="h-3 w-3 mr-1" />}
              Souscripteur BCEG
            </div>
            <div className="flex-grow p-2 space-y-1 text-[10px]">
              <div className="flex items-end">
                <span className="mr-2 text-gray-800">Raison sociale :</span>
                <span className="font-bold">BANQUE POUR LE COMMERCE ET L'ENTREPRENEURIAT DU GABON (BCEG)</span>
              </div>
              <div className="flex items-end">
                <span className="mr-2 text-gray-800">Adresse :</span>
                <span className="font-medium">Boulevard de l'Indépendance, Immeuble Concorde, B.P. 8.645</span>
              </div>
              <div className="flex items-end">
                <span className="mr-2 text-gray-800">Ville :</span>
                <span className="font-medium">Libreville – Gabon Téléphone : +241 011 77 40 82 / +241 011 77 53 96</span>
              </div>
              <div className="flex items-end">
                <span className="mr-2 text-gray-800">Agence :</span>
                <input 
                  type="text"
                  value={formData.agence}
                  onChange={(e) => setFormData({...formData, agence: e.target.value})}
                  disabled={!isSection3Enabled}
                  className="flex-grow border-b border-gray-600 bg-transparent text-[10px] px-1 focus:outline-none focus:bg-orange-50 font-semibold disabled:bg-gray-100"
                  placeholder="Nom de l'agence"
                />
              </div>
            </div>
          </div>

          {/* Section: Bénéficiaire de la Prévoyance */}
          <div className={`flex border-b border-[#F48232] ${!isSection4Enabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="w-36 flex-shrink-0 p-2 bg-orange-50 italic border-r border-[#F48232] flex items-center text-gray-900 text-xs leading-tight">
              {!isSection4Enabled && <Lock className="h-3 w-3 mr-1" />}
              Bénéficiaire de<br/>la Prévoyance
            </div>
            <div className="flex-grow p-2 space-y-1.5">
              <div className="flex items-end">
                <span className="text-xs text-gray-800 mr-2 whitespace-nowrap">Nom et Prénom :</span>
                <input 
                  type="text"
                  value={formData.beneficiaire_prevoyance_nom_prenom}
                  onChange={(e) => setFormData({...formData, beneficiaire_prevoyance_nom_prenom: e.target.value})}
                  disabled={!isSection4Enabled}
                  className="flex-grow border-b border-gray-800 bg-transparent text-xs px-1 focus:outline-none focus:bg-orange-50 font-semibold disabled:bg-gray-100"
                />
              </div>
              <div className="flex items-end">
                <span className="text-xs text-gray-800 mr-2 whitespace-nowrap">Adresse et contact :</span>
                <input 
                  type="text"
                  value={formData.beneficiaire_prevoyance_adresse}
                  onChange={(e) => setFormData({...formData, beneficiaire_prevoyance_adresse: e.target.value})}
                  disabled={!isSection4Enabled}
                  className="flex-1 border-b border-gray-800 bg-transparent text-xs px-1 focus:outline-none focus:bg-orange-50 font-semibold disabled:bg-gray-100"
                  placeholder="Adresse"
                />
                <span className="mx-2 text-gray-400">/</span>
                <input 
                  type="text"
                  value={formData.beneficiaire_prevoyance_contact}
                  onChange={(e) => setFormData({...formData, beneficiaire_prevoyance_contact: e.target.value})}
                  disabled={!isSection4Enabled}
                  className="w-32 border-b border-gray-800 bg-transparent text-xs px-1 focus:outline-none focus:bg-orange-50 font-semibold disabled:bg-gray-100"
                  placeholder="Contact"
                />
              </div>
            </div>
          </div>

          {/* Section: Garanties */}
          <div className={`flex border-b border-[#F48232] ${!isSection5Enabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="w-36 flex-shrink-0 p-2 bg-orange-50 italic border-r border-[#F48232] flex items-center text-gray-900 text-xs">
              {!isSection5Enabled && <Lock className="h-3 w-3 mr-1" />}
              Garanties
            </div>
            <div className="flex-grow">
              <table className="w-full text-center text-[10px] border-collapse">
                <thead>
                  <tr className="border-b border-[#F48232] font-bold bg-orange-100">
                    <th className="p-1.5 w-[40%] text-left pl-3 border-r border-[#F48232]">Protection & Durées</th>
                    <th className="border-r border-[#F48232] p-1.5 w-[15%]">Option</th>
                    <th className="border-r border-[#F48232] p-1.5 w-[15%]">Taux</th>
                    <th className="p-1.5 w-[30%]">Prime unique</th>
                  </tr>
                </thead>
                <tbody>
                  <GarantieRow 
                    label="Décès/IAD (Durée max. à 24 mois)" 
                    rate="1,00%" 
                    prime={formData.tranche_duree === 'max_24' ? `${formatCurrency(cotisationDeces)} FCFA` : 'N/A'}
                    isSelected={formData.tranche_duree === 'max_24'}
                    onClick={() => setFormData({...formData, tranche_duree: 'max_24', duree_pret_mois: '24'})}
                  />
                  <GarantieRow 
                    label="Décès/IAD (Durée entre 24 à 36 mois)" 
                    rate="1,50%" 
                    prime={formData.tranche_duree === '24_36' ? `${formatCurrency(cotisationDeces)} FCFA` : 'N/A'}
                    isSelected={formData.tranche_duree === '24_36'}
                    onClick={() => setFormData({...formData, tranche_duree: '24_36', duree_pret_mois: '36'})}
                  />
                  <GarantieRow 
                    label="Décès/IAD (Durée entre 36 à 48 mois)" 
                    rate="1,75%" 
                    prime={formData.tranche_duree === '36_48' ? `${formatCurrency(cotisationDeces)} FCFA` : 'N/A'}
                    isSelected={formData.tranche_duree === '36_48'}
                    onClick={() => setFormData({...formData, tranche_duree: '36_48', duree_pret_mois: '48'})}
                  />
                  <GarantieRow 
                    label="Décès/IAD (Durée entre 48 à 60 mois)" 
                    rate="2,00%" 
                    prime={formData.tranche_duree === '48_60' ? `${formatCurrency(cotisationDeces)} FCFA` : 'N/A'}
                    isSelected={formData.tranche_duree === '48_60'}
                    onClick={() => setFormData({...formData, tranche_duree: '48_60', duree_pret_mois: '60'})}
                  />
                  <tr className="border-t border-[#F48232]">
                    <td className="p-1.5 text-left pl-3 border-r border-[#F48232] font-medium text-[10px]">Prévoyance Décès/IAD</td>
                    <td className="border-r border-[#F48232] p-1">
                      <div 
                        onClick={() => setFormData({...formData, garantie_prevoyance: !formData.garantie_prevoyance})}
                        className={`w-6 h-4 border border-black rounded-sm mx-auto cursor-pointer transition-colors ${formData.garantie_prevoyance ? 'bg-gray-800' : 'bg-white'}`}
                      />
                    </td>
                    <td className="border-r border-[#F48232] p-1.5 text-[10px]">N/A</td>
                    <td className="p-1.5 font-bold text-[10px]">10 000 FCFA</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section: Cotisations */}
          <div className="flex bg-orange-50">
            <div className="w-36 flex-shrink-0 p-2 italic border-r border-[#F48232] flex items-center text-gray-900 text-xs">
              Cotisations
            </div>
            <div className="flex-grow p-2">
              <div className="font-bold flex items-end text-xs">
                <span className="whitespace-nowrap">Cotisation totale :</span>
                <span className="flex-grow mx-2 border-b-2 border-black text-center font-mono text-base font-extrabold">
                  {formatCurrency(cotisationTotale)}
                </span>
                <span className="whitespace-nowrap text-[10px]">FCFA TTC (Taux × Montant du prêt) + 10 000 FCFA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footnotes */}
        <div className="mt-3 text-[10px] font-bold space-y-0.5 text-black">
          <p>(1) Le montant maximal de couverture de prêt est de 20 000 000 FCFA</p>
          <p>(2) La protection forfaitaire est d'un montant de 250 000 FCFA en cas de décès ou d'invalidité absolue et définitive.</p>
        </div>

        {/* Signatures */}
        <div className="mt-auto mb-2">
          <div className="text-right mb-4 pr-4 font-medium text-xs">
            Fait à <span className="border-b border-black px-2 mx-1 font-semibold">{formData.lieu_signature}</span>, 
            le <span className="border-b border-black px-2 mx-1 font-semibold">{formatDate(formData.date_signature || new Date().toISOString())}</span>
          </div>

          <div className="flex justify-between items-start pt-2">
            <div className="w-[30%] flex flex-col">
              <span className="font-bold mb-1 ml-4 text-xs">L'Assuré</span>
              <div className="border border-black h-20 w-full flex items-center justify-center text-gray-300 text-[10px] bg-white">
                Signature
              </div>
            </div>
            
            <div className="w-[35%] flex flex-col items-center justify-end pb-2 font-bold text-[9px] space-y-0.5 self-end">
              <div className="flex gap-4">
                <span>Feuillet 1 : Assuré</span>
                <span>Feuillet 2 : BCEG</span>
              </div>
              <div className="flex gap-4">
                <span>Feuillet 3 : SAMB'A</span>
                <span>Feuillet 4 : Souche</span>
              </div>
            </div>

            <div className="w-[30%] flex flex-col">
              <span className="font-bold mb-1 text-right mr-4 text-xs">BCEG P/C de L'Assureur</span>
              <div className="border border-black h-20 w-full flex items-center justify-center text-gray-300 text-[10px] bg-white">
                Signature et cachet
              </div>
            </div>
          </div>
        </div>

        <Footer pageNum={1} />
      </div>
    </div>
  )
}
