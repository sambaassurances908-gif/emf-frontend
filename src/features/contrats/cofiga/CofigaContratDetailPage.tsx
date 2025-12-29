// src/features/contrats/cofiga/CofigaContratDetailPage.tsx
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useCofigaContract } from '@/hooks/useCofigaContracts'
import { formatCurrency, formatDate } from '@/lib/utils'
import { COFIGA_CONSTANTS } from '@/types/cofiga'
import {
  ArrowLeft,
  User,
  Shield,
  Phone,
  Mail,
  MapPin,
  Edit3,
  Trash2,
  Printer,
  Building2,
  Clock,
  AlertTriangle,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Calendar,
  FileText,
  DollarSign,
} from 'lucide-react'
import { Eye, EyeOff } from 'lucide-react'
import { CofigaContratPrint } from '@/components/contrats/CofigaContratPrint'

// Composant InfoCard style Finve
const InfoCard = ({ 
  title, 
  icon: Icon, 
  children,
  className = ''
}: { 
  title: string
  icon: React.ComponentType<{ className?: string; size?: number }>
  children: React.ReactNode
  className?: string
}) => (
  <div className={`bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50 ${className}`}>
    <div className="flex justify-between items-start mb-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
          <Icon size={20} className="text-violet-600" />
        </div>
        <h3 className="font-bold text-gray-700">{title}</h3>
      </div>
      <MoreHorizontal size={20} className="text-gray-300 cursor-pointer hover:text-gray-500" />
    </div>
    {children}
  </div>
)

