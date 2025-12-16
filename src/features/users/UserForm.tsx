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
import { ArrowLeft, Save, Eye, EyeOff } from 'lucide-react';
import { userService } from '@/services/user.service';
import toast from 'react-hot-toast';

const userSchema = z.object({
  name: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  role: z.enum(['admin', 'gestionnaire', 'agent', 'comptable', 'fpdg', 'lecteur']),
  emf_id: z.string().optional(),
  statut: z.enum(['actif', 'inactif', 'suspendu']),
  password: z.string().min(6, 'Mot de passe minimum 6 caractères').optional(),
  password_confirmation: z.string().optional(),
}).refine((data) => {
  if (data.password && data.password !== data.password_confirmation) {
    return false;
  }
  return true;
}, {
  message: "Les mots de passe ne correspondent pas",
  path: ["password_confirmation"],
});

type UserFormData = z.infer<typeof userSchema>;

interface UserCreateData {
  name: string;
  email: string;
  role: 'admin' | 'gestionnaire' | 'agent' | 'comptable' | 'fpdg' | 'lecteur';
  statut: 'actif' | 'inactif' | 'suspendu';
  emf_id?: number;
  password?: string;
  password_confirmation?: string;
}

export const UserForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const [showPassword, setShowPassword] = useState(false);

  const { data: userResponse } = useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      return await userService.getById(Number(id));
    },
    enabled: isEdit,
  });

  const user = userResponse?.data;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: 'agent',
      statut: 'actif',
    },
  });

  const role = watch('role');

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        role: user.role,
        emf_id: user.emf_id?.toString() || '',
        statut: user.statut,
      });
    }
  }, [user, reset]);

  const createMutation = useMutation({
    mutationFn: (data: UserCreateData & { password: string }) => {
      return userService.create(data);
    },
    onSuccess: (response) => {
      toast.success('Utilisateur créé avec succès');
      navigate(`/users/${response.data.id}`);
    },
    onError: (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
      const errorMsg = error.response?.data?.message || 'Erreur lors de la création';
      const errors = error.response?.data?.errors;
      if (errors) {
        const firstError = Object.values(errors)[0]?.[0];
        toast.error(firstError || errorMsg);
        console.error('Validation errors:', errors);
      } else {
        toast.error(errorMsg);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UserCreateData) => userService.update(Number(id), data),
    onSuccess: (response) => {
      toast.success('Utilisateur mis à jour avec succès');
      navigate(`/users/${response.data.id}`);
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    },
  });

  const onSubmit = (data: UserFormData) => {
    const formattedData: UserCreateData = {
      name: data.name,
      email: data.email,
      role: data.role,
      statut: data.statut,
      emf_id: data.emf_id ? parseInt(data.emf_id) : undefined,
    };

    if (!isEdit) {
      if (!data.password) {
        toast.error('Le mot de passe est requis');
        return;
      }
      const createData = {
        ...formattedData,
        password: data.password,
        password_confirmation: data.password_confirmation,
      } as UserCreateData & { password: string };
      createMutation.mutate(createData);
    } else {
      updateMutation.mutate(formattedData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/users')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Modifier' : 'Nouvel'} Utilisateur
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? 'Modifiez les informations' : 'Créez un nouveau compte utilisateur'}
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
                label="Nom complet"
                placeholder="Jean Dupont"
                error={errors.name?.message}
                {...register('name')}
              />
              <Input
                label="Email"
                type="email"
                placeholder="jean.dupont@exemple.com"
                error={errors.email?.message}
                {...register('email')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Rôle et Permissions */}
        <Card>
          <CardHeader>
            <CardTitle>Rôle et Permissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Rôle"
                options={[
                  { value: 'admin', label: 'Administrateur (Accès complet)' },
                  { value: 'fpdg', label: 'FPDG (Direction Générale)' },
                  { value: 'gestionnaire', label: 'Gestionnaire' },
                  { value: 'comptable', label: 'Comptable' },
                  { value: 'agent', label: 'Agent' },
                  { value: 'lecteur', label: 'Lecteur (Consultation seule)' },
                ]}
                error={errors.role?.message}
                {...register('role')}
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

            {/* Sélecteur EMF pour certains rôles */}
            {(role === 'gestionnaire' || role === 'agent' || role === 'comptable' || role === 'lecteur') && (
              <Select
                label="EMF associé"
                options={[
                  { value: '', label: 'Aucun (Accès global)' },
                  { value: '1', label: 'BAMBOO' },
                  { value: '2', label: 'COFIDEC' },
                  { value: '3', label: 'BCEG' },
                  { value: '4', label: 'EDG' },
                  { value: '5', label: 'SODEC' },
                ]}
                error={errors.emf_id?.message}
                {...register('emf_id')}
              />
            )}

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900 font-semibold mb-2">
                Permissions selon le rôle :
              </p>
              <ul className="space-y-1 text-sm text-blue-700">
                {role === 'admin' && (
                  <>
                    <li>• Accès complet à toutes les fonctionnalités</li>
                    <li>• Gestion des EMFs, utilisateurs et paramètres</li>
                    <li>• Validation et traitement des sinistres</li>
                    <li>• Paiement des quittances et clôture</li>
                  </>
                )}
                {role === 'fpdg' && (
                  <>
                    <li>• Accès direction générale</li>
                    <li>• Validation des quittances</li>
                    <li>• Paiement et clôture des sinistres</li>
                    <li>• Dashboard comptable</li>
                  </>
                )}
                {role === 'gestionnaire' && (
                  <>
                    <li>• Gestion des contrats et sinistres</li>
                    <li>• Validation des déclarations et quittances</li>
                    <li>• Accès aux statistiques et dashboard comptable</li>
                  </>
                )}
                {role === 'comptable' && (
                  <>
                    <li>• Dashboard comptable complet</li>
                    <li>• Paiement des quittances validées</li>
                    <li>• Historique et rapports financiers</li>
                    <li>• Export des données de paiement</li>
                  </>
                )}
                {role === 'agent' && (
                  <>
                    <li>• Saisie et consultation des données</li>
                    <li>• Déclaration des sinistres</li>
                    <li>• Création de contrats</li>
                  </>
                )}
                {role === 'lecteur' && (
                  <>
                    <li>• Consultation seule (lecture)</li>
                    <li>• Visualisation des contrats et sinistres</li>
                    <li>• Aucune modification possible</li>
                  </>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Mot de passe */}
        {!isEdit && (
          <Card>
            <CardHeader>
              <CardTitle>Mot de passe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Input
                    label="Mot de passe"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    error={errors.password?.message}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <Input
                  label="Confirmer le mot de passe"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  error={errors.password_confirmation?.message}
                  {...register('password_confirmation')}
                />
              </div>
              <p className="text-sm text-gray-500">
                Le mot de passe doit contenir au moins 6 caractères
              </p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/users')}
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
