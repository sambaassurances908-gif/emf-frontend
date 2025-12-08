// src/features/contrats/cofidec/CofidecContratPrint.tsx
import React from 'react'
import logoSamba from '@/assets/logo-samba.png'

interface CofidecContratPrintProps {
  contrat: {
    id?: number
    reference?: string
    nom_prenom: string
    adresse_assure: string
    ville_assure: string
    telephone_assure: string
    email_assure?: string
    montant_pret: number
    duree_pret_mois: number
    date_effet: string
    date_fin_echeance?: string
    categorie: string
    autre_categorie_precision?: string
    agence?: string
    garantie_prevoyance?: boolean | number
    garantie_deces_iad?: boolean | number
    garantie_perte_emploi?: boolean | number
    cotisation_prevoyance?: number
    cotisation_deces_iad?: number
    cotisation_perte_emploi?: number
    cotisation_totale?: number
    statut?: string
    lieu_signature?: string
    created_at?: string
  }
}

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

// --- Checkbox Display Component ---
const CheckboxDisplay: React.FC<{ 
  label: string
  checked?: boolean
}> = ({ label, checked }) => (
  <div className="flex items-center mr-3">
    <div className={`w-4 h-4 border-2 border-black mr-1.5 flex items-center justify-center ${checked ? 'bg-[#F48232]' : 'bg-white'}`}>
      {checked && <div className="w-2 h-2 bg-white" />}
    </div>
    <span className="text-[10px] text-gray-800">{label}</span>
  </div>
)

