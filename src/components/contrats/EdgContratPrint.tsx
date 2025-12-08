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
    {label && <span className="mr-1 whitespace-nowrap text-[11px] text-gray-800">{label}</span>}
    <div className={`flex-grow border-b-2 border-gray-400 text-[11px] px-1 py-0.5 min-h-[22px] font-semibold ${className}`}>
      {value || ''}
    </div>
  </div>
)

// --- Checkbox Component (Display only) ---
const Checkbox: React.FC<{ label: string; checked?: boolean }> = ({ label, checked }) => (
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

// --- Main Print Component ---
interface EdgContratPrintProps {
  contrat: EdgContratData
}

export const EdgContratPrint: React.FC<EdgContratPrintProps> = ({ contrat }) => {
  // Debug log pour voir les données reçues
  console.log('🖨️ EdgContratPrint - Contrat reçu:', contrat)
  console.log('🖨️ EdgContratPrint - assures_associes:', contrat.assures_associes)
  console.log('🖨️ EdgContratPrint - assuresAssocies:', (contrat as any).assuresAssocies)
  
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
  
  // Calcul cotisation
  const cotisationPrevoyance = contrat.garantie_prevoyance !== false ? 25000 : 0
  const tauxDeces = isVip ? 0.035 : 0.025
  const cotisationDeces = (contrat.garantie_deces_iad !== false || contrat.garantie_deces) ? montant * tauxDeces : 0
  const cotisationTotale = contrat.cotisation_totale_ttc || contrat.cotisation_totale || contrat.prime_totale || (cotisationPrevoyance + cotisationDeces)
  
  // Assurés associés - gérer les deux noms possibles (snake_case et camelCase)
  // Et aussi le cas où ils sont indexés par numero_ordre
  const rawAssuresAssocies = contrat.assures_associes || (contrat as any).assuresAssocies || []
  const assuresAssocies: AssureAssocie[] = Array.isArray(rawAssuresAssocies) ? rawAssuresAssocies : []
  
  console.log('🖨️ EdgContratPrint - Assurés associés extraits:', assuresAssocies)
  
  // Trouver les assurés par leur numéro d'ordre ou type_assure
  const findAssure = (index: number): AssureAssocie => {
    // Chercher par numero_ordre
    const byNumeroOrdre = assuresAssocies.find(a => a.numero_ordre === index)
    if (byNumeroOrdre) return byNumeroOrdre
    
    // Chercher par type_assure contenant le numéro
    const byTypeAssure = assuresAssocies.find(a => a.type_assure?.includes(String(index)))
    if (byTypeAssure) return byTypeAssure
    
    // Sinon retourner l'élément à l'index (index - 1 car tableau 0-indexed)
    return assuresAssocies[index - 1] || {}
  }
  
  const assure1 = findAssure(1)
  const assure2 = findAssure(2)
  const assure3 = findAssure(3)
  
  console.log('🖨️ EdgContratPrint - Assuré 1:', assure1)
  console.log('🖨️ EdgContratPrint - Assuré 2:', assure2)
  console.log('🖨️ EdgContratPrint - Assuré 3:', assure3)
  
  // Catégories
  const categories = [
    { key: 'commercants', label: 'Commerçants' },
    { key: 'salaries_public', label: 'Salariés du public' },
    { key: 'salaries_prive', label: 'Salariés du privé' },
    { key: 'retraites', label: 'Retraités' },
  ]
  
  const selectedCategorie = contrat.categorie?.toLowerCase() || ''

  return (
    <div className="bg-white w-[210mm] min-h-[297mm] p-[6mm] shadow-xl relative flex flex-col mx-auto print:shadow-none print:p-[5mm]">
      
      {/* Header */}
      <div className="flex flex-col items-center mb-2">
        <div className="mb-0">
          <img src={logoSamba} alt="SAMB'A Assurances" className="h-[85px] w-auto" />
        </div>
        <h1 className="text-[#F48232] text-base font-bold uppercase text-center leading-none mt-1">
          Contrat Prévoyance Crédits EDG
        </h1>
        <p className="text-[8px] text-gray-500">Contrat régi par les dispositions du Code des assurances CIMA</p>
        <div className="text-[9px] font-bold text-gray-700 leading-tight">
          Visas DNA N°005/24 et N°008/24 - Convention N° : 501/111.112/0624
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
            <FormInput 
              label="Montant du prêt assuré :" 
              value={montant ? formatCurrency(montant) : ''}
            />
            <FormInput 
              label="Durée du prêt :" 
              value={duree ? `${duree} mois` : ''}
            />
            <FormInput 
              label="Date d'effet :" 
              value={formatDate(contrat.date_effet)}
            />
            <FormInput 
              label="Date de fin d'échéance :" 
              value={formatDate(dateEcheance)}
            />
          </div>
        </div>

        {/* Section: Assuré principal */}
        <div className="flex border-b border-[#F48232]">
          <div className="w-28 flex-shrink-0 p-1.5 bg-orange-50 italic border-r border-[#F48232] flex flex-col justify-center text-xs">
            Assuré principal<br/>
            <span className="text-[9px] not-italic">Personne assurée</span>
          </div>
          <div className="flex-grow p-1.5 space-y-1">
            <FormInput label="Nom & Prénom :" value={contrat.nom_prenom} />
            <FormInput label="Adresse :" value={adresse} />
            <div className="flex gap-2">
              <FormInput label="Téléphone :" value={telephone} />
              <FormInput label="Ville :" value={ville} />
              <FormInput label="Email:" value={email} />
            </div>
            <div className="flex flex-wrap items-center mt-1 gap-y-1">
              <span className="mr-1 text-xs">Catégorie :</span>
              {categories.map(cat => (
                <Checkbox 
                  key={cat.key} 
                  label={cat.label} 
                  checked={selectedCategorie === cat.key}
                />
              ))}
            </div>
            <div className="flex items-center gap-4">
              <Checkbox 
                label="Autre à préciser :" 
                checked={selectedCategorie === 'autre'}
              />
              <span className="border-b border-gray-400 w-32 text-xs font-semibold">
                {selectedCategorie === 'autre' ? (contrat.autre_categorie_precision || '') : ''}
              </span>
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
              <span className="font-bold text-xs">EPARGNE ET DEVELOPPEMENT DU GABON « EDG »</span>
            </div>
            <div className="flex gap-2">
              <div className="flex items-end flex-grow">
                <span className="mr-1 whitespace-nowrap text-xs">Adresse :</span>
                <span className="font-bold mr-2 text-xs">B.P. 14.736 Libreville - Gabon</span>
              </div>
              <FormInput label="Agence :" value={contrat.agence} className="w-32" />
            </div>
            <div className="flex items-end">
              <span className="mr-1 text-xs">Téléphone :</span>
              <span className="font-bold text-xs mr-4">065 08 05 69 / 65 02 81 97</span>
              <span className="mr-1 text-xs">Email :</span>
              <span className="font-bold text-xs">service.clientele@edgmfgabon.com</span>
            </div>
          </div>
        </div>

        {/* Section: Assurés associés */}
        <div className="flex border-b border-[#F48232]">
          <div className="w-28 flex-shrink-0 p-1.5 bg-orange-50 italic border-r border-[#F48232] flex items-center text-xs">
            Assurés associés
          </div>
          <div className="flex-grow">
            <table className="w-full text-left text-[10px] border-collapse">
              <thead>
                <tr className="bg-orange-100 font-bold text-center">
                  <th className="border-b border-r border-[#F48232] p-0.5 w-24">Assurés</th>
                  <th className="border-b border-r border-[#F48232] p-0.5">Nom</th>
                  <th className="border-b border-r border-[#F48232] p-0.5">Prénom</th>
                  <th className="border-b border-r border-[#F48232] p-0.5 w-20">Date naissance</th>
                  <th className="border-b border-r border-[#F48232] p-0.5 w-16">Lieu naissance</th>
                  <th className="border-b border-[#F48232] p-0.5 w-24">Contact & Adresse</th>
                </tr>
              </thead>
              <tbody>
                <tr className="h-6">
                  <td className="border-b border-r border-[#F48232] p-0.5 font-bold bg-orange-50/50">Assuré associé 1</td>
                  <td className="border-b border-r border-[#F48232] p-0.5 font-semibold">{assure1.nom || ''}</td>
                  <td className="border-b border-r border-[#F48232] p-0.5 font-semibold">{assure1.prenom || ''}</td>
                  <td className="border-b border-r border-[#F48232] p-0.5 font-semibold">{formatDate(assure1.date_naissance)}</td>
                  <td className="border-b border-r border-[#F48232] p-0.5 font-semibold">{assure1.lieu_naissance || ''}</td>
                  <td className="border-b border-[#F48232] p-0.5 font-semibold text-[9px]">{assure1.contact || ''}</td>
                </tr>
                <tr className="h-6">
                  <td className="border-b border-r border-[#F48232] p-0.5 font-bold bg-orange-50/50">Assuré associé 2</td>
                  <td className="border-b border-r border-[#F48232] p-0.5 font-semibold">{assure2.nom || ''}</td>
                  <td className="border-b border-r border-[#F48232] p-0.5 font-semibold">{assure2.prenom || ''}</td>
                  <td className="border-b border-r border-[#F48232] p-0.5 font-semibold">{formatDate(assure2.date_naissance)}</td>
                  <td className="border-b border-r border-[#F48232] p-0.5 font-semibold">{assure2.lieu_naissance || ''}</td>
                  <td className="border-b border-[#F48232] p-0.5 font-semibold text-[9px]">{assure2.contact || ''}</td>
                </tr>
                <tr className="h-6">
                  <td className="border-b border-r border-[#F48232] p-0.5 font-bold bg-orange-50/50">Assuré associé 3</td>
                  <td className="border-b border-r border-[#F48232] p-0.5 font-semibold">{assure3.nom || ''}</td>
                  <td className="border-b border-r border-[#F48232] p-0.5 font-semibold">{assure3.prenom || ''}</td>
                  <td className="border-b border-r border-[#F48232] p-0.5 font-semibold">{formatDate(assure3.date_naissance)}</td>
                  <td className="border-b border-r border-[#F48232] p-0.5 font-semibold">{assure3.lieu_naissance || ''}</td>
                  <td className="border-b border-[#F48232] p-0.5 font-semibold text-[9px]">{assure3.contact || ''}</td>
                </tr>
                {/* Bénéficiaire décès */}
                <tr className="h-7">
                  <td colSpan={6} className="p-1.5">
                    <div className="flex items-end">
                      <span className="font-bold text-xs mr-2 whitespace-nowrap">Bénéficiaire en cas de décès de l'Assuré principal :</span>
                      <span className="flex-grow border-b border-gray-400 text-[10px] font-semibold px-1">
                        {contrat.beneficiaire_deces || ''}
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
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
                  <th className="p-1 w-[40%] text-left pl-2">Protections</th>
                  <th className="border-l border-r border-[#F48232] p-1 w-[20%]">Type de cible</th>
                  <th className="border-r border-[#F48232] p-1 w-[10%]">Option</th>
                  <th className="border-r border-[#F48232] p-1 w-[10%]">Taux</th>
                  <th className="p-1 w-[20%]">Prime unique</th>
                </tr>
              </thead>
              <tbody>
                {/* Prévoyance */}
                <tr className={`border-b border-[#F48232] ${contrat.garantie_prevoyance !== false ? 'bg-orange-50' : ''}`}>
                  <td className="p-1 text-left pl-2 font-medium bg-gray-100">Prévoyance</td>
                  <td className="border-l border-r border-[#F48232] p-1 text-[#F48232]">Toute catégorie</td>
                  <td className="border-r border-[#F48232] p-1">
                    <div className="flex justify-center">
                      <div className={`w-6 h-4 border border-black rounded-sm ${contrat.garantie_prevoyance !== false ? 'bg-black' : 'bg-white'}`}></div>
                    </div>
                  </td>
                  <td className="border-r border-[#F48232] p-1 text-[#F48232]">N/A</td>
                  <td className="p-1 text-[#F48232] font-bold">25 000 FCFA</td>
                </tr>
                {/* Assurance Crédits Décès/IAD Standard */}
                <tr className={`border-b border-[#F48232] ${!isVip && (contrat.garantie_deces_iad || contrat.garantie_deces) ? 'bg-orange-50' : ''}`}>
                  <td className="p-1 text-left pl-2 font-medium bg-gray-100">Assurance Crédits Décès/IAD</td>
                  <td className="border-l border-r border-[#F48232] p-1 text-[#F48232]">Toute catégorie</td>
                  <td className="border-r border-[#F48232] p-1">
                    <div className="flex justify-center">
                      <div className={`w-6 h-4 border border-black rounded-sm ${!isVip && (contrat.garantie_deces_iad || contrat.garantie_deces) ? 'bg-black' : 'bg-white'}`}></div>
                    </div>
                  </td>
                  <td className="border-r border-[#F48232] p-1 text-[#F48232] font-bold">2,50%</td>
                  <td className="p-1 text-[#F48232]">N/A</td>
                </tr>
                {/* Assurance Crédits Décès/IAD VIP */}
                <tr className={`${isVip ? 'bg-orange-50' : ''}`}>
                  <td className="p-1 text-left pl-2 font-medium bg-gray-100">Assurance Crédits Décès/IAD - VIP</td>
                  <td className="border-l border-r border-[#F48232] p-1 text-[#F48232] font-bold">VIP</td>
                  <td className="border-r border-[#F48232] p-1">
                    <div className="flex justify-center">
                      <div className={`w-6 h-4 border border-black rounded-sm ${isVip ? 'bg-black' : 'bg-white'}`}></div>
                    </div>
                  </td>
                  <td className="border-r border-[#F48232] p-1 text-[#F48232] font-bold">3,50%</td>
                  <td className="p-1 text-[#F48232]">N/A</td>
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
              <span className="text-[10px]">FCFA TTC (Montant prêt x taux) + Cotisation Prévoyance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footnotes */}
      <div className="mt-2 space-y-0.5 text-[9px] text-black font-bold">
        <p>(1) La Prévoyance est d'un capital maximal de 1.000.000 FCFA, soit FCFA 250.000 par assuré.</p>
        <p>(2) Le montant maximal du prêt couvert est de 65.000.000 FCFA pour les VIP et de 25.000.000 FCFA pour les autres catégories.</p>
        <p>(3) La durée maximale de couverture est de 36 mois pour les VIP et de 60 mois pour les autres catégories.</p>
        <p>(4) Âge maximum de couverture : 70 ans.</p>
      </div>

      {/* Signatures */}
      <div className="mt-auto mb-2">
        <div className="text-right mb-2 pr-8 font-medium text-[10px]">
          Fait à <span className="border-b border-black px-2 mx-1 font-semibold">{contrat.lieu_signature || 'Libreville'}</span>, 
          le <span className="border-b border-black px-2 mx-1 font-semibold">
            {contrat.date_signature 
              ? formatDate(contrat.date_signature) 
              : contrat.created_at 
                ? formatDate(contrat.created_at)
                : formatDate(new Date().toISOString())}
          </span>
        </div>

        <div className="flex justify-between px-4">
          <div className="w-[30%]">
            <div className="mb-1 font-bold text-xs">L'Assuré</div>
            <div className="border border-black h-16 p-0.5 text-gray-300 font-bold text-center flex items-center justify-center text-[9px] bg-white">
              Signature
            </div>
          </div>

          <div className="w-[35%] flex flex-col items-center justify-end pb-2 font-bold text-[9px] space-y-0.5">
            <div className="flex gap-6">
              <span>Feuillet 1 : Assuré</span>
              <span>Feuillet 2 : EDG</span>
            </div>
            <div className="flex gap-6">
              <span>Feuillet 3 : SAMB'A</span>
              <span>Feuillet 4 : Souche</span>
            </div>
          </div>

          <div className="w-[30%]">
            <div className="mb-1 font-bold text-xs text-right">Le Souscripteur EDG P/C L'Assureur</div>
            <div className="border border-black h-16 p-0.5 text-gray-300 font-bold text-center flex items-center justify-center text-[9px] bg-white">
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
