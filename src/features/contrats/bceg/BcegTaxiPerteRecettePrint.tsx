import React from 'react'
import { Check } from 'lucide-react'
import { BcegTaxiPerteRecetteContrat } from '@/types/bcegTaxi'
import logoSamba from '@/assets/logo-samba.png'

// --- Internal Reusable Components Matching Create Form ---

const Logo: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center w-28">
            <img
                src={logoSamba}
                alt="SAMB'A Assurances"
                className="w-full h-auto object-contain"
            />
        </div>
    );
};

const DateDisplay: React.FC<{ label: string; value: string }> = ({ label, value }) => {
    // Normalize value to YYYY-MM-DD (handle ISO strings)
    const normalizedValue = value ? value.split('T')[0] : '';
    const [year, month, day] = normalizedValue ? normalizedValue.split('-') : ['  ', '  ', '    '];

    return (
        <div className="flex items-center gap-2 text-[11px]">
            <span className="font-bold">{label} :</span>
            <div className="flex items-center gap-1">
                <div className="w-8 text-center border border-black rounded px-1 py-0.5 font-mono font-bold">{day}</div>
                <span className="font-bold">/</span>
                <div className="w-8 text-center border border-black rounded px-1 py-0.5 font-mono font-bold">{month}</div>
                <span className="font-bold">/</span>
                <div className="w-14 text-center border border-black rounded px-1 py-0.5 font-mono font-bold">{year}</div>
            </div>
        </div>
    );
}

