import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-hot-toast'
import { Save } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { useCreateAgrProContract } from '@/hooks/useAgrProContracts'
import { AgrProContratCreatePayload } from '@/types/agrpro'
import { AgrProContractFormLayout } from './components/AgrProContractFormLayout'

// Schema de validation
// Schema de validation
const schema = z.object({
    numero_police: z.string().optional(),
    duree_pret: z.union([z.string(), z.number()])
        .refine((val) => (Number(val) || 0) <= 12, {
            message: "La durée maximale du prêt est de 12 mois.",
        }),
    montant_pret_assure: z.union([z.string(), z.number()])
        .refine((val) => (Number(val) || 0) <= 1000000, {
            message: "Le montant maximal du prêt couvert est de 1.000.000 FCFA.",
        }),
    date_fin_echeance: z.string().optional(),
    date_effet: z.string().min(1, 'La date d\'effet est requise'),
    nom: z.string().min(1, 'Le nom est requis'),
    prenom: z.string().min(1, 'Le prénom est requis'),
    adresse: z.string().optional(),
    ville: z.string().optional(),
    telephone: z.string().optional(),
    email: z.string().email('Email invalide').optional().or(z.literal('')),
    beneficiaire_prevoyance_nom: z.string().optional(),
    beneficiaire_prevoyance_prenom: z.string().optional(),
    beneficiaire_prevoyance_telephone: z.string().optional(),
    prime_unique: z.number().optional(),
    taux_pret: z.number().optional(),
    montant_prevoyance_forfaitaire: z.number().optional(),
})

type FormValues = z.infer<typeof schema>

export const AgrProContractCreate = () => {
    const navigate = useNavigate()
    const createMutation = useCreateAgrProContract()

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        mode: 'onChange', // Enable validation on change to update isValid state
        defaultValues: {
            ville: 'Libreville',
            prime_unique: 5000, // Default active
            taux_pret: 3,     // Default active
            montant_prevoyance_forfaitaire: 250000,
        },
    })

    const { isValid } = form.formState

    const onSubmit = async (data: FormValues) => {
        try {
            const payload: AgrProContratCreatePayload = {
                ...data,
                emf_id: 8,
                duree_pret: data.duree_pret ? Number(data.duree_pret) : 0,
                montant_pret_assure: Number(data.montant_pret_assure),
                // Ensure strings are strings or undefined
                numero_police: data.numero_police || undefined,
                date_fin_echeance: data.date_fin_echeance || undefined,
                date_effet: data.date_effet,
                adresse: data.adresse || undefined,
                ville: data.ville || undefined,
                telephone: data.telephone || undefined,
                email: data.email || undefined,
                beneficiaire_prevoyance_nom: data.beneficiaire_prevoyance_nom || undefined,
                beneficiaire_prevoyance_prenom: data.beneficiaire_prevoyance_prenom || undefined,
                beneficiaire_prevoyance_telephone: data.beneficiaire_prevoyance_telephone || undefined,
                prime_unique: 5000, // Force values
                taux_pret: 3,
                montant_prevoyance_forfaitaire: 250000,
            }

            console.log('Soumission Contrat AGR PRO:', payload)
            await createMutation.mutateAsync(payload)
            toast.success('Contrat AGR PRO créé avec succès')
            navigate('/contrats/agrpro')
        } catch (error) {
            console.error(error)
            toast.error("Erreur lors de la création du contrat")
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8 overflow-y-auto">
            <div className="mb-4 flex justify-between w-[210mm] px-4 mx-auto print:hidden">
                <Button variant="outline" onClick={() => navigate(-1)}>
                    Annuler
                </Button>
                <h1 className="text-lg font-bold text-gray-700">Nouveau Contrat AGR PRO</h1>
                <Button
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={!isValid || createMutation.isPending}
                    className="bg-[#F48232] hover:bg-[#d66e25] text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save className="w-4 h-4 mr-2" />
                    {createMutation.isPending ? 'Création...' : 'Enregistrer le contrat'}
                </Button>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)}>
                <AgrProContractFormLayout form={form} />
            </form>
        </div>
    )
}
