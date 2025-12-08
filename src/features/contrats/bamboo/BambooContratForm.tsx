import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ArrowLeft, Calculator, Save, Building2 } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';
import { contratService } from '@/services/contrat.service';
import { emfService } from '@/services/emf.service';
import toast from 'react-hot-toast';

const bambooSchema = z.object({
  emf_id: z.string().min(1, 'EMF requis'),
  montant_pret_assure: z.string().min(1, 'Montant requis'),
  duree_pret_mois: z.string().min(1, 'Durée requise'),
  date_effet: z.string().min(1, 'Date d\'effet requise'),
  nom_prenom: z.string().min(2, 'Nom complet requis'),
  adresse_assure: z.string().min(5, 'Adresse requise'),
  ville_assure: z.string().min(2, 'Ville requise'),
  telephone_assure: z.string().min(8, 'Téléphone requis'),
  email_assure: z.string().email('Email invalide').optional().or(z.literal('')),
  categorie: z.string().min(1, 'Catégorie requise'),
  autre_categorie_precision: z.string().optional(),
  beneficiaire_prevoyance: z.string().min(2, 'Bénéficiaire requis'),
  type_contrat_travail: z.string(),
  garantie_perte_emploi: z.boolean(),
  agence: z.string().optional(),
});

type BambooFormData = z.infer<typeof bambooSchema>;

interface BambooCreateData {
  emf_id: number;
  montant_pret_assure: number;
  duree_pret_mois: number;
  date_effet: string;
  nom_prenom: string;
  adresse_assure: string;
  ville_assure: string;
  telephone_assure: string;
  email_assure?: string;
  categorie: string;
  autre_categorie_precision?: string;
  beneficiaire_prevoyance: string;
  type_contrat_travail: string;
  garantie_perte_emploi: boolean;
  garantie_prevoyance_deces_iad: boolean;
  garantie_deces_iad: boolean;
  garantie_prevoyance: boolean;
  agence?: string;
}

interface SimulationData {
  montant_pret: number;
  duree_mois: number;
  avec_perte_emploi: boolean;
}

interface SimulationResult {
  montant_max: string;
  duree_max: string;
  cotisations: {
    prevoyance: string;
    total_ttc: string;
  };
  dans_limites: boolean;
}

interface Emf {
  id: number;
  raison_sociale: string;
  sigle: string;
  ville: string;
}

