// src/features/contrats/bceg/BcegContractCreateOfficial.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Printer, Save, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react'
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

export const BcegContractCreateOfficial = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const emfId = user?.emf_id || 3

  const [formData, setFormData] = useState({
    emf_id: emfId,
    nom: '',
    prenom: '',
    adresse_assure: '',
    ville_assure: '',
    telephone_assure: '',
    email_assure: '',
    numero_police: '509/111.701:0225',
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
      numero_police: formData.numero_police?.trim() || undefined,
      montant_pret: parseInt(formData.montant_pret),
      duree_pret_mois: parseInt(formData.duree_pret_mois),
      date_effet: formData.date_effet,
      beneficiaire_prevoyance_nom_prenom: formData.beneficiaire_prevoyance_nom_prenom.trim(),
      beneficiaire_prevoyance_adresse: formData.beneficiaire_prevoyance_adresse?.trim() || undefined,
      beneficiaire_prevoyance_contact: formData.beneficiaire_prevoyance_contact?.trim() || undefined,
      garantie_deces_iad: formData.garantie_deces_iad ? 1 : 0,
      garantie_prevoyance: formData.garantie_prevoyance ? 1 : 0,
      agence: formData.agence?.trim() || undefined,
      statut: isContractValid ? 'actif' : 'en_attente',
    }

    console.log('✅ ÉTAPE 2: Payload construit')
    console.log('📤 Payload à envoyer:', JSON.stringify(payload, null, 2))
    console.log('📋 ÉTAPE 3: Envoi au serveur...')

    createContract(payload, {
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
        console.error('═══════════════════════════════════════════════════════════════')
        
        setSubmitError(error.response?.data?.message || 'Erreur lors de la création')
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
            disabled={isPending}
            className="bg-[#F48232] hover:bg-orange-600"
          >
            <Save className="h-4 w-4 mr-2" />
            {isPending ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {submitError && (
        <div className="w-[210mm] mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded print:hidden">
          {submitError}
        </div>
      )}

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
            Visa DNA N°005/24 & 008/24 - Police N°: 
            <input 
              type="text"
              value={formData.numero_police}
              onChange={(e) => setFormData({...formData, numero_police: e.target.value})}
              placeholder="Entrez le numéro de police"
              className="ml-2 border-b border-black bg-transparent text-center w-40 focus:outline-none focus:bg-orange-50"
            />
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
          <div className="flex border-b border-[#F48232]">
            <div className="w-36 flex-shrink-0 p-2 bg-orange-50 italic border-r border-[#F48232] flex items-center text-gray-900 text-xs leading-tight">
              Assuré/<br/>Bénéficiaire du prêt
            </div>
            <div className="flex-grow p-2 space-y-1.5">
              <div className="flex items-end">
                <span className="text-xs text-gray-800 mr-2 w-20">Nom :</span>
                <input 
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({...formData, nom: e.target.value})}
                  className="flex-grow border-b border-gray-800 bg-transparent text-xs px-1 focus:outline-none focus:bg-orange-50 font-semibold"
                />
              </div>
              <div className="flex items-end">
                <span className="text-xs text-gray-800 mr-2 w-20">Prénom :</span>
                <input 
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                  className="flex-grow border-b border-gray-800 bg-transparent text-xs px-1 focus:outline-none focus:bg-orange-50 font-semibold"
                />
              </div>
              <div className="flex items-end">
                <span className="text-xs text-gray-800 mr-2 w-20">Adresse :</span>
                <input 
                  type="text"
                  value={formData.adresse_assure}
                  onChange={(e) => setFormData({...formData, adresse_assure: e.target.value})}
                  className="flex-grow border-b border-gray-800 bg-transparent text-xs px-1 focus:outline-none focus:bg-orange-50 font-semibold"
                />
              </div>
              <div className="flex items-end">
                <span className="text-xs text-gray-800 mr-2 w-20">Ville :</span>
                <input 
                  type="text"
                  value={formData.ville_assure}
                  onChange={(e) => setFormData({...formData, ville_assure: e.target.value})}
                  className="flex-grow border-b border-gray-800 bg-transparent text-xs px-1 focus:outline-none focus:bg-orange-50 font-semibold"
                />
              </div>
              <div className="flex items-end">
                <span className="text-xs text-gray-800 mr-2 w-20">Tél / Email :</span>
                <input 
                  type="text"
                  value={formData.telephone_assure}
                  onChange={(e) => setFormData({...formData, telephone_assure: e.target.value})}
                  className="flex-1 border-b border-gray-800 bg-transparent text-xs px-1 focus:outline-none focus:bg-orange-50 font-semibold"
                  placeholder="Téléphone"
                />
                <span className="mx-2 text-gray-400">/</span>
                <input 
                  type="email"
                  value={formData.email_assure}
                  onChange={(e) => setFormData({...formData, email_assure: e.target.value})}
                  className="flex-1 border-b border-gray-800 bg-transparent text-xs px-1 focus:outline-none focus:bg-orange-50 font-semibold"
                  placeholder="Email"
                />
              </div>
            </div>
          </div>

          {/* Section: Souscripteur BCEG */}
          <div className="flex border-b border-[#F48232]">
            <div className="w-36 flex-shrink-0 p-2 bg-orange-50 italic border-r border-[#F48232] flex items-center text-gray-900 text-xs">
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
                  className="flex-grow border-b border-gray-600 bg-transparent text-[10px] px-1 focus:outline-none focus:bg-orange-50 font-semibold"
                  placeholder="Nom de l'agence"
                />
              </div>
            </div>
          </div>

          {/* Section: Bénéficiaire de la Prévoyance */}
          <div className="flex border-b border-[#F48232]">
            <div className="w-36 flex-shrink-0 p-2 bg-orange-50 italic border-r border-[#F48232] flex items-center text-gray-900 text-xs leading-tight">
              Bénéficiaire de<br/>la Prévoyance
            </div>
            <div className="flex-grow p-2 space-y-1.5">
              <div className="flex items-end">
                <span className="text-xs text-gray-800 mr-2 whitespace-nowrap">Nom et Prénom :</span>
                <input 
                  type="text"
                  value={formData.beneficiaire_prevoyance_nom_prenom}
                  onChange={(e) => setFormData({...formData, beneficiaire_prevoyance_nom_prenom: e.target.value})}
                  className="flex-grow border-b border-gray-800 bg-transparent text-xs px-1 focus:outline-none focus:bg-orange-50 font-semibold"
                />
              </div>
              <div className="flex items-end">
                <span className="text-xs text-gray-800 mr-2 whitespace-nowrap">Adresse et contact :</span>
                <input 
                  type="text"
                  value={formData.beneficiaire_prevoyance_adresse}
                  onChange={(e) => setFormData({...formData, beneficiaire_prevoyance_adresse: e.target.value})}
                  className="flex-1 border-b border-gray-800 bg-transparent text-xs px-1 focus:outline-none focus:bg-orange-50 font-semibold"
                  placeholder="Adresse"
                />
                <span className="mx-2 text-gray-400">/</span>
                <input 
                  type="text"
                  value={formData.beneficiaire_prevoyance_contact}
                  onChange={(e) => setFormData({...formData, beneficiaire_prevoyance_contact: e.target.value})}
                  className="w-32 border-b border-gray-800 bg-transparent text-xs px-1 focus:outline-none focus:bg-orange-50 font-semibold"
                  placeholder="Contact"
                />
              </div>
            </div>
          </div>

          {/* Section: Garanties */}
          <div className="flex border-b border-[#F48232]">
            <div className="w-36 flex-shrink-0 p-2 bg-orange-50 italic border-r border-[#F48232] flex items-center text-gray-900 text-xs">
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
