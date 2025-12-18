// src/components/quittances/QuittanceGenerationModal.tsx
import React, { useState, useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { 
  FileText, Building2, Users, CheckCircle, 
  AlertCircle, Info, Loader2
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { sinistreService } from '@/services/sinistre.service'
import type { Sinistre } from '@/types/sinistre.types'
import type { QuittanceData } from './QuittancePrint'
import toast from 'react-hot-toast'

// Fonction pour convertir un nombre en lettres
function nombreEnLettres(nombre: number): string {
  const unites = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf']
  const dizaines = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix']
  const exceptions = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize']
  
  if (nombre === 0) return 'zéro'
  if (nombre < 0) return 'moins ' + nombreEnLettres(-nombre)
  
  let result = ''
  
  // Millions
  if (nombre >= 1000000) {
    const millions = Math.floor(nombre / 1000000)
    result += millions === 1 ? 'un million ' : nombreEnLettres(millions) + ' millions '
    nombre %= 1000000
  }
  
  // Milliers
  if (nombre >= 1000) {
    const milliers = Math.floor(nombre / 1000)
    result += milliers === 1 ? 'mille ' : nombreEnLettres(milliers) + ' mille '
    nombre %= 1000
  }
  
  // Centaines
  if (nombre >= 100) {
    const centaines = Math.floor(nombre / 100)
    result += centaines === 1 ? 'cent ' : unites[centaines] + ' cent '
    nombre %= 100
  }
  
  // Dizaines et unités
  if (nombre > 0) {
    if (nombre < 10) {
      result += unites[nombre]
    } else if (nombre < 17) {
      result += exceptions[nombre - 10]
    } else if (nombre < 20) {
      result += 'dix-' + unites[nombre - 10]
    } else {
      const dizaine = Math.floor(nombre / 10)
      const unite = nombre % 10
      
      if (dizaine === 7 || dizaine === 9) {
        if (unite === 1) {
          result += dizaines[dizaine - 1] + ' et ' + exceptions[unite]
        } else {
          result += dizaines[dizaine - 1] + '-' + exceptions[unite]
        }
      } else {
        if (unite === 0) {
          result += dizaines[dizaine]
        } else if (unite === 1 && dizaine !== 8) {
          result += dizaines[dizaine] + ' et un'
        } else {
          result += dizaines[dizaine] + '-' + unites[unite]
        }
      }
    }
  }
  
  return result.trim()
}

function formatMontantEnLettres(montant: number): string {
  const lettres = nombreEnLettres(montant)
  // Capitalize first letter
  return lettres.charAt(0).toUpperCase() + lettres.slice(1) + ' francs CFA'
}

interface QuittanceGenerationModalProps {
  isOpen: boolean
  onClose: () => void
  sinistre: Sinistre
  onGenerate: (quittances: QuittanceData[]) => void
}

export const QuittanceGenerationModal: React.FC<QuittanceGenerationModalProps> = ({
  isOpen,
  onClose,
  sinistre,
  onGenerate
}) => {
  const queryClient = useQueryClient()
  const contrat = sinistre.contrat
  
  // Vérifier si des quittances existent déjà pour ce sinistre
  const quittancesExistantes = sinistre.quittances || []
  const quittancesNonAnnulees = quittancesExistantes.filter(q => q.statut !== 'annulee')
  const hasQuittancesActives = quittancesNonAnnulees.length > 0
  
  // États pour la quittance EMF (remboursement prêt)
  const [montantEmf, setMontantEmf] = useState<string>(
    sinistre.capital_restant_du?.toString() || ''
  )
  const [beneficiaireEmf, setBeneficiaireEmf] = useState<string>(() => {
    // Déterminer l'EMF automatiquement
    switch (sinistre.contrat_type) {
      case 'ContratSodec': return 'SODEC (Société d\'Epargne et de Crédit)'
      case 'ContratBambooEmf': return 'BAMBOO'
      case 'ContratCofidec': return 'COFIDEC'
      case 'ContratBceg': return 'BCEG'
      case 'ContratEdg': return 'EDG'
      default: return contrat?.emf?.nom || ''
    }
  })
  
  // États pour la quittance Prévoyance
  const [genererPrevoyance, setGenererPrevoyance] = useState<boolean>(
    !!(contrat?.garantie_prevoyance || contrat?.avec_prevoyance)
  )
  const [optionPrevoyance, setOptionPrevoyance] = useState<'A' | 'B'>(
    contrat?.option_prevoyance || 'B'
  )
  const [typeBeneficiairePrevoyance, setTypeBeneficiairePrevoyance] = useState<'adulte' | 'enfant'>('adulte')
  const [beneficiairePrevoyance, setBeneficiairePrevoyance] = useState<string>('')
  const [montantPrevoyanceCustom, setMontantPrevoyanceCustom] = useState<string>('')
  
  // Calcul du montant prévoyance selon l'option et le type
  const montantPrevoyanceCalcule = useMemo(() => {
    if (optionPrevoyance === 'A') {
      return typeBeneficiairePrevoyance === 'adulte' ? 500000 : 250000
    } else {
      return typeBeneficiairePrevoyance === 'adulte' ? 250000 : 125000
    }
  }, [optionPrevoyance, typeBeneficiairePrevoyance])
  
  const montantPrevoyanceFinal = montantPrevoyanceCustom 
    ? parseFloat(montantPrevoyanceCustom) 
    : montantPrevoyanceCalcule
  
  // Vérifier si le contrat a une garantie prévoyance
  const aPrevoyance = !!(contrat?.garantie_prevoyance || contrat?.avec_prevoyance)
  
  // Fonction helper pour créer les quittances une par une
  const creerQuittancesUneParUne = async (quittancesData: Array<{ type: string; beneficiaire: string; montant: number; description?: string }>) => {
    console.log('📝 Création des quittances une par une...')
    const results: any[] = []
    let montantTotal = 0
    for (const q of quittancesData) {
      console.log('➡️ Création quittance:', q)
      const result = await sinistreService.creerQuittance(sinistre.id, q)
      results.push(result.data)
      montantTotal += q.montant
    }
    return { 
      success: true, 
      message: `${results.length} quittance(s) créée(s) avec succès`, 
      data: { quittances: results, montant_total: montantTotal }
    }
  }

  // Mutation pour envoyer les quittances au backend
  const genererQuittancesMutation = useMutation({
    mutationFn: async (quittancesData: Array<{ type: string; beneficiaire: string; montant: number; description?: string }>) => {
      console.log('🚀 Tentative de génération de quittances:', quittancesData)
      
      // Essayer d'abord l'endpoint batch
      try {
        const response = await sinistreService.genererQuittances(sinistre.id, quittancesData)
        console.log('✅ Endpoint batch réussi:', response)
        return response
      } catch (error: any) {
        console.warn('⚠️ Endpoint batch échoué:', error.response?.status, error.response?.data)
        console.warn('📋 Détails erreurs validation:', JSON.stringify(error.response?.data?.errors, null, 2))
        
        // Si l'endpoint batch échoue (404, 422, 500), créer une par une
        if ([404, 422, 500].includes(error.response?.status)) {
          console.log('🔄 Fallback vers création individuelle...')
          return await creerQuittancesUneParUne(quittancesData)
        }
        throw error
      }
    },
    onSuccess: (response) => {
      const quittancesCreees = response.data.quittances || []
      toast.success(response.message || `${quittancesCreees.length} quittance(s) générée(s) avec succès`)
      queryClient.invalidateQueries({ queryKey: ['sinistre', sinistre.id.toString()] })
      queryClient.invalidateQueries({ queryKey: ['sinistre-traitement', sinistre.id.toString()] })
      queryClient.invalidateQueries({ queryKey: ['comptable'] })
      queryClient.invalidateQueries({ queryKey: ['fpdg-all-quittances'] })
      
      // Créer les objets QuittanceData pour le callback local
      const quittancesLocales: QuittanceData[] = quittancesCreees.map((q: any) => ({
        reference: q.reference,
        type: q.type === 'capital_sans_interets' ? 'emf' : 'prevoyance',
        sinistre,
        montant: q.montant,
        montantEnLettres: formatMontantEnLettres(q.montant),
        beneficiaire: q.beneficiaire,
        statut: q.statut || 'en_attente',
        dateCreation: q.created_at
      }))
      
      onGenerate(quittancesLocales)
      onClose()
    },
    onError: (error: any) => {
      console.error('Erreur génération quittances:', error)
      const errorMessage = error.response?.data?.message || error.response?.data?.error?.message || 'Erreur lors de la génération des quittances'
      toast.error(errorMessage)
    }
  })
  
  const handleGenerate = () => {
    const quittancesBackend: Array<{ type: string; beneficiaire: string; montant: number }> = []
    
    // Quittance EMF (toujours générée)
    if (montantEmf && parseFloat(montantEmf) > 0) {
      quittancesBackend.push({
        type: 'capital_sans_interets', // Type backend
        beneficiaire: beneficiaireEmf,
        montant: parseFloat(montantEmf)
      })
    }
    
    // Quittance Prévoyance (si activée)
    if (genererPrevoyance && montantPrevoyanceFinal > 0 && beneficiairePrevoyance) {
      quittancesBackend.push({
        type: 'capital_prevoyance', // Type backend
        beneficiaire: beneficiairePrevoyance,
        montant: montantPrevoyanceFinal
      })
    }
    
    if (quittancesBackend.length > 0) {
      genererQuittancesMutation.mutate(quittancesBackend)
    }
  }
  
  // Validation: formulaire valide ET pas de quittances actives existantes
  const isValid = !hasQuittancesActives && (
    (montantEmf && parseFloat(montantEmf) > 0 && beneficiaireEmf) ||
    (genererPrevoyance && montantPrevoyanceFinal > 0 && beneficiairePrevoyance)
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Génération des Quittances de Règlement"
      size="lg"
    >
      <div className="space-y-6">
        {/* ALERTE: Quittances existantes */}
        {hasQuittancesActives && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-red-900">
                  ⚠️ Des quittances existent déjà pour ce sinistre !
                </p>
                <p className="text-xs text-red-700 mt-1">
                  {quittancesNonAnnulees.length} quittance(s) active(s) trouvée(s). 
                  La régénération créerait des doublons.
                </p>
                <div className="mt-2 space-y-1">
                  {quittancesNonAnnulees.map((q: any) => (
                    <div key={q.id || q.reference} className="text-xs bg-red-100 px-2 py-1 rounded flex justify-between">
                      <span className="font-mono">{q.reference}</span>
                      <span>{formatCurrency(q.montant)}</span>
                      <span className="capitalize">{q.statut}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-red-600 mt-2 italic">
                  Si vous devez modifier les quittances, veuillez d'abord annuler les quittances existantes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info sinistre */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                Sinistre {sinistre.numero_sinistre}
              </p>
              <div className="mt-1 grid grid-cols-2 gap-2 text-xs text-blue-800">
                <div>Police: {sinistre.numero_police || contrat?.numero_police || 'N/A'}</div>
                <div>Assuré: {sinistre.nom_assure || contrat?.nom_prenom || 'N/A'}</div>
                <div>Type: {sinistre.type_sinistre}</div>
                <div>Capital RD: {formatCurrency(sinistre.capital_restant_du)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Quittance EMF (Remboursement prêt) */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-emerald-50 border-b border-emerald-200 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-emerald-600" />
            <h3 className="font-semibold text-emerald-900">
              Quittance EMF - Remboursement du Prêt
            </h3>
            <Badge className="bg-emerald-100 text-emerald-700 ml-auto">Obligatoire</Badge>
          </div>
          <div className="p-4 space-y-4">
            <Input
              label="Montant du capital restant dû (sans intérêts)"
              type="number"
              value={montantEmf}
              onChange={(e) => setMontantEmf(e.target.value)}
              placeholder="Ex: 1500000"
              min={0}
            />
            {montantEmf && parseFloat(montantEmf) > 0 && (
              <p className="text-sm text-gray-600 italic">
                Soit: {formatMontantEnLettres(parseFloat(montantEmf))}
              </p>
            )}
            <Input
              label="Bénéficiaire (EMF)"
              value={beneficiaireEmf}
              onChange={(e) => setBeneficiaireEmf(e.target.value)}
              placeholder="Nom de l'établissement EMF"
            />
          </div>
        </div>

        {/* Section 2: Quittance Prévoyance (optionnelle) */}
        <div className={`border rounded-xl overflow-hidden ${
          aPrevoyance ? 'border-purple-200' : 'border-gray-200 opacity-60'
        }`}>
          <div className="px-4 py-3 bg-purple-50 border-b border-purple-200 flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-purple-900">
              Quittance Prévoyance - Capital Forfaitaire
            </h3>
            {aPrevoyance ? (
              <Badge className="bg-purple-100 text-purple-700 ml-auto">Optionnel</Badge>
            ) : (
              <Badge className="bg-gray-100 text-gray-500 ml-auto">Non applicable</Badge>
            )}
          </div>
          
          {!aPrevoyance ? (
            <div className="p-4 text-center">
              <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                Ce contrat n'inclut pas de garantie prévoyance.
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* Toggle activation */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={genererPrevoyance}
                  onChange={(e) => setGenererPrevoyance(e.target.checked)}
                  className="w-5 h-5 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Générer une quittance prévoyance
                </span>
              </label>
              
              {genererPrevoyance && (
                <>
                  {/* Option sélection */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Option Prévoyance
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setOptionPrevoyance('A')}
                          className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                            optionPrevoyance === 'A'
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          Option A
                        </button>
                        <button
                          type="button"
                          onClick={() => setOptionPrevoyance('B')}
                          className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                            optionPrevoyance === 'B'
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          Option B
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type de bénéficiaire
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setTypeBeneficiairePrevoyance('adulte')}
                          className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                            typeBeneficiairePrevoyance === 'adulte'
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          Adulte
                        </button>
                        <button
                          type="button"
                          onClick={() => setTypeBeneficiairePrevoyance('enfant')}
                          className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                            typeBeneficiairePrevoyance === 'enfant'
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          Enfant
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Montant calculé */}
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-800">
                      <span className="font-medium">Montant forfaitaire calculé :</span>{' '}
                      <span className="text-lg font-bold">{formatCurrency(montantPrevoyanceCalcule)}</span>
                    </p>
                    <p className="text-xs text-purple-600 mt-1">
                      Option {optionPrevoyance} - {typeBeneficiairePrevoyance === 'adulte' ? 'Adulte' : 'Enfant'}
                      {optionPrevoyance === 'A' 
                        ? ' (500 000 FCFA/adulte, 250 000 FCFA/enfant)'
                        : ' (250 000 FCFA/adulte, 125 000 FCFA/enfant)'
                      }
                    </p>
                  </div>
                  
                  {/* Montant personnalisé (optionnel) */}
                  <Input
                    label="Montant personnalisé (optionnel)"
                    type="number"
                    value={montantPrevoyanceCustom}
                    onChange={(e) => setMontantPrevoyanceCustom(e.target.value)}
                    placeholder="Laisser vide pour utiliser le montant calculé"
                    min={0}
                  />
                  
                  {/* Bénéficiaire */}
                  <Input
                    label="Nom complet du bénéficiaire"
                    value={beneficiairePrevoyance}
                    onChange={(e) => setBeneficiairePrevoyance(e.target.value)}
                    placeholder="Ex: Monsieur Jean DUPONT"
                    required
                  />
                  
                  {montantPrevoyanceFinal > 0 && (
                    <p className="text-sm text-gray-600 italic">
                      Soit: {formatMontantEnLettres(montantPrevoyanceFinal)}
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Résumé */}
        {isValid && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Récapitulatif des quittances à générer
            </h4>
            <ul className="space-y-1 text-sm text-amber-800">
              {montantEmf && parseFloat(montantEmf) > 0 && (
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Quittance EMF: {formatCurrency(parseFloat(montantEmf))} → {beneficiaireEmf}</span>
                </li>
              )}
              {genererPrevoyance && montantPrevoyanceFinal > 0 && beneficiairePrevoyance && (
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Quittance Prévoyance: {formatCurrency(montantPrevoyanceFinal)} → {beneficiairePrevoyance}</span>
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={genererQuittancesMutation.isPending}>
            {hasQuittancesActives ? 'Fermer' : 'Annuler'}
          </Button>
          <Button 
            className={`flex-1 ${hasQuittancesActives ? 'bg-gray-400 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700'}`}
            onClick={handleGenerate}
            disabled={!isValid || genererQuittancesMutation.isPending}
          >
            {genererQuittancesMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Génération en cours...
              </>
            ) : hasQuittancesActives ? (
              <>
                <AlertCircle className="h-4 w-4 mr-2" />
                Quittances déjà générées
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Générer les quittances
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default QuittanceGenerationModal
