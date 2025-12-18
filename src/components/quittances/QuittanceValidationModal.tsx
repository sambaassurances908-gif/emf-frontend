// src/components/quittances/QuittanceValidationModal.tsx
import React, { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'
import { 
  CheckCircle, XCircle, AlertCircle, Eye, 
  Building2, Users, Printer
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { QuittanceData } from './QuittancePrint'

interface QuittanceValidationModalProps {
  isOpen: boolean
  onClose: () => void
  quittance: QuittanceData
  validationType: 'comptable' | 'fpdg'
  onValidate: (quittance: QuittanceData) => void
  onReject: (quittance: QuittanceData, motif: string) => void
  onPreview: (quittance: QuittanceData) => void
}

export const QuittanceValidationModal: React.FC<QuittanceValidationModalProps> = ({
  isOpen,
  onClose,
  quittance,
  validationType,
  onValidate,
  onReject,
  onPreview
}) => {
  const [motifRejet, setMotifRejet] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)
  
  const handleValidate = () => {
    const updatedQuittance: QuittanceData = {
      ...quittance,
      statut: validationType === 'comptable' ? 'en_attente_fpdg' : 'validee_fpdg',
      signatureComptable: validationType === 'comptable' ? true : quittance.signatureComptable,
      signatureFpdg: validationType === 'fpdg' ? true : quittance.signatureFpdg,
      dateValidationComptable: validationType === 'comptable' 
        ? new Date().toISOString() 
        : quittance.dateValidationComptable,
      dateValidationFpdg: validationType === 'fpdg' 
        ? new Date().toISOString() 
        : quittance.dateValidationFpdg
    }
    onValidate(updatedQuittance)
    onClose()
  }
  
  const handleReject = () => {
    if (!motifRejet.trim()) return
    
    const updatedQuittance: QuittanceData = {
      ...quittance,
      statut: 'rejetee',
      motifRejet: motifRejet.trim()
    }
    onReject(updatedQuittance, motifRejet)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Validation ${validationType === 'comptable' ? 'Comptable' : 'FPDG'} de la Quittance`}
      size="md"
    >
      <div className="space-y-4">
        {/* Informations de la quittance */}
        <div className="p-4 bg-gray-50 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {quittance.type === 'emf' ? (
                <Building2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <Users className="h-5 w-5 text-purple-600" />
              )}
              <span className="font-semibold text-gray-900">
                {quittance.reference}
              </span>
            </div>
            <Badge className={quittance.type === 'emf' 
              ? 'bg-emerald-100 text-emerald-700' 
              : 'bg-purple-100 text-purple-700'
            }>
              {quittance.type === 'emf' ? 'Remboursement EMF' : 'Prévoyance'}
            </Badge>
          </div>
          
          <div className="border-t pt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Sinistre:</span>
              <span className="ml-2 font-medium">{quittance.sinistre.numero_sinistre}</span>
            </div>
            <div>
              <span className="text-gray-500">Police:</span>
              <span className="ml-2 font-medium">{quittance.sinistre.numero_police || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-500">Bénéficiaire:</span>
              <span className="ml-2 font-medium">{quittance.beneficiaire}</span>
            </div>
            <div>
              <span className="text-gray-500">Date création:</span>
              <span className="ml-2 font-medium">{formatDate(quittance.dateCreation)}</span>
            </div>
          </div>
          
          {/* Montant */}
          <div className="border-t pt-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Montant à payer</span>
              <span className="text-2xl font-bold text-gray-900">
                {formatCurrency(quittance.montant)}
              </span>
            </div>
            <p className="text-sm text-gray-500 italic mt-1">
              {quittance.montantEnLettres}
            </p>
          </div>
          
          {/* Statut actuel */}
          {quittance.signatureComptable && (
            <div className="border-t pt-3 flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-green-700">
                Validée par le Comptable le {formatDate(quittance.dateValidationComptable || '')}
              </span>
            </div>
          )}
        </div>

        {/* Bouton prévisualisation */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onPreview(quittance)}
        >
          <Eye className="h-4 w-4 mr-2" />
          Prévisualiser la quittance
        </Button>

        {/* Actions de validation */}
        {!showRejectForm ? (
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                {validationType === 'comptable' ? (
                  <>
                    <strong>En tant que Comptable</strong>, vous allez valider cette quittance. 
                    Votre signature sera ajoutée et la quittance sera transmise au FPDG pour validation finale.
                  </>
                ) : (
                  <>
                    <strong>En tant que FPDG</strong>, vous allez donner la validation finale. 
                    Votre signature et cachet seront ajoutés et la quittance sera prête pour impression et paiement.
                  </>
                )}
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => setShowRejectForm(true)}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rejeter
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleValidate}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Valider & Signer
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <p className="text-sm text-red-800">
                En rejetant cette quittance, elle sera renvoyée à l'administrateur SAMBA 
                pour correction. Veuillez indiquer le motif du rejet.
              </p>
            </div>
            
            <Textarea
              label="Motif du rejet"
              placeholder="Expliquez la raison du rejet..."
              value={motifRejet}
              onChange={(e) => setMotifRejet(e.target.value)}
              rows={3}
              required
            />
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowRejectForm(false)
                  setMotifRejet('')
                }}
              >
                Annuler
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleReject}
                disabled={!motifRejet.trim()}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Confirmer le rejet
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

// Composant pour afficher la liste des quittances
interface QuittanceListItemProps {
  quittance: QuittanceData
  onValidate?: () => void
  onReject?: () => void
  onPreview?: () => void
  onPrint?: () => void
  userRole: 'admin_samba' | 'comptable' | 'fpdg'
}

export const QuittanceListItem: React.FC<QuittanceListItemProps> = ({
  quittance,
  onValidate,
  onReject: _onReject,
  onPreview,
  onPrint,
  userRole
}) => {
  const getStatusBadge = () => {
    switch (quittance.statut) {
      case 'brouillon':
        return <Badge className="bg-gray-100 text-gray-700">Brouillon</Badge>
      case 'en_attente_comptable':
        return <Badge className="bg-yellow-100 text-yellow-700">En attente Comptable</Badge>
      case 'validee_comptable':
      case 'en_attente_fpdg':
        return <Badge className="bg-blue-100 text-blue-700">En attente FPDG</Badge>
      case 'validee_fpdg':
        return <Badge className="bg-green-100 text-green-700">Validée</Badge>
      case 'rejetee':
        return <Badge className="bg-red-100 text-red-700">Rejetée</Badge>
      default:
        return null
    }
  }
  
  const canValidate = () => {
    if (userRole === 'comptable' && quittance.statut === 'en_attente_comptable') return true
    if (userRole === 'fpdg' && (quittance.statut === 'validee_comptable' || quittance.statut === 'en_attente_fpdg')) return true
    return false
  }
  
  const canPrint = quittance.statut === 'validee_fpdg'

  return (
    <div className="p-4 bg-white border rounded-xl hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            quittance.type === 'emf' ? 'bg-emerald-100' : 'bg-purple-100'
          }`}>
            {quittance.type === 'emf' ? (
              <Building2 className={`h-5 w-5 text-emerald-600`} />
            ) : (
              <Users className={`h-5 w-5 text-purple-600`} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{quittance.reference}</span>
              {getStatusBadge()}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {quittance.type === 'emf' ? 'Remboursement EMF' : 'Capital Prévoyance'} - {quittance.beneficiaire}
            </p>
            <p className="text-lg font-bold text-gray-900 mt-1">
              {formatCurrency(quittance.montant)}
            </p>
            
            {quittance.statut === 'rejetee' && quittance.motifRejet && (
              <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                <strong>Motif:</strong> {quittance.motifRejet}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {onPreview && (
            <Button size="sm" variant="ghost" onClick={onPreview}>
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {canValidate() && onValidate && (
            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={onValidate}>
              <CheckCircle className="h-4 w-4 mr-1" />
              Valider
            </Button>
          )}
          {canPrint && onPrint && (
            <Button size="sm" variant="outline" onClick={onPrint}>
              <Printer className="h-4 w-4 mr-1" />
              Imprimer
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuittanceValidationModal
