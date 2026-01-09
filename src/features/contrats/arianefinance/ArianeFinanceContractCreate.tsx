// src/features/contrats/arianefinance/ArianeFinanceContractCreate.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, CheckCircle, AlertCircle, Mail, Phone, MapPin, Printer } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { useCreateArianeFinanceContract } from '@/hooks/useArianeFinanceContracts'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatCurrency } from '@/lib/utils'
import logoSamba from '@/assets/logo-samba.png'

// --- Form Input Component ---
interface FormInputProps {
    label?: string
    value?: string | number
    onChange?: (value: string) => void
    type?: string
    placeholder?: string
    required?: boolean
    error?: string
    className?: string
    disabled?: boolean
}

const FormInput: React.FC<FormInputProps> = ({
    label,
    value = '',
    onChange,
    type = 'text',
    placeholder = '',
    required = false,
    error,
    className = "",
    disabled = false
}) => (
    <div className="flex flex-col w-full">
        <div className="flex items-end w-full">
            {label && (
                <span className="mr-1 whitespace-nowrap text-[11px] text-gray-800">
                    {label}{required && <span className="text-red-500">*</span>}
                </span>
            )}
            <input
                type={type}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className={`flex-grow border-b-2 ${error ? 'border-red-400 bg-red-50' : 'border-gray-400'} text-[11px] px-1 py-0.5 min-h-[22px] font-semibold bg-transparent focus:outline-none focus:border-violet-500 ${className}`}
            />
        </div>
        {error && <span className="text-[9px] text-red-500 font-medium ml-auto mt-0.5">{error}</span>}
    </div>
)

// --- Footer Component ---
const Footer: React.FC = () => {
    return (
        <div className="mt-auto pt-1 text-center text-[7px] text-gray-600 space-y-0 leading-tight">
            <div className="font-bold uppercase text-black text-[8px]">SAMB'A ASSURANCES GABON S.A.</div>
            <div>Société Anonyme avec Conseil d'Administration et Président Directeur Général.</div>
            <div>
                Entreprise de micro-assurance régie par le Code des Assurances CIMA et agréée par la CRCA sous le N° 0270 / L / CIMA / CRCA / PDT / 2024,
            </div>
            <div>
                et le Ministère de l'Economie et des Participations par l'Arrêté N° 036.24 / MEP, au capital de 610.000.000 de FCFA dont 536.000.000 de FCFA libérés.
            </div>
            <div className="mb-1">
                R.C.C.M : N° GA - LBV - 01 - 2024 - B14 - 00003 | N° STATISTIQUE : 202401003647 R
            </div>

            <div className="flex justify-between items-start border-t border-gray-300 pt-0.5 px-2">
                <div className="flex flex-col items-center w-1/3">
                    <MapPin size={10} className="mb-0 text-gray-500" />
                    <span>326 Rue Jean-Baptiste NDENDE</span>
                    <span>Avenue de COINTET | Centre-Ville | Libreville</span>
                </div>
                <div className="flex flex-col items-center w-1/3">
                    <Mail size={10} className="mb-0 text-gray-500" />
                    <span>B.P : 22 215 | Libreville | Gabon</span>
                    <span>Email : infos@samba-assurances.com</span>
                </div>
                <div className="flex flex-col items-center w-1/3">
                    <Phone size={10} className="mb-0 text-gray-500" />
                    <span>(+241) 060 08 62 62 - 074 40 41 41</span>
                    <span>074 40 51 51</span>
                </div>
            </div>
        </div>
    )
}

