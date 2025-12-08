// src/features/contrats/cofidec/CofidecContractCreateOfficial.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Printer, Save, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useCreateCofidecContract } from '@/hooks/useCofidecContracts'
import { Button } from '@/components/ui/Button'
import logoSamba from '@/assets/logo-samba.png'

// --- Logo Component ---
const Logo: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center mb-0">
      <img 
        src={logoSamba} 
        alt="SAMB'A Assurances" 
        className="h-[70px] w-auto"
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

// --- Checkbox Component ---
const Checkbox: React.FC<{ 
  label: string
  checked?: boolean
  onChange?: () => void 
}> = ({ label, checked, onChange }) => (
  <div className="flex items-center mr-3 cursor-pointer" onClick={onChange}>
    <div className={`w-4 h-4 border-2 border-black mr-1.5 flex items-center justify-center transition-colors ${checked ? 'bg-[#F48232]' : 'bg-white hover:bg-orange-50'}`}>
      {checked && <div className="w-2 h-2 bg-white" />}
    </div>
    <span className="text-[10px] text-gray-800">{label}</span>
  </div>
)

export const CofidecContractCreateOfficial = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const emfId = user?.emf_id || 2 // COFIDEC = 2

  const [formData, setFormData] = useState({
    emf_id: emfId,
    nom_prenom: '',
    adresse_assure: '',
    ville_assure: '',
    telephone_assure: '',
    email_assure: '',
    montant_pret: '',
    duree_pret_mois: '',
    date_effet: '',
    date_fin_echeance: '',
    categorie: '' as '' | 'commercants' | 'salaries_public' | 'salaries_prive' | 'retraites' | 'salaries_cofidec' | 'autre',
    autre_categorie_precision: '',
    agence: '',
    garantie_prevoyance: true,
    garantie_deces_iad: true,
    garantie_perte_emploi: false,
    lieu_signature: 'Libreville',
    date_signature: new Date().toISOString().split('T')[0],
  })

  const [submitError, setSubmitError] = useState('')
  const { mutate: createContract, isPending } = useCreateCofidecContract()

  // Calculer la date de fin automatiquement
  useEffect(() => {
    if (formData.date_effet && formData.duree_pret_mois) {
      const dateEffet = new Date(formData.date_effet)
      const duree = parseInt(formData.duree_pret_mois) || 0
      dateEffet.setMonth(dateEffet.getMonth() + duree)
      setFormData(prev => ({ ...prev, date_fin_echeance: dateEffet.toISOString().split('T')[0] }))
    }
  }, [formData.date_effet, formData.duree_pret_mois])

  // Calcul des cotisations COFIDEC
  const montant = parseInt(formData.montant_pret) || 0
  const duree = parseInt(formData.duree_pret_mois) || 0
  
  // Taux selon catégorie et durée
  const getTaux = () => {
    if (formData.categorie === 'salaries_cofidec') return 0.0075 // 0.75%
    if (duree >= 1 && duree <= 6) return 0.005 // 0.50%
    if (duree > 6 && duree <= 13) return 0.01 // 1.00%
    if (duree > 13 && duree <= 24) return 0.0175 // 1.75%
    return 0
  }
  
  const tauxDeces = getTaux()
  const cotisationDeces = montant * tauxDeces
  const cotisationPrevoyance = formData.garantie_prevoyance ? 5000 : 0
  const tauxPerteEmploi = formData.garantie_perte_emploi ? 0.02 : 0
  const cotisationPerteEmploi = montant * tauxPerteEmploi
  const cotisationTotale = cotisationDeces + cotisationPrevoyance + cotisationPerteEmploi

  // Validation des règles métier
  const montantMaxPret = formData.categorie === 'salaries_cofidec' ? 20000000 : 
                         duree <= 6 ? 5000000 : 
                         duree <= 13 ? 10000000 : 20000000
  const dureeMaxPret = 24
  const isContractValid = montant > 0 && montant <= montantMaxPret && duree > 0 && duree <= dureeMaxPret && formData.categorie !== ''

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('═══════════════════════════════════════════════════════════════')
    console.log('📋 COFIDEC - Validation des champs obligatoires...')

    const requiredFields = [
      { field: 'nom_prenom', label: 'Nom & Prénom' },
      { field: 'adresse_assure', label: 'Adresse' },
      { field: 'ville_assure', label: 'Ville' },
      { field: 'telephone_assure', label: 'Téléphone' },
      { field: 'montant_pret', label: 'Montant du prêt' },
      { field: 'duree_pret_mois', label: 'Durée du prêt' },
      { field: 'date_effet', label: 'Date d\'effet' },
      { field: 'categorie', label: 'Catégorie' },
    ]

    const missingFields: string[] = []
    requiredFields.forEach(({ field, label }) => {
      const value = formData[field as keyof typeof formData]
      if (!value || (typeof value === 'string' && !value.trim())) {
        missingFields.push(label)
      }
    })

    if (missingFields.length > 0) {
      setSubmitError(`Champs obligatoires manquants: ${missingFields.join(', ')}`)
      return
    }

    const payload = {
      emf_id: Number(formData.emf_id),
      nom_prenom: formData.nom_prenom.trim(),
      adresse_assure: formData.adresse_assure.trim(),
      ville_assure: formData.ville_assure.trim(),
      telephone_assure: formData.telephone_assure.trim(),
      email_assure: formData.email_assure?.trim() || null,
      montant_pret: parseInt(formData.montant_pret),
      duree_pret_mois: parseInt(formData.duree_pret_mois),
      date_effet: formData.date_effet,
      categorie: formData.categorie,
      autre_categorie_precision: formData.autre_categorie_precision?.trim() || null,
      agence: formData.agence?.trim() || null,
      garantie_prevoyance: formData.garantie_prevoyance ? 1 : 0,
      garantie_deces_iad: formData.garantie_deces_iad ? 1 : 0,
      garantie_perte_emploi: formData.garantie_perte_emploi ? 1 : 0,
      statut: 'actif',
    }

    console.log('📤 Payload COFIDEC:', JSON.stringify(payload, null, 2))

    createContract(payload, {
      onSuccess: (data) => {
        console.log('✅ Contrat COFIDEC créé avec succès! ID:', data.id)
        navigate(`/contrats/cofidec/${data.id}`, {
          state: { success: 'Contrat créé avec succès !' }
        })
      },
      onError: (error: any) => {
        console.error('❌ Erreur création COFIDEC:', error.response?.data?.message || error.message)
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

      {/* PAGE 1 - Contrat COFIDEC */}
      <div className="bg-white w-[210mm] min-h-[297mm] p-[10mm] shadow-xl relative flex flex-col print:shadow-none print:p-[8mm]">
        {/* Header */}
        <div className="flex flex-col items-center mb-3">
          <Logo />
          <h1 className="text-[#F48232] text-lg font-extrabold uppercase mt-2 text-center leading-tight tracking-wide">
            CONTRAT DECES EMPRUNTEUR COFIDEC
          </h1>
          <p className="text-[10px] text-black font-semibold mt-1">Contrat régi par les dispositions du Code des Assurances CIMA</p>
          <div className="text-xs font-bold text-black mt-1">
            Visas DNA N°005/24 et N°008/24 - Convention N°: 503/111.112/0624
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
            <div className="w-28 flex-shrink-0 p-2 bg-orange-50 italic border-r border-[#F48232] flex items-center text-gray-900 text-xs">
              Couverture
            </div>
            <div className="flex-grow p-2 space-y-2">
              <div className="flex gap-4">
                <div className="flex items-end flex-1">
                  <span className="text-[10px] text-gray-800 mr-1 whitespace-nowrap">Montant du prêt :</span>
                  <input 
                    type="number"
                    value={formData.montant_pret}
                    onChange={(e) => setFormData({...formData, montant_pret: e.target.value})}
                    className="flex-grow border-b border-gray-800 bg-transparent text-xs px-1 focus:outline-none focus:bg-orange-50 font-semibold text-right"
                    placeholder="0"
                  />
                  <span className="text-[10px] ml-1">FCFA</span>
                </div>
                <div className="flex items-end w-[140px] flex-shrink-0">
                  <span className="text-[10px] text-gray-800 mr-1">Durée :</span>
                  <input 
                    type="number"
                    value={formData.duree_pret_mois}
                    onChange={(e) => setFormData({...formData, duree_pret_mois: e.target.value})}
                    className="w-12 border-b border-gray-800 bg-transparent text-xs px-1 focus:outline-none focus:bg-orange-50 font-semibold text-center"
                    placeholder="0"
                    max="24"
                  />
                  <span className="text-[10px] ml-1">mois</span>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex items-end flex-1">
                  <span className="text-[10px] text-gray-800 mr-1 whitespace-nowrap">Date d'effet :</span>
                  <input 
                    type="date"
                    value={formData.date_effet}
                    onChange={(e) => setFormData({...formData, date_effet: e.target.value})}
                    className="flex-grow border-b border-gray-800 bg-transparent text-xs px-1 focus:outline-none focus:bg-orange-50 font-semibold"
                  />
                </div>
                <div className="flex items-end flex-1">
                  <span className="text-[10px] text-gray-800 mr-1 whitespace-nowrap">Fin échéance :</span>
                  <input 
                    type="date"
                    value={formData.date_fin_echeance}
                    readOnly
                    className="flex-grow border-b border-gray-800 bg-gray-100 text-xs px-1 font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Assuré */}
          <div className="flex border-b border-[#F48232]">
            <div className="w-28 flex-shrink-0 p-2 bg-orange-50 italic border-r border-[#F48232] flex items-center text-gray-900 text-xs">
              Assuré
            </div>
            <div className="flex-grow p-2 space-y-1.5">
              <div className="flex items-end">
                <span className="text-xs text-gray-800 mr-2 w-24">Nom & Prénom :</span>
                <input 
                  type="text"
                  value={formData.nom_prenom}
                  onChange={(e) => setFormData({...formData, nom_prenom: e.target.value})}
                  className="flex-grow border-b border-gray-800 bg-transparent text-xs px-1 focus:outline-none focus:bg-orange-50 font-semibold"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex items-end flex-1">
                  <span className="text-xs text-gray-800 mr-2">Adresse :</span>
                  <input 
                    type="text"
                    value={formData.adresse_assure}
                    onChange={(e) => setFormData({...formData, adresse_assure: e.target.value})}
                    className="flex-grow border-b border-gray-800 bg-transparent text-xs px-1 focus:outline-none focus:bg-orange-50 font-semibold"
                  />
                </div>
                <div className="flex items-end flex-1">
                  <span className="text-xs text-gray-800 mr-2">Ville :</span>
                  <input 
                    type="text"
                    value={formData.ville_assure}
                    onChange={(e) => setFormData({...formData, ville_assure: e.target.value})}
                    className="flex-grow border-b border-gray-800 bg-transparent text-xs px-1 focus:outline-none focus:bg-orange-50 font-semibold"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex items-end flex-1">
                  <span className="text-xs text-gray-800 mr-2">Téléphone :</span>
                  <input 
                    type="text"
                    value={formData.telephone_assure}
                    onChange={(e) => setFormData({...formData, telephone_assure: e.target.value})}
                    className="flex-grow border-b border-gray-800 bg-transparent text-xs px-1 focus:outline-none focus:bg-orange-50 font-semibold"
                  />
                </div>
                <div className="flex items-end flex-1">
                  <span className="text-xs text-gray-800 mr-2">Email :</span>
                  <input 
                    type="email"
                    value={formData.email_assure}
                    onChange={(e) => setFormData({...formData, email_assure: e.target.value})}
                    className="flex-grow border-b border-gray-800 bg-transparent text-xs px-1 focus:outline-none focus:bg-orange-50 font-semibold"
                  />
                </div>
              </div>
              {/* Catégories */}
              <div className="flex flex-wrap items-center mt-1 gap-y-1 text-xs">
                <span className="mr-2 text-xs text-gray-800 whitespace-nowrap">Catégorie :</span>
                <Checkbox 
                  label="Commerçants" 
                  checked={formData.categorie === 'commercants'}
                  onChange={() => setFormData({...formData, categorie: 'commercants'})}
                />
                <Checkbox 
                  label="Salariés du public" 
                  checked={formData.categorie === 'salaries_public'}
                  onChange={() => setFormData({...formData, categorie: 'salaries_public'})}
                />
                <Checkbox 
                  label="Salariés du privé" 
                  checked={formData.categorie === 'salaries_prive'}
                  onChange={() => setFormData({...formData, categorie: 'salaries_prive'})}
                />
                <Checkbox 
                  label="Salariés COFIDEC" 
                  checked={formData.categorie === 'salaries_cofidec'}
                  onChange={() => setFormData({...formData, categorie: 'salaries_cofidec'})}
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  label="Retraités" 
                  checked={formData.categorie === 'retraites'}
                  onChange={() => setFormData({...formData, categorie: 'retraites'})}
                />
                <div className="flex items-end flex-grow">
                  <Checkbox 
                    label="Autre à préciser :" 
                    checked={formData.categorie === 'autre'}
                    onChange={() => setFormData({...formData, categorie: 'autre'})}
                  />
                  <input 
                    type="text"
                    value={formData.autre_categorie_precision}
                    onChange={(e) => setFormData({...formData, autre_categorie_precision: e.target.value})}
                    disabled={formData.categorie !== 'autre'}
                    className="border-b border-gray-400 flex-grow ml-1 bg-transparent focus:outline-none text-xs disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Souscripteur */}
          <div className="flex border-b border-[#F48232]">
            <div className="w-28 flex-shrink-0 p-2 bg-orange-50 italic border-r border-[#F48232] flex items-center text-gray-900 text-xs">
              Souscripteur
            </div>
            <div className="flex-grow p-2 space-y-1 text-[10px]">
              <div className="flex items-end">
                <span className="mr-2 text-gray-800">Raison sociale :</span>
                <span className="font-bold">COOPÉRATIVE POUR LE FINANCEMENT DU DÉVELOPPEMENT COMMUNAUTAIRE « COFIDEC »</span>
              </div>
              <div className="flex items-end gap-4">
                <div className="flex items-end">
                  <span className="mr-2 text-gray-800">Adresse :</span>
                  <span className="font-medium">B.P. 2.551</span>
                </div>
                <div className="flex items-end flex-grow">
                  <span className="mr-2 text-gray-800">Agence :</span>
                  <input 
                    type="text"
                    value={formData.agence}
                    onChange={(e) => setFormData({...formData, agence: e.target.value})}
                    className="flex-grow border-b border-gray-600 bg-transparent text-[10px] px-1 focus:outline-none focus:bg-orange-50 font-semibold"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <span className="text-gray-800">Ville : Libreville – Gabon / Téléphone : 011 49 18 17 / 074 48 25 80 / Email : cofidecemf@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Section: Garanties */}
          <div className="flex border-b border-[#F48232]">
            <div className="w-28 flex-shrink-0 p-2 bg-orange-50 italic border-r border-[#F48232] flex items-center text-gray-900 text-xs">
              Garanties
            </div>
            <div className="flex-grow">
              <table className="w-full text-center text-[9px] border-collapse">
                <thead>
                  <tr className="border-b border-[#F48232] font-bold bg-orange-100">
                    <th className="p-1 border-r border-[#F48232] w-[18%]">Type de protection</th>
                    <th className="p-1 border-r border-[#F48232] w-[18%]">Cible</th>
                    <th className="p-1 border-r border-[#F48232] w-[14%]">Prime unique</th>
                    <th className="p-1 border-r border-[#F48232] w-[25%]">Période de couverture</th>
                    <th className="p-1 w-[18%]">Montant max</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={`border-b border-[#F48232] ${formData.garantie_prevoyance ? 'bg-orange-50' : ''}`}>
                    <td className="p-1 border-r border-[#F48232] text-left pl-2 font-medium">Prévoyance</td>
                    <td className="p-1 border-r border-[#F48232]">Toutes catégories</td>
                    <td className="p-1 border-r border-[#F48232] font-bold">5 000 FCFA</td>
                    <td className="p-1 border-r border-[#F48232]">Durée du prêt</td>
                    <td className="p-1">250 000 FCFA</td>
                  </tr>
                  <tr className={`border-b border-[#F48232] ${formData.categorie === 'salaries_cofidec' ? 'bg-orange-50' : ''}`}>
                    <td className="p-1 border-r border-[#F48232] text-left pl-2 font-medium">Décès ou IAD</td>
                    <td className="p-1 border-r border-[#F48232]">Salariés COFIDEC</td>
                    <td className="p-1 border-r border-[#F48232] font-bold">0,75% du prêt</td>
                    <td className="p-1 border-r border-[#F48232]">Durée du prêt</td>
                    <td className="p-1">20 000 000 FCFA</td>
                  </tr>
                  <tr className={`border-b border-[#F48232] ${duree >= 1 && duree <= 6 && formData.categorie !== 'salaries_cofidec' ? 'bg-orange-50' : ''}`}>
                    <td className="p-1 border-r border-[#F48232] text-left pl-2 font-medium">Décès ou IAD</td>
                    <td className="p-1 border-r border-[#F48232]">Toutes catégories</td>
                    <td className="p-1 border-r border-[#F48232] font-bold">0,50% du prêt</td>
                    <td className="p-1 border-r border-[#F48232]">1 à 6 mois max</td>
                    <td className="p-1">5 000 000 FCFA</td>
                  </tr>
                  <tr className={`border-b border-[#F48232] ${duree > 6 && duree <= 13 && formData.categorie !== 'salaries_cofidec' ? 'bg-orange-50' : ''}`}>
                    <td className="p-1 border-r border-[#F48232] text-left pl-2 font-medium">Décès ou IAD</td>
                    <td className="p-1 border-r border-[#F48232]">Toutes catégories</td>
                    <td className="p-1 border-r border-[#F48232] font-bold">1,00% du prêt</td>
                    <td className="p-1 border-r border-[#F48232]">6 à 12(+1) mois</td>
                    <td className="p-1">10 000 000 FCFA</td>
                  </tr>
                  <tr className={`border-b border-[#F48232] ${duree > 13 && duree <= 24 && formData.categorie !== 'salaries_cofidec' ? 'bg-orange-50' : ''}`}>
                    <td className="p-1 border-r border-[#F48232] text-left pl-2 font-medium">Décès ou IAD</td>
                    <td className="p-1 border-r border-[#F48232]">Toutes catégories</td>
                    <td className="p-1 border-r border-[#F48232] font-bold">1,75% du prêt</td>
                    <td className="p-1 border-r border-[#F48232]">12 à 24 mois</td>
                    <td className="p-1">20 000 000 FCFA</td>
                  </tr>
                  <tr className={`${formData.garantie_perte_emploi ? 'bg-orange-50' : ''}`}>
                    <td className="p-1 border-r border-[#F48232] text-left pl-2 font-medium">Perte d'emploi/activités</td>
                    <td className="p-1 border-r border-[#F48232]">Privé & Commerçants</td>
                    <td className="p-1 border-r border-[#F48232] font-bold">2,00% du prêt</td>
                    <td className="p-1 border-r border-[#F48232]">Max 24 mois</td>
                    <td className="p-1">20 000 000 FCFA</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section: Cotisations */}
          <div className="flex bg-orange-50">
            <div className="w-28 flex-shrink-0 p-2 italic border-r border-[#F48232] flex items-center text-gray-900 text-xs">
              Cotisations
            </div>
            <div className="flex-grow p-2">
              <div className="font-bold flex items-end text-xs">
                <span className="whitespace-nowrap">Cotisation totale :</span>
                <span className="flex-grow mx-2 border-b-2 border-black text-center font-mono text-base font-extrabold">
                  {formatCurrency(cotisationTotale)}
                </span>
                <span className="whitespace-nowrap text-[9px]">FCFA TTC (Montant × taux) + Prévoyance</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footnotes */}
        <div className="mt-2 text-[9px] font-bold space-y-0.5 text-black">
          <p>(1) La Prévoyance est d'un montant maximal de 250.000 FCFA et pour une durée égale à la durée du prêt accordé à l'Assuré.</p>
          <p>(2) Le montant maximal du prêt couvert est de FCFA 20.000.000 pour une durée de 24 mois.</p>
          <p>(3) La durée maximale d'indemnisation pour la garantie Perte d'emploi ou d'Activités est de 03 mois pour un montant maximal de FCFA 1 000.000.</p>
        </div>

        {/* Signatures */}
        <div className="mt-auto mb-1">
          <div className="text-right mb-3 pr-4 font-medium text-xs">
            Fait à <span className="border-b border-black px-2 mx-1 font-semibold">{formData.lieu_signature}</span>, 
            le <span className="border-b border-black px-2 mx-1 font-semibold">{formatDate(formData.date_signature || new Date().toISOString())}</span>
          </div>

          <div className="flex justify-between items-start pt-1">
            <div className="w-[28%] flex flex-col">
              <span className="font-bold mb-1 ml-4 text-xs">L'Assuré</span>
              <div className="border border-black h-16 w-full flex items-center justify-center text-gray-300 text-[10px] bg-white">
                Signature
              </div>
            </div>
            
            <div className="w-[38%] flex flex-col items-center justify-end pb-1 font-bold text-[8px] space-y-0.5 self-end">
              <div className="flex gap-3">
                <span>Feuillet 1 : Assuré</span>
                <span>Feuillet 2 : COFIDEC</span>
              </div>
              <div className="flex gap-3">
                <span>Feuillet 3 : SAMB'A</span>
                <span>Feuillet 4 : Souche</span>
              </div>
            </div>

            <div className="w-[28%] flex flex-col">
              <span className="font-bold mb-1 text-right mr-4 text-xs">COFIDEC P/C de L'Assureur</span>
              <div className="border border-black h-16 w-full flex items-center justify-center text-gray-300 text-[10px] bg-white">
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
