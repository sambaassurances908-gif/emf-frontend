import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useBcegMotoContract, useDeleteBcegMotoContract } from '@/hooks/useBcegMotoContracts'
import { formatCurrency, formatDate } from '@/lib/utils'
import { BcegMotoContratPrint } from './BcegMotoContratPrint'
import {
    ArrowLeft,
    User,
    Shield,
    Phone,
    MapPin,
    Edit3,
    Trash2,
    Printer,
    Building2,
    Clock,
    Eye,
    EyeOff,
    AlertTriangle,
    MoreHorizontal,
    CheckCircle,
    Calendar,
    Bike,
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

// Badge de statut (Moto simplifiée pour l'instant)
const StatusBadge = ({ statut = 'actif' }: { statut?: string }) => {
    return (
        <span className="px-4 py-2 rounded-full text-sm font-bold bg-green-50 text-green-600 uppercase">
            {statut}
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

export const BcegMotoContratDetailPage = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { data: contrat, isLoading, isError } = useBcegMotoContract(id || '')
    const { mutate: deleteContract } = useDeleteBcegMotoContract()
    const [showContratOfficiel, setShowContratOfficiel] = useState(false)
    const printRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isError) {
            alert('Erreur lors du chargement du contrat moto')
            navigate('/contrats/bceg')
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
          <title>Contrat BCEG MOTO #${contrat?.id} - ${contrat?.nom} ${contrat?.prenom}</title>
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

    const handleDelete = () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce contrat moto ?')) {
            deleteContract(Number(id), {
                onSuccess: () => {
                    navigate('/contrats/bceg')
                }
            })
        }
    }

    if (isLoading || !contrat) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-[#FAFAFA]">
                <LoadingSpinner size="lg" text="Chargement du contrat moto..." />
            </div>
        )
    }

    const nomComplet = `${contrat.prenom || ''} ${contrat.nom || ''}`.trim()

    return (
        <div className="min-h-screen bg-[#FAFAFA] p-8">
            {/* Header */}
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/contrats/bceg')}
                        className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">Contrat Moto #{contrat.id}</h1>
                            <StatusBadge />
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                            {nomComplet} • BCEG MOTO
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowContratOfficiel(!showContratOfficiel)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${showContratOfficiel
                            ? 'bg-gray-600 text-white hover:bg-gray-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {showContratOfficiel ? <EyeOff size={16} /> : <Eye size={16} />}
                        {showContratOfficiel ? 'Masquer Print' : 'Aperçu Print'}
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl font-bold text-sm transition-colors"
                    >
                        <Printer size={16} />
                        Imprimer
                    </button>
                    <button
                        onClick={() => navigate(`/sinistres/nouveau/bceg?contrat_id=${contrat.id}&contrat_type=ContratBcegMoto`)}
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
                            Document imprimable (format officiel)
                        </h2>
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 bg-[#F48232] text-white hover:bg-[#e0742a] rounded-xl font-bold text-sm transition-colors"
                        >
                            <Printer size={16} />
                            Imprimer maintenant
                        </button>
                    </div>
                    <div ref={printRef} className="overflow-auto max-h-[800px] rounded-xl border border-gray-200 bg-gray-100 p-8">
                        <BcegMotoContratPrint contrat={contrat} />
                    </div>
                </div>
            )}

            {/* Grid Layout */}
            <div className="grid grid-cols-12 gap-6">

                {/* Col 1: Résumé Financier */}
                <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50 flex flex-col justify-between min-h-[280px]">
                    <div className="flex justify-between items-start">
                        <span className="font-bold text-gray-700">Montant du Prêt</span>
                        <MoreHorizontal size={20} className="text-gray-300" />
                    </div>

                    <div>
                        <div className="text-4xl font-extrabold text-[#F48232] mb-4">
                            {formatCurrency(Number(contrat.montant_pret) || 0)}
                        </div>
                        <StatusBadge />
                    </div>

                    <div className="space-y-2 pt-4 border-t border-gray-100">
                        <InfoRow label="N° Police" value={contrat.numero_police || contrat.police_numero || 'N/A'} mono />
                        <InfoRow label="Date d'émission" value={formatDate(contrat.created_at)} />
                        <InfoRow label="Durée" value={`${contrat.duree_pret} mois`} />
                    </div>
                </div>

                {/* Assuré */}
                <InfoCard title="Assuré / Souscripteur" icon={User} className="col-span-12 lg:col-span-4">
                    <div className="space-y-1">
                        <div className="text-xl font-bold text-gray-900 mb-4">{nomComplet}</div>

                        <div className="flex items-center gap-3 py-2">
                            <MapPin size={16} className="text-gray-400" />
                            <span className="text-gray-700">{contrat.ville}</span>
                        </div>

                        <div className="flex items-center gap-3 py-2">
                            <Phone size={16} className="text-gray-400" />
                            <span className="text-gray-700">{contrat.adresse_telephone}</span>
                        </div>
                    </div>
                </InfoCard>

                {/* Engin */}
                <InfoCard title="Détails de l'Engin" icon={Bike} className="col-span-12 lg:col-span-4">
                    <div className="space-y-3">
                        <div className="bg-orange-50 rounded-xl p-4">
                            <div className="text-xs text-orange-600 mb-1 uppercase font-bold tracking-wider">Marque / Type</div>
                            <div className="font-bold text-gray-900 text-lg">{contrat.marque_type_engin || 'N/A'}</div>
                        </div>

                        <InfoRow label="Immatriculation" value={contrat.immatriculation?.toUpperCase() || 'N/A'} mono />
                        <InfoRow label="Valeur Assurée" value={formatCurrency(Number(contrat.valeur_assuree) || 0)} />
                    </div>
                </InfoCard>

                {/* Garanties & Primes */}
                <InfoCard title="Garanties & Cotisation" icon={Shield} className="col-span-12 lg:col-span-6">
                    <div className="space-y-1">
                        <div className="flex items-center justify-between py-2 border-b border-gray-50">
                            <span className="text-sm text-gray-700 font-medium">Décès – invalidité</span>
                            <span className="text-xs font-bold px-2 py-1 bg-green-50 text-green-600 rounded-full flex items-center gap-1">
                                <CheckCircle size={10} /> Inclus (0.50%)
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-50">
                            <span className="text-sm text-gray-700 font-medium">Garanties complémentaires</span>
                            <span className="text-xs font-bold px-2 py-1 bg-green-50 text-green-600 rounded-full flex items-center gap-1">
                                <CheckCircle size={10} /> Perte recette + Dommages
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-gray-50 rounded-2xl">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-500 text-sm">Prime Décès ({contrat.taux_prime_unique}%)</span>
                            <span className="font-bold text-gray-700">{formatCurrency(Number(contrat.prime_deces_invalidite) || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-500 text-sm">Forfait Accessoires</span>
                            <span className="font-bold text-gray-700">{formatCurrency(Number(contrat.cotisations_complementaires) || 35000)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                            <span className="font-bold text-gray-900">COTISATION TOTALE TTC</span>
                            <span className="text-2xl font-extrabold text-samba-green">
                                {formatCurrency(Number(contrat.prime_totale) || 0)}
                            </span>
                        </div>
                    </div>
                </InfoCard>

                {/* Périodes */}
                <InfoCard title="Périodes & Dates" icon={Calendar} className="col-span-12 lg:col-span-6">
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
                        <InfoRow label="Lieu d'émission" value="Libreville" />
                    </div>
                </InfoCard>

                {/* Actions */}
                <div className="col-span-12 flex flex-col sm:flex-row justify-end gap-4 mt-4">
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/contrats/bceg-moto/${contrat.id}/edit`)}
                        className="flex items-center gap-2 px-6 py-6 rounded-2xl border-2 border-gray-200 hover:bg-gray-50 font-bold"
                    >
                        <Edit3 size={18} />
                        Modifier le contrat
                    </Button>
                    <Button
                        onClick={handleDelete}
                        className="flex items-center gap-2 px-6 py-6 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl font-bold transition-colors"
                    >
                        <Trash2 size={18} />
                        Supprimer le contrat
                    </Button>
                </div>
            </div>

            {/* Container caché pour l'impression par défaut */}
            {!showContratOfficiel && (
                <div ref={printRef} className="hidden">
                    <BcegMotoContratPrint contrat={contrat} />
                </div>
            )}
        </div>
    )
}
