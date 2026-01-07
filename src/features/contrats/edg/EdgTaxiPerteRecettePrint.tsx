import React from 'react'
import { Check } from 'lucide-react'
import logoSamba from '@/assets/logo-samba.png'

// --- Reusable Components for Print ---

const Logo: React.FC = () => (
    <div className="flex flex-col items-center justify-center w-28">
        <img
            src={logoSamba}
            alt="SAMB'A Assurances"
            className="w-full h-auto object-contain"
        />
    </div>
);

const PipeDisplay: React.FC<{ width?: string; value?: string }> = ({ width = "w-48", value = "" }) => (
    <div className="flex items-center">
        <div className={`${width} py-0.5 px-2 text-[11px] font-bold min-h-[22px] flex items-center`}>
            {value}
        </div>
    </div>
);

const DatePipeDisplay: React.FC<{ label: string; value: string }> = ({ label, value }) => {
    const [y, m, d] = (value || '--').split('-');
    return (
        <div className="flex items-center gap-2 text-[11px]">
            <span className="font-bold">{label} :</span>
            <div className="flex items-center gap-1 font-bold text-gray-900">
                <div className="w-5 text-center">{d || ' '}</div>
                <span>/</span>
                <div className="w-5 text-center">{m || ' '}</div>
                <span>/</span>
                <div className="w-10 text-center">{y || ' '}</div>
            </div>
        </div>
    );
}

const Footer: React.FC = () => (
    <div className="mt-auto pt-4 flex flex-col items-center">
        <div className="w-full flex justify-between items-end mb-4 px-2">
            <div className="text-[9px] text-gray-800 font-bold max-w-[70%] leading-tight">
                SAMB'A ASSURANCES GABON S.A.<br />
                <span className="font-normal text-[8px] text-gray-600">
                    Société Anonyme avec Conseil d'Administration et Président Directeur Général. Entreprise de micro-assurance régie par le Code des Assurances CIMA et agréée par la CRCA sous le N° 0270 / L / CIMA / CRCA / PDT / 2024, et le Ministère de l'Economie et des Participations par l'Arrêté N° 036.24 / MEP, au capital de 610.000.000 de FCFA dont 536.000.000 de FCFA libérés. R.C.C.M : N° GA - LBV - 01 - 2024 - B14 - 00003 | N° STATISTIQUE : 202401003647 R
                </span>
            </div>
            <div className="flex items-center gap-4">
                <div className="border border-black w-8 h-8 flex items-center justify-center font-bold text-xs bg-white">1</div>
            </div>
        </div>
        <div className="w-full grid grid-cols-3 gap-4 border-t border-gray-300 pt-3 px-4 text-[8px] text-gray-600">
            <div className="flex flex-col items-center text-center border-r border-gray-300">
                <div className="font-bold text-gray-800">326 Rue Jean-Baptiste NDENDE</div>
                <div>Avenue de COINTET | Centre-Ville | Libreville</div>
            </div>
            <div className="flex flex-col items-center text-center border-r border-gray-300">
                <div className="font-bold text-gray-800">B.P : 22 215 | Libreville | Gabon</div>
                <div>Email : infos@samba-assurances.com</div>
            </div>
            <div className="flex flex-col items-center text-center">
                <div className="font-bold text-gray-800">(+241) 060 08 62 62 - 074 40 41 41</div>
                <div>074 40 51 51</div>
            </div>
        </div>
    </div>
);

interface EdgTaxiPerteRecettePrintProps {
    contrat: any
}

