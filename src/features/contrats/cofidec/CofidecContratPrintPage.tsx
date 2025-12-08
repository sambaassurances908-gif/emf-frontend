// src/features/contrats/cofidec/CofidecContratPrintPage.tsx
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Printer } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useCofidecContractDetail } from '@/hooks/useCofidecContracts'
import { CofidecContratPrint } from './CofidecContratPrint'

export const CofidecContratPrintPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: contrat, isLoading, error } = useCofidecContractDetail(Number(id))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !contrat) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">Erreur lors du chargement du contrat</p>
        <Button onClick={() => navigate(-1)}>Retour</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-200 py-4 flex flex-col items-center">
      {/* Toolbar - Hidden when printing */}
      <div className="w-[210mm] mb-4 flex justify-between items-center bg-white p-3 rounded-lg shadow print:hidden">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        
        <div className="text-sm font-medium text-gray-600">
          Contrat COFIDEC #{contrat.id} - {contrat.reference || 'Sans référence'}
        </div>

        <Button onClick={() => window.print()} className="bg-[#F48232] hover:bg-orange-600">
          <Printer className="h-4 w-4 mr-2" />
          Imprimer
        </Button>
      </div>

      {/* Printable Contract */}
      <CofidecContratPrint contrat={contrat} />
    </div>
  )
}
