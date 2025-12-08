// src/features/sinistres/cofidec/CofidecSinistreDeclarationForm.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Upload, X } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useCofidecContratsForSinistre, useCreateCofidecSinistre } from '@/hooks/useCofidecSinistres'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { SinistreType } from '@/types/sinistre.types'

export const CofidecSinistreDeclarationForm = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const emfId = user?.emf_id || 1

  const { data: contrats, isLoading: loadingContrats } = useCofidecContratsForSinistre(emfId)
  const { mutate: createSinistre, isPending } = useCreateCofidecSinistre()

  const [formData, setFormData] = useState({
    contrat_id: '',
    type_sinistre: '' as SinistreType | '',
    date_survenance: '',
    description: '',
  })

  const [documents, setDocuments] = useState<File[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocuments([...documents, ...Array.from(e.target.files)])
    }
  }

  const removeFile = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.contrat_id || !formData.type_sinistre || !formData.date_survenance) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    createSinistre(
      {
        contrat_id: parseInt(formData.contrat_id),
        type_sinistre: formData.type_sinistre as SinistreType,
        date_survenance: formData.date_survenance,
        description: formData.description,
        documents,
      },
      {
        onSuccess: () => {
          alert('Sinistre déclaré avec succès')
          navigate('/sinistres')
        },
        onError: (error: any) => {
          alert(error?.response?.data?.message || 'Erreur lors de la déclaration')
        },
      },
    )
  }

  if (loadingContrats) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <LoadingSpinner size="lg" text="Chargement..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-green-600 flex items-center gap-2">
            <AlertCircle className="h-8 w-8" />
            Déclaration de Sinistre COFIDEC
          </h1>
          <p className="text-gray-600 mt-2">
            Remplissez ce formulaire pour déclarer un sinistre sur un contrat COFIDEC.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informations du sinistre</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Sélection du contrat */}
              <div>
                <Label htmlFor="contrat">Contrat concerné *</Label>
                <Select
                  id="contrat"
                  value={formData.contrat_id}
                  onChange={(e) =>
                    setFormData({ ...formData, contrat_id: e.target.value })
                  }
                  required
                >
                  <option value="">-- Sélectionnez un contrat --</option>
                  {contrats?.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.numero_police} - {c.nom_prenom}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Type de sinistre */}
              <div>
                <Label htmlFor="type_sinistre">Type de sinistre *</Label>
                <Select
                  id="type_sinistre"
                  value={formData.type_sinistre}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type_sinistre: e.target.value as SinistreType,
                    })
                  }
                  required
                >
                  <option value="">-- Sélectionnez un type --</option>
                  <option value="deces">Décès</option>
                  <option value="iad">Invalidité Absolue et Définitive</option>
                  <option value="perte_emploi">Perte d'emploi</option>
                  <option value="autre">Autre</option>
                </Select>
              </div>

              {/* Date de survenance */}
              <div>
                <Label htmlFor="date_survenance">Date de survenance *</Label>
                <Input
                  id="date_survenance"
                  type="date"
                  value={formData.date_survenance}
                  onChange={(e) =>
                    setFormData({ ...formData, date_survenance: e.target.value })
                  }
                  required
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description détaillée</Label>
                <Textarea
                  id="description"
                  rows={5}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Décrivez les circonstances du sinistre..."
                />
              </div>

              {/* Upload de documents */}
              <div>
                <Label htmlFor="documents">Documents justificatifs</Label>
                <div className="mt-2 space-y-2">
                  <Input
                    id="documents"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  {documents.length > 0 && (
                    <div className="space-y-2">
                      {documents.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-green-50 p-2 rounded"
                        >
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Boutons */}
              <div className="flex gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/sinistres')}
                  disabled={isPending}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isPending}
                >
                  {isPending ? 'Envoi...' : 'Déclarer le sinistre'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
