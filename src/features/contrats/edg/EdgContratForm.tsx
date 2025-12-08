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
import { ArrowLeft, Calculator, Save, Info, Plus, X } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';
import { contratService } from '@/services/contrat.service';
import { emfService } from '@/services/emf.service';
import toast from 'react-hot-toast';

// Schéma Zod pour les assurés associés
const assureAssocieSchema = z.object({
  type_assure: z.enum(['souscripteur', 'conjoint', 'enfant_1', 'enfant_2', 'enfant_3']),
  nom: z.string().min(2, 'Nom requis'),
  prenom: z.string().min(2, 'Prénom requis'),
  date_naissance: z.string().optional(),
  lieu_naissance: z.string().optional(),
  contact: z.string().optional(),
  adresse: z.string().optional(),
});

// Schéma Zod principal pour EDG
const edgSchema = z.object({
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
  formule: z.enum(['standard', 'vip']),
  beneficiaire_deces: z.string().optional(),
  type_contrat_travail: z.string(),
  garantie_perte_emploi: z.boolean(),
  agence: z.string().optional(),
  assures_associes: z.array(assureAssocieSchema).max(5, 'Maximum 5 assurés associés'),
});

type EdgFormData = z.infer<typeof edgSchema>;

// Interface pour les assurés associés
interface AssureAssocie {
  type_assure: 'souscripteur' | 'conjoint' | 'enfant_1' | 'enfant_2' | 'enfant_3';
  nom: string;
  prenom: string;
  date_naissance?: string;
  lieu_naissance?: string;
  contact?: string;
  adresse?: string;
}

// Interface pour les données de création
interface EdgCreateData {
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
  formule: 'standard' | 'vip';
  beneficiaire_deces?: string;
  type_contrat_travail: string;
  garantie_perte_emploi: boolean;
  garantie_prevoyance: boolean;
  garantie_deces_iad: boolean;
  agence?: string;
  assures_associes: AssureAssocie[];
}

// Interface pour la simulation - CORRECTION ICI
interface SimulationData {
  montant_pret: number;
  duree_mois: number;
  categorie: string;
  est_vip: boolean; // ✅ Changé de 'formule' à 'est_vip'
  avec_perte_emploi: boolean;
}

interface SimulationResult {
  categorie: string;
  formule: string;
  montant_max: string;
  cotisations: {
    total_ttc: string;
  };
  prevoyance: {
    capital_souscripteur: string;
    capital_conjoint: string;
    capital_enfant: string;
  };
}

interface Emf {
  id: number;
  raison_sociale: string;
  ville: string;
}

