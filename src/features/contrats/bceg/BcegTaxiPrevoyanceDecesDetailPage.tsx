import { useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useBcegTaxiPrevoyanceDecesContract, useDeleteBcegTaxiPrevoyanceDecesContract } from '@/hooks/useBcegTaxiContracts'
import { BcegTaxiPrevoyanceDecesPrint } from './BcegTaxiPrevoyanceDecesPrint'
import {
    ArrowLeft,
    User,
    Edit3,
    Trash2,
    Printer,
    MoreHorizontal,
    HeartHandshake,
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

// Badge de statut commenté car non utilisé actuellement
// const StatusBadge = ({ statut = 'actif' }: { statut?: string }) => {
//     return (
//         <span className="px-4 py-2 rounded-full text-sm font-bold bg-green-50 text-green-600 uppercase">
//             {statut}
//         </span>
//     )
// }

// Ligne d'information
const InfoRow = ({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) => (
    <div className="flex justify-between items-center py-2">
        <span className="text-gray-500 text-sm">{label}</span>
        <span className={`font-semibold text-gray-900 ${mono ? 'font-mono text-sm' : ''}`}>{value}</span>
    </div>
)

export const BcegTaxiPrevoyanceDecesDetailPage = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const location = useLocation()
    const { data: contrat, isLoading, isError } = useBcegTaxiPrevoyanceDecesContract(id || '')
    const { mutate: deleteContract } = useDeleteBcegTaxiPrevoyanceDecesContract()
    const printRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isError) {
            alert('Erreur lors du chargement du contrat')
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
          <title>Contrat TAXI Prévoyance Décès #${contrat?.id}</title>
          ${styles}
          <style>
            @page { size: A4; margin: 0; }
            @media print {
              body { -webkit-print-color-adjust: exact; }
            }
            body { margin: 0; background: white; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `)
        printWindow.document.close()
    }

    const handleDelete = () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce contrat ?')) {
            deleteContract(Number(id), {
                onSuccess: () => navigate('/contrats/bceg')
            })
        }
    }

    if (isLoading) return <LoadingSpinner />
    if (!contrat) return null

    const formatCurrency = (val?: number) => val ? new Intl.NumberFormat('fr-FR').format(val) : '0'
    const nomComplet = [contrat.nom, contrat.prenom].filter(Boolean).join(' ')
    const cotisation = contrat.prime_ttc || contrat.prime_annuelle || 50000;


    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 font-sans">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/contrats/bceg')}
                        className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow text-gray-500"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Contrat #{contrat.numero_police}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Taxi Prévoyance Décès &bull; {new Date(contrat.created_at || '').toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-[#F48232] text-white hover:bg-[#e0742a] rounded-xl font-bold text-sm transition-colors"
                    >
                        <Printer size={16} />
                        Imprimer maintenant
                    </button>
                </div>
            </div>

            {/* Print Container */}
            <div className="mb-8">
                <div ref={printRef} className="overflow-auto max-h-[800px] rounded-xl border border-gray-200 bg-gray-100 p-8 flex justify-center">
                    <BcegTaxiPrevoyanceDecesPrint contrat={{
                        ...contrat,
                        assures_associes: location.state?.assures_associes || contrat.assures_associes
                    }} />
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-12 gap-6">

                {/* Col 1: Résumé Financier */}
                <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50 flex flex-col justify-between min-h-[280px]">
                    <div className="flex justify-between items-start">
                        <span className="font-bold text-gray-700">Prime {contrat.periodicite === 'semestre' ? 'semestrielle' : 'annuelle'}</span>
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

                {/* Assurés associés info table */}
                <div className="col-span-12 bg-white p-6 rounded-3xl shadow-soft border border-gray-100/50">
                    <div className="flex justify-between items-start mb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                                <User size={20} className="text-gray-600" />
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
                                    if (!associe.nom) return null;
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

                {/* Garantie Info */}
                <InfoCard title="Garanties" icon={HeartHandshake} className="col-span-12 lg:col-span-4">
                    <div className="space-y-3">
                        <InfoRow label="Frais funéraires" value={`${formatCurrency(TAXI_PREVOYANCE_DECES_CONSTANTS.FRAIS_FUNERAIRES_FORFAIT)} FCFA`} />
                        <InfoRow label="Plafond annuel" value={`${formatCurrency(TAXI_PREVOYANCE_DECES_CONSTANTS.MONTANT_MAX_COUVERTURE)} FCFA`} />
                    </div>
                </InfoCard>

                {/* Assuré */}
                <InfoCard title="Souscripteur" icon={User} className="col-span-12 lg:col-span-4">
                    <div className="space-y-4">
                        <div className="text-xl font-bold text-gray-900">{nomComplet}</div>
                        <div className="grid grid-cols-1 gap-4">
                            <InfoRow label="Ville" value={contrat.ville || 'N/A'} />
                            <InfoRow label="Téléphone" value={contrat.telephone || 'N/A'} />
                            <InfoRow label="Adresse" value={contrat.adresse || 'N/A'} />
                            <InfoRow label="Email" value={contrat.email || 'N/A'} />
                        </div>
                    </div>
                </InfoCard>

                {/* Informations Complémentaires */}
                <InfoCard title="Informations Complémentaires" icon={User} className="col-span-12 lg:col-span-4">
                    <div className="space-y-4">
                        <InfoRow label="Catégorie" value={contrat.categorie || 'Commerçants'} />
                        <InfoRow label="N° Taxi" value={contrat.numero_taxis || 'N/A'} mono />
                        <InfoRow label="Personne à prévenir" value={contrat.personne_urgence || 'N/A'} />
                        <InfoRow label="Bénéficiaire Décès" value={contrat.beneficiaire_deces || 'N/A'} />
                        <InfoRow label="Visas DNA" value={contrat.visas_dna || 'N/A'} mono />
                    </div>
                </InfoCard>

            </div>

            {/* Actions Footer */}
            <div className="mt-10 flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                    type="button"
                    onClick={() => navigate(`/contrats/bceg-taxi-prevoyance-deces/${id}/edit`)}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-bold transition-all"
                >
                    <Edit3 size={18} />
                    Modifier le contrat
                </button>
                <button
                    type="button"
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
