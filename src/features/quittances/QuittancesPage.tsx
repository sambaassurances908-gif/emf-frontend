// src/features/quittances/QuittancesPage.tsx
import React, { useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { 
  QuittancePrint, 
  QuittanceValidationModal,
  QuittanceListItem,
  type QuittanceData 
} from '@/components/quittances'
import { 
  FileText, Search, CheckCircle, 
  XCircle, Clock, Printer, Bell
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

// Simuler les données de quittances (à remplacer par l'API)
// TODO: Remplacer par un vrai service API
const mockQuittances: QuittanceData[] = []

export const QuittancesPage: React.FC = () => {
  const { user, isAdmin, peutPayerQuittance, peutCloturerSinistre } = useAuthStore()
  const queryClient = useQueryClient()
  
  // Déterminer le rôle de l'utilisateur
  const userRole = useMemo(() => {
    // FPDG = role fpdg dans le backend
    if (user?.role === 'fpdg') return 'fpdg'
    // Comptable = role comptable ou peut payer des quittances
    if (user?.role === 'comptable' || (peutPayerQuittance() && !peutCloturerSinistre())) return 'comptable'
    // Admin SAMBA
    if (isAdmin()) return 'admin_samba'
    return 'user'
  }, [user, isAdmin, peutPayerQuittance, peutCloturerSinistre])
  
  // États
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatut, setFilterStatut] = useState<string>('')
  const [filterType, setFilterType] = useState<string>('')
  const [selectedQuittance, setSelectedQuittance] = useState<QuittanceData | null>(null)
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewQuittance, setPreviewQuittance] = useState<QuittanceData | null>(null)
  
  // Récupérer les quittances
  // TODO: Implémenter le service API réel
  const { data: quittances = [], isLoading } = useQuery({
    queryKey: ['quittances', userRole],
    queryFn: async () => {
      // Simulation - à remplacer par l'API
      // const response = await quittanceService.getAll({ role: userRole })
      // return response.data
      return mockQuittances
    }
  })
  
  // Filtrer les quittances selon le rôle
  const filteredQuittances = useMemo(() => {
    let result = [...quittances]
    
    // Filtrer par rôle
    if (userRole === 'comptable') {
      result = result.filter(q => 
        q.statut === 'en_attente_comptable' || 
        q.statut === 'validee_comptable' ||
        q.statut === 'en_attente_fpdg' ||
        q.statut === 'validee_fpdg'
      )
    } else if (userRole === 'fpdg') {
      result = result.filter(q => 
        q.statut === 'en_attente_fpdg' || 
        q.statut === 'validee_comptable' ||
        q.statut === 'validee_fpdg'
      )
    }
    
    // Filtre recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(q =>
        q.reference.toLowerCase().includes(term) ||
        q.beneficiaire.toLowerCase().includes(term) ||
        q.sinistre.numero_sinistre.toLowerCase().includes(term)
      )
    }
    
    // Filtre statut
    if (filterStatut) {
      result = result.filter(q => q.statut === filterStatut)
    }
    
    // Filtre type
    if (filterType) {
      result = result.filter(q => q.type === filterType)
    }
    
    return result
  }, [quittances, searchTerm, filterStatut, filterType, userRole])
  
  // Stats
  const stats = useMemo(() => {
    const enAttente = quittances.filter(q => 
      (userRole === 'comptable' && q.statut === 'en_attente_comptable') ||
      (userRole === 'fpdg' && (q.statut === 'en_attente_fpdg' || q.statut === 'validee_comptable'))
    ).length
    
    const validees = quittances.filter(q => q.statut === 'validee_fpdg').length
    const rejetees = quittances.filter(q => q.statut === 'rejetee').length
    const total = quittances.length
    
    const montantEnAttente = quittances
      .filter(q => q.statut !== 'validee_fpdg' && q.statut !== 'rejetee')
      .reduce((sum, q) => sum + q.montant, 0)
    
    return { enAttente, validees, rejetees, total, montantEnAttente }
  }, [quittances, userRole])
  
  // Handlers
  const handleValidate = (quittance: QuittanceData) => {
    setSelectedQuittance(quittance)
    setShowValidationModal(true)
  }
  
  const handlePreview = (quittance: QuittanceData) => {
    setPreviewQuittance(quittance)
    setShowPreviewModal(true)
  }
  
  const handlePrint = (quittance: QuittanceData) => {
    setPreviewQuittance(quittance)
    setShowPreviewModal(true)
    // Déclencher l'impression après affichage
    setTimeout(() => {
      window.print()
    }, 500)
  }
  
  const onQuittanceValidated = (_updatedQuittance: QuittanceData) => {
    // TODO: Appeler l'API pour sauvegarder
    toast.success('Quittance validée avec succès')
    queryClient.invalidateQueries({ queryKey: ['quittances'] })
    setShowValidationModal(false)
    setSelectedQuittance(null)
  }
  
  const onQuittanceRejected = (_updatedQuittance: QuittanceData, _motif: string) => {
    // TODO: Appeler l'API pour sauvegarder
    toast.error('Quittance rejetée')
    queryClient.invalidateQueries({ queryKey: ['quittances'] })
    setShowValidationModal(false)
    setSelectedQuittance(null)
  }
  
  // Loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Chargement des quittances..." />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Gestion des Quittances
          </h1>
          <p className="text-gray-600 mt-1">
            {userRole === 'comptable' && 'Validez les quittances avant transmission au FPDG'}
            {userRole === 'fpdg' && 'Donnez la validation finale pour autoriser le paiement'}
            {userRole === 'admin_samba' && 'Suivez l\'état de vos quittances générées'}
          </p>
        </div>
        
        {/* Notification badge */}
        {stats.enAttente > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
            <Bell className="h-5 w-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">
              {stats.enAttente} quittance(s) en attente de validation
            </span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.enAttente}</p>
                <p className="text-xs text-gray-500">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.validees}</p>
                <p className="text-xs text-gray-500">Validées</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.rejetees}</p>
                <p className="text-xs text-gray-500">Rejetées</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(stats.montantEnAttente)}
                </p>
                <p className="text-xs text-gray-500">Montant en cours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par référence, bénéficiaire..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              options={[
                { value: '', label: 'Tous les statuts' },
                { value: 'en_attente_comptable', label: 'En attente Comptable' },
                { value: 'en_attente_fpdg', label: 'En attente FPDG' },
                { value: 'validee_fpdg', label: 'Validées' },
                { value: 'rejetee', label: 'Rejetées' },
              ]}
              className="w-full md:w-48"
            />
            
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              options={[
                { value: '', label: 'Tous les types' },
                { value: 'emf', label: 'Remboursement EMF' },
                { value: 'prevoyance', label: 'Prévoyance' },
              ]}
              className="w-full md:w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* Liste des quittances */}
      {filteredQuittances.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-12 w-12 text-gray-400" />}
          title="Aucune quittance"
          description={
            searchTerm || filterStatut || filterType
              ? "Aucune quittance ne correspond à vos critères de recherche."
              : "Il n'y a pas encore de quittance à traiter."
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredQuittances.map((quittance) => (
            <QuittanceListItem
              key={quittance.reference}
              quittance={quittance}
              userRole={userRole as 'admin_samba' | 'comptable' | 'fpdg'}
              onValidate={() => handleValidate(quittance)}
              onPreview={() => handlePreview(quittance)}
              onPrint={() => handlePrint(quittance)}
            />
          ))}
        </div>
      )}

      {/* Modal de validation */}
      {selectedQuittance && (
        <QuittanceValidationModal
          isOpen={showValidationModal}
          onClose={() => {
            setShowValidationModal(false)
            setSelectedQuittance(null)
          }}
          quittance={selectedQuittance}
          validationType={userRole === 'fpdg' ? 'fpdg' : 'comptable'}
          onValidate={onQuittanceValidated}
          onReject={onQuittanceRejected}
          onPreview={handlePreview}
        />
      )}

      {/* Modal de prévisualisation */}
      {showPreviewModal && previewQuittance && (
        <Modal
          isOpen={showPreviewModal}
          onClose={() => {
            setShowPreviewModal(false)
            setPreviewQuittance(null)
          }}
          title="Prévisualisation de la Quittance"
          size="xl"
        >
          <div className="overflow-auto max-h-[800px] rounded-xl border border-gray-200">
            <div>
              <QuittancePrint 
                quittance={previewQuittance} 
                showSignatures={true}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t print:hidden">
            <Button
              variant="outline"
              onClick={() => {
                setShowPreviewModal(false)
                setPreviewQuittance(null)
              }}
            >
              Fermer
            </Button>
            {previewQuittance.statut === 'validee_fpdg' && (
              <Button
                onClick={() => window.print()}
              >
                <Printer className="h-4 w-4 mr-2" />
                Imprimer
              </Button>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}

export default QuittancesPage
