// src/features/contrats/finam/FinamContratPrintPage.tsx
import { useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useReactToPrint } from 'react-to-print'
import { ArrowLeft, Printer, Download } from 'lucide-react'
import { useFinamContract } from '@/hooks/useFinamContracts'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatCurrency, formatDate } from '@/lib/utils'
import { FINAM_CONSTANTS } from '@/types/finam'

// Logo SAMB'A
const SambaLogo = () => (
  <div className="flex flex-col items-center justify-center w-24">
    <div className="relative w-14 h-14 mb-1">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path d="M50 90 Q10 50 50 10 Q90 50 50 90" fill="none" stroke="#F48232" strokeWidth="2" />
        <path d="M30 40 Q40 10 60 30" stroke="#8DC63F" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M40 50 Q50 20 70 40" stroke="#009444" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M25 60 Q45 80 75 55" stroke="#005C94" strokeWidth="8" fill="none" strokeLinecap="round" />
        <circle cx="65" cy="25" r="5" fill="#F48232" />
      </svg>
    </div>
    <h1 className="font-bold text-xl leading-none text-black tracking-tight">SAMB'A</h1>
    <span className="text-[0.6rem] font-semibold tracking-widest text-black">ASSURANCES</span>
  </div>
)

// Checkbox component
const Checkbox = ({ label, checked }: { label: string; checked?: boolean }) => (
  <div className="flex items-center mr-4">
    <div className={`w-4 h-4 border border-black mr-2 flex items-center justify-center ${checked ? 'bg-black' : 'bg-white'}`}>
      {checked && <div className="w-2 h-2 bg-white" />}
    </div>
    <span className="text-[10px] text-gray-800">{label}</span>
  </div>
)

// Section Label
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="w-40 flex-shrink-0 p-2 bg-gray-50 italic border-r border-gray-300 flex items-center text-[11px] text-gray-700">
    {children}
  </div>
)

// Footer
const Footer = ({ pageNum }: { pageNum: number }) => (
  <div className="mt-auto pt-6 text-center text-[8px] text-gray-600 space-y-1 leading-tight border-t border-gray-200">
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
    
    <div className="flex justify-between items-start pt-3 px-8 relative">
      <div className="flex flex-col items-center w-1/3 text-center">
        <div className="font-semibold text-gray-700">326 Rue Jean-Baptiste NDENDE</div>
        <div>Avenue de COINTET | Centre-Ville | Libreville</div>
      </div>
      <div className="flex flex-col items-center w-1/3 text-center">
        <div className="font-semibold text-gray-700">B.P : 22 215 | Libreville | Gabon</div>
        <div>Email : infos@samba-assurances.com</div>
      </div>
      <div className="flex flex-col items-center w-1/3 text-center">
        <div className="font-semibold text-gray-700">(+241) 060 08 62 62 - 074 40 41 41</div>
        <div>074 40 51 51</div>
      </div>
      <div className="absolute right-0 bottom-0 border border-gray-400 px-2 py-0.5 font-bold text-xs">{pageNum}</div>
    </div>
  </div>
)

