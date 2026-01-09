// src/features/contrats/arianefinance/ArianeFinanceContratPrint.tsx
import { ArianeFinanceContrat } from '@/types/arianeFinance'
import { formatCurrency } from '@/lib/utils'
import { Mail, Phone, MapPin } from 'lucide-react'
import logoSamba from '@/assets/logo-samba.png'

interface ArianeFinanceContratPrintProps {
  contrat: ArianeFinanceContrat
}

// --- Constantes ARIANE FINANCE ---
const TAUX_DECES_IAD = 1.05 // 1.05%
const MONTANT_MAX_PRET = 4000000 // 4 000 000 FCFA
const PROTECTION_FORFAITAIRE = 250000 // 250 000 FCFA
const PRIME_PROTECTION = 5000 // 5 000 FCFA

// --- Catégories disponibles ---
const categories = [
  { key: 'commercants', label: 'Commerçants' },
  { key: 'salaries_public', label: 'Salariés du public' },
  { key: 'salaries_prive', label: 'Salariés du privé' },
  { key: 'retraites', label: 'Retraités' },
  { key: 'autre', label: 'Autre' },
]

// --- Display Value Component ---
interface DisplayValueProps {
  label?: string
  value?: string | number | null
  className?: string
}

const DisplayValue: React.FC<DisplayValueProps> = ({ label, value = '', className = "" }) => (
  <div className="flex items-end w-full">
    {label && (
      <span className="mr-1 whitespace-nowrap text-[11px] text-gray-800">
        {label}
      </span>
    )}
    <span className={`flex-grow border-b-2 border-gray-400 text-[11px] px-1 py-0.5 min-h-[22px] font-semibold ${className}`}>
      {value || ''}
    </span>
  </div>
)

// --- Checkbox Display Component ---
interface CheckboxDisplayProps {
  label: string
  checked?: boolean
}

