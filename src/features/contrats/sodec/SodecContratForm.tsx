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
import { Modal } from '@/components/ui/Modal';
import { ArrowLeft, Calculator, Save, Info, Plus, X, Users } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';
import { contratService } from '@/services/contrat.service';
import { emfService } from '@/services/emf.service';
import toast from 'react-hot-toast';

const assureAssocieSchema = z.object({
  type_assure: z.enum(['souscripteur', 'conjoint', 'conjoint_2', 'enfant_1', 'enfant_2', 'enfant_3', 'enfant_4']),
  nom: z.string().min(2, 'Nom requis'),
  prenom: z.string().min(2, 'Prénom requis'),
  date_naissance: z.string().min(1, 'Date de naissance requise'),
  lieu_naissance: z.string().min(2, 'Lieu de naissance requis'),
  contact: z.string().optional(),
  adresse: z.string().optional(),
});

const sodecSchema = z.object({
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
  option_prevoyance: z.enum(['option_a', 'option_b']),
  beneficiaire_deces: z.string().optional(),
  type_contrat_travail: z.string(),
  garantie_perte_emploi: z.boolean(),
  agence: z.string().optional(),
  assures_associes: z.array(assureAssocieSchema).max(6, 'Maximum 6 assurés associés (2 adultes + 4 enfants)'),
});

type SodecFormData = z.infer<typeof sodecSchema>;

interface AssureAssocie {
  type_assure: 'souscripteur' | 'conjoint' | 'conjoint_2' | 'enfant_1' | 'enfant_2' | 'enfant_3' | 'enfant_4';
  nom: string;
  prenom: string;
  date_naissance: string;
  lieu_naissance: string;
  contact?: string;
  adresse?: string;
}

interface SodecCreateData {
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
  option_prevoyance: 'option_a' | 'option_b';
  beneficiaire_deces?: string;
  type_contrat_travail: string;
  garantie_perte_emploi: boolean;
  garantie_prevoyance: boolean;
  garantie_deces_iad: boolean;
  agence?: string;
  assures_associes: AssureAssocie[];
}

interface SimulationData {
  montant_pret: number;
  duree_mois: number;
  categorie: string;
  option_prevoyance: 'option_a' | 'option_b'; // ✅ Type strict
  avec_perte_emploi: boolean;
}

interface SimulationResult {
  categorie: string;
  option_prevoyance: string;
  montant_max: string;
  cotisations: {
    total_ttc: string;
  };
  prevoyance: {
    capital_adulte: string;
    capital_enfant: string;
  };
}

interface ComparaisonData {
  montant_pret: number;
  nombre_adultes: number;
  nombre_enfants: number;
}

interface ComparaisonOption {
  prime: string;
  capital_adulte_unitaire: string;
  capital_enfant_unitaire: string;
  capital_total_adultes: string;
  capital_total_enfants: string;
  capital_prevoyance_total: string;
  cotisation_totale: string;
}

interface ComparaisonResult {
  option_a: ComparaisonOption;
  option_b: ComparaisonOption;
  differences: {
    economie_option_b: string;
    capital_supplementaire_option_a: string;
    pourcentage_economie: string;
  };
  recommandation: string;
}

interface Emf {
  id: number;
  raison_sociale: string;
  ville: string;
}

