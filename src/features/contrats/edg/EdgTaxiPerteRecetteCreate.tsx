import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Printer, Save, ArrowLeft, Check, Loader2 } from 'lucide-react'
import { useCreateEdgTaxiPerteRecetteContract, useEdgTaxiPerteRecetteContract } from '@/hooks/useEdgTaxiContracts'
import { EdgTaxiPerteRecetteFormData } from '@/types/edgTaxi'
import logoSamba from '@/assets/logo-samba.png'

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

const SimpleInput: React.FC<{ width?: string; value?: string; onChange?: (val: string) => void; readOnly?: boolean; placeholder?: string }> = ({ width = "w-48", value = "", onChange, readOnly = false, placeholder = "" }) => (
    <div className="flex items-center">
        <input
            className={`${width} outline-none border-b border-gray-300 py-0.5 px-2 text-[11px] font-bold ${readOnly ? 'bg-transparent text-orange-600' : 'bg-white'}`}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            readOnly={readOnly}
            placeholder={placeholder}
        />
    </div>
);

const SimpleDateInput: React.FC<{ label: string; value: string; onChange: (val: string) => void }> = ({ label, value, onChange }) => {
    const normalize = (v: string) => v || '';
    const [y, m, d] = normalize(value).split('-');

    const handleIn = (type: 'd' | 'm' | 'y', v: string) => {
        if (!/^\d*$/.test(v)) return;
        let nd = type === 'd' ? v.slice(0, 2) : d;
        let nm = type === 'm' ? v.slice(0, 2) : m;
        let ny = type === 'y' ? v.slice(0, 4) : y;
        onChange(`${ny}-${nm}-${nd}`);
    }

    return (
        <div className="flex items-center gap-2 text-[11px]">
            <span className="font-bold">{label} :</span>
            <div className="flex items-center gap-1 font-bold text-gray-900">
                <input className="w-5 text-center outline-none bg-transparent" maxLength={2} value={d || ''} onChange={e => handleIn('d', e.target.value)} placeholder="JJ" />
                <span>/</span>
                <input className="w-5 text-center outline-none bg-transparent" maxLength={2} value={m || ''} onChange={e => handleIn('m', e.target.value)} placeholder="MM" />
                <span>/</span>
                <input className="w-10 text-center outline-none bg-transparent" maxLength={4} value={y || ''} onChange={e => handleIn('y', e.target.value)} placeholder="AAAA" />
            </div>
            <input type="date" className="w-4 h-4 opacity-50 cursor-pointer" value={value} onChange={e => onChange(e.target.value)} />
        </div>
    );
}

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
};

