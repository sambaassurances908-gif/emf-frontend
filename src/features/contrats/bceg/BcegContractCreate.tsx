// src/features/contrats/bceg/BcegContractCreate.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, X, Calculator, FileText, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useCreateBcegContract } from '@/hooks/useBcegContracts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { Label } from '@/components/ui/Label'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatCurrency } from '@/lib/utils'
import axios from '@/lib/axios'

interface SimulationResult {
  montant_pret: string
  duree_mois: number
  tranche_duree: string
  taux_applique: string
  cotisations: {
    deces_iad: string
    prevoyance: string
    total_ttc: string
  }
  protection_forfaitaire: string
  dans_limites: boolean
}

export const BcegContractCreate = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { mutate: createContract, isPending } = useCreateBcegContract()

  const [formData, setFormData] = useState({
    emf_id: user?.emf_id || 3, // 3 = BCEG
    montant_pret: '',
    duree_pret_mois: '',
    date_effet: '',
    nom: '',
    prenom: '',
    adresse_assure: '',
    ville_assure: '',
    telephone_assure: '',
    email_assure: '',
    beneficiaire_prevoyance_nom_prenom: '',
    beneficiaire_prevoyance_adresse: '',
    beneficiaire_prevoyance_contact: '',
    garantie_deces_iad: true,
    garantie_prevoyance: true,
    agence: '',
    numero_police: '',
    statut: 'en_attente', // ✅ Par défaut en attente
  })

  const [simulation, setSimulation] = useState<SimulationResult | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSimulation = async () => {
    if (!formData.montant_pret || !formData.duree_pret_mois) {
      alert('Veuillez renseigner le montant du prêt et la durée')
      return
    }

    setIsSimulating(true)
    try {
      const { data } = await axios.post('/bceg-emf/contrats/simulation/tarification', {
        montant_pret: parseFloat(formData.montant_pret),
        duree_mois: parseInt(formData.duree_pret_mois)
      })

      setSimulation(data.simulation)
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Erreur lors de la simulation')
    } finally {
      setIsSimulating(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.montant_pret || parseFloat(formData.montant_pret) <= 0) {
      newErrors.montant_pret = 'Le montant du prêt est requis'
    }
    if (parseFloat(formData.montant_pret) > 20000000) {
      newErrors.montant_pret = 'Le montant ne peut pas dépasser 20 000 000 FCFA'
    }
    if (!formData.duree_pret_mois || parseInt(formData.duree_pret_mois) <= 0) {
      newErrors.duree_pret_mois = 'La durée du prêt est requise'
    }
    if (parseInt(formData.duree_pret_mois) > 60) {
      newErrors.duree_pret_mois = 'La durée ne peut pas dépasser 60 mois'
    }
    if (!formData.date_effet) {
      newErrors.date_effet = 'La date d\'effet est requise'
    }
    if (!formData.nom) {
      newErrors.nom = 'Le nom est requis'
    }
    if (!formData.prenom) {
      newErrors.prenom = 'Le prénom est requis'
    }
    if (!formData.adresse_assure) {
      newErrors.adresse_assure = 'L\'adresse est requise'
    }
    if (!formData.ville_assure) {
      newErrors.ville_assure = 'La ville est requise'
    }
    if (!formData.telephone_assure) {
      newErrors.telephone_assure = 'Le téléphone est requis'
    }
    if (!formData.beneficiaire_prevoyance_nom_prenom) {
      newErrors.beneficiaire_prevoyance_nom_prenom = 'Le bénéficiaire est requis'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      alert('Veuillez corriger les erreurs dans le formulaire')
      return
    }

    const payload = {
      ...formData,
      montant_pret: parseFloat(formData.montant_pret),
      duree_pret_mois: parseInt(formData.duree_pret_mois),
      garantie_deces_iad: formData.garantie_deces_iad ? 1 : 0,
      garantie_prevoyance: formData.garantie_prevoyance ? 1 : 0,
    }

    createContract(payload, {
      onSuccess: (data) => {
        alert('Contrat BCEG créé avec succès !')
        navigate(`/contrats/bceg/${data.id}`)
      },
      onError: (error: any) => {
        const errorMessage = error?.response?.data?.message || 'Erreur lors de la création du contrat'
        const validationErrors = error?.response?.data?.errors

        if (validationErrors) {
          setErrors(validationErrors)
        }
        alert(errorMessage)
      }
    })
  }

  const handleCancel = () => {
    if (user?.emf_id === 3) {
      navigate('/contrats/bceg', { replace: true })
    } else {
      navigate('/contrats', { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-orange-600">
                Nouveau Contrat BCEG
              </h1>
              <p className="text-gray-600 mt-1">
                Création d'un contrat d'assurance emprunteur BCEG
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations du Prêt */}
          <Card className="border-2 border-orange-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-orange-900">Informations du Prêt</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="montant_pret">
                    Montant du Prêt (FCFA) *
                  </Label>
                  <Input
                    id="montant_pret"
                    name="montant_pret"
                    type="number"
                    value={formData.montant_pret}
                    onChange={handleChange}
                    placeholder="Ex: 5000000"
                    min="1"
                    max="20000000"
                    className={errors.montant_pret ? 'border-red-500' : ''}
                  />
                  {errors.montant_pret && (
                    <p className="text-xs text-red-600 mt-1">{errors.montant_pret}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Maximum: 20 000 000 FCFA</p>
                </div>

                <div>
                  <Label htmlFor="duree_pret_mois">
                    Durée du Prêt (mois) *
                  </Label>
                  <Input
                    id="duree_pret_mois"
                    name="duree_pret_mois"
                    type="number"
                    value={formData.duree_pret_mois}
                    onChange={handleChange}
                    placeholder="Ex: 36"
                    min="1"
                    max="60"
                    className={errors.duree_pret_mois ? 'border-red-500' : ''}
                  />
                  {errors.duree_pret_mois && (
                    <p className="text-xs text-red-600 mt-1">{errors.duree_pret_mois}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Maximum: 60 mois (5 ans)</p>
                </div>

                <div>
                  <Label htmlFor="date_effet">Date d'Effet *</Label>
                  <Input
                    id="date_effet"
                    name="date_effet"
                    type="date"
                    value={formData.date_effet}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={errors.date_effet ? 'border-red-500' : ''}
                  />
                  {errors.date_effet && (
                    <p className="text-xs text-red-600 mt-1">{errors.date_effet}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="agence">Agence</Label>
                  <Input
                    id="agence"
                    name="agence"
                    value={formData.agence}
                    onChange={handleChange}
                    placeholder="Ex: Agence Centrale Yaoundé"
                  />
                </div>

                <div>
                  <Label htmlFor="numero_police">Numéro de Police (optionnel)</Label>
                  <Input
                    id="numero_police"
                    name="numero_police"
                    value={formData.numero_police}
                    onChange={handleChange}
                    placeholder="Généré automatiquement si vide"
                  />
                </div>
              </div>

              {/* Bouton Simulation */}
              <div className="pt-4">
                <Button
                  type="button"
                  onClick={handleSimulation}
                  disabled={isSimulating || !formData.montant_pret || !formData.duree_pret_mois}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isSimulating ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Simulation...
                    </>
                  ) : (
                    <>
                      <Calculator className="h-4 w-4 mr-2" />
                      Simuler la Tarification
                    </>
                  )}
                </Button>
              </div>

              {/* Résultat Simulation */}
              {simulation && (
                <div className="mt-4 p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
                  <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Résultat de la Simulation
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Tranche de durée:</p>
                      <p className="font-semibold text-gray-900">{simulation.tranche_duree}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Taux appliqué:</p>
                      <p className="font-semibold text-gray-900">{simulation.taux_applique}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Cotisation Décès/IAD:</p>
                      <p className="font-semibold text-orange-700">{simulation.cotisations.deces_iad}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Cotisation Prévoyance:</p>
                      <p className="font-semibold text-orange-700">{simulation.cotisations.prevoyance}</p>
                    </div>
                    <div className="md:col-span-2 pt-2 border-t">
                      <p className="text-gray-600">Cotisation Totale TTC:</p>
                      <p className="text-2xl font-bold text-orange-600">{simulation.cotisations.total_ttc}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-gray-600">Protection Forfaitaire:</p>
                      <p className="font-semibold text-gray-900">{simulation.protection_forfaitaire}</p>
                    </div>
                    {!simulation.dans_limites && (
                      <div className="md:col-span-2 flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded">
                        <AlertCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          Attention: Le montant ou la durée dépasse les limites de couverture
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informations de l'Assuré */}
          <Card className="border-2 border-orange-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-orange-900">Informations de l'Assuré</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nom">Nom *</Label>
                  <Input
                    id="nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    placeholder="Nom de famille"
                    className={errors.nom ? 'border-red-500' : ''}
                  />
                  {errors.nom && (
                    <p className="text-xs text-red-600 mt-1">{errors.nom}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="prenom">Prénom *</Label>
                  <Input
                    id="prenom"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    placeholder="Prénom(s)"
                    className={errors.prenom ? 'border-red-500' : ''}
                  />
                  {errors.prenom && (
                    <p className="text-xs text-red-600 mt-1">{errors.prenom}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="adresse_assure">Adresse Complète *</Label>
                <Input
                  id="adresse_assure"
                  name="adresse_assure"
                  value={formData.adresse_assure}
                  onChange={handleChange}
                  placeholder="Adresse complète de résidence"
                  className={errors.adresse_assure ? 'border-red-500' : ''}
                />
                {errors.adresse_assure && (
                  <p className="text-xs text-red-600 mt-1">{errors.adresse_assure}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="ville_assure">Ville *</Label>
                  <Input
                    id="ville_assure"
                    name="ville_assure"
                    value={formData.ville_assure}
                    onChange={handleChange}
                    placeholder="Ville de résidence"
                    className={errors.ville_assure ? 'border-red-500' : ''}
                  />
                  {errors.ville_assure && (
                    <p className="text-xs text-red-600 mt-1">{errors.ville_assure}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="telephone_assure">Téléphone *</Label>
                  <Input
                    id="telephone_assure"
                    name="telephone_assure"
                    value={formData.telephone_assure}
                    onChange={handleChange}
                    placeholder="+237 6XX XX XX XX"
                    className={errors.telephone_assure ? 'border-red-500' : ''}
                  />
                  {errors.telephone_assure && (
                    <p className="text-xs text-red-600 mt-1">{errors.telephone_assure}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email_assure">Email</Label>
                  <Input
                    id="email_assure"
                    name="email_assure"
                    type="email"
                    value={formData.email_assure}
                    onChange={handleChange}
                    placeholder="email@exemple.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bénéficiaire Prévoyance */}
          <Card className="border-2 border-orange-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-orange-900">Bénéficiaire Prévoyance</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label htmlFor="beneficiaire_prevoyance_nom_prenom">
                  Nom et Prénom du Bénéficiaire *
                </Label>
                <Input
                  id="beneficiaire_prevoyance_nom_prenom"
                  name="beneficiaire_prevoyance_nom_prenom"
                  value={formData.beneficiaire_prevoyance_nom_prenom}
                  onChange={handleChange}
                  placeholder="Nom complet du bénéficiaire"
                  className={errors.beneficiaire_prevoyance_nom_prenom ? 'border-red-500' : ''}
                />
                {errors.beneficiaire_prevoyance_nom_prenom && (
                  <p className="text-xs text-red-600 mt-1">{errors.beneficiaire_prevoyance_nom_prenom}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="beneficiaire_prevoyance_adresse">Adresse</Label>
                  <Input
                    id="beneficiaire_prevoyance_adresse"
                    name="beneficiaire_prevoyance_adresse"
                    value={formData.beneficiaire_prevoyance_adresse}
                    onChange={handleChange}
                    placeholder="Adresse du bénéficiaire"
                  />
                </div>

                <div>
                  <Label htmlFor="beneficiaire_prevoyance_contact">Contact</Label>
                  <Input
                    id="beneficiaire_prevoyance_contact"
                    name="beneficiaire_prevoyance_contact"
                    value={formData.beneficiaire_prevoyance_contact}
                    onChange={handleChange}
                    placeholder="Téléphone du bénéficiaire"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Garanties */}
          <Card className="border-2 border-orange-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-orange-900">Garanties</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Checkbox
                    id="garantie_deces_iad"
                    name="garantie_deces_iad"
                    checked={formData.garantie_deces_iad}
                    onChange={handleChange}
                  />
                  <div className="flex-1">
                    <Label htmlFor="garantie_deces_iad" className="font-semibold cursor-pointer">
                      Garantie Décès / Invalidité Absolue et Définitive (IAD)
                    </Label>
                    <p className="text-xs text-gray-600 mt-1">
                      Couverture en cas de décès ou d'invalidité totale et permanente
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Checkbox
                    id="garantie_prevoyance"
                    name="garantie_prevoyance"
                    checked={formData.garantie_prevoyance}
                    onChange={handleChange}
                  />
                  <div className="flex-1">
                    <Label htmlFor="garantie_prevoyance" className="font-semibold cursor-pointer">
                      Garantie Prévoyance (250 000 FCFA)
                    </Label>
                    <p className="text-xs text-gray-600 mt-1">
                      Protection forfaitaire additionnelle
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700">
                <p className="font-semibold text-blue-900 mb-2">Informations Importantes:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Délai de carence maladie: 3 mois</li>
                  <li>Délai de déclaration de sinistre: 180 jours</li>
                  <li>Montant maximum de couverture: 20 000 000 FCFA</li>
                  <li>Durée maximale: 60 mois (5 ans)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Boutons d'action */}
          <div className="flex gap-4 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isPending}
              className="min-w-[120px]"
            >
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-orange-600 hover:bg-orange-700 min-w-[120px]"
            >
              {isPending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Création...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Créer le Contrat
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
