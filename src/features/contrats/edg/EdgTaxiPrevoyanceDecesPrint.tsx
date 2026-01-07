import React from 'react'
import { EdgTaxiPrevoyanceDecesContrat } from '@/types/edgTaxi'
import logoSamba from '@/assets/logo-samba.png'
import { Check } from 'lucide-react'

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

const DateDisplay: React.FC<{ value?: string }> = ({ value }) => {
    if (!value) return (
        <div className="flex gap-1 text-gray-900 font-bold text-sm">
            <div className="w-8 text-center border rounded py-0.5">--</div>
            <span>/</span>
            <div className="w-8 text-center border rounded py-0.5">--</div>
            <span>/</span>
            <div className="w-14 text-center border rounded py-0.5">----</div>
        </div>
    );
    const date = new Date(value);
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = String(date.getFullYear());
    return (
        <div className="flex items-center gap-1 font-bold text-gray-900 text-sm">
            <div className="w-8 text-center border rounded py-0.5">{d}</div>
            <span>/</span>
            <div className="w-8 text-center border rounded py-0.5">{m}</div>
            <span>/</span>
            <div className="w-14 text-center border rounded py-0.5">{y}</div>
        </div>
    );
};

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="w-28 flex-shrink-0 p-2 italic border-r border-orange-300 flex items-center text-[10px] font-medium text-gray-700 bg-orange-50/30">
        {children}
    </div>
);

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
                <div className="border border-black w-8 h-8 flex items-center justify-center font-bold text-sm bg-white">2</div>
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

