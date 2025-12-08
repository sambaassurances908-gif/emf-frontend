// src/features/contrats/sodec/SodecContratPrintPage.tsx
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Printer, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useSodecContract } from '@/hooks/useSodecContract'
import { SodecContratPrint } from '@/components/contrats/SodecContratPrint'
import { generateSodecContratPdf } from '@/lib/pdfGenerator'

export const SodecContratPrintPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: contrat, isLoading, isError } = useSodecContract(Number(id))

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPdf = () => {
    if (!contrat) return
    try {
      generateSodecContratPdf(contrat)
    } catch (error) {
      console.error('Erreur génération PDF:', error)
      alert('Erreur lors de la génération du PDF')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <LoadingSpinner size="lg" text="Chargement du contrat..." />
      </div>
    )
  }

  if (isError || !contrat) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <p className="text-red-600 mb-4">Erreur lors du chargement du contrat</p>
        <Button onClick={() => navigate('/contrats/sodec')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la liste
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-200">
      {/* Toolbar - Hidden on print */}
      <div className="print:hidden sticky top-0 z-50 bg-white shadow-md p-4">
        <div className="max-w-[210mm] mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(`/contrats/sodec/${id}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour au détail
          </Button>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Contrat #{contrat.id}</span>
            <span>-</span>
            <span>{contrat.nom_prenom}</span>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleDownloadPdf}
              className="flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Télécharger PDF
            </Button>
            <Button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-[#F48232] hover:bg-[#e0742a] text-white"
            >
              <Printer className="w-5 h-5" />
              Imprimer
            </Button>
          </div>
        </div>
      </div>

      {/* Print Preview */}
      <div className="py-8 print:py-0">
        <SodecContratPrint contrat={contrat} />
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}

export default SodecContratPrintPage
