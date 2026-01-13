import React from 'react'
import { Mail, Phone, MapPin } from 'lucide-react'
import { BcegTaxiPrevoyanceDecesContrat } from '@/types/bcegTaxi'
import logoSamba from '@/assets/logo-samba.png'

const Logo: React.FC = () => (
    <div className="flex flex-col items-center justify-center w-28">
        <img src={logoSamba} alt="SAMB'A ASSURANCES" className="w-full h-auto" />
    </div>
);

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="w-32 flex-shrink-0 p-2 italic border-r border-[#F48232] flex items-center text-[10px] font-medium text-gray-700 bg-orange-50 leading-tight">
        {children}
    </div>
);

// Matches PipeInput style from Create but static
const PipeDisplay: React.FC<{ value?: string, width?: string }> = ({ value, width = "w-40" }) => (
    <div className={`${width} border border-black py-0.5 px-2 text-[10px] uppercase font-medium bg-transparent min-h-[22px] flex items-center`}>
        {value || ''}
    </div>
);

const LineInput: React.FC<{ label: string; value?: string, flexGrow?: boolean }> = ({ label, value, flexGrow = true }) => (
    <div className={`flex items-end gap-2 text-[10px] ${flexGrow ? 'flex-grow' : ''}`}>
        <span className="whitespace-nowrap font-medium">{label} :</span>
        <div className="flex-grow border-b border-gray-300 px-1 h-5 flex items-end">
            <span className="font-bold">{value || ''}</span>
        </div>
    </div>
);

interface BcegTaxiPrevoyanceDecesPrintProps {
    contrat: BcegTaxiPrevoyanceDecesContrat
}

