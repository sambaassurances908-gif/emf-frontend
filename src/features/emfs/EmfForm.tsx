import { useEffect, useState } from 'react';
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
import { Textarea } from '@/components/ui/Textarea';
import { ArrowLeft, Save, Building2, User, Wallet, FileText, Globe, MapPin } from 'lucide-react';
import { emfService } from '@/services/emf.service';
import toast from 'react-hot-toast';

const emfSchema = z.object({
  raison_sociale: z.string().min(2, 'Raison sociale requise'),
  sigle: z.string().min(2, 'Sigle requis'),
  type: z.enum(['emf', 'banque']),
  adresse: z.string().min(5, 'Adresse requise'),
  ville: z.string().min(2, 'Ville requise'),
  pays: z.string().optional(),
  boite_postale: z.string().optional(),
  telephone: z.string().min(8, 'Téléphone requis'),
  telephone_2: z.string().optional(),
  email: z.string().email('Email invalide'),
  site_web: z.string().optional(),
  numero_agrement: z.string().optional(),
  registre_commerce: z.string().optional(),
  date_creation: z.string().optional(),
  compte_bancaire: z.string().optional(),
  banque: z.string().optional(),
  swift_bic: z.string().optional(),
  contact_nom: z.string().optional(),
  contact_fonction: z.string().optional(),
  contact_telephone: z.string().optional(),
  contact_email: z.string().optional(),
  montant_max_pret: z.string().min(1, 'Montant max requis'),
  duree_max_pret_mois: z.string().min(1, 'Durée max requise'),
  taux_interet_moyen: z.string().optional(),
  taux_commission: z.string().min(1, 'Taux commission requis'),
  description: z.string().optional(),
  statut: z.enum(['actif', 'inactif', 'suspendu']),
});

type EmfFormData = z.infer<typeof emfSchema>;

interface EmfCreateData {
  raison_sociale: string;
  sigle: string;
  type: 'emf' | 'banque';
  adresse: string;
  ville: string;
  pays?: string;
  boite_postale?: string;
  telephone: string;
  telephone_2?: string;
  email: string;
  site_web?: string;
  numero_agrement?: string;
  registre_commerce?: string;
  date_creation?: string;
  compte_bancaire?: string;
  banque?: string;
  swift_bic?: string;
  contact_nom?: string;
  contact_fonction?: string;
  contact_telephone?: string;
  contact_email?: string;
  montant_max_pret: number;
  duree_max_pret_mois: number;
  taux_interet_moyen?: number;
  taux_commission: number;
  description?: string;
  statut: 'actif' | 'inactif' | 'suspendu';
}

