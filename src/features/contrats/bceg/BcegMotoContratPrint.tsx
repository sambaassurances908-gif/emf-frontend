import React from 'react'
import { BcegMotoContrat } from '@/types/bcegMoto'
import logoSamba from '@/assets/logo-samba.png'

// --- Internal Reusable Components ---

const Logo: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center">
            <img
                src={logoSamba}
                alt="SAMB'A Assurances"
                className="h-[80px] w-auto"
            />
        </div>
    );
};

const FormInput: React.FC<{ label?: string; value: any; className?: string; type?: string; placeholder?: string; readOnly?: boolean }> = ({ label, value, className = "" }) => (
    <div className="flex items-end w-full">
        {label && <span className="mr-2 whitespace-nowrap text-[11px] text-gray-800">{label}</span>}
        <div className={`flex-grow border-b border-gray-400 bg-transparent text-[11px] px-1 py-0 min-h-[16px] font-semibold ${className}`}>
            {value}
        </div>
    </div>
);

const SectionLabel: React.FC<{ children: React.ReactNode; bgColor?: string }> = ({ children, bgColor = "bg-white" }) => (
    <div className={`w-36 flex-shrink-0 p-2 italic border-r border-gray-300 flex items-center text-[11px] font-medium text-gray-700 ${bgColor}`}>
        {children}
    </div>
);

const Footer: React.FC = () => {
    return (
        <div className="mt-auto pt-4 text-center text-[8px] text-gray-600 space-y-1 leading-tight">
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

            <div className="flex justify-between items-start pt-3 px-4 relative border-t border-gray-300 mt-2">
                <div className="flex flex-col items-center w-1/3 text-center border-r border-gray-300">
                    <div className="font-semibold text-gray-700 text-[9px]">326 Rue Jean-Baptiste NDENDE</div>
                    <div className="text-[8px]">Avenue de COINTET | Centre-Ville | Libreville</div>
                </div>
                <div className="flex flex-col items-center w-1/3 text-center border-r border-gray-300">
                    <div className="font-semibold text-gray-700 text-[9px]">B.P : 22 215 | Libreville | Gabon</div>
                    <div className="text-[8px]">Email : infos@samba-assurances.com</div>
                </div>
                <div className="flex flex-col items-center w-1/3 text-center">
                    <div className="font-semibold text-gray-700 text-[9px]">(+241) 060 08 62 62 - 074 40 41 41</div>
                    <div className="text-[8px]">074 40 51 51</div>
                </div>
                <div className="absolute -bottom-2 right-4 w-6 h-6 border border-black flex items-center justify-center font-bold text-[10px]">1</div>
            </div>
        </div>
    );
};

interface BcegMotoContratPrintProps {
    contrat: BcegMotoContrat
}

