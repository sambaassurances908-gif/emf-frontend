// src/features/contrats/agrpro/AgrProContractPrint.tsx
import React from 'react'
import { Mail, Phone, MapPin } from 'lucide-react'
import { AgrProContrat } from '@/types/agrpro'
import { formatCurrency } from '@/lib/utils'
import logoSamba from '@/assets/logo-samba.png'

interface AgrProContractPrintProps {
    contrat: AgrProContrat
}

// --- Logo Component ---
const Logo: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center">
            <img src={logoSamba} alt="SAMB'A Assurances" className="h-[80px] w-auto" />
        </div>
    )
}

// --- Section Label Component ---
const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="w-40 flex-shrink-0 p-2 italic border-r border-[#F48232] flex items-center text-[10px] font-medium text-gray-700 bg-white leading-tight">
        {children}
    </div>
)

// --- Display Field Component (read-only) ---
interface DisplayFieldProps {
    label: string
    value?: string | number | null
    className?: string
}

const DisplayField: React.FC<DisplayFieldProps> = ({ label, value, className = "" }) => (
    <div className={`flex items-center gap-2 text-[10px] ${className}`}>
        <span className="w-32 font-medium">{label}</span>
        <div className="flex-grow border-b border-gray-400 py-1 px-2 min-h-[20px] bg-transparent">
            {value || '-'}
        </div>
    </div>
)

// --- Toggle Switch Display (read-only, always active) ---
const ToggleSwitchDisplay: React.FC<{ active?: boolean }> = ({ active = true }) => (
    <div className={`w-10 h-5 rounded-full p-1 flex items-center ${active ? 'bg-black' : 'bg-gray-300'} cursor-default`}>
        <div className={`w-3 h-3 rounded-full bg-white transition-transform ${active ? 'translate-x-5' : 'translate-x-0'}`} />
    </div>
)

// --- Footer Component ---
const Footer: React.FC = () => (
    <div className="mt-auto pt-4 flex flex-col items-center border-t border-gray-100">
        <div className="w-full text-center text-[9px] text-gray-800 font-bold mb-1 uppercase">
            SAMB'A ASSURANCES GABON S.A.
        </div>
        <div className="w-full text-center text-[8px] text-gray-600 mb-2 leading-tight">
            Société Anonyme avec Conseil d'Administration et Président Directeur Général.<br />
            Entreprise de micro-assurance régie par le Code des Assurances CIMA, au capital de 610.000.000 de Francs FCFA, dont 536.000.000 de Francs CFA libérés.<br />
            R.C.C.M : N° GA - LBV - 01 - 2024 - B14 - 00003 | N° STATISTIQUE : 202401003647 R
        </div>

        <div className="w-full grid grid-cols-3 gap-2 px-2 pb-2 mt-2">
            <div className="flex flex-col items-center text-center">
                <MapPin size={12} className="text-[#F48232] mb-0.5" />
                <div className="text-[7px] font-bold text-gray-800">Quartier Louis | 85 Rue Pierre BARRO</div>
                <div className="text-[7px] text-gray-600">Immeuble Zahra | Libreville</div>
            </div>
            <div className="flex flex-col items-center text-center">
                <Mail size={12} className="text-[#F48232] mb-0.5" />
                <div className="text-[7px] font-bold text-gray-800">B.P : 22 215 | Libreville | Gabon</div>
                <div className="text-[7px] text-gray-600">Email : infos@samba-assurances.com</div>
            </div>
            <div className="flex flex-col items-center text-center">
                <Phone size={12} className="text-[#F48232] mb-0.5" />
                <div className="text-[7px] font-bold text-gray-800">(+241) 060 08 62 62 - 074 40 41 41</div>
                <div className="text-[7px] text-gray-600">074 40 51 51</div>
            </div>
        </div>
    </div>
)

