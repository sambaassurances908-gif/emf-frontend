import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, Mail, Building2, Calendar, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export const ProfilePage = () => {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  const handleSave = () => {
    // TODO: Implémenter la mise à jour du profil
    toast.success('Profil mis à jour avec succès');
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
        <p className="text-gray-600 mt-1">
          Gérez vos informations personnelles
        </p>
      </div>

      {/* Profil Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Informations personnelles</CardTitle>
            <Button
              type="button"
              variant={isEditing ? 'ghost' : 'outline'}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Annuler' : 'Modifier'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  user.role === 'admin' 
                    ? 'bg-purple-100 text-purple-800'
                    : user.role === 'gestionnaire'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <Shield className="h-3 w-3 mr-1" />
                  {user.role === 'admin' ? 'Administrateur' : 
                   user.role === 'gestionnaire' ? 'Gestionnaire' : 'Consultant'}
                </span>
              </div>
            </div>
          </div>

          {/* Informations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <User className="h-4 w-4" />
                Nom complet
              </label>
              {isEditing ? (
                <Input defaultValue={user.name} />
              ) : (
                <p className="text-gray-900">{user.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Mail className="h-4 w-4" />
                Email
              </label>
              {isEditing ? (
                <Input type="email" defaultValue={user.email} />
              ) : (
                <p className="text-gray-900">{user.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Shield className="h-4 w-4" />
                Rôle
              </label>
              <p className="text-gray-900 capitalize">{user.role}</p>
            </div>

            {user.emf && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Building2 className="h-4 w-4" />
                  EMF/Banque
                </label>
                <p className="text-gray-900">{user.emf.sigle} - {user.emf.raison_sociale}</p>
              </div>
            )}

            {user.created_at && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar className="h-4 w-4" />
                  Membre depuis
                </label>
                <p className="text-gray-900">
                  {new Date(user.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          {isEditing && (
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Annuler
              </Button>
              <Button type="button" onClick={handleSave}>
                Enregistrer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sécurité */}
      <Card>
        <CardHeader>
          <CardTitle>Sécurité</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Mot de passe</h4>
            <p className="text-sm text-gray-600 mb-4">
              Pour modifier votre mot de passe, contactez votre administrateur.
            </p>
            <Button type="button" variant="outline" disabled>
              Changer le mot de passe
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
