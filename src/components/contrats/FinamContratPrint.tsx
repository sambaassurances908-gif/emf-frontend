// src/components/contrats/FinamContratPrint.tsx
import React from 'react'
import { Mail, Phone, MapPin } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { FINAM_CONSTANTS, FinamContrat } from '@/types/finam'
import logoSamba from '@/assets/logo-samba.png'

// --- Form Input Component (Display only) ---
interface FormInputProps {
  label?: string
  value?: string | number | null
  className?: string
}

const FormInput: React.FC<FormInputProps> = ({ label, value, className = "" }) => (
  <div className="flex items-end w-full">
    {label && <span className="mr-2 whitespace-nowrap text-sm text-gray-800">{label}</span>}
    <div className={`flex-grow border-b border-gray-800 bg-transparent text-sm px-1 py-0.5 font-semibold ${className}`}>
      {value || ''}
    </div>
  </div>
)

// --- Checkbox Component (Display only) ---
const Checkbox: React.FC<{ label: string; checked?: boolean }> = ({ label, checked }) => (
  <div className="flex items-center mr-4">
    <div className={`w-5 h-5 border-2 border-black mr-2 flex items-center justify-center ${checked ? 'bg-black' : 'bg-white'}`}>
      {checked && <div className="w-3 h-3 bg-white" />}
    </div>
    <span className="text-sm text-gray-800">{label}</span>
  </div>
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

// --- Main Print Component ---
interface FinamContratPrintProps {
  contrat: FinamContrat
}

export const FinamContratPrint: React.FC<FinamContratPrintProps> = ({ contrat }) => {
  // Déterminer la catégorie
  const isPersonnel = contrat.categorie === 'Personnel FINAM'
  
  // Format date for signature display
  const signatureDate = contrat.date_signature || contrat.created_at || new Date().toISOString()
  const dateObj = new Date(signatureDate)

  return (
    <div className="page bg-white w-[210mm] min-h-[297mm] p-[10mm] shadow-xl relative flex flex-col mx-auto print:shadow-none">
      
      {/* Header */}
      <div className="flex flex-col items-center mb-6">
        <Logo />
        <h1 className="text-xl font-extrabold uppercase mt-4 text-center leading-tight tracking-wide text-[#F48232]">
          CONTRAT DECES GROUPE EMPRUNTEUR : FINAM
        </h1>
        <p className="text-xs text-black font-semibold mt-1">Contrat régi par les dispositions du Code des assurances CIMA</p>
        <div className="text-sm font-bold text-black mt-1">
          Convention N° : 508.111/0824
        </div>
        <div className="w-full flex flex-col items-center mt-4 mb-2">
          <h3 className="text-black text-xl font-bold uppercase text-[#F48232]/80">
            CONDITIONS PARTICULIERES
          </h3>
        </div>
        {/* Numéro de police en haut à droite */}
        <div className="absolute top-[10mm] right-[15mm]">
          <span className="text-red-500 font-mono text-xl font-bold">
            {contrat.numero_police || String(contrat.id).padStart(7, '0')}
          </span>
        </div>
      </div>

      {/* Form Body - Table Structure */}
      <div className="border-2 border-[#F48232] w-full flex flex-col text-sm">
        
        {/* Section: Couverture */}
        <div className="flex border-b border-[#F48232]">
          <div className="w-32 flex-shrink-0 p-3 bg-orange-50 italic border-r border-[#F48232] flex items-center text-gray-900 font-serif text-xs">Couverture</div>
          <div className="flex-grow p-2 space-y-3 overflow-hidden">
            <div className="grid grid-cols-2 gap-3">
              <FormInput label="Numéro de police :" value={contrat.numero_police || 'En attente'} />
              <FormInput label="Durée du prêt :" value={`${contrat.duree_pret} mois`} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormInput label="Montant à assurer :" value={formatCurrency(contrat.montant_a_assurer)} />
              <FormInput label="Montant mensualité :" value={formatCurrency(contrat.montant_mensualite || 0)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormInput label="Date d'effet :" value={formatDate(contrat.date_effet)} />
              <FormInput label="Taux du prêt :" value={`${contrat.taux_pret || 0}%`} />
            </div>
            <FormInput label="Date de fin d'échéance :" value={formatDate(contrat.date_fin_echeance)} />
          </div>
        </div>

        {/* Section: Souscripteur / Personne assurée */}
        <div className="flex border-b border-[#F48232]">
          <div className="w-32 flex-shrink-0 p-3 bg-orange-50 italic border-r border-[#F48232] flex flex-col justify-center text-gray-900 font-serif text-xs">
            <span>Souscripteur /</span>
            <span>Personne assurée</span>
          </div>
          <div className="flex-grow p-2 space-y-2 overflow-hidden">
            <div className="grid grid-cols-2 gap-3">
              <FormInput label="Nom :" value={contrat.nom} />
              <FormInput label="Prénom :" value={contrat.prenom} />
            </div>
            <FormInput label="Adresse :" value={contrat.adresse || '-'} />
            <div className="grid grid-cols-2 gap-3">
              <FormInput label="Ville :" value={contrat.ville || '-'} />
              <FormInput label="Téléphone :" value={contrat.telephone || '-'} />
            </div>
            <FormInput label="Email :" value={contrat.email || '-'} />
            <div className="mt-2 flex items-center gap-4">
              <span className="text-sm text-gray-800 whitespace-nowrap">Catégorie :</span>
              <Checkbox label="Personnel FINAM" checked={isPersonnel} />
              <Checkbox label="Retraités" checked={!isPersonnel} />
            </div>
          </div>
        </div>

        {/* Section: Bénéficiaire */}
        <div className="flex border-b border-[#F48232]">
          <div className="w-32 flex-shrink-0 p-3 bg-orange-50 italic border-r border-[#F48232] flex items-center text-gray-900 font-serif text-xs">Bénéficiaire</div>
          <div className="flex-grow p-2 space-y-2 text-xs overflow-hidden">
            <div className="flex items-end">
              <span className="mr-2 whitespace-nowrap text-gray-800 text-sm">Raison sociale :</span>
              <span className="font-bold text-sm truncate">La Financière Africaine de Microprojets (EMF – FINAM)</span>
            </div>
            <div className="flex items-end text-sm">
              <span className="mr-2 text-gray-800">RCCM :</span>
              <span className="font-medium">2004B03852 / NIF : 783780 H / Agrément COBAC N° 76/CI/05/CNC</span>
            </div>
            <div className="flex items-end text-sm">
              <span className="mr-2 text-gray-800">Adresse :</span>
              <span className="font-medium">Ancienne Sobraga, Avenue Lubin Martial NTOUTOUME OBAME / B.P. 22.408</span>
            </div>
            <div className="flex items-end text-sm">
              <span className="mr-2 text-gray-800">Ville :</span>
              <span className="font-medium">Libreville - Gabon</span>
            </div>
            <FormInput label="Agence :" value={contrat.agence || '-'} />
          </div>
        </div>

        {/* Section: Garanties */}
        <div className="flex border-b border-[#F48232]">
          <div className="w-32 flex-shrink-0 p-3 bg-orange-50 italic border-r border-[#F48232] flex items-center text-gray-900 font-serif text-xs">Garanties</div>
          <div className="flex-grow">
            <table className="w-full text-center text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#F48232] font-bold bg-orange-100">
                  <th className="p-1 border-r border-[#F48232] w-[45%]">Garanties</th>
                  <th className="p-1 border-r border-[#F48232] w-[25%]">Type de cible</th>
                  <th className="p-1 border-r border-[#F48232] w-[15%]">Option</th>
                  <th className="p-1 w-[15%]">Taux</th>
                </tr>
              </thead>
              <tbody>
                {/* Row 1: Personnel FINAM */}
                <tr className={`border-b border-[#F48232] bg-white hover:bg-orange-50/50 ${isPersonnel ? 'bg-orange-50' : ''}`}>
                  <td className="p-2 border-r border-[#F48232] text-left pl-2 font-medium bg-gray-100">Décès – Invalidité Absolue et Définitive (IAD)¹</td>
                  <td className="p-2 border-r border-[#F48232] text-[#F48232] font-semibold">Personnel FINAM</td>
                  <td className="p-2 border-r border-[#F48232]">
                    <div className={`w-8 h-5 border-2 border-black ${isPersonnel ? 'bg-black' : 'bg-white'} mx-auto rounded-sm`}></div>
                  </td>
                  <td className="p-2 text-[#F48232] font-bold">{FINAM_CONSTANTS.PERSONNEL_TAUX.toFixed(2)}%</td>
                </tr>
                {/* Row 2: Retraités */}
                <tr className={`bg-white hover:bg-orange-50/50 ${!isPersonnel ? 'bg-orange-50' : ''}`}>
                  <td className="p-2 border-r border-[#F48232] text-left pl-2 font-medium bg-gray-100">Décès – Invalidité Absolue et Définitive (IAD)</td>
                  <td className="p-2 border-r border-[#F48232] text-[#F48232] font-semibold">Retraités</td>
                  <td className="p-2 border-r border-[#F48232]">
                    <div className={`w-8 h-5 border-2 border-black ${!isPersonnel ? 'bg-black' : 'bg-white'} mx-auto rounded-sm`}></div>
                  </td>
                  <td className="p-2 text-[#F48232] font-bold">{FINAM_CONSTANTS.RETRAITES_TAUX.toFixed(2)}%</td>
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
              <span className="whitespace-nowrap">Prime totale :</span>
              <span className="flex-grow mx-2 border-b-2 border-black text-center font-mono text-lg text-[#F48232]">
                {contrat.prime_totale ? formatCurrency(contrat.prime_totale) : '___________'}
              </span>
              <span className="whitespace-nowrap">FCFA TTC</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footnotes */}
      <div className="mt-4 text-[10px] font-bold space-y-1 text-black">
        <p>
          (1) Le montant maximal de couverture est de {formatCurrency(FINAM_CONSTANTS.PERSONNEL_MONTANT_MAX)} pour le Personnel et de {formatCurrency(FINAM_CONSTANTS.RETRAITES_MONTANT_MAX)} pour les Retraités.
        </p>
        <p>
          (2) La durée maximale de couverture est de {FINAM_CONSTANTS.PERSONNEL_DUREE_MAX} mois pour le Personnel et de {FINAM_CONSTANTS.RETRAITES_DUREE_MAX} mois pour les Retraités.
        </p>
      </div>

      {/* IAD Definition */}
      <div className="mt-4 text-[9px] text-gray-500 italic px-2 leading-tight">
        ¹Au titre du présent contrat, l'Assuré est considéré comme atteint d'Invalidité Totale et Définitive si avant l'âge limite prévu aux conditions générales, à la suite de maladie ou d'accident, il est reconnu définitivement incapable de se livrer à la moindre occupation, ni au moindre travail lui procurant gain ou profit, et est en outre dans l'obligation d'avoir recours définitivement pour les actes ordinaires de la vie à l'assistance d'une tierce personne.
      </div>

      {/* Signatures */}
      <div className="mt-auto mb-4">
        <div className="text-right mb-6 pr-4 font-medium">
          Fait à <span className="border-b border-black w-32 inline-block mx-1 text-center font-handwriting">
            {contrat.lieu_signature || 'Libreville'}
          </span>, le <span className="border-b border-black w-8 text-center inline-block">
            {dateObj.toLocaleDateString('fr-FR', { day: '2-digit' })}
          </span> / <span className="border-b border-black w-8 text-center inline-block">
            {dateObj.toLocaleDateString('fr-FR', { month: '2-digit' })}
          </span> / <span className="border-b border-black w-12 text-center inline-block">
            {dateObj.toLocaleDateString('fr-FR', { year: 'numeric' })}
          </span>
        </div>

        <div className="flex justify-between items-start pt-2">
          <div className="w-[40%] flex flex-col">
            <span className="font-bold mb-2 ml-4">Le Souscripteur</span>
            <div className="border border-black h-24 w-full flex items-center justify-center text-gray-300 text-sm bg-white shadow-sm">
              Signature
            </div>
          </div>

          <div className="w-[15%] flex flex-col items-center justify-center space-y-1 text-[9px] pt-6 font-semibold text-gray-700">
            <div>Feuillet 1 : SAMB'A ASSURANCES</div>
            <div>Feuillet 2 : FINAM</div>
            <div>Feuillet 3 : ASSURÉ</div>
            <div>Feuillet 4 : SOUCHE</div>
          </div>

          <div className="w-[40%] flex flex-col">
            <span className="font-bold mb-2 text-right mr-4">L'Assureur par délégation</span>
            <div className="border border-black h-24 w-full flex items-center justify-center text-gray-300 text-sm bg-white shadow-sm">
              Signature et cachet
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default FinamContratPrint