export const SodecContratForm = () => {
  const navigate = useNavigate();
  const [showSimulation, setShowSimulation] = useState(false);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [showComparator, setShowComparator] = useState(false);
  const [comparaison, setComparaison] = useState<ComparaisonResult | null>(null);
  const [assuresAssocies, setAssuresAssocies] = useState<AssureAssocie[]>([]);

  const { data: emfsResponse } = useQuery({
    queryKey: ['emfs', 'sodec'],
    queryFn: async () => {
      return await emfService.getAll({ type: 'emf', sigle: 'SODEC' });
    },
  });

  const emfs = emfsResponse?.data;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SodecFormData>({
    resolver: zodResolver(sodecSchema),
    defaultValues: {
      option_prevoyance: 'option_b',
      garantie_perte_emploi: false,
      type_contrat_travail: 'non_applicable',
      assures_associes: [],
    },
  });

  const montant = watch('montant_pret_assure');
  const duree = watch('duree_pret_mois');
  const categorie = watch('categorie');
  const optionPrevoyance = watch('option_prevoyance');
  const garantiePerteEmploi = watch('garantie_perte_emploi');

  const createMutation = useMutation({
    mutationFn: (data: SodecCreateData) => contratService.sodec.create(data),
    onSuccess: (response) => {
      toast.success('Contrat SODEC créé avec succès');
      navigate(`/contrats/${response.data.id}`);
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    },
  });

  const simulateMutation = useMutation({
    mutationFn: (data: SimulationData) => contratService.sodec.simuler(data),
    onSuccess: (response) => {
      setSimulation(response.data.simulation);
      setShowSimulation(true);
    },
  });

  const comparerMutation = useMutation({
    mutationFn: (data: ComparaisonData) => contratService.sodec.comparerOptions(data),
    onSuccess: (response) => {
      setComparaison(response.data.comparaison);
      setShowComparator(true);
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
      option_prevoyance: optionPrevoyance, // ✅ Déjà typé correctement par Zod
      avec_perte_emploi: garantiePerteEmploi,
    };

    simulateMutation.mutate(simulationData);
  };

  const handleCompareOptions = () => {
    if (!montant) {
      toast.error('Veuillez renseigner le montant du prêt');
      return;
    }

    const nbAdultes = assuresAssocies.filter(a => 
      ['souscripteur', 'conjoint', 'conjoint_2'].includes(a.type_assure)
    ).length + 1;

    const nbEnfants = assuresAssocies.filter(a => 
      ['enfant_1', 'enfant_2', 'enfant_3', 'enfant_4'].includes(a.type_assure)
    ).length;

    comparerMutation.mutate({
      montant_pret: parseFloat(montant),
      nombre_adultes: nbAdultes,
      nombre_enfants: nbEnfants,
    });
  };

  const addAssureAssocie = () => {
    if (assuresAssocies.length >= 6) {
      toast.error('Maximum 6 assurés associés (2 adultes + 4 enfants)');
      return;
    }

    const nbAdultes = assuresAssocies.filter(a => 
      ['souscripteur', 'conjoint', 'conjoint_2'].includes(a.type_assure)
    ).length;
    
    const nbEnfants = assuresAssocies.filter(a => 
      ['enfant_1', 'enfant_2', 'enfant_3', 'enfant_4'].includes(a.type_assure)
    ).length;

    let defaultType: AssureAssocie['type_assure'] = 'souscripteur';
    if (nbAdultes === 0) defaultType = 'souscripteur';
    else if (nbAdultes === 1) defaultType = 'conjoint';
    else if (nbAdultes === 2) defaultType = 'conjoint_2';
    else if (nbEnfants === 0) defaultType = 'enfant_1';
    else if (nbEnfants === 1) defaultType = 'enfant_2';
    else if (nbEnfants === 2) defaultType = 'enfant_3';
    else defaultType = 'enfant_4';

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

  const onSubmit = (data: SodecFormData) => {
    const formattedData: SodecCreateData = {
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
      option_prevoyance: data.option_prevoyance,
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
            Nouveau Contrat SODEC
          </h1>
          <p className="text-gray-600 mt-1">
            Contrat prévoyance crédits avec Options A/B
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-red-900">
          <p className="font-semibold mb-1">Options de Prévoyance SODEC</p>
          <div className="grid grid-cols-2 gap-4 text-red-700">
            <div>
              <p className="font-semibold">Option A (30 000 FCFA):</p>
              <ul className="space-y-1">
                <li>• Adulte: 500 000 FCFA</li>
                <li>• Enfant: 250 000 FCFA</li>
                <li>• Max total: 2 000 000 FCFA</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold">Option B (15 000 FCFA):</p>
              <ul className="space-y-1">
                <li>• Adulte: 250 000 FCFA</li>
                <li>• Enfant: 125 000 FCFA</li>
                <li>• Max total: 1 000 000 FCFA</li>
              </ul>
            </div>
          </div>
          <p className="mt-2 text-xs">
            • Retraités: Max 5M FCFA (36 mois) | Autres: Max 20M FCFA (72 mois)
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
              label="EMF SODEC"
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

        {/* Option Prévoyance */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Option de Prévoyance</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCompareOptions}
                disabled={comparerMutation.isPending}
              >
                <Users className="h-4 w-4 mr-2" />
                Comparer les Options
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  optionPrevoyance === 'option_a'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <input
                  type="radio"
                  value="option_a"
                  className="sr-only"
                  {...register('option_prevoyance')}
                />
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                    optionPrevoyance === 'option_a' ? 'border-red-500' : 'border-gray-300'
                  }`}>
                    {optionPrevoyance === 'option_a' && (
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Option A</p>
                    <p className="text-sm text-gray-600 mt-1">30 000 FCFA</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Adulte: 500K | Enfant: 250K
                    </p>
                  </div>
                </div>
              </label>

              <label
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  optionPrevoyance === 'option_b'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <input
                  type="radio"
                  value="option_b"
                  className="sr-only"
                  {...register('option_prevoyance')}
                />
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                    optionPrevoyance === 'option_b' ? 'border-red-500' : 'border-gray-300'
                  }`}>
                    {optionPrevoyance === 'option_b' && (
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Option B</p>
                    <p className="text-sm text-gray-600 mt-1">15 000 FCFA</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Adulte: 250K | Enfant: 125K
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
                label="Durée (mois - max 72)"
                type="number"
                placeholder="0"
                max="72"
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
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-semibold text-red-900 mb-3">
                  Résultat de la Simulation
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-red-700">Catégorie</p>
                    <p className="font-semibold text-red-900">
                      {simulation.categorie}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-red-700">Option</p>
                    <p className="font-semibold text-red-900">
                      {simulation.option_prevoyance}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-red-700">Montant max</p>
                    <p className="font-semibold text-red-900">
                      {simulation.montant_max}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-red-700">Total TTC</p>
                    <p className="font-semibold text-red-900">
                      {simulation.cotisations.total_ttc}
                    </p>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-white rounded text-sm">
                  <p className="text-red-700">
                    <strong>Capitaux prévoyance:</strong>
                  </p>
                  <p className="text-red-900">
                    Adulte: {simulation.prevoyance.capital_adulte} | 
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

        {/* Assurés Associés - Le reste du code continue de la même manière... */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Assurés Associés (Maximum 5)</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  2 adultes maximum (souscripteur, conjoint) + 3 enfants
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
                        { value: 'conjoint_2', label: 'Conjoint 2' },
                        { value: 'enfant_1', label: 'Enfant 1' },
                        { value: 'enfant_2', label: 'Enfant 2' },
                        { value: 'enfant_3', label: 'Enfant 3' },
                        { value: 'enfant_4', label: 'Enfant 4' },
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
                    <Input
                      label="Adresse"
                      placeholder="Adresse"
                      value={assure.adresse}
                      onChange={(e) => {
                        const updated = [...assuresAssocies];
                        updated[index].adresse = e.target.value;
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
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                {...register('garantie_perte_emploi')}
              />
              <label htmlFor="garantie_perte_emploi" className="text-sm font-medium text-gray-700">
                Garantie Perte d'Emploi (2%)
                <span className="text-xs text-gray-500 ml-2">
                  (Max 5M FCFA, 48 mois, indemnisation 3 mois)
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

      {/* Modal Comparateur d'Options */}
      <Modal
        isOpen={showComparator}
        onClose={() => setShowComparator(false)}
        title="Comparaison des Options A et B"
        size="lg"
      >
        {comparaison && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <h3 className="font-bold text-red-900 text-lg mb-3">Option A</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-red-700">Prime:</span>
                    <span className="font-semibold text-red-900">{comparaison.option_a.prime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-700">Capital adulte:</span>
                    <span className="font-semibold text-red-900">{comparaison.option_a.capital_adulte_unitaire}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-700">Capital enfant:</span>
                    <span className="font-semibold text-red-900">{comparaison.option_a.capital_enfant_unitaire}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-700">Total adultes:</span>
                    <span className="font-semibold text-red-900">{comparaison.option_a.capital_total_adultes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-700">Total enfants:</span>
                    <span className="font-semibold text-red-900">{comparaison.option_a.capital_total_enfants}</span>
                  </div>
                  <hr className="border-red-300" />
                  <div className="flex justify-between">
                    <span className="text-red-700 font-semibold">Total prévoyance:</span>
                    <span className="font-bold text-red-900">{comparaison.option_a.capital_prevoyance_total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-700 font-semibold">Cotisation totale:</span>
                    <span className="font-bold text-red-900">{comparaison.option_a.cotisation_totale}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <h3 className="font-bold text-blue-900 text-lg mb-3">Option B</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Prime:</span>
                    <span className="font-semibold text-blue-900">{comparaison.option_b.prime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Capital adulte:</span>
                    <span className="font-semibold text-blue-900">{comparaison.option_b.capital_adulte_unitaire}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Capital enfant:</span>
                    <span className="font-semibold text-blue-900">{comparaison.option_b.capital_enfant_unitaire}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Total adultes:</span>
                    <span className="font-semibold text-blue-900">{comparaison.option_b.capital_total_adultes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Total enfants:</span>
                    <span className="font-semibold text-blue-900">{comparaison.option_b.capital_total_enfants}</span>
                  </div>
                  <hr className="border-blue-300" />
                  <div className="flex justify-between">
                    <span className="text-blue-700 font-semibold">Total prévoyance:</span>
                    <span className="font-bold text-blue-900">{comparaison.option_b.capital_prevoyance_total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 font-semibold">Cotisation totale:</span>
                    <span className="font-bold text-blue-900">{comparaison.option_b.cotisation_totale}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Analyse</h4>
              <div className="space-y-1 text-sm text-gray-700">
                <p>• Économie Option B: <strong>{comparaison.differences.economie_option_b}</strong></p>
                <p>• Capital supplémentaire Option A: <strong>{comparaison.differences.capital_supplementaire_option_a}</strong></p>
                <p>• Pourcentage d'économie: <strong>{comparaison.differences.pourcentage_economie}</strong></p>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-1">Recommandation</h4>
              <p className="text-sm text-yellow-800">{comparaison.recommandation}</p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setValue('option_prevoyance', 'option_a');
                  setShowComparator(false);
                  toast.success('Option A sélectionnée');
                }}
                className="flex-1"
              >
                Choisir Option A
              </Button>
              <Button
                onClick={() => {
                  setValue('option_prevoyance', 'option_b');
                  setShowComparator(false);
                  toast.success('Option B sélectionnée');
                }}
                variant="secondary"
                className="flex-1"
              >
                Choisir Option B
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
