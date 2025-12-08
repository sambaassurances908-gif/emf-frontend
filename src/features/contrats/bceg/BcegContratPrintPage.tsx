// src/features/contrats/bceg/BcegContratPrintPage.tsx
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Printer } from 'lucide-react'
import { useBcegContract } from '@/hooks/useBcegContracts'
import { BcegContratPrint } from './BcegContratPrint'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export const BcegContratPrintPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const { data: contrat, isLoading, error } = useBcegContract(id ? parseInt(id) : undefined)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !contrat) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-500">Erreur lors du chargement du contrat</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
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
        
        <div className="text-center">
          <h1 className="font-bold text-lg">Contrat BCEG - {contrat.numero_police}</h1>
          <p className="text-sm text-gray-600">
            {contrat.nom} {contrat.prenom}
          </p>
        </div>

        <Button onClick={() => window.print()} className="bg-[#F48232] hover:bg-orange-600">
          <Printer className="h-4 w-4 mr-2" />
          Imprimer
        </Button>
      </div>

      {/* Print Content */}
      <div className="shadow-xl print:shadow-none">
        <BcegContratPrint contrat={contrat} />
      </div>
    </div>
  )
}

export default BcegContratPrintPage
