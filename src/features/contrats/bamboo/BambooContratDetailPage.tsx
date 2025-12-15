import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useBambooContract } from '@/hooks/useBambooContracts'
import { formatCurrency, formatDate } from '@/lib/utils'
import { BambooContratPrint } from './BambooContratPrint'
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
  Briefcase,
  Clock,
  Eye,
  EyeOff,
  AlertTriangle,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Calendar,
  FileText,
} from 'lucide-react'

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
        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
          <Icon size={20} className="text-gray-600" />
        </div>
        <h3 className="font-bold text-gray-700">{title}</h3>
      </div>
      <MoreHorizontal size={20} className="text-gray-300 cursor-pointer hover:text-gray-500" />
    </div>
    {children}
  </div>
)

// Badge de statut style Finve
const StatusBadge = ({ statut }: { statut: string }) => {
  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    actif: { bg: 'bg-green-50', text: 'text-green-600', label: 'ACTIF' },
    en_attente: { bg: 'bg-amber-50', text: 'text-amber-600', label: 'EN ATTENTE' },
    suspendu: { bg: 'bg-yellow-50', text: 'text-yellow-600', label: 'SUSPENDU' },
    resilie: { bg: 'bg-red-50', text: 'text-red-500', label: 'RÉSILIÉ' },
    termine: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'TERMINÉ' },
    expire: { bg: 'bg-red-50', text: 'text-red-500', label: 'EXPIRÉ' },
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