export const EdgContratForm = () => {
  const navigate = useNavigate();
  const [showSimulation, setShowSimulation] = useState(false);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [assuresAssocies, setAssuresAssocies] = useState<AssureAssocie[]>([]);

  const { data: emfsResponse } = useQuery({
    queryKey: ['emfs', 'edg'],
    queryFn: async () => {
      return await emfService.getAll({ type: 'emf', sigle: 'EDG' });
    },
  });

  const emfs = emfsResponse?.data;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EdgFormData>({
    resolver: zodResolver(edgSchema),
    defaultValues: {
      formule: 'standard',
      garantie_perte_emploi: false,
      type_contrat_travail: 'non_applicable',
      assures_associes: [],
    },
  });

  const montant = watch('montant_pret_assure');
  const duree = watch('duree_pret_mois');
  const categorie = watch('categorie');
  const formule = watch('formule');
  const garantiePerteEmploi = watch('garantie_perte_emploi');

  const createMutation = useMutation({
    mutationFn: (data: EdgCreateData) => contratService.edg.create(data),
    onSuccess: (response) => {
      toast.success('Contrat EDG créé avec succès');
      navigate(`/contrats/${response.data.id}`);
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    },
  });

  const simulateMutation = useMutation({
    mutationFn: (data: SimulationData) => contratService.edg.simuler(data),
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
      est_vip: formule === 'vip', // ✅ Conversion formule -> est_vip
      avec_perte_emploi: garantiePerteEmploi,
    };

    simulateMutation.mutate(simulationData);
  };

  const addAssureAssocie = () => {
    if (assuresAssocies.length >= 5) {
      toast.error('Maximum 5 assurés associés (souscripteur + conjoint + 3 enfants)');
      return;
    }

    const nbAdultes = assuresAssocies.filter(a => 
      ['souscripteur', 'conjoint'].includes(a.type_assure)
    ).length;
    
    const nbEnfants = assuresAssocies.filter(a => 
      ['enfant_1', 'enfant_2', 'enfant_3'].includes(a.type_assure)
    ).length;

    let defaultType: AssureAssocie['type_assure'] = 'souscripteur';
    if (nbAdultes === 0) defaultType = 'souscripteur';
    else if (nbAdultes === 1) defaultType = 'conjoint';
    else if (nbEnfants === 0) defaultType = 'enfant_1';
    else if (nbEnfants === 1) defaultType = 'enfant_2';
    else defaultType = 'enfant_3';

    setAssuresAssocies([
      ...assuresAssocies,
      { 
        type_assure: defaultType,
        nom: '', 
        prenom: '',
        date_naissance: '',
        lieu_naissance: '',
        contact: '',
        adresse: ''
      },
    ]);
  };

  const removeAssureAssocie = (index: number) => {
    setAssuresAssocies(assuresAssocies.filter((_, i) => i !== index));
  };

  const onSubmit = (data: EdgFormData) => {
    const formattedData: EdgCreateData = {
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
      formule: data.formule,
      beneficiaire_deces: data.beneficiaire_deces,
      type_contrat_travail: data.type_contrat_travail,
      garantie_perte_emploi: data.garantie_perte_emploi,
      garantie_prevoyance: true,
      garantie_deces_iad: true,
      agence: data.agence,
      assures_associes: assuresAssocies.filter(a => a.nom && a.prenom),
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
            Nouveau Contrat EDG
          </h1>
          <p className="text-gray-600 mt-1">
            Contrat prévoyance crédits (Standard/VIP)
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-orange-900">
          <p className="font-semibold mb-1">Formules EDG</p>
          <div className="grid grid-cols-2 gap-4 text-orange-700">
            <div>
              <p className="font-semibold">Formule Standard:</p>
              <ul className="space-y-1">
                <li>• Souscripteur: 500 000 FCFA</li>
                <li>• Conjoint: 250 000 FCFA</li>
                <li>• Enfant: 125 000 FCFA</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold">Formule VIP:</p>
              <ul className="space-y-1">
                <li>• Souscripteur: 1 000 000 FCFA</li>
                <li>• Conjoint: 500 000 FCFA</li>
                <li>• Enfant: 250 000 FCFA</li>
              </ul>
            </div>
          </div>
          <p className="mt-2 text-xs">
            • Max: 50M FCFA (120 mois) | Garantie perte d'emploi: 2%
          </p>
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
              label="EMF EDG"
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

        {/* Formule */}
        <Card>
          <CardHeader>
            <CardTitle>Formule de Prévoyance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formule === 'standard'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                <input
                  type="radio"
                  value="standard"
                  className="sr-only"
                  {...register('formule')}
                />
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                    formule === 'standard' ? 'border-orange-500' : 'border-gray-300'
                  }`}>
                    {formule === 'standard' && (
                      <div className="w-3 h-3 rounded-full bg-orange-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Formule Standard</p>
                    <p className="text-sm text-gray-600 mt-1">Couverture de base</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Souscripteur: 500K | Conjoint: 250K
                    </p>
                  </div>
                </div>
              </label>

              <label
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formule === 'vip'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                <input
                  type="radio"
                  value="vip"
                  className="sr-only"
                  {...register('formule')}
                />
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                    formule === 'vip' ? 'border-orange-500' : 'border-gray-300'
                  }`}>
                    {formule === 'vip' && (
                      <div className="w-3 h-3 rounded-full bg-orange-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Formule VIP</p>
                    <p className="text-sm text-gray-600 mt-1">Couverture renforcée</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Souscripteur: 1M | Conjoint: 500K
                    </p>
                  </div>
                </div>
              </label>
            </div>
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
                label="Durée (mois - max 120)"
                type="number"
                placeholder="0"
                max="120"
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
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <h4 className="font-semibold text-orange-900 mb-3">
                  Résultat de la Simulation
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-orange-700">Catégorie</p>
                    <p className="font-semibold text-orange-900">
                      {simulation.categorie}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-orange-700">Formule</p>
                    <p className="font-semibold text-orange-900">
                      {simulation.formule}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-orange-700">Montant max</p>
                    <p className="font-semibold text-orange-900">
                      {simulation.montant_max}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-orange-700">Total TTC</p>
                    <p className="font-semibold text-orange-900">
                      {simulation.cotisations.total_ttc}
                    </p>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-white rounded text-sm">
                  <p className="text-orange-700">
                    <strong>Capitaux prévoyance:</strong>
                  </p>
                  <p className="text-orange-900">
                    Souscripteur: {simulation.prevoyance.capital_souscripteur} | 
                    Conjoint: {simulation.prevoyance.capital_conjoint} |
                    Enfant: {simulation.prevoyance.capital_enfant}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informations de l'Assuré */}
        <Card>
          <CardHeader>
            <CardTitle>Informations du Souscripteur</CardTitle>
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

        {/* Assurés Associés */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Assurés Associés (Maximum 5)</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Souscripteur + conjoint + 3 enfants maximum
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAssureAssocie}
                disabled={assuresAssocies.length >= 5}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {assuresAssocies.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Aucun assuré associé. Cliquez sur "Ajouter" pour en ajouter.
              </p>
            ) : (
              assuresAssocies.map((assure, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">
                      Assuré Associé {index + 1}
                    </h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAssureAssocie(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      label="Type d'assuré"
                      options={[
                        { value: 'souscripteur', label: 'Souscripteur' },
                        { value: 'conjoint', label: 'Conjoint' },
                        { value: 'enfant_1', label: 'Enfant 1' },
                        { value: 'enfant_2', label: 'Enfant 2' },
                        { value: 'enfant_3', label: 'Enfant 3' },
                      ]}
                      value={assure.type_assure}
                      onChange={(e) => {
                        const updated = [...assuresAssocies];
                        updated[index].type_assure = e.target.value as AssureAssocie['type_assure'];
                        setAssuresAssocies(updated);
                      }}
                    />
                    <Input
                      label="Nom"
                      placeholder="Nom"
                      value={assure.nom}
                      onChange={(e) => {
                        const updated = [...assuresAssocies];
                        updated[index].nom = e.target.value;
                        setAssuresAssocies(updated);
                      }}
                    />
                    <Input
                      label="Prénom"
                      placeholder="Prénom"
                      value={assure.prenom}
                      onChange={(e) => {
                        const updated = [...assuresAssocies];
                        updated[index].prenom = e.target.value;
                        setAssuresAssocies(updated);
                      }}
                    />
                    <Input
                      label="Date de naissance"
                      type="date"
                      value={assure.date_naissance}
                      onChange={(e) => {
                        const updated = [...assuresAssocies];
                        updated[index].date_naissance = e.target.value;
                        setAssuresAssocies(updated);
                      }}
                    />
                    <Input
                      label="Lieu de naissance"
                      placeholder="Lieu"
                      value={assure.lieu_naissance}
                      onChange={(e) => {
                        const updated = [...assuresAssocies];
                        updated[index].lieu_naissance = e.target.value;
                        setAssuresAssocies(updated);
                      }}
                    />
                    <Input
                      label="Contact"
                      placeholder="Téléphone"
                      value={assure.contact}
                      onChange={(e) => {
                        const updated = [...assuresAssocies];
                        updated[index].contact = e.target.value;
                        setAssuresAssocies(updated);
                      }}
                    />
                  </div>
                </div>
              ))
            )}
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
              <Input
                label="Bénéficiaire décès (optionnel)"
                placeholder="Nom du bénéficiaire"
                error={errors.beneficiaire_deces?.message}
                {...register('beneficiaire_deces')}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="garantie_perte_emploi"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                {...register('garantie_perte_emploi')}
              />
              <label htmlFor="garantie_perte_emploi" className="text-sm font-medium text-gray-700">
                Garantie Perte d'Emploi (2%)
                <span className="text-xs text-gray-500 ml-2">
                  (Max 5M FCFA, 48 mois)
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
