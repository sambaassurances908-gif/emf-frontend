import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore } from '@/store/authStore'
import { useCreateBambooContract } from '@/hooks/useBambooContracts'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatCurrency } from '@/lib/utils'

export const BambooContractCreate = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const emfId = user?.emf_id || 2

  const [formData, setFormData] = useState({
    nom_prenom: '',
    adresse_assure: '',
    numero_police: '',
    montant_pret_assure: 1000000,
    duree_pret_mois: 12,
    date_effet: '',
    garantie_perte_emploi: false,
  })

  const { mutate: createContract, isPending } = useCreateBambooContract()

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setFormData(prev => ({ ...prev, date_effet: today }))
  }, [])

  const cotisation = formData.montant_pret_assure * 0.01

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      ...formData,
      emf_id: emfId,
    }
    createContract(payload, {
      onSuccess: (data: any) => {
        navigate(`/contrats/bamboo/${data.data.id}`)
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => navigate('/contrats/bamboo')}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>
        <h1 className="text-2xl font-bold">Nouveau contrat BAMBOO</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Assuré principal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nom & Prénom *</label>
                <Input
                  required
                  value={formData.nom_prenom}
                  onChange={e => setFormData({ ...formData, nom_prenom: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Adresse *</label>
                <Input
                  required
                  value={formData.adresse_assure}
                  onChange={e => setFormData({ ...formData, adresse_assure: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">N° Police</label>
                <Input
                  value={formData.numero_police}
                  onChange={e => setFormData({ ...formData, numero_police: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Montant du prêt (FCFA)</label>
                <Input
                  type="number"
                  value={formData.montant_pret_assure}
                  onChange={e =>
                    setFormData({ ...formData, montant_pret_assure: Number(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Durée (mois)</label>
                <Input
                  type="number"
                  value={formData.duree_pret_mois}
                  onChange={e =>
                    setFormData({ ...formData, duree_pret_mois: Number(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Date d’effet</label>
                <Input
                  type="date"
                  value={formData.date_effet}
                  onChange={e => setFormData({ ...formData, date_effet: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <span className="text-sm text-gray-700">Cotisation estimée</span>
            <Badge className="text-lg font-semibold">
              {formatCurrency(cotisation)}
            </Badge>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/contrats/bamboo')}
            disabled={isPending}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4 mr-2" />}
            Créer le contrat
          </Button>
        </div>
      </form>
    </div>
  )
}
