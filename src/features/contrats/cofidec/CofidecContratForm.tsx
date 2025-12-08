import { useState } from 'react';
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
import { ArrowLeft, Calculator, Save, Info } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';
import { contratService } from '@/services/contrat.service';
import { emfService } from '@/services/emf.service';
import toast from 'react-hot-toast';

const cofidecSchema = z.object({
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
  type_contrat_travail: z.string(),
  garantie_perte_emploi: z.boolean(),
  agence: z.string().optional(),
});

type CofidecFormData = z.infer<typeof cofidecSchema>;

interface CofidecCreateData {
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
  categorie: string;
  avec_perte_emploi: boolean;
}

interface SimulationResult {
  tranche_duree: string;
  taux_applique: string;
  montant_max_couverture: string;
  cotisations: {
    total_ttc: string;
  };
}

interface Emf {
  id: number;
  raison_sociale: string;
  ville: string;
}

export const CofidecContratForm = () => {
  const navigate = useNavigate();
  const [showSimulation, setShowSimulation] = useState(false);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);

  const { data: emfsResponse } = useQuery({
    queryKey: ['emfs', 'cofidec'],
    queryFn: async () => {
      return await emfService.getAll({ type: 'emf', sigle: 'COFIDEC' });
    },
  });

  const emfs = emfsResponse?.data;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CofidecFormData>({
    resolver: zodResolver(cofidecSchema),
    defaultValues: {
      garantie_perte_emploi: false,
      type_contrat_travail: 'non_applicable',
    },
  });

  const montant = watch('montant_pret_assure');
  const duree = watch('duree_pret_mois');
  const categorie = watch('categorie');
  const garantiePerteEmploi = watch('garantie_perte_emploi');

  const createMutation = useMutation({
    mutationFn: (data: CofidecCreateData) => contratService.cofidec.create(data),
    onSuccess: (response) => {
      toast.success('Contrat COFIDEC créé avec succès');
      navigate(`/contrats/${response.data.id}`);
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    },
  });

  const simulateMutation = useMutation({
    mutationFn: (data: SimulationData) => contratService.cofidec.simuler(data),
    onSuccess: (response) => {
      setSimulation(response.data.simulation);
      setShowSimulation(true);
    },
  });

  const handleSimulate = () => {
    if (!montant || !duree || !categorie) {
      toast.error('Veuillez renseigner le montant, la durée et la catégorie');
      return;
    }

    const simulationData: SimulationData = {
      montant_pret: parseFloat(montant),
      duree_mois: parseInt(duree),
      categorie: categorie,
      avec_perte_emploi: garantiePerteEmploi,
    };

    simulateMutation.mutate(simulationData);
  };

  const onSubmit = (data: CofidecFormData) => {
    const formattedData: CofidecCreateData = {
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
      type_contrat_travail: data.type_contrat_travail,
      garantie_perte_emploi: data.garantie_perte_emploi,
      garantie_prevoyance_deces_iad: true,
      garantie_deces_iad: true,
      garantie_prevoyance: true,
      agence: data.agence,
    };

    createMutation.mutate(formattedData);
  };

  // Calculer la tranche de durée
  const getTranche = (duree: string) => {
    const d = parseInt(duree);
    if (categorie === 'salarie_cofidec') return 'Salarié COFIDEC (0.75%)';
    if (d >= 1 && d <= 6) return '1-6 mois (0.50%)';
    if (d > 6 && d <= 12) return '6-12 mois (1.00%)';
    if (d > 12 && d <= 24) return '12-24 mois (1.75%)';
    return '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/contrats')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Nouveau Contrat COFIDEC
          </h1>
          <p className="text-gray-600 mt-1">
            Contrat prévoyance crédits avec tarification progressive
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <p className="font-semibold mb-1">Tarification COFIDEC</p>
          <ul className="space-y-1 text-blue-700">
            <li>• Salarié COFIDEC: 0.75% (max 20M FCFA)</li>
            <li>• 1-6 mois: 0.50% (max 1M FCFA)</li>
            <li>• 6-12 mois: 1.00% (max 5M FCFA)</li>
            <li>• 12-24 mois: 1.75% (max 20M FCFA)</li>
          </ul>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* EMF Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Sélection EMF</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              label="EMF COFIDEC"
              options={
                emfs?.map((emf: Emf) => ({
                  value: emf.id.toString(),
                  label: `${emf.raison_sociale} - ${emf.ville}`,
                })) || []
              }
              error={errors.emf_id?.message}
              {...register('emf_id')}
            />
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
                label="Durée (mois - max 24)"
                type="number"
                placeholder="0"
                max="24"
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

            {/* Tranche indicator */}
            {duree && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Tranche applicable:</p>
                <p className="font-semibold text-gray-900">{getTranche(duree)}</p>
              </div>
            )}

            {/* Simulation Results */}
            {showSimulation && simulation && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-3">
                  Résultat de la Simulation
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-green-700">Tranche</p>
                    <p className="font-semibold text-green-900">
                      {simulation.tranche_duree}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700">Taux</p>
                    <p className="font-semibold text-green-900">
                      {simulation.taux_applique}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700">Montant max</p>
                    <p className="font-semibold text-green-900">
                      {simulation.montant_max_couverture}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700">Total TTC</p>
                    <p className="font-semibold text-green-900">
                      {simulation.cotisations.total_ttc}
                    </p>
                  </div>
                </div>
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
                options={[
                  ...CATEGORIES,
                  { value: 'salarie_cofidec', label: 'Salarié COFIDEC (tarif préférentiel)' },
                ]}
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
                  { value: 'cdd_plus_9_mois', label: 'CDD &gt; 9 mois' },
                  { value: 'cdd_moins_9_mois', label: 'CDD &lt; 9 mois' },
                ]}
                error={errors.type_contrat_travail?.message}
                {...register('type_contrat_travail')}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="garantie_perte_emploi"
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                {...register('garantie_perte_emploi')}
              />
              <label htmlFor="garantie_perte_emploi" className="text-sm font-medium text-gray-700">
                Garantie Perte d&apos;Emploi (2%)
                <span className="text-xs text-gray-500 ml-2">
                  (CDI ou CDD &gt; 9 mois uniquement)
                </span>
              </label>
            </div>
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
