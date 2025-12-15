// src/components/ui/LimitesDepasseesModal.tsx
import React from 'react'
import { AlertTriangle, CheckCircle, X, FileText, Clock, ArrowRight } from 'lucide-react'
import { Button } from './Button'
import { formatCurrency } from '@/lib/utils'

// Types des limites par EMF
export interface LimitesEmf {
  bamboo: {
    montant_max: 50000000
    duree_max_mois: 48
  }
  bceg: {
    montant_max: 50000000
    duree_max_mois: 60
  }
  cofidec: {
    duree_max_mois: 24
    tranches: Array<{
      min: number
      max: number
      duree_max: number
    }>
  }
  edg: {
    vip: {
      montant_max: 65000000
      duree_max_mois: 36
    }
    standard: {
      montant_max: 25000000
      duree_max_mois: 60
    }
  }
  sodec: {
    retraites: {
      montant_max: 5000000
      duree_max_mois: 36
    }
    autres: {
      montant_max: 20000000
      duree_max_mois: 72
    }
  }
}

// Constantes des limites
export const LIMITES_EMF: LimitesEmf = {
  bamboo: {
    montant_max: 50000000,
    duree_max_mois: 48
  },
  bceg: {
    montant_max: 50000000,
    duree_max_mois: 60
  },
  cofidec: {
    duree_max_mois: 24,
    tranches: [
      { min: 0, max: 500000, duree_max: 6 },
      { min: 500001, max: 2000000, duree_max: 12 },
      { min: 2000001, max: 5000000, duree_max: 18 },
      { min: 5000001, max: 10000000, duree_max: 24 },
    ]
  },
  edg: {
    vip: {
      montant_max: 65000000,
      duree_max_mois: 36
    },
    standard: {
      montant_max: 25000000,
      duree_max_mois: 60
    }
  },
  sodec: {
    retraites: {
      montant_max: 5000000,
      duree_max_mois: 36
    },
    autres: {
      montant_max: 20000000,
      duree_max_mois: 72
    }
  }
}

export interface ContratCreationResponse {
  id: number
  numero_police?: string
  statut: 'actif' | 'en_attente' | 'expire' | 'resilie'
  limites_depassees?: boolean
  motif_attente?: string
  montant_pret_assure?: number
  duree_pret_mois?: number
  nom_prenom?: string
}

interface LimitesDepasseesModalProps {
  isOpen: boolean
  onClose: () => void
  onNavigate: () => void
  contrat: ContratCreationResponse | null
  emfType: 'bamboo' | 'bceg' | 'cofidec' | 'edg' | 'sodec'
}

export const LimitesDepasseesModal: React.FC<LimitesDepasseesModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  contrat,
  emfType
}) => {
  if (!isOpen || !contrat) return null

  const isEnAttente = contrat.statut === 'en_attente'
  const limitesDepassees = contrat.limites_depassees

  // Obtenir les limites pour cet EMF
  const getLimitesInfo = () => {
    switch (emfType) {
      case 'bamboo':
        return `Montant max: ${formatCurrency(LIMITES_EMF.bamboo.montant_max)} | Durée max: ${LIMITES_EMF.bamboo.duree_max_mois} mois`
      case 'bceg':
        return `Montant max: ${formatCurrency(LIMITES_EMF.bceg.montant_max)} | Durée max: ${LIMITES_EMF.bceg.duree_max_mois} mois`
      case 'cofidec':
        return `Durée max: ${LIMITES_EMF.cofidec.duree_max_mois} mois (selon tranches de montant)`
      case 'edg':
        return `VIP: ${formatCurrency(LIMITES_EMF.edg.vip.montant_max)}/${LIMITES_EMF.edg.vip.duree_max_mois} mois | Standard: ${formatCurrency(LIMITES_EMF.edg.standard.montant_max)}/${LIMITES_EMF.edg.standard.duree_max_mois} mois`
      case 'sodec':
        return `Retraités: ${formatCurrency(LIMITES_EMF.sodec.retraites.montant_max)}/${LIMITES_EMF.sodec.retraites.duree_max_mois} mois | Autres: ${formatCurrency(LIMITES_EMF.sodec.autres.montant_max)}/${LIMITES_EMF.sodec.autres.duree_max_mois} mois`
      default:
        return ''
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className={`px-6 py-4 ${isEnAttente ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isEnAttente ? (
                <div className="p-2 bg-white/20 rounded-full">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              ) : (
                <div className="p-2 bg-white/20 rounded-full">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-white">
                  {isEnAttente ? 'Contrat en attente' : 'Contrat créé avec succès'}
                </h2>
                <p className="text-white/80 text-sm">
                  N° Police: {contrat.numero_police || 'En cours de génération'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Statut Badge */}
          <div className="flex items-center justify-center">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              isEnAttente 
                ? 'bg-amber-100 text-amber-800 border-2 border-amber-300' 
                : 'bg-green-100 text-green-800 border-2 border-green-300'
            }`}>
              {isEnAttente ? '⏳ Statut: EN ATTENTE' : '✅ Statut: ACTIF'}
            </span>
          </div>

          {/* Infos contrat */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-gray-600">
              <FileText className="w-4 h-4" />
              <span className="font-medium">Informations du contrat</span>
            </div>
            {contrat.nom_prenom && (
              <p className="text-sm"><span className="text-gray-500">Assuré:</span> <span className="font-semibold">{contrat.nom_prenom}</span></p>
            )}
            {contrat.montant_pret_assure && (
              <p className="text-sm"><span className="text-gray-500">Montant:</span> <span className="font-semibold">{formatCurrency(contrat.montant_pret_assure)}</span></p>
            )}
            {contrat.duree_pret_mois && (
              <p className="text-sm"><span className="text-gray-500">Durée:</span> <span className="font-semibold">{contrat.duree_pret_mois} mois</span></p>
            )}
          </div>

          {/* Avertissement si limites dépassées */}
          {limitesDepassees && contrat.motif_attente && (
            <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-semibold text-amber-800">Limites dépassées</p>
                  <p className="text-sm text-amber-700">{contrat.motif_attente}</p>
                  <div className="mt-2 pt-2 border-t border-amber-200">
                    <p className="text-xs text-amber-600 font-medium">
                      Limites {emfType.toUpperCase()}: {getLimitesInfo()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Message si contrat actif */}
          {!isEnAttente && (
            <div className="bg-green-50 border-l-4 border-green-400 rounded-r-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-800">Contrat activé</p>
                  <p className="text-sm text-green-700">
                    Le contrat respecte toutes les conditions et est immédiatement actif.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Info supplémentaire pour contrat en attente */}
          {isEnAttente && (
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">💡 Prochaines étapes:</span> Ce contrat nécessite une validation manuelle par un gestionnaire avant d'être activé.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Fermer
          </Button>
          <Button
            onClick={onNavigate}
            className={`flex-1 ${isEnAttente ? 'bg-amber-500 hover:bg-amber-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
          >
            Voir le contrat
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default LimitesDepasseesModal
