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

const bcegSchema = z.object({
  emf_id: z.string().min(1, 'EMF requis'),
  montant_pret: z.string().min(1, 'Montant requis'),
  duree_pret_mois: z.string().min(1, 'Durée requise'),
  date_effet: z.string().min(1, 'Date d\'effet requise'),
  nom: z.string().min(2, 'Nom requis'),
  prenom: z.string().min(2, 'Prénom requis'),
  adresse_assure: z.string().min(5, 'Adresse requise'),
  ville_assure: z.string().min(2, 'Ville requise'),
  telephone_assure: z.string().min(8, 'Téléphone requis'),
  email_assure: z.string().email('Email invalide').optional().or(z.literal('')),
  beneficiaire_prevoyance_nom_prenom: z.string().min(2, 'Bénéficiaire requis'),
  beneficiaire_prevoyance_adresse: z.string().optional(),
  beneficiaire_prevoyance_telephone: z.string().optional(),
  categorie: z.string().min(1, 'Catégorie requise'),
  autre_categorie_precision: z.string().optional(),
  type_contrat_travail: z.string(),
  garantie_perte_emploi: z.boolean(),
  agence: z.string().optional(),
});

type BcegFormData = z.infer<typeof bcegSchema>;

interface BcegCreateData {
  emf_id: number;
  montant_pret: number;
  duree_pret_mois: number;
  date_effet: string;
  nom: string;
  prenom: string;
  adresse_assure: string;
  ville_assure: string;
  telephone_assure: string;
  email_assure?: string;
  beneficiaire_prevoyance_nom_prenom: string;
  beneficiaire_prevoyance_adresse?: string;
  beneficiaire_prevoyance_telephone?: string;
  categorie: string;
  autre_categorie_precision?: string;
  type_contrat_travail: string;
  garantie_perte_emploi: boolean;
  garantie_prevoyance: boolean;
  garantie_deces_iad: boolean;
  agence?: string;
}

interface SimulationData {
  montant_pret: number;
  duree_mois: number;
  categorie: string;
  avec_perte_emploi: boolean;
}

interface SimulationResult {
  categorie: string;
  montant_max: string;
  cotisations: {
    total_ttc: string;
    prevoyance: string;
    deces_iad: string;
  };
  capital_prevoyance: string;
  capital_deces: string;
}

interface Emf {
  id: number;
  raison_sociale: string;
  ville: string;
}

export const BcegContratForm = () => {
  const navigate = useNavigate();
  const [showSimulation, setShowSimulation] = useState(false);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);

  const { data: emfsResponse } = useQuery({
    queryKey: ['emfs', 'bceg'],
    queryFn: async () => {
      return await emfService.getAll({ type: 'banque', sigle: 'BCEG' });
    },
  });

  const emfs = emfsResponse?.data;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BcegFormData>({
    resolver: zodResolver(bcegSchema),
    defaultValues: {
      garantie_perte_emploi: false,
      type_contrat_travail: 'non_applicable',
    },
  });

  const montant = watch('montant_pret');
  const duree = watch('duree_pret_mois');
  const categorie = watch('categorie');
  const garantiePerteEmploi = watch('garantie_perte_emploi');

  const createMutation = useMutation({
    mutationFn: (data: BcegCreateData) => contratService.bceg.create(data),
    onSuccess: (response) => {
      toast.success('Contrat BCEG créé avec succès');
      navigate(`/contrats/${response.data.id}`);
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    },
  });

  const simulateMutation = useMutation({
    mutationFn: (data: SimulationData) => contratService.bceg.simuler(data),
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

  const onSubmit = (data: BcegFormData) => {
    const formattedData: BcegCreateData = {
      emf_id: parseInt(data.emf_id),
      montant_pret: parseFloat(data.montant_pret),
      duree_pret_mois: parseInt(data.duree_pret_mois),
      date_effet: data.date_effet,
      nom: data.nom,
      prenom: data.prenom,
      adresse_assure: data.adresse_assure,
      ville_assure: data.ville_assure,
      telephone_assure: data.telephone_assure,
      email_assure: data.email_assure,
      beneficiaire_prevoyance_nom_prenom: data.beneficiaire_prevoyance_nom_prenom,
      beneficiaire_prevoyance_adresse: data.beneficiaire_prevoyance_adresse,
      beneficiaire_prevoyance_telephone: data.beneficiaire_prevoyance_telephone,
      categorie: data.categorie,
      autre_categorie_precision: data.autre_categorie_precision,
      type_contrat_travail: data.type_contrat_travail,
      garantie_perte_emploi: data.garantie_perte_emploi,
      garantie_prevoyance: true,
      garantie_deces_iad: true,
      agence: data.agence,
    };

    createMutation.mutate(formattedData);
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
            Nouveau Contrat BCEG
          </h1>
          <p className="text-gray-600 mt-1">
            Contrat prévoyance crédits bancaires
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-purple-900">
          <p className="font-semibold mb-1">Garanties BCEG</p>
          <ul className="space-y-1 text-purple-700">
            <li>• Prévoyance: 200 000 FCFA par assuré</li>
            <li>• Décès & IAD: Montant du prêt (max 100M FCFA)</li>
            <li>• Durée maximale: 240 mois (20 ans)</li>
            <li>• Garantie perte d&apos;emploi: 2% (optionnelle)</li>
          </ul>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* EMF Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Sélection Banque</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              label="Agence BCEG"
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
                error={errors.montant_pret?.message}
                {...register('montant_pret')}
              />
              <Input
                label="Durée (mois - max 240)"
                type="number"
                placeholder="0"
                max="240"
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
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-3">
                  Résultat de la Simulation
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-purple-700">Catégorie</p>
                    <p className="font-semibold text-purple-900">
                      {simulation.categorie}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-purple-700">Montant max</p>
                    <p className="font-semibold text-purple-900">
                      {simulation.montant_max}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-purple-700">Capital prévoyance</p>
                    <p className="font-semibold text-purple-900">
                      {simulation.capital_prevoyance}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-purple-700">Total TTC</p>
                    <p className="font-semibold text-purple-900">
                      {simulation.cotisations.total_ttc}
                    </p>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-white rounded text-sm">
                  <p className="text-purple-700">
                    <strong>Détail cotisations:</strong>
                  </p>
                  <p className="text-purple-900">
                    Prévoyance: {simulation.cotisations.prevoyance} | 
                    Décès & IAD: {simulation.cotisations.deces_iad}
                  </p>
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
                label="Nom"
                placeholder="Nom"
                error={errors.nom?.message}
                {...register('nom')}
              />
              <Input
                label="Prénom"
                placeholder="Prénom"
                error={errors.prenom?.message}
                {...register('prenom')}
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

        {/* Bénéficiaire Prévoyance */}
        <Card>
          <CardHeader>
            <CardTitle>Bénéficiaire de la Prévoyance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nom complet du bénéficiaire"
                placeholder="Nom et prénom"
                error={errors.beneficiaire_prevoyance_nom_prenom?.message}
                {...register('beneficiaire_prevoyance_nom_prenom')}
              />
              <Input
                label="Téléphone du bénéficiaire"
                placeholder="+241 XX XX XX XX"
                error={errors.beneficiaire_prevoyance_telephone?.message}
                {...register('beneficiaire_prevoyance_telephone')}
              />
            </div>
            <Input
              label="Adresse du bénéficiaire (optionnel)"
              placeholder="Adresse complète"
              error={errors.beneficiaire_prevoyance_adresse?.message}
              {...register('beneficiaire_prevoyance_adresse')}
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
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
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
