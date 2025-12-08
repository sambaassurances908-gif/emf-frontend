import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useSodecContract } from '@/hooks/useSodecContract'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { SodecContratPrint } from '@/components/contrats/SodecContratPrint'
import {
  ArrowLeft,
  User,
  Users,
  Shield,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Edit3,
  Trash2,
  Printer,
  Eye,
  EyeOff,
} from 'lucide-react'

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

  // Fonction pour imprimer uniquement le contrat officiel avec les styles exacts
  const handlePrint = () => {
    const printContent = printRef.current
    if (!printContent) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Veuillez autoriser les popups pour imprimer')
      return
    }

    // Copier tous les styles de la page actuelle
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
            @page { 
              size: A4; 
              margin: 0; 
            }
            @media print {
              body { 
                margin: 0; 
                padding: 0;
                -webkit-print-color-adjust: exact !important; 
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              * {
                -webkit-print-color-adjust: exact !important; 
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
            }
            body { 
              margin: 0; 
              padding: 0; 
              background: white;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `)
    printWindow.document.close()
    
    // Attendre le chargement complet des styles puis imprimer
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
      }, 300)
    }
  }

  if (isLoading || !contrat) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <LoadingSpinner size="lg" text="Chargement du contrat SODEC..." />
      </div>
    )
  }

  const assuresAssocies = contrat.assures_associes || []
  const hasAssuresAssocies = assuresAssocies.length > 0

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => navigate('/contrats/sodec')}
          >
            <ArrowLeft className="w-5 h-5" />
            Retour à la liste
          </Button>

          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-700">
            Contrat #{contrat.id} - {contrat.nom_prenom}
          </h1>

          <div className="flex gap-4 flex-wrap">
            <Button
              size="lg"
              className={`flex items-center gap-2 shadow-lg ${
                showContratOfficiel 
                  ? 'bg-gray-600 hover:bg-gray-700' 
                  : 'bg-[#F48232] hover:bg-[#e0742a]'
              } text-white`}
              onClick={() => setShowContratOfficiel(!showContratOfficiel)}
            >
              {showContratOfficiel ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              {showContratOfficiel ? 'Masquer contrat' : 'Voir contrat officiel'}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="flex items-center gap-2 border-[#F48232] text-[#F48232] hover:bg-orange-50"
              onClick={handlePrint}
            >
              <Printer className="w-5 h-5" />
              Imprimer contrat
            </Button>
          </div>
        </div>

        {/* Prévisualisation du contrat officiel */}
        {showContratOfficiel && (
          <div className="bg-gray-200 p-4 rounded-xl shadow-inner">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Prévisualisation du contrat officiel
              </h2>
              <Button
                size="sm"
                className="bg-[#F48232] hover:bg-[#e0742a] text-white"
                onClick={handlePrint}
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimer
              </Button>
            </div>
            <div ref={printRef} className="overflow-auto max-h-[800px] rounded-lg shadow-xl">
              <SodecContratPrint contrat={contrat} />
            </div>
          </div>
        )}

        {/* Info générales + tarification */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Statut & Montant */}
          <Card className="shadow-lg rounded-xl bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Shield className="w-6 h-6 text-indigo-600" />
                Statut & Montant
              </CardTitle>
              <CardDescription className="text-gray-600">
                Statut du contrat et montant assuré
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8 space-y-4">
              <Badge
                className={`inline-block px-8 py-3 text-xl font-bold rounded-full shadow-md ${
                  getStatusColor(contrat.statut) ?? 'bg-green-100 text-green-800'
                }`}
              >
                {contrat.statut?.toUpperCase() ?? 'ACTIF'}
              </Badge>
              <div className="text-indigo-700 font-extrabold text-3xl">
                {formatCurrency(contrat.montant_pret_assure)}
              </div>
              <div className="text-sm font-semibold text-indigo-600">Montant assuré</div>
              
              {/* Date d'émission */}
              <div className="pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">Date d'émission</div>
                <div className="font-semibold text-gray-800">{formatDate(contrat.created_at)}</div>
              </div>
            </CardContent>
          </Card>

          {/* Assuré Principal + Catégorie */}
          <Card className="shadow-lg rounded-xl bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <User className="w-6 h-6 text-purple-600" />
                Assuré principal
              </CardTitle>
              <CardDescription className="text-gray-600">Coordonnées et catégorie</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xl font-bold text-gray-900">{contrat.nom_prenom}</div>

              {/* Catégorie */}
              <div className="bg-purple-50 rounded-lg p-2">
                <div className="text-xs text-purple-600 font-medium">Catégorie</div>
                <div className="font-bold text-purple-800 capitalize">
                  {contrat.categorie === 'commercants' && '🛒 Commerçants'}
                  {contrat.categorie === 'salaries_public' && '🏛️ Salariés du Public'}
                  {contrat.categorie === 'salaries_prive' && '🏢 Salariés du Privé'}
                  {contrat.categorie === 'retraites' && '👴 Retraités'}
                  {contrat.categorie === 'autre' && `📋 Autre: ${contrat.autre_categorie_precision || ''}`}
                  {!contrat.categorie && 'Non définie'}
                </div>
              </div>

              {contrat.telephone_assure && (
                <p className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-5 h-5" />
                  <span>{contrat.telephone_assure}</span>
                </p>
              )}

              {contrat.email_assure && (
                <p className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-5 h-5" />
                  <span>{contrat.email_assure}</span>
                </p>
              )}

              {(contrat.ville_assure || contrat.adresse_assure) && (
                <p className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span>
                    {contrat.ville_assure}
                    {contrat.ville_assure && contrat.adresse_assure ? ', ' : ''}
                    {contrat.adresse_assure}
                  </span>
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tarification & Durée */}
          <Card className="shadow-lg rounded-xl bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <DollarSign className="w-6 h-6 text-pink-600" />
                Tarification & Durée
              </CardTitle>
              <CardDescription className="text-gray-600">
                Détails financiers et contractuels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Option de prévoyance avec détails */}
              <div className="p-3 rounded-lg border-2 border-dashed border-pink-300 bg-pink-50">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Option prévoyance</span>
                  <Badge className={`text-base px-3 py-1 ${
                    contrat.option_prevoyance === 'option_a' 
                      ? 'bg-orange-500 text-white' 
                      : contrat.option_prevoyance === 'option_b'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-400 text-white'
                  }`}>
                    {contrat.option_prevoyance === 'option_a' 
                      ? 'OPTION A - 30 000 FCFA/an' 
                      : contrat.option_prevoyance === 'option_b'
                        ? 'OPTION B - 15 000 FCFA/an'
                        : contrat.option_prevoyance?.toUpperCase() ?? 'N/A'}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {contrat.option_prevoyance === 'option_a' 
                    ? 'Capital décès: 1 000 000 FCFA • Frais funéraires: 100 000 FCFA' 
                    : contrat.option_prevoyance === 'option_b'
                      ? 'Capital décès: 500 000 FCFA • Frais funéraires: 50 000 FCFA'
                      : ''}
                </p>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Durée du prêt (mois)</span>
                <span className="font-semibold">{contrat.duree_pret_mois}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Date d'effet</span>
                <span className="font-semibold">{formatDate(contrat.date_effet)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Garantie perte emploi</span>
                <Badge className={contrat.garantie_perte_emploi ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                  {contrat.garantie_perte_emploi ? 'Oui' : 'Non'}
                </Badge>
              </div>

              {/* Cotisation TTC */}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-800">Cotisation totale TTC</span>
                  <span className="text-xl font-bold text-pink-600">
                    {contrat.cotisation_totale_ttc 
                      ? Number(contrat.cotisation_totale_ttc).toLocaleString('fr-FR') + ' FCFA'
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assurés Associés Section */}
        <Card className="rounded-xl shadow-lg bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <Users className="w-7 h-7 text-indigo-600" />
                Assurés associés ({assuresAssocies.length})
              </CardTitle>
              <Button
                variant="outline"
                size="lg"
                onClick={() => alert('Fonction Ajouter assuré associé à implémenter')}
                className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
              >
                Ajouter assuré
              </Button>
            </div>
            <CardDescription>
              Liste des membres associés au contrat (famille, dépendants, etc.)
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            {hasAssuresAssocies ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-indigo-100">
                    <tr>
                      {[
                        'Type',
                        'Nom complet',
                        'Naissance',
                        'Contact',
                        'Adresse',
                        'Actions',
                      ].map((label) => (
                        <th
                          key={label}
                          className="px-6 py-3 text-left text-xs font-semibold text-indigo-800 uppercase tracking-wider"
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assuresAssocies.map((assure: any) => (
                      <tr
                        key={assure.id}
                        className="hover:bg-indigo-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className="font-semibold border border-gray-300 bg-white text-gray-700">
                            {assure.type_assure?.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                          {assure.nom} {assure.prenom}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(assure.date_naissance)} <br />
                          <span className="text-xs text-gray-400">
                            {assure.lieu_naissance}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-indigo-600 font-medium">
                          {assure.contact}
                        </td>
                        <td className="px-6 py-4 max-w-xs truncate">{assure.adresse}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              alert(`Modifier assuré : ${assure.nom} ${assure.prenom}`)
                            }
                          >
                            <Edit3 className="w-5 h-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-800"
                            onClick={() =>
                              alert(`Supprimer assuré : ${assure.nom} ${assure.prenom}`)
                            }
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-20 text-center text-gray-500">
                <Users className="mx-auto mb-4 w-14 h-14" />
                <p className="text-lg font-medium">Aucun assuré associé pour ce contrat.</p>
                <p className="text-sm mt-2 max-w-md mx-auto">
                  Vous pouvez ajouter les membres de la famille ou dépendants ici.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions principales */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate(`/contrats/sodec/${contrat.id}/edit`)}
            className="flex items-center gap-2"
          >
            <Edit3 className="w-5 h-5" />
            Modifier le contrat
          </Button>
          <Button
            variant="danger"
            size="lg"
            onClick={() => alert('Fonction suppression du contrat à implémenter')}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            Supprimer / Archiver le contrat
          </Button>
        </div>

        {/* Container caché pour l'impression (utilisé quand la prévisualisation n'est pas visible) */}
        {!showContratOfficiel && (
          <div ref={printRef} className="hidden">
            <SodecContratPrint contrat={contrat} />
          </div>
        )}
      </div>
    </div>
  )
}
