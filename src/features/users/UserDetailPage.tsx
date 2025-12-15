import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ArrowLeft, Edit, User, Mail, Building2, Shield, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { userService } from '@/services/user.service';

export const UserDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const userId = id ? parseInt(id, 10) : NaN;

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await userService.getById(userId);
      return response.data;
    },
    enabled: !isNaN(userId) && userId > 0,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Chargement..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-600">Utilisateur non trouvé</p>
      </div>
    );
  }

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      actif: 'bg-green-100 text-green-800',
      inactif: 'bg-gray-100 text-gray-800',
      suspendu: 'bg-orange-100 text-orange-800',
    };
    return colors[statut] || 'bg-gray-100 text-gray-800';
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-800',
      emf_user: 'bg-blue-100 text-blue-800',
      bank_user: 'bg-purple-100 text-purple-800',
      assureur: 'bg-green-100 text-green-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: 'Administrateur',
      emf_user: 'Utilisateur EMF',
      bank_user: 'Utilisateur Banque',
      assureur: 'Assureur',
    };
    return labels[role] || role;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/users')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600 mt-1">{user.email}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatutColor(user.statut)}>
            {user.statut}
          </Badge>
          <Badge className={getRoleColor(user.role)}>
            {getRoleLabel(user.role)}
          </Badge>
          <Button onClick={() => navigate(`/users/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        </div>
      </div>

      {/* Informations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informations du Compte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Nom complet</p>
                <p className="font-medium text-gray-900">{user.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Mail className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Rôle</p>
                <p className="font-medium text-gray-900">{getRoleLabel(user.role)}</p>
              </div>
            </div>

            {user.emf && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">EMF/Banque</p>
                  <p className="font-medium text-gray-900">
                    {user.emf.sigle} - {user.emf.raison_sociale}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activité</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Dernière connexion</p>
                <p className="font-medium text-gray-900">
                  {user.last_login ? formatDate(user.last_login) : 'Jamais connecté'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Membre depuis</p>
                <p className="font-medium text-gray-900">
                  {formatDate(user.created_at)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Permissions et Accès</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900 font-semibold mb-2">
              Permissions du rôle : {getRoleLabel(user.role)}
            </p>
            <ul className="space-y-1 text-sm text-blue-700">
              {user.role === 'admin' && (
                <>
                  <li>• Accès complet à toutes les fonctionnalités</li>
                  <li>• Gestion des EMFs, utilisateurs et paramètres</li>
                  <li>• Validation et traitement des sinistres</li>
                  <li>• Consultation de toutes les statistiques</li>
                </>
              )}
              {user.role === 'emf_user' && (
                <>
                  <li>• Création et gestion des contrats de son EMF</li>
                  <li>• Déclaration des sinistres</li>
                  <li>• Consultation des statistiques de son EMF</li>
                  <li>• Accès limité à son EMF uniquement</li>
                </>
              )}
              {user.role === 'bank_user' && (
                <>
                  <li>• Création et gestion des contrats de sa banque</li>
                  <li>• Déclaration des sinistres</li>
                  <li>• Consultation des statistiques de sa banque</li>
                  <li>• Accès limité à sa banque uniquement</li>
                </>
              )}
              {user.role === 'assureur' && (
                <>
                  <li>• Validation et traitement des sinistres</li>
                  <li>• Consultation de tous les contrats</li>
                  <li>• Accès aux statistiques globales</li>
                  <li>• Gestion des paiements de sinistres</li>
                </>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
