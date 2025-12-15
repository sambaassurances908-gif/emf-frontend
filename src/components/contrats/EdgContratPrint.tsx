// src/components/contrats/EdgContratPrint.tsx
import React from 'react'
import { Mail, Phone, MapPin } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import logoSamba from '@/assets/logo-samba.png'

// Types
interface EdgContratData {
  id: number
  numero_police?: string
  nom_prenom?: string
  date_naissance?: string
  lieu_naissance?: string
  profession?: string
  adresse?: string
  adresse_assure?: string
  ville_assure?: string
  telephone?: string
  telephone_assure?: string
  email?: string
  email_assure?: string
  date_effet?: string
  date_echeance?: string
  date_fin_echeance?: string
  duree_mois?: number
  duree_pret_mois?: number
  montant_pret_assure?: number
  montant_pret?: number
  taux_assurance?: number
  prime_mensuelle?: number
  prime_totale?: number
  cotisation_totale?: number
  cotisation_totale_ttc?: number
  garantie_deces?: boolean
  garantie_deces_iad?: boolean
  garantie_prevoyance?: boolean
  garantie_compte_protege?: boolean
  garantie_ipt?: boolean
  garantie_itt?: boolean
  garantie_perte_emploi?: boolean
  garantie_vip?: boolean
  statut?: string
  observations?: string
  is_vip?: boolean
  categorie?: string
  autre_categorie_precision?: string
  agence?: string
  beneficiaire_deces?: string
  beneficiaire_telephone?: string
  numero_compte_protege?: string
  assures_associes?: AssureAssocie[]
  lieu_signature?: string
  date_signature?: string
  created_at?: string
  [key: string]: any
}

interface AssureAssocie {
  id?: number
  numero_ordre?: number
  type_assure?: string
  nom?: string
  prenom?: string
  date_naissance?: string
  lieu_naissance?: string
  contact?: string
  adresse?: string
}

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
interface EdgContratPrintProps {
  contrat: EdgContratData
}

