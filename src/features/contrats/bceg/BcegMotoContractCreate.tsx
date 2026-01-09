import React, { useState, useEffect, InputHTMLAttributes } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Printer, Save, ArrowLeft, AlertCircle } from 'lucide-react'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useCreateBcegMotoContract, useBcegMotoContract } from '@/hooks/useBcegMotoContracts'
import { Button } from '@/components/ui/Button'
import logoSamba from '@/assets/logo-samba.png'


// --- Internal Reusable Components ---

const Logo: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center">
            <img
                src={logoSamba}
                alt="SAMB'A Assurances"
                className="h-[60px] w-auto"
            />
        </div>
    );
};

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

const FormInput: React.FC<InputProps> = ({ label, className = "", ...props }) => (
    <div className="flex items-end w-full">
        {label && <span className="mr-2 whitespace-nowrap text-[11px] text-gray-800">{label}</span>}
        <input
            className={`flex-grow border-b border-gray-400 bg-transparent text-[11px] px-1 py-0 focus:outline-none focus:border-orange-500 font-semibold ${className}`}
            {...props}
        />
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

// --- Constants ---
const TAUX_PRIME_UNIQUE = 0.50
const MONTANT_MAX_COUVERTURE = 3500000
const FORFAIT_GARANTIES_COMPLEMENTAIRES = 35000
const TYPE_CONTRAT = "Contrat SAMB'A MOTO"

export const BcegMotoContractCreate = () => {
    const navigate = useNavigate()
    const { id } = useParams()

    const emfId = 3

    // Fonction pour générer un numéro de police unique
    const generatePolicyNumber = () => {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `MOTO-${dateStr}-${random}`;
    }

    // Hook to fetch contract if ID is present
    const { data: contractData } = useBcegMotoContract(id ? Number(id) : undefined)

    const [formData, setFormData] = useState({
        emf_id: emfId,
        numero_police: id ? '' : generatePolicyNumber(),
        // Prêt
        montant_pret: '',
        duree_pret: '', // mois
        date_effet: new Date().toISOString().split('T')[0],
        date_fin_echeance: '',

        // Assuré
        nom: '',
        prenom: '',
        ville: '',
        adresse_telephone: '',

        // Engin
        marque_type_engin: '',
        valeur_assuree: '',
        immatriculation: '',

        // Calculated (display only or for submission)
        taux_prime_unique: TAUX_PRIME_UNIQUE,
        cotisations_complementaires: FORFAIT_GARANTIES_COMPLEMENTAIRES,
        statut: 'En attente',
        categorie: 'Standard'
    })

    // Populate form if Edit/View Mode
    useEffect(() => {
        if (contractData) {
            setFormData({
                emf_id: contractData.emf_id || emfId,
                montant_pret: contractData.montant_pret?.toString() || '',
                duree_pret: contractData.duree_pret?.toString() || '',
                date_effet: contractData.date_effet || '',
                date_fin_echeance: contractData.date_fin_echeance || '',
                nom: contractData.nom || '',
                prenom: contractData.prenom || '',
                ville: contractData.ville || '',
                adresse_telephone: contractData.adresse_telephone || '',
                marque_type_engin: contractData.marque_type_engin || '',
                valeur_assuree: contractData.valeur_assuree?.toString() || '',
                immatriculation: contractData.immatriculation || '',
                taux_prime_unique: contractData.taux_prime_unique || TAUX_PRIME_UNIQUE,
                cotisations_complementaires: contractData.cotisations_complementaires || FORFAIT_GARANTIES_COMPLEMENTAIRES,
                numero_police: contractData.numero_police || contractData.police_numero || '',
                statut: contractData.statut || 'En attente',
                categorie: contractData.categorie || 'Standard'
            })
        }
    }, [contractData])

    // Calculated values for display
    const [primes, setPrimes] = useState({
        prime_deces: 0,
        prime_totale: 0
    })

    const [submitError, setSubmitError] = useState('')
    const { mutate: createContract, isPending } = useCreateBcegMotoContract()
    const [formErrors, setFormErrors] = useState<{ montant_pret?: string, duree_pret?: string }>({})

    // Auto-calculate end date
    useEffect(() => {
        if (formData.date_effet && formData.duree_pret) {
            const dateEffet = new Date(formData.date_effet)
            const duree = parseInt(formData.duree_pret) || 0
            dateEffet.setMonth(dateEffet.getMonth() + duree)
            setFormData(prev => ({ ...prev, date_fin_echeance: dateEffet.toISOString().split('T')[0] }))
        }
    }, [formData.date_effet, formData.duree_pret])

    // Auto-calculate primes
    useEffect(() => {
        const montant = parseFloat(formData.montant_pret) || 0
        const primeDeces = Math.round(montant * (TAUX_PRIME_UNIQUE / 100))
        const total = primeDeces + FORFAIT_GARANTIES_COMPLEMENTAIRES

        setPrimes({
            prime_deces: primeDeces,
            prime_totale: total
        })
    }, [formData.montant_pret])

    // Validation
    useEffect(() => {
        const errors: { montant_pret?: string, duree_pret?: string } = {}
        const montant = parseFloat(formData.montant_pret) || 0
        // const duree = parseInt(formData.duree_pret) || 0

        if (montant > MONTANT_MAX_COUVERTURE) {
            errors.montant_pret = `Max ${new Intl.NumberFormat('fr-FR').format(MONTANT_MAX_COUVERTURE)} FCFA`
        }
        setFormErrors(errors)
    }, [formData.montant_pret])

    const isFormComplete = Boolean(
        formData.montant_pret &&
        formData.duree_pret &&
        formData.date_effet &&
        formData.nom.trim() &&
        formData.prenom.trim() &&
        formData.ville.trim() &&
        formData.adresse_telephone.trim() &&
        formData.marque_type_engin.trim() &&
        formData.valeur_assuree &&
        formData.immatriculation.trim() &&
        Object.keys(formErrors).length === 0
    )

    const handleSubmit = () => {
        setSubmitError('')

        const payload = {
            ...formData,
            type_contrat: TYPE_CONTRAT,
            numero_police: formData.numero_police,
            montant_pret: parseFloat(formData.montant_pret),
            duree_pret: parseInt(formData.duree_pret),
            valeur_assuree: parseFloat(formData.valeur_assuree) || null,
            prime_deces_invalidite: primes.prime_deces,
            prime_totale: primes.prime_totale,
            devise: 'FCFA'
        }

        createContract(payload, {
            onSuccess: () => {
                navigate(`/contrats/bceg`)
            },
            onError: (err: any) => {
                const message = err.response?.data?.message || err.message || 'Erreur lors de la création'
                let details = ''

                if (err.response?.data?.errors) {
                    details = Object.values(err.response.data.errors).flat().join(', ')
                }

                setSubmitError(`${message} ${details ? ': ' + details : ''}`)
            }
        })
    }

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('fr-FR').format(val)
    }

    return (
        <div className="min-h-screen bg-gray-200 py-4 flex flex-col items-center font-sans overflow-x-hidden">
            {/* 🛠️ Toolbar */}
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
                    {!id && (
                        <Button
                            onClick={handleSubmit}
                            disabled={!isFormComplete || isPending}
                            className={`${isFormComplete ? 'bg-[#F48232] hover:bg-[#e0742a]' : 'bg-gray-400'}`}
                        >
                            {isPending ? <LoadingSpinner size="sm" /> : <><Save className="h-4 w-4 mr-2" /> Enregistrer le Contrat</>}
                        </Button>
                    )}
                </div>
            </div>

            {/* 🚨 Error Display */}
            {submitError && (
                <div className="w-[210mm] mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded print:hidden">
                    <AlertCircle className="h-4 w-4 inline mr-2" /> {submitError}
                </div>
            )}

            {/* A4 Document Container */}
            <div className="bg-white w-[210mm] min-h-[297mm] p-[10mm] shadow-2xl relative flex flex-col border border-gray-300 print:shadow-none print:p-[5mm]">

                {/* Header Section */}
                <div className="flex justify-between items-start mb-1">
                    <Logo />
                    <div className="flex flex-col items-center flex-grow pt-4">
                        <h1 className="text-[#F48232] text-3xl font-bold italic text-center tracking-tight leading-none">
                            Contrat SAMB'A MOTO
                        </h1>
                        <div className="text-[10px] text-gray-700 font-medium mt-2 text-center leading-tight">
                            Contrat régi par les dispositions du Code des assurances CIMA<br />
                            Visas DNA N°005/24 et N°004/24 - Police N° 509/111.701/0125
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
                            <div className="flex mb-1">
                                <FormInput
                                    label="N° Police :"
                                    value={formData.numero_police}
                                    readOnly
                                    className="text-orange-600 font-bold"
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <FormInput
                                        label="Montant du prêt :"
                                        value={formData.montant_pret}
                                        onChange={e => setFormData({ ...formData, montant_pret: e.target.value })}
                                        type="number"
                                        placeholder="0"
                                    />
                                    {formErrors.montant_pret && <p className="text-[9px] text-red-500 text-right">{formErrors.montant_pret}</p>}
                                </div>
                                <div className="flex-1">
                                    <FormInput
                                        label="Durée du prêt :"
                                        value={formData.duree_pret}
                                        onChange={e => setFormData({ ...formData, duree_pret: e.target.value })}
                                        placeholder="Mois"
                                        type="number"
                                    />
                                </div>
                            </div>
                            <div className="flex">
                                <FormInput
                                    label="Date d'effet :"
                                    type="date"
                                    value={formData.date_effet}
                                    onChange={e => setFormData({ ...formData, date_effet: e.target.value })}
                                />
                            </div>
                            <div className="flex">
                                <FormInput
                                    label="Date de fin d'échéance :"
                                    type="date"
                                    value={formData.date_fin_echeance}
                                    readOnly
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
                                value={formData.nom}
                                onChange={e => setFormData({ ...formData, nom: e.target.value.toUpperCase() })}
                                placeholder="NOM"
                            />
                            <FormInput
                                label="Prénom :"
                                value={formData.prenom}
                                onChange={e => setFormData({ ...formData, prenom: e.target.value })}
                            />
                            <FormInput
                                label="Ville :"
                                value={formData.ville}
                                onChange={e => setFormData({ ...formData, ville: e.target.value })}
                            />
                            <FormInput
                                label="Adresse et téléphone :"
                                value={formData.adresse_telephone}
                                onChange={e => setFormData({ ...formData, adresse_telephone: e.target.value })}
                            />
                            <div className="flex gap-4">
                                <FormInput
                                    label="Marque/Type d'engin :"
                                    value={formData.marque_type_engin}
                                    onChange={e => setFormData({ ...formData, marque_type_engin: e.target.value })}
                                />
                                <FormInput
                                    label="Immatriculation :"
                                    value={formData.immatriculation}
                                    onChange={e => setFormData({ ...formData, immatriculation: e.target.value.toUpperCase() })}
                                />
                            </div>
                            <FormInput
                                label="Valeur assurée :"
                                value={formData.valeur_assuree}
                                onChange={e => setFormData({ ...formData, valeur_assuree: e.target.value })}
                                type="number"
                                placeholder="0"
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
                                        <td className="p-2 text-center font-bold">0,50%</td>
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
                                    {primes.prime_totale > 0 && `${formatCurrency(primes.prime_totale)}`}
                                </div>
                                <span className="whitespace-nowrap">FCFA TTC (35.000 FCFA) + (0,50% x Prêt)</span>
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
                        Fait à <input className="border-b border-black w-48 text-center outline-none bg-transparent" placeholder="Libreville" value="Libreville" readOnly />, le <span className="inline-block border-b border-black min-w-[120px] text-center">{new Date().toLocaleDateString('fr-FR')}</span>
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
                            {/* Empty space between signature blocks */}
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
        </div>
    )
}
