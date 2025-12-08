import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
import { useBcegContract } from '@/hooks/useBcegContracts'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { BcegContratPrint } from './BcegContratPrint'
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
  Building2,
  Heart,
  Clock,
  Users,
  Eye,
  EyeOff,
} from 'lucide-react'

export const BcegContratDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: contrat, isLoading, isError } = useBcegContract(Number(id))
  const [showContratOfficiel, setShowContratOfficiel] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isError) {
      alert('Erreur lors du chargement du contrat')
      navigate('/contrats/bceg')
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
          <title>Contrat BCEG #${contrat?.id} - ${contrat?.nom} ${contrat?.prenom}</title>
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
        <LoadingSpinner size="lg" text="Chargement du contrat BCEG..." />
      </div>
    )
  }

  const nomComplet = `${contrat.prenom || ''} ${contrat.nom || ''}`.trim()

  // Calcul de la tranche de durée pour affichage
  const duree = contrat.duree_pret_mois || 0
  const getTrancheTaux = () => {
    if (duree <= 24) return { tranche: '≤ 24 mois', taux: '1,00%' }
    if (duree <= 36) return { tranche: '24 - 36 mois', taux: '1,50%' }
    if (duree <= 48) return { tranche: '36 - 48 mois', taux: '1,75%' }
    if (duree <= 60) return { tranche: '48 - 60 mois', taux: '2,00%' }
    return { tranche: 'N/A', taux: 'N/A' }
  }
  const { tranche, taux } = getTrancheTaux()

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => navigate('/contrats/bceg')}
          >
            <ArrowLeft className="w-5 h-5" />
            Retour à la liste
          </Button>

          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-700">
            Contrat #{contrat.id} - {nomComplet}
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
              <BcegContratPrint contrat={contrat} />
            </div>
          </div>
        )}

        {/* Info générales + tarification */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Statut & Montant */}
          <Card className="shadow-lg rounded-xl bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Shield className="w-6 h-6 text-emerald-600" />
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
              <div className="text-emerald-700 font-extrabold text-3xl">
                {formatCurrency(Number(contrat.montant_pret) || 0)}
              </div>
              <div className="text-sm font-semibold text-emerald-600">Montant du prêt</div>
              
              {/* Date d'émission */}
              <div className="pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">Date d'émission</div>
                <div className="font-semibold text-gray-800">{formatDate(contrat.created_at)}</div>
              </div>
            </CardContent>
          </Card>

          {/* Assuré Principal */}
          <Card className="shadow-lg rounded-xl bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <User className="w-6 h-6 text-teal-600" />
                Assuré principal
              </CardTitle>
              <CardDescription className="text-gray-600">Coordonnées complètes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xl font-bold text-gray-900">{nomComplet}</div>

              {/* Tranche de durée */}
              <div className="bg-teal-50 rounded-lg p-2">
                <div className="text-xs text-teal-600 font-medium">Tranche de durée</div>
                <div className="font-bold text-teal-800">
                  📅 {tranche} → Taux: {taux}
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
                    {contrat.adresse_assure}
                    {contrat.ville_assure && contrat.adresse_assure ? ', ' : ''}
                    {contrat.ville_assure}
                  </span>
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tarification & Durée */}
          <Card className="shadow-lg rounded-xl bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <DollarSign className="w-6 h-6 text-cyan-600" />
                Tarification & Durée
              </CardTitle>
              <CardDescription className="text-gray-600">
                Détails financiers et contractuels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Garanties avec badge */}
              <div className="p-3 rounded-lg border-2 border-dashed border-cyan-300 bg-cyan-50">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700">Garantie Décès/IAD</span>
                  <Badge className={`px-3 py-1 ${
                    contrat.garantie_deces_iad 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-400 text-white'
                  }`}>
                    {contrat.garantie_deces_iad ? '✓ Oui' : '✗ Non'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Garantie Prévoyance</span>
                  <Badge className={`px-3 py-1 ${
                    contrat.garantie_prevoyance 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-400 text-white'
                  }`}>
                    {contrat.garantie_prevoyance ? '✓ 10 000 FCFA' : '✗ Non'}
                  </Badge>
                </div>
              </div>

              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Durée du prêt</span>
                <span className="font-semibold">{contrat.duree_pret_mois} mois</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Date d'effet</span>
                <span className="font-semibold">{formatDate(contrat.date_effet)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Date fin échéance</span>
                <span className="font-semibold">{formatDate(contrat.date_fin_echeance)}</span>
              </div>

              {/* Cotisation TTC */}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-800">Cotisation totale TTC</span>
                  <span className="text-xl font-bold text-cyan-600">
                    {contrat.cotisation_totale_ttc 
                      ? formatCurrency(Number(contrat.cotisation_totale_ttc))
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informations Banque BCEG & Bénéficiaire Prévoyance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Souscripteur BCEG */}
          <Card className="shadow-lg rounded-xl bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Building2 className="w-6 h-6 text-blue-600" />
                Souscripteur BCEG
              </CardTitle>
              <CardDescription className="text-gray-600">
                Établissement bancaire partenaire
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="font-bold text-gray-900 text-lg">
                BANQUE POUR LE COMMERCE ET L'ENTREPRENEURIAT DU GABON
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Sigle</span>
                <span className="font-semibold">BCEG</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Adresse</span>
                <span className="font-semibold text-sm text-right max-w-[200px]">
                  Boulevard de l'Indépendance, Immeuble Concorde
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Ville</span>
                <span className="font-semibold">Libreville – Gabon</span>
              </div>
              {contrat.agence && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Agence</span>
                  <span className="font-semibold">{contrat.agence}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">N° Police</span>
                <span className="font-mono font-semibold">{contrat.numero_police || 'N/A'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Bénéficiaire Prévoyance */}
          <Card className="shadow-lg rounded-xl bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Users className="w-6 h-6 text-indigo-600" />
                Bénéficiaire Prévoyance
              </CardTitle>
              <CardDescription className="text-gray-600">
                Personne désignée en cas de sinistre
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-xl font-bold text-gray-900">
                {contrat.beneficiaire_prevoyance_nom_prenom || 'Non renseigné'}
              </div>
              {contrat.beneficiaire_prevoyance_contact && (
                <p className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-5 h-5" />
                  <span>{contrat.beneficiaire_prevoyance_contact}</span>
                </p>
              )}
              {contrat.beneficiaire_prevoyance_adresse && (
                <p className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span>{contrat.beneficiaire_prevoyance_adresse}</span>
                </p>
              )}
              
              {/* Protection forfaitaire */}
              <div className="pt-4 border-t border-gray-200">
                <div className="bg-indigo-50 rounded-lg p-3">
                  <div className="text-xs text-indigo-600 font-medium mb-1">Protection forfaitaire</div>
                  <div className="font-bold text-indigo-800 text-lg">250 000 FCFA</div>
                  <p className="text-xs text-gray-500 mt-1">
                    En cas de décès ou d'invalidité absolue et définitive
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grille des taux & Délais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Grille des taux par durée */}
          <Card className="shadow-lg rounded-xl bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Heart className="w-6 h-6 text-red-600" />
                Grille des taux Décès/IAD
              </CardTitle>
              <CardDescription className="text-gray-600">
                Taux appliqués selon la durée du prêt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg text-center ${duree <= 24 ? 'bg-emerald-100 ring-2 ring-emerald-500' : 'bg-gray-50'}`}>
                  <div className="text-2xl font-bold text-emerald-700">1,00%</div>
                  <div className="text-xs text-gray-600">≤ 24 mois</div>
                </div>
                <div className={`p-4 rounded-lg text-center ${duree > 24 && duree <= 36 ? 'bg-emerald-100 ring-2 ring-emerald-500' : 'bg-gray-50'}`}>
                  <div className="text-2xl font-bold text-emerald-700">1,50%</div>
                  <div className="text-xs text-gray-600">24 - 36 mois</div>
                </div>
                <div className={`p-4 rounded-lg text-center ${duree > 36 && duree <= 48 ? 'bg-emerald-100 ring-2 ring-emerald-500' : 'bg-gray-50'}`}>
                  <div className="text-2xl font-bold text-emerald-700">1,75%</div>
                  <div className="text-xs text-gray-600">36 - 48 mois</div>
                </div>
                <div className={`p-4 rounded-lg text-center ${duree > 48 && duree <= 60 ? 'bg-emerald-100 ring-2 ring-emerald-500' : 'bg-gray-50'}`}>
                  <div className="text-2xl font-bold text-emerald-700">2,00%</div>
                  <div className="text-xs text-gray-600">48 - 60 mois</div>
                </div>
              </div>
              <div className="mt-4 text-center text-sm text-gray-500">
                Montant max couvert: <span className="font-bold">20 000 000 FCFA</span>
              </div>
            </CardContent>
          </Card>

          {/* Délais contractuels */}
          <Card className="shadow-lg rounded-xl bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Clock className="w-6 h-6 text-orange-600" />
                Délais contractuels
              </CardTitle>
              <CardDescription className="text-gray-600">
                Délais applicables au contrat
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">{contrat.delai_couverture_maladie_mois || 6}</div>
                  <div className="text-xs text-gray-600">Mois délai maladie</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">{contrat.delai_declaration_sinistre_jours || 30}</div>
                  <div className="text-xs text-gray-600">Jours déclaration sinistre</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">{contrat.delai_declaration_deces_jours || 15}</div>
                  <div className="text-xs text-gray-600">Jours déclaration décès</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">{contrat.delai_versement_indemnite_jours || 30}</div>
                  <div className="text-xs text-gray-600">Jours versement indemnité</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions principales */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate(`/contrats/bceg/${contrat.id}/edit`)}
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
            <BcegContratPrint contrat={contrat} />
          </div>
        )}
      </div>
    </div>
  )
}