export const BambooContratForm = () => {
  const navigate = useNavigate();
  const [showSimulation, setShowSimulation] = useState(false);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);

  // Récupérer les EMF BAMBOO
  const { data: emfsResponse } = useQuery({
    queryKey: ['emfs', 'bamboo'],
    queryFn: async () => {
      return await emfService.getAll({ type: 'emf', sigle: 'BAMBOO' });
    },
  });

  const emfs = emfsResponse?.data;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BambooFormData>({
    resolver: zodResolver(bambooSchema),
    defaultValues: {
      garantie_perte_emploi: false,
      type_contrat_travail: 'non_applicable',
    },
  });

  // Présélectionner automatiquement le premier EMF BAMBOO
  useEffect(() => {
    if (emfs && emfs.length > 0) {
      const bambooEmf = emfs.find((emf: Emf) => 
        emf.sigle.toUpperCase().includes('BAMBOO')
      ) || emfs[0];
      
      setValue('emf_id', bambooEmf.id.toString());
    }
  }, [emfs, setValue]);

  const montant = watch('montant_pret_assure');
  const duree = watch('duree_pret_mois');
  const categorie = watch('categorie');
  const garantiePerteEmploi = watch('garantie_perte_emploi');

  const createMutation = useMutation({
    mutationFn: (data: BambooCreateData) => contratService.bamboo.create(data),
    onSuccess: (response) => {
      toast.success('Contrat BAMBOO créé avec succès');
      navigate(`/contrats/${response.data.id}`);
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    },
  });

  const simulateMutation = useMutation({
    mutationFn: (data: SimulationData) => contratService.bamboo.simuler(data),
    onSuccess: (response) => {
      setSimulation(response.data.simulation);
      setShowSimulation(true);
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Erreur de simulation');
    },
  });

  const handleSimulate = () => {
    if (!montant || !duree) {
      toast.error('Veuillez renseigner le montant et la durée');
      return;
    }

    const simulationData: SimulationData = {
      montant_pret: parseFloat(montant),
      duree_mois: parseInt(duree),
      avec_perte_emploi: garantiePerteEmploi,
    };

    simulateMutation.mutate(simulationData);
  };

  const onSubmit = (data: BambooFormData) => {
    const formattedData: BambooCreateData = {
      emf_id: parseInt(data.emf_id),
      montant_pret_assure: parseFloat(data.montant_pret_assure),
      duree_pret_mois: parseInt(data.duree_pret_mois),
      date_effet: data.date_effet,
      nom_prenom: data.nom_prenom,
      adresse_assure: data.adresse_assure,
      ville_assure: data.ville_assure,
      telephone_assure: data.telephone_assure,
      email_assure: data.email_assure,
      categorie: data.categorie,
      autre_categorie_precision: data.autre_categorie_precision,
      beneficiaire_prevoyance: data.beneficiaire_prevoyance,
      type_contrat_travail: data.type_contrat_travail,
      garantie_perte_emploi: data.garantie_perte_emploi,
      garantie_prevoyance_deces_iad: true,
      garantie_deces_iad: true,
      garantie_prevoyance: true,
      agence: data.agence,
    };

    createMutation.mutate(formattedData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button type="button" variant="ghost" onClick={() => navigate('/contrats')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Nouveau Contrat BAMBOO EMF
          </h1>
          <p className="text-gray-600 mt-1">
            Contrat collectif de micro-assurance
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* EMF Selection - Version élégante avec badge */}
        <Card>
          <CardHeader>
            <CardTitle>Sélection EMF</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-blue-900 text-lg">
                    {emfs && emfs.length > 0
                      ? emfs[0].raison_sociale
                      : 'BAMBOO EMF'}
                  </h3>
                  <span className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded">
                    Par défaut
                  </span>
                </div>
                <p className="text-sm text-blue-700">
                  {emfs && emfs.length > 0 ? emfs[0].ville : 'Gabon'}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Contrat collectif de micro-assurance
                </p>
              </div>
              <div className="text-blue-600">
                <Building2 className="h-10 w-10" />
              </div>
            </div>
            {/* Champ caché pour la soumission */}
            <input type="hidden" {...register('emf_id')} />
          </CardContent>
        </Card>

        {/* Informations du Prêt */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Informations du Prêt</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSimulate}
                disabled={simulateMutation.isPending}
              >
                <Calculator className="h-4 w-4 mr-2" />
                Simuler
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Montant du prêt (FCFA)"
                type="number"
                placeholder="0"
                error={errors.montant_pret_assure?.message}
                {...register('montant_pret_assure')}
              />
              <Input
                label="Durée (mois)"
                type="number"
                placeholder="0"
                error={errors.duree_pret_mois?.message}
                {...register('duree_pret_mois')}
              />
              <Input
                label="Date d'effet"
                type="date"
                error={errors.date_effet?.message}
                {...register('date_effet')}
              />
            </div>

            {/* Simulation Results */}
            {showSimulation && simulation && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-3">
                  Résultat de la Simulation
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-blue-700">Montant maximum</p>
                    <p className="font-semibold text-blue-900">
                      {simulation.montant_max}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">Durée maximum</p>
                    <p className="font-semibold text-blue-900">
                      {simulation.duree_max}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">Prévoyance</p>
                    <p className="font-semibold text-blue-900">
                      {simulation.cotisations.prevoyance}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">Total TTC</p>
                    <p className="font-semibold text-blue-900">
                      {simulation.cotisations.total_ttc}
                    </p>
                  </div>
                </div>
                {!simulation.dans_limites && (
                  <p className="text-sm text-red-600 mt-2">
                    ⚠️ Le montant ou la durée dépasse les limites autorisées
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informations de l'Assuré */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de l&apos;Assuré</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nom complet"
                placeholder="Nom et prénom"
                error={errors.nom_prenom?.message}
                {...register('nom_prenom')}
              />
              <Input
                label="Téléphone"
                placeholder="+241 XX XX XX XX"
                error={errors.telephone_assure?.message}
                {...register('telephone_assure')}
              />
              <Input
                label="Email"
                type="email"
                placeholder="email@exemple.com"
                error={errors.email_assure?.message}
                {...register('email_assure')}
              />
              <Input
                label="Ville"
                placeholder="Libreville"
                error={errors.ville_assure?.message}
                {...register('ville_assure')}
              />
            </div>
            <Input
              label="Adresse complète"
              placeholder="Quartier, rue, immeuble..."
              error={errors.adresse_assure?.message}
              {...register('adresse_assure')}
            />
          </CardContent>
        </Card>

        {/* Catégorie et Garanties */}
        <Card>
          <CardHeader>
            <CardTitle>Catégorie et Garanties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Catégorie professionnelle"
                options={CATEGORIES}
                error={errors.categorie?.message}
                {...register('categorie')}
              />
              {categorie === 'autre' && (
                <Input
                  label="Précision (autre catégorie)"
                  placeholder="Précisez..."
                  error={errors.autre_categorie_precision?.message}
                  {...register('autre_categorie_precision')}
                />
              )}
              <Select
                label="Type de contrat de travail"
                options={[
                  { value: 'non_applicable', label: 'Non applicable' },
                  { value: 'cdi', label: 'CDI' },
                  { value: 'cdd_plus_9_mois', label: 'CDD > 9 mois' },
                  { value: 'cdd_moins_9_mois', label: 'CDD < 9 mois' },
                ]}
                error={errors.type_contrat_travail?.message}
                {...register('type_contrat_travail')}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="garantie_perte_emploi"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                {...register('garantie_perte_emploi')}
              />
              <label htmlFor="garantie_perte_emploi" className="text-sm font-medium text-gray-700">
                Garantie Perte d&apos;Emploi
                <span className="text-xs text-gray-500 ml-2">
                  (Réservée aux salariés du privé et commerçants en CDI)
                </span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Bénéficiaire */}
        <Card>
          <CardHeader>
            <CardTitle>Bénéficiaire de la Prévoyance</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              label="Nom du bénéficiaire"
              placeholder="Nom complet du bénéficiaire"
              error={errors.beneficiaire_prevoyance?.message}
              {...register('beneficiaire_prevoyance')}
            />
          </CardContent>
        </Card>

        {/* Agence */}
        <Card>
          <CardHeader>
            <CardTitle>Informations Complémentaires</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              label="Agence"
              placeholder="Nom de l'agence (optionnel)"
              error={errors.agence?.message}
              {...register('agence')}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/contrats')}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending}
            isLoading={createMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            Créer le Contrat
          </Button>
        </div>
      </form>
    </div>
  );
};