export const EdgContratPrint: React.FC<EdgContratPrintProps> = ({ contrat }) => {
  // Déterminer si VIP
  const isVip = contrat.garantie_vip || contrat.is_vip || contrat.categorie === 'vip' || 
    (contrat.montant_pret_assure && contrat.montant_pret_assure > 25000000)
  
  // Récupérer les valeurs avec fallbacks
  const montant = contrat.montant_pret_assure || contrat.montant_pret || 0
  const duree = contrat.duree_mois || contrat.duree_pret_mois || 0
  const dateEcheance = contrat.date_echeance || contrat.date_fin_echeance
  const adresse = contrat.adresse_assure || contrat.adresse
  const ville = contrat.ville_assure || ''
  const telephone = contrat.telephone_assure || contrat.telephone
  const email = contrat.email_assure || contrat.email
  
  // Compte protégé+ (utilise garantie_prevoyance comme fallback)
  const hasCompteProtege = contrat.garantie_compte_protege !== false && contrat.garantie_prevoyance !== false
  
  // Calcul cotisation
  const cotisationCompteProtege = hasCompteProtege ? 15000 : 0
  const tauxDeces = isVip ? 0.035 : 0.025
  const cotisationDeces = (contrat.garantie_deces_iad !== false || contrat.garantie_deces) ? montant * tauxDeces : 0
  const cotisationTotale = contrat.cotisation_totale_ttc || contrat.cotisation_totale || contrat.prime_totale || (cotisationCompteProtege + cotisationDeces)
  
  const selectedCategorie = contrat.categorie?.toLowerCase() || ''

  // Format date for signature display
  const signatureDate = contrat.date_signature || contrat.created_at || new Date().toISOString()
  const dateObj = new Date(signatureDate)

  return (
    <div className="page bg-white w-[210mm] min-h-[297mm] p-[10mm] shadow-xl relative flex flex-col mx-auto print:shadow-none">
      
      {/* Header */}
      <div className="flex flex-col items-center mb-6">
        {/* Header */}
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
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col">
                <span className="text-xs text-gray-600 mb-1">N° Police</span>
                <div className="border-b border-gray-800 text-sm px-1 py-0.5 font-semibold min-h-[24px]">
                  {contrat.numero_police || ''}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-600 mb-1">Montant</span>
                <div className="border-b border-gray-800 text-sm px-1 py-0.5 font-semibold min-h-[24px]">
                  {montant ? formatCurrency(montant) : ''}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-600 mb-1">Durée (mois)</span>
                <div className="border-b border-gray-800 text-sm px-1 py-0.5 font-semibold min-h-[24px]">
                  {duree ? `${duree} mois` : ''}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormInput 
                label="Date d'effet :" 
                value={formatDate(contrat.date_effet)}
              />
              <FormInput 
                label="Fin d'échéance :" 
                value={formatDate(dateEcheance)}
              />
            </div>
          </div>
        </div>

        {/* Section: Assuré */}
        <div className="flex border-b border-[#F48232]">
          <div className="w-32 flex-shrink-0 p-3 bg-orange-50 italic border-r border-[#F48232] flex flex-col justify-center text-gray-900 font-serif text-xs">
            <span>Assuré</span>
          </div>
          <div className="flex-grow p-2 space-y-2 overflow-hidden">
            <div className="grid grid-cols-2 gap-3">
              <FormInput label="Nom & Prénom :" value={contrat.nom_prenom} />
              <FormInput label="Date de naissance :" value={formatDate(contrat.date_naissance)} />
            </div>
            <FormInput label="Adresse :" value={adresse} />
            <div className="grid grid-cols-3 gap-2 overflow-hidden">
              <div className="overflow-hidden">
                <FormInput label="Tél :" value={telephone} />
              </div>
              <div className="overflow-hidden">
                <FormInput label="Ville :" value={ville} />
              </div>
              <div className="overflow-hidden">
                <FormInput label="Email:" value={email} />
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-start gap-x-4">
                <span className="text-sm text-gray-800 whitespace-nowrap pt-0.5">Catégorie :</span>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                  <Checkbox 
                    label="Commerçants" 
                    checked={selectedCategorie === 'commercants'}
                  />
                  <Checkbox 
                    label="Salariés du public" 
                    checked={selectedCategorie === 'salaries_public'}
                  />
                  <Checkbox 
                    label="Salariés du privé" 
                    checked={selectedCategorie === 'salaries_prive'}
                  />
                  <Checkbox 
                    label="Retraités" 
                    checked={selectedCategorie === 'retraites'}
                  />
                  <div className="flex items-center col-span-2">
                    <Checkbox 
                      label="Autre :" 
                      checked={selectedCategorie === 'autre'}
                    />
                    <div className="border-b border-gray-400 flex-grow font-semibold min-h-[20px] text-sm ml-1">
                      {selectedCategorie === 'autre' ? (contrat.autre_categorie_precision || '') : ''}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Souscripteur / EMF */}
        <div className="flex border-b border-[#F48232]">
          <div className="w-32 flex-shrink-0 p-3 bg-orange-50 italic border-r border-[#F48232] flex items-center text-gray-900 font-serif text-xs">Souscripteur / EMF</div>
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
                value={contrat.agence || ''}
              />
            </div>
            <div className="flex items-end text-sm">
              <span className="text-gray-800">Tél : 065 08 05 69 | Email : service.clientele@edgmfgabon.com</span>
            </div>
          </div>
        </div>

        {/* Section: Compte Protégé+ */}
        <div className="flex border-b border-[#F48232]">
          <div className="w-32 flex-shrink-0 p-3 bg-orange-50 italic border-r border-[#F48232] flex items-center text-gray-900 font-serif text-xs">Compte Protégé+</div>
          <div className="flex-grow p-2 space-y-2 overflow-hidden">
            <FormInput 
              label="N° du Compte protégé :" 
              value={contrat.numero_compte_protege || ''}
            />
            <div className="grid grid-cols-[1fr,100px] gap-2">
              <div className="overflow-hidden">
                <FormInput 
                  label="Bénéficiaire :" 
                  value={contrat.beneficiaire_deces || ''}
                />
              </div>
              <div className="overflow-hidden">
                <FormInput 
                  label="Tél:" 
                  value={contrat.beneficiaire_telephone || ''}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section: Garanties */}
        <div className="flex border-b border-[#F48232]">
          <div className="w-32 flex-shrink-0 p-3 bg-orange-50 italic border-r border-[#F48232] flex items-center text-gray-900 font-serif text-xs">Garanties</div>
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
                <tr className={`border-b border-[#F48232] bg-white hover:bg-orange-50/50 ${hasCompteProtege ? 'bg-orange-50' : ''}`}>
                  <td className="p-1 border-r border-[#F48232] text-left pl-2 font-medium bg-gray-100">Compte Protégé+</td>
                  <td className="p-1 border-r border-[#F48232] text-[#F48232]">Toute catégorie</td>
                  <td className="p-1 border-r border-[#F48232]">
                    <div className={`w-8 h-4 border border-black ${hasCompteProtege ? 'bg-black' : 'bg-white'} mx-auto rounded-sm`}></div>
                  </td>
                  <td className="p-1 border-r border-[#F48232] text-[#F48232]">N/A</td>
                  <td className="p-1 text-[#F48232] font-bold">15.000</td>
                </tr>
                {/* Row 2: Assurance Crédits Décès/IAD */}
                <tr className={`border-b border-[#F48232] bg-white hover:bg-orange-50/50 ${!isVip && (contrat.garantie_deces_iad || contrat.garantie_deces) ? 'bg-orange-50' : ''}`}>
                  <td className="p-1 border-r border-[#F48232] text-left pl-2 font-medium bg-gray-100">Assurance Crédits Décès/IAD</td>
                  <td className="p-1 border-r border-[#F48232] text-[#F48232]">Toute catégorie</td>
                  <td className="p-1 border-r border-[#F48232]">
                    <div className={`w-8 h-4 border border-black ${!isVip && (contrat.garantie_deces_iad || contrat.garantie_deces) ? 'bg-black' : 'bg-white'} mx-auto rounded-sm`}></div>
                  </td>
                  <td className="p-1 border-r border-[#F48232] text-[#F48232] font-bold">2,50%</td>
                  <td className="p-1 text-[#F48232]">N/A</td>
                </tr>
                {/* Row 3: Assurance Crédits Décès/IAD - VIP */}
                <tr className={`bg-white hover:bg-orange-50/50 ${isVip ? 'bg-orange-50' : ''}`}>
                  <td className="p-1 border-r border-[#F48232] text-left pl-2 font-medium bg-gray-100">Assurance Crédits Décès/IAD - VIP</td>
                  <td className="p-1 border-r border-[#F48232] text-[#F48232] font-bold">VIP</td>
                  <td className="p-1 border-r border-[#F48232]">
                    <div className={`w-8 h-4 border border-black ${isVip ? 'bg-black' : 'bg-white'} mx-auto rounded-sm`}></div>
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
  )
}

export default EdgContratPrint
