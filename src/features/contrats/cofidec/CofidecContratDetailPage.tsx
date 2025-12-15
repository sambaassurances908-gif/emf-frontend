// src/features/contrats/cofidec/CofidecContratDetailPage.tsx
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useCofidecContract } from '@/hooks/useCofidecContracts'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CofidecContratPrint } from './CofidecContratPrint'
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
  Eye,
  EyeOff,
  Building2,
  AlertTriangle,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Calendar,
  FileText,
  Clock,
  Percent,
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
  
  const config = statusConfig[statut] || statusConfig.en_attente
  
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
const GarantieBadge = ({ active, label, amount }: { active: boolean; label: string; amount?: string }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
    <span className="text-sm text-gray-700">{label}</span>
    <div className="flex items-center gap-2">
      {active && amount && (
        <span className="text-sm font-bold text-samba-green">{amount}</span>
      )}
      <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
        active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'
      }`}>
        {active ? <CheckCircle size={12} /> : <XCircle size={12} />}
        {active ? 'Oui' : 'Non'}
      </span>
    </div>
  </div>
)

export const CofidecContratDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: contrat, isLoading, isError } = useCofidecContract(Number(id))
  const [showContratOfficiel, setShowContratOfficiel] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isError) {
      alert('Erreur lors du chargement du contrat')
      navigate('/contrats/cofidec')
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
          <title>Contrat COFIDEC #${contrat?.id} - ${contrat?.nom_prenom}</title>
          ${styles}
          <style>
            @page { size: A4; margin: 0; }
            @media print {
              body { 
                margin: 0; padding: 0;
                -webkit-print-color-adjust: exact !important; 
                print-color-adjust: exact !important;
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
        <LoadingSpinner size="lg" text="Chargement du contrat COFIDEC..." />
      </div>
    )
  }

  // Calcul des cotisations
  const montant = contrat.montant_pret || contrat.montant_pret_assure || 0
  const duree = contrat.duree_pret_mois || contrat.duree_mois || 0
  
  const getTaux = () => {
    const cat = contrat.categorie
    if (cat === 'salarie_cofidec') return 0.0075
    if (duree >= 1 && duree <= 6) return 0.005
    if (duree > 6 && duree <= 13) return 0.01
    if (duree > 13 && duree <= 24) return 0.0175
    return 0
  }
  
  const taux = getTaux()
  const cotisationDeces = contrat.cotisation_deces_iad || montant * taux
  const cotisationPrevoyance = contrat.cotisation_prevoyance || 5000
  const cotisationPerteEmploi = contrat.cotisation_perte_emploi || 0
  const cotisationTotale = contrat.cotisation_totale || (cotisationDeces + cotisationPrevoyance + cotisationPerteEmploi)

  const getCategorieLabel = (cat?: string) => {
    const labels: Record<string, string> = {
      'commercants': '🛒 Commerçants',
      'salaries_public': '🏛️ Salariés du Public',
      'salaries_prive': '🏢 Salariés du Privé',
      'salarie_cofidec': '🏦 Salariés COFIDEC',
      'retraites': '👴 Retraités',
      'autre': '📋 Autre'
    }
    return labels[cat || ''] || 'Non définie'
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-8">
      {/* Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/contrats/cofidec')}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Contrat #{contrat.id}</h1>
              <StatusBadge statut={contrat.statut || 'en_attente'} />
            </div>
            <p className="text-sm text-gray-400 mt-1">
              {contrat.nom_prenom} • COFIDEC
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
            onClick={() => navigate(`/sinistres/nouveau/cofidec?contrat_id=${contrat.id}&contrat_type=ContratCofidec`)}
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
            <CofidecContratPrint contrat={contrat} />
          </div>
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Row 1: Montant Principal & Statut */}
        <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50 flex flex-col justify-between min-h-[280px]">
          <div className="flex justify-between items-start">
            <span className="font-bold text-gray-700">Montant du Prêt</span>
            <MoreHorizontal size={20} className="text-gray-300" />
          </div>
          
          <div>
            <div className="text-4xl font-extrabold text-gray-900 mb-4">
              {formatCurrency(montant)}
            </div>
            <StatusBadge statut={contrat.statut || 'en_attente'} />
          </div>

          <div className="space-y-2 pt-4 border-t border-gray-100">
            <InfoRow label="N° Police" value={contrat.numero_police || 'En attente'} mono />
            <InfoRow label="Date d'émission" value={formatDate(contrat.created_at)} />
            <InfoRow label="Durée" value={`${duree} mois`} />
          </div>
        </div>

        {/* Assuré Principal */}
        <InfoCard title="Assuré Principal" icon={User} className="col-span-12 lg:col-span-4">
          <div className="space-y-1">
            <div className="text-xl font-bold text-gray-900 mb-4">{contrat.nom_prenom}</div>
            
            <div className="bg-gray-50 rounded-xl p-3 mb-4">
              <div className="text-xs text-gray-500 mb-1">Catégorie</div>
              <div className="font-bold text-gray-900">
                {getCategorieLabel(contrat.categorie)}
                {contrat.categorie === 'autre' && contrat.autre_categorie_precision && 
                  `: ${contrat.autre_categorie_precision}`
                }
              </div>
            </div>

            {(contrat.telephone_assure || contrat.telephone) && (
              <div className="flex items-center gap-3 py-2">
                <Phone size={16} className="text-gray-400" />
                <span className="text-gray-700">{contrat.telephone_assure || contrat.telephone}</span>
              </div>
            )}
            {(contrat.email_assure || contrat.email) && (
              <div className="flex items-center gap-3 py-2">
                <Mail size={16} className="text-gray-400" />
                <span className="text-gray-700">{contrat.email_assure || contrat.email}</span>
              </div>
            )}
            {(contrat.ville_assure || contrat.adresse_assure || contrat.adresse) && (
              <div className="flex items-center gap-3 py-2">
                <MapPin size={16} className="text-gray-400" />
                <span className="text-gray-700">
                  {contrat.ville_assure}{contrat.ville_assure && (contrat.adresse_assure || contrat.adresse) ? ', ' : ''}{contrat.adresse_assure || contrat.adresse}
                </span>
              </div>
            )}
          </div>
        </InfoCard>

        {/* Garanties */}
        <InfoCard title="Garanties" icon={Shield} className="col-span-12 lg:col-span-4">
          <div className="space-y-1">
            <GarantieBadge 
              active={!!contrat.garantie_prevoyance} 
              label="Prévoyance" 
              amount={contrat.garantie_prevoyance ? formatCurrency(cotisationPrevoyance) : undefined}
            />
            <GarantieBadge 
              active={!!(contrat.garantie_deces_iad || contrat.garantie_deces)} 
              label={`Décès / IAD (${(taux * 100).toFixed(2)}%)`}
              amount={(contrat.garantie_deces_iad || contrat.garantie_deces) ? formatCurrency(cotisationDeces) : undefined}
            />
            <GarantieBadge 
              active={!!contrat.garantie_perte_emploi} 
              label="Perte d'emploi (2%)"
              amount={contrat.garantie_perte_emploi ? formatCurrency(cotisationPerteEmploi) : undefined}
            />
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Cotisation TTC</span>
              <span className="text-xl font-bold text-samba-green">
                {formatCurrency(cotisationTotale)}
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
              <div className="text-xs text-gray-500 mb-1">Date de fin</div>
              <div className="font-bold text-gray-900">{formatDate(contrat.date_fin_echeance || contrat.date_echeance)}</div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <InfoRow label="Durée totale" value={`${duree} mois`} />
            <InfoRow label="Taux appliqué" value={`${(taux * 100).toFixed(2)}%`} />
          </div>
        </InfoCard>

        <InfoCard title="EMF Souscripteur" icon={Building2} className="col-span-12 lg:col-span-6">
          <div className="space-y-2">
            <div className="text-lg font-bold text-gray-900 mb-2">COFIDEC</div>
            <div className="text-sm text-gray-500 mb-3">
              Coopérative pour le Financement du Développement Communautaire
            </div>
            {contrat.agence && <InfoRow label="Agence" value={contrat.agence} />}
          </div>
          
          <div className="mt-4 bg-gray-50 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-2">Contact COFIDEC</div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>B.P. 2.551 - Libreville</p>
              <p>Tél: 011 49 18 17 / 074 48 25 80</p>
              <p>Email: cofidecemf@gmail.com</p>
            </div>
          </div>
        </InfoCard>

        {/* Row 3: Grille des taux */}
        <div className="col-span-12 bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <Percent size={20} className="text-gray-600" />
            </div>
            <h3 className="font-bold text-gray-700">Grille des Taux COFIDEC</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100">
                  <th className="font-medium py-3">Cible</th>
                  <th className="font-medium py-3 text-center">Taux</th>
                  <th className="font-medium py-3 text-center">Durée</th>
                  <th className="font-medium py-3 text-right">Montant max</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium text-gray-700">
                {[
                  { cible: 'Salariés COFIDEC', taux: '0,75%', duree: 'Durée du prêt', max: '20 000 000 FCFA', active: contrat.categorie === 'salarie_cofidec' },
                  { cible: 'Toutes catégories', taux: '0,50%', duree: '1 à 6 mois', max: '5 000 000 FCFA', active: duree >= 1 && duree <= 6 && contrat.categorie !== 'salarie_cofidec' },
                  { cible: 'Toutes catégories', taux: '1,00%', duree: '6 à 12(+1) mois', max: '10 000 000 FCFA', active: duree > 6 && duree <= 13 && contrat.categorie !== 'salarie_cofidec' },
                  { cible: 'Toutes catégories', taux: '1,75%', duree: '12 à 24 mois', max: '20 000 000 FCFA', active: duree > 13 && duree <= 24 && contrat.categorie !== 'salarie_cofidec' },
                  { cible: 'Privé & Commerçants', taux: '2,00%', duree: 'Max 24 mois', max: '20 000 000 FCFA', active: !!contrat.garantie_perte_emploi },
                ].map((row, i) => (
                  <tr key={i} className={`hover:bg-gray-50 transition-colors ${row.active ? 'bg-green-50' : ''}`}>
                    <td className="py-3 border-b border-gray-50">{row.cible}</td>
                    <td className={`py-3 text-center border-b border-gray-50 font-bold ${row.active ? 'text-samba-green' : 'text-gray-900'}`}>{row.taux}</td>
                    <td className="py-3 text-center border-b border-gray-50">{row.duree}</td>
                    <td className="py-3 text-right border-b border-gray-50">{row.max}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actions */}
        <div className="col-span-12 flex flex-col sm:flex-row justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(`/contrats/cofidec/${contrat.id}/edit`)}
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
          <CofidecContratPrint contrat={contrat} />
        </div>
      )}
    </div>
  )
}
