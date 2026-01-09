import React, { useEffect } from 'react'
import { UseFormReturn, FieldValues } from 'react-hook-form'
import { Mail, Phone, MapPin } from 'lucide-react'
import logoSamba from '@/assets/logo-samba.png'

// --- Internal Reusable Components ---

export const Logo: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center">
            <img src={logoSamba} alt="SAMB'A Assurances" className="h-[80px] w-auto" />
        </div>
    )
}

// --- Checkbox Component ---
interface CheckboxProps {
    label: string
    checked?: boolean
    onChange?: (checked: boolean) => void
    disabled?: boolean
}

const Checkbox: React.FC<CheckboxProps> = ({ label, checked = false, onChange, disabled = false }) => (
    <div
        className={`flex items-center mr-3 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (!disabled) onChange?.(!checked)
        }}
    >
        <div className={`w-4 h-4 border-2 border-black mr-1 flex items-center justify-center transition-colors ${checked ? 'bg-white' : disabled ? 'bg-gray-200' : 'bg-white hover:bg-orange-50'}`}>
            {checked && (
                <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                </svg>
            )}
        </div>
        <span className="text-[10px] text-gray-800">{label}</span>
    </div>
)

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="w-40 flex-shrink-0 p-2 italic border-r border-[#F48232] flex items-center text-[10px] font-medium text-gray-700 bg-white leading-tight">
        {children}
    </div>
)

const PipeInput: React.FC<{ width?: string; register?: UseFormReturn<FieldValues>['register']; name?: string; readOnly?: boolean; value?: string | number; error?: string; placeholder?: string }> = ({ width = "w-40", register, name, readOnly, value, error, placeholder }) => (
    <div className="flex flex-col">
        <input
            className={`${width} outline-none border ${error ? 'border-red-500' : 'border-gray-300'} py-1 px-2 text-[10px] bg-transparent rounded`}
            {...(register && name ? register(name) : {})}
            readOnly={readOnly}
            defaultValue={value}
            placeholder={placeholder}
            aria-label={placeholder || name || 'Input field'}
        />
        {error && <span className="text-[9px] text-red-600 font-bold mt-0.5">{error}</span>}
    </div>
)

const DatePipeInput: React.FC<{ value?: string; onChange?: (val: string) => void; readOnly?: boolean; error?: string }> = ({ value, onChange, readOnly, error }) => {
    if (readOnly) {
        return (
            <div className="w-32 py-1 px-2 text-[10px] border-b border-gray-200">
                {value ? new Date(value).toLocaleDateString('fr-FR') : '-'}
            </div>
        )
    }
    return (
        <div className="flex flex-col">
            <input
                type="date"
                className={`w-32 outline-none border ${error ? 'border-red-500' : 'border-gray-300'} py-1 px-2 text-[10px] bg-transparent rounded`}
                value={value}
                onChange={(e) => onChange && onChange(e.target.value)}
                aria-label="Date selection"
            />
            {error && <span className="text-[9px] text-red-600 font-bold mt-0.5">{error}</span>}
        </div>
    )
}

const ToggleSwitch: React.FC<{ active?: boolean; onClick?: () => void; readOnly?: boolean }> = ({ active = false, onClick, readOnly }) => (
    <div
        className={`w-10 h-5 rounded-full p-1 flex items-center ${active ? 'bg-black' : 'bg-gray-300'} ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
        onClick={() => !readOnly && onClick && onClick()}
    >
        <div className={`w-3 h-3 rounded-full bg-white transition-transform ${active ? 'translate-x-5' : 'translate-x-0'}`} />
    </div>
)

interface AgrProContractFormLayoutProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: UseFormReturn<any>
    readOnly?: boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultValues?: Record<string, any>
}

