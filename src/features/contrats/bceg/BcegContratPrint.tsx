// src/features/contrats/bceg/BcegContratPrint.tsx
import { BcegContrat } from '@/types/bceg'
import logoSamba from '@/assets/logo-samba.png'

// --- Logo Component ---
const Logo: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center mb-0">
      <img 
        src={logoSamba} 
        alt="SAMB'A Assurances" 
        className="h-[60px] w-auto"
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
}> = ({ label, rate, prime, isSelected }) => (
  <tr className={`border-b border-[#F48232] last:border-0 ${isSelected ? 'bg-orange-100' : ''}`}>
    <td className="p-1.5 text-left pl-3 border-r border-[#F48232] text-[10px]">{label}</td>
    <td className="p-1 border-r border-[#F48232]">
      <div 
        className={`w-6 h-4 border border-black rounded-sm mx-auto ${isSelected ? 'bg-[#F48232]' : 'bg-white'}`}
      />
    </td>
    <td className="p-1.5 border-r border-[#F48232] text-center text-[10px]">{rate}</td>
    <td className="p-1.5 text-center text-[10px]">{prime}</td>
  </tr>
)

interface Props {
  contrat: BcegContrat
}

export const BcegContratPrint: React.FC<Props> = ({ contrat }) => {
  const formatCurrency = (value: number | string | undefined) => {
    if (!value) return '0'
    const num = typeof value === 'string' ? parseFloat(value) : value
    return new Intl.NumberFormat('fr-FR').format(num)
  }

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR')
  }

  // Calcul de la tranche de durée
  const duree = contrat.duree_pret_mois || 0
  const getTranche = () => {
    if (duree <= 24) return 'max_24'
    if (duree <= 36) return '24_36'
    if (duree <= 48) return '36_48'
    if (duree <= 60) return '48_60'
    return ''
  }
  const tranche = getTranche()

  // Calcul des cotisations
  const montant = Number(contrat.montant_pret) || 0
  const getTaux = () => {
    if (duree <= 24) return 0.01  // 1%
    if (duree <= 36) return 0.015 // 1.5%
    if (duree <= 48) return 0.0175 // 1.75%
    if (duree <= 60) return 0.02  // 2%
    return 0
  }
  
  const tauxApplique = getTaux()
  const cotisationDeces = montant * tauxApplique
  const cotisationPrevoyance = contrat.garantie_prevoyance ? 10000 : 0
  const cotisationTotale = cotisationDeces + cotisationPrevoyance

  // Date d'émission
  const dateEmission = contrat.created_at || new Date().toISOString()

  return (
    <div className="bg-white w-[210mm] min-h-[297mm] p-[8mm] relative flex flex-col print:shadow-none print:p-[6mm]">
      {/* Header */}
      <div className="flex flex-col items-center mb-2">
        <Logo />
        <h1 className="text-[#F48232] text-base font-extrabold uppercase mt-1 text-center leading-tight tracking-wide">
          CONTRAT COLLECTIF DE MICRO ASSURANCE BCEG
        </h1>
        <h2 className="text-[#F48232] text-base font-extrabold uppercase text-center leading-tight tracking-wide mb-0.5">
          DÉCÈS EMPRUNTEUR & PRÉVOYANCE
        </h2>
        <p className="text-[10px] text-black font-semibold">Contrat régi par les dispositions du Code des Assurances CIMA</p>
        <div className="text-xs font-bold text-black mt-1">
          Visa DNA N°005/24 & 008/24 - Police N°: 509/111.701:0225
        </div>
        <div className="w-full border-b-2 border-[#F48232] mt-1 mb-0.5"></div>
        <h3 className="text-black text-sm font-bold uppercase">
          CONDITIONS PARTICULIÈRES
        </h3>
      </div>

      {/* Form Body */}
      <div className="border-2 border-[#F48232] w-full flex flex-col text-sm">
        
        {/* Section: Couverture */}
        <div className="flex border-b border-[#F48232]">
          <div className="w-36 flex-shrink-0 p-1.5 bg-orange-50 italic border-r border-[#F48232] flex items-center text-gray-900 text-xs">
            Couverture
          </div>
          <div className="flex-grow p-1.5 space-y-1">
            {/* Numéro de police */}
            <div className="flex items-end">
              <span className="text-xs text-gray-800 mr-2 whitespace-nowrap">N° Police :</span>
              <span className="flex-grow border-b border-gray-800 text-xs px-1 font-bold">
                {contrat.numero_police || ''}
              </span>
            </div>
            <div className="flex gap-4">
              <div className="flex items-end flex-1">
                <span className="text-xs text-gray-800 mr-2 whitespace-nowrap">Montant du prêt :</span>
                <span className="flex-grow border-b border-gray-800 text-xs px-1 font-bold text-right">
                  {formatCurrency(contrat.montant_pret)} FCFA
                </span>
              </div>
              <div className="flex items-end flex-1">
                <span className="text-xs text-gray-800 mr-2 whitespace-nowrap">Durée du prêt :</span>
                <span className="flex-grow border-b border-gray-800 text-xs px-1 font-bold text-center">
                  {contrat.duree_pret_mois} mois
                </span>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex items-end flex-1">
                <span className="text-xs text-gray-800 mr-2 whitespace-nowrap">Date d'effet :</span>
                <span className="flex-grow border-b border-gray-800 text-xs px-1 font-bold">
                  {formatDate(contrat.date_effet)}
                </span>
              </div>
              <div className="flex items-end flex-1">
                <span className="text-xs text-gray-800 mr-2 whitespace-nowrap">Date de fin d'échéance :</span>
                <span className="flex-grow border-b border-gray-800 text-xs px-1 font-bold">
                  {formatDate(contrat.date_fin_echeance)}
                </span>
              </div>
            </div>
            {/* Date d'émission */}
            <div className="flex items-end">
              <span className="text-xs text-gray-800 mr-2 whitespace-nowrap">Date d'émission :</span>
              <span className="text-xs font-bold">{formatDate(dateEmission)}</span>
            </div>
          </div>
        </div>

        {/* Section: Assuré / Bénéficiaire du prêt */}
        <div className="flex border-b border-[#F48232]">
          <div className="w-36 flex-shrink-0 p-1.5 bg-orange-50 italic border-r border-[#F48232] flex items-center text-gray-900 text-xs leading-tight">
            Assuré/<br/>Bénéficiaire du prêt
          </div>
          <div className="flex-grow p-1.5 space-y-1">
            <div className="flex items-end">
              <span className="text-xs text-gray-800 mr-2 w-20">Nom :</span>
              <span className="flex-grow border-b border-gray-800 text-xs px-1 font-bold">
                {contrat.nom || ''}
              </span>
            </div>
            <div className="flex items-end">
              <span className="text-xs text-gray-800 mr-2 w-20">Prénom :</span>
              <span className="flex-grow border-b border-gray-800 text-xs px-1 font-bold">
                {contrat.prenom || ''}
              </span>
            </div>
            <div className="flex items-end">
              <span className="text-xs text-gray-800 mr-2 w-20">Adresse :</span>
              <span className="flex-grow border-b border-gray-800 text-xs px-1 font-bold">
                {contrat.adresse_assure || ''}
              </span>
            </div>
            <div className="flex items-end">
              <span className="text-xs text-gray-800 mr-2 w-20">Ville :</span>
              <span className="flex-grow border-b border-gray-800 text-xs px-1 font-bold">
                {contrat.ville_assure || ''}
              </span>
            </div>
            <div className="flex items-end">
              <span className="text-xs text-gray-800 mr-2 w-20">Tél / Email :</span>
              <span className="flex-grow border-b border-gray-800 text-xs px-1 font-bold">
                {contrat.telephone_assure || ''} {contrat.email_assure ? `/ ${contrat.email_assure}` : ''}
              </span>
            </div>
            {/* Catégorie socio-professionnelle */}
            <div className="mt-1">
              <div className="flex items-start gap-x-3">
                <span className="text-xs text-gray-800 whitespace-nowrap pt-0.5">Catégorie :</span>
                <div className="grid grid-cols-3 gap-x-4 gap-y-1">
                  <label className="flex items-center mr-4">
                    <div className={`w-4 h-4 border-2 border-black mr-2 flex items-center justify-center ${contrat.categorie === 'commercants' ? 'bg-black' : 'bg-white'}`}>
                      {contrat.categorie === 'commercants' && <div className="w-2 h-2 bg-white" />}
                    </div>
                    <span className="text-xs text-gray-800">Commerçants</span>
                  </label>
                  <label className="flex items-center mr-4">
                    <div className={`w-4 h-4 border-2 border-black mr-2 flex items-center justify-center ${contrat.categorie === 'salaries_public' ? 'bg-black' : 'bg-white'}`}>
                      {contrat.categorie === 'salaries_public' && <div className="w-2 h-2 bg-white" />}
                    </div>
                    <span className="text-xs text-gray-800">Sal. public</span>
                  </label>
                  <label className="flex items-center mr-4">
                    <div className={`w-4 h-4 border-2 border-black mr-2 flex items-center justify-center ${contrat.categorie === 'salaries_prive' ? 'bg-black' : 'bg-white'}`}>
                      {contrat.categorie === 'salaries_prive' && <div className="w-2 h-2 bg-white" />}
                    </div>
                    <span className="text-xs text-gray-800">Sal. privé</span>
                  </label>
                  <label className="flex items-center mr-4">
                    <div className={`w-4 h-4 border-2 border-black mr-2 flex items-center justify-center ${contrat.categorie === 'retraites' ? 'bg-black' : 'bg-white'}`}>
                      {contrat.categorie === 'retraites' && <div className="w-2 h-2 bg-white" />}
                    </div>
                    <span className="text-xs text-gray-800">Retraités</span>
                  </label>
                  <div className="flex items-center col-span-2">
                    <div className={`w-4 h-4 border-2 border-black mr-2 flex items-center justify-center ${contrat.categorie === 'autre' ? 'bg-black' : 'bg-white'}`}>
                      {contrat.categorie === 'autre' && <div className="w-2 h-2 bg-white" />}
                    </div>
                    <span className="text-xs text-gray-800 mr-1">Autre :</span>
                    <span className="border-b border-gray-400 flex-grow text-xs px-1 font-bold">
                      {contrat.categorie === 'autre' ? (contrat.autre_categorie_precision || '') : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Souscripteur BCEG */}
        <div className="flex border-b border-[#F48232]">
          <div className="w-36 flex-shrink-0 p-1.5 bg-orange-50 italic border-r border-[#F48232] flex items-center text-gray-900 text-xs">
            Souscripteur BCEG
          </div>
          <div className="flex-grow p-1.5 space-y-0.5 text-[10px]">
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
            {contrat.agence && (
              <div className="flex items-end">
                <span className="mr-2 text-gray-800">Agence :</span>
                <span className="font-bold">{contrat.agence}</span>
              </div>
            )}
          </div>
        </div>

        {/* Section: Bénéficiaire de la Prévoyance */}
        <div className="flex border-b border-[#F48232]">
          <div className="w-36 flex-shrink-0 p-1.5 bg-orange-50 italic border-r border-[#F48232] flex items-center text-gray-900 text-xs leading-tight">
            Bénéficiaire de<br/>la Prévoyance
          </div>
          <div className="flex-grow p-1.5 space-y-1">
            <div className="flex items-end">
              <span className="text-xs text-gray-800 mr-2 whitespace-nowrap">Nom et Prénom :</span>
              <span className="flex-grow border-b border-gray-800 text-xs px-1 font-bold">
                {contrat.beneficiaire_prevoyance_nom_prenom || ''}
              </span>
            </div>
            <div className="flex items-end">
              <span className="text-xs text-gray-800 mr-2 whitespace-nowrap">Adresse et contact :</span>
              <span className="flex-grow border-b border-gray-800 text-xs px-1 font-bold">
                {contrat.beneficiaire_prevoyance_adresse || ''} {contrat.beneficiaire_prevoyance_contact ? `/ ${contrat.beneficiaire_prevoyance_contact}` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Section: Garanties */}
        <div className="flex border-b border-[#F48232]">
          <div className="w-36 flex-shrink-0 p-1.5 bg-orange-50 italic border-r border-[#F48232] flex items-center text-gray-900 text-xs">
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
                  prime={tranche === 'max_24' ? `${formatCurrency(cotisationDeces)} FCFA` : 'N/A'}
                  isSelected={tranche === 'max_24'}
                />
                <GarantieRow 
                  label="Décès/IAD (Durée entre 24 à 36 mois)" 
                  rate="1,50%" 
                  prime={tranche === '24_36' ? `${formatCurrency(cotisationDeces)} FCFA` : 'N/A'}
                  isSelected={tranche === '24_36'}
                />
                <GarantieRow 
                  label="Décès/IAD (Durée entre 36 à 48 mois)" 
                  rate="1,75%" 
                  prime={tranche === '36_48' ? `${formatCurrency(cotisationDeces)} FCFA` : 'N/A'}
                  isSelected={tranche === '36_48'}
                />
                <GarantieRow 
                  label="Décès/IAD (Durée entre 48 à 60 mois)" 
                  rate="2,00%" 
                  prime={tranche === '48_60' ? `${formatCurrency(cotisationDeces)} FCFA` : 'N/A'}
                  isSelected={tranche === '48_60'}
                />
                <tr className="border-t border-[#F48232]">
                  <td className="p-1.5 text-left pl-3 border-r border-[#F48232] font-medium text-[10px]">Prévoyance Décès/IAD</td>
                  <td className="border-r border-[#F48232] p-1">
                    <div 
                      className={`w-6 h-4 border border-black rounded-sm mx-auto ${contrat.garantie_prevoyance ? 'bg-gray-800' : 'bg-white'}`}
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
          <div className="w-36 flex-shrink-0 p-1.5 italic border-r border-[#F48232] flex items-center text-gray-900 text-xs">
            Cotisations
          </div>
          <div className="flex-grow p-1.5">
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
      <div className="mt-2 text-[9px] font-bold space-y-0 text-black">
        <p>(1) Le montant maximal de couverture de prêt est de 20 000 000 FCFA</p>
        <p>(2) La protection forfaitaire est d'un montant de 250 000 FCFA en cas de décès ou d'invalidité absolue et définitive.</p>
      </div>

      {/* Signatures */}
      <div className="mt-auto mb-1">
        <div className="text-right mb-2 pr-4 font-medium text-xs">
          Fait à <span className="border-b border-black px-2 mx-1 font-semibold">Libreville</span>, 
          le <span className="border-b border-black px-2 mx-1 font-semibold">{formatDate(contrat.created_at || new Date().toISOString())}</span>
        </div>

        <div className="flex justify-between items-start pt-2">
          <div className="w-[30%] flex flex-col">
            <span className="font-bold mb-1 ml-4 text-xs">L'Assuré</span>
            <div className="border border-black h-16 w-full flex items-center justify-center text-gray-300 text-[10px] bg-white">
              Signature
            </div>
          </div>
          
          <div className="w-[35%] flex flex-col items-center justify-end pb-1 font-bold text-[8px] space-y-0 self-end">
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
            <div className="border border-black h-16 w-full flex items-center justify-center text-gray-300 text-[10px] bg-white">
              Signature et cachet
            </div>
          </div>
        </div>
      </div>

      <Footer pageNum={1} />
    </div>
  )
}

export default BcegContratPrint
