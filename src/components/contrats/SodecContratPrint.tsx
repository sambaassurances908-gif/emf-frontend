// src/components/contrats/SodecContratPrint.tsx
import React from 'react'
import { Mail, Phone, MapPin } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import logoSamba from '@/assets/logo-samba.png'

// Types
interface SodecContratData {
  id: number
  numero_police?: string
  numero_convention?: string
  nom_prenom?: string
  adresse_assure?: string
  ville_assure?: string
  telephone_assure?: string
  email_assure?: string
  montant_pret_assure?: number
  duree_pret_mois?: number
  date_effet?: string
  date_fin_echeance?: string
  option_prevoyance?: string
  garantie_perte_emploi?: boolean
  garantie_prevoyance?: boolean
  garantie_deces_iad?: boolean
  cotisation_totale?: number
  cotisation_totale_ttc?: number
  categorie?: string  // Le backend envoie 'categorie' pas 'categorie_assure'
  agence?: string
  assures_associes?: AssureAssocie[]
  beneficiaire_deces?: string
  beneficiaire_deces_nom?: string
  beneficiaire_deces_prenom?: string
  beneficiaire_nom?: string
  beneficiaire_prenom?: string
  beneficiaire_date_naissance?: string
  beneficiaire_lieu_naissance?: string
  beneficiaire_contact?: string
  lieu_signature?: string
  date_signature?: string
  created_at?: string  // Date d'émission du contrat
  [key: string]: any
}

interface AssureAssocie {
  id?: number
  type_assure?: string
  nom?: string
  prenom?: string
  date_naissance?: string
  lieu_naissance?: string
  contact?: string
  adresse?: string
}

// --- Logo Component ---
const Logo: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center mb-0">
      <img 
        src={logoSamba} 
        alt="SAMB'A Assurances" 
        className="h-[85px] w-auto"
      />
    </div>
  )
}

// --- Form Input Component ---
interface FormInputProps {
  label?: string
  value?: string | number | null
  className?: string
}

const FormInput: React.FC<FormInputProps> = ({ label, value, className = "" }) => (
  <div className="flex items-end w-full">
    {label && <span className="mr-1 whitespace-nowrap text-xs text-gray-800">{label}</span>}
    <div className={`flex-grow border-b border-gray-400 text-xs px-1 py-0 min-h-[18px] font-semibold ${className}`}>
      {value || ''}
    </div>
  </div>
)

// --- Checkbox Component ---
const Checkbox: React.FC<{ label: string; checked?: boolean }> = ({ label, checked }) => (
  <div className="flex items-center mr-3">
    <div className={`w-4 h-4 border border-black mr-1 flex items-center justify-center ${checked ? 'bg-black' : 'bg-white'}`}>
      {checked && <div className="w-2 h-2 bg-white" />}
    </div>
    <span className="text-[10px] text-gray-800">{label}</span>
  </div>
)

// --- Footer Component ---
const Footer: React.FC<{ pageNum?: number }> = ({ pageNum = 1 }) => {
  return (
    <div className="mt-auto pt-1 text-center text-[7px] print:text-[6px] text-gray-600 space-y-0 leading-tight">
      <div className="font-bold uppercase text-black text-[8px] print:text-[7px]">SAMB'A ASSURANCES GABON S.A.</div>
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
      
      <div className="flex justify-between items-start border-t border-gray-300 pt-0.5 px-2 relative">
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
        <div className="absolute right-2 -bottom-1 border border-black px-1.5 py-0 font-bold text-[9px] bg-white">
          {pageNum}
        </div>
      </div>
    </div>
  )
}

// --- Main Print Component ---
interface SodecContratPrintProps {
  contrat: SodecContratData
}

