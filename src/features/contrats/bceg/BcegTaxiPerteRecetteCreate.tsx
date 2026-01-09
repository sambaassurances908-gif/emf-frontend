import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Printer, Save, ArrowLeft, AlertCircle, Check } from 'lucide-react'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useCreateBcegTaxiPerteRecetteContract, useBcegTaxiPerteRecetteContract } from '@/hooks/useBcegTaxiContracts'
import { Button } from '@/components/ui/Button'
import logoSamba from '@/assets/logo-samba.png'

// --- Internal Reusable Components from User Request ---

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

// Date Input Component (Visual only for now, mapped to actual date inputs)
// Date Input Component (Visual only for now, mapped to actual date inputs)
const DateInput: React.FC<{ label: string; value: string; onChange: (val: string) => void }> = ({ label, value, onChange }) => {
    // Value is expected to be YYYY-MM-DD, handle ISO just in case
    const normalizedValue = value ? value.split('T')[0] : '';
    const [year, month, day] = normalizedValue ? normalizedValue.split('-') : ['', '', ''];

    const handleChange = (type: 'd' | 'm' | 'y', val: string) => {
        // Allow numbers only
        if (!/^\d*$/.test(val)) return;

        let newDay = type === 'd' ? val : day;
        let newMonth = type === 'm' ? val : month;
        let newYear = type === 'y' ? val : year;

        onChange(`${newYear}-${newMonth}-${newDay}`);
    }

    return (
        <div className="flex items-center gap-2 text-[11px]">
            <span className="font-bold">{label} :</span>
            <div className="flex items-center gap-1">
                <input
                    className="w-8 text-center outline-none border border-black rounded px-1 py-0.5 bg-transparent font-mono font-bold"
                    maxLength={2}
                    placeholder="JJ"
                    value={day}
                    onChange={(e) => handleChange('d', e.target.value)}
                />
                <span className="font-bold">/</span>
                <input
                    className="w-8 text-center outline-none border border-black rounded px-1 py-0.5 bg-transparent font-mono font-bold"
                    maxLength={2}
                    placeholder="MM"
                    value={month}
                    onChange={(e) => handleChange('m', e.target.value)}
                />
                <span className="font-bold">/</span>
                <input
                    className="w-14 text-center outline-none border border-black rounded px-1 py-0.5 bg-transparent font-mono font-bold"
                    maxLength={4}
                    placeholder="AAAA"
                    value={year}
                    onChange={(e) => handleChange('y', e.target.value)}
                />
            </div>
            {/* Hidden actual date input for calendar picker fallback if needed */}
            <input type="date" className="w-5 h-5 opacity-0 absolute" value={value} onChange={(e) => onChange(e.target.value)} />
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

// --- Constants ---
const TYPE_CONTRAT = "Contrat SAMB'A TAXIS - Perte de Recettes"

// Grid Row Component (Defined outside to prevent re-mount/focus loss)
const GridRow = ({
    label,
    valueAssure, onChangeAssure,
    valueSouscripteur, onChangeSouscripteur,
    isLast = false
}: {
    label: string;
    valueAssure: string; onChangeAssure: (val: string) => void;
    valueSouscripteur: string; onChangeSouscripteur: (val: string) => void;
    isLast?: boolean
}) => (
    <React.Fragment>
        <div className={`p-2 font-bold border-b border-[#F48232] flex items-center ${isLast ? 'border-b-0' : ''}`}>
            {label}
        </div>
        <div className={`border-l border-b border-[#F48232] p-2 ${isLast ? 'border-b-0' : ''}`}>
            <input
                className="w-full outline-none bg-transparent font-semibold"
                value={valueSouscripteur}
                onChange={e => onChangeSouscripteur(e.target.value)}
                placeholder={`Saisir ${label.toLowerCase()}...`}
            />
        </div>
        <div className={`border-l border-b border-[#F48232] p-2 ${isLast ? 'border-b-0' : ''}`}>
            <input
                className="w-full outline-none bg-transparent font-semibold"
                value={valueAssure}
                onChange={e => onChangeAssure(e.target.value)}
                placeholder={`Saisir ${label.toLowerCase()}...`}
            />
        </div>
    </React.Fragment>
)

export const BcegTaxiPerteRecetteCreate = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const emfId = 3

    // Hook to fetch contract if ID is present
    const { data: contractData } = useBcegTaxiPerteRecetteContract(id ? Number(id) : undefined)

    const [formData, setFormData] = useState({
        emf_id: emfId,
        numero_police: '',
        date_effet: new Date().toISOString().split('T')[0],
        date_echeance: '',

        // Assuré
        nom: '',
        prenom: '',
        date_naissance: '',
        numero_identite: '',
        immatriculation_taxi: '',
        adresse: '',
        bp: '',
        ville: '',
        telephone: '',
        email: '',

        // Souscripteur (NEW)
        souscripteur_nom: '',
        souscripteur_prenom: '',
        souscripteur_date_naissance: '',
        souscripteur_numero_identite: '',
        souscripteur_immatriculation_taxi: '', // Can be different or same
        souscripteur_adresse: '',
        souscripteur_bp: '',
        souscripteur_ville: '',
        souscripteur_telephone: '',
        souscripteur_email: '',

        // Contact d'urgence
        contact_nom: '',
        contact_telephone: '',

        // Paramètres
        periodicite: 'annuel' as 'annuel' | 'semestre',
        statut: 'En attente',
        categorie: 'Standard'
    })

    // Populate form if Edit Mode
    useEffect(() => {
        if (contractData) {
            setFormData({
                emf_id: contractData.emf_id || emfId,
                numero_police: contractData.numero_police || '',
                date_effet: contractData.date_effet || '',
                date_echeance: contractData.date_echeance || '',

                // Assuré
                nom: contractData.nom || '',
                prenom: contractData.prenom || '',
                date_naissance: contractData.date_naissance || '',
                numero_identite: contractData.numero_identite || '',
                immatriculation_taxi: contractData.immatriculation_taxi || '',
                adresse: contractData.adresse || '',
                bp: contractData.bp || '',
                ville: contractData.ville || '',
                telephone: contractData.telephone || '',
                email: contractData.email || '',

                // Souscripteur (Fallback to Assuré if missing in data)
                souscripteur_nom: (contractData as any).souscripteur_nom || contractData.nom || '',
                souscripteur_prenom: (contractData as any).souscripteur_prenom || contractData.prenom || '',
                souscripteur_date_naissance: (contractData as any).souscripteur_date_naissance || contractData.date_naissance || '',
                souscripteur_numero_identite: (contractData as any).souscripteur_numero_identite || contractData.numero_identite || '',
                souscripteur_immatriculation_taxi: (contractData as any).souscripteur_immatriculation_taxi || contractData.immatriculation_taxi || '',
                souscripteur_adresse: (contractData as any).souscripteur_adresse || contractData.adresse || '',
                souscripteur_bp: (contractData as any).souscripteur_bp || contractData.bp || '',
                souscripteur_ville: (contractData as any).souscripteur_ville || contractData.ville || '',
                souscripteur_telephone: (contractData as any).souscripteur_telephone || contractData.telephone || '',
                souscripteur_email: (contractData as any).souscripteur_email || contractData.email || '',

                contact_nom: contractData.contact_nom || '',
                contact_telephone: contractData.contact_telephone || '',
                periodicite: contractData.periodicite || 'annuel',
                statut: contractData.statut || 'En attente',
                categorie: contractData.categorie || 'Standard'
            })
        }
    }, [contractData])

    // Auto-calcul date échéance
    useEffect(() => {
        if (formData.date_effet && formData.periodicite) {
            const dateEffet = new Date(formData.date_effet)
            if (!isNaN(dateEffet.getTime())) {
                const months = formData.periodicite === 'semestre' ? 6 : 12
                dateEffet.setMonth(dateEffet.getMonth() + months)
                if (!isNaN(dateEffet.getTime())) {
                    setFormData(prev => ({ ...prev, date_echeance: dateEffet.toISOString().split('T')[0] }))
                }
            }
        }
    }, [formData.date_effet, formData.periodicite])

    const [submitError, setSubmitError] = useState('')
    const { mutate: createContract, isPending } = useCreateBcegTaxiPerteRecetteContract()


    const isFormComplete = Boolean(
        formData.nom.trim() &&
        formData.prenom.trim() &&
        formData.immatriculation_taxi.trim() &&
        formData.date_effet &&
        formData.date_echeance
    )

    const handleSubmit = () => {
        if (!isFormComplete) {
            setSubmitError('Veuillez remplir tous les champs obligatoires (Assuré).')
            return
        }

        const payload = {
            ...formData,
            type_contrat: TYPE_CONTRAT,
        }

        createContract(payload, {
            onSuccess: (data) => {
                navigate(`/contrats/bceg-taxi-perte-recette/${data.id}`)
            },
            onError: (error: any) => {
                const message = error.response?.data?.message || 'Erreur lors de la création'
                setSubmitError(message)
            }
        })
    }


    return (
        <div className="min-h-screen bg-gray-200 py-4 flex flex-col items-center font-sans overflow-x-hidden">

            {/* Toolbar */}
            <div className="w-[210mm] mb-4 flex justify-between items-center bg-white p-3 rounded-lg shadow print:hidden">
                <Button variant="outline" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour
                </Button>

                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.print()}>
                        <Printer className="h-4 w-4 mr-2" />
                        Imprimer
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isPending || !isFormComplete}
                        className={`${isFormComplete ? 'bg-[#F48232] hover:bg-[#e0742a]' : 'bg-gray-400 cursor-not-allowed'}`}
                    >
                        {isPending ? (
                            <>
                                <LoadingSpinner size="sm" />
                                <span className="ml-2">Création...</span>
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Save
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Error Message */}
            {submitError && (
                <div className="w-[210mm] mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded print:hidden">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <span>{submitError}</span>
                    </div>
                </div>
            )}

            {/* A4 Document Container */}
            <div className="bg-white w-[210mm] min-h-[297mm] p-[10mm] shadow-2xl relative flex flex-col border border-gray-300 print:shadow-none print:p-[5mm] print:border-none">

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
                <div className="flex flex-col gap-3 mb-6 text-[11px]">
                    {/* Ligne 1 : Numéro de police + Catégorie avec checkboxes */}
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <span className="font-bold whitespace-nowrap">Numéro de police :</span>
                            <span className="text-gray-400 italic text-[10px]">Généré automatiquement</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="font-bold whitespace-nowrap">Catégorie :</span>
                            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setFormData({ ...formData, categorie: 'Standard' })}>
                                <div className={`w-4 h-4 border border-black flex items-center justify-center ${formData.categorie === 'Standard' ? 'bg-black' : 'bg-white'}`}>
                                    {formData.categorie === 'Standard' && <Check size={12} className="text-white" />}
                                </div>
                                <span>Standard</span>
                            </div>
                            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setFormData({ ...formData, categorie: 'Premium' })}>
                                <div className={`w-4 h-4 border border-black flex items-center justify-center ${formData.categorie === 'Premium' ? 'bg-black' : 'bg-white'}`}>
                                    {formData.categorie === 'Premium' && <Check size={12} className="text-white" />}
                                </div>
                                <span>Premium</span>
                            </div>
                        </div>
                    </div>

                    {/* Ligne 2 : Date d'effet + Date d'échéance */}
                    <div className="flex items-center gap-8">
                        <DateInput
                            label="Date d'effet"
                            value={formData.date_effet}
                            onChange={(val) => setFormData({ ...formData, date_effet: val })}
                        />
                        <DateInput
                            label="Date d'échéance"
                            value={formData.date_echeance}
                            onChange={(val) => setFormData({ ...formData, date_echeance: val })}
                        />
                    </div>
                </div>

                {/* Main Data Grid */}
                <div className="w-full border border-[#F48232] rounded-sm overflow-hidden mb-6">
                    <div className="grid grid-cols-[1fr_2fr_2fr] bg-white text-[11px]">
                        {/* Header Row */}
                        <div className="border-b border-[#F48232] bg-white p-2"></div>
                        <div className="border-b border-l border-[#F48232] bg-orange-50/50 p-2 font-bold italic text-center">Souscripteur</div>
                        <div className="border-b border-l border-[#F48232] bg-orange-50/50 p-2 font-bold italic text-center">Assuré</div>

                        <GridRow
                            label="Nom"
                            valueAssure={formData.nom} onChangeAssure={v => setFormData({ ...formData, nom: v })}
                            valueSouscripteur={formData.souscripteur_nom} onChangeSouscripteur={v => setFormData({ ...formData, souscripteur_nom: v })}
                        />
                        <GridRow
                            label="Prénom"
                            valueAssure={formData.prenom} onChangeAssure={v => setFormData({ ...formData, prenom: v })}
                            valueSouscripteur={formData.souscripteur_prenom} onChangeSouscripteur={v => setFormData({ ...formData, souscripteur_prenom: v })}
                        />
                        <GridRow
                            label="Date de naissance"
                            valueAssure={formData.date_naissance} onChangeAssure={v => setFormData({ ...formData, date_naissance: v })}
                            valueSouscripteur={formData.souscripteur_date_naissance} onChangeSouscripteur={v => setFormData({ ...formData, souscripteur_date_naissance: v })}
                        />
                        <GridRow
                            label="Numéro d'identité"
                            valueAssure={formData.numero_identite} onChangeAssure={v => setFormData({ ...formData, numero_identite: v })}
                            valueSouscripteur={formData.souscripteur_numero_identite} onChangeSouscripteur={v => setFormData({ ...formData, souscripteur_numero_identite: v })}
                        />
                        <GridRow
                            label="Numéro d'immatriculation du taxi"
                            valueAssure={formData.immatriculation_taxi} onChangeAssure={v => setFormData({ ...formData, immatriculation_taxi: v })}
                            valueSouscripteur={formData.souscripteur_immatriculation_taxi} onChangeSouscripteur={v => setFormData({ ...formData, souscripteur_immatriculation_taxi: v })}
                        />
                        <GridRow
                            label="Adresse"
                            valueAssure={formData.adresse} onChangeAssure={v => setFormData({ ...formData, adresse: v })}
                            valueSouscripteur={formData.souscripteur_adresse} onChangeSouscripteur={v => setFormData({ ...formData, souscripteur_adresse: v })}
                        />
                        <GridRow
                            label="BP"
                            valueAssure={formData.bp} onChangeAssure={v => setFormData({ ...formData, bp: v })}
                            valueSouscripteur={formData.souscripteur_bp} onChangeSouscripteur={v => setFormData({ ...formData, souscripteur_bp: v })}
                        />
                        <GridRow
                            label="Ville"
                            valueAssure={formData.ville} onChangeAssure={v => setFormData({ ...formData, ville: v })}
                            valueSouscripteur={formData.souscripteur_ville} onChangeSouscripteur={v => setFormData({ ...formData, souscripteur_ville: v })}
                        />
                        <GridRow
                            label="Téléphone"
                            valueAssure={formData.telephone} onChangeAssure={v => setFormData({ ...formData, telephone: v })}
                            valueSouscripteur={formData.souscripteur_telephone} onChangeSouscripteur={v => setFormData({ ...formData, souscripteur_telephone: v })}
                        />
                        <GridRow
                            label="Email"
                            valueAssure={formData.email} onChangeAssure={v => setFormData({ ...formData, email: v })}
                            valueSouscripteur={formData.souscripteur_email} onChangeSouscripteur={v => setFormData({ ...formData, souscripteur_email: v })}
                            isLast
                        />
                    </div>
                </div>

                {/* Contact info */}
                <div className="flex gap-8 mb-8 text-[11px] items-center">
                    <div className="flex items-center gap-2 flex-grow">
                        <span className="font-bold">Contacter en cas de besoin :</span>
                        <div className="flex items-center flex-grow">
                            <span className="border-l border-y border-black px-2 py-0.5 font-bold">|</span>
                            <input
                                className="flex-grow outline-none border-y border-black py-0.5 px-2 bg-transparent"
                                value={formData.contact_nom}
                                onChange={e => setFormData({ ...formData, contact_nom: e.target.value })}
                                placeholder="Nom du contact"
                            />
                            <span className="border-r border-y border-black px-2 py-0.5 font-bold">|</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold">Tel. :</span>
                        <div className="flex items-center">
                            <span className="border-l border-y border-black px-2 py-0.5 font-bold">|</span>
                            <input
                                className="w-40 outline-none border-y border-black py-0.5 px-2 bg-transparent"
                                value={formData.contact_telephone}
                                onChange={e => setFormData({ ...formData, contact_telephone: e.target.value })}
                                placeholder="Tél du contact"
                            />
                            <span className="border-r border-y border-black px-2 py-0.5 font-bold">|</span>
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
                                    {/* Périodicité Selection - Integrated nicely */}
                                    {/* Périodicité Selection - Custom Checkboxes with Tick */}
                                    <div className="flex gap-4 items-center">
                                        <div
                                            className="flex items-center gap-1 cursor-pointer"
                                            onClick={() => setFormData({ ...formData, periodicite: 'annuel' })}
                                        >
                                            <div className="w-4 h-4 border border-black flex items-center justify-center bg-white">
                                                {formData.periodicite === 'annuel' && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
                                            </div>
                                            <span className="italic">Annuel (25 000 FCFA)</span>
                                        </div>
                                        <div
                                            className="flex items-center gap-1 cursor-pointer"
                                            onClick={() => setFormData({ ...formData, periodicite: 'semestre' })}
                                        >
                                            <div className="w-4 h-4 border border-black flex items-center justify-center bg-white">
                                                {formData.periodicite === 'semestre' && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
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
                    Fait à <span className="inline-block border-b border-black min-w-[120px] text-center">Libreville</span>, le <span className="inline-block border-b border-black min-w-[120px] text-center">{new Date().toLocaleDateString('fr-FR')}</span>
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
        </div>
    )
}
