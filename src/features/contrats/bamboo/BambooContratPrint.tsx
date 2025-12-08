// src/features/contrats/bamboo/BambooContratPrint.tsx
import { Mail, Phone, MapPin } from 'lucide-react'
import { BambooContrat } from '@/types/bamboo'
import { formatCurrency } from '@/lib/utils'
import logoSamba from '@/assets/logo-samba.png'

interface BambooContratPrintProps {
  contrat: BambooContrat
}

// --- Display Field Component (read-only version of FormInput) ---
interface DisplayFieldProps {
  label?: string
  value?: string | number | null
  className?: string
}

const DisplayField: React.FC<DisplayFieldProps> = ({ 
  label, 
  value = '', 
  className = ""
}) => (
  <div className="flex items-end w-full">
    {label && (
      <span className="mr-1 whitespace-nowrap text-[11px] text-gray-800">
        {label}
      </span>
    )}
    <span className={`flex-grow border-b-2 border-gray-400 text-[11px] px-1 py-0.5 min-h-[22px] font-semibold ${className}`}>
      {value || '_______________'}
    </span>
  </div>
)

// --- Checkbox Display Component (read-only) ---
interface CheckboxDisplayProps {
  label: string
  checked?: boolean
}

const CheckboxDisplay: React.FC<CheckboxDisplayProps> = ({ label, checked = false }) => (
  <div className="flex items-center mr-3">
    <div className={`w-4 h-4 border-2 border-black mr-1 flex items-center justify-center ${checked ? 'bg-black' : 'bg-white'}`}>
      {checked && <div className="w-2 h-2 bg-white" />}
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

export const BambooContratPrint = ({ contrat }: BambooContratPrintProps) => {
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '____/____/________'
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  // Catégories
  const categories = [
    { key: 'commercants', label: 'Commerçants' },
    { key: 'salaries_public', label: 'Salariés du public' },
    { key: 'salaries_prive', label: 'Salariés du privé' },
    { key: 'retraites', label: 'Retraités' },
  ]

  const getCategorieLabel = () => {
    const cat = categories.find(c => c.key === contrat.categorie)
    if (cat) return cat.label
    if (contrat.categorie === 'autre' && contrat.autre_categorie_precision) {
      return contrat.autre_categorie_precision
    }
    return ''
  }

  // Calcul cotisation (ou utiliser les valeurs du contrat si disponibles)
  const montant = contrat.montant_pret || contrat.montant_pret_assure || 0
  const cotisationPrevoyance = contrat.garantie_prevoyance || contrat.garantie_prevoyance_deces_iad ? 10000 : 0
  const cotisationDeces = contrat.cotisation_deces_iad || (montant * 0.01)
  const cotisationPerteEmploi = contrat.garantie_perte_emploi ? (contrat.cotisation_perte_emploi || (montant * 0.015)) : 0
  const cotisationTotale = contrat.cotisation_totale_ttc || (cotisationPrevoyance + cotisationDeces + cotisationPerteEmploi)

  return (
    <div className="bg-white w-[210mm] min-h-[297mm] p-[6mm] shadow-xl relative flex flex-col mx-auto print:shadow-none">
      
      {/* Header */}
      <div className="flex flex-col items-center mb-2">
        <div className="mb-0">
          <img src={logoSamba} alt="SAMB'A Assurances" className="h-[85px] w-auto" />
        </div>
        <h1 className="text-[#F48232] text-base font-bold uppercase text-center leading-none mt-1">
          Contrat Prévoyance & Crédits BAMBOO-EMF
        </h1>
        <p className="text-[8px] text-gray-500">Contrat régi par les dispositions du Code des assurances CIMA</p>
        <div className="text-[9px] font-bold text-gray-700 leading-tight">
          Visas DNA N°005/24 et N°008/24 - Convention N° : 511/111.701/0325
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
            <DisplayField 
              label="Montant du prêt assuré :" 
              value={montant ? formatCurrency(montant) : undefined}
            />
            <DisplayField 
              label="Durée du prêt :" 
              value={contrat.duree_pret_mois ? `${contrat.duree_pret_mois} mois` : undefined}
            />
            <DisplayField 
              label="Date d'effet :" 
              value={formatDate(contrat.date_effet)}
            />
            <DisplayField 
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
            <DisplayField 
              label="Nom & Prénom :" 
              value={contrat.nom_prenom}
            />
            <div className="flex gap-2">
              <DisplayField 
                label="Adresse :" 
                value={contrat.adresse_assure}
                className="flex-grow-[2]"
              />
              <DisplayField 
                label="Ville :" 
                value={contrat.ville_assure}
                className="flex-grow-[1]"
              />
            </div>
            <div className="flex gap-2">
              <DisplayField 
                label="Téléphone :" 
                value={contrat.telephone_assure}
                className="flex-grow-[1]"
              />
              <DisplayField 
                label="Email:" 
                value={contrat.email_assure}
                className="flex-grow-[2]"
              />
            </div>
            <div className="flex flex-wrap items-center mt-1 gap-y-1">
              <span className="mr-1 text-xs">Catégorie :</span>
              {categories.map(cat => (
                <CheckboxDisplay 
                  key={cat.key} 
                  label={cat.label} 
                  checked={contrat.categorie === cat.key}
                />
              ))}
              <div className="flex items-center ml-1">
                <CheckboxDisplay 
                  label="Autre à préciser :" 
                  checked={contrat.categorie === 'autre'}
                />
                <span className="border-b border-gray-400 w-24 ml-1 text-xs font-semibold">
                  {contrat.categorie === 'autre' ? contrat.autre_categorie_precision : ''}
                </span>
              </div>
            </div>
            {/* Affichage catégorie sélectionnée pour impression */}
            {getCategorieLabel() && (
              <div className="text-xs font-bold text-[#F48232]">
                → Catégorie : {getCategorieLabel()}
              </div>
            )}
            {/* Bénéficiaire Prévoyance */}
            <div className="mt-2 pt-2 border-t border-dashed border-gray-300">
              <DisplayField 
                label="Bénéficiaire de la garantie Prévoyance :" 
                value={contrat.beneficiaire_prevoyance}
              />
            </div>
          </div>
        </div>

        {/* Section: Souscripteur / EMF */}
        <div className="flex border-b border-[#F48232]">
          <div className="w-28 flex-shrink-0 p-1.5 bg-orange-50 italic border-r border-[#F48232] flex items-center text-xs">
            Souscripteur / EMF
          </div>
          <div className="flex-grow p-1.5 space-y-1">
            <div className="flex items-end">
              <span className="mr-1 whitespace-nowrap text-xs text-gray-800">Raison sociale :</span>
              <span className="font-bold text-xs">{contrat.emf?.raison_sociale || 'BAMBOO-EMF'}</span>
            </div>
            <div className="flex gap-2">
              <div className="flex items-end flex-grow">
                <span className="mr-1 whitespace-nowrap text-xs">Adresse :</span>
                <span className="font-bold mr-2 text-xs">B.P. 16.100, Boulevard Triomphal</span>
              </div>
              <DisplayField 
                label="Agence :" 
                value={contrat.agence}
                className="w-32"
              />
            </div>
            <div className="flex items-end">
              <span className="mr-1 text-xs">Ville :</span>
              <span className="font-bold text-xs mr-4">Libreville – Gabon</span>
              <span className="mr-1 text-xs">Téléphone :</span>
              <span className="font-bold text-xs mr-4">60 41 21 21 / 77 41 21 21</span>
              <span className="mr-1 text-xs">Email :</span>
              <span className="font-bold text-xs">service.client@bamboo-emf.com</span>
            </div>
          </div>
        </div>

        {/* Section: Garanties */}
        <div className="flex border-b border-[#F48232]">
          <div className="w-28 flex-shrink-0 p-1.5 bg-orange-50 italic border-r border-[#F48232] flex items-center text-xs">
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
                {/* Prévoyance Décès - IAD */}
                <tr className={`border-b border-[#F48232] ${(contrat.garantie_prevoyance || contrat.garantie_prevoyance_deces_iad) ? 'bg-orange-50' : ''}`}>
                  <td className="p-1 text-left pl-2 font-medium bg-gray-100">Prévoyance Décès - IAD</td>
                  <td className="border-l border-r border-[#F48232] p-1 text-[#F48232]">Toute catégorie</td>
                  <td className="border-r border-[#F48232] p-1">
                    <div className="flex justify-center">
                      <div className={`w-6 h-4 border border-black ${(contrat.garantie_prevoyance || contrat.garantie_prevoyance_deces_iad) ? 'bg-black' : 'bg-white'}`}></div>
                    </div>
                  </td>
                  <td className="border-r border-[#F48232] p-1 bg-gray-200 text-gray-500">N/A</td>
                  <td className="p-1 text-[#F48232] font-bold">10 000 FCFA</td>
                </tr>
                {/* Décès – IAD */}
                <tr className={`border-b border-[#F48232] ${contrat.garantie_deces_iad ? 'bg-orange-50' : ''}`}>
                  <td className="p-1 text-left pl-2 font-medium bg-gray-100">Décès – Invalidité Absolue et Définitive (IAD)</td>
                  <td className="border-l border-r border-[#F48232] p-1 text-[#F48232]">Toute catégorie</td>
                  <td className="border-r border-[#F48232] p-1">
                    <div className="flex justify-center">
                      <div className={`w-6 h-4 border border-black ${contrat.garantie_deces_iad ? 'bg-black' : 'bg-white'}`}></div>
                    </div>
                  </td>
                  <td className="border-r border-[#F48232] p-1 text-[#F48232] font-bold">1,00%</td>
                  <td className="p-1 bg-gray-200 text-gray-500">N/A</td>
                </tr>
                {/* Perte d'emploi */}
                <tr className={`${contrat.garantie_perte_emploi ? 'bg-orange-50' : ''}`}>
                  <td className="p-1 text-left pl-2 font-medium bg-gray-100">Perte d'emploi ou d'activités (garantie optionnelle)</td>
                  <td className="border-l border-r border-[#F48232] p-1 text-[#F48232] leading-tight">Salariés du Privé<br/>& Commerçants</td>
                  <td className="border-r border-[#F48232] p-1">
                    <div className="flex justify-center">
                      <div className={`w-6 h-4 border border-black ${contrat.garantie_perte_emploi ? 'bg-black' : 'bg-white'}`}></div>
                    </div>
                  </td>
                  <td className="border-r border-[#F48232] p-1 text-[#F48232] font-bold">1,50%</td>
                  <td className="p-1 bg-gray-200 text-gray-500">N/A</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section: Cotisations */}
        <div className="flex bg-orange-50/50">
          <div className="w-28 flex-shrink-0 p-1.5 bg-orange-50 italic border-r border-[#F48232] flex items-center text-xs">
            Cotisations
          </div>
          <div className="flex-grow p-2">
            <div className="font-bold flex items-end">
              <span className="text-xs">Cotisation totale :</span>
              <span className="flex-grow mx-2 border-b-2 border-black text-center font-extrabold text-[#F48232] text-base">
                {cotisationTotale > 0 ? formatCurrency(cotisationTotale) : '___________'}
              </span>
              <span className="text-[10px]">FCFA TTC (Montant prêt x taux) + 10.000 FCFA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footnotes */}
      <div className="mt-2 space-y-0.5 text-[9px] text-black font-bold">
        <p>(1) La Prévoyance est d'un montant maximal de 250.000 FCFA et pour une durée égale à la durée du prêt accordé à l'Assuré.</p>
        <p>(2) Le montant maximal du prêt couvert est de FCFA 5.000.000 pour une durée de 48 mois.</p>
        <p>(3) La durée maximale d'indemnisation pour la garantie Perte d'emploi ou d'Activités est de 06 mois pour un montant maximal de couverture de FCFA 2.500.000.</p>
      </div>

      {/* Signatures */}
      <div className="mt-auto mb-2">
        <div className="text-right mb-2 pr-8 font-medium text-[10px]">
          Fait à <span className="border-b border-black px-2 mx-1 font-semibold">{contrat.lieu_signature || 'Libreville'}</span>, 
          le <span className="border-b border-black px-2 mx-1 font-semibold">{formatDate(contrat.date_signature || contrat.created_at)}</span>
        </div>

        <div className="flex justify-between px-4">
          <div className="w-[30%]">
            <div className="mb-1 font-bold text-xs">Le Souscripteur</div>
            <div className="border border-black h-16 p-0.5 text-gray-300 font-bold text-center flex items-center justify-center text-[9px] bg-white shadow-sm">
              {contrat.signature_souscripteur ? (
                <span className="text-green-600">✓ Signé</span>
              ) : (
                'Signature et cachet'
              )}
            </div>
          </div>

          <div className="w-[35%] flex flex-col items-center justify-end pb-2 font-bold text-[9px] space-y-0.5">
            <div className="flex gap-4">
              <span>Feuillet 1 : Assuré</span>
              <span>Feuillet 2 : BAMBOO-EMF</span>
            </div>
            <div className="flex gap-4">
              <span>Feuillet 3 : SAMB'A</span>
              <span>Feuillet 4 : Souche</span>
            </div>
          </div>

          <div className="w-[30%]">
            <div className="mb-1 font-bold text-xs text-right">BAMBOO-EMF P/C de l'Assureur</div>
            <div className="border border-black h-16 p-0.5 text-gray-300 font-bold text-center flex items-center justify-center text-[9px] bg-white shadow-sm">
              {contrat.cachet_bamboo || contrat.signature_assureur ? (
                <span className="text-green-600">✓ Validé</span>
              ) : (
                'Signature et cachet'
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default BambooContratPrint