export const ArianeFinanceContractCreate = () => {
    const navigate = useNavigate()
    const { user } = useAuthStore()

    // ARIANE FINANCE = emf_id 9
    const userEmfId = user?.emf_id
    const userEmfSigle = user?.emf?.sigle?.toUpperCase() || ''
    const isArianeFinanceUser = userEmfId === 9 || userEmfSigle.includes('ARIANE') || user?.role === 'admin'
    const emfName = userEmfSigle || (userEmfId === 9 ? 'ARIANE FINANCE' : 'inconnu')

    const emfId = 9

    const [formData, setFormData] = useState({
        emf_id: emfId,
        nom: '',
        prenom: '',
        adresse: '',
        ville: '',
        telephone: '',
        email: '',
        numero_police: '',
        montant_pret_assure: '',
        duree_pret: '',
        date_effet: '',
        date_fin_echeance: '',
        beneficiaire_nom: '',
        beneficiaire_prenom: '',
        beneficiaire_telephone: '',
        lieu_signature: 'Libreville',
        date_signature: new Date().toISOString().split('T')[0],
        statut: 'En attente',
        categorie: 'Standard'
    })

    const [errors, setErrors] = useState<Record<string, string>>({})
    const [submitError, setSubmitError] = useState('')
    const [formErrors, setFormErrors] = useState<{ montant_pret_assure?: string, duree_pret?: string }>({})

    // Constantes ARIANE FINANCE
    const MONTANT_MAX_PRET = 10000000 // 10.000.000 FCFA
    const TAUX_DECES_IAD = 1.05 // 1.05%
    const PREVOYANCE_FORFAITAIRE = 50000 // 50.000 FCFA

    useEffect(() => {
        const montant = parseInt(formData.montant_pret_assure) || 0
        const duree = parseInt(formData.duree_pret) || 0
        const errs: { montant_pret_assure?: string, duree_pret?: string } = {}

        if (montant > MONTANT_MAX_PRET) errs.montant_pret_assure = `Max ${formatCurrency(MONTANT_MAX_PRET)}`
        if (duree > 60) errs.duree_pret = "Max 60 mois"

        setFormErrors(errs)
    }, [formData.montant_pret_assure, formData.duree_pret])

    // Validation progressive
    const isSection1Complete = Boolean(
        formData.montant_pret_assure &&
        formData.duree_pret &&
        formData.date_effet &&
        !formErrors.montant_pret_assure &&
        !formErrors.duree_pret
    )

    const isSection2Enabled = isSection1Complete
    const isSection2Complete = Boolean(
        formData.nom.trim() &&
        formData.prenom.trim() &&
        formData.telephone.trim()
    )

    const isFormComplete = isSection1Complete && isSection2Complete

    const { mutate: createContract, isPending, isSuccess, isError, error } = useCreateArianeFinanceContract()

    // Calculer la date de fin automatiquement
    useEffect(() => {
        if (formData.date_effet && formData.duree_pret) {
            const dateEffet = new Date(formData.date_effet)
            const duree = parseInt(formData.duree_pret) || 0
            dateEffet.setMonth(dateEffet.getMonth() + duree)
            setFormData(prev => ({ ...prev, date_fin_echeance: dateEffet.toISOString().split('T')[0] }))
        }
    }, [formData.date_effet, formData.duree_pret])

    useEffect(() => {
        const axiosError = error as any
        if (isError && axiosError?.response?.status === 422) {
            const validationErrors = axiosError.response.data.errors || {}
            const newErrors: Record<string, string> = {}
            Object.entries(validationErrors).forEach(([key, messages]) => {
                newErrors[key] = Array.isArray(messages) ? messages[0] : messages as string
            })
            setErrors(newErrors)
            setSubmitError('Veuillez corriger les erreurs dans le formulaire')
        } else if (isError) {
            setSubmitError('Erreur serveur. Réessayez.')
        }
    }, [isError, error])

    // Calcul cotisation ARIANE FINANCE
    const montant = parseInt(formData.montant_pret_assure) || 0
    const primeTotale = montant * (TAUX_DECES_IAD / 100)

    // Vérification d'accès
    if (!isArianeFinanceUser) {
        return (
            <div className="min-h-screen bg-gray-100 py-8 px-4">
                <div className="max-w-[210mm] mx-auto">
                    <div className="bg-red-50 border border-red-300 rounded-lg p-6 text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h1 className="text-xl font-bold text-red-700 mb-2">Accès non autorisé</h1>
                        <p className="text-red-600 mb-4">
                            Vous êtes connecté avec un compte <strong>{emfName}</strong>.
                            <br />
                            Ce formulaire est réservé aux utilisateurs ARIANE FINANCE.
                        </p>
                        <Button
                            onClick={() => navigate(-1)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Retour
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setErrors({})
        setSubmitError('')

        try {
            const newErrors: Record<string, string> = {}

            if (!formData.nom.trim()) newErrors.nom = 'Le nom est obligatoire'
            if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est obligatoire'
            if (!formData.telephone.trim()) newErrors.telephone = 'Le téléphone est obligatoire'
            if (!formData.montant_pret_assure) newErrors.montant_pret_assure = 'Le montant du prêt est obligatoire'
            if (!formData.duree_pret) newErrors.duree_pret = 'La durée du prêt est obligatoire'
            if (!formData.date_effet) newErrors.date_effet = "La date d'effet est obligatoire"

            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors)
                setSubmitError(`⚠️ ${Object.keys(newErrors).length} champ(s) obligatoire(s) manquant(s)`)
                return
            }

            const payload = {
                emf_id: Number(formData.emf_id),
                nom: formData.nom.trim(),
                prenom: formData.prenom.trim(),
                adresse: formData.adresse?.trim() || undefined,
                ville: formData.ville?.trim() || undefined,
                telephone: formData.telephone?.trim() || undefined,
                email: formData.email?.trim() || undefined,
                montant_pret_assure: parseInt(formData.montant_pret_assure),
                duree_pret: parseInt(formData.duree_pret),
                date_effet: formData.date_effet,
                date_fin_echeance: formData.date_fin_echeance || undefined,
                beneficiaire_nom: formData.beneficiaire_nom?.trim() || undefined,
                beneficiaire_prenom: formData.beneficiaire_prenom?.trim() || undefined,
                beneficiaire_telephone: formData.beneficiaire_telephone?.trim() || undefined,
            }

            console.log('📤 Payload ARIANE FINANCE:', JSON.stringify(payload, null, 2))

            createContract(payload as any, {
                onSuccess: (data: any) => {
                    console.log('✅ Contrat ARIANE FINANCE créé avec succès!')
                    navigate(`/contrats/ariane-finance/${data.id || data.data?.id}`, {
                        state: { success: 'Contrat créé avec succès !' }
                    })
                },
                onError: (error: any) => {
                    console.error('❌ Erreur création ARIANE FINANCE:', error.response?.data?.message || error.message)
                    if (error.response?.status === 422) {
                        const validationErrors = error.response.data.errors || {}
                        const errorMessages = Object.entries(validationErrors)
                            .map(([field, msgs]) => `• ${field}: ${Array.isArray(msgs) ? msgs[0] : msgs}`)
                            .join('\n')
                        setSubmitError(`❌ Erreurs de validation:\n${errorMessages || error.response?.data?.message || 'Erreur inconnue'}`)
                    } else {
                        setSubmitError(`❌ Erreur: ${error.response?.data?.message || error.message}`)
                    }
                }
            })

        } catch (error: any) {
            console.error('💥 ERREUR INATTENDUE:', error)
            setSubmitError(`💥 Erreur inattendue: ${error.message}`)
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 py-4 px-4">
            {/* Toolbar */}
            <div className="max-w-[210mm] mx-auto mb-4 flex items-center justify-between bg-white rounded-lg shadow p-3">
                <Button variant="ghost" onClick={() => navigate('/contrats/ariane-finance')} className="hover:bg-gray-100">
                    <ArrowLeft className="h-5 w-5 mr-1" />
                    Retour à la liste
                </Button>
                <h1 className="text-lg font-bold text-violet-600">Nouveau Contrat ARIANE FINANCE</h1>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => window.print()}
                        className="border-gray-300"
                    >
                        <Printer className="h-4 w-4 mr-1" />
                        Imprimer
                    </Button>
                </div>
            </div>

            {/* Messages */}
            {isSuccess && (
                <div className="max-w-[210mm] mx-auto mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-800">
                    <CheckCircle className="h-6 w-6" />
                    <span>✅ Contrat créé avec succès ! Redirection...</span>
                </div>
            )}

            {submitError && (
                <div className="max-w-[210mm] mx-auto mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-800">
                    <AlertCircle className="h-6 w-6" />
                    <span className="whitespace-pre-line">{submitError}</span>
                </div>
            )}

            {/* Indicateur de statut prévu */}
            <div className="max-w-[210mm] mx-auto mb-4 flex items-center justify-center gap-2">
                <span className="text-sm text-gray-600">Statut prévu :</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" /> Actif
                </span>
            </div>

            {/* Indicateur de progression */}
            <div className="max-w-[210mm] mx-auto mb-4 bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">Progression du formulaire :</span>
                    <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1 px-2 py-1 rounded ${isSection1Complete ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {isSection1Complete ? <CheckCircle className="h-4 w-4" /> : <span className="w-4 h-4 rounded-full border-2 border-current" />}
                            <span>Prêt</span>
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded ${isSection2Complete ? 'bg-green-100 text-green-700' : isSection2Enabled ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-400'}`}>
                            {isSection2Complete ? <CheckCircle className="h-4 w-4" /> : <span className="w-4 h-4 rounded-full border-2 border-current" />}
                            <span>Assuré</span>
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded ${isFormComplete ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                            {isFormComplete ? <CheckCircle className="h-4 w-4" /> : <span className="w-4 h-4 rounded-full border-2 border-current" />}
                            <span>Prêt à créer</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Formulaire style contrat officiel */}
            <form onSubmit={handleSubmit}>
                <div className="bg-white w-[210mm] min-h-[297mm] p-[6mm] shadow-xl relative flex flex-col mx-auto">

                    {/* Header */}
                    <div className="flex flex-col items-center mb-4">
                        <div className="mb-0">
                            <img src={logoSamba} alt="SAMB'A Assurances" className="h-[85px] w-auto" />
                        </div>
                        <h1 className="text-violet-600 text-base font-bold uppercase text-center leading-none mt-1">
                            Contrat Prévoyance & Crédits ARIANE FINANCE
                        </h1>
                        <p className="text-[8px] text-gray-500">Contrat régi par les dispositions du Code des assurances CIMA</p>
                        <h2 className="text-violet-600 text-sm font-bold uppercase mt-1">
                            Conditions Particulières
                        </h2>
                    </div>

                    {/* Form Body */}
                    <div className="border border-violet-500 w-full flex flex-col text-[10px]">

                        {/* Section: Couverture */}
                        <div className="flex border-b border-violet-500">
                            <div className="w-28 flex-shrink-0 p-1.5 bg-violet-50 italic border-r border-violet-500 flex items-center text-xs">
                                Couverture
                            </div>
                            <div className="flex-grow p-1.5 grid grid-cols-2 gap-x-4 gap-y-1">
                                <div className="col-span-2 flex items-end">
                                    <span className="mr-1 whitespace-nowrap text-[11px] text-gray-800">N° Police :</span>
                                    <span className="flex-grow border-b-2 border-gray-400 text-[11px] px-1 py-0.5 font-semibold text-gray-500 italic">
                                        (Auto-généré à la création)
                                    </span>
                                </div>
                            </div>
                            <FormInput
                                label="Statut :"
                                value={formData.statut}
                                onChange={(v) => setFormData({ ...formData, statut: v })}
                                placeholder="Ex: En attente"
                            />
                            <FormInput
                                label="Catégorie :"
                                value={formData.categorie}
                                onChange={(v) => setFormData({ ...formData, categorie: v })}
                                placeholder="Ex: Standard"
                            />
                            <FormInput
                                label="Montant du prêt assuré :"
                                value={formData.montant_pret_assure}
                                onChange={(v) => setFormData({ ...formData, montant_pret_assure: v })}
                                type="number"
                                placeholder="Ex: 2000000"
                                required
                                error={errors.montant_pret_assure || formErrors.montant_pret_assure}
                            />
                            <FormInput
                                label="Durée du prêt (mois) :"
                                value={formData.duree_pret}
                                onChange={(v) => setFormData({ ...formData, duree_pret: v })}
                                type="number"
                                placeholder="Ex: 12"
                                required
                                error={errors.duree_pret || formErrors.duree_pret}
                            />
                            <FormInput
                                label="Date d'effet :"
                                value={formData.date_effet}
                                onChange={(v) => setFormData({ ...formData, date_effet: v })}
                                type="date"
                                required
                                error={errors.date_effet}
                            />
                            <FormInput
                                label="Date de fin d'échéance :"
                                value={formData.date_fin_echeance}
                                disabled
                            />
                        </div>
                    </div>
                    {/* Section: Assuré/Emprunteur */}
                    <div className={`flex border-b border-violet-500 ${!isSection2Enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="w-28 flex-shrink-0 p-1.5 bg-violet-50 italic border-r border-violet-500 flex flex-col justify-center text-xs">
                            Assuré/Emprunteur
                        </div>
                        <div className="flex-grow p-1.5 space-y-1">
                            <div className="flex gap-2">
                                <FormInput
                                    label="Nom :"
                                    value={formData.nom}
                                    onChange={(v) => setFormData({ ...formData, nom: v })}
                                    placeholder="Ex: NGUEMA"
                                    required
                                    error={errors.nom}
                                    disabled={!isSection2Enabled}
                                />
                                <FormInput
                                    label="Prénom :"
                                    value={formData.prenom}
                                    onChange={(v) => setFormData({ ...formData, prenom: v })}
                                    placeholder="Ex: Jean"
                                    required
                                    error={errors.prenom}
                                    disabled={!isSection2Enabled}
                                />
                            </div>
                            <div className="flex gap-2">
                                <FormInput
                                    label="Adresse :"
                                    value={formData.adresse}
                                    onChange={(v) => setFormData({ ...formData, adresse: v })}
                                    placeholder="Ex: Quartier Louis"
                                    disabled={!isSection2Enabled}
                                />
                                <FormInput
                                    label="Ville :"
                                    value={formData.ville}
                                    onChange={(v) => setFormData({ ...formData, ville: v })}
                                    placeholder="Ex: Libreville"
                                    disabled={!isSection2Enabled}
                                />
                            </div>
                            <div className="flex gap-2">
                                <FormInput
                                    label="Téléphone :"
                                    value={formData.telephone}
                                    onChange={(v) => setFormData({ ...formData, telephone: v })}
                                    placeholder="Ex: 06 12 34 56"
                                    required
                                    error={errors.telephone}
                                    disabled={!isSection2Enabled}
                                />
                                <FormInput
                                    label="Email :"
                                    value={formData.email}
                                    onChange={(v) => setFormData({ ...formData, email: v })}
                                    placeholder="Ex: email@example.com"
                                    type="email"
                                    disabled={!isSection2Enabled}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section: Bénéficiaire */}
                    <div className={`flex border-b border-violet-500 ${!isSection2Enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="w-28 flex-shrink-0 p-1.5 bg-violet-50 italic border-r border-violet-500 flex flex-col justify-center text-xs">
                            Bénéficiaire
                        </div>
                        <div className="flex-grow p-1.5 space-y-1">
                            <div className="flex gap-2">
                                <FormInput
                                    label="Nom :"
                                    value={formData.beneficiaire_nom}
                                    onChange={(v) => setFormData({ ...formData, beneficiaire_nom: v })}
                                    placeholder="Ex: NGUEMA"
                                    disabled={!isSection2Enabled}
                                />
                                <FormInput
                                    label="Prénom :"
                                    value={formData.beneficiaire_prenom}
                                    onChange={(v) => setFormData({ ...formData, beneficiaire_prenom: v })}
                                    placeholder="Ex: Marie"
                                    disabled={!isSection2Enabled}
                                />
                                <FormInput
                                    label="Téléphone :"
                                    value={formData.beneficiaire_telephone}
                                    onChange={(v) => setFormData({ ...formData, beneficiaire_telephone: v })}
                                    placeholder="Ex: 07 77 88 99"
                                    disabled={!isSection2Enabled}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section: Cotisations */}
                    <div className="flex bg-violet-50/50">
                        <div className="w-28 flex-shrink-0 p-1.5 bg-violet-50 italic border-r border-violet-500 flex flex-col justify-center text-xs">
                            Cotisations
                        </div>
                        <div className="flex-grow p-2">
                            <div className="space-y-1 text-[10px]">
                                <div className="flex justify-between">
                                    <span>Taux Décès/IAD :</span>
                                    <span className="font-bold">{TAUX_DECES_IAD}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Calcul ({TAUX_DECES_IAD}% × {formatCurrency(montant)}) :</span>
                                    <span className="font-bold">{formatCurrency(primeTotale)}</span>
                                </div>
                                <div className="flex justify-between border-t pt-1 mt-1">
                                    <span className="font-bold">Prime totale :</span>
                                    <span className="font-extrabold text-violet-600 text-base">{formatCurrency(primeTotale)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footnotes */}
                    <div className="mt-2 space-y-0.5 text-[9px] text-black font-bold">
                        <p>(1) Le montant maximal du prêt couvert est de FCFA {formatCurrency(MONTANT_MAX_PRET)}.</p>
                        <p>(2) La Prévoyance forfaitaire est de {formatCurrency(PREVOYANCE_FORFAITAIRE)}.</p>
                        <p>(3) La formule de calcul : Prime = prêt × {TAUX_DECES_IAD}%.</p>
                    </div>

                    {/* Signatures */}
                    <div className="mt-auto mb-2">
                        <div className="text-right mb-2 pr-8 font-medium text-[10px]">
                            Fait à <input
                                type="text"
                                value={formData.lieu_signature}
                                onChange={(e) => setFormData({ ...formData, lieu_signature: e.target.value })}
                                className="border-b border-black px-2 mx-1 font-semibold bg-transparent focus:outline-none focus:border-violet-500 w-24"
                            />,
                            le <input
                                type="date"
                                value={formData.date_signature}
                                onChange={(e) => setFormData({ ...formData, date_signature: e.target.value })}
                                className="border-b border-black px-2 mx-1 font-semibold bg-transparent focus:outline-none focus:border-violet-500"
                            />
                        </div>

                        <div className="flex justify-between px-4">
                            <div className="w-[30%]">
                                <div className="mb-1 font-bold text-xs">Le Souscripteur</div>
                                <div className="border border-black h-16 p-0.5 text-gray-300 font-bold text-center flex items-center justify-center text-[9px] bg-white shadow-sm">
                                    Signature et cachet
                                </div>
                            </div>

                            <div className="w-[35%] flex flex-col items-center justify-end pb-2 font-bold text-[9px] space-y-0.5">
                                <div className="flex gap-4">
                                    <span>Feuillet 1 : Assuré</span>
                                    <span>Feuillet 2 : ARIANE</span>
                                </div>
                                <div className="flex gap-4">
                                    <span>Feuillet 3 : SAMB'A</span>
                                    <span>Feuillet 4 : Souche</span>
                                </div>
                            </div>

                            <div className="w-[30%]">
                                <div className="mb-1 font-bold text-xs text-right">ARIANE FINANCE P/C de l'Assureur</div>
                                <div className="border border-black h-16 p-0.5 text-gray-300 font-bold text-center flex items-center justify-center text-[9px] bg-white shadow-sm">
                                    Signature et cachet
                                </div>
                            </div>
                        </div>
                    </div>

                    <Footer />
                </div>

                {/* Bouton de soumission */}
                <div className="max-w-[210mm] mx-auto mt-6 flex gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/contrats/ariane-finance')}
                        className="flex-1"
                        disabled={isPending}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Annuler
                    </Button>
                    <Button
                        type="submit"
                        disabled={isPending || !isFormComplete}
                        className={`flex-1 text-white font-semibold text-lg py-3 ${isFormComplete
                            ? 'bg-violet-600 hover:bg-violet-700'
                            : 'bg-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {isPending ? (
                            <>
                                <LoadingSpinner size="sm" />
                                <span className="ml-2">Création en cours...</span>
                            </>
                        ) : !isFormComplete ? (
                            <>
                                <AlertCircle className="h-5 w-5 mr-2" />
                                Remplir les champs obligatoires
                            </>
                        ) : (
                            <>
                                <Save className="h-5 w-5 mr-2" />
                                Créer le Contrat ARIANE FINANCE
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default ArianeFinanceContractCreate