// Badge de garantie
const GarantieBadge = ({ active, label }: { active: boolean; label: string }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
    <span className="text-sm text-gray-700">{label}</span>
    <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
      active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'
    }`}>
      {active ? <CheckCircle size={12} /> : <XCircle size={12} />}
      {active ? 'Oui' : 'Non'}
    </span>
  </div>
)

export const BambooContratDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: contrat, isLoading, isError } = useBambooContract(Number(id))
  const [showContratOfficiel, setShowContratOfficiel] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isError) {
      alert('Erreur lors du chargement du contrat')
      navigate('/contrats/bamboo')
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
          <title>Contrat BAMBOO #${contrat?.id} - ${contrat?.nom_prenom}</title>
          ${styles}
          <style>
            @page { size: A4; margin: 0; }
            @media print {
              body { 
                margin: 0; padding: 0;
                -webkit-print-color-adjust: exact !important; 
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
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
        <LoadingSpinner size="lg" text="Chargement du contrat BAMBOO..." />
      </div>
    )
  }

  const getCategorieLabel = (categorie?: string | null, precision?: string | null) => {
    const labels: Record<string, string> = {
      commercants: '🛒 Commerçants',
      salaries_public: '🏛️ Salariés du Public',
      salaries_prive: '🏢 Salariés du Privé',
      retraites: '👴 Retraités',
      autre: `📋 ${precision || 'Autre'}`,
    }
    return labels[categorie || ''] || categorie || 'Non définie'
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-8">
      {/* Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/contrats/bamboo')}
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
              {contrat.nom_prenom} • BAMBOO EMF
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowContratOfficiel(!showContratOfficiel)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${
              showContratOfficiel 
                ? 'bg-gray-600 text-white hover:bg-gray-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
            onClick={() => navigate(`/sinistres/nouveau/bamboo?contrat_id=${contrat.id}&contrat_type=ContratBambooEmf`)}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-500 text-white hover:bg-rose-600 rounded-xl font-bold text-sm shadow-lg shadow-rose-500/20 transition-colors"
          >
            <AlertTriangle size={16} />
            Déclarer sinistre
          </button>
        </div>
      </header>

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
              className="flex items-center gap-2 px-4 py-2 bg-samba-green text-white hover:bg-green-700 rounded-xl font-bold text-sm transition-colors"
            >
              <Printer size={16} />
              Imprimer
            </button>
          </div>
          <div ref={printRef} className="overflow-auto max-h-[800px] rounded-xl border border-gray-200">
            <BambooContratPrint contrat={contrat} />
          </div>
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Row 1: Montant Principal & Statut */}
        <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50 flex flex-col justify-between min-h-[280px]">
          <div className="flex justify-between items-start">
            <span className="font-bold text-gray-700">Montant Assuré</span>
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
            <InfoRow label="Durée" value={`${contrat.duree_pret_mois} mois`} />
          </div>
        </div>

        {/* Assuré Principal */}
        <InfoCard title="Assuré Principal" icon={User} className="col-span-12 lg:col-span-4">
          <div className="space-y-1">
            <div className="text-xl font-bold text-gray-900 mb-4">{contrat.nom_prenom}</div>
            
            <div className="bg-gray-50 rounded-xl p-3 mb-4">
              <div className="text-xs text-gray-500 mb-1">Catégorie</div>
              <div className="font-bold text-gray-900">
                {getCategorieLabel(contrat.categorie, contrat.autre_categorie_precision)}
              </div>
            </div>

            {contrat.telephone_assure && (
              <div className="flex items-center gap-3 py-2">
                <Phone size={16} className="text-gray-400" />
                <span className="text-gray-700">{contrat.telephone_assure}</span>
              </div>
            )}
            {contrat.email_assure && (
              <div className="flex items-center gap-3 py-2">
                <Mail size={16} className="text-gray-400" />
                <span className="text-gray-700">{contrat.email_assure}</span>
              </div>
            )}
            {(contrat.ville_assure || contrat.adresse_assure) && (
              <div className="flex items-center gap-3 py-2">
                <MapPin size={16} className="text-gray-400" />
                <span className="text-gray-700">
                  {contrat.ville_assure}{contrat.ville_assure && contrat.adresse_assure ? ', ' : ''}{contrat.adresse_assure}
                </span>
              </div>
            )}
            {contrat.profession && (
              <div className="flex items-center gap-3 py-2">
                <Briefcase size={16} className="text-gray-400" />
                <span className="text-gray-700">{contrat.profession}</span>
              </div>
            )}
          </div>
        </InfoCard>

        {/* Garanties */}
        <InfoCard title="Garanties" icon={Shield} className="col-span-12 lg:col-span-4">
          <div className="space-y-1">
            <GarantieBadge active={!!contrat.garantie_prevoyance_deces_iad} label="Prévoyance Décès-IAD" />
            <GarantieBadge active={!!contrat.garantie_deces_iad} label="Décès / IAD (1%)" />
            <GarantieBadge active={!!contrat.garantie_perte_emploi} label="Perte d'emploi (1.5%)" />
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Cotisation TTC</span>
              <span className="text-xl font-bold text-samba-green">
                {contrat.cotisation_totale_ttc 
                  ? formatCurrency(Number(contrat.cotisation_totale_ttc))
                  : 'N/A'}
              </span>
            </div>
          </div>
        </InfoCard>

        {/* Row 2: Dates & EMF */}
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
            <InfoRow label="Durée totale" value={`${contrat.duree_pret_mois} mois`} />
          </div>
        </InfoCard>

        <InfoCard title="EMF Souscripteur" icon={Building2} className="col-span-12 lg:col-span-6">
          <div className="space-y-2">
            <div className="text-lg font-bold text-gray-900 mb-2">
              {contrat.emf?.raison_sociale || 'BAMBOO EMF'}
            </div>
            <InfoRow label="Sigle" value={contrat.emf?.sigle || 'BAMBOO'} />
            {contrat.agence && <InfoRow label="Agence" value={contrat.agence} />}
          </div>
          
          <div className="mt-4 bg-gray-50 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-2">Limites BAMBOO EMF</div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Montant max:</span>
              <span className="font-bold text-gray-900">5 000 000 FCFA</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-600">Durée max:</span>
              <span className="font-bold text-gray-900">48 mois</span>
            </div>
          </div>
        </InfoCard>

        {/* Row 3: Bénéficiaire & Délais */}
        <InfoCard title="Bénéficiaire Prévoyance" icon={User} className="col-span-12 lg:col-span-6">
          <div className="text-xl font-bold text-gray-900 mb-4">
            {contrat.beneficiaire_prevoyance || 'Non renseigné'}
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-2">Garanties prévoyance BAMBOO</div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Prime forfaitaire:</span>
              <span className="font-bold text-gray-900">10 000 FCFA</span>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              En cas de décès ou d'invalidité absolue et définitive, le capital restant dû sera remboursé à l'EMF.
            </p>
          </div>
        </InfoCard>

        <InfoCard title="Délais Contractuels" icon={Clock} className="col-span-12 lg:col-span-6">
          <div className="grid grid-cols-4 gap-3">
            {[
              { value: '6', label: 'Mois délai maladie' },
              { value: '30', label: 'Jours décl. sinistre' },
              { value: '15', label: 'Jours décl. décès' },
              { value: '30', label: 'Jours versement' },
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
            onClick={() => navigate(`/contrats/bamboo/${contrat.id}/edit`)}
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
          <BambooContratPrint contrat={contrat} />
        </div>
      )}
    </div>
  )
}