// Badge de statut
const StatusBadge = ({ statut }: { statut: string }) => {
  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    actif: { bg: 'bg-green-50', text: 'text-green-600', label: 'ACTIF' },
    en_attente: { bg: 'bg-amber-50', text: 'text-amber-600', label: 'EN ATTENTE' },
    suspendu: { bg: 'bg-yellow-50', text: 'text-yellow-600', label: 'SUSPENDU' },
    resilie: { bg: 'bg-red-50', text: 'text-red-500', label: 'RÉSILIÉ' },
    termine: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'TERMINÉ' },
    sinistre: { bg: 'bg-orange-50', text: 'text-orange-600', label: 'SINISTRE' },
  }
  
  const config = statusConfig[statut] || statusConfig.actif
  
  return (
    <span className={`px-4 py-2 rounded-full text-sm font-bold ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  )
}

// Ligne d'information
const InfoRow = ({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) => (
  <div className="flex justify-between items-center py-2">
    <span className="text-gray-500 text-sm">{label}</span>
    <span className={`font-semibold text-gray-900 ${mono ? 'font-mono text-sm' : ''}`}>{value}</span>
  </div>
)

export const CofigaContratDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: contrat, isLoading, isError } = useCofigaContract(Number(id))
  const printRef = useRef<HTMLDivElement>(null)
  const [showContratOfficiel, setShowContratOfficiel] = useState(false)

  useEffect(() => {
    if (isError) {
      alert('Erreur lors du chargement du contrat')
      navigate('/contrats/cofiga')
    }
  }, [isError, navigate])

  const handlePrint = () => {
    const printContent = printRef.current
    if (!printContent) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Veuillez autoriser les popups pour imprimer')
      return
    }

    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(style => style.outerHTML)
      .join('\n')

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Contrat COFIGA #${contrat?.id} - ${contrat?.nom} ${contrat?.prenom}</title>
          ${styles}
          <style>
            @page { size: A4; margin: 0; }
            @media print {
              body { margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
            }
            body { margin: 0; padding: 0; background: white; }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `)
    printWindow.document.close()
    printWindow.onload = () => setTimeout(() => printWindow.print(), 300)
  }

  if (isLoading || !contrat) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-[#FAFAFA]">
        <LoadingSpinner size="lg" text="Chargement du contrat COFIGA..." />
      </div>
    )
  }

  // Calculer cotisations
  const cotisationVariable = Math.round(contrat.montant_pret_assure * (COFIGA_CONSTANTS.TAUX_GARANTIE / 100))
  const cotisationFixe = COFIGA_CONSTANTS.PRIME_UNIQUE
  const cotisationTotale = contrat.cotisation_totale || (cotisationVariable + cotisationFixe)

  const getCategorieLabel = (categorie?: string, autre?: string) => {
    const labels: Record<string, string> = {
      'Commerçants': '🛒 Commerçants',
      'Salariés du public': '🏛️ Salariés du public',
      'Salariés du privé': '🏢 Salariés du privé',
      'Autre': `📋 ${autre || 'Autre'}`,
    }
    return labels[categorie || ''] || categorie || 'Non définie'
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-8">
      {/* Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/contrats/cofiga')}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Contrat #{contrat.id}</h1>
              <StatusBadge statut={contrat.statut || 'actif'} />
            </div>
            <p className="text-sm text-gray-400 mt-1">
              {contrat.nom} {contrat.prenom} • COFIGA
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowContratOfficiel(!showContratOfficiel)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${
              showContratOfficiel ? 'bg-gray-600 text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {showContratOfficiel ? <EyeOff size={16} /> : <Eye size={16} />}
            {showContratOfficiel ? 'Masquer' : 'Aperçu'}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl font-bold text-sm transition-colors"
          >
            <Printer size={16} />
            Imprimer
          </button>
          <button
            onClick={() => navigate(`/sinistres/nouveau/cofiga?contrat_id=${contrat.id}&contrat_type=ContratCofiga`) }
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-500 text-white hover:bg-rose-600 rounded-xl font-bold text-sm shadow-lg shadow-rose-500/20 transition-colors"
          >
            <AlertTriangle size={16} />
            Déclarer sinistre
          </button>
        </div>
      </header>

      {/* Motif d'attente si présent */}
      {contrat.motif_attente && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8">
          <div className="flex items-center gap-2 text-amber-700">
            <AlertTriangle size={20} />
            <span className="font-bold">Motif d'attente:</span>
            <span>{contrat.motif_attente}</span>
          </div>
        </div>
      )}

      {/* Prévisualisation du contrat officiel */}
      {showContratOfficiel && (
        <div className="bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-700 flex items-center gap-2">
              <Eye size={18} className="text-gray-400" />
              Prévisualisation du contrat officiel
            </h2>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-[#F48232] text-white hover:bg-[#E07020] rounded-xl font-bold text-sm transition-colors"
            >
              <Printer size={16} />
              Imprimer
            </button>
          </div>
          <div ref={printRef} className="overflow-auto max-h-[800px] rounded-xl border border-gray-200">
            <CofigaContratPrint contrat={contrat} />
          </div>
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Row 1: Montant Principal & Statut */}
        <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50 flex flex-col justify-between min-h-[280px]">
          <div className="flex justify-between items-start">
            <span className="font-bold text-gray-700">Montant Prêt Assuré</span>
            <MoreHorizontal size={20} className="text-gray-300" />
          </div>
          
          <div>
            <div className="text-4xl font-extrabold text-gray-900 mb-4">
              {formatCurrency(contrat.montant_pret_assure)}
            </div>
            <StatusBadge statut={contrat.statut || 'actif'} />
          </div>

          <div className="space-y-2 pt-4 border-t border-gray-100">
            <InfoRow label="N° Police" value={contrat.numero_police || 'En attente'} mono />
            <InfoRow label="Date d'émission" value={formatDate(contrat.created_at)} />
            <InfoRow label="Durée" value={`${contrat.duree_pret} mois`} />
          </div>
        </div>

        {/* Assuré Principal */}
        <InfoCard title="Assuré Principal" icon={User} className="col-span-12 lg:col-span-4">
          <div className="space-y-1">
            <div className="text-xl font-bold text-gray-900 mb-4">{contrat.nom} {contrat.prenom}</div>
            
            <div className="bg-violet-50 rounded-xl p-3 mb-4">
              <div className="text-xs text-gray-500 mb-1">Catégorie</div>
              <div className="font-bold text-violet-700">
                {getCategorieLabel(contrat.categorie, contrat.categorie_autre)}
              </div>
            </div>

            {contrat.telephone && (
              <div className="flex items-center gap-3 py-2">
                <Phone size={16} className="text-gray-400" />
                <span className="text-gray-700">{contrat.telephone}</span>
              </div>
            )}
            {contrat.email && (
              <div className="flex items-center gap-3 py-2">
                <Mail size={16} className="text-gray-400" />
                <span className="text-gray-700">{contrat.email}</span>
              </div>
            )}
            {(contrat.ville || contrat.adresse) && (
              <div className="flex items-center gap-3 py-2">
                <MapPin size={16} className="text-gray-400" />
                <span className="text-gray-700">
                  {contrat.adresse}{contrat.adresse && contrat.ville ? ', ' : ''}{contrat.ville}
                </span>
              </div>
            )}
          </div>
        </InfoCard>

        {/* Cotisation */}
        <InfoCard title="Cotisation" icon={DollarSign} className="col-span-12 lg:col-span-4">
          <div className="space-y-3">
            <div className="bg-violet-50 rounded-xl p-4 text-center">
              <div className="text-xs text-gray-500 mb-1">Cotisation Totale</div>
              <div className="text-2xl font-bold text-violet-600">
                {formatCurrency(cotisationTotale)}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-[10px] text-gray-500">Variable ({COFIGA_CONSTANTS.TAUX_GARANTIE}%)</div>
                <div className="font-bold text-gray-800">{formatCurrency(cotisationVariable)}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-[10px] text-gray-500">Fixe</div>
                <div className="font-bold text-gray-800">{formatCurrency(cotisationFixe)}</div>
              </div>
            </div>
            
            <div className="bg-violet-50 rounded-xl p-3 text-center">
              <div className="text-[10px] text-gray-500">Protection forfaitaire décès</div>
              <div className="font-bold text-violet-600">{formatCurrency(COFIGA_CONSTANTS.PROTECTION_FORFAITAIRE)}</div>
            </div>
          </div>
        </InfoCard>

        {/* Row 2: Dates & Limites */}
        <InfoCard title="Périodes du Contrat" icon={Calendar} className="col-span-12 lg:col-span-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-xs text-gray-500 mb-1">Date d'effet</div>
              <div className="font-bold text-gray-900">{formatDate(contrat.date_effet)}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-xs text-gray-500 mb-1">Date fin échéance</div>
              <div className="font-bold text-gray-900">{formatDate(contrat.date_fin_echeance)}</div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <InfoRow label="Durée totale" value={`${contrat.duree_pret} mois`} />
          </div>
        </InfoCard>

        <InfoCard title="Limites COFIGA" icon={Shield} className="col-span-12 lg:col-span-6">
          <div className="space-y-3">
            <div className="bg-violet-50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-2">Limites de couverture COFIGA</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-lg font-bold text-violet-600">{formatCurrency(COFIGA_CONSTANTS.MONTANT_MAX_PRET)}</div>
                  <div className="text-[10px] text-gray-500">Montant max</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-violet-600">{COFIGA_CONSTANTS.DUREE_MAX_PRET} mois</div>
                  <div className="text-[10px] text-gray-500">Durée max</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-violet-600">{COFIGA_CONSTANTS.TAUX_GARANTIE}%</div>
                  <div className="text-[10px] text-gray-500">Taux</div>
                </div>
              </div>
            </div>
            
            {/* Indicateurs de conformité */}
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-500 text-sm">Montant conforme</span>
              <span className={`flex items-center gap-1 text-sm font-bold ${contrat.montant_pret_assure <= COFIGA_CONSTANTS.MONTANT_MAX_PRET ? 'text-green-600' : 'text-red-500'}`}>
                {contrat.montant_pret_assure <= COFIGA_CONSTANTS.MONTANT_MAX_PRET ? <CheckCircle size={14} /> : <XCircle size={14} />}
                {contrat.montant_pret_assure <= COFIGA_CONSTANTS.MONTANT_MAX_PRET ? 'Oui' : 'Non'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-500 text-sm">Durée conforme</span>
              <span className={`flex items-center gap-1 text-sm font-bold ${contrat.duree_pret <= COFIGA_CONSTANTS.DUREE_MAX_PRET ? 'text-green-600' : 'text-red-500'}`}>
                {contrat.duree_pret <= COFIGA_CONSTANTS.DUREE_MAX_PRET ? <CheckCircle size={14} /> : <XCircle size={14} />}
                {contrat.duree_pret <= COFIGA_CONSTANTS.DUREE_MAX_PRET ? 'Oui' : 'Non'}
              </span>
            </div>
          </div>
        </InfoCard>

        {/* Souscripteur EMF */}
        {contrat.souscripteur_raison_sociale && (
          <InfoCard title="Souscripteur EMF" icon={Building2} className="col-span-12 lg:col-span-6">
            <div className="space-y-2">
              <div className="text-lg font-bold text-gray-900 mb-2">
                {contrat.souscripteur_raison_sociale}
              </div>
              {contrat.souscripteur_rccm && <InfoRow label="RCCM" value={contrat.souscripteur_rccm} mono />}
              {contrat.souscripteur_nif && <InfoRow label="NIF" value={contrat.souscripteur_nif} mono />}
              {contrat.souscripteur_ville && <InfoRow label="Ville" value={contrat.souscripteur_ville} />}
              {contrat.souscripteur_telephone && (
                <div className="flex items-center gap-3 py-2">
                  <Phone size={16} className="text-gray-400" />
                  <span className="text-gray-700">{contrat.souscripteur_telephone}</span>
                </div>
              )}
            </div>
          </InfoCard>
        )}

        {/* Bénéficiaire */}
        {(contrat.beneficiaire_nom || contrat.beneficiaire_prenom) && (
          <InfoCard title="Bénéficiaire" icon={User} className="col-span-12 lg:col-span-6">
            <div className="text-xl font-bold text-gray-900 mb-4">
              {contrat.beneficiaire_nom} {contrat.beneficiaire_prenom}
            </div>
            {contrat.beneficiaire_telephone && (
              <div className="flex items-center gap-3 py-2">
                <Phone size={16} className="text-gray-400" />
                <span className="text-gray-700">{contrat.beneficiaire_telephone}</span>
              </div>
            )}
          </InfoCard>
        )}

        {/* Délais */}
        <InfoCard title="Délais Contractuels" icon={Clock} className="col-span-12 lg:col-span-6">
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: '3', label: 'Mois délai maladie' },
              { value: '30', label: 'Jours décl. sinistre' },
              { value: '15', label: 'Jours décl. décès' },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 p-3 rounded-xl text-center">
                <div className="text-2xl font-bold text-gray-900">{item.value}</div>
                <div className="text-[10px] text-gray-500 mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </InfoCard>

        {/* Observations */}
        {contrat.observations && (
          <div className="col-span-12 bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <FileText size={20} className="text-gray-600" />
              </div>
              <h3 className="font-bold text-gray-700">Observations</h3>
            </div>
            <p className="text-gray-700">{contrat.observations}</p>
          </div>
        )}

        {/* Actions */}
        <div className="col-span-12 flex flex-col sm:flex-row justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(`/contrats/cofiga/${contrat.id}/edit`)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-200 hover:bg-gray-50 font-bold"
          >
            <Edit3 size={18} />
            Modifier le contrat
          </Button>
          <Button
            onClick={() => alert('Fonction suppression du contrat à implémenter')}
            className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-500/20"
          >
            <Trash2 size={18} />
            Supprimer / Archiver
          </Button>
        </div>
      </div>
      {/* Container caché pour l'impression */}
      {!showContratOfficiel && (
        <div ref={printRef} className="hidden">
          <CofigaContratPrint contrat={contrat} />
        </div>
      )}
    </div>
  )
}

export default CofigaContratDetailPage