export const EdgTaxiPerteRecettePrint: React.FC<EdgTaxiPerteRecettePrintProps> = ({ contrat }) => {
    return (
        <div className="bg-white w-[210mm] min-h-[297mm] p-[10mm] relative flex flex-col border border-gray-100 font-sans shadow-none">
            {/* Header Section */}
            <div className="flex justify-between items-start mb-4">
                <Logo />
                <div className="flex flex-col items-center flex-grow pt-4">
                    <h1 className="text-[#F48232] text-3xl font-bold italic text-center tracking-tight leading-none">Contrat: SAMB'A TAXIS</h1>
                    <div className="text-[10px] text-gray-600 font-medium mt-1 text-center italic">Contrat régi par les dispositions du Code des assurances CIMA</div>
                    <h2 className="text-[#F48232] text-xl font-bold uppercase mt-6 tracking-wider text-center">CONDITIONS PARTICULIERES : PERTE DE RECETTES</h2>
                </div>
                <div className="w-24"></div>
            </div>

            {/* Top Info Fields */}
            <div className="space-y-4 mb-6 mt-4">
                <div className="flex items-center gap-2 text-[11px]">
                    <span className="font-bold">Numéro de police :</span>
                    <PipeDisplay width="w-48" value={contrat.numero_police} />
                </div>

                <div className="flex justify-between">
                    <DatePipeDisplay label="Date d'effet" value={contrat.date_effet} />
                    <DatePipeDisplay label="Date d'échéance" value={contrat.date_echeance} />
                </div>
            </div>

            {/* Main Data Grid */}
            <div className="w-full border border-[#F48232] rounded-sm overflow-hidden mb-6">
                <div className="grid grid-cols-[1.5fr_2fr_2fr] text-[11px]">
                    <div className="border-b border-[#F48232] p-2 bg-white"></div>
                    <div className="border-b border-l border-[#F48232] p-2 font-bold italic text-center bg-orange-50/30">Souscripteur</div>
                    <div className="border-b border-l border-[#F48232] p-2 font-bold italic text-center bg-orange-50/30">Assuré</div>

                    <PrintRow label="Nom" value={contrat.nom} />
                    <PrintRow label="Prénom" value={contrat.prenom} />
                    <PrintRow label="Date de naissance" value={contrat.date_naissance} />
                    <PrintRow label="Numéro d'identité" value={contrat.numero_identite} />
                    <PrintRow label="Immatriculation taxi" value={contrat.immatriculation_taxi} />
                    <PrintRow label="Adresse" value={contrat.adresse} />
                    <PrintRow label="BP" value={contrat.bp} />
                    <PrintRow label="Ville" value={contrat.ville} />
                    <PrintRow label="Téléphone" value={contrat.telephone} />
                    <PrintRow label="Email" value={contrat.email} isLast />
                </div>
            </div>

            {/* Contact info */}
            <div className="flex gap-8 mb-8 text-[11px] items-center px-1">
                <div className="flex items-center gap-2 flex-grow">
                    <span className="font-bold whitespace-nowrap">Contacter en cas de besoin :</span>
                    <PipeDisplay width="flex-grow" value={contrat.contact_nom} />
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-bold">Tel. :</span>
                    <PipeDisplay width="w-48" value={contrat.contact_telephone} />
                </div>
            </div>

            {/* Garanties Section */}
            <div className="mb-8 space-y-4 px-2">
                <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-black mt-1 flex-shrink-0"></div>
                    <div className="flex flex-col">
                        <h3 className="font-bold text-lg mb-2">Garanties :</h3>
                        <ul className="space-y-2 text-[11px] font-medium pl-2">
                            <li className="flex items-baseline gap-2">
                                <span className="text-[10px] text-black">◆</span>
                                <span>Indemnités perte de recette: <span className="font-bold">10 000 FCFA / jour</span> ; durée maximum d'indemnisation : <span className="font-bold">10 jours</span>.</span>
                            </li>
                            <li className="flex items-baseline gap-2">
                                <span className="text-[10px] text-black">◆</span>
                                <span>Plafond d'indemnisation : <span className="font-bold">100 000 FCFA/an/personne</span>.</span>
                            </li>
                            <li className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-2">
                                    <div className={`w-4 h-4 border border-black flex items-center justify-center ${contrat.periodicite === 'annuel' ? 'bg-black text-white' : 'bg-white'}`}>
                                        {contrat.periodicite === 'annuel' && <Check size={12} />}
                                    </div>
                                    <span>Annuel : <span className="font-bold">25 000 FCFA TTC</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-4 h-4 border border-black flex items-center justify-center ${contrat.periodicite === 'semestre' ? 'bg-black text-white' : 'bg-white'}`}>
                                        {contrat.periodicite === 'semestre' && <Check size={12} />}
                                    </div>
                                    <span>Semestriel : <span className="font-bold">12 500 FCFA TTC</span></span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Date and Signature Line */}
            <div className="text-right text-[11px] italic mb-6 pr-12">
                Fait à Libreville, le {new Date(contrat.created_at || Date.now()).toLocaleDateString('fr-FR')}
            </div>

            {/* Signature Blocks */}
            <div className="flex justify-between items-start px-8 mb-12">
                <div className="flex flex-col items-start w-[30%]">
                    <div className="font-bold text-[12px] mb-2 italic">Le Souscripteur</div>
                    <div className="w-full h-20 border border-gray-400 rounded-sm p-2 flex items-start">
                    </div>
                </div>
                <div className="flex flex-col items-start w-[30%]">
                    <div className="font-bold text-[12px] mb-2 italic">L'Assureur</div>
                    <div className="w-full h-20 border border-gray-400 rounded-sm p-2 flex items-center justify-center">
                        <Logo />
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}

const PrintRow = ({ label, value, isLast = false }: any) => (
    <React.Fragment>
        <div className={`p-2 font-bold border-r border-[#F48232] flex items-center ${!isLast ? 'border-b border-[#F48232]' : ''}`}>
            {label}
        </div>
        <div className={`border-r border-[#F48232] p-2 font-medium text-gray-700 ${!isLast ? 'border-b border-[#F48232]' : ''}`}>
            {value}
        </div>
        <div className={`p-2 font-bold text-gray-900 ${!isLast ? 'border-b border-[#F48232]' : ''}`}>
            {value}
        </div>
    </React.Fragment>
)