export const BcegTaxiPrevoyanceDecesPrint: React.FC<BcegTaxiPrevoyanceDecesPrintProps> = ({ contrat }) => {
    return (
        <div className="bg-white w-[210mm] min-h-[297mm] p-[8mm] relative flex flex-col border border-gray-300 print:shadow-none print:border-none print:w-full print:p-0 mx-auto font-sans">

            {/* Header Section */}
            <div className="flex justify-between items-start mb-2">
                <Logo />
                <div className="flex flex-col items-center flex-grow pt-4">
                    <h1 className="text-[#F48232] text-lg font-bold italic text-center leading-tight uppercase">
                        CONTRAT D'ASSURANCE SAMB'A TAXIS
                    </h1>
                    <h2 className="text-[#F48232] text-lg font-bold italic text-center leading-tight uppercase">
                        PRÉVOYANCE DÉCÈS (BCEG)
                    </h2>
                    <div className="text-[9px] text-gray-500 font-medium mt-1 text-center italic">
                        Contrat régi par les dispositions du Code des Assurances CIMA
                    </div>
                    <div className="text-[9px] text-gray-500 font-medium text-center italic">
                        Visa DNA N°{contrat.visas_dna || '004/24 & N°008/24'}
                    </div>
                    <h3 className="text-[#F48232] text-xl font-bold mt-4 tracking-widest border-b-2 border-black pb-0.5">
                        CONDITIONS PARTICULIERES
                    </h3>
                </div>
                <div className="w-28"></div>
            </div>

            {/* Form Sections */}
            <div className="w-full border border-[#F48232] flex flex-col mt-4">

                {/* Section: Couverture */}
                <div className="flex border-b border-[#F48232]">
                    <SectionLabel>Couverture</SectionLabel>
                    <div className="flex-grow p-2 grid grid-cols-2 gap-y-3 gap-x-6">
                        <div className="flex items-center justify-between text-[10px]">
                            <span className="font-medium mr-2">Numéro de police :</span>
                            <PipeDisplay width="w-48" value={contrat.numero_police} />
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                            <span className="font-medium mr-2">Numéro de Taxis :</span>
                            <PipeDisplay width="w-48" value={contrat.numero_taxis} />
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                            <span className="font-medium mr-2">Date d'effet :</span>
                            <div className="border border-black py-0.5 px-2 text-[10px] bg-transparent w-48 min-h-[22px] flex items-center">
                                {contrat.date_effet ? new Date(contrat.date_effet).toLocaleDateString('fr-FR') : ''}
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                            <span className="font-medium mr-2">Date d'échéance :</span>
                            <div className="border border-black py-0.5 px-2 text-[10px] bg-transparent w-48 min-h-[22px] flex items-center">
                                {contrat.date_echeance ? new Date(contrat.date_echeance).toLocaleDateString('fr-FR') : ''}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section: Souscripteur & Assuré principal */}
                <div className="flex border-b border-[#F48232]">
                    <SectionLabel>Souscripteur <br /> & Assuré <br /> principal</SectionLabel>
                    <div className="flex-grow p-3 space-y-2.5">
                        <div className="flex gap-4">
                            <LineInput label="Nom" value={contrat.nom} />
                            <LineInput label="Prénom" value={contrat.prenom} />
                        </div>
                        <div className="flex gap-4">
                            <LineInput label="Adresse" value={contrat.adresse} />
                            <LineInput label="Téléphone" value={contrat.telephone} />
                        </div>
                        <LineInput label="Personne à contacter en cas d'urgence" value={contrat.personne_urgence} />
                        <LineInput label="Bénéficiaire en cas de décès de l'Assuré principal" value={contrat.beneficiaire_deces} />
                    </div>
                </div>

                {/* Section: Assurés associés Table */}
                <div className="flex border-b border-[#F48232]">
                    <SectionLabel>Assurés <br /> associés</SectionLabel>
                    <div className="flex-grow">
                        <table className="w-full text-[9px] border-collapse">
                            <thead>
                                <tr className="bg-orange-50 font-bold border-b border-[#F48232]">
                                    <th className="p-1.5 border-r border-[#F48232] w-24">Lien avec l'Assuré Principal</th>
                                    <th className="p-1.5 border-r border-[#F48232]">Nom</th>
                                    <th className="p-1.5 border-r border-[#F48232]">Prénom</th>
                                    <th className="p-1.5 border-r border-[#F48232] w-20">Date de naissance</th>
                                    <th className="p-1.5 border-r border-[#F48232] w-24">Lieu de naissance</th>
                                    <th className="p-1.5">Contact & Adresse</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[0, 1, 2, 3].map((i) => {
                                    const associe = contrat.assures_associes?.[i];
                                    return (
                                        <tr key={i} className="border-b border-gray-200 last:border-0 h-6">
                                            <td className="border-r border-[#F48232] px-1 text-center font-bold">{associe?.lien || ''}</td>
                                            <td className="border-r border-[#F48232] px-1 font-bold">{associe?.nom || ''}</td>
                                            <td className="border-r border-[#F48232] px-1 font-bold">{associe?.prenom || ''}</td>
                                            <td className="border-r border-[#F48232] px-1 text-center font-bold">{associe?.date_naissance ? new Date(associe.date_naissance).toLocaleDateString('fr-FR') : ''}</td>
                                            <td className="border-r border-[#F48232] px-1 font-bold">{associe?.lieu_naissance || ''}</td>
                                            <td className="px-1 font-bold">{associe?.contact || ''}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Section: Garanties */}
                <div className="flex border-b border-[#F48232]">
                    <SectionLabel>Garanties ⁽¹⁾</SectionLabel>
                    <div className="flex-grow p-3 space-y-1 text-[10.5px]">
                        <div className="flex items-start gap-3">
                            <span className="font-bold">•</span>
                            <p><span className="font-bold">Prévoyance : 250.000 FCFA</span>, en cas de décès de l'Assuré principal ou Assuré Associé</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="font-bold">•</span>
                            <p><span className="font-bold">Perte de recette : 10.000 FCFA / jour</span> ; durée maximum d'indemnisation : 10 jours.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="font-bold">•</span>
                            <p><span className="font-bold">Plafond d'indemnisation : 100.000 FCFA/an/personne.</span></p>
                        </div>
                    </div>
                </div>

                {/* Section: Cotisation */}
                <div className="flex">
                    <SectionLabel>Cotisation <br /> TTC/An</SectionLabel>
                    <div className="flex-grow p-3 space-y-1 text-[11px]">
                        <div className="flex items-center gap-2">
                            <span className="font-bold">•</span>
                            <div>Prévoyance : <span className="font-bold">25.000 FCFA</span></div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold">•</span>
                            <div>Perte de recette : <span className="font-bold">25.000 FCFA</span></div>
                        </div>
                        <div className="flex items-center gap-2 mt-1 pt-1 border-t border-gray-400 w-1/2">
                            <span className="font-bold">•</span>
                            <div>Total : <span className="font-bold">50.000 FCFA</span></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footnotes */}
            <div className="mt-4 px-2 space-y-1 text-[10px] font-bold text-gray-800">
                <div>(1) Le montant maximal de couverture de la Prévoyance est de 1.000.000 FCFA.</div>
                <div>(2) Contrat à durée annuelle et renouvelable par tacite reconduction.</div>
            </div>

            {/* Execution Details */}
            <div className="mt-6">
                <div className="text-right text-[11px] mb-8 pr-12 font-medium">
                    Fait à <span className="border-b border-dotted border-gray-600 w-56 inline-block text-center">{contrat.ville || 'Libreville'}</span> le <span className="border-b border-dotted border-gray-600 w-10 inline-block text-center">{new Date().getDate()}</span> / <span className="border-b border-dotted border-gray-600 w-10 inline-block text-center">{new Date().getMonth() + 1}</span> / <span className="border-b border-dotted border-gray-600 w-16 inline-block text-center">{new Date().getFullYear()}</span>
                </div>

                <div className="flex justify-between items-start px-8 mb-4">
                    <div className="w-[40%] flex flex-col items-center">
                        <div className="font-bold text-[11px] mb-2 uppercase border-b border-black w-full text-center pb-1">Le Souscripteur</div>
                        <div className="w-full h-24 border border-gray-300 p-2 relative flex items-center justify-center rounded bg-gray-50/50">
                            <span className="text-[9px] text-gray-300 italic">Signature et cachet</span>
                        </div>
                    </div>

                    <div className="w-[40%] flex flex-col items-center">
                        <div className="font-bold text-[11px] mb-2 uppercase border-b border-black w-full text-center pb-1">L'Assureur</div>
                        <div className="w-full h-24 border border-gray-300 p-2 relative flex items-center justify-center rounded bg-gray-50/50">
                            <span className="text-[9px] text-gray-300 italic">Signature et cachet</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-4 border-t border-gray-200">
                <div className="text-center text-[10px] text-gray-800 font-bold uppercase mb-0.5">
                    SAMB'A ASSURANCES GABON S.A.
                </div>
                <div className="text-center text-[8px] text-gray-600 mb-2 leading-tight px-12 italic">
                    Société Anonyme avec Conseil d'Administration et Président Directeur Général. <br />
                    Entreprise de micro-assurance régie par le Code des Assurances CIMA et agréée par la CRCA sous le N° 0270 / L / CIMA / CRCA / PDT / 2024,
                    et le Ministère de l'Economie et des Participations par l'Arrêté N° 036.24 / MEP, au capital de 610.000.000 de FCFA dont 536.000.000 de FCFA libérés.
                    R.C.C.M : N° GA - LBV - 01 - 2024 - B14 - 00003 | N° STATISTIQUE : 202401003647 R
                </div>

                <div className="flex justify-between items-start text-gray-700 text-[8px] px-4 pb-2 mt-2">
                    <div className="flex items-center gap-2 w-1/3">
                        <MapPin size={14} className="text-[#F48232] shrink-0" />
                        <div className="flex flex-col">
                            <span className="font-bold">326 Rue Jean-Baptiste NDENDE</span>
                            <span>Avenue de COINTET | Centre-Ville | Libreville</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 w-1/3 justify-center text-center">
                        <Mail size={14} className="text-[#F48232] shrink-0" />
                        <div className="flex flex-col">
                            <span className="font-bold">B.P : 22 215 | Libreville | Gabon</span>
                            <span>Email : infos@samba-assurances.com</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 w-1/3 justify-end text-right">
                        <Phone size={14} className="text-[#F48232] shrink-0" />
                        <div className="flex flex-col">
                            <span className="font-bold">(+241) 060 08 62 62 - 074 40 41 41</span>
                            <span>074 40 51 51</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}