export const BcegMotoContratPrint: React.FC<BcegMotoContratPrintProps> = ({ contrat }) => {
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('fr-FR').format(val)
    }

    return (
        <div className="bg-white w-[210mm] min-h-[297mm] p-[10mm] relative flex flex-col border border-gray-300 print:shadow-none print:p-[5mm] mx-auto overflow-hidden">
            {/* Header Section */}
            <div className="flex justify-between items-start mb-1">
                <Logo />
                <div className="flex flex-col items-center flex-grow pt-4">
                    <h1 className="text-[#F48232] text-3xl font-bold italic text-center tracking-tight leading-none">
                        Contrat SAMB'A MOTO
                    </h1>
                    <div className="text-[10px] text-gray-700 font-medium mt-2 text-center leading-tight">
                        Contrat régi par les dispositions du Code des assurances CIMA<br />
                        Visas DNA N°005/24 et N°004/24 - Police N° {contrat.numero_police || '509/111.701/0125'}
                    </div>
                    <h2 className="text-[#F48232] text-xl font-bold uppercase mt-4 tracking-[0.2em]">
                        CONDITIONS PARTICULIERES
                    </h2>
                </div>
                <div className="w-24"></div>
            </div>

            {/* Main Form Table */}
            <div className="border border-gray-400 w-full flex flex-col mt-4">

                {/* Section: Couverture */}
                <div className="flex border-b border-gray-300">
                    <SectionLabel bgColor="bg-orange-50/50">Couverture</SectionLabel>
                    <div className="flex-grow p-2 space-y-1.5">
                        <div className="flex">
                            <FormInput
                                label="N° Police :"
                                value={contrat.numero_police || 'EN ATTENTE'}
                                className="text-orange-600 font-bold"
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <FormInput
                                    label="Statut :"
                                    value={contrat.statut || 'En attente'}
                                />
                            </div>
                            <div className="flex-1">
                                <FormInput
                                    label="Catégorie :"
                                    value={contrat.categorie || 'Standard'}
                                />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <FormInput
                                    label="Montant du prêt :"
                                    value={formatCurrency(Number(contrat.montant_pret))}
                                />
                            </div>
                            <div className="flex-1">
                                <FormInput
                                    label="Durée du prêt :"
                                    value={`${contrat.duree_pret} Mois`}
                                />
                            </div>
                        </div>
                        <div className="flex">
                            <FormInput
                                label="Date d'effet :"
                                value={contrat.date_effet}
                            />
                        </div>
                        <div className="flex">
                            <FormInput
                                label="Date de fin d'échéance :"
                                value={contrat.date_fin_echeance}
                                className="text-gray-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Section: Souscripteur / Personne assurée */}
                <div className="flex border-b border-gray-300">
                    <SectionLabel bgColor="bg-orange-100/40">Souscripteur /<br />Personne assurée</SectionLabel>
                    <div className="flex-grow p-2 space-y-2 bg-orange-100/20">
                        <FormInput
                            label="Nom :"
                            value={contrat.nom?.toUpperCase()}
                        />
                        <FormInput
                            label="Prénom :"
                            value={contrat.prenom}
                        />
                        <FormInput
                            label="Ville :"
                            value={contrat.ville}
                        />
                        <FormInput
                            label="Adresse et téléphone :"
                            value={contrat.adresse_telephone}
                        />
                        <div className="flex gap-4">
                            <FormInput
                                label="Marque/Type d'engin :"
                                value={contrat.marque_type_engin}
                            />
                            <FormInput
                                label="Immatriculation :"
                                value={contrat.immatriculation?.toUpperCase()}
                            />
                        </div>
                        <FormInput
                            label="Valeur assurée :"
                            value={contrat.valeur_assuree ? formatCurrency(Number(contrat.valeur_assuree)) : '0'}
                        />
                    </div>
                </div>

                {/* Section: Garanties */}
                <div className="flex border-b border-gray-300">
                    <SectionLabel>Garanties</SectionLabel>
                    <div className="flex-grow flex flex-col">
                        {/* Primary Guarantee Table */}
                        <table className="w-full text-[11px] border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-300">
                                <tr className="font-bold text-gray-700">
                                    <th className="p-1 border-r border-gray-300 text-left w-6/12 font-normal italic"></th>
                                    <th className="p-1 border-r border-gray-300 text-center w-24">Option</th>
                                    <th className="p-1 text-center">Taux de prime unique</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="bg-orange-100/20">
                                    <td className="p-2 border-r border-gray-300">Décès – invalidité (1)</td>
                                    <td className="p-2 border-r border-gray-300 text-center flex justify-center items-center">
                                        <div className="w-8 h-4 bg-black rounded-sm"></div>
                                    </td>
                                    <td className="p-2 text-center font-bold">{contrat.taux_prime_unique || '0,50%'}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Complementary Guarantees */}
                        <div className="p-4 space-y-3 text-[11px]">
                            <div className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-black mt-1 flex-shrink-0"></div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-lg mb-1">Garanties complémentaires :</span>
                                    <div className="pl-4 space-y-2">
                                        <div>
                                            <span className="font-bold flex items-center gap-1">
                                                <span className="text-[8px]">◆</span> Perte de recette : 5 000 FCFA/ jour ; durée maximum d'indemnisation : 10 jours.
                                            </span>
                                            <div className="pl-4 space-y-0.5 mt-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-1.5 h-px bg-black"></span>
                                                    <span>Plafond d'indemnisation : 50 000 FCFA/an/personne.</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-1.5 h-px bg-black"></span>
                                                    <span>Cotisations : 25 000 FCFA par an.</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <span className="font-bold flex items-center gap-1">
                                                <span className="text-[8px]">◆</span> Dommages subis par l'engin :
                                            </span>
                                            <div className="pl-4 space-y-0.5 mt-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-1.5 h-px bg-black"></span>
                                                    <span>Plafond d'indemnisation : 1 000 000 FCFA/an/engin.</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-1.5 h-px bg-black"></span>
                                                    <span>Cotisations : 10 000 FCFA par an.</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section: Cotisations */}
                <div className="flex bg-gray-50/50">
                    <SectionLabel>Cotisations</SectionLabel>
                    <div className="flex-grow p-3">
                        <div className="flex items-center font-bold text-[12px]">
                            <span className="whitespace-nowrap">Prime totale :</span>
                            <div className="flex-grow border-b border-black mx-2 h-5 text-right px-2 text-sm">
                                {contrat.prime_totale > 0 && `${formatCurrency(Number(contrat.prime_totale))} FCFA`}
                            </div>
                            <span className="whitespace-nowrap">FCFA TTC (35.000 FCFA) + ({contrat.taux_prime_unique || '0,50%'} x Prêt)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Legal Notes */}
            <div className="mt-2 space-y-1 text-[11px] font-bold text-black px-1 leading-tight">
                <div className="flex items-start">
                    <span className="w-6 flex-shrink-0">(1)</span>
                    <p>Le montant maximal de couverture est de 3 500 000 FCFA.</p>
                </div>
            </div>

            {/* Signatures and Date */}
            <div className="mt-8 mb-4">
                <div className="text-right text-[11px] mb-6 pr-12 font-medium italic">
                    Fait à <span className="inline-block border-b border-black min-w-[120px] text-center">Libreville</span>, le <span className="inline-block border-b border-black min-w-[120px] text-center">{new Date(contrat.created_at || new Date()).toLocaleDateString('fr-FR')}</span>
                </div>

                <div className="flex justify-between items-start px-4">
                    <div className="w-5/12 flex flex-col items-center">
                        <div className="font-bold text-[11px] mb-2 uppercase">Le Souscripteur</div>
                        <div className="w-full h-24 border border-black flex flex-col items-center justify-center relative bg-white">
                            <span className="text-[10px] text-gray-300 italic">Signature et cachet</span>
                        </div>
                        <div className="w-full mt-4 space-y-1 text-[10px] font-medium pl-2">
                            <div>Feuillet 1 : Assuré</div>
                            <div>Feuillet 3 : SAMB'A</div>
                        </div>
                    </div>

                    <div className="w-2/12 h-24 flex flex-col items-center justify-center">
                    </div>

                    <div className="w-5/12 flex flex-col items-center">
                        <div className="font-bold text-[11px] mb-2 uppercase">L'Assureur</div>
                        <div className="w-full h-24 border border-black flex flex-col items-center justify-center relative bg-white">
                            <span className="text-[10px] text-gray-300 italic">Signature et cachet</span>
                        </div>
                        <div className="w-full mt-4 space-y-1 text-[10px] font-medium pl-2">
                            <div>Feuillet 2 : BCEG</div>
                            <div>Feuillet 4 : Souche</div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