export const EdgTaxiPerteRecetteCreate = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const emfId = 4 // EDG

    const generatePolicyNumber = () => {
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.floor(100 + Math.random() * 900);
        return `EDG-PR-${dateStr}-${random}`;
    }

    const { data: contractData } = useEdgTaxiPerteRecetteContract(id ? Number(id) : undefined)
    const [formData, setFormData] = useState<EdgTaxiPerteRecetteFormData>({
        emf_id: emfId,
        numero_police: id ? '' : generatePolicyNumber(),
        date_effet: new Date().toISOString().split('T')[0],
        date_echeance: '',
        nom: '',
        prenom: '',
        date_naissance: '',
        numero_identite: '',
        immatriculation_taxi: '',
        adresse: '',
        bp: '',
        ville: 'Libreville',
        telephone: '',
        email: '',
        contact_nom: '',
        contact_telephone: '',
        periodicite: 'annuel',
    })

    // Pseudo-state for Souscripteur (mirrors Assuré if needed, but now manual by default)
    const [isAssureSouscripteur] = useState(false)
    const [souscripteurData, setSouscripteurData] = useState<any>({ ...formData })

    useEffect(() => {
        if (contractData) {
            setFormData({ ...contractData } as any)
            setSouscripteurData({ ...contractData } as any)
        }
    }, [contractData])

    useEffect(() => {
        if (isAssureSouscripteur) {
            setSouscripteurData({ ...formData })
        }
    }, [formData, isAssureSouscripteur])

    useEffect(() => {
        if (formData.date_effet && formData.periodicite) {
            const dateEffet = new Date(formData.date_effet)
            dateEffet.setFullYear(dateEffet.getFullYear() + (formData.periodicite === 'semestre' ? 0 : 1))
            if (formData.periodicite === 'semestre') dateEffet.setMonth(dateEffet.getMonth() + 6)
            setFormData(prev => ({ ...prev, date_echeance: dateEffet.toISOString().split('T')[0] }))
        }
    }, [formData.date_effet, formData.periodicite])

    const { mutate: createContract, isPending } = useCreateEdgTaxiPerteRecetteContract()
    const [error, setError] = useState('')

    const isFormValid = formData.nom && formData.prenom && formData.immatriculation_taxi && formData.date_effet

    const handleSave = () => {
        if (!isFormValid) { setError('Veuillez remplir les champs obligatoires (Nom, Prénom, Immatriculation)'); return; }
        createContract(formData, {
            onSuccess: (data) => navigate(`/contrats/edg-taxi-perte-recette/${data.id}`),
            onError: (err: any) => setError(err.response?.data?.message || 'Erreur lors de la création')
        })
    }

    return (
        <div className="min-h-screen bg-gray-200 py-8 flex flex-col items-center font-sans overflow-x-hidden print:bg-white print:py-0">
            {/* Toolbar */}
            <div className="w-[210mm] mb-6 flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 print:hidden">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors font-bold"><ArrowLeft size={20} /> Retour</button>
                <div className="flex gap-3">
                    <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors font-bold"><Printer size={20} /> Imprimer</button>
                    <button
                        onClick={handleSave}
                        disabled={isPending || !isFormValid}
                        className={`flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold transition-all shadow-lg ${isFormValid ? 'bg-[#F48232] hover:bg-[#e0742a] shadow-orange-200' : 'bg-gray-300 cursor-not-allowed shadow-none'}`}
                    >
                        {isPending ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                        Enregistrer le contrat
                    </button>
                </div>
            </div>

            {error && <div className="w-[210mm] mb-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold animate-in fade-in slide-in-from-top-2 print:hidden">{error}</div>}

            {/* A4 Document Container */}
            <div className="bg-white w-[210mm] min-h-[297mm] p-[10mm] shadow-2xl relative flex flex-col border border-gray-300 print:shadow-none print:border-none">
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
                        <SimpleInput width="w-48" value={formData.numero_police} readOnly />
                    </div>

                    <div className="flex justify-between">
                        <SimpleDateInput label="Date d'effet" value={formData.date_effet} onChange={(v) => setFormData({ ...formData, date_effet: v })} />
                        <SimpleDateInput label="Date d'échéance" value={formData.date_echeance} onChange={(v) => setFormData({ ...formData, date_echeance: v })} />
                    </div>
                </div>



                {/* Main Data Grid */}
                <div className="w-full border border-[#F48232] rounded-sm overflow-hidden mb-6">
                    <div className="grid grid-cols-[1.5fr_2fr_2fr] text-[11px]">
                        <div className="border-b border-[#F48232] p-2 bg-white"></div>
                        <div className="border-b border-l border-[#F48232] p-2 font-bold italic text-center bg-orange-50/30">Souscripteur</div>
                        <div className="border-b border-l border-[#F48232] p-2 font-bold italic text-center bg-orange-50/30">Assuré</div>

                        <Row label="Nom" field="nom" formData={formData} setFormData={setFormData} souscripteurData={souscripteurData} setSouscripteurData={setSouscripteurData} isReadOnly={isAssureSouscripteur} />
                        <Row label="Prénom" field="prenom" formData={formData} setFormData={setFormData} souscripteurData={souscripteurData} setSouscripteurData={setSouscripteurData} isReadOnly={isAssureSouscripteur} />
                        <Row label="Date de naissance" field="date_naissance" formData={formData} setFormData={setFormData} souscripteurData={souscripteurData} setSouscripteurData={setSouscripteurData} isReadOnly={isAssureSouscripteur} type="date" />
                        <Row label="Numéro d'identité" field="numero_identite" formData={formData} setFormData={setFormData} souscripteurData={souscripteurData} setSouscripteurData={setSouscripteurData} isReadOnly={isAssureSouscripteur} />
                        <Row label="Immatriculation taxi" field="immatriculation_taxi" formData={formData} setFormData={setFormData} souscripteurData={souscripteurData} setSouscripteurData={setSouscripteurData} isReadOnly={isAssureSouscripteur} />
                        <Row label="Adresse" field="adresse" formData={formData} setFormData={setFormData} souscripteurData={souscripteurData} setSouscripteurData={setSouscripteurData} isReadOnly={isAssureSouscripteur} />
                        <Row label="BP" field="bp" formData={formData} setFormData={setFormData} souscripteurData={souscripteurData} setSouscripteurData={setSouscripteurData} isReadOnly={isAssureSouscripteur} />
                        <Row label="Ville" field="ville" formData={formData} setFormData={setFormData} souscripteurData={souscripteurData} setSouscripteurData={setSouscripteurData} isReadOnly={isAssureSouscripteur} />
                        <Row label="Téléphone" field="telephone" formData={formData} setFormData={setFormData} souscripteurData={souscripteurData} setSouscripteurData={setSouscripteurData} isReadOnly={isAssureSouscripteur} />
                        <Row label="Email" field="email" formData={formData} setFormData={setFormData} souscripteurData={souscripteurData} setSouscripteurData={setSouscripteurData} isReadOnly={isAssureSouscripteur} isLast />
                    </div>
                </div>

                {/* Contact info */}
                <div className="flex gap-8 mb-8 text-[11px] items-center px-1">
                    <div className="flex items-center gap-2 flex-grow">
                        <span className="font-bold whitespace-nowrap">Contacter en cas de besoin :</span>
                        <SimpleInput width="flex-grow" value={formData.contact_nom} onChange={(v) => setFormData({ ...formData, contact_nom: v })} placeholder="Nom du contact..." />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold">Tel. :</span>
                        <SimpleInput width="w-48" value={formData.contact_telephone} onChange={(v) => setFormData({ ...formData, contact_telephone: v })} placeholder="074..." />
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
                                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setFormData({ ...formData, periodicite: 'annuel' })}>
                                        <div className={`w-4 h-4 border border-black flex items-center justify-center ${formData.periodicite === 'annuel' ? 'bg-black text-white' : 'bg-white'}`}>
                                            {formData.periodicite === 'annuel' && <Check size={12} />}
                                        </div>
                                        <span>Annuel : <span className="font-bold">25 000 FCFA TTC</span></span>
                                    </div>
                                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setFormData({ ...formData, periodicite: 'semestre' })}>
                                        <div className={`w-4 h-4 border border-black flex items-center justify-center ${formData.periodicite === 'semestre' ? 'bg-black text-white' : 'bg-white'}`}>
                                            {formData.periodicite === 'semestre' && <Check size={12} />}
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
                    Fait à Libreville, le {new Date().toLocaleDateString('fr-FR')}
                </div>

                {/* Signature Blocks */}
                <div className="flex justify-between items-start px-8 mb-12">
                    <div className="flex flex-col items-start w-[30%]">
                        <div className="font-bold text-[12px] mb-2 italic">Le Souscripteur</div>
                        <div className="w-full h-20 border border-gray-400 rounded-sm p-2 flex items-start">
                            <span className="text-[10px] text-gray-300 italic">Signature</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-start w-[30%]">
                        <div className="font-bold text-[12px] mb-2 italic">L'Assureur</div>
                        <div className="w-full h-20 border border-gray-400 rounded-sm p-2 flex items-start flex-col gap-1">
                            <span className="text-[10px] text-gray-300 italic">Signature & Cachet</span>

                        </div>
                    </div>
                </div>

                <Footer />
            </div>
        </div>
    );
}