export const FinamContratPrintPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const printRef = useRef<HTMLDivElement>(null)
  const { data: contrat, isLoading, isError } = useFinamContract(Number(id))

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Contrat_FINAM_${contrat?.numero_police || id}`,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <LoadingSpinner size="lg" text="Chargement du contrat FINAM..." />
      </div>
    )
  }

  if (isError || !contrat) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-red-500 mb-4">Erreur lors du chargement du contrat</p>
          <button
            onClick={() => navigate('/contrats/finam')}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    )
  }

  const isPersonnel = contrat.categorie === 'Personnel FINAM'
  const taux = isPersonnel ? FINAM_CONSTANTS.PERSONNEL_TAUX : FINAM_CONSTANTS.RETRAITES_TAUX

  return (
    <div className="min-h-screen bg-gray-100 py-4">
      {/* Actions Bar */}
      <div className="max-w-[210mm] mx-auto mb-4 px-4 flex justify-between items-center print:hidden">
        <button
          onClick={() => navigate(`/contrats/finam/${id}`)}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:bg-gray-50"
        >
          <ArrowLeft size={18} />
          Retour au détail
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => handlePrint()}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg shadow hover:bg-orange-600"
          >
            <Printer size={18} />
            Imprimer
          </button>
        </div>
      </div>

      {/* A4 Document Container */}
      <div 
        ref={printRef}
        className="bg-white w-[210mm] min-h-[297mm] p-[10mm] shadow-2xl relative flex flex-col border border-gray-200 mx-auto print:shadow-none print:border-0"
      >
        {/* Header Section */}
        <div className="flex justify-between items-start mb-2">
          <SambaLogo />
          <div className="flex flex-col items-center flex-grow pt-4">
            <h1 className="text-[#005C94] text-xl font-bold uppercase text-center tracking-tight leading-none">
              CONTRAT DECES GROUPE EMPRUNTEUR : FINAM
            </h1>
            <p className="text-[10px] text-gray-500 italic mt-1 text-center">
              Contrat régi par les dispositions du Code des assurances CIMA<br/>
              Convention N° : 508.111/0824
            </p>
            <h2 className="text-black text-lg font-bold uppercase mt-3 tracking-widest border-b-2 border-black px-4">
              CONDITIONS PARTICULIERES
            </h2>
          </div>
          <div className="w-24 text-right">
            <span className="text-red-500 font-mono text-xl font-bold">
              {contrat.numero_police || String(contrat.id).padStart(7, '0')}
            </span>
          </div>
        </div>

        {/* Main Form Table */}
        <div className="border border-gray-400 w-full flex flex-col mt-4">
          
          {/* Section: Couverture */}
          <div className="flex border-b border-gray-300">
            <SectionLabel>Couverture</SectionLabel>
            <div className="flex-grow p-2 grid grid-cols-2 gap-x-4 gap-y-1">
              <div className="space-y-1">
                <div className="flex items-end">
                  <span className="mr-2 whitespace-nowrap text-[11px] text-gray-800">Numéro de police :</span>
                  <span className="flex-grow border-b border-gray-400 text-[11px] px-1 font-bold">{contrat.numero_police || 'En attente'}</span>
                </div>
                <div className="flex items-end">
                  <span className="mr-2 whitespace-nowrap text-[11px] text-gray-800">Montant à assurer :</span>
                  <span className="flex-grow border-b border-gray-400 text-[11px] px-1 font-bold">{formatCurrency(contrat.montant_a_assurer)}</span>
                </div>
                <div className="flex items-end">
                  <span className="mr-2 whitespace-nowrap text-[11px] text-gray-800">Date d'effet :</span>
                  <span className="flex-grow border-b border-gray-400 text-[11px] px-1 font-bold">{formatDate(contrat.date_effet)}</span>
                </div>
                <div className="flex items-end">
                  <span className="mr-2 whitespace-nowrap text-[11px] text-gray-800">Date de fin d'échéance :</span>
                  <span className="flex-grow border-b border-gray-400 text-[11px] px-1 font-bold">{formatDate(contrat.date_fin_echeance)}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-end">
                  <span className="mr-2 whitespace-nowrap text-[11px] text-gray-800">Durée du prêt :</span>
                  <span className="flex-grow border-b border-gray-400 text-[11px] px-1 font-bold">{contrat.duree_pret} mois</span>
                </div>
                <div className="flex items-end">
                  <span className="mr-2 whitespace-nowrap text-[11px] text-gray-800">Montant de la mensualité :</span>
                  <span className="flex-grow border-b border-gray-400 text-[11px] px-1 font-bold">{formatCurrency(contrat.montant_mensualite || 0)}</span>
                </div>
                <div className="flex items-end">
                  <span className="mr-2 whitespace-nowrap text-[11px] text-gray-800">Taux du prêt :</span>
                  <span className="flex-grow border-b border-gray-400 text-[11px] px-1 font-bold">{contrat.taux_pret || 0}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Souscripteur / Personne assurée */}
          <div className="flex border-b border-gray-300">
            <SectionLabel>
              Souscripteur<br/>/ Personne<br/>assurée
            </SectionLabel>
            <div className="flex-grow p-2 space-y-1">
              <div className="flex items-end">
                <span className="mr-2 whitespace-nowrap text-[11px] text-gray-800">Nom :</span>
                <span className="flex-grow border-b border-gray-400 text-[11px] px-1 font-bold">{contrat.nom}</span>
              </div>
              <div className="flex items-end">
                <span className="mr-2 whitespace-nowrap text-[11px] text-gray-800">Prénom :</span>
                <span className="flex-grow border-b border-gray-400 text-[11px] px-1 font-bold">{contrat.prenom}</span>
              </div>
              <div className="flex items-end">
                <span className="mr-2 whitespace-nowrap text-[11px] text-gray-800">Adresse :</span>
                <span className="flex-grow border-b border-gray-400 text-[11px] px-1 font-bold">{contrat.adresse || '-'}</span>
              </div>
              <div className="flex items-end">
                <span className="mr-2 whitespace-nowrap text-[11px] text-gray-800">Ville :</span>
                <span className="flex-grow border-b border-gray-400 text-[11px] px-1 font-bold">{contrat.ville || '-'}</span>
              </div>
              <div className="flex items-end">
                <span className="mr-2 whitespace-nowrap text-[11px] text-gray-800">Téléphone :</span>
                <span className="flex-grow border-b border-gray-400 text-[11px] px-1 font-bold">{contrat.telephone || '-'}</span>
              </div>
              <div className="flex items-end">
                <span className="mr-2 whitespace-nowrap text-[11px] text-gray-800">Email :</span>
                <span className="flex-grow border-b border-gray-400 text-[11px] px-1 font-bold">{contrat.email || '-'}</span>
              </div>
              <div className="flex items-center mt-2">
                <span className="mr-4 text-[11px] font-medium">Catégorie :</span>
                <Checkbox label="Personnel FINAM" checked={isPersonnel} />
                <Checkbox label="Retraités" checked={!isPersonnel} />
              </div>
            </div>
          </div>

          {/* Section: Bénéficiaire */}
          <div className="flex border-b border-gray-300">
            <SectionLabel>Bénéficiaire</SectionLabel>
            <div className="flex-grow p-2 space-y-1 text-[11px]">
              <div className="flex mb-1"><span className="w-28 text-gray-600">Raison sociale :</span> <span className="font-bold">La Financière Africaine de Microprojets (EMF – FINAM)</span></div>
              <div className="flex mb-1"><span className="w-28 text-gray-600">RCCM :</span> <span className="font-bold">2004B03852 / NIF : 783780 H / Agrément COBAC N° 76/CI/05/CNC</span></div>
              <div className="flex mb-1"><span className="w-28 text-gray-600">Adresse :</span> <span className="font-bold">Ancienne Sobraga, Avenue Lubin Martial NTOUTOUME OBAME / B.P. 22.408</span></div>
              <div className="flex mb-1"><span className="w-28 text-gray-600">Ville :</span> <span className="font-bold">Libreville - Gabon</span></div>
              <div className="flex items-end">
                <span className="mr-2 whitespace-nowrap text-gray-800">Agence :</span>
                <span className="flex-grow border-b border-gray-400 px-1 font-bold">{contrat.agence || '-'}</span>
              </div>
            </div>
          </div>

          {/* Section: Garanties */}
          <div className="flex border-b border-gray-300">
            <SectionLabel>Garanties</SectionLabel>
            <div className="flex-grow">
              <table className="w-full text-[11px] border-collapse">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-300 font-bold">
                    <th className="p-1 border-r border-gray-300 text-left w-3/5"></th>
                    <th className="p-1 border-r border-gray-300 text-center w-1/4">Type de cible</th>
                    <th className="p-1 border-r border-gray-300 text-center w-16">Option</th>
                    <th className="p-1 text-center w-16">Taux</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-300">
                    <td className="p-1 border-r border-gray-300">Décès – Invalidité Absolue et Définitive (IAD)¹</td>
                    <td className="p-1 border-r border-gray-300 text-center">Personnel FINAM</td>
                    <td className="p-1 border-r border-gray-300 text-center flex justify-center py-2">
                      <div className={`w-6 h-4 border border-black rounded-sm ${isPersonnel ? 'bg-black' : ''}`}></div>
                    </td>
                    <td className="p-1 text-center font-bold">{FINAM_CONSTANTS.PERSONNEL_TAUX.toFixed(2)}%</td>
                  </tr>
                  <tr>
                    <td className="p-1 border-r border-gray-300">Décès – Invalidité Absolue et Définitive (IAD)</td>
                    <td className="p-1 border-r border-gray-300 text-center">Retraités</td>
                    <td className="p-1 border-r border-gray-300 text-center flex justify-center py-2">
                      <div className={`w-6 h-4 border border-black rounded-sm ${!isPersonnel ? 'bg-black' : ''}`}></div>
                    </td>
                    <td className="p-1 text-center font-bold">{FINAM_CONSTANTS.RETRAITES_TAUX.toFixed(2)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section: Cotisations */}
          <div className="flex bg-gray-50/30">
            <SectionLabel>Cotisations</SectionLabel>
            <div className="flex-grow p-3">
              <div className="flex items-center font-bold text-sm">
                <span className="whitespace-nowrap">Prime totale :</span>
                <div className="flex-grow border-b-2 border-black mx-4 min-w-[200px] text-center">
                  {formatCurrency(contrat.prime_totale || 0)}
                </div>
                <span className="whitespace-nowrap">FCFA TTC</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Notes */}
        <div className="mt-4 space-y-1 text-[10px] font-bold text-black px-1">
          <div className="flex items-start"><span className="w-6 flex-shrink-0">(1)</span> <p>Le montant maximal de couverture est de {formatCurrency(FINAM_CONSTANTS.PERSONNEL_MONTANT_MAX)} pour le Personnel et de {formatCurrency(FINAM_CONSTANTS.RETRAITES_MONTANT_MAX)} pour les Retraités.</p></div>
          <div className="flex items-start"><span className="w-6 flex-shrink-0">(2)</span> <p>La durée maximale de couverture est de {FINAM_CONSTANTS.PERSONNEL_DUREE_MAX} mois pour le Personnel et de {FINAM_CONSTANTS.RETRAITES_DUREE_MAX} mois pour les Retraités.</p></div>
        </div>

        {/* Signatures and Date */}
        <div className="mt-8 mb-4">
          <div className="text-right text-xs mb-6 pr-12 font-medium italic">
            Fait à <span className="border-b border-black px-4">{contrat.lieu_signature || '____________'}</span>, le <span className="border-b border-black px-2">{contrat.date_signature ? formatDate(contrat.date_signature) : '__ / __ / ____'}</span>
          </div>

          <div className="flex justify-between items-start px-4">
            <div className="w-1/3 flex flex-col items-center">
              <div className="font-bold text-sm mb-1 uppercase">Le Souscripteur</div>
              <div className="w-full h-24 border border-gray-300 rounded p-2 text-[9px] text-gray-300 italic flex items-end justify-center">
                Signature et cachet
              </div>
            </div>

            <div className="w-1/4 flex flex-col items-center justify-center space-y-1 text-[10px] pt-4 font-semibold">
              <div>Feuillet 1 : SAMB'A ASSURANCES</div>
              <div>Feuillet 2 : FINAM</div>
              <div>Feuillet 3 : ASSURÉ</div>
              <div>Feuillet 4 : SOUCHE</div>
            </div>

            <div className="w-1/3 flex flex-col items-center">
              <div className="font-bold text-sm mb-1 uppercase">L'Assureur par délégation</div>
              <div className="w-full h-24 border border-gray-300 rounded p-2 text-[9px] text-gray-300 italic flex items-end justify-center">
                Signature et cachet
              </div>
            </div>
          </div>
        </div>

        {/* Footnote */}
        <div className="mt-4 text-[9px] text-gray-500 italic px-2 leading-tight">
          ¹Au titre du présent contrat, l'Assuré est considéré comme atteint d'Invalidité Totale et Définitive si avant l'âge limite prévu aux conditions générales, à la suite de maladie ou d'accident, il est reconnu définitivement incapable de se livrer à la moindre occupation, ni au moindre travail lui procurant gain ou profit, et est en outre dans l'obligation d'avoir recours définitivement pour les actes ordinaires de la vie à l'assistance d'une tierce personne.
        </div>

        <Footer pageNum={1} />
      </div>
    </div>
  )
}

export default FinamContratPrintPage