const CheckboxDisplay: React.FC<CheckboxDisplayProps> = ({ label, checked = false }) => (
  <div className="flex items-center mr-3">
    <div className={`w-4 h-4 border-2 border-black mr-1 flex items-center justify-center ${checked ? 'bg-white' : 'bg-white'}`}>
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

export const ArianeFinanceContratPrint = ({ contrat }: ArianeFinanceContratPrintProps) => {
  // Formatage date
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    return date.toISOString().split('T')[0]
  }

  // Calculs financiers
  const montant = contrat.montant_pret_assure || 0
  const primeDecesIAD = contrat.prime_totale || Math.round(montant * (TAUX_DECES_IAD / 100))
  const primeTotale = PRIME_PROTECTION + primeDecesIAD

  // Date de signature formatée
  const signatureDate = formatDate(contrat.created_at)

  // Catégorie label
  const getCategorieLabel = () => {
    const cat = categories.find(c => c.key === contrat.categorie)
    return cat?.label || ''
  }

  return (
    <div className="bg-white w-[210mm] min-h-[297mm] p-[6mm] shadow-xl relative flex flex-col mx-auto print:shadow-none print:border-none">

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
            {/* Numéro de police */}
            <div className="col-span-2 flex items-end">
              <span className="mr-1 whitespace-nowrap text-[11px] text-gray-800">N° Police :</span>
              <span className="flex-grow border-b-2 border-gray-400 text-[11px] px-1 py-0.5 font-semibold text-[#F48232]">
                {contrat.numero_police || ''}
              </span>
            </div>
            <DisplayValue
              label="Montant du prêt assuré :"
              value={montant ? `${formatCurrency(montant).replace(' FCFA', '')} FCFA` : ''}
            />
            <DisplayValue
              label="Durée du prêt (mois) :"
              value={contrat.duree_pret ? `${contrat.duree_pret}` : ''}
            />
            <DisplayValue
              label="Date d'effet :"
              value={formatDate(contrat.date_effet)}
            />
            <DisplayValue
              label="Date de fin d'échéance :"
              value={formatDate(contrat.date_fin_echeance)}
            />
          </div>
        </div>

        {/* Section: Assuré/Emprunteur */}
        <div className="flex border-b border-[#F48232]">
          <div className="w-28 flex-shrink-0 p-1.5 bg-orange-50 italic border-r border-[#F48232] flex flex-col justify-center text-xs">
            Assuré/Emprunteur
          </div>
          <div className="flex-grow p-1.5 space-y-1">
            <div className="flex gap-2">
              <DisplayValue label="Nom :" value={contrat.nom} />
              <DisplayValue label="Prénom :" value={contrat.prenom} />
            </div>
            <div className="flex gap-2">
              <DisplayValue label="Adresse :" value={contrat.adresse} className="flex-grow-[2]" />
              <DisplayValue label="Ville :" value={contrat.ville} className="flex-grow-[1]" />
            </div>
            <div className="flex gap-2">
              <DisplayValue label="Téléphone :" value={contrat.telephone} className="flex-grow-[1]" />
              <DisplayValue label="Email :" value={contrat.email} className="flex-grow-[2]" />
            </div>
            {/* Catégorie */}
            <div className="flex flex-wrap items-center mt-1 gap-x-4 gap-y-1">
              <span className="mr-1 text-xs">Catégorie :</span>
              {categories.map(cat => (
                <CheckboxDisplay
                  key={cat.key}
                  label={cat.label}
                  checked={contrat.categorie === cat.key}
                />
              ))}
            </div>
            {/* Affichage catégorie sélectionnée */}
            {getCategorieLabel() && (
              <div className="text-xs font-bold text-[#F48232]">
                → Catégorie : {getCategorieLabel()}
              </div>
            )}
          </div>
        </div>

        {/* Section: Bénéficiaire du prêt (ARIANE FINANCE) */}
        <div className="flex border-b border-[#F48232]">
          <div className="w-28 flex-shrink-0 p-1.5 bg-orange-50 italic border-r border-[#F48232] flex flex-col justify-center text-xs">
            Bénéficiaire du prêt
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
        <div className="flex border-b border-[#F48232]">
          <div className="w-28 flex-shrink-0 p-1.5 bg-orange-50 italic border-r border-[#F48232] flex flex-col justify-center text-xs leading-tight">
            Bénéficiaire Protection Forfaitaire
          </div>
          <div className="flex-grow p-1.5 space-y-1">
            <div className="flex gap-2">
              <DisplayValue label="Nom :" value={contrat.beneficiaire_nom} />
              <DisplayValue label="Prénom :" value={contrat.beneficiaire_prenom} />
              <DisplayValue label="Téléphone :" value={contrat.beneficiaire_telephone} />
            </div>
          </div>
        </div>

        {/* Section: Garanties */}
        <div className="flex border-b border-[#F48232]">
          <div className="w-28 flex-shrink-0 p-1.5 bg-orange-50 italic border-r border-[#F48232] flex flex-col justify-center text-xs">
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
                {/* Protection forfaitaire Prévoyance */}
                <tr className="border-b border-[#F48232] bg-orange-50">
                  <td className="p-1 text-left pl-2 font-medium bg-gray-100">Protection forfaitaire Prévoyance¹ Décès - IAD²</td>
                  <td className="border-l border-r border-[#F48232] p-1 text-[#F48232]">Toute catégorie</td>
                  <td className="border-r border-[#F48232] p-1">
                    <div className="flex justify-center">
                      <div className="w-6 h-4 border border-black bg-black"></div>
                    </div>
                  </td>
                  <td className="border-r border-[#F48232] p-1 bg-gray-200 text-gray-500">N/A</td>
                  <td className="p-1 text-[#F48232] font-bold">{formatCurrency(PRIME_PROTECTION).replace(' FCFA', '')} FCFA</td>
                </tr>
                {/* Décès – IAD */}
                <tr className="bg-orange-50">
                  <td className="p-1 text-left pl-2 font-medium bg-gray-100">Décès – Invalidité Absolue et Définitive (IAD)</td>
                  <td className="border-l border-r border-[#F48232] p-1 text-[#F48232]">Toute catégorie</td>
                  <td className="border-r border-[#F48232] p-1">
                    <div className="flex justify-center">
                      <div className="w-6 h-4 border border-black bg-black"></div>
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
        <div className="flex bg-orange-50/50">
          <div className="w-28 flex-shrink-0 p-1.5 bg-orange-50 italic border-r border-[#F48232] flex flex-col justify-center text-xs">
            Cotisations
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
          Fait à <span className="border-b border-black px-2 mx-1 font-semibold">Libreville</span>,
          le <span className="border-b border-black px-2 mx-1 font-semibold">{signatureDate}</span>
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
  )
}

export default ArianeFinanceContratPrint
