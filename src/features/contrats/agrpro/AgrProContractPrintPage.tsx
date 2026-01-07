// src/features/contrats/agrpro/AgrProContractPrintPage.tsx
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Printer } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useAgrProContract } from '@/hooks/useAgrProContracts'
import { AgrProContractPrint } from './AgrProContractPrint'

export const AgrProContractPrintPage = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { data: contrat, isLoading, isError } = useAgrProContract(Number(id))

    const handlePrint = () => {
        window.print()
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    if (isError || !contrat) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 gap-4">
                <p className="text-red-500 font-bold">Erreur : Contrat introuvable</p>
                <Button variant="outline" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                </Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8 overflow-y-auto">
            {/* Header avec actions - caché à l'impression */}
            <div className="mb-4 flex justify-between items-center w-[210mm] px-4 mx-auto print:hidden">
                <Button variant="outline" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                </Button>
                <h1 className="text-lg font-bold text-gray-700">
                    Contrat AGR PRO - {contrat.numero_police || 'En attente'}
                </h1>
                <Button
                    onClick={handlePrint}
                    className="bg-[#F48232] hover:bg-[#d66e25] text-white font-bold"
                >
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimer
                </Button>
            </div>

            {/* Composant d'impression */}
            <AgrProContractPrint contrat={contrat} />
        </div>
    )
}

export default AgrProContractPrintPage