export const CofidecContratPrint: React.FC<CofidecContratPrintProps> = ({ contrat }) => {
  // Calcul des valeurs
  const montant = contrat.montant_pret || 0
  const duree = contrat.duree_pret_mois || 0
  
  // Taux selon catégorie et durée
  const getTaux = () => {
    if (contrat.categorie === 'salaries_cofidec') return 0.0075 // 0.75%
    if (duree >= 1 && duree <= 6) return 0.005 // 0.50%
    if (duree > 6 && duree <= 13) return 0.01 // 1.00%
    if (duree > 13 && duree <= 24) return 0.0175 // 1.75%
    return 0
  }
  
  const tauxDeces = getTaux()
  const cotisationDeces = contrat.cotisation_deces_iad || montant * tauxDeces
  const cotisationPrevoyance = contrat.cotisation_prevoyance || (contrat.garantie_prevoyance ? 5000 : 0)
  const tauxPerteEmploi = contrat.garantie_perte_emploi ? 0.02 : 0
  const cotisationPerteEmploi = contrat.cotisation_perte_emploi || (montant * tauxPerteEmploi)
  const cotisationTotale = contrat.cotisation_totale || (cotisationDeces + cotisationPrevoyance + cotisationPerteEmploi)

  // Calcul date fin si non fournie
  const getDateFin = () => {
    if (contrat.date_fin_echeance) return contrat.date_fin_echeance
    if (contrat.date_effet && duree) {
      const dateEffet = new Date(contrat.date_effet)
      dateEffet.setMonth(dateEffet.getMonth() + duree)
      return dateEffet.toISOString().split('T')[0]
    }
    return ''
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value)
  }

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR')
  }

  const getCategorieLabel = (cat: string) => {
    const labels: Record<string, string> = {
      'commercants': 'Commerçants',
      'salaries_public': 'Salariés du public',
      'salaries_prive': 'Salariés du privé',
      'salaries_cofidec': 'Salariés COFIDEC',
      'retraites': 'Retraités',
      'autre': 'Autre'
    }
    return labels[cat] || cat
  }

  return (
    <div className="bg-white w-[210mm] min-h-[297mm] p-[10mm] shadow-xl relative flex flex-col print:shadow-none print:p-[8mm]">
      {/* Header */}
      <div className="flex flex-col items-center mb-3">
        <Logo />
        <h1 className="text-[#F48232] text-lg font-extrabold uppercase mt-2 text-center leading-tight tracking-wide">
          CONTRAT DÉCÈS EMPRUNTEUR COFIDEC
        </h1>
        <p className="text-[10px] text-black font-semibold mt-1">Contrat régi par les dispositions du Code des Assurances CIMA</p>
        <div className="text-xs font-bold text-black mt-1">
          Visas DNA N°005/24 et N°008/24 - Convention N°: 503/111.112/0624
        </div>
        {contrat.reference && (
          <div className="text-xs font-bold text-[#F48232] mt-1">
            Référence : {contrat.reference}
          </div>
        )}
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
                <span className="text-xs text-gray-800 mr-2 whitespace-nowrap">Montant du prêt assuré :</span>
                <span className="flex-grow border-b border-gray-800 text-xs px-1 font-bold text-right">
                  {formatCurrency(montant)} FCFA
                </span>
              </div>
              <div className="flex items-end flex-1">
                <span className="text-xs text-gray-800 mr-2 whitespace-nowrap">Durée du prêt :</span>
                <span className="flex-grow border-b border-gray-800 text-xs px-1 font-bold text-center">
                  {duree} mois
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
                  {formatDate(getDateFin())}
                </span>
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
              <span className="flex-grow border-b border-gray-800 text-xs px-1 font-bold">
                {contrat.nom_prenom}
              </span>
            </div>
            <div className="flex gap-4">
              <div className="flex items-end flex-1">
                <span className="text-xs text-gray-800 mr-2">Adresse :</span>
                <span className="flex-grow border-b border-gray-800 text-xs px-1 font-bold">
                  {contrat.adresse_assure}
                </span>
              </div>
              <div className="flex items-end flex-1">
                <span className="text-xs text-gray-800 mr-2">Ville :</span>
                <span className="flex-grow border-b border-gray-800 text-xs px-1 font-bold">
                  {contrat.ville_assure}
                </span>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex items-end flex-1">
                <span className="text-xs text-gray-800 mr-2">Téléphone :</span>
                <span className="flex-grow border-b border-gray-800 text-xs px-1 font-bold">
                  {contrat.telephone_assure}
                </span>
              </div>
              <div className="flex items-end flex-1">
                <span className="text-xs text-gray-800 mr-2">Email :</span>
                <span className="flex-grow border-b border-gray-800 text-xs px-1 font-bold">
                  {contrat.email_assure || '-'}
                </span>
              </div>
            </div>
            {/* Catégories */}
            <div className="flex flex-wrap items-center mt-1 gap-y-1 text-xs">
              <span className="mr-2 text-xs text-gray-800 whitespace-nowrap">Catégorie :</span>
              <CheckboxDisplay 
                label="Commerçants" 
                checked={contrat.categorie === 'commercants'}
              />
              <CheckboxDisplay 
                label="Salariés du public" 
                checked={contrat.categorie === 'salaries_public'}
              />
              <CheckboxDisplay 
                label="Salariés du privé" 
                checked={contrat.categorie === 'salaries_prive'}
              />
              <CheckboxDisplay 
                label="Salariés COFIDEC" 
                checked={contrat.categorie === 'salaries_cofidec'}
              />
            </div>
            <div className="flex items-center gap-2">
              <CheckboxDisplay 
                label="Retraités" 
                checked={contrat.categorie === 'retraites'}
              />
              <div className="flex items-end flex-grow">
                <CheckboxDisplay 
                  label="Autre à préciser :" 
                  checked={contrat.categorie === 'autre'}
                />
                <span className="border-b border-gray-400 flex-grow ml-1 text-xs font-bold">
                  {contrat.categorie === 'autre' ? contrat.autre_categorie_precision : ''}
                </span>
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
                <span className="border-b border-gray-600 flex-grow text-[10px] px-1 font-bold">
                  {contrat.agence || '-'}
                </span>
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
                <tr className={`border-b border-[#F48232] ${contrat.garantie_prevoyance ? 'bg-orange-50' : ''}`}>
                  <td className="p-1 border-r border-[#F48232] text-left pl-2 font-medium">Prévoyance</td>
                  <td className="p-1 border-r border-[#F48232]">Toutes catégories</td>
                  <td className="p-1 border-r border-[#F48232] font-bold">5 000 FCFA</td>
                  <td className="p-1 border-r border-[#F48232]">Durée du prêt</td>
                  <td className="p-1">250 000 FCFA</td>
                </tr>
                <tr className={`border-b border-[#F48232] ${contrat.categorie === 'salaries_cofidec' ? 'bg-orange-50' : ''}`}>
                  <td className="p-1 border-r border-[#F48232] text-left pl-2 font-medium">Décès ou IAD</td>
                  <td className="p-1 border-r border-[#F48232]">Salariés COFIDEC</td>
                  <td className="p-1 border-r border-[#F48232] font-bold">0,75% du prêt</td>
                  <td className="p-1 border-r border-[#F48232]">Durée du prêt</td>
                  <td className="p-1">20 000 000 FCFA</td>
                </tr>
                <tr className={`border-b border-[#F48232] ${duree >= 1 && duree <= 6 && contrat.categorie !== 'salaries_cofidec' ? 'bg-orange-50' : ''}`}>
                  <td className="p-1 border-r border-[#F48232] text-left pl-2 font-medium">Décès ou IAD</td>
                  <td className="p-1 border-r border-[#F48232]">Toutes catégories</td>
                  <td className="p-1 border-r border-[#F48232] font-bold">0,50% du prêt</td>
                  <td className="p-1 border-r border-[#F48232]">1 à 6 mois max</td>
                  <td className="p-1">5 000 000 FCFA</td>
                </tr>
                <tr className={`border-b border-[#F48232] ${duree > 6 && duree <= 13 && contrat.categorie !== 'salaries_cofidec' ? 'bg-orange-50' : ''}`}>
                  <td className="p-1 border-r border-[#F48232] text-left pl-2 font-medium">Décès ou IAD</td>
                  <td className="p-1 border-r border-[#F48232]">Toutes catégories</td>
                  <td className="p-1 border-r border-[#F48232] font-bold">1,00% du prêt</td>
                  <td className="p-1 border-r border-[#F48232]">6 à 12(+1) mois</td>
                  <td className="p-1">10 000 000 FCFA</td>
                </tr>
                <tr className={`border-b border-[#F48232] ${duree > 13 && duree <= 24 && contrat.categorie !== 'salaries_cofidec' ? 'bg-orange-50' : ''}`}>
                  <td className="p-1 border-r border-[#F48232] text-left pl-2 font-medium">Décès ou IAD</td>
                  <td className="p-1 border-r border-[#F48232]">Toutes catégories</td>
                  <td className="p-1 border-r border-[#F48232] font-bold">1,75% du prêt</td>
                  <td className="p-1 border-r border-[#F48232]">12 à 24 mois</td>
                  <td className="p-1">20 000 000 FCFA</td>
                </tr>
                <tr className={`${contrat.garantie_perte_emploi ? 'bg-orange-50' : ''}`}>
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
          Fait à <span className="border-b border-black px-2 mx-1 font-semibold">{contrat.lieu_signature || 'Libreville'}</span>, 
          le <span className="border-b border-black px-2 mx-1 font-semibold">{formatDate(contrat.created_at)}</span>
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
  )
}
