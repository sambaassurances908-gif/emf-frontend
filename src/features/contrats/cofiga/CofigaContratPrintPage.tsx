// src/features/contrats/cofiga/CofigaContratPrintPage.tsx
import { useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useReactToPrint } from 'react-to-print'
import { ArrowLeft, Printer } from 'lucide-react'
import { CofigaContratPrint } from '@/components/contrats/CofigaContratPrint'
import { useCofigaContract } from '@/hooks/useCofigaContracts'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export const CofigaContratPrintPage = () => {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const printRef = useRef<HTMLDivElement>(null)
	const { data: contrat, isLoading, isError } = useCofigaContract(Number(id))

	const handlePrint = useReactToPrint({
		contentRef: printRef,
		documentTitle: `Contrat_COFIGA_${contrat?.numero_police || id}`,
	})

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen bg-gray-100">
				<LoadingSpinner size="lg" text="Chargement du contrat COFIGA..." />
			</div>
		)
	}

	if (isError || !contrat) {
		return (
			<div className="flex items-center justify-center h-screen bg-gray-100">
				<div className="text-center">
					<p className="text-red-500 mb-4">Erreur lors du chargement du contrat</p>
					<button
						onClick={() => navigate('/contrats/cofiga')}
						className="px-4 py-2 bg-violet-600 text-white rounded-lg"
					>
						Retour à la liste
					</button>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-100 py-4">
			<div className="max-w-[210mm] mx-auto mb-4 px-4 flex justify-between items-center print:hidden">
				<button
					onClick={() => navigate(`/contrats/cofiga/${id}`)}
					className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:bg-gray-50"
				>
					<ArrowLeft size={18} />
					Retour au détail
				</button>
				<div className="flex gap-2">
					<button
						onClick={() => handlePrint()}
						className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg shadow hover:bg-violet-700"
					>
						<Printer size={18} />
						Imprimer
					</button>
				</div>
			</div>

			<div ref={printRef} className="mx-auto">
				<CofigaContratPrint contrat={contrat} />
			</div>
		</div>
	)
}

export default CofigaContratPrintPage
