import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useSodecContract } from '@/hooks/useSodecContract'
import { formatCurrency, formatDate } from '@/lib/utils'
import { SodecContratPrint } from '@/components/contrats/SodecContratPrint'
import {
  ArrowLeft,
  User,
  Users,
  Shield,
  Phone,
  Mail,
  MapPin,
  Edit3,
  Trash2,
  Printer,
  Eye,
  EyeOff,
  Briefcase,
  Calendar,
  AlertTriangle,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Building2,
  FileText,
  Heart,
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

export const SodecContratDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: contrat, isLoading, isError } = useSodecContract(Number(id))
  const [showContratOfficiel, setShowContratOfficiel] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isError) {
      alert('Erreur lors du chargement du contrat')
      navigate('/contrats/sodec')
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
          <title>Contrat SODEC #${contrat?.id} - ${contrat?.nom_prenom}</title>
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
        <LoadingSpinner size="lg" text="Chargement du contrat SODEC..." />
      </div>
    )
  }

  const assuresAssocies = contrat.assures_associes || []
  const hasAssuresAssocies = assuresAssocies.length > 0

  const getCategorieLabel = (categorie?: string, precision?: string) => {
    const labels: Record<string, string> = {
      commercants: '🛒 Commerçants',
      salaries_public: '🏛️ Salariés du Public',
      salaries_prive: '🏢 Salariés du Privé',
      retraites: '👴 Retraités',
      autre: `📋 ${precision || 'Autre'}`,
    }
    return labels[categorie || ''] || 'Non définie'
  }

  const getOptionPrevoyanceInfo = (option?: string) => {
    switch (option) {
      case 'option_a':
        return {
          label: 'OPTION A',
          montant: '30 000 FCFA/an',
          details: 'Capital décès: 1 000 000 FCFA • Frais funéraires: 100 000 FCFA',
          bg: 'bg-samba-green',
        }
      case 'option_b':
        return {
          label: 'OPTION B',
          montant: '15 000 FCFA/an',
          details: 'Capital décès: 500 000 FCFA • Frais funéraires: 50 000 FCFA',
          bg: 'bg-samba-blue',
        }
      default:
        return {
          label: 'Non définie',
          montant: '',
          details: '',
          bg: 'bg-gray-400',
        }
    }
  }

  const optionInfo = getOptionPrevoyanceInfo(contrat.option_prevoyance)

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-8">
      {/* Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/contrats/sodec')}
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
              {contrat.nom_prenom} • SODEC
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
            onClick={() => navigate(`/sinistres/nouveau/sodec?contrat_id=${contrat.id}&contrat_type=ContratSodec`)}
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
            <SodecContratPrint contrat={contrat} />
          </div>
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Row 1: Montant Principal & Statut */}
        <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50 flex flex-col justify-between min-h-[320px]">
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
            <InfoRow label="Durée du prêt" value={`${contrat.duree_pret_mois} mois`} />
            <InfoRow label="Date d'émission" value={formatDate(contrat.created_at)} />
          </div>
        </div>

        {/* Assuré Principal */}
        <InfoCard title="Assuré / Emprunteur" icon={User} className="col-span-12 lg:col-span-4">
          <div className="space-y-1">
            <div className="text-xl font-bold text-gray-900 mb-4">{contrat.nom_prenom}</div>
            
            <div className="bg-gray-50 rounded-xl p-3 mb-4">
              <div className="text-xs text-gray-500 mb-1">Catégorie</div>
              <div className="font-bold text-gray-900">
                {getCategorieLabel(contrat.categorie, contrat.autre_categorie_precision)}
              </div>
            </div>

            {(contrat.date_naissance || contrat.lieu_naissance) && (
              <div className="bg-gray-50 rounded-xl p-3 mb-3">
                <div className="text-xs text-gray-500 mb-1">Naissance</div>
                <div className="font-semibold text-gray-900">
                  {contrat.date_naissance ? formatDate(contrat.date_naissance) : ''}
                  {contrat.lieu_naissance && ` à ${contrat.lieu_naissance}`}
                </div>
              </div>
            )}

            {contrat.profession && (
              <div className="flex items-center gap-3 py-2">
                <Briefcase size={16} className="text-gray-400" />
                <span className="text-gray-700">{contrat.profession}</span>
              </div>
            )}
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
            {(contrat.adresse_assure || contrat.ville_assure) && (
              <div className="flex items-center gap-3 py-2">
                <MapPin size={16} className="text-gray-400" />
                <span className="text-gray-700">
                  {contrat.ville_assure}
                  {contrat.ville_assure && contrat.adresse_assure ? ', ' : ''}
                  {contrat.adresse_assure}
                </span>
              </div>
            )}
          </div>
        </InfoCard>

        {/* Garanties & Option Prévoyance */}
        <InfoCard title="Garanties" icon={Shield} className="col-span-12 lg:col-span-4">
          <div className="space-y-1">
            {/* Option Prévoyance */}
            <div className={`${optionInfo.bg} text-white rounded-xl p-4 mb-4`}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold">{optionInfo.label}</span>
                {optionInfo.montant && (
                  <span className="text-sm font-semibold bg-white/20 px-2 py-1 rounded-lg">
                    {optionInfo.montant}
                  </span>
                )}
              </div>
              {optionInfo.details && (
                <p className="text-xs opacity-90">{optionInfo.details}</p>
              )}
            </div>

            <GarantieBadge active={true} label="Décès / IAD (crédit)" />
            <GarantieBadge active={!!contrat.garantie_perte_emploi} label="Perte d'emploi" />
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
              <div className="text-xs text-gray-500 mb-1">Date d'échéance</div>
              <div className="font-bold text-gray-900">
                {contrat.date_echeance ? formatDate(contrat.date_echeance) : 'N/A'}
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <InfoRow label="Durée totale" value={`${contrat.duree_pret_mois} mois`} />
          </div>
        </InfoCard>

        <InfoCard title="EMF Souscripteur" icon={Building2} className="col-span-12 lg:col-span-6">
          <div className="space-y-2">
            <div className="text-lg font-bold text-gray-900 mb-2">
              SODEC (Société de Développement et d'Épargne du Crédit)
            </div>
            <InfoRow label="Sigle" value="SODEC" />
            {contrat.agence && <InfoRow label="Agence" value={contrat.agence} />}
          </div>
          
          {contrat.beneficiaire_prevoyance_nom_prenom && (
            <div className="mt-4 bg-gray-50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-2">Bénéficiaire Prévoyance</div>
              <div className="font-bold text-gray-900">{contrat.beneficiaire_prevoyance_nom_prenom}</div>
            </div>
          )}
        </InfoCard>

        {/* Assurés Associés */}
        <div className="col-span-12 bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <Users size={20} className="text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-700">Assurés Associés</h3>
                <p className="text-xs text-gray-400">{assuresAssocies.length} assuré(s) associé(s)</p>
              </div>
            </div>
            <button
              onClick={() => alert('Fonction Ajouter assuré associé à implémenter')}
              className="px-4 py-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-xl font-bold text-sm transition-colors"
            >
              + Ajouter
            </button>
          </div>

          {hasAssuresAssocies ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assuresAssocies.map((assure: any, index: number) => (
                <div 
                  key={assure.id || `assure-${index}`}
                  className="p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">
                        {assure.nom} {assure.prenom}
                      </div>
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                        {assure.type_assure?.toUpperCase() || 'Associé'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    {(assure.date_naissance || assure.lieu_naissance) && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>
                          {assure.date_naissance ? formatDate(assure.date_naissance) : ''} 
                          {assure.lieu_naissance && ` à ${assure.lieu_naissance}`}
                        </span>
                      </div>
                    )}
                    {assure.contact && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{assure.contact}</span>
                      </div>
                    )}
                    {assure.adresse && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{assure.adresse}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => alert(`Modifier assuré : ${assure.nom} ${assure.prenom}`)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Modifier
                    </button>
                    <button
                      onClick={() => alert(`Supprimer assuré : ${assure.nom} ${assure.prenom}`)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Retirer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
                <Users size={32} className="text-gray-400" />
              </div>
              <p className="font-medium text-gray-700 mb-1">Aucun assuré associé</p>
              <p className="text-sm text-gray-400">
                Ajoutez les membres de la famille ou dépendants ici
              </p>
            </div>
          )}
        </div>

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
            onClick={() => navigate(`/contrats/sodec/${contrat.id}/edit`)}
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
          <SodecContratPrint contrat={contrat} />
        </div>
      )}
    </div>
  )
}