const Row = ({ label, field, formData, setFormData, souscripteurData, setSouscripteurData, isReadOnly, type = "text", isLast = false }: any) => (
    <React.Fragment>
        <div className={`p-2 font-bold border-r border-[#F48232] flex items-center ${!isLast ? 'border-b border-[#F48232]' : ''}`}>
            {label}
        </div>
        <div className={`border-r border-[#F48232] p-2 ${!isLast ? 'border-b border-[#F48232]' : ''}`}>
            <input
                type={type}
                className={`w-full outline-none bg-transparent font-medium ${isReadOnly ? 'text-gray-400 cursor-not-allowed italic' : ''}`}
                value={souscripteurData[field] || ''}
                onChange={e => setSouscripteurData({ ...souscripteurData, [field]: e.target.value })}
                readOnly={isReadOnly}
                placeholder={isReadOnly ? "Idem Assuré" : "..."}
            />
        </div>
        <div className={`p-2 ${!isLast ? 'border-b border-[#F48232]' : ''}`}>
            <input
                type={type}
                className="w-full outline-none bg-transparent font-bold text-gray-900"
                value={formData[field] || ''}
                onChange={e => setFormData({ ...formData, [field]: e.target.value })}
                placeholder="..."
            />
        </div>
    </React.Fragment>
)