export const AgrProContractFormLayout = ({ form, readOnly, defaultValues }: AgrProContractFormLayoutProps) => {
    const { register, watch, setValue, formState: { errors } } = form

    // Always active (implicitly true)

    // Removed detailed useEffects for toggles since they are fixed true
    useEffect(() => {
        if (!readOnly) {
            setValue('prime_unique', 5000)
            setValue('montant_prevoyance_forfaitaire', 250000)
            setValue('taux_pret', 3.0)
        }
    }, [setValue, readOnly])

    const dateEffet = watch('date_effet') as string | undefined
    const dureePret = watch('duree_pret') as number | undefined
    const dateFinEcheance = watch('date_fin_echeance') as string | undefined

    // Auto-calculate Expiration Date
    useEffect(() => {
        if (dateEffet && dureePret && !readOnly) {
            const date = new Date(dateEffet)
            const months = Number(dureePret)
            if (!isNaN(date.getTime()) && !isNaN(months) && months > 0) {
                date.setMonth(date.getMonth() + months)
                // Format YYYY-MM-DD
                const y = date.getFullYear()
                const m = String(date.getMonth() + 1).padStart(2, '0')
                const d = String(date.getDate()).padStart(2, '0')
                setValue('date_fin_echeance', `${y}-${m}-${d}`, { shouldValidate: true })
            }
        }
    }, [dateEffet, dureePret, setValue, readOnly])

    const montantPret = (watch('montant_pret_assure') as number) || 0
    const categorie = watch('categorie') as string | undefined
    const primeUnique = 5000
    const primeVariable = Math.round(Number(montantPret) * 0.03)
    const primeTotale = primeUnique + primeVariable

    // Check validation status for sequential enabling
    // We check if specific fields have errors or are empty to determine if next section is open
    // However, with RHF 'formState.errors', we know if a field is invalid *after* interaction/submit.
    // To strictly enforce "fill this first", we can check values.
    const w = watch()
    const isCouvertureValid = w.duree_pret && w.montant_pret_assure && w.date_fin_echeance && w.date_effet && !errors.duree_pret && !errors.montant_pret_assure && !errors.date_fin_echeance && !errors.date_effet
    const isAssureValid = w.nom && w.prenom && w.adresse && w.ville && w.telephone && w.email && !errors.nom && !errors.prenom && !errors.adresse && !errors.ville && !errors.telephone && !errors.email

    return (
        <div className="bg-white w-[210mm] min-h-[297mm] p-[10mm] shadow-2xl relative flex flex-col border border-gray-300 print:shadow-none print:border-none overflow-hidden mx-auto font-sans">
            {/* Header ... */}
            <div className="flex justify-between items-start mb-2">
                <Logo />
                <div className="flex flex-col items-center flex-grow pt-4">
                    <h1 className="text-[#F48232] text-xl font-bold italic text-center tracking-tight leading-none uppercase">
                        CONTRAT DECES EMPRUNTEUR : AGR PRO CONSULTING
                    </h1>
                    {/* ... header text ... */}
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
                            <PipeInput
                                width="w-40"
                                register={register}
                                name="numero_police"
                                readOnly={true}
                                value={defaultValues?.numero_police}
                                placeholder="Généré automatiquement"
                                error={errors.numero_police?.message as string}
                            />
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="w-32 font-medium">Durée du prêt (mois) :</span>
                            <PipeInput width="w-40" register={register} name="duree_pret" readOnly={readOnly} value={defaultValues?.duree_pret} error={errors.duree_pret?.message as string} />
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="w-32 font-medium">Montant du prêt assuré :</span>
                            <PipeInput width="w-40" register={register} name="montant_pret_assure" readOnly={readOnly} value={defaultValues?.montant_pret_assure} error={errors.montant_pret_assure?.message as string} />
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="w-32 font-medium">Date d'effet :</span>
                            <DatePipeInput
                                value={dateEffet || defaultValues?.date_effet as string}
                                onChange={(val) => !readOnly && setValue('date_effet', val, { shouldValidate: true })}
                                readOnly={readOnly}
                                error={errors.date_effet?.message as string}
                            />
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="w-32 font-medium">Date de fin d'échéance :</span>
                            <DatePipeInput
                                value={dateFinEcheance || defaultValues?.date_fin_echeance as string}
                                readOnly={true} // Calculated
                                error={errors.date_fin_echeance?.message as string}
                            />
                        </div>
                    </div>
                </div>

                {/* Section: Personne assurée */}
                <div className={`flex border-b border-[#F48232] transition-opacity ${!isCouvertureValid && !readOnly ? 'opacity-50 pointer-events-none' : ''}`}>
                    <SectionLabel>Personne assurée</SectionLabel>
                    <div className="flex-grow p-2 space-y-1.5 bg-orange-50/10">
                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="w-24 font-medium">Nom :</span>
                            <div className="flex flex-col flex-grow">
                                <input className="w-full border-b border-gray-400 outline-none px-1 h-4 bg-transparent" {...register('nom')} readOnly={readOnly} defaultValue={defaultValues?.nom} />
                                {errors.nom && <span className="text-[9px] text-red-600 font-bold">{errors.nom.message as string}</span>}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="w-24 font-medium">Prénom :</span>
                            <div className="flex flex-col flex-grow">
                                <input className="w-full border-b border-gray-400 outline-none px-1 h-4 bg-transparent" {...register('prenom')} readOnly={readOnly} defaultValue={defaultValues?.prenom} />
                                {errors.prenom && <span className="text-[9px] text-red-600 font-bold">{errors.prenom.message as string}</span>}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="w-24 font-medium">Adresse :</span>
                            <input className="flex-grow border-b border-gray-400 outline-none px-1 h-4 bg-transparent" {...register('adresse')} readOnly={readOnly} defaultValue={defaultValues?.adresse} />
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="w-24 font-medium">Ville :</span>
                            <input className="flex-grow border-b border-gray-400 outline-none px-1 h-4 bg-transparent" {...register('ville')} readOnly={readOnly} defaultValue={defaultValues?.ville} />
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="w-24 font-medium">Téléphone :</span>
                            <input className="flex-grow border-b border-gray-400 outline-none px-1 h-4 bg-transparent" {...register('telephone')} readOnly={readOnly} defaultValue={defaultValues?.telephone} />
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="w-24 font-medium">Email :</span>
                            <div className="flex flex-col flex-grow">
                                <input className="w-full border-b border-gray-400 outline-none px-1 h-4 bg-transparent" {...register('email')} readOnly={readOnly} defaultValue={defaultValues?.email} />
                                {errors.email && <span className="text-[9px] text-red-600 font-bold">{errors.email.message as string}</span>}
                            </div>
                        </div>
                        
                        {/* Catégories */}
                        <div className="mt-2 pt-2 border-t border-gray-200">
                            <div className="flex items-start gap-2 text-[10px]">
                                <span className="w-24 font-medium mt-0.5">Catégorie :</span>
                                <div className="flex-grow">
                                    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                                        <Checkbox
                                            label="Commerçants"
                                            checked={categorie === 'commercants'}
                                            onChange={() => !readOnly && setValue('categorie', 'commercants')}
                                            disabled={readOnly}
                                        />
                                        <Checkbox
                                            label="Salariés du public"
                                            checked={categorie === 'salaries_public'}
                                            onChange={() => !readOnly && setValue('categorie', 'salaries_public')}
                                            disabled={readOnly}
                                        />
                                        <Checkbox
                                            label="Salariés du privé"
                                            checked={categorie === 'salaries_prive'}
                                            onChange={() => !readOnly && setValue('categorie', 'salaries_prive')}
                                            disabled={readOnly}
                                        />
                                        <Checkbox
                                            label="Retraités"
                                            checked={categorie === 'retraites'}
                                            onChange={() => !readOnly && setValue('categorie', 'retraites')}
                                            disabled={readOnly}
                                        />
                                        <Checkbox
                                            label="Autre"
                                            checked={categorie === 'autre'}
                                            onChange={() => !readOnly && setValue('categorie', 'autre')}
                                            disabled={readOnly}
                                        />
                                        <div className="flex items-center">
                                            <span className="text-[9px] text-gray-600 mr-1">à préciser :</span>
                                            <input
                                                type="text"
                                                {...register('autre_categorie_precision')}
                                                className="border-b border-gray-400 w-28 text-[9px] px-1 bg-transparent outline-none focus:border-[#F48232]"
                                                disabled={readOnly || categorie !== 'autre'}
                                                placeholder="Préciser..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section: Souscripteur / Association */}
                <div className="flex border-b border-[#F48232]">
                    <SectionLabel>Souscripteur/Association</SectionLabel>
                    <div className="flex-grow p-2 space-y-1 text-[10px]">
                        <div className="flex"><span className="w-24 font-medium">Raison sociale :</span><span className="flex-grow">AGR PRO CONSULTING</span></div>
                        {/* ... rest of static info ... */}
                        <div className="flex"><span className="w-24 font-medium">RCCM :</span><span className="flex-grow">RG LBV 2018A47379 / NIF N° 285676 Г</span></div>
                        <div className="flex"><span className="w-24 font-medium">Adresse :</span><span className="flex-grow">Entre le Carrefour ancienne Sobraga et ancienne RTG 1</span></div>
                        <div className="flex"><span className="w-24 font-medium">Ville :</span><span className="flex-grow">Libreville</span></div>
                        <div className="flex"><span className="w-24 font-medium">Téléphone :</span><span className="flex-grow">060501849 / 074250462</span></div>
                        <div className="flex"><span className="w-24 font-medium">Email :</span><span className="flex-grow text-blue-600 underline">agrproconsulting@gmail.com</span></div>
                    </div>
                </div>

                {/* Section: Bénéficiaire */}
                <div className={`flex border-b border-[#F48232] transition-opacity ${(!isAssureValid || !isCouvertureValid) && !readOnly ? 'opacity-50 pointer-events-none' : ''}`}>
                    <SectionLabel>Bénéficiaire de la <br /> Prévoyance</SectionLabel>
                    <div className="flex-grow p-2 space-y-1.5">
                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="w-24 font-medium">Nom :</span>
                            <input className="flex-grow border-b border-gray-400 outline-none px-1 h-4 bg-transparent" {...register('beneficiaire_prevoyance_nom')} readOnly={readOnly} defaultValue={defaultValues?.beneficiaire_prevoyance_nom} />
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="w-24 font-medium">Prénom :</span>
                            <input className="flex-grow border-b border-gray-400 outline-none px-1 h-4 bg-transparent" {...register('beneficiaire_prevoyance_prenom')} readOnly={readOnly} defaultValue={defaultValues?.beneficiaire_prevoyance_prenom} />
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="w-24 font-medium">Téléphone :</span>
                            <input className="flex-grow border-b border-gray-400 outline-none px-1 h-4 bg-transparent" {...register('beneficiaire_prevoyance_telephone')} readOnly={readOnly} defaultValue={defaultValues?.beneficiaire_prevoyance_telephone} />
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
                                        <ToggleSwitch active={true} readOnly={true} />
                                    </td>
                                    <td className="p-2 border-r border-gray-200 text-center">N/A</td>
                                    <td className="p-2 text-center font-bold">5.000 FCFA</td>
                                </tr>
                                <tr>
                                    <td className="p-2 border-r border-gray-200">Décès – invalidité absolue et définitive (IAD) <br /> & Perte d'activités</td>
                                    <td className="p-2 border-r border-gray-200 text-center text-gray-400">Toute catégorie</td>
                                    <td className="p-2 border-r border-gray-200 flex justify-center">
                                        <ToggleSwitch active={true} readOnly={true} />
                                    </td>
                                    <td className="p-2 border-r border-gray-200 text-center">3,00%</td>
                                    <td className="p-2 text-center font-bold">N/A</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ... Cotisations ... */}
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
                    Fait à <span className="border-b border-black w-56 inline-block text-center">{defaultValues?.ville || 'Libreville'}</span>, le {readOnly && defaultValues?.created_at ? (
                        <span className="border-b border-black w-28 inline-block text-center">
                            {new Date(defaultValues.created_at).toLocaleDateString('fr-FR')}
                        </span>
                    ) : (
                        <>
                            <span className="border-b border-black w-8 inline-block text-center">
                                {new Date().getDate().toString().padStart(2, '0')}
                            </span> / <span className="border-b border-black w-8 inline-block text-center">
                                {(new Date().getMonth() + 1).toString().padStart(2, '0')}
                            </span> / <span className="border-b border-black w-12 inline-block text-center">
                                {new Date().getFullYear()}
                            </span>
                        </>
                    )}
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

            {/* Detailed Footer */}
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
        </div>
    )
}
