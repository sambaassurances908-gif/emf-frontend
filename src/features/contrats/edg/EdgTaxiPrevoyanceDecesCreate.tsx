import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, ArrowLeft, Loader2, Check } from 'lucide-react'
import { useCreateEdgTaxiPrevoyanceDecesContract } from '@/hooks/useEdgTaxiContracts'
import { Button } from '@/components/ui/Button'
import logoSamba from '@/assets/logo-samba.png'
import { EdgTaxiPrevoyanceDecesFormData } from '@/types/edgTaxi'
import { useAuthStore } from '@/store/authStore'

// --- Internal Reusable Components ---

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

const DateInput: React.FC<{ value: string, onChange: (val: string) => void, readOnly?: boolean }> = ({ value, onChange, readOnly }) => {
    const safeDate = value ? new Date(value) : null;
    const isValidDate = safeDate && !isNaN(safeDate.getTime());

    const [d, setD] = useState(isValidDate ? String(safeDate!.getDate()).padStart(2, '0') : '');
    const [m, setM] = useState(isValidDate ? String(safeDate!.getMonth() + 1).padStart(2, '0') : '');
    const [y, setY] = useState(isValidDate ? String(safeDate!.getFullYear()) : '');

    useEffect(() => {
        if (value) {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                setD(String(date.getDate()).padStart(2, '0'));
                setM(String(date.getMonth() + 1).padStart(2, '0'));
                setY(String(date.getFullYear()));
            } else {
                setD(''); setM(''); setY('');
            }
        }
    }, [value]);

    const updateDate = (newD: string, newM: string, newY: string) => {
        setD(newD);
        setM(newM);
        setY(newY);
        if (newD.length === 2 && newM.length === 2 && newY.length === 4) {
            onChange(`${newY}-${newM}-${newD}`);
        }
    };

    return (
        <div className="flex items-center gap-1">
            <input
                className="w-10 text-center outline-none border border-gray-400 rounded px-1 py-0.5 bg-white focus:border-orange-500 font-medium text-sm"
                maxLength={2} placeholder="JJ"
                value={d} onChange={(e) => updateDate(e.target.value, m, y)} readOnly={readOnly}
            />
            <span className="text-gray-500 font-bold">/</span>
            <input
                className="w-10 text-center outline-none border border-gray-400 rounded px-1 py-0.5 bg-white focus:border-orange-500 font-medium text-sm"
                maxLength={2} placeholder="MM"
                value={m} onChange={(e) => updateDate(d, e.target.value, y)} readOnly={readOnly}
            />
            <span className="text-gray-500 font-bold">/</span>
            <input
                className="w-16 text-center outline-none border border-gray-400 rounded px-1 py-0.5 bg-white focus:border-orange-500 font-medium text-sm"
                maxLength={4} placeholder="AAAA"
                value={y} onChange={(e) => updateDate(d, m, e.target.value)} readOnly={readOnly}
            />
        </div>
    );
};

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="w-28 flex-shrink-0 p-2 italic border-r border-orange-300 flex items-center text-[10px] font-medium text-gray-700 bg-orange-50/30">
        {children}
    </div>
);

