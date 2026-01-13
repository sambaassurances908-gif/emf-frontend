import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useEdgTaxiPrevoyanceDecesContract, useDeleteEdgTaxiPrevoyanceDecesContract } from '@/hooks/useEdgTaxiContracts'
import { EdgTaxiPrevoyanceDecesPrint } from './EdgTaxiPrevoyanceDecesPrint'
import {
    ArrowLeft,
    User,
    Edit3,
    Trash2,
    Printer,
    Eye,
    EyeOff,
    MoreHorizontal,
    HeartHandshake,
    AlertTriangle,
    Users,
    Phone,
} from 'lucide-react'

// Composant InfoCard
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
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-[#F48232]">
                    <Icon size={20} />
                </div>
                <h3 className="font-bold text-gray-700">{title}</h3>
            </div>
            <MoreHorizontal size={20} className="text-gray-300 cursor-pointer hover:text-gray-500" />
        </div>
        {children}
    </div>
)

// Badge de statut
const StatusBadge = ({ statut = 'actif' }: { statut?: string }) => {
    return (
        <span className="px-4 py-2 rounded-full text-sm font-bold bg-green-50 text-green-600 uppercase">
            {statut}
        </span>
    )
}

// Ligne d'information
const InfoRow = ({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) => (
    <div className="flex justify-between items-start py-2 gap-4 border-b border-gray-50 last:border-0 min-w-0">
        <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider flex-shrink-0 mt-0.5">{label}</span>
        <span className={`font-bold text-gray-900 text-right break-all sm:break-words leading-tight ${mono ? 'font-mono text-[11px]' : 'text-sm'}`}>
            {value || 'N/A'}
        </span>
    </div>
)

export const EdgTaxiPrevoyanceDecesDetailPage = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const location = useLocation()
    const { data: contrat, isLoading, isError } = useEdgTaxiPrevoyanceDecesContract(id ? Number(id) : undefined)
    const { mutate: deleteContract } = useDeleteEdgTaxiPrevoyanceDecesContract()
    const [showContratOfficiel, setShowContratOfficiel] = useState(false)
    const printRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isError) {
            alert('Erreur lors du chargement du contrat')
            navigate('/contrats/edg')
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
          <title>Contrat TAXI Prévoyance Décès #${contrat?.numero_police} - ${contrat?.nom} ${contrat?.prenom}</title>
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
        printWindow.onload = () => setTimeout(() => {
            if (printWindow.print) {
                printWindow.print()
                printWindow.close()
            }
        }, 300)
    }

    const handleDelete = () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce contrat ?')) {
            deleteContract(Number(id), {
                onSuccess: () => navigate('/contrats/edg')
            })
        }
    }

    if (isLoading || !contrat) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-[#FAFAFA]">
                <LoadingSpinner />
            </div>
        )
    }

    const nomComplet = `${contrat.prenom || ''} ${contrat.nom || ''}`.trim()
    const formatCurrency = (val: number) => new Intl.NumberFormat('fr-FR').format(val)
    const cotisation = contrat.prime_ttc || contrat.prime_annuelle || 50000;

    return (
        <div className="min-h-screen bg-[#FAFAFA] p-8">
            {/* Header */}
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/contrats/edg')}
                        className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">Contrat Taxi #{contrat.numero_police}</h1>
                            <StatusBadge />
                        </div>
                        <p className="text-sm text-gray-400 mt-1 uppercase font-bold tracking-wider">
                            {nomComplet} • SAMB'A TAXI - PREVOYANCE DECES
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
                        onClick={() => navigate(`/sinistres/nouveau/edg?contrat_id=${contrat.id}&contrat_type=EdgTaxiPrevoyanceDecesContrat`)}
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
                    <div className="flex justify-center bg-gray-100 p-8 rounded-2xl shadow-inner max-h-[800px] overflow-auto">
                        <div ref={printRef} className="scale-[0.8] origin-top">
                            <EdgTaxiPrevoyanceDecesPrint contrat={{ ...contrat, assures_associes: location.state?.assures_associes || contrat.assures_associes }} />
                        </div>
                    </div>
                </div>
            )}

            {/* Grid Layout */}
            <div className="grid grid-cols-12 gap-6">

                {/* Col 1: Résumé Financier */}
                <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50 flex flex-col justify-between min-h-[280px]">
                    <div className="flex justify-between items-start">
                        <span className="font-bold text-gray-700">Cotisation</span>
                        <MoreHorizontal size={20} className="text-gray-300" />
                    </div>

                    <div>
                        <div className="text-4xl font-extrabold text-[#F48232] mb-4">
                            {formatCurrency(cotisation)} FCFA
                        </div>
                        <span className="text-sm text-gray-500 uppercase font-bold tracking-wider">
                            {contrat.periodicite}
                        </span>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-gray-100">
                        <InfoRow label="N° Police" value={contrat.numero_police || 'N/A'} mono />
                        <InfoRow label="Date d'effet" value={new Date(contrat.date_effet).toLocaleDateString()} />
                        <InfoRow label="Date d'échéance" value={new Date(contrat.date_echeance).toLocaleDateString()} />
                    </div>
                </div>

                {/* Garantie Info */}
                <InfoCard title="Garanties" icon={HeartHandshake} className="col-span-12 lg:col-span-4">
                    <div className="space-y-3">
                        <InfoRow label="Frais Funéraires" value="200 000 FCFA" />
                        <InfoRow label="Plafond Max" value="1 000 000 FCFA" />
                        <InfoRow label="Type" value="Indemnités Forfaitaires" />
                    </div>
                </InfoCard>

                {/* Assurés associés info table */}
                <div className="col-span-12 bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50">
                    <div className="flex justify-between items-start mb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-[#F48232]">
                                <Users size={20} />
                            </div>
                            <h3 className="font-bold text-gray-700">Assurés Associés ({contrat.assures_associes?.filter((a: any) => a.nom)?.length || 0})</h3>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Lien</th>
                                    <th className="px-4 py-3">Nom</th>
                                    <th className="px-4 py-3">Prénom</th>
                                    <th className="px-4 py-3">Né(e) le</th>
                                    <th className="px-4 py-3">À</th>
                                    <th className="px-4 py-3 rounded-r-lg">Contact</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(contrat.assures_associes || []).map((associe: any, index: number) => {
                                    if (!associe.nom) return null; // Skip empty rows
                                    return (
                                        <tr key={index} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-gray-900">{associe.lien}</td>
                                            <td className="px-4 py-3">{associe.nom}</td>
                                            <td className="px-4 py-3">{associe.prenom}</td>
                                            <td className="px-4 py-3">{associe.date_naissance ? new Date(associe.date_naissance).toLocaleDateString() : '-'}</td>
                                            <td className="px-4 py-3">{associe.lieu_naissance}</td>
                                            <td className="px-4 py-3">{associe.contact}</td>
                                        </tr>
                                    )
                                })}
                                {(!contrat.assures_associes || contrat.assures_associes.filter((a: any) => a.nom).length === 0) && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-gray-400 italic">
                                            Aucun assuré associé enregistré
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Assuré principal */}
                <InfoCard title="Assuré Principal" icon={User} className="col-span-12 lg:col-span-6">
                    <div className="space-y-4">
                        <div className="text-xl font-bold text-gray-900">{nomComplet}</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                            <InfoRow label="Ville" value={contrat.ville || 'N/A'} />
                            <InfoRow label="Téléphone" value={contrat.telephone || 'N/A'} />
                            <InfoRow label="Adresse" value={contrat.adresse || 'N/A'} />
                            <InfoRow label="Email" value={contrat.email || 'N/A'} />
                        </div>
                    </div>
                </InfoCard>

                {/* Informations Complémentaires */}
                <InfoCard title="Informations Complémentaires" icon={User} className="col-span-12 lg:col-span-6">
                    <div className="space-y-4">
                        <InfoRow label="Catégorie" value={contrat.categorie || 'Commerçants'} />
                        <InfoRow label="N° Taxi" value={contrat.numero_taxis || 'N/A'} mono />
                        <InfoRow label="Personne à prévenir" value={contrat.personne_urgence || 'N/A'} />
                        <InfoRow label="Bénéficiaire Décès" value={contrat.beneficiaire_deces || 'N/A'} />
                        <InfoRow label="Visas DNA" value={contrat.visas_dna || 'N/A'} mono />
                    </div>
                </InfoCard>

                {/* Contact & Support */}
                <InfoCard title="Support & Assistance" icon={Phone} className="col-span-12">
                    <div className="space-y-3">
                        <div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-600">
                            En cas de décès, contactez immédiatement le service client pour l'ouverture du dossier de sinistre.
                        </div>
                        <InfoRow label="Assistance" value="(+241) 060 08 62 62" />
                    </div>
                </InfoCard>

            </div>

            {/* Actions Footer */}
            <div className="mt-10 flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                    onClick={() => navigate(`/contrats/edg-taxi-prevoyance-deces/${id}/edit`)}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-bold transition-all"
                >
                    <Edit3 size={18} />
                    Modifier le contrat
                </button>
                <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition-all"
                >
                    <Trash2 size={18} />
                    Supprimer le contrat
                </button>
            </div>
        </div>
    )
}
