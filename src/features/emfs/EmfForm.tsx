import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ArrowLeft, Save } from 'lucide-react';
import { emfService } from '@/services/emf.service';
import toast from 'react-hot-toast';

const emfSchema = z.object({
  raison_sociale: z.string().min(2, 'Raison sociale requise'),
  sigle: z.string().min(2, 'Sigle requis'),
  type: z.enum(['emf', 'banque']),
  adresse: z.string().min(5, 'Adresse requise'),
  ville: z.string().min(2, 'Ville requise'),
  telephone: z.string().min(8, 'Téléphone requis'),
  email: z.string().email('Email invalide'),
  statut: z.enum(['actif', 'inactif', 'suspendu']),
  montant_max_pret: z.string().min(1, 'Montant max requis'),
  duree_max_pret_mois: z.string().min(1, 'Durée max requise'),
  taux_commission: z.string().min(1, 'Taux commission requis'),
});

type EmfFormData = z.infer<typeof emfSchema>;

interface EmfCreateData {
  raison_sociale: string;
  sigle: string;
  type: 'emf' | 'banque';
  adresse: string;
  ville: string;
  telephone: string;
  email: string;
  statut: 'actif' | 'inactif' | 'suspendu';
  montant_max_pret: number;
  duree_max_pret_mois: number;
  taux_commission: number;
}

export const EmfForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { data: emfResponse } = useQuery({
    queryKey: ['emf', id],
    queryFn: async () => {
      return await emfService.getById(Number(id));
    },
    enabled: isEdit,
  });

  const emf = emfResponse?.data;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmfFormData>({
    resolver: zodResolver(emfSchema),
    defaultValues: {
      type: 'emf',
      statut: 'actif',
    },
  });

  useEffect(() => {
    if (emf) {
      reset({
        raison_sociale: emf.raison_sociale,
        sigle: emf.sigle,
        type: emf.type,
        adresse: emf.adresse,
        ville: emf.ville,
        telephone: emf.telephone,
        email: emf.email,
        statut: emf.statut,
        montant_max_pret: emf.montant_max_pret.toString(),
        duree_max_pret_mois: emf.duree_max_pret_mois.toString(),
        taux_commission: emf.taux_commission.toString(),
      });
    }
  }, [emf, reset]);

  const createMutation = useMutation({
    mutationFn: (data: EmfCreateData) => emfService.create(data),
    onSuccess: (response) => {
      toast.success('Partenaire créé avec succès');
      navigate(`/emfs/${response.data.id}`);
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: EmfCreateData) => emfService.update(Number(id), data),
    onSuccess: (response) => {
      toast.success('Partenaire mis à jour avec succès');
      navigate(`/emfs/${response.data.id}`);
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    },
  });

  const onSubmit = (data: EmfFormData) => {
    const formattedData: EmfCreateData = {
      raison_sociale: data.raison_sociale,
      sigle: data.sigle,
      type: data.type,
      adresse: data.adresse,
      ville: data.ville,
      telephone: data.telephone,
      email: data.email,
      statut: data.statut,
      montant_max_pret: parseFloat(data.montant_max_pret),
      duree_max_pret_mois: parseInt(data.duree_max_pret_mois),
      taux_commission: parseFloat(data.taux_commission),
    };

    if (isEdit) {
      updateMutation.mutate(formattedData);
    } else {
      createMutation.mutate(formattedData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/emfs')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Modifier' : 'Nouveau'} Partenaire
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? 'Modifiez les informations' : 'Ajoutez un nouvel EMF ou banque'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informations Générales */}
        <Card>
          <CardHeader>
            <CardTitle>Informations Générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Raison Sociale"
                placeholder="Ex: COOPERATIVE POUR LE FINANCEMENT..."
                error={errors.raison_sociale?.message}
                {...register('raison_sociale')}
              />
              <Input
                label="Sigle"
                placeholder="Ex: COFIDEC, BAMBOO, BCEG..."
                error={errors.sigle?.message}
                {...register('sigle')}
              />
              <Select
                label="Type"
                options={[
                  { value: 'emf', label: 'EMF (Établissement de Microfinance)' },
                  { value: 'banque', label: 'Banque' },
                ]}
                error={errors.type?.message}
                {...register('type')}
              />
              <Select
                label="Statut"
                options={[
                  { value: 'actif', label: 'Actif' },
                  { value: 'inactif', label: 'Inactif' },
                  { value: 'suspendu', label: 'Suspendu' },
                ]}
                error={errors.statut?.message}
                {...register('statut')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Coordonnées */}
        <Card>
          <CardHeader>
            <CardTitle>Coordonnées</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Adresse"
                placeholder="Ex: B.P. 2.551"
                error={errors.adresse?.message}
                {...register('adresse')}
              />
              <Input
                label="Ville"
                placeholder="Ex: Libreville"
                error={errors.ville?.message}
                {...register('ville')}
              />
              <Input
                label="Téléphone"
                placeholder="Ex: +241 XX XX XX XX"
                error={errors.telephone?.message}
                {...register('telephone')}
              />
              <Input
                label="Email"
                type="email"
                placeholder="contact@emf.com"
                error={errors.email?.message}
                {...register('email')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Limites et Conditions */}
        <Card>
          <CardHeader>
            <CardTitle>Limites et Conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Montant Maximum Prêt (FCFA)"
                type="number"
                placeholder="0"
                error={errors.montant_max_pret?.message}
                {...register('montant_max_pret')}
              />
              <Input
                label="Durée Maximum Prêt (mois)"
                type="number"
                placeholder="0"
                error={errors.duree_max_pret_mois?.message}
                {...register('duree_max_pret_mois')}
              />
              <Input
                label="Taux Commission (%)"
                type="number"
                step="0.01"
                placeholder="0.00"
                error={errors.taux_commission?.message}
                {...register('taux_commission')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/emfs')}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            isLoading={createMutation.isPending || updateMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {isEdit ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </form>
    </div>
  );
};