const Footer: React.FC = () => {
    return (
        <div className="mt-auto pt-4 flex flex-col items-center">
            <div className="w-full flex justify-between items-end mb-4 px-2">
                <div className="text-[9px] text-gray-800 font-bold max-w-[60%] leading-tight">
                    SAMB'A ASSURANCES GABON S.A.<br />
                    <span className="font-normal text-[8px] text-gray-600">
                        Société Anonyme avec Conseil d'Administration et Président Directeur Général. Entreprise de micro-assurance régie par le Code des Assurances CIMA et agréée par la CRCA sous le N° 0270 / L / CIMA / CRCA / PDT / 2024, et le Ministère de l'Economie et des Participations par l'Arrêté N° 036.24 / MEP, au capital de 610.000.000 de FCFA dont 536.000.000 de FCFA libérés. R.C.C.M : N° GA - LBV - 01 - 2024 - B14 - 00003 | N° STATISTIQUE : 202401003647 R
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Nairobi_Declaration_on_Sustainable_Insurance_logo.png/220px-Nairobi_Declaration_on_Sustainable_Insurance_logo.png" alt="Nairobi Declaration" className="h-10 object-contain grayscale opacity-70" />
                    <div className="border border-black w-8 h-8 flex items-center justify-center font-bold text-xs">1</div>
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
};

interface BcegTaxiPerteRecettePrintProps {
    contrat: BcegTaxiPerteRecetteContrat
}

export const BcegTaxiPerteRecettePrint: React.FC<BcegTaxiPerteRecettePrintProps> = ({ contrat }) => {

    const GridRow = ({ label, valueAssure, valueSouscripteur, isLast = false }: { label: string; valueAssure: React.ReactNode; valueSouscripteur: React.ReactNode; isLast?: boolean }) => (
        <React.Fragment>
            <div className={`p-2 font-bold border-b border-[#F48232] flex items-center ${isLast ? 'border-b-0' : ''}`}>
                {label}
            </div>
            <div className={`border-l border-b border-[#F48232] p-2 ${isLast ? 'border-b-0' : ''}`}>
                <div className="w-full bg-transparent font-semibold min-h-[1.2em]">
                    {valueSouscripteur || ''}
                </div>
            </div>
            <div className={`border-l border-b border-[#F48232] p-2 ${isLast ? 'border-b-0' : ''}`}>
                <div className="w-full bg-transparent font-semibold min-h-[1.2em]">
                    {valueAssure || ''}
                </div>
            </div>
        </React.Fragment>
    )

    return (
        <div className="bg-white w-[210mm] min-h-[297mm] p-[10mm] relative flex flex-col border border-gray-300 print:shadow-none print:p-[5mm] print:border-none mx-auto overflow-hidden">

            {/* Header Section */}
            <div className="flex justify-between items-start mb-4">
                <Logo />
                <div className="flex flex-col items-center flex-grow pt-2">
                    <h1 className="text-[#F48232] text-2xl font-bold italic text-center tracking-tight leading-none">
                        Contrat: SAMB'A TAXIS
                    </h1>
                    <div className="text-[9px] text-gray-600 font-medium mt-1 text-center italic">
                        Contrat régi par les dispositions du Code des assurances CIMA
                    </div>
                    <h2 className="text-[#F48232] text-lg font-bold uppercase mt-3 tracking-wider">
                        CONDITIONS PARTICULIERES : PERTE DE RECETTES
                    </h2>
                </div>
                <div className="w-28"></div>
            </div>

            {/* Top Info Fields */}
            <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2 text-[11px]">
                    <span className="font-bold">Numéro de police :</span>
                    <div className="w-48 border border-black rounded px-2 py-0.5 font-bold text-orange-600 bg-transparent">
                        {contrat.numero_police}
                    </div>
                </div>

                <div className="flex justify-between">
                    <DateDisplay label="Date d'effet" value={contrat.date_effet} />
                    <DateDisplay label="Date d'échéance" value={contrat.date_echeance} />
                </div>
            </div>

            {/* Main Data Grid */}
            <div className="w-full border border-[#F48232] rounded-sm overflow-hidden mb-6">
                <div className="grid grid-cols-[1fr_2fr_2fr] bg-white text-[11px]">
                    {/* Header Row */}
                    <div className="border-b border-[#F48232] bg-white p-2"></div>
                    <div className="border-b border-l border-[#F48232] bg-orange-50/50 p-2 font-bold italic text-center">Souscripteur</div>
                    <div className="border-b border-l border-[#F48232] bg-orange-50/50 p-2 font-bold italic text-center">Assuré</div>

                    <GridRow label="Nom" valueAssure={contrat.nom?.toUpperCase()} valueSouscripteur={(contrat.souscripteur_nom || contrat.nom)?.toUpperCase()} />
                    <GridRow label="Prénom" valueAssure={contrat.prenom} valueSouscripteur={contrat.souscripteur_prenom || contrat.prenom} />
                    <GridRow label="Date de naissance" valueAssure={contrat.date_naissance} valueSouscripteur={contrat.souscripteur_date_naissance || contrat.date_naissance} />
                    <GridRow label="Numéro d'identité" valueAssure={contrat.numero_identite} valueSouscripteur={contrat.souscripteur_numero_identite || contrat.numero_identite} />
                    <GridRow label="Numéro d'immatriculation du taxi" valueAssure={contrat.immatriculation_taxi?.toUpperCase()} valueSouscripteur={(contrat.souscripteur_immatriculation_taxi || contrat.immatriculation_taxi)?.toUpperCase()} />
                    <GridRow label="Adresse" valueAssure={contrat.adresse} valueSouscripteur={contrat.souscripteur_adresse || contrat.adresse} />
                    <GridRow label="BP" valueAssure={contrat.bp} valueSouscripteur={contrat.souscripteur_bp || contrat.bp} />
                    <GridRow label="Ville" valueAssure={contrat.ville} valueSouscripteur={contrat.souscripteur_ville || contrat.ville} />
                    <GridRow label="Téléphone" valueAssure={contrat.telephone} valueSouscripteur={contrat.souscripteur_telephone || contrat.telephone} />
                    <GridRow label="Email" valueAssure={contrat.email} valueSouscripteur={contrat.souscripteur_email || contrat.email} isLast />
                </div>
            </div>

            {/* Contact info */}
            <div className="flex gap-8 mb-8 text-[11px] items-center">
                <div className="flex items-center gap-2 flex-grow">
                    <span className="font-bold">Contacter en cas de besoin :</span>
                    <div className="flex-grow border border-black rounded px-2 py-0.5 bg-transparent font-medium">
                        {contrat.contact_nom}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-bold">Tel. :</span>
                    <div className="w-40 border border-black rounded px-2 py-0.5 bg-transparent font-medium">
                        {contrat.contact_telephone}
                    </div>
                </div>
            </div>

            {/* Garanties Section */}
            <div className="mb-8 space-y-4 px-2">
                <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-black mt-1 flex-shrink-0"></div>
                    <div className="flex flex-col">
                        <h3 className="font-bold text-lg mb-2">Garanties :</h3>
                        <ul className="space-y-2 text-[12px] font-medium pl-2">
                            <li className="flex items-baseline gap-2">
                                <span className="text-[10px]">◆</span>
                                <span>Indemnités perte de recette: <span className="font-bold">10 000 FCFA / jour</span> ; durée maximum d'indemnisation : <span className="font-bold">10 jours</span>.</span>
                            </li>
                            <li className="flex items-baseline gap-2">
                                <span className="text-[10px]">◆</span>
                                <span>Plafond d'indemnisation : <span className="font-bold">100 000 FCFA/an/personne</span>.</span>
                            </li>
                            <li className="flex items-center gap-3 pl-4 mt-2">
                                <div className="flex gap-4 items-center">
                                    <div className="flex items-center gap-1">
                                        <div className="w-4 h-4 border border-black flex items-center justify-center bg-white">
                                            {contrat.periodicite === 'annuel' && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
                                        </div>
                                        <span className="italic">Annuel (25 000 FCFA)</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-4 h-4 border border-black flex items-center justify-center bg-white">
                                            {contrat.periodicite === 'semestre' && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
                                        </div>
                                        <span className="italic">Semestriel (12 500 FCFA)</span>
                                    </div>
                                </div>
                            </li>
                            <li className="flex items-center gap-3 pl-4">
                                <div className="w-2 h-2 border border-black rounded-full"></div>
                                <span className="italic">Cotisations : <span className="font-bold">25 000 FCFA TTC par an</span> soit <span className="font-bold">12 500 FCFA TTC par semestre</span>.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Signature Line */}
            <div className="text-right text-[11px] italic mb-6 pr-12">
                Fait à <span className="inline-block border-b border-black min-w-[120px] text-center">Libreville</span>, le <span className="inline-block border-b border-black min-w-[120px] text-center">{new Date(contrat.created_at || new Date()).toLocaleDateString('fr-FR')}</span>
            </div>

            {/* Signature Blocks */}
            <div className="flex justify-between items-start px-8 mb-12">
                <div className="flex flex-col items-start w-1/3">
                    <div className="font-bold text-[12px] mb-2 italic">Le Souscripteur</div>
                    <div className="w-full h-24 border border-gray-400 rounded-sm p-2 flex items-start">
                        <span className="text-[10px] text-gray-300 italic">Signature</span>
                    </div>
                </div>
                <div className="flex flex-col items-start w-1/3">
                    <div className="font-bold text-[12px] mb-2 italic">L'Assureur</div>
                    <div className="w-full h-24 border border-gray-400 rounded-sm p-2 flex items-start">
                        <span className="text-[10px] text-gray-300 italic">Signature</span>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