export const AgrProContractPrint = ({ contrat }: AgrProContractPrintProps) => {
    // Format date helper
    const formatDate = (dateString?: string | null) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('fr-FR')
    }

    // Calcul cotisation
    const montantPret = Number(contrat.montant_pret_assure) || 0
    const primeUnique = 5000
    const primeVariable = Math.round(montantPret * 0.03)
    const primeTotale = Number(contrat.prime_totale) || (primeUnique + primeVariable)

    return (
        <div className="bg-white w-[210mm] min-h-[297mm] p-[10mm] shadow-2xl relative flex flex-col border border-gray-300 print:shadow-none print:border-none overflow-hidden mx-auto font-sans">
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
                <Logo />
                <div className="flex flex-col items-center flex-grow pt-4">
                    <h1 className="text-[#F48232] text-xl font-bold italic text-center tracking-tight leading-none uppercase">
                        CONTRAT DECES EMPRUNTEUR : AGR PRO CONSULTING
                    </h1>
                    <div className="text-[10px] text-gray-400 font-medium mt-1 text-center italic">
                        Contrat régi par les dispositions du Code des assurances CIMA
                    </div>
                    <div className="text-gray-800 text-sm font-bold mt-2">
                        Convention N°: 202.111/0724
                    </div>
                    <div className="text-[#F48232] text-lg font-bold italic mt-1">
                        AVENANT N°01
                    </div>
                    <h2 className="text-[#F48232] text-xl font-bold uppercase mt-2 tracking-wider">
                        CONDITIONS PARTICULIERES
                    </h2>
                </div>
                <div className="w-24"></div>
            </div>

            {/* Sections Grid */}
            <div className="w-full border border-[#F48232] flex flex-col mt-4">

                {/* Section: Couverture */}
                <div className="flex border-b border-[#F48232]">
                    <SectionLabel>Couverture</SectionLabel>
                    <div className="flex-grow p-2 grid grid-cols-2 gap-y-2 gap-x-4">
                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="w-32 font-medium">Numéro de police :</span>
                            <div className="flex-grow border-b border-gray-400 py-1 px-2 bg-transparent font-bold">
                                {contrat.numero_police || 'EN ATTENTE'}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="w-32 font-medium">Durée du prêt (mois) :</span>
                            <div className="flex-grow border-b border-gray-400 py-1 px-2 bg-transparent">
                                {contrat.duree_pret || '-'}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="w-32 font-medium">Montant du prêt assuré :</span>
                            <div className="flex-grow border-b border-gray-400 py-1 px-2 bg-transparent">
                                {montantPret ? formatCurrency(montantPret) : '-'}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="w-32 font-medium">Date d'effet :</span>
                            <div className="flex-grow border-b border-gray-400 py-1 px-2 bg-transparent">
                                {formatDate(contrat.date_effet)}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] col-span-2">
                            <span className="w-32 font-medium">Date de fin d'échéance :</span>
                            <div className="flex-grow border-b border-gray-400 py-1 px-2 bg-transparent">
                                {formatDate(contrat.date_fin_echeance)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section: Personne assurée */}
                <div className="flex border-b border-[#F48232]">
                    <SectionLabel>Personne assurée</SectionLabel>
                    <div className="flex-grow p-2 space-y-1.5 bg-orange-50/10">
                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="w-24 font-medium">Nom :</span>
                            <div className="flex-grow border-b border-gray-400 px-1 h-5 bg-transparent flex items-center">
                                {contrat.nom || '-'}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="w-24 font-medium">Prénom :</span>
                            <div className="flex-grow border-b border-gray-400 px-1 h-5 bg-transparent flex items-center">
                                {contrat.prenom || '-'}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="w-24 font-medium">Adresse :</span>
                            <div className="flex-grow border-b border-gray-400 px-1 h-5 bg-transparent flex items-center">
                                {contrat.adresse || '-'}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="w-24 font-medium">Ville :</span>
                            <div className="flex-grow border-b border-gray-400 px-1 h-5 bg-transparent flex items-center">
                                {contrat.ville || '-'}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="w-24 font-medium">Téléphone :</span>
                            <div className="flex-grow border-b border-gray-400 px-1 h-5 bg-transparent flex items-center">
                                {contrat.telephone || '-'}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="w-24 font-medium">Email :</span>
                            <div className="flex-grow border-b border-gray-400 px-1 h-5 bg-transparent flex items-center">
                                {contrat.email || '-'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section: Souscripteur / Association */}
                <div className="flex border-b border-[#F48232]">
                    <SectionLabel>Souscripteur/Association</SectionLabel>
                    <div className="flex-grow p-2 space-y-1 text-[10px]">
                        <div className="flex"><span className="w-24 font-medium">Raison sociale :</span><span className="flex-grow">AGR PRO CONSULTING</span></div>
                        <div className="flex"><span className="w-24 font-medium">RCCM :</span><span className="flex-grow">RG LBV 2018A47379 / NIF N° 285676 Г</span></div>
                        <div className="flex"><span className="w-24 font-medium">Adresse :</span><span className="flex-grow">Entre le Carrefour ancienne Sobraga et ancienne RTG 1</span></div>
                        <div className="flex"><span className="w-24 font-medium">Ville :</span><span className="flex-grow">Libreville</span></div>
                        <div className="flex"><span className="w-24 font-medium">Téléphone :</span><span className="flex-grow">060501849 / 074250462</span></div>
                        <div className="flex"><span className="w-24 font-medium">Email :</span><span className="flex-grow text-blue-600 underline">agrproconsulting@gmail.com</span></div>
                    </div>
                </div>

                {/* Section: Bénéficiaire */}
                <div className="flex border-b border-[#F48232]">
                    <SectionLabel>Bénéficiaire de la <br /> Prévoyance</SectionLabel>
                    <div className="flex-grow p-2 space-y-1.5">
                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="w-24 font-medium">Nom :</span>
                            <div className="flex-grow border-b border-gray-400 px-1 h-5 bg-transparent flex items-center">
                                {contrat.beneficiaire_prevoyance_nom || '-'}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="w-24 font-medium">Prénom :</span>
                            <div className="flex-grow border-b border-gray-400 px-1 h-5 bg-transparent flex items-center">
                                {contrat.beneficiaire_prevoyance_prenom || '-'}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="w-24 font-medium">Téléphone :</span>
                            <div className="flex-grow border-b border-gray-400 px-1 h-5 bg-transparent flex items-center">
                                {contrat.beneficiaire_prevoyance_telephone || '-'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section: Garanties Table */}
                <div className="flex border-b border-[#F48232]">
                    <SectionLabel>Garanties</SectionLabel>
                    <div className="flex-grow overflow-hidden">
                        <table className="w-full text-[10px] border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr className="font-bold">
                                    <th className="p-2 border-r border-gray-200 text-left">Garanties</th>
                                    <th className="p-2 border-r border-gray-200">Type de cible</th>
                                    <th className="p-2 border-r border-gray-200">Option</th>
                                    <th className="p-2 border-r border-gray-200">Taux</th>
                                    <th className="p-2">Prime unique</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="p-2 border-r border-gray-200">Prévoyance Décès - IAD¹</td>
                                    <td className="p-2 border-r border-gray-200 text-center text-gray-400">Toute catégorie</td>
                                    <td className="p-2 border-r border-gray-200 flex justify-center">
                                        <ToggleSwitchDisplay active={true} />
                                    </td>
                                    <td className="p-2 border-r border-gray-200 text-center">N/A</td>
                                    <td className="p-2 text-center font-bold">5.000 FCFA</td>
                                </tr>
                                <tr>
                                    <td className="p-2 border-r border-gray-200">Décès – invalidité absolue et définitive (IAD) <br /> & Perte d'activités</td>
                                    <td className="p-2 border-r border-gray-200 text-center text-gray-400">Toute catégorie</td>
                                    <td className="p-2 border-r border-gray-200 flex justify-center">
                                        <ToggleSwitchDisplay active={true} />
                                    </td>
                                    <td className="p-2 border-r border-gray-200 text-center">3,00%</td>
                                    <td className="p-2 text-center font-bold">N/A</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Section: Cotisations */}
                <div className="flex">
                    <SectionLabel>Cotisations</SectionLabel>
                    <div className="flex-grow p-3 text-[11px] font-bold">
                        Prime totale : <span className="inline-block border-b border-black w-32 ml-1 mr-1 text-center">{primeTotale.toLocaleString()}</span> FCFA TTC
                    </div>
                </div>
            </div>

            {/* Footnotes */}
            <div className="mt-4 space-y-1 text-[10px] font-bold px-1 text-gray-700">
                <div>(1) La Prévoyance est d'un montant de 250 000 FCFA en cas de décès ou d'invalidité absolue et définitive.</div>
                <div>(2) Le montant maximal du prêt couvert est de 1.000.000 FCFA.</div>
                <div>(3) La durée maximale d'indemnisation pour la garantie perte d'emploi ou d'activités est de 3 mois.</div>
            </div>

            {/* Signature Line */}
            <div className="mt-6 mb-4">
                <div className="text-right text-[11px] mb-8 pr-12 font-medium italic">
                    Fait à <span className="border-b border-black w-56 inline-block text-center">{contrat.ville || 'Libreville'}</span>, le{' '}
                    <span className="border-b border-black w-28 inline-block text-center">
                        {formatDate(contrat.created_at)}
                    </span>
                </div>

                <div className="flex justify-between items-start px-8">
                    <div className="w-[40%] flex flex-col items-center">
                        <div className="font-bold text-[11px] mb-2 uppercase">Le Souscripteur</div>
                        <div className="w-full h-20 border border-gray-400 p-2 relative flex items-center justify-center">
                            <span className="text-[10px] text-gray-300 italic border-b border-gray-100 px-4">Signature et cachet</span>
                        </div>
                    </div>

                    <div className="w-[40%] flex flex-col items-center">
                        <div className="font-bold text-[11px] mb-2 uppercase">L'Assureur</div>
                        <div className="w-full h-20 border border-gray-400 p-2 relative flex items-center justify-center">
                            <span className="text-[10px] text-gray-300 italic border-b border-gray-100 px-4">Signature et cachet</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Legal Text */}
            <div className="mt-6 text-[8px] italic leading-tight text-gray-600 px-2 text-justify">
                ¹Au titre du présent contrat, l'Assuré est considéré comme atteint d'Invalidité Totale et Définitive si avant l'âge limite prévu aux conditions générales, à la suite de maladie ou d'accident, il est reconnu définitivement incapable de se livrer à la moindre occupation, ni au moindre travail lui procurant gain ou profit, et est en outre dans l'obligation d'avoir recours définitivement pour les actes ordinaires de la vie à l'assistance d'une tierce personne.
            </div>

            <Footer />
        </div>
    )
}

export default AgrProContractPrint
