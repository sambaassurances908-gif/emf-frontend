import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useCreateEdgTaxiPrevoyanceDecesContract } from '@/hooks/useEdgTaxiContracts'
import { EdgTaxiPrevoyanceDecesFormData } from '@/types/edgTaxi'
import { Button } from '@/components/ui/button'

// --- Internal Components ---

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

const PipeInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { width?: string }> = ({ width = "w-40", className, ...props }) => (
    <input className={`${width} outline-none border border-black py-0.5 px-2 text-[10px] uppercase font-medium bg-transparent ${className || ''}`} {...props} />
);



const LineInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; flexGrow?: boolean }> = ({ label, flexGrow = true, className, ...props }) => (
    <div className={`flex items-end gap-2 text-[10px] ${flexGrow ? 'flex-grow' : ''}`}>
        <span className="whitespace-nowrap font-medium">{label} :</span>
        <input className={`flex-grow border-b border-gray-300 outline-none px-1 h-5 bg-transparent focus:border-[#F48232] ${className || ''}`} {...props} />
    </div>
);

export const EdgTaxiPrevoyanceDecesCreate = () => {
    const navigate = useNavigate()
    const { userEmfId } = useCurrentUser()
    const { mutate: createContract, isPending } = useCreateEdgTaxiPrevoyanceDecesContract()

    const [formData, setFormData] = useState<EdgTaxiPrevoyanceDecesFormData>({
        emf_id: userEmfId || 0,
        numero_police: '',
        date_effet: new Date().toISOString().split('T')[0],
        date_echeance: '',
        nom: '',
        prenom: '',
        adresse: '',
        ville: '',
        telephone: '',
        email: '',
        periodicite: 'annuel',
        statut: 'Actif',
        categorie: 'commercants',
        numero_taxis: '',
        personne_urgence: '',
        beneficiaire_deces: '',
        visas_dna: '004/24 & N°008/24',
        assures_associes: Array(4).fill(null).map(() => ({
            lien: '', nom: '', prenom: '', date_naissance: '', lieu_naissance: '', contact: ''
        }))
    })

    useEffect(() => {
        if (formData.date_effet) {
            const effet = new Date(formData.date_effet);
            if (!isNaN(effet.getTime())) {
                const echeance = new Date(effet);
                echeance.setFullYear(echeance.getFullYear() + 1);
                echeance.setDate(echeance.getDate() - 1);
                setFormData(prev => ({ ...prev, date_echeance: echeance.toISOString().split('T')[0] }));
            }
        }
    }, [formData.date_effet]);

    const handleSubmit = async () => {
        const payload = {
            ...formData,
            emf_id: userEmfId || 0,
            prime_annuelle: 50000,
            prime_semestrielle: 25000,
            prime_ttc: 50000
        };
        createContract(payload, {
            onSuccess: (data) => {
                navigate(`/contrats/edg-taxi-prevoyance-deces/${data.id}`, {
                    state: { assures_associes: formData.assures_associes }
                });
            },
            onError: (error) => {
                console.error("Erreur création:", error);
                alert("Erreur lors de la création du contrat.");
            }
        });
    }

    const updateAssureAssocie = (index: number, field: string, value: string) => {
        const newAssures = [...(formData.assures_associes || [])];
        if (!newAssures[index]) newAssures[index] = { lien: '', nom: '', prenom: '', date_naissance: '', lieu_naissance: '', contact: '' };
        newAssures[index] = { ...newAssures[index], [field]: value };
        setFormData({ ...formData, assures_associes: newAssures });
    }

    return (
        <div className="min-h-screen bg-gray-200 py-8 flex flex-col items-center font-sans overflow-x-hidden print:bg-white print:py-0">
            {/* Toolbar - Retour */}
            <div className="w-[210mm] mx-auto mb-4 print:hidden flex justify-start">
                <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="bg-white shadow-sm border-gray-300 hover:bg-gray-50 text-gray-700 font-bold">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Retour au tableau de bord
                </Button>
            </div>

            {/* A4 Document Container */}
            <div className="bg-white w-[210mm] min-h-[297mm] p-[8mm] shadow-2xl relative flex flex-col border border-gray-300 print:shadow-none print:border-none print:w-full print:p-0">

                {/* Header Section */}
                <div className="flex justify-between items-start mb-2">
                    <Logo />
                    <div className="flex flex-col items-center flex-grow pt-4">
                        <h1 className="text-[#F48232] text-lg font-bold italic text-center leading-tight uppercase">
                            CONTRAT D'ASSURANCE SAMB'A TAXIS
                        </h1>
                        <h2 className="text-[#F48232] text-lg font-bold italic text-center leading-tight uppercase">
                            PRÉVOYANCE DÉCÈS
                        </h2>
                        <div className="text-[9px] text-gray-500 font-medium mt-1 text-center italic">
                            Contrat régi par les dispositions du Code des Assurances CIMA
                        </div>
                        <div className="text-[9px] text-gray-500 font-medium text-center italic">
                            Visa DNA N°{formData.visas_dna}
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
                                <PipeInput width="w-48" value={formData.numero_police} onChange={(e) => setFormData({ ...formData, numero_police: e.target.value })} placeholder="Auto" />
                            </div>
                            <div className="flex items-center justify-between text-[10px]">
                                <span className="font-medium mr-2">Numéro de Taxis :</span>
                                <PipeInput width="w-48" value={formData.numero_taxis} onChange={(e) => setFormData({ ...formData, numero_taxis: e.target.value })} />
                            </div>
                            <div className="flex items-center justify-between text-[10px]">
                                <span className="font-medium mr-2">Date d'effet :</span>
                                <input type="date" className="outline-none border border-black py-0.5 px-2 text-[10px] bg-transparent w-48" value={formData.date_effet} onChange={(e) => setFormData({ ...formData, date_effet: e.target.value })} />
                            </div>
                            <div className="flex items-center justify-between text-[10px]">
                                <span className="font-medium mr-2">Date d'échéance :</span>
                                <input type="date" className="outline-none border border-black py-0.5 px-2 text-[10px] bg-transparent w-48" value={formData.date_echeance} onChange={(e) => setFormData({ ...formData, date_echeance: e.target.value })} readOnly />
                            </div>
                            {/* Hidden FieldsLogic */}
                            <div className="hidden">
                                <select value={formData.periodicite} onChange={e => setFormData({ ...formData, periodicite: e.target.value as any })}>
                                    <option value="semestre">Semestriel</option>
                                    <option value="annuel">Annuel</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section: Souscripteur & Assuré principal */}
                    <div className="flex border-b border-[#F48232]">
                        <SectionLabel>Souscripteur <br /> & Assuré <br /> principal</SectionLabel>
                        <div className="flex-grow p-3 space-y-2.5">
                            <div className="flex gap-4">
                                <LineInput label="Nom" value={formData.nom} onChange={e => setFormData({ ...formData, nom: e.target.value })} />
                                <LineInput label="Prénom" value={formData.prenom} onChange={e => setFormData({ ...formData, prenom: e.target.value })} />
                            </div>
                            <div className="flex gap-4">
                                <LineInput label="Adresse" value={formData.adresse} onChange={e => setFormData({ ...formData, adresse: e.target.value })} />
                                <LineInput label="Téléphone" value={formData.telephone} onChange={e => setFormData({ ...formData, telephone: e.target.value })} />
                            </div>
                            {/* Email Removed to match Snippet */}
                            <div className="hidden">
                                <LineInput label="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <LineInput label="Personne à contacter en cas d'urgence" value={formData.personne_urgence} onChange={e => setFormData({ ...formData, personne_urgence: e.target.value })} />
                            <LineInput label="Bénéficiaire en cas de décès de l'Assuré principal" value={formData.beneficiaire_deces} onChange={e => setFormData({ ...formData, beneficiaire_deces: e.target.value })} />
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
                                    {[0, 1, 2, 3].map((i) => (
                                        <tr key={i} className="border-b border-gray-200 last:border-0 h-6">
                                            <td className="border-r border-[#F48232]">
                                                <input className="w-full h-full px-1 outline-none text-center bg-transparent"
                                                    value={formData.assures_associes?.[i]?.lien || ''}
                                                    onChange={e => updateAssureAssocie(i, 'lien', e.target.value)}
                                                />
                                            </td>
                                            <td className="border-r border-[#F48232]">
                                                <input className="w-full h-full px-1 outline-none bg-transparent"
                                                    value={formData.assures_associes?.[i]?.nom || ''}
                                                    onChange={e => updateAssureAssocie(i, 'nom', e.target.value)}
                                                />
                                            </td>
                                            <td className="border-r border-[#F48232]">
                                                <input className="w-full h-full px-1 outline-none bg-transparent"
                                                    value={formData.assures_associes?.[i]?.prenom || ''}
                                                    onChange={e => updateAssureAssocie(i, 'prenom', e.target.value)}
                                                />
                                            </td>
                                            <td className="border-r border-[#F48232]">
                                                <input type="date" className="w-full h-full px-1 outline-none text-center bg-transparent"
                                                    value={formData.assures_associes?.[i]?.date_naissance || ''}
                                                    onChange={e => updateAssureAssocie(i, 'date_naissance', e.target.value)}
                                                />
                                            </td>
                                            <td className="border-r border-[#F48232]">
                                                <input className="w-full h-full px-1 outline-none bg-transparent"
                                                    value={formData.assures_associes?.[i]?.lieu_naissance || ''}
                                                    onChange={e => updateAssureAssocie(i, 'lieu_naissance', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input className="w-full h-full px-1 outline-none bg-transparent"
                                                    value={formData.assures_associes?.[i]?.contact || ''}
                                                    onChange={e => updateAssureAssocie(i, 'contact', e.target.value)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
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
                        Fait à <span className="border-b border-dotted border-gray-600 w-56 inline-block text-center">{formData.ville || 'Libreville'}</span> le <span className="border-b border-dotted border-gray-600 w-10 inline-block text-center">{new Date().getDate()}</span> / <span className="border-b border-dotted border-gray-600 w-10 inline-block text-center">{new Date().getMonth() + 1}</span> / <span className="border-b border-dotted border-gray-600 w-16 inline-block text-center">{new Date().getFullYear()}</span>
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

            {/* Actions Bottom */}
            <div className="w-[210mm] mx-auto mt-8 mb-12 print:hidden flex justify-end gap-4">
                <Button variant="outline" onClick={() => navigate(-1)} className="bg-white border-gray-300 hover:bg-gray-50 font-bold text-gray-700">
                    Annuler
                </Button>
                <Button
                    size="lg"
                    onClick={handleSubmit}
                    disabled={isPending}
                    className="bg-[#F48232] hover:bg-[#e0742a] text-white font-bold px-8 shadow-lg shadow-orange-500/20 transform hover:-translate-y-0.5 transition-all"
                >
                    {isPending ? 'Enregistrement en cours...' : 'Enregistrer le contrat'}
                </Button>
            </div>
        </div>
    )
}
