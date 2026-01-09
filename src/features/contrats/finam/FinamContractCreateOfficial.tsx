import React, { useState, useEffect, useRef, InputHTMLAttributes } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Printer, CheckCircle, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCreateFinamContract } from '@/hooks/useFinamContracts'
import { useReactToPrint } from 'react-to-print'
import logoSamba from '@/assets/logo-samba.png'

// --- FormInput Component ---
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}


const FormInput: React.FC<InputProps> = ({ label, error, className = "", ...props }) => (
  <div className="flex flex-col w-full">
    <div className="flex items-end w-full">
      {label && <span className="mr-2 whitespace-nowrap text-[11px] text-gray-800">{label}</span>}
      <input
        className={`flex-grow border-b ${error ? 'border-red-400' : 'border-gray-400'} bg-transparent text-[11px] px-1 py-0 focus:outline-none focus:border-orange-500 ${props.disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`}
        {...props}
      />
    </div>
    {error && <span className="text-[9px] text-red-500 font-medium ml-auto mt-0.5">{error}</span>}
  </div>
)


// --- Checkbox Component ---
const Checkbox: React.FC<{ label: string; checked?: boolean; onChange?: (checked: boolean) => void; disabled?: boolean }> = ({ label, checked, onChange, disabled }) => (
  <div
    className={`flex items-center mr-4 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    onClick={() => !disabled && onChange?.(!checked)}
  >
    <div className={`w-4 h-4 border border-black mr-2 flex items-center justify-center ${checked ? 'bg-black' : 'bg-white'}`}>
      {checked && <div className="w-2 h-2 bg-white" />}
    </div>
    <span className="text-[10px] text-gray-800">{label}</span>
  </div>
)

// --- Section Label Component ---
const SectionLabel: React.FC<{ children: React.ReactNode; locked?: boolean }> = ({ children, locked }) => (
  <div className={`w-36 flex-shrink-0 p-2 bg-gray-50 italic border-r border-gray-300 flex items-center text-[11px] text-gray-700 ${locked ? 'relative' : ''}`}>
    {children}
    {locked && (
      <Lock className="h-3 w-3 text-orange-500 ml-1" />
    )}
  </div>
)

// --- Footer Component ---
const Footer: React.FC = () => {
  return (
    <div className="mt-auto pt-4 text-center text-[8px] text-gray-600 space-y-1 leading-tight border-t border-gray-200">
      <div className="font-bold uppercase text-black text-[10px]">SAMB'A ASSURANCES GABON S.A.</div>
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

      <div className="flex justify-between items-start pt-3 px-4 relative">
        <div className="flex flex-col items-center w-1/3 text-center border-r border-gray-300">
          <div className="font-semibold text-gray-700 text-[9px]">326 Rue Jean-Baptiste NDENDE</div>
          <div className="text-[8px]">Avenue de COINTET | Centre-Ville | Libreville</div>
        </div>
        <div className="flex flex-col items-center w-1/3 text-center border-r border-gray-300">
          <div className="font-semibold text-gray-700 text-[9px]">B.P : 22 215 | Libreville | Gabon</div>
          <div className="text-[8px]">Email : infos@samba-assurances.com</div>
        </div>
        <div className="flex flex-col items-center w-1/3 text-center">
          <div className="font-semibold text-gray-700 text-[9px]">(+241) 060 08 62 62 - 074 40 41 41</div>
          <div className="text-[8px]">074 40 51 51</div>
        </div>
      </div>
    </div>
  )
}

const FinamContractCreateOfficial: React.FC = () => {
  const navigate = useNavigate()
  const printRef = useRef<HTMLDivElement>(null)

  // Date du jour pour initialisation
  const today = new Date()
  const todayDay = String(today.getDate()).padStart(2, '0')
  const todayMonth = String(today.getMonth() + 1).padStart(2, '0')
  const todayYear = String(today.getFullYear())

  const [formData, setFormData] = useState({
    numero_police: '',
    montant_a_assurer: '',
    date_effet: '',
    date_fin_echeance: '',
    duree_pret: '',
    montant_mensualite: '',
    taux_pret: '',
    nom: '',
    prenom: '',
    adresse: '',
    ville: '',
    telephone: '',
    email: '',
    categorie: '' as 'Personnel FINAM' | 'Retraités' | '',
    agence: '',
    lieu_signature: 'Libreville',
    date_signature_jour: todayDay,
    date_signature_mois: todayMonth,
    date_signature_annee: todayYear
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const { mutate: createContract, isPending } = useCreateFinamContract()

  // Validation des limites par catégorie
  const getValidationErrors = () => {
    const errs: { montant_a_assurer?: string; duree_pret?: string } = {}
    const montant = parseInt(formData.montant_a_assurer) || 0
    const duree = parseInt(formData.duree_pret) || 0

    if (formData.categorie === 'Personnel FINAM') {
      if (montant > 3000000) errs.montant_a_assurer = "Max 3 000 000 FCFA pour Personnel"
      if (duree > 24) errs.duree_pret = "Max 24 mois pour Personnel"
    } else if (formData.categorie === 'Retraités') {
      if (montant > 5000000) errs.montant_a_assurer = "Max 5 000 000 FCFA pour Retraités"
      if (duree > 36) errs.duree_pret = "Max 36 mois pour Retraités"
    }
    return errs
  }

  const validationErrors = getValidationErrors()


  const handlePrint = useReactToPrint({
    contentRef: printRef,
  })

  // Validation progressive des sections
  const isSection1Complete = Boolean(
    formData.montant_a_assurer &&
    formData.duree_pret &&
    formData.date_effet
  )

  const isSection2Complete = Boolean(
    formData.nom.trim() &&
    formData.prenom.trim() &&
    formData.adresse.trim() &&
    formData.ville.trim() &&
    formData.telephone.trim() &&
    formData.categorie
  )

  const isSection2Enabled = isSection1Complete
  const isSection3Enabled = isSection1Complete && isSection2Complete
  const isFormComplete = isSection1Complete && isSection2Complete && Object.keys(validationErrors).length === 0


  // Calculer la date de fin automatiquement
  useEffect(() => {
    if (formData.date_effet && formData.duree_pret) {
      const dateEffet = new Date(formData.date_effet)
      const duree = parseInt(formData.duree_pret) || 0
      dateEffet.setMonth(dateEffet.getMonth() + duree)
      setFormData(prev => ({ ...prev, date_fin_echeance: dateEffet.toISOString().split('T')[0] }))
    }
  }, [formData.date_effet, formData.duree_pret])

  // Calcul prime FINAM
  const montant = parseInt(formData.montant_a_assurer) || 0
  const categorie = formData.categorie
  const taux = categorie === 'Personnel FINAM' ? 1.00 : categorie === 'Retraités' ? 3.00 : 0
  const primeTotale = Math.round(montant * (taux / 100))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const newErrors: Record<string, string> = {}

    if (!formData.nom.trim()) newErrors.nom = 'Le nom est obligatoire'
    if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est obligatoire'
    if (!formData.adresse.trim()) newErrors.adresse = 'L\'adresse est obligatoire'
    if (!formData.ville.trim()) newErrors.ville = 'La ville est obligatoire'
    if (!formData.telephone.trim()) newErrors.telephone = 'Le téléphone est obligatoire'
    if (!formData.montant_a_assurer) newErrors.montant_a_assurer = 'Le montant à assurer est obligatoire'
    if (!formData.duree_pret) newErrors.duree_pret = 'La durée du prêt est obligatoire'
    if (!formData.date_effet) newErrors.date_effet = 'La date d\'effet est obligatoire'
    if (!formData.categorie) newErrors.categorie = 'Veuillez sélectionner une catégorie'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...validationErrors }))
      return
    }


    const payload = {
      nom: formData.nom.trim(),
      prenom: formData.prenom.trim(),
      adresse: formData.adresse.trim(),
      ville: formData.ville.trim(),
      telephone: formData.telephone.trim(),
      email: formData.email?.trim() || undefined,
      numero_police: formData.numero_police?.trim() || undefined,
      categorie: formData.categorie as 'Personnel FINAM' | 'Retraités',
      montant_a_assurer: parseInt(formData.montant_a_assurer),
      duree_pret: parseInt(formData.duree_pret),
      date_effet: formData.date_effet,
      date_fin_echeance: formData.date_fin_echeance,
      montant_mensualite: parseFloat(formData.montant_mensualite) || undefined,
      taux_pret: parseFloat(formData.taux_pret) || undefined,
      agence: formData.agence?.trim() || undefined,
      statut: 'actif',
    }

    createContract(payload as any, {
      onSuccess: (data: any) => {
        navigate(`/contrats/finam/${data.id || data.data?.id}`, {
          state: { success: 'Contrat créé avec succès !' }
        })
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-200 py-8 flex flex-col items-center font-sans overflow-x-hidden">

      {/* Toolbar */}
      <div className="max-w-[210mm] w-full mb-4 flex items-center justify-between bg-white rounded-lg shadow p-3">
        <Button variant="ghost" onClick={() => navigate('/contrats/finam')} className="hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 mr-1" />
          Retour à la liste
        </Button>
        <h1 className="text-lg font-bold text-gray-800">Nouveau Contrat FINAM</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handlePrint}
            className="border-gray-300"
          >
            <Printer className="h-4 w-4 mr-1" />
            Imprimer
          </Button>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="max-w-[210mm] w-full mb-4 bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">Progression :</span>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-2 py-1 rounded ${isSection1Complete ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {isSection1Complete ? <CheckCircle className="h-4 w-4" /> : <span className="w-4 h-4 rounded-full border-2 border-current" />}
              <span>Couverture</span>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded ${isSection2Complete ? 'bg-green-100 text-green-700' : isSection2Enabled ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-400'}`}>
              {isSection2Complete ? <CheckCircle className="h-4 w-4" /> : <span className="w-4 h-4 rounded-full border-2 border-current" />}
              <span>Souscripteur</span>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded ${isFormComplete ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
              {isFormComplete ? <CheckCircle className="h-4 w-4" /> : <span className="w-4 h-4 rounded-full border-2 border-current" />}
              <span>Prêt à créer</span>
            </div>
          </div>
        </div>
      </div>

      {/* A4 Document Container */}
      <div ref={printRef} className="bg-white w-[210mm] min-h-[297mm] p-[10mm] shadow-2xl relative flex flex-col border border-gray-300">

        {/* Header Section */}
        <div className="flex justify-between items-start mb-2">
          <div className="w-28">
            <img src={logoSamba} alt="SAMB'A Assurances" className="h-20 w-auto" />
          </div>
          <div className="flex flex-col items-center flex-grow pt-4">
            <h1 className="text-[#F48232] text-xl font-bold uppercase text-center tracking-tight leading-none">
              CONTRAT DECES GROUPE EMPRUNTEUR : FINAM
            </h1>
            <p className="text-[10px] text-gray-500 italic mt-1 text-center">
              Contrat régi par les dispositions du Code des assurances CIMA<br />
              Convention N° : 508.111/0824
            </p>
            <h2 className="text-black text-[14px] font-bold uppercase mt-3 tracking-widest border-b-2 border-black px-4">
              CONDITIONS PARTICULIERES
            </h2>
          </div>
          <div className="w-24"></div>
        </div>

        {/* Main Form Table */}
        <div className="border border-gray-400 w-full flex flex-col mt-4">

          {/* Section: Couverture */}
          <div className="flex border-b border-gray-300">
            <SectionLabel>Couverture</SectionLabel>
            <div className="flex-grow p-2 grid grid-cols-2 gap-x-4 gap-y-1">
              <FormInput
                label="Numéro de police :"
                value={formData.numero_police}
                onChange={(e) => setFormData({ ...formData, numero_police: e.target.value })}
              />
              <FormInput
                label="Durée du prêt :"
                value={formData.duree_pret}
                onChange={(e) => setFormData({ ...formData, duree_pret: e.target.value })}
                type="number"
                error={errors.duree_pret || validationErrors.duree_pret}
              />
              <FormInput
                label="Montant à assurer :"
                value={formData.montant_a_assurer}
                onChange={(e) => setFormData({ ...formData, montant_a_assurer: e.target.value })}
                type="number"
                error={errors.montant_a_assurer || validationErrors.montant_a_assurer}
              />
              <FormInput
                label="Montant de la mensualité :"
                value={formData.montant_mensualite}
                onChange={(e) => setFormData({ ...formData, montant_mensualite: e.target.value })}
                type="number"
              />
              <FormInput
                label="Date d'effet :"
                value={formData.date_effet}
                onChange={(e) => setFormData({ ...formData, date_effet: e.target.value })}
                type="date"
                error={errors.date_effet}
              />
              <FormInput
                label="Taux du prêt (%) :"
                value={formData.taux_pret}
                onChange={(e) => {
                  // Accepter uniquement les chiffres et le point décimal
                  const value = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.')
                  setFormData({ ...formData, taux_pret: value })
                }}
                type="text"
                inputMode="decimal"
                placeholder="Ex: 12.5"
              />
              <FormInput
                label="Date de fin d'échéance :"
                value={formData.date_fin_echeance}
                disabled
              />

            </div>
          </div>

          {/* Section: Souscripteur / Personne assurée */}
          <div className={`flex border-b border-gray-300 ${!isSection2Enabled ? 'opacity-50' : ''}`}>
            <SectionLabel locked={!isSection2Enabled}>Souscripteur /<br />Personne assurée</SectionLabel>
            <div className="flex-grow p-2 space-y-1">
              <FormInput
                label="Nom :"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                error={errors.nom}
                disabled={!isSection2Enabled}
              />
              <FormInput
                label="Prénom :"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                error={errors.prenom}
                disabled={!isSection2Enabled}
              />
              <FormInput
                label="Adresse :"
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                error={errors.adresse}
                disabled={!isSection2Enabled}
              />
              <FormInput
                label="Ville :"
                value={formData.ville}
                onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                error={errors.ville}
                disabled={!isSection2Enabled}
              />
              <FormInput
                label="Téléphone :"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                error={errors.telephone}
                disabled={!isSection2Enabled}
              />
              <FormInput
                label="Email :"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                type="email"
                disabled={!isSection2Enabled}
              />
              <div className="flex items-center flex-wrap gap-y-1 pt-2">
                <span className="mr-4 text-[11px] font-medium">Catégorie :</span>
                <Checkbox
                  label="Personnel FINAM"
                  checked={formData.categorie === 'Personnel FINAM'}
                  onChange={() => setFormData({ ...formData, categorie: 'Personnel FINAM' })}
                  disabled={!isSection2Enabled}
                />
                <Checkbox
                  label="Retraités"
                  checked={formData.categorie === 'Retraités'}
                  onChange={() => setFormData({ ...formData, categorie: 'Retraités' })}
                  disabled={!isSection2Enabled}
                />
              </div>
            </div>
          </div>

          {/* Section: Bénéficiaire */}
          <div className={`flex border-b border-gray-300 ${!isSection3Enabled ? 'opacity-50' : ''}`}>
            <SectionLabel locked={!isSection3Enabled}>Bénéficiaire</SectionLabel>
            <div className="flex-grow p-2 space-y-1 text-[9px]">
              <div className="flex mb-1"><span className="w-24 text-gray-600">Raison sociale :</span> <span className="font-bold">La Financière Africaine de Microprojets (EMF – FINAM)</span></div>
              <div className="flex mb-1"><span className="w-24 text-gray-600">RCCM :</span> <span className="font-bold">2004B03852 / NIF : 783780 H / Agrément COBAC N° 76/CI/05/CNC</span></div>
              <div className="flex mb-1"><span className="w-24 text-gray-600">Adresse :</span> <span className="font-bold">Ancienne Sobraga, Avenue Lubin Martial NTOUTOUME OBAME / B.P. 22.408</span></div>
              <div className="flex mb-1"><span className="w-24 text-gray-600">Ville :</span> <span className="font-bold">Libreville - Gabon</span></div>
              <FormInput
                label="Agence :"
                className="font-bold"
                value={formData.agence}
                onChange={(e) => setFormData({ ...formData, agence: e.target.value })}
                disabled={!isSection3Enabled}
              />
            </div>
          </div>

          {/* Section: Garanties */}
          <div className={`flex border-b border-gray-300 ${!isSection3Enabled ? 'opacity-50' : ''}`}>
            <SectionLabel locked={!isSection3Enabled}>Garanties</SectionLabel>
            <div className="flex-grow">
              <table className="w-full text-[9px] border-collapse">
                <thead className="bg-gray-50 border-b border-gray-300">
                  <tr className="font-bold text-gray-700">
                    <th className="p-1 border-r border-gray-300 text-left w-1/2 font-normal italic"></th>
                    <th className="p-1 border-r border-gray-300 text-center w-1/4">Type de cible</th>
                    <th className="p-1 border-r border-gray-300 text-center w-16">Option</th>
                    <th className="p-1 text-center w-24">Taux</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-300">
                    <td className="p-2 border-r border-gray-300">Décès – Invalidité Absolue et Définitive (IAD)¹</td>
                    <td className="p-2 border-r border-gray-300 text-center">Personnel FINAM</td>
                    <td className="p-2 border-r border-gray-300 text-center">
                      <div className={`w-6 h-4 border border-black rounded-sm mx-auto ${formData.categorie === 'Personnel FINAM' ? 'bg-gray-600' : 'bg-white'}`}></div>
                    </td>
                    <td className="p-2 text-center font-bold">1,00%</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-gray-300">Décès – Invalidité Absolue et Définitive (IAD)</td>
                    <td className="p-2 border-r border-gray-300 text-center">Retraités</td>
                    <td className="p-2 border-r border-gray-300 text-center">
                      <div className={`w-6 h-4 border border-black rounded-sm mx-auto ${formData.categorie === 'Retraités' ? 'bg-gray-600' : 'bg-white'}`}></div>
                    </td>
                    <td className="p-2 text-center font-bold">3,00%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section: Cotisations */}
          <div className={`flex bg-gray-50/50 ${!isSection3Enabled ? 'opacity-50' : ''}`}>
            <SectionLabel locked={!isSection3Enabled}>Cotisations</SectionLabel>
            <div className="flex-grow p-3">
              <div className="flex items-center font-bold text-[12px]">
                <span className="whitespace-nowrap">Prime totale :</span>
                <div className="flex-grow border-b border-black mx-2 h-5 flex items-center justify-center font-bold">
                  {primeTotale > 0 ? primeTotale.toLocaleString() : ''}
                </div>
                <span className="whitespace-nowrap">FCFA TTC</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Notes */}
        <div className="mt-4 space-y-1 text-[10px] font-bold text-black px-1 leading-tight">
          <div className="flex items-start"><span className="w-6 flex-shrink-0">(1)</span> <p>Le montant maximal de couverture est de 3 000 000 FCFA pour le Personnel et de 5 000 000 FCFA pour les Retraités.</p></div>
          <div className="flex items-start"><span className="w-6 flex-shrink-0">(2)</span> <p>La durée maximale de couverture est de 24 mois pour le Personnel et de 36 mois pour les Retraités.</p></div>
        </div>

        {/* Signatures and Date */}
        <div className="mt-12 mb-4">
          <div className="text-right text-[11px] mb-8 pr-12 font-medium italic">
            Fait à <input
              className="border-b border-black w-48 text-center outline-none"
              value={formData.lieu_signature}
              onChange={(e) => setFormData({ ...formData, lieu_signature: e.target.value })}
              disabled={!isFormComplete}
            />, le <input
              className="border-b border-black w-10 text-center outline-none"
              value={formData.date_signature_jour}
              onChange={(e) => setFormData({ ...formData, date_signature_jour: e.target.value })}
              maxLength={2}
              disabled={!isFormComplete}
            /> / <input
              className="border-b border-black w-10 text-center outline-none"
              value={formData.date_signature_mois}
              onChange={(e) => setFormData({ ...formData, date_signature_mois: e.target.value })}
              maxLength={2}
              disabled={!isFormComplete}
            /> / <input
              className="border-b border-black w-16 text-center outline-none"
              value={formData.date_signature_annee}
              onChange={(e) => setFormData({ ...formData, date_signature_annee: e.target.value })}
              maxLength={4}
              disabled={!isFormComplete}
            />
          </div>

          <div className="flex justify-between items-start px-4">
            <div className="w-2/5 flex flex-col items-center">
              <div className="font-bold text-[12px] mb-2 uppercase">Le Souscripteur</div>
              <div className="w-full h-24 border border-gray-400 border-dashed rounded flex items-center justify-center">
              </div>
            </div>



            <div className="w-2/5 flex flex-col items-center">
              <div className="font-bold text-[12px] mb-2 uppercase">L'Assureur par délégation</div>
              <div className="w-full h-24 border border-gray-400 border-dashed rounded flex items-center justify-center">
              </div>
            </div>
          </div>
        </div>

        {/* Footnote */}
        <div className="mt-auto mb-4 text-[9px] text-gray-500 italic px-2 leading-tight">
          ¹Au titre du présent contrat, l'Assuré est considéré comme atteint d'Invalidité Totale et Définitive si avant l'âge limite prévu aux conditions générales, à la suite de maladie ou d'accident, il est reconnu définitivement incapable de se livrer à la moindre occupation, ni au moindre travail lui procurant gain ou profit, et est en outre dans l'obligation d'avoir recours définitivement pour les actes ordinaires de la vie à l'assistance d'une tierce personne.
        </div>

        <Footer />
        <div className="absolute bottom-4 right-8 text-[12px] font-bold">1</div>
      </div>

      {/* Submit Button */}
      <div className="max-w-[210mm] w-full mt-4 flex justify-center">
        <Button
          onClick={handleSubmit}
          disabled={isPending || !isFormComplete}
          className={`${isFormComplete ? 'bg-[#F48232] hover:bg-[#E07020]' : 'bg-gray-400 cursor-not-allowed'} text-white`}
        >
          {isPending ? 'Création en cours...' : !isFormComplete ? 'Remplir les champs obligatoires' : 'Créer le contrat'}
        </Button>
      </div>
    </div>
  )
}

export { FinamContractCreateOfficial }
export default FinamContractCreateOfficial