const Footer: React.FC = () => {
    return (
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
};

export const EdgTaxiPrevoyanceDecesCreate: React.FC = () => {
    const navigate = useNavigate()
    const { mutate: createContract, isPending } = useCreateEdgTaxiPrevoyanceDecesContract()
    const userEmfId = useAuthStore(state => state.user?.emf_id)

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
        periodicite: 'semestre',
        statut: 'En attente',
        categorie: 'Standard',
        assures_associes: Array(5).fill(null).map(() => ({
            lien: '', nom: '', prenom: '', date_naissance: '', lieu_naissance: '', contact: ''
        }))
    })

    useEffect(() => {
        if (formData.date_effet && formData.periodicite) {
            const effet = new Date(formData.date_effet);
            const echeance = new Date(effet);
            if (formData.periodicite === 'annuel') {
                echeance.setFullYear(echeance.getFullYear() + 1);
            } else {
                echeance.setMonth(echeance.getMonth() + 6);
            }
            echeance.setDate(echeance.getDate() - 1);
            setFormData(prev => ({ ...prev, date_echeance: echeance.toISOString().split('T')[0] }));
        }
    }, [formData.date_effet, formData.periodicite]);

    const handleSubmit = async () => {
        const payload = { ...formData, emf_id: userEmfId || 0 };
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

    return (
        <div className="min-h-screen bg-gray-200 py-8 flex flex-col items-center font-sans overflow-x-hidden print:bg-white print:py-0">
            {/* Toolbar */}
            <div className="fixed top-4 left-4 z-50 print:hidden flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="bg-white shadow-sm border-gray-300 hover:bg-gray-50">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Retour
                </Button>
            </div>

            {/* A4 Document Container */}
            <div className="bg-white w-[210mm] min-h-[297mm] p-[10mm] shadow-2xl relative flex flex-col border border-gray-300 print:shadow-none print:border-none print:w-full print:p-0">

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
                                <span className="w-32 font-medium">Numéro de police :</span>
                                <div className="flex-grow flex items-center">
                                    <input
                                        className="w-full max-w-sm outline-none border border-gray-400 rounded py-1 px-3 font-medium bg-white text-sm focus:border-orange-500 transition-colors"
                                        value={formData.numero_police}
                                        onChange={(e) => setFormData({ ...formData, numero_police: e.target.value })}
                                        placeholder="Généré automatiquement si maintenu vide"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-8">
                                <div className="flex items-center gap-2 text-[11px] flex-1">
                                    <span className="w-32 font-medium">Statut :</span>
                                    <input
                                        className="w-full max-w-sm outline-none border border-gray-400 rounded py-1 px-3 font-medium bg-white text-sm focus:border-orange-500 transition-colors"
                                        value={formData.statut}
                                        onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                                    />
                                </div>
                                <div className="flex items-center gap-2 text-[11px] flex-1">
                                    <span className="w-32 font-medium">Catégorie :</span>
                                    <input
                                        className="w-full max-w-sm outline-none border border-gray-400 rounded py-1 px-3 font-medium bg-white text-sm focus:border-orange-500 transition-colors"
                                        value={formData.categorie}
                                        onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-8">
                                <div className="flex items-center gap-2 text-[11px]">
                                    <span className="w-32 font-medium">Date d'effet :</span>
                                    <DateInput value={formData.date_effet} onChange={(val) => setFormData({ ...formData, date_effet: val })} />
                                </div>
                                <div className="flex items-center gap-2 text-[11px]">
                                    <span className="font-medium">Date d'échéance :</span>
                                    <DateInput value={formData.date_echeance} onChange={(val) => setFormData({ ...formData, date_echeance: val })} readOnly />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section: Souscripteur / Assuré principal */}
                    <div className="flex border-b border-orange-300">
                        <SectionHeader>Souscripteur <br /> / Assuré <br /> principal</SectionHeader>
                        <div className="flex-grow p-2 space-y-2 bg-orange-50/10">
                            <div className="flex items-center gap-2 text-[11px]">
                                <span className="w-24 font-medium">Nom :</span>
                                <input
                                    className="flex-grow border-b border-gray-400 outline-none px-1 bg-transparent font-medium"
                                    value={formData.nom} onChange={e => setFormData({ ...formData, nom: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center gap-2 text-[11px]">
                                <span className="w-24 font-medium">Prénom :</span>
                                <input
                                    className="flex-grow border-b border-gray-400 outline-none px-1 bg-transparent font-medium"
                                    value={formData.prenom} onChange={e => setFormData({ ...formData, prenom: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center gap-2 text-[11px]">
                                <span className="w-24 font-medium">Adresse :</span>
                                <input
                                    className="flex-grow border-b border-gray-400 outline-none px-1 bg-transparent font-medium"
                                    value={formData.adresse || ''} onChange={e => setFormData({ ...formData, adresse: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center gap-2 text-[11px]">
                                <span className="w-24 font-medium">Ville :</span>
                                <input
                                    className="flex-grow border-b border-gray-400 outline-none px-1 bg-transparent font-medium"
                                    value={formData.ville || ''} onChange={e => setFormData({ ...formData, ville: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center gap-2 text-[11px]">
                                <span className="w-24 font-medium">Téléphone :</span>
                                <input
                                    className="flex-grow border-b border-gray-400 outline-none px-1 bg-transparent font-medium"
                                    value={formData.telephone || ''} onChange={e => setFormData({ ...formData, telephone: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center gap-2 text-[11px]">
                                <span className="w-24 font-medium">Email :</span>
                                <input
                                    className="flex-grow border-b border-gray-400 outline-none px-1 bg-transparent font-medium"
                                    value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section: Assurés associés */}
                    <div className="flex border-b border-orange-300">
                        <SectionHeader>Assurés <br /> associés</SectionHeader>
                        <div className="flex-grow">
                            <table className="w-full text-[9px] border-collapse">
                                <thead className="bg-orange-50/20">
                                    <tr className="font-bold text-gray-800 text-center">
                                        <th className="p-1 border-r border-orange-200 border-b w-1/6">Lien avec l'Assuré <br /> Principal</th>
                                        <th className="p-1 border-r border-orange-200 border-b w-1/6">Nom</th>
                                        <th className="p-1 border-r border-orange-200 border-b w-1/6">Prénom</th>
                                        <th className="p-1 border-r border-orange-200 border-b w-1/6">Date de <br /> naissance</th>
                                        <th className="p-1 border-r border-orange-200 border-b w-1/6">Lieu de <br /> naissance</th>
                                        <th className="p-1 border-b">Contact & Adresse</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.assures_associes.map((associe, index) => (
                                        <tr key={index} className="h-6">
                                            <td className="border-r border-orange-200 border-b p-1">
                                                <input className="w-full bg-transparent outline-none text-center"
                                                    value={associe.lien}
                                                    onChange={e => {
                                                        const newA = [...formData.assures_associes];
                                                        newA[index].lien = e.target.value;
                                                        setFormData({ ...formData, assures_associes: newA });
                                                    }}
                                                />
                                            </td>
                                            <td className="border-r border-orange-200 border-b p-1">
                                                <input className="w-full bg-transparent outline-none text-center"
                                                    value={associe.nom}
                                                    onChange={e => {
                                                        const newA = [...formData.assures_associes];
                                                        newA[index].nom = e.target.value;
                                                        setFormData({ ...formData, assures_associes: newA });
                                                    }}
                                                />
                                            </td>
                                            <td className="border-r border-orange-200 border-b p-1">
                                                <input className="w-full bg-transparent outline-none text-center"
                                                    value={associe.prenom}
                                                    onChange={e => {
                                                        const newA = [...formData.assures_associes];
                                                        newA[index].prenom = e.target.value;
                                                        setFormData({ ...formData, assures_associes: newA });
                                                    }}
                                                />
                                            </td>
                                            <td className="border-r border-orange-200 border-b p-1">
                                                <input className="w-full bg-transparent outline-none text-center"
                                                    value={associe.date_naissance}
                                                    onChange={e => {
                                                        const newA = [...formData.assures_associes];
                                                        newA[index].date_naissance = e.target.value;
                                                        setFormData({ ...formData, assures_associes: newA });
                                                    }}
                                                />
                                            </td>
                                            <td className="border-r border-orange-200 border-b p-1">
                                                <input className="w-full bg-transparent outline-none text-center"
                                                    value={associe.lieu_naissance}
                                                    onChange={e => {
                                                        const newA = [...formData.assures_associes];
                                                        newA[index].lieu_naissance = e.target.value;
                                                        setFormData({ ...formData, assures_associes: newA });
                                                    }}
                                                />
                                            </td>
                                            <td className="border-b p-1">
                                                <input className="w-full bg-transparent outline-none text-center"
                                                    value={associe.contact}
                                                    onChange={e => {
                                                        const newA = [...formData.assures_associes];
                                                        newA[index].contact = e.target.value;
                                                        setFormData({ ...formData, assures_associes: newA });
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Section: Garanties */}
                    <div className="flex border-b border-orange-300">
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
                            <div className="pl-6 flex flex-col gap-1">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <span className="w-4 h-px bg-gray-400"></span>
                                    <div
                                        className={`w-4 h-4 border border-black flex items-center justify-center ${formData.periodicite === 'semestre' ? 'bg-black text-white' : 'bg-white'}`}
                                        onClick={() => setFormData({ ...formData, periodicite: 'semestre' })}
                                    >
                                        {formData.periodicite === 'semestre' && <Check className="w-3 h-3" />}
                                    </div>
                                    <span>Semestrielle : <span className="font-bold">12 500 FCFA</span></span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <span className="w-4 h-px bg-gray-400"></span>
                                    <div
                                        className={`w-4 h-4 border border-black flex items-center justify-center ${formData.periodicite === 'annuel' ? 'bg-black text-white' : 'bg-white'}`}
                                        onClick={() => setFormData({ ...formData, periodicite: 'annuel' })}
                                    >
                                        {formData.periodicite === 'annuel' && <Check className="w-3 h-3" />}
                                    </div>
                                    <span>Annuelle : <span className="font-bold">25 000 FCFA</span></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Note (1) */}
                <div className="mt-2 text-[11px] font-bold px-1">
                    (1) Le montant maximal de couverture est de 1 000 000 FCFA.
                </div>

                {/* Date and Signature Line */}
                <div className="mt-10 mb-8 font-serif">
                    <div className="text-right text-[11px] mb-8 pr-12 font-medium">
                        Fait à <span className="font-bold">Libreville</span>, le <span className="font-bold">{new Date().getDate()}</span> / <span className="font-bold">{new Date().getMonth() + 1}</span> / <span className="font-bold">{new Date().getFullYear()}</span>
                    </div>

                    <div className="flex justify-between items-start px-8">
                        <div className="w-2/5 flex flex-col">
                            <div className="font-bold text-[12px] mb-2">Le Souscripteur</div>
                            <div className="w-full h-24 border border-gray-400 p-2 flex items-start justify-center">
                                <span className="text-[10px] text-gray-300 italic">Signature et cachet</span>
                            </div>
                        </div>

                        <div className="w-2/5 flex flex-col">
                            <div className="font-bold text-[12px] mb-2">L'Assureur</div>
                            <div className="w-full h-24 border border-gray-400 p-2 flex items-start justify-center">
                                <span className="text-[10px] text-gray-300 italic">Signature et cachet</span>
                            </div>
                        </div>
                    </div>
                </div>

                <Footer />
            </div>

            {/* Action Button */}
            <div className="mt-6 mb-12 print:hidden">
                <Button size="lg" onClick={handleSubmit} disabled={isPending} className="bg-orange-600 hover:bg-orange-700 text-white shadow-xl px-12 py-6 text-lg rounded-full">
                    {isPending ? <Loader2 className="w-6 h-6 mr-3 animate-spin" /> : <Save className="w-6 h-6 mr-3" />}
                    Enregistrer le contrat
                </Button>
            </div>
        </div>
    );
};