export const EmfForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'legal' | 'banking' | 'limits'>('general');

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
      pays: 'Gabon',
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
        pays: emf.pays || 'Gabon',
        boite_postale: emf.boite_postale || '',
        telephone: emf.telephone,
        telephone_2: emf.telephone_2 || '',
        email: emf.email,
        site_web: emf.site_web || '',
        numero_agrement: emf.numero_agrement || '',
        registre_commerce: emf.registre_commerce || '',
        date_creation: emf.date_creation || '',
        compte_bancaire: emf.compte_bancaire || '',
        banque: emf.banque || '',
        swift_bic: emf.swift_bic || '',
        contact_nom: emf.contact_nom || '',
        contact_fonction: emf.contact_fonction || '',
        contact_telephone: emf.contact_telephone || '',
        contact_email: emf.contact_email || '',
        montant_max_pret: emf.montant_max_pret?.toString() || '0',
        duree_max_pret_mois: emf.duree_max_pret_mois?.toString() || '0',
        taux_interet_moyen: emf.taux_interet_moyen?.toString() || '',
        taux_commission: emf.taux_commission?.toString() || '0',
        description: emf.description || '',
        statut: emf.statut,
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
      pays: data.pays || undefined,
      boite_postale: data.boite_postale || undefined,
      telephone: data.telephone,
      telephone_2: data.telephone_2 || undefined,
      email: data.email,
      site_web: data.site_web || undefined,
      numero_agrement: data.numero_agrement || undefined,
      registre_commerce: data.registre_commerce || undefined,
      date_creation: data.date_creation || undefined,
      compte_bancaire: data.compte_bancaire || undefined,
      banque: data.banque || undefined,
      swift_bic: data.swift_bic || undefined,
      contact_nom: data.contact_nom || undefined,
      contact_fonction: data.contact_fonction || undefined,
      contact_telephone: data.contact_telephone || undefined,
      contact_email: data.contact_email || undefined,
      montant_max_pret: parseFloat(data.montant_max_pret) || 0,
      duree_max_pret_mois: parseInt(data.duree_max_pret_mois) || 0,
      taux_interet_moyen: data.taux_interet_moyen ? parseFloat(data.taux_interet_moyen) : undefined,
      taux_commission: parseFloat(data.taux_commission) || 0,
      description: data.description || undefined,
      statut: data.statut,
    };

    if (isEdit) {
      updateMutation.mutate(formattedData);
    } else {
      createMutation.mutate(formattedData);
    }
  };

  const tabs = [
    { id: 'general', label: 'Général', icon: Building2 },
    { id: 'contact', label: 'Contact', icon: User },
    { id: 'legal', label: 'Juridique', icon: FileText },
    { id: 'banking', label: 'Bancaire', icon: Wallet },
    { id: 'limits', label: 'Limites', icon: Globe },
  ] as const;

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
            {isEdit ? 'Modifiez les informations du partenaire' : 'Ajoutez un nouvel EMF ou banque partenaire'}
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-samba-orange text-white shadow-lg shadow-samba-orange/20'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informations Générales */}
        {activeTab === 'general' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-gray-500" />
                Informations Générales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Raison Sociale *"
                  placeholder="Ex: COOPERATIVE POUR LE FINANCEMENT..."
                  error={errors.raison_sociale?.message}
                  {...register('raison_sociale')}
                />
                <Input
                  label="Sigle *"
                  placeholder="Ex: COFIDEC, BAMBOO, BCEG..."
                  error={errors.sigle?.message}
                  {...register('sigle')}
                />
                <Select
                  label="Type *"
                  options={[
                    { value: 'emf', label: 'EMF (Établissement de Microfinance)' },
                    { value: 'banque', label: 'Banque' },
                  ]}
                  error={errors.type?.message}
                  {...register('type')}
                />
                <Select
                  label="Statut *"
                  options={[
                    { value: 'actif', label: 'Actif' },
                    { value: 'inactif', label: 'Inactif' },
                    { value: 'suspendu', label: 'Suspendu' },
                  ]}
                  error={errors.statut?.message}
                  {...register('statut')}
                />
              </div>
              <Textarea
                label="Description"
                placeholder="Description de l'établissement..."
                rows={3}
                {...register('description')}
              />
            </CardContent>
          </Card>
        )}

        {/* Coordonnées & Contact */}
        {activeTab === 'contact' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  Coordonnées
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Adresse *"
                    placeholder="Ex: Rue des Palmiers, Quartier..."
                    error={errors.adresse?.message}
                    {...register('adresse')}
                  />
                  <Input
                    label="Boîte Postale"
                    placeholder="Ex: B.P. 2551"
                    {...register('boite_postale')}
                  />
                  <Input
                    label="Ville *"
                    placeholder="Ex: Libreville"
                    error={errors.ville?.message}
                    {...register('ville')}
                  />
                  <Input
                    label="Pays"
                    placeholder="Ex: Gabon"
                    {...register('pays')}
                  />
                  <Input
                    label="Téléphone Principal *"
                    placeholder="Ex: +241 XX XX XX XX"
                    error={errors.telephone?.message}
                    {...register('telephone')}
                  />
                  <Input
                    label="Téléphone Secondaire"
                    placeholder="Ex: +241 XX XX XX XX"
                    {...register('telephone_2')}
                  />
                  <Input
                    label="Email *"
                    type="email"
                    placeholder="contact@emf.com"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                  <Input
                    label="Site Web"
                    placeholder="https://www.emf.com"
                    {...register('site_web')}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-500" />
                  Personne de Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nom du contact"
                    placeholder="Ex: Jean MBENG"
                    {...register('contact_nom')}
                  />
                  <Input
                    label="Fonction"
                    placeholder="Ex: Directeur Général"
                    {...register('contact_fonction')}
                  />
                  <Input
                    label="Téléphone"
                    placeholder="Ex: +241 XX XX XX XX"
                    {...register('contact_telephone')}
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="contact@emf.com"
                    {...register('contact_email')}
                  />
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Informations Juridiques */}
        {activeTab === 'legal' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-500" />
                Informations Juridiques
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Numéro d'Agrément"
                  placeholder="Ex: AGR-2020-001"
                  {...register('numero_agrement')}
                />
                <Input
                  label="Registre du Commerce"
                  placeholder="Ex: RC/LBV/2020/B/001"
                  {...register('registre_commerce')}
                />
                <Input
                  label="Date de Création"
                  type="date"
                  {...register('date_creation')}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informations Bancaires */}
        {activeTab === 'banking' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-gray-500" />
                Informations Bancaires
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Banque"
                  placeholder="Ex: BGFI Bank"
                  {...register('banque')}
                />
                <Input
                  label="Numéro de Compte"
                  placeholder="Ex: GA001 00001 00000000001 01"
                  {...register('compte_bancaire')}
                />
                <Input
                  label="Code SWIFT/BIC"
                  placeholder="Ex: BGFIGAGL"
                  {...register('swift_bic')}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Limites et Conditions */}
        {activeTab === 'limits' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-gray-500" />
                Limites et Conditions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Montant Maximum Prêt (FCFA) *"
                  type="number"
                  placeholder="0"
                  error={errors.montant_max_pret?.message}
                  {...register('montant_max_pret')}
                />
                <Input
                  label="Durée Maximum Prêt (mois) *"
                  type="number"
                  placeholder="0"
                  error={errors.duree_max_pret_mois?.message}
                  {...register('duree_max_pret_mois')}
                />
                <Input
                  label="Taux d'Intérêt Moyen (%)"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register('taux_interet_moyen')}
                />
                <Input
                  label="Taux Commission (%)*"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  error={errors.taux_commission?.message}
                  {...register('taux_commission')}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            {activeTab !== 'general' && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const currentIndex = tabs.findIndex(t => t.id === activeTab);
                  if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1].id);
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Précédent
              </Button>
            )}
            {activeTab !== 'limits' && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const currentIndex = tabs.findIndex(t => t.id === activeTab);
                  if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1].id);
                }}
              >
                Suivant
                <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-4">
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
              {isEdit ? 'Mettre à jour' : 'Créer le partenaire'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
