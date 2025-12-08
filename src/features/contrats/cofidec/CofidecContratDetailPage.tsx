// src/features/contrats/cofidec/CofidecContratDetailPage.tsx
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
import { useCofidecContract } from '@/hooks/useCofidecContracts'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CofidecContratPrint } from './CofidecContratPrint'
import {
  ArrowLeft,
  User,
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
  Building2,
  Percent,
} from 'lucide-react'

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

  // Fonction pour imprimer uniquement le contrat officiel
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <LoadingSpinner size="lg" text="Chargement du contrat COFIDEC..." />
      </div>
    )
  }

  // Calcul des cotisations
  const montant = contrat.montant_pret || contrat.montant_pret_assure || 0
  const duree = contrat.duree_pret_mois || contrat.duree_mois || 0
  
  const getTaux = () => {
    const cat = contrat.categorie
    if (cat === 'salaries_cofidec') return 0.0075
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
      'salaries_cofidec': '🏦 Salariés COFIDEC',
      'retraites': '👴 Retraités',
      'autre': '📋 Autre'
    }
    return labels[cat || ''] || 'Non définie'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => navigate('/contrats/cofidec')}
          >
            <ArrowLeft className="w-5 h-5" />
            Retour à la liste
          </Button>

          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#F48232] to-orange-600">
            Contrat #{contrat.id} - {contrat.nom_prenom}
          </h1>

          <div className="flex gap-3">
            <Button
              size="lg"
              className={`flex items-center gap-2 shadow-lg ${
                showContratOfficiel 
                  ? 'bg-gray-600 hover:bg-gray-700' 
                  : 'bg-[#F48232] hover:bg-orange-600'
              } text-white`}
              onClick={() => setShowContratOfficiel(!showContratOfficiel)}
            >
              {showContratOfficiel ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              <span className="hidden sm:inline">{showContratOfficiel ? 'Masquer' : 'Voir contrat'}</span>
            </Button>
            <Button
              size="lg"
              className="flex items-center gap-2 bg-[#F48232] hover:bg-orange-600 text-white shadow-lg"
              onClick={handlePrint}
            >
              <Printer className="w-5 h-5" />
              <span className="hidden sm:inline">Imprimer</span>
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
                className="bg-[#F48232] hover:bg-orange-600 text-white"
                onClick={handlePrint}
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimer
              </Button>
            </div>
            <div ref={printRef} className="overflow-auto max-h-[800px] rounded-lg shadow-xl">
              <CofidecContratPrint contrat={contrat} />
            </div>
          </div>
        )}

        {/* Info générales + tarification */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Statut & Montant */}
          <Card className="shadow-lg rounded-xl bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Shield className="w-6 h-6 text-[#F48232]" />
                Statut & Montant
              </CardTitle>
              <CardDescription className="text-gray-600">
                Statut du contrat et montant assuré
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8 space-y-4">
              <Badge
                className={`inline-block px-8 py-3 text-xl font-bold rounded-full shadow-md ${
                  contrat.statut === 'actif' 
                    ? 'bg-green-100 text-green-800' 
                    : contrat.statut === 'en_attente'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                }`}
              >
                {contrat.statut?.toUpperCase() ?? 'EN ATTENTE'}
              </Badge>
              <div className="text-[#F48232] font-extrabold text-3xl">
                {formatCurrency(montant)} FCFA
              </div>
              <div className="text-sm font-semibold text-orange-600">Montant du prêt assuré</div>
              
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
                <User className="w-6 h-6 text-orange-600" />
                Assuré principal
              </CardTitle>
              <CardDescription className="text-gray-600">Coordonnées et catégorie</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xl font-bold text-gray-900">{contrat.nom_prenom}</div>

              {/* Catégorie */}
              <div className="bg-orange-50 rounded-lg p-2">
                <div className="text-xs text-orange-600 font-medium">Catégorie</div>
                <div className="font-bold text-orange-800">
                  {getCategorieLabel(contrat.categorie)}
                  {contrat.categorie === 'autre' && contrat.autre_categorie_precision && 
                    `: ${contrat.autre_categorie_precision}`
                  }
                </div>
              </div>

              {(contrat.telephone_assure || contrat.telephone) && (
                <p className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-5 h-5" />
                  <span>{contrat.telephone_assure || contrat.telephone}</span>
                </p>
              )}

              {(contrat.email_assure || contrat.email) && (
                <p className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-5 h-5" />
                  <span>{contrat.email_assure || contrat.email}</span>
                </p>
              )}

              {(contrat.ville_assure || contrat.adresse_assure || contrat.adresse) && (
                <p className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span>
                    {contrat.ville_assure}
                    {contrat.ville_assure && (contrat.adresse_assure || contrat.adresse) ? ', ' : ''}
                    {contrat.adresse_assure || contrat.adresse}
                  </span>
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tarification & Durée */}
          <Card className="shadow-lg rounded-xl bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <DollarSign className="w-6 h-6 text-amber-600" />
                Tarification & Durée
              </CardTitle>
              <CardDescription className="text-gray-600">
                Détails financiers et contractuels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Taux appliqué */}
              <div className="p-3 rounded-lg border-2 border-dashed border-orange-300 bg-orange-50">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Taux appliqué</span>
                  <Badge className="text-base px-3 py-1 bg-[#F48232] text-white">
                    {(taux * 100).toFixed(2)}%
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Basé sur la durée de {duree} mois et la catégorie
                </p>
              </div>

              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Durée du prêt</span>
                <span className="font-semibold">{duree} mois</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Date d'effet</span>
                <span className="font-semibold">{formatDate(contrat.date_effet)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Date de fin</span>
                <span className="font-semibold">{formatDate(contrat.date_fin_echeance || contrat.date_echeance)}</span>
              </div>

              {/* Cotisation TTC */}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-800">Cotisation totale TTC</span>
                  <span className="text-xl font-bold text-[#F48232]">
                    {formatCurrency(cotisationTotale)} FCFA
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Souscripteur COFIDEC + Garanties */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Souscripteur COFIDEC */}
          <Card className="shadow-lg rounded-xl bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Building2 className="w-6 h-6 text-[#F48232]" />
                Souscripteur
              </CardTitle>
              <CardDescription className="text-gray-600">
                Établissement de Micro-Finance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4">
                <div className="text-xl font-bold text-[#F48232]">COFIDEC</div>
                <div className="text-sm text-gray-600">
                  Coopérative pour le Financement du Développement Communautaire
                </div>
              </div>
              
              {contrat.agence && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Agence</span>
                  <span className="font-semibold">{contrat.agence}</span>
                </div>
              )}
              
              <div className="text-sm text-gray-500 space-y-1">
                <p><strong>Adresse:</strong> B.P. 2.551 - Libreville</p>
                <p><strong>Téléphone:</strong> 011 49 18 17 / 074 48 25 80</p>
                <p><strong>Email:</strong> cofidecemf@gmail.com</p>
              </div>
            </CardContent>
          </Card>

          {/* Garanties souscrites */}
          <Card className="shadow-lg rounded-xl bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Shield className="w-6 h-6 text-green-600" />
                Garanties souscrites
              </CardTitle>
              <CardDescription className="text-gray-600">
                Détail des protections du contrat
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Prévoyance */}
              <div className={`p-3 rounded-lg flex justify-between items-center ${
                contrat.garantie_prevoyance ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
              }`}>
                <div>
                  <div className="font-semibold text-gray-800">Prévoyance</div>
                  <div className="text-xs text-gray-500">Max: 250 000 FCFA</div>
                </div>
                <div className="text-right">
                  <Badge className={contrat.garantie_prevoyance ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                    {contrat.garantie_prevoyance ? '✓ Souscrite' : 'Non'}
                  </Badge>
                  {contrat.garantie_prevoyance && (
                    <div className="text-sm font-bold text-green-700 mt-1">5 000 FCFA</div>
                  )}
                </div>
              </div>

              {/* Décès ou IAD */}
              <div className={`p-3 rounded-lg flex justify-between items-center ${
                (contrat.garantie_deces_iad || contrat.garantie_deces) ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
              }`}>
                <div>
                  <div className="font-semibold text-gray-800">Décès ou IAD</div>
                  <div className="text-xs text-gray-500">Taux: {(taux * 100).toFixed(2)}%</div>
                </div>
                <div className="text-right">
                  <Badge className={(contrat.garantie_deces_iad || contrat.garantie_deces) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                    {(contrat.garantie_deces_iad || contrat.garantie_deces) ? '✓ Souscrite' : 'Non'}
                  </Badge>
                  {(contrat.garantie_deces_iad || contrat.garantie_deces) && (
                    <div className="text-sm font-bold text-green-700 mt-1">
                      {formatCurrency(cotisationDeces)} FCFA
                    </div>
                  )}
                </div>
              </div>

              {/* Perte d'emploi */}
              <div className={`p-3 rounded-lg flex justify-between items-center ${
                contrat.garantie_perte_emploi ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
              }`}>
                <div>
                  <div className="font-semibold text-gray-800">Perte d'emploi/activités</div>
                  <div className="text-xs text-gray-500">Taux: 2,00%</div>
                </div>
                <div className="text-right">
                  <Badge className={contrat.garantie_perte_emploi ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                    {contrat.garantie_perte_emploi ? '✓ Souscrite' : 'Non'}
                  </Badge>
                  {contrat.garantie_perte_emploi && (
                    <div className="text-sm font-bold text-green-700 mt-1">
                      {formatCurrency(cotisationPerteEmploi)} FCFA
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grille des taux COFIDEC */}
        <Card className="shadow-lg rounded-xl bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Percent className="w-6 h-6 text-[#F48232]" />
              Grille des taux COFIDEC
            </CardTitle>
            <CardDescription className="text-gray-600">
              Taux applicables selon la durée et la catégorie
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-orange-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Cible</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase">Taux</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase">Durée</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase">Montant max</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className={contrat.categorie === 'salaries_cofidec' ? 'bg-orange-100 font-semibold' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-3">Salariés COFIDEC</td>
                    <td className="px-6 py-3 text-center font-bold text-[#F48232]">0,75%</td>
                    <td className="px-6 py-3 text-center">Durée du prêt</td>
                    <td className="px-6 py-3 text-right">20 000 000 FCFA</td>
                  </tr>
                  <tr className={duree >= 1 && duree <= 6 && contrat.categorie !== 'salaries_cofidec' ? 'bg-orange-100 font-semibold' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-3">Toutes catégories</td>
                    <td className="px-6 py-3 text-center font-bold text-[#F48232]">0,50%</td>
                    <td className="px-6 py-3 text-center">1 à 6 mois</td>
                    <td className="px-6 py-3 text-right">5 000 000 FCFA</td>
                  </tr>
                  <tr className={duree > 6 && duree <= 13 && contrat.categorie !== 'salaries_cofidec' ? 'bg-orange-100 font-semibold' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-3">Toutes catégories</td>
                    <td className="px-6 py-3 text-center font-bold text-[#F48232]">1,00%</td>
                    <td className="px-6 py-3 text-center">6 à 12(+1) mois</td>
                    <td className="px-6 py-3 text-right">10 000 000 FCFA</td>
                  </tr>
                  <tr className={duree > 13 && duree <= 24 && contrat.categorie !== 'salaries_cofidec' ? 'bg-orange-100 font-semibold' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-3">Toutes catégories</td>
                    <td className="px-6 py-3 text-center font-bold text-[#F48232]">1,75%</td>
                    <td className="px-6 py-3 text-center">12 à 24 mois</td>
                    <td className="px-6 py-3 text-right">20 000 000 FCFA</td>
                  </tr>
                  <tr className={contrat.garantie_perte_emploi ? 'bg-orange-100 font-semibold' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-3">Privé & Commerçants</td>
                    <td className="px-6 py-3 text-center font-bold text-[#F48232]">2,00%</td>
                    <td className="px-6 py-3 text-center">Max 24 mois</td>
                    <td className="px-6 py-3 text-right">20 000 000 FCFA</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Actions principales */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate(`/contrats/cofidec/${contrat.id}/edit`)}
            className="flex items-center gap-2 border-[#F48232] text-[#F48232] hover:bg-orange-50"
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
            Supprimer / Archiver
          </Button>
        </div>

        {/* Container caché pour l'impression */}
        {!showContratOfficiel && (
          <div ref={printRef} className="hidden">
            <CofidecContratPrint contrat={contrat} />
          </div>
        )}
      </div>
    </div>
  )
}