export const SodecContratPrint: React.FC<SodecContratPrintProps> = ({ contrat }) => {
  const assuresAssocies = contrat.assures_associes || []
  
  // Trouver les assurés par type
  const conjoint = assuresAssocies.find(a => a.type_assure?.toLowerCase().includes('conjoint'))
  const enfants = assuresAssocies.filter(a => a.type_assure?.toLowerCase().includes('enfant')).slice(0, 4)
  
  // Remplir les enfants manquants
  while (enfants.length < 4) {
    enfants.push({ type_assure: `Enfant ${enfants.length + 1}` })
  }

  // Catégories avec les clés exactes du backend
  const categories = [
    { key: 'commercants', label: 'Commerçants' },
    { key: 'salaries_public', label: 'Salariés du public' },
    { key: 'salaries_prive', label: 'Salariés du privé' },
    { key: 'retraites', label: 'Retraités' },
  ]
  
  // Déterminer quelle catégorie est sélectionnée
  const selectedCategorie = contrat.categorie?.toLowerCase() || ''
  
  // Vérifier si c'est Option A ou Option B
  const isOptionA = contrat.option_prevoyance?.toLowerCase() === 'option_a'
  const isOptionB = contrat.option_prevoyance?.toLowerCase() === 'option_b'
  
  // Extraire le bénéficiaire (peut être un string complet ou séparé)
  // Priorité: beneficiaire_nom > beneficiaire_deces_nom > split de beneficiaire_deces
  const beneficiaireNom = contrat.beneficiaire_nom || contrat.beneficiaire_deces_nom || contrat.beneficiaire_deces?.split(' ')[0] || ''
  const beneficiairePrenom = contrat.beneficiaire_prenom || contrat.beneficiaire_deces_prenom || contrat.beneficiaire_deces?.split(' ').slice(1).join(' ') || ''
  const beneficiaireDateNaissance = contrat.beneficiaire_date_naissance || ''
  const beneficiaireLieuNaissance = contrat.beneficiaire_lieu_naissance || ''
  const beneficiaireContact = contrat.beneficiaire_contact || ''

  return (
    <div className="bg-white w-[210mm] h-[297mm] p-[6mm] shadow-xl relative flex flex-col mx-auto print:shadow-none print:p-[5mm] print:h-[297mm] overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col items-center mb-0">
        <Logo />
        <h1 className="text-[#F48232] text-base font-bold uppercase text-center leading-none">
          Contrat Prévoyance Crédits SODEC
        </h1>
        <p className="text-[8px] text-gray-500">Contrat régi par les dispositions du Code des assurances CIMA</p>
        <div className="text-[9px] font-bold text-gray-700 leading-tight">
          Visas DNA N°005/24 et N°008/24
        </div>
        <div className="text-[9px] font-bold text-gray-700 leading-tight">
          Convention N° : {contrat.numero_convention || '502.111.112/0125'}
        </div>
        <h2 className="text-[#F48232] text-sm font-bold uppercase">
          Conditions Particulières
        </h2>
      </div>

      {/* Form Body - Table Structure */}
      <div className="border border-[#F48232] w-full flex flex-col text-[10px] print:text-[9px]">
        
        {/* Section: Couverture */}
        <div className="flex border-b border-[#F48232]">
          <div className="w-24 flex-shrink-0 p-1.5 bg-orange-50 italic border-r border-[#F48232] flex items-center text-xs">
            Couverture
          </div>
          <div className="flex-grow p-1.5 grid grid-cols-2 gap-x-4 gap-y-1">
            <FormInput label="Numéro de police :" value={contrat.numero_police} />
            <FormInput label="Date d'émission :" value={formatDate(contrat.created_at)} />
            <FormInput label="Montant du prêt assuré :" value={contrat.montant_pret_assure ? formatCurrency(contrat.montant_pret_assure) : ''} />
            <FormInput label="Durée du prêt :" value={contrat.duree_pret_mois ? `${contrat.duree_pret_mois} mois` : ''} />
            <FormInput label="Date d'effet :" value={formatDate(contrat.date_effet)} />
            <FormInput label="Date de fin d'échéance :" value={formatDate(contrat.date_fin_echeance)} />
          </div>
        </div>

        {/* Section: Assuré principal */}
        <div className="flex border-b border-[#F48232]">
          <div className="w-24 flex-shrink-0 p-1.5 bg-orange-50 italic border-r border-[#F48232] flex flex-col justify-center text-xs">
            Assuré principal<br/>
            <span className="text-[9px] not-italic">Personne assurée</span>
          </div>
          <div className="flex-grow p-1.5 space-y-1">
            <FormInput label="Nom & Prénom :" value={contrat.nom_prenom} />
            <div className="flex gap-2">
              <FormInput label="Adresse :" value={contrat.adresse_assure} className="flex-grow-[2]" />
              <FormInput label="Ville :" value={contrat.ville_assure} className="flex-grow-[1]" />
            </div>
            <div className="flex gap-2">
              <FormInput label="Téléphone :" value={contrat.telephone_assure} className="flex-grow-[1]" />
              <FormInput label="Email:" value={contrat.email_assure} className="flex-grow-[2]" />
            </div>
            <div className="flex flex-wrap items-center mt-1 gap-y-1">
              <span className="mr-1 text-xs">Catégorie :</span>
              {categories.map(cat => {
                const isChecked = selectedCategorie === cat.key
                return (
                  <Checkbox 
                    key={cat.key} 
                    label={cat.label} 
                    checked={isChecked} 
                  />
                )
              })}
              <div className="flex items-center ml-1">
                {(() => {
                  const isOther = selectedCategorie === 'autre'
                  return (
                    <>
                      <Checkbox label="Autre à préciser :" checked={isOther} />
                      <span className="border-b border-gray-400 w-24 ml-1 text-xs font-semibold">
                        {isOther ? (contrat.autre_categorie_precision || '') : ''}
                      </span>
                    </>
                  )
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Section: Souscripteur / EMF */}
        <div className="flex border-b border-[#F48232]">
          <div className="w-24 flex-shrink-0 p-1.5 bg-orange-50 italic border-r border-[#F48232] flex items-center text-xs">
            Souscripteur / EMF
          </div>
          <div className="flex-grow p-1.5 space-y-1">
            <FormInput label="Raison sociale :" value="SOCIETE D'EPARGNE ET DE CREDIT (SODEC)" />
            <FormInput label="Agence :" value={contrat.agence} />
            <div className="flex gap-2">
              <div className="flex items-end flex-grow">
                <span className="mr-1 whitespace-nowrap text-xs">Adresse :</span>
                <span className="font-bold mr-2 text-xs">B.P. 20.042</span>
                <span className="whitespace-nowrap mr-1 text-xs">Ville :</span>
                <span className="font-bold text-xs">Libreville – Gabon</span>
              </div>
              <div className="flex items-end">
                <span className="mr-1 text-xs">Téléphone :</span>
                <span className="font-bold text-xs">077 57 24 44 / 066 70 75 62</span>
              </div>
            </div>
            <div className="flex items-end">
              <span className="mr-1 text-xs">Email :</span>
              <span className="font-bold border-b border-gray-300 w-full text-xs">secretariatsodec@gmail.com</span>
            </div>
          </div>
        </div>

        {/* Section: Assurés associés */}
        <div className="flex border-b border-[#F48232]">
          <div className="w-24 flex-shrink-0 p-1.5 bg-orange-50 italic border-r border-[#F48232] flex items-center text-xs">
            Assurés associés
          </div>
          <div className="flex-grow">
            <table className="w-full text-left text-[10px] border-collapse">
              <thead>
                <tr className="bg-orange-100 font-bold text-center">
                  <th className="border-b border-r border-[#F48232] p-0.5 w-20">Assurés</th>
                  <th className="border-b border-r border-[#F48232] p-0.5">Nom</th>
                  <th className="border-b border-r border-[#F48232] p-0.5">Prénom</th>
                  <th className="border-b border-r border-[#F48232] p-0.5 w-16 leading-tight">Date de<br/>naissance</th>
                  <th className="border-b border-r border-[#F48232] p-0.5 w-16 leading-tight">Lieu de<br/>naissance</th>
                  <th className="border-b border-[#F48232] p-0.5 w-20 leading-tight">Contact &<br/>Adresse</th>
                </tr>
              </thead>
              <tbody>
                {/* Conjoint */}
                <tr className="h-5">
                  <td className="border-b border-r border-[#F48232] p-0.5 font-bold bg-orange-50/50">Conjoint (e)</td>
                  <td className="border-b border-r border-[#F48232] p-0.5 font-semibold">{conjoint?.nom || ''}</td>
                  <td className="border-b border-r border-[#F48232] p-0.5 font-semibold">{conjoint?.prenom || ''}</td>
                  <td className="border-b border-r border-[#F48232] p-0.5 font-semibold">{formatDate(conjoint?.date_naissance)}</td>
                  <td className="border-b border-r border-[#F48232] p-0.5 font-semibold">{conjoint?.lieu_naissance || ''}</td>
                  <td className="border-b border-[#F48232] p-0.5 font-semibold text-[9px]">{conjoint?.contact || ''}</td>
                </tr>
                
                {/* Enfants */}
                {enfants.map((enfant, idx) => (
                  <tr key={idx} className="h-5">
                    <td className="border-b border-r border-[#F48232] p-0.5 font-bold bg-orange-50/50">Enfant {idx + 1}</td>
                    <td className="border-b border-r border-[#F48232] p-0.5 font-semibold">{enfant?.nom || ''}</td>
                    <td className="border-b border-r border-[#F48232] p-0.5 font-semibold">{enfant?.prenom || ''}</td>
                    <td className="border-b border-r border-[#F48232] p-0.5 font-semibold">{formatDate(enfant?.date_naissance)}</td>
                    <td className="border-b border-r border-[#F48232] p-0.5 font-semibold">{enfant?.lieu_naissance || ''}</td>
                    <td className="border-b border-[#F48232] p-0.5 font-semibold text-[9px]">{enfant?.contact || ''}</td>
                  </tr>
                ))}
                
                {/* Bénéficiaire décès */}
                <tr className="h-7">
                  <td className="border-r border-[#F48232] p-0.5 font-bold bg-orange-50/50 align-top leading-tight text-[9px]">
                    Bénéficiaire en cas de décès...
                  </td>
                  <td className="border-r border-[#F48232] p-0.5 font-semibold">{beneficiaireNom}</td>
                  <td className="border-r border-[#F48232] p-0.5 font-semibold">{beneficiairePrenom}</td>
                  <td className="border-r border-[#F48232] p-0.5 font-semibold">{formatDate(beneficiaireDateNaissance)}</td>
                  <td className="border-r border-[#F48232] p-0.5 font-semibold">{beneficiaireLieuNaissance}</td>
                  <td className="p-0.5 font-semibold text-[9px]">{beneficiaireContact}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section: Garanties */}
        <div className="flex border-b border-[#F48232]">
          <div className="w-24 flex-shrink-0 p-1.5 bg-orange-50 italic border-r border-[#F48232] flex items-center text-xs">
            Garanties
          </div>
          <div className="flex-grow">
            <table className="w-full text-center text-[10px] border-collapse">
              <thead>
                <tr className="border-b border-[#F48232] font-bold">
                  <th className="p-0.5 w-1/3 text-left pl-2"></th>
                  <th className="border-l border-r border-[#F48232] p-0.5 w-24">Type de cible</th>
                  <th className="border-r border-[#F48232] p-0.5 w-12">Option</th>
                  <th className="border-r border-[#F48232] p-0.5 w-12">Taux</th>
                  <th className="p-0.5 w-16">Prime unique</th>
                </tr>
              </thead>
              <tbody>
                <tr className={`border-b border-[#F48232] ${isOptionA ? 'bg-orange-100' : 'bg-orange-50/30'}`}>
                  <td className="p-0.5 text-left pl-2">Option A : Protection Prévoyance<sup>1</sup> Décès - IAD<sup>2</sup></td>
                  <td className="border-l border-r border-[#F48232] p-0.5 text-[#F48232]">Toute catégorie</td>
                  <td className="border-r border-[#F48232] p-0.5">
                    <div className="flex justify-center">
                      <div className={`w-5 h-3 border-2 border-black ${isOptionA ? 'bg-black' : 'bg-white'}`}></div>
                    </div>
                  </td>
                  <td className="border-r border-[#F48232] p-0.5 text-[#F48232]">N/A</td>
                  <td className={`p-0.5 font-bold ${isOptionA ? 'text-black bg-yellow-200' : 'text-[#F48232]'}`}>30 000</td>
                </tr>
                <tr className={`border-b border-[#F48232] ${isOptionB ? 'bg-orange-100' : ''}`}>
                  <td className="p-0.5 text-left pl-2">Option B : Protection Prévoyance Décès - IAD</td>
                  <td className="border-l border-r border-[#F48232] p-0.5 text-[#F48232]">Toute catégorie</td>
                  <td className="border-r border-[#F48232] p-0.5">
                    <div className="flex justify-center">
                      <div className={`w-5 h-3 border-2 border-black ${isOptionB ? 'bg-black' : 'bg-white'}`}></div>
                    </div>
                  </td>
                  <td className="border-r border-[#F48232] p-0.5 text-[#F48232]">N/A</td>
                  <td className={`p-0.5 font-bold ${isOptionB ? 'text-black bg-yellow-200' : 'text-[#F48232]'}`}>15 000</td>
                </tr>
                <tr className="border-b border-[#F48232]">
                  <td className="p-0.5 text-left pl-2">Décès – invalidité absolue et définitive (IAD)</td>
                  <td className="border-l border-r border-[#F48232] p-0.5 text-[#F48232]">Toute catégorie</td>
                  <td className="border-r border-[#F48232] p-0.5">
                    <div className="flex justify-center">
                      <div className="w-5 h-3 bg-black border border-black rounded-full"></div>
                    </div>
                  </td>
                  <td className="border-r border-[#F48232] p-0.5 text-[#F48232]">1,50%</td>
                  <td className="p-0.5 text-[#F48232]">N/A</td>
                </tr>
                <tr>
                  <td className="p-0.5 text-left pl-2">Perte d'emploi ou d'activités (garantie optionnelle)</td>
                  <td className="border-l border-r border-[#F48232] p-0.5 text-[#F48232] leading-tight">Salariés du Privé<br/>& Commerçants</td>
                  <td className="border-r border-[#F48232] p-0.5">
                    <div className="flex justify-center items-center">
                      <div className={`w-5 h-3 border border-black ${contrat.garantie_perte_emploi ? 'bg-black' : ''}`}></div>
                    </div>
                  </td>
                  <td className="border-r border-[#F48232] p-0.5 text-[#F48232]">2,50%</td>
                  <td className="p-0.5 text-[#F48232]">N/A</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section: Cotisations */}
        <div className="flex bg-orange-50/50">
          <div className="w-24 flex-shrink-0 p-1.5 bg-orange-50 italic border-r border-[#F48232] flex items-center text-xs">
            Cotisations
          </div>
          <div className="flex-grow p-2">
            <div className="font-bold flex items-end">
              <span className="text-xs">Cotisation totale :</span>
              <span className="flex-grow mx-2 border-b-2 border-black text-center font-extrabold text-lg">
                {contrat.cotisation_totale_ttc 
                  ? formatCurrency(Number(contrat.cotisation_totale_ttc)) 
                  : contrat.cotisation_totale 
                    ? formatCurrency(Number(contrat.cotisation_totale))
                    : ''}
              </span>
              <span className="text-[10px]">FCFA TTC (Montant prêt x taux) + Cotisation Prévoyance ({isOptionA ? 'Option A' : isOptionB ? 'Option B' : 'A ou B'})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Legal List & Footnotes */}
      <div className="mt-1 space-y-0.5 text-[8px] text-gray-700 print:text-[7px] print:mt-0.5">
        <div className="italic">
          <p className="mb-0.5">
            <sup>1</sup> La Prévoyance décès prévoit en cas de décès ou d'IAD d'un membre de la famille, l'Assureur verse un capital forfaitaire :
            <span className="font-semibold mx-1">Option A:</span> 500 000 FCFA/adulte, 250 000 FCFA/enfant.
            <span className="font-semibold mx-1">Option B:</span> 250 000 FCFA/adulte, 125 000 FCFA/enfant.
          </p>
          <p>
            <sup>2</sup> L'IAD est reconnue si l'Assuré est définitivement incapable de se livrer à la moindre occupation et nécessite l'assistance d'une tierce personne.
          </p>
        </div>
        
        <div className="font-bold text-black grid grid-cols-1 gap-0.5 mt-1">
          <div className="flex"><span className="mr-1">(1)</span><p>La Prévoyance décès est d'un montant maximal de 2.000.000 FCFA (Option A) et 1.000.000 FCFA (Option B).</p></div>
          <div className="flex"><span className="mr-1">(2)</span><p>Le montant maximal du prêt couvert est de FCFA 5.000.000 (retraités) et FCFA 20.000.000 (autres).</p></div>
          <div className="flex"><span className="mr-1">(3)</span><p>Durée maximale décès : 36 mois (retraités), 72 mois (autres).</p></div>
          <div className="flex"><span className="mr-1">(4)</span><p>Perte d'emploi : durée max indemnisation 12 mois, couverture max 5.000.000 FCFA, durée couverture max 48 mois.</p></div>
        </div>
      </div>

      {/* Signatures */}
      <div className="mt-1 mb-0">
        <div className="text-right mb-0.5 pr-8 font-medium text-[9px]">
          Fait à <span className="border-b border-black px-2 mx-1 font-semibold">{contrat.lieu_signature || 'Libreville'}</span>, 
          le <span className="border-b border-black px-2 mx-1 font-semibold">
            {contrat.date_signature 
              ? formatDate(contrat.date_signature) 
              : contrat.created_at 
                ? formatDate(contrat.created_at)
                : formatDate(new Date().toISOString())}
          </span>
        </div>

        <div className="flex justify-between px-2 text-[9px]">
          <div className="w-1/3">
            <div className="mb-0.5 font-medium">Le Souscripteur</div>
            <div className="border border-black h-10 p-0.5 text-gray-300 font-bold text-center flex items-center justify-center text-[8px]">
              Signature et cachet
            </div>
          </div>

          <div className="w-1/3"></div>

          <div className="w-1/3">
            <div className="mb-0.5 font-medium text-right">Le Souscripteur P/C L'Assureur</div>
            <div className="border border-black h-10 p-0.5 text-gray-300 font-bold text-center flex items-center justify-center text-[8px]">
              Signature et cachet
            </div>
          </div>
        </div>
      </div>

      <Footer pageNum={1} />
    </div>
  )
}

export default SodecContratPrint