export const EdgTaxiPrevoyanceDecesPrint: React.FC<{ contrat: EdgTaxiPrevoyanceDecesContrat }> = ({ contrat }) => {
    return (
        <div className="bg-white w-[210mm] min-h-[297mm] p-[10mm] relative flex flex-col border border-gray-300 print:shadow-none print:border-none print:w-full print:p-0 mx-auto font-sans">

            {/* Header Section */}
            <div className="flex justify-between items-start mb-2 px-2">
                <Logo />
                <div className="flex flex-col items-center flex-grow pt-2">
                    <h1 className="text-[#F48232] text-xl font-bold italic text-center tracking-tight leading-none">
                        Contrat : SAMB'A TAXIS
                    </h1>
                    <div className="text-[8px] text-gray-600 font-medium mt-1 text-center italic">
                        Contrat régi par les dispositions du Code des assurances CIMA
                    </div>
                    <h2 className="text-[#F48232] text-base font-bold uppercase mt-2 tracking-wider">
                        CONDITIONS PARTICULIERES : PREVOYANCE DECES
                    </h2>
                </div>
                <div className="w-28"></div>
            </div>

            {/* Form Sections */}
            <div className="w-full border border-orange-300 flex flex-col mt-4">

                {/* Section: Couverture */}
                <div className="flex border-b border-orange-300">
                    <SectionHeader>Couverture</SectionHeader>
                    <div className="flex-grow p-2 space-y-2">
                        <div className="flex items-center gap-2 text-[11px]">
                            <span className="w-32 font-medium uppercase">Numéro de police :</span>
                            <div className="border border-gray-400 rounded py-1 px-3 font-bold bg-white text-sm">
                                {contrat.numero_police}
                            </div>
                        </div>
                        <div className="flex gap-8 items-center text-[11px]">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">Date d'effet :</span>
                                <DateDisplay value={contrat.date_effet} />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium">Date d'échéance :</span>
                                <DateDisplay value={contrat.date_echeance} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section: Souscripteur / Assuré principal */}
                <div className="flex border-b border-orange-300">
                    <SectionHeader>Souscripteur <br /> / Assuré <br /> principal</SectionHeader>
                    <div className="flex-grow p-2 space-y-2 bg-orange-50/10">
                        <PrintRow label="Nom" value={contrat.nom} />
                        <PrintRow label="Prénom" value={contrat.prenom} />
                        <PrintRow label="Adresse" value={contrat.adresse} />
                        <PrintRow label="Ville" value={contrat.ville} />
                        <PrintRow label="Téléphone" value={contrat.telephone} />
                        <PrintRow label="Email" value={contrat.email} />
                    </div>
                </div>

                {/* Section: Assurés associés */}
                <div className="flex border-b border-orange-300">
                    <SectionHeader>Assurés <br /> associés</SectionHeader>
                    <div className="flex-grow">
                        <table className="w-full text-[9px] border-collapse bg-white">
                            <thead className="bg-orange-50/20">
                                <tr className="font-bold text-gray-800 text-center">
                                    <th className="p-1 border-r border-orange-200 border-b w-1/6">Lien</th>
                                    <th className="p-1 border-r border-orange-200 border-b w-1/6">Nom</th>
                                    <th className="p-1 border-r border-orange-200 border-b w-1/6">Prénom</th>
                                    <th className="p-1 border-r border-orange-200 border-b w-1/6">Date de nais.</th>
                                    <th className="p-1 border-r border-orange-200 border-b w-1/6">Lieu de nais.</th>
                                    <th className="p-1 border-b">Contact</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(() => {
                                    const rows = [...(contrat.assures_associes || [])];
                                    while (rows.length < 5) rows.push({ lien: '', nom: '', prenom: '', date_naissance: '', lieu_naissance: '', contact: '' });
                                    return rows.slice(0, 5).map((row, i) => (
                                        <tr key={i} className="h-6 border-b border-orange-100 italic text-center font-bold text-gray-900">
                                            <td className="border-r border-orange-100">{row.lien}</td>
                                            <td className="border-r border-orange-100">{row.nom}</td>
                                            <td className="border-r border-orange-100">{row.prenom}</td>
                                            <td className="border-r border-orange-100">{row.date_naissance}</td>
                                            <td className="border-r border-orange-100">{row.lieu_naissance}</td>
                                            <td>{row.contact}</td>
                                        </tr>
                                    ));
                                })()}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Section: Garanties */}
                <div className="flex border-b border-orange-300 font-serif">
                    <SectionHeader>Garanties (1)</SectionHeader>
                    <div className="flex-grow p-3 text-[11px] leading-snug">
                        En cas de décès d'un membre de la famille (assuré principal ou assurés associés), l'Assureur verse un montant forfaitaire pour les frais funéraires de <span className="font-bold">200.000 F CFA</span>
                    </div>
                </div>

                {/* Section: Cotisations */}
                <div className="flex">
                    <SectionHeader>Cotisations</SectionHeader>
                    <div className="flex-grow p-3 text-[11px] space-y-1">
                        <div className="font-bold">Prime TTC :</div>
                        <div className="flex gap-6 mt-1">
                            <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 border border-black flex items-center justify-center ${contrat.periodicite === 'semestre' ? 'bg-black text-white' : 'bg-white'}`}>
                                    {contrat.periodicite === 'semestre' && <Check className="w-3 h-3" />}
                                </div>
                                <span className="font-medium">Semestrielle : <span className="font-bold tracking-tight">12 500 FCFA</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 border border-black flex items-center justify-center ${contrat.periodicite === 'annuel' ? 'bg-black text-white' : 'bg-white'}`}>
                                    {contrat.periodicite === 'annuel' && <Check className="w-3 h-3" />}
                                </div>
                                <span className="font-medium">Annuelle : <span className="font-bold tracking-tight">25 000 FCFA</span></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Note (1) */}
            <div className="mt-2 text-[11px] font-bold px-1 italic">
                (1) Le montant maximal de couverture est de 1 000 000 FCFA.
            </div>

            {/* Date and Signature Line */}
            <div className="mt-10 mb-8 font-serif">
                <div className="text-right text-[11px] mb-8 pr-12 font-medium">
                    Fait à <span className="font-bold underline">Libreville</span>, le <span className="font-bold">{new Date(contrat.created_at || Date.now()).toLocaleDateString('fr-FR')}</span>
                </div>

                <div className="flex justify-between items-start px-8">
                    <div className="w-2/5 flex flex-col items-center">
                        <div className="font-bold text-[12px] mb-2 uppercase tracking-wide">Le Souscripteur</div>
                        <div className="w-full h-24 border border-gray-300 rounded-sm"></div>
                    </div>

                    <div className="w-2/5 flex flex-col items-center">
                        <div className="font-bold text-[12px] mb-2 uppercase tracking-wide">L'Assureur</div>
                        <div className="w-full h-24 border border-gray-400 rounded-sm flex items-center justify-center">

                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

const PrintRow: React.FC<{ label: string, value?: string }> = ({ label, value }) => (
    <div className="flex items-center gap-2 text-[11px]">
        <span className="w-24 font-medium uppercase">{label} :</span>
        <div className="flex-grow border-b border-gray-400 font-bold text-gray-900 pb-0.5 min-h-[1.2rem]">
            {value}
        </div>
    </div>
);
