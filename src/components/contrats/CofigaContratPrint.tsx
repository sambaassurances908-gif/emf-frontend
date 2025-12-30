import React from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { COFIGA_CONSTANTS } from '@/types/cofiga'
import logoSamba from '@/assets/logo-samba.png'

const SectionLabel = ({ children, locked }: { children: React.ReactNode; locked?: boolean }) => (
  <div className={`w-36 flex-shrink-0 p-2 bg-gray-50 italic border-r border-gray-300 flex items-center text-[11px] text-gray-700 ${locked ? 'relative' : ''}`}>
    {children}
  </div>
)

// --- Footer Component ---
const Footer: React.FC = () => {
  return (
    <div className="mt-auto pt-4 text-center text-[8px] text-gray-600 space-y-1 leading-tight border-t border-gray-200">
      <div className="font-bold uppercase text-black text-[10px]">SAMB'A ASSURANCES GABON S.A.</div>
      <div>Société Anonyme avec Conseil d'Administration et Président Directeur Général.</div>
      <div>
        Entreprise de micro-assurance régie par le Code des Assurances CIMA, au capital de 610.000.000 de Francs FCFA, dont 536.000.000 de Francs CFA libérés.
      </div>
      <div>
        R.C.C.M : N° GA - LBV - 01 - 2024 - B14 - 00003 | N° STATISTIQUE : 202401003647 R
      </div>

      <div className="flex justify-between items-start pt-3 px-4 relative">
        <div className="flex flex-col items-center w-1/3 text-center border-r border-gray-300">
          <div className="font-semibold text-gray-700 text-[9px]">Quartier Louis | 85 Rue Pierre BARRO</div>
          <div className="text-[8px]">Immeuble Zebra | Libreville</div>
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

const formatCreatedDate = (contrat: any) => {
  const raw = contrat?.created_at
  if (!raw) return '__ / __ / ____'
  const d = new Date(raw)
  if (isNaN(d.getTime())) return '__ / __ / ____'
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd} / ${mm} / ${yyyy}`
}

export const CofigaContratPrint = ({ contrat }: { contrat: any }) => {
  const cotisationVariable = Math.round((contrat?.montant_pret_assure || 0) * (COFIGA_CONSTANTS.TAUX_GARANTIE / 100))
  const cotisationFixe = COFIGA_CONSTANTS.PRIME_UNIQUE
  const cotisationTotale = contrat?.cotisation_totale || (cotisationVariable + cotisationFixe)

  return (
    <div className="bg-white w-[210mm] min-h-[297mm] p-[10mm] shadow-2xl relative flex flex-col border border-gray-300">
      <div className="flex justify-between items-start mb-2">
        <div className="w-28">
          <img src={logoSamba} alt="SAMB'A Assurances" className="h-20 w-auto" />
        </div>
        <div className="flex flex-col items-center flex-grow pt-4">
          <h1 className="text-[#005C94] text-xl font-bold uppercase text-center tracking-tight leading-none">CONTRAT DECES GROUPE EMPRUNTEUR : COOFIGA</h1>
          <p className="text-[10px] text-gray-500 italic mt-1 text-center">Contrat régi par les dispositions du Code des assurances CIMA<br />Convention N° : 506.111/0724</p>
          <h2 className="text-black text-lg font-bold uppercase mt-3 tracking-widest border-b-2 border-black px-4">CONDITIONS PARTICULIERES</h2>
        </div>
        <div className="w-24 text-right pt-4">
        </div>
      </div>

      <div className="border border-gray-400 w-full flex flex-col mt-4">
        <div className="flex border-b border-gray-300">
          <SectionLabel>Couverture</SectionLabel>
          <div className="flex-grow p-2 grid grid-cols-2 gap-x-4 gap-y-1">
            <div className="flex items-end">
              <span className="mr-2 whitespace-nowrap text-[11px] text-gray-800">Numéro de police :</span>
              <span className="flex-grow border-b border-gray-400 text-[11px] px-1 font-bold">{contrat?.numero_police || 'En attente'}</span>
            </div>
            <div className="flex items-end">
              <span className="mr-2 whitespace-nowrap text-[11px] text-gray-800">Durée du prêt :</span>
              <span className="flex-grow border-b border-gray-400 text-[11px] px-1 font-bold">{contrat?.duree_pret || ''} mois</span>
            </div>
            <div className="flex items-end">
              <span className="mr-2 whitespace-nowrap text-[11px] text-gray-800">Montant du prêt assuré :</span>
              <span className="flex-grow border-b border-gray-400 text-[11px] px-1 font-bold">{formatCurrency(contrat?.montant_pret_assure || 0)}</span>
            </div>
            <div className="flex items-end">
              <span className="mr-2 whitespace-nowrap text-[11px] text-gray-800">Date d'effet :</span>
              <span className="flex-grow border-b border-gray-400 text-[11px] px-1 font-bold">{contrat?.date_effet ? formatDate(contrat.date_effet) : ''}</span>
            </div>
            <div className="col-span-2 flex items-center flex-wrap gap-y-1 mt-1">
              <span className="mr-4 text-[11px] font-medium">Catégorie :</span>
              <div className={`flex items-center mr-4`}>
                <div className={`w-4 h-4 border border-black mr-2 flex items-center justify-center bg-white`}>
                  {contrat?.categorie === 'Commerçants' && (
                    <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-[10px] text-gray-800">Commerçants</span>
              </div>
              <div className={`flex items-center mr-4`}>
                <div className={`w-4 h-4 border border-black mr-2 flex items-center justify-center bg-white`}>
                  {contrat?.categorie === 'Salariés du privé' && (
                    <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-[10px] text-gray-800">Salariés du privé</span>
              </div>
              <div className={`flex items-center mr-4`}>
                <div className={`w-4 h-4 border border-black mr-2 flex items-center justify-center bg-white`}>
                  {contrat?.categorie === 'Salariés du public' && (
                    <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-[10px] text-gray-800">Salariés du public</span>
              </div>
              <div className={`flex items-center mr-4`}>
                <div className={`w-4 h-4 border border-black mr-2 flex items-center justify-center bg-white`}>
                  {contrat?.categorie === 'Autre' && (
                    <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-[10px] text-gray-800">Autre</span>
              </div>
            </div>
            <div className="flex items-end">
              <span className="mr-2 whitespace-nowrap text-[11px] text-gray-800">Date de fin d'échéance :</span>
              <span className="flex-grow border-b border-gray-400 text-[11px] px-1 font-bold">{contrat?.date_fin_echeance ? formatDate(contrat.date_fin_echeance) : ''}</span>
            </div>
          </div>
        </div>

        <div className="flex border-b border-gray-300">
          <SectionLabel>Personne assurée<br />et bénéficiaire</SectionLabel>
          <div className="flex-grow p-2 space-y-1">
            <div className="flex items-end">
              <span className="mr-2 whitespace-nowrap text-[11px] text-gray-800">Nom :</span>
              <span className="flex-grow border-b border-gray-400 text-[11px] px-1 font-bold">{contrat?.nom || ''}</span>
            </div>
            <div className="flex items-end">
              <span className="mr-2 whitespace-nowrap text-[11px] text-gray-800">Prénom :</span>
              <span className="flex-grow border-b border-gray-400 text-[11px] px-1 font-bold">{contrat?.prenom || ''}</span>
            </div>
            <div className="flex items-end">
              <span className="mr-2 whitespace-nowrap text-[11px] text-gray-800">Adresse :</span>
              <span className="flex-grow border-b border-gray-400 text-[11px] px-1 font-bold">{contrat?.adresse || '-'}</span>
            </div>
            <div className="flex items-end">
              <span className="mr-2 whitespace-nowrap text-[11px] text-gray-800">Ville :</span>
              <span className="flex-grow border-b border-gray-400 text-[11px] px-1 font-bold">{contrat?.ville || '-'}</span>
            </div>
            <div className="flex items-end">
              <span className="mr-2 whitespace-nowrap text-[11px] text-gray-800">Téléphone :</span>
              <span className="flex-grow border-b border-gray-400 text-[11px] px-1 font-bold">{contrat?.telephone || '-'}</span>
            </div>
            <div className="flex items-end">
              <span className="mr-2 whitespace-nowrap text-[11px] text-gray-800">Email :</span>
              <span className="flex-grow border-b border-gray-400 text-[11px] px-1 font-bold">{contrat?.email || '-'}</span>
            </div>
          </div>
        </div>

        <div className="flex border-b border-gray-300">
          <SectionLabel>Souscripteur / EMF</SectionLabel>
          <div className="flex-grow p-2 space-y-1 text-[10px]">
            <div className="flex mb-1"><span className="w-24 text-gray-600">Raison sociale :</span> <span className="font-bold">Coopérative Financière Gabonaise (EMF – COOFIGA)</span></div>
            <div className="flex mb-1"><span className="w-24 text-gray-600">RCCM :</span> <span className="font-bold">2010B12067 / NIF : 20131100001180T / Agrément COBAC N° D/2016/0044</span></div>
            <div className="flex mb-1"><span className="w-24 text-gray-600">Adresse :</span> <span className="font-bold">BP : 20 350 Libreville / Quartier Louis / Commune d'Owendo</span></div>
            <div className="flex"><span className="w-24 text-gray-600">Ville :</span> <span className="font-bold">Libreville - Gabon</span></div>
          </div>
        </div>

        <div className="flex border-b border-gray-300">
          <SectionLabel>Bénéficiaire<br />protection<br />forfaitaire</SectionLabel>
          <div className="flex-grow p-2 space-y-1">
            <div className="flex items-end">
              <span className="mr-2 whitespace-nowrap text-[11px] text-gray-800">Nom :</span>
              <span className="flex-grow border-b border-gray-400 text-[11px] px-1 font-bold">{contrat?.beneficiaire_nom || ''}</span>
            </div>
            <div className="flex items-end">
              <span className="mr-2 whitespace-nowrap text-[11px] text-gray-800">Prénom :</span>
              <span className="flex-grow border-b border-gray-400 text-[11px] px-1 font-bold">{contrat?.beneficiaire_prenom || ''}</span>
            </div>
            <div className="flex items-end">
              <span className="mr-2 whitespace-nowrap text-[11px] text-gray-800">Téléphone :</span>
              <span className="flex-grow border-b border-gray-400 text-[11px] px-1 font-bold">{contrat?.beneficiaire_telephone || ''}</span>
            </div>
          </div>
        </div>

        <div className="flex bg-gray-50/50">
          <SectionLabel>Garanties</SectionLabel>
          <div className="flex-grow">
            <table className="w-full text-[10px] border-collapse">
              <thead className="bg-gray-50 border-b border-gray-300">
                <tr className="font-bold text-gray-700">
                  <th className="p-1 border-r border-gray-300 text-left w-5/12 font-normal italic"></th>
                  <th className="p-1 border-r border-gray-300 text-center w-2/12">Type de cible</th>
                  <th className="p-1 border-r border-gray-300 text-center w-32">Option</th>
                  <th className="p-1 border-r border-gray-300 text-center w-24">Taux</th>
                  <th className="p-1 text-center w-28">Prime unique</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-300">
                  <td className="p-2 border-r border-gray-300">Protection forfaitaire Décès - IAD¹</td>
                  <td className="p-2 border-r border-gray-300 text-center">Toute catégorie</td>
                  <td className="p-2 border-r border-gray-300 text-center flex justify-center items-center h-8">
                    <div className="w-7 h-4 border border-black bg-gray-500 rounded-sm"></div>
                  </td>
                  <td className="p-2 border-r border-gray-300 text-center text-gray-500 italic">N/A</td>
                  <td className="p-2 text-center font-bold">5.000</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-gray-300">Décès – invalidité absolue et définitive (IAD)</td>
                  <td className="p-2 border-r border-gray-300 text-center">Toute catégorie</td>
                  <td className="p-2 border-r border-gray-300 text-center flex justify-center items-center h-8">
                    <div className="w-7 h-4 border border-black bg-gray-500 rounded-sm"></div>
                  </td>
                  <td className="p-2 border-r border-gray-300 text-center font-bold">1,50%</td>
                  <td className="p-2 text-center text-gray-500 italic">N/A</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex bg-gray-50/50">
          <SectionLabel>Cotisations</SectionLabel>
          <div className="flex-grow p-3">
            <div className="flex items-center font-bold text-[12px]">
              <span className="whitespace-nowrap">Cotisation Totale :</span>
              <div className="flex-grow border-b border-black mx-2 h-5 flex items-center justify-center font-bold">
                {cotisationTotale > 0 ? cotisationTotale.toLocaleString() : ''}
              </div>
              <span className="whitespace-nowrap">FCFA TTC (Prêt x 1,50%) + 5000 FCFA</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-1 text-[10px] font-bold text-black px-1 leading-tight">
        <div className="flex items-start"><span className="w-6 flex-shrink-0">(1)</span> <p>La protection forfaitaire est d'un montant de 250 000 FCFA en cas de décès ou d'invalidité absolue et définitive.</p></div>
        <div className="flex items-start"><span className="w-6 flex-shrink-0">(2)</span> <p>Le montant maximal du prêt couvert est de 10.000.000 FCFA.</p></div>
        <div className="flex items-start"><span className="w-6 flex-shrink-0">(3)</span> <p>La durée maximale du prêt 24 mois.</p></div>
      </div>

      <div className="mt-12 mb-4">
        <div className="text-right text-[11px] mb-8 pr-12 font-medium italic">
          Fait à <span className="border-b border-black px-4">{contrat?.lieu_signature || 'Libreville'}</span>, le <span className="border-b border-black px-2">{formatCreatedDate(contrat)}</span>
        </div>

        <div className="flex justify-between items-start px-4">
          <div className="w-2/5 flex flex-col items-center">
            <div className="font-bold text-[11px] mb-2 uppercase">Le Souscripteur</div>
            <div className="w-full h-20 border border-gray-400 border-dashed rounded flex items-center justify-center"></div>
          </div>

          <div className="w-1/5 flex flex-col items-start justify-center space-y-1 text-[9px] pt-4 font-semibold text-gray-800">
          </div>

          <div className="w-2/5 flex flex-col items-center">
            <div className="font-bold text-[11px] mb-2 uppercase">L'Assureur par Délégation</div>
            <div className="w-full h-20 border border-gray-400 border-dashed rounded flex items-center justify-center"></div>
          </div>
        </div>
      </div>

      <div className="mt-auto mb-4 text-[9px] text-gray-500 italic px-2 leading-tight">
        ¹Au titre du présent contrat, l'Assuré est considéré comme atteint d'Invalidité Totale et Définitive si avant l'âge limite prévu aux conditions générales, à la suite de maladie ou d'accident, il est reconnu définitivement incapable de se livrer à la moindre occupation, ni au moindre travail lui procurant gain ou profit, et est en outre dans l'obligation d'avoir recours définitivement pour les actes ordinaires de la vie à l'assistance d'une tierce personne.
      </div>

      <Footer />
      <div className="absolute bottom-4 right-8 text-[12px] font-bold">1</div>
    </div>
  )
}

export default CofigaContratPrint
