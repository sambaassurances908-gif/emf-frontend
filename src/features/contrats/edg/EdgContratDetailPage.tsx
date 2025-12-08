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
import { useEdgContract } from '@/hooks/useEdgContracts'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { EdgContratPrint } from '@/components/contrats/EdgContratPrint'
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
  Briefcase,
  Crown,
  Calendar,
} from 'lucide-react'

export const EdgContratDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: contrat, isLoading, isError } = useEdgContract(Number(id))
  const [showContratOfficiel, setShowContratOfficiel] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  // Debug log pour voir les données du contrat
  useEffect(() => {
    if (contrat) {
      console.log('📋 EdgContratDetailPage - Contrat chargé:', contrat)
      console.log('📋 EdgContratDetailPage - assures_associes:', contrat.assures_associes)
      console.log('📋 EdgContratDetailPage - Toutes les clés:', Object.keys(contrat))
    }
  }, [contrat])

  useEffect(() => {
    if (isError) {
      alert('Erreur lors du chargement du contrat')
      navigate('/contrats/edg')
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
          <title>Contrat EDG #${contrat?.id} - ${contrat?.nom_prenom}</title>
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50">
        <LoadingSpinner size="lg" text="Chargement du contrat EDG..." />
      </div>
    )
  }

  // Déterminer si VIP
  const isVIP = contrat.is_vip || (contrat.montant_pret_assure && contrat.montant_pret_assure > 25000000)
  const tauxDecesIAD = isVIP ? 3.50 : 2.50

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => navigate('/contrats/edg')}
          >
            <ArrowLeft className="w-5 h-5" />
            Retour à la liste
          </Button>

          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-700">
              Contrat #{contrat.id} - {contrat.nom_prenom}
            </h1>
            {isVIP && (
              <Badge className="bg-purple-600 text-white px-3 py-1 flex items-center gap-1">
                <Crown className="w-4 h-4" />
                VIP
              </Badge>
            )}
          </div>

          <div className="flex gap-3">
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
              <span className="hidden sm:inline">{showContratOfficiel ? 'Masquer' : 'Voir contrat'}</span>
            </Button>
            <Button
              size="lg"
              className="flex items-center gap-2 bg-[#F48232] hover:bg-[#e0742a] text-white shadow-lg"
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
                className="bg-[#F48232] hover:bg-[#e0742a] text-white"
                onClick={handlePrint}
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimer
              </Button>
            </div>
            <div ref={printRef} className="overflow-auto max-h-[800px] rounded-lg shadow-xl">
              <EdgContratPrint contrat={contrat} />
            </div>
          </div>
        )}

        {/* Info générales + tarification */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Statut & Montant */}
          <Card className="shadow-lg rounded-xl bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Shield className="w-6 h-6 text-teal-600" />
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
              <div className="text-teal-700 font-extrabold text-3xl">
                {formatCurrency(contrat.montant_pret_assure)}
              </div>
              <div className="text-sm font-semibold text-teal-600">Montant assuré</div>
              
              {/* Tier */}
              <div className="pt-4 border-t border-gray-200">
                <Badge className={`px-4 py-2 text-sm font-bold ${isVIP ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                  {isVIP ? '★ Tier VIP' : 'Tier Standard'}
                </Badge>
                <div className="text-xs text-gray-500 mt-1">
                  Taux Décès/IAD: {tauxDecesIAD.toFixed(2)}%
                </div>
              </div>
              
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
                <User className="w-6 h-6 text-cyan-600" />
                Assuré / Emprunteur
              </CardTitle>
              <CardDescription className="text-gray-600">Coordonnées complètes de l'assuré</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Nom */}
              <div className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {contrat.nom_prenom}
                {contrat.est_vip && (
                  <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
                    <Crown className="w-3 h-3" /> VIP
                  </Badge>
                )}
              </div>

              {/* Date et lieu de naissance */}
              {(contrat.date_naissance || contrat.lieu_naissance) && (
                <div className="bg-cyan-50 rounded-lg p-3">
                  <div className="text-xs text-cyan-600 font-medium mb-1">📅 Naissance</div>
                  <div className="font-bold text-cyan-800">
                    {contrat.date_naissance ? formatDate(contrat.date_naissance) : 'Date non renseignée'}
                    {contrat.lieu_naissance && ` à ${contrat.lieu_naissance}`}
                  </div>
                </div>
              )}

              {/* Catégorie socio-professionnelle */}
              <div className="bg-indigo-50 rounded-lg p-3">
                <div className="text-xs text-indigo-600 font-medium mb-1">👤 Catégorie</div>
                <div className="font-bold text-indigo-800">
                  {contrat.categorie === 'commercants' && '🛒 Commerçants'}
                  {contrat.categorie === 'salaries_public' && '🏛️ Salariés du Public'}
                  {contrat.categorie === 'salaries_prive' && '🏢 Salariés du Privé'}
                  {contrat.categorie === 'retraites' && '👴 Retraités'}
                  {contrat.categorie === 'autre' && `📋 ${contrat.autre_categorie_precision || 'Autre'}`}
                </div>
              </div>

              {/* Profession */}
              {contrat.profession && (
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <Briefcase className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="text-xs text-gray-500">Profession</div>
                    <div className="font-semibold text-gray-800">{contrat.profession}</div>
                  </div>
                </div>
              )}

              {/* Type contrat de travail */}
              {contrat.type_contrat_travail && (
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <Briefcase className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="text-xs text-gray-500">Type de contrat de travail</div>
                    <div className="font-semibold text-gray-800">
                      {contrat.type_contrat_travail === 'cdi' && 'CDI'}
                      {contrat.type_contrat_travail === 'cdd_plus_9_mois' && 'CDD > 9 mois'}
                      {contrat.type_contrat_travail === 'cdd_moins_9_mois' && 'CDD < 9 mois'}
                      {contrat.type_contrat_travail === 'non_applicable' && 'Non applicable'}
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="text-sm font-bold text-gray-700 mb-2">📞 Coordonnées</div>
                
                {/* Téléphone */}
                {(contrat.telephone_assure || contrat.telephone) && (
                  <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="text-xs text-gray-500">Téléphone</div>
                      <div className="font-semibold text-gray-800">{contrat.telephone_assure || contrat.telephone}</div>
                    </div>
                  </div>
                )}

                {/* Email */}
                {(contrat.email_assure || contrat.email) && (
                  <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="text-xs text-gray-500">Email</div>
                      <div className="font-semibold text-gray-800">{contrat.email_assure || contrat.email}</div>
                    </div>
                  </div>
                )}

                {/* Adresse */}
                {(contrat.adresse_assure || contrat.adresse) && (
                  <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-red-500" />
                    <div>
                      <div className="text-xs text-gray-500">Adresse</div>
                      <div className="font-semibold text-gray-800">
                        {contrat.adresse_assure || contrat.adresse}
                        {contrat.ville_assure && `, ${contrat.ville_assure}`}
                      </div>
                    </div>
                  </div>
                )}

                {/* Ville seule si pas d'adresse */}
                {!contrat.adresse_assure && !contrat.adresse && contrat.ville_assure && (
                  <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-red-500" />
                    <div>
                      <div className="text-xs text-gray-500">Ville</div>
                      <div className="font-semibold text-gray-800">{contrat.ville_assure}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bénéficiaire décès */}
              {contrat.beneficiaire_deces && (
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="bg-orange-50 rounded-lg p-3">
                    <div className="text-xs text-orange-600 font-medium mb-1">🎯 Bénéficiaire en cas de décès</div>
                    <div className="font-bold text-orange-800">{contrat.beneficiaire_deces}</div>
                  </div>
                </div>
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
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Durée du prêt</span>
                <span className="font-semibold">{contrat.duree_mois} mois</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Date d'effet</span>
                <span className="font-semibold">{formatDate(contrat.date_effet)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Date d'échéance</span>
                <span className="font-semibold">{formatDate(contrat.date_echeance)}</span>
              </div>

              {/* Garanties */}
              <div className="pt-3 border-t border-gray-200 space-y-2">
                <div className="text-sm font-bold text-gray-700">Garanties souscrites</div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-green-100 text-green-800">Prévoyance Décès</Badge>
                  {contrat.garantie_deces && (
                    <Badge className="bg-teal-100 text-teal-800">Décès/IAD</Badge>
                  )}
                  {contrat.garantie_ipt && (
                    <Badge className="bg-blue-100 text-blue-800">IPT</Badge>
                  )}
                  {contrat.garantie_itt && (
                    <Badge className="bg-indigo-100 text-indigo-800">ITT</Badge>
                  )}
                  {contrat.garantie_perte_emploi && (
                    <Badge className="bg-orange-100 text-orange-800">Perte d'emploi</Badge>
                  )}
                </div>
              </div>

              {/* Prime */}
              {contrat.prime_mensuelle && (
                <div className="flex justify-between pt-2">
                  <span className="font-medium text-gray-700">Prime mensuelle</span>
                  <span className="font-semibold text-pink-600">
                    {formatCurrency(Number(contrat.prime_mensuelle))}
                  </span>
                </div>
              )}

              {/* Cotisation TTC */}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-800">Cotisation totale TTC</span>
                  <span className="text-xl font-bold text-pink-600">
                    {contrat.cotisation_totale_ttc 
                      ? formatCurrency(Number(contrat.cotisation_totale_ttc))
                      : contrat.prime_totale
                        ? formatCurrency(Number(contrat.prime_totale))
                        : 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Observations */}
        {contrat.observations && (
          <Card className="rounded-xl shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold">📝 Observations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{contrat.observations}</p>
            </CardContent>
          </Card>
        )}

        {/* Assurés Associés */}
        {contrat.assures_associes && contrat.assures_associes.length > 0 && (
          <Card className="rounded-xl shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Users className="w-6 h-6 text-purple-600" />
                Assurés Associés
              </CardTitle>
              <CardDescription className="text-gray-600">
                {contrat.assures_associes.length} assuré(s) associé(s) au contrat
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contrat.assures_associes.map((assure, index) => (
                  <div 
                    key={assure.id || `assure-${index}`}
                    className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">
                          {assure.nom_complet || `${assure.prenom} ${assure.nom}`}
                        </div>
                        <div className="text-xs text-purple-600 font-medium">
                          Assuré #{index + 1}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      {(assure.date_naissance || assure.lieu_naissance) && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4 text-purple-500" />
                          <span>
                            {assure.date_naissance ? formatDate(assure.date_naissance) : ''} 
                            {assure.lieu_naissance ? ` à ${assure.lieu_naissance}` : ''}
                          </span>
                        </div>
                      )}
                      
                      {assure.contact && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4 text-purple-500" />
                          <span>{assure.contact}</span>
                        </div>
                      )}
                      
                      {assure.adresse && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4 text-purple-500" />
                          <span>{assure.adresse}</span>
                        </div>
                      )}

                      {assure.age && (
                        <div className="text-xs text-purple-600 font-medium mt-2">
                          Âge: {assure.age} ans
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions principales */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate(`/contrats/edg/${contrat.id}/edit`)}
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
            <EdgContratPrint contrat={contrat} />
          </div>
        )}
      </div>
    </div>
  )
}
