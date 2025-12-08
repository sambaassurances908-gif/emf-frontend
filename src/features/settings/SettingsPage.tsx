import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { Settings, User, Lock, Bell, Shield, Save, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export const SettingsPage = () => {
  const { user } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    nouveaux_contrats: true,
    sinistres_declares: true,
    validations_requises: true,
    rapports_mensuels: false,
  });

  const handleSaveNotifications = () => {
    // Ici vous pouvez appeler l'API pour sauvegarder les préférences
    toast.success('Préférences enregistrées avec succès');
  };

  const handleChangePassword = () => {
    toast('Fonctionnalité en cours de développement', {
      icon: 'ℹ️',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600 mt-1">
          Gérez vos préférences et paramètres de compte
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations du Profil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nom complet"
                defaultValue={user?.name}
                disabled
              />
              <Input
                label="Email"
                type="email"
                defaultValue={user?.email}
                disabled
              />
              <Input
                label="Rôle"
                defaultValue={user?.role}
                disabled
              />
              {user?.emf && (
                <Input
                  label="EMF/Banque"
                  defaultValue={user.emf.sigle}
                  disabled
                />
              )}
            </div>
            <p className="text-sm text-gray-500">
              Pour modifier vos informations, contactez un administrateur.
            </p>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Actions Rapides
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleChangePassword}
            >
              <Lock className="h-4 w-4 mr-2" />
              Changer le mot de passe
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Shield className="h-4 w-4 mr-2" />
              Sécurité
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Changer le Mot de Passe
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Input
                label="Mot de passe actuel"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
              />
            </div>
            <div className="relative">
              <Input
                label="Nouveau mot de passe"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
              />
            </div>
            <div className="relative">
              <Input
                label="Confirmer le mot de passe"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              aria-label={showPassword ? 'Masquer les mots de passe' : 'Afficher les mots de passe'}
            >
              {showPassword ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Masquer
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Afficher
                </>
              )}
            </button>
            <Button onClick={handleChangePassword}>
              <Save className="h-4 w-4 mr-2" />
              Mettre à jour le mot de passe
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Préférences de Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Nouveaux contrats</p>
              <p className="text-sm text-gray-500">Recevoir une notification pour chaque nouveau contrat</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer" 
                checked={notificationSettings.nouveaux_contrats}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  nouveaux_contrats: e.target.checked
                })}
                aria-label="Activer les notifications pour les nouveaux contrats"
              />
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Sinistres déclarés</p>
              <p className="text-sm text-gray-500">Notification lors d'une déclaration de sinistre</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer" 
                checked={notificationSettings.sinistres_declares}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  sinistres_declares: e.target.checked
                })}
                aria-label="Activer les notifications pour les sinistres déclarés"
              />
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Validations requises</p>
              <p className="text-sm text-gray-500">Alertes pour les sinistres en attente de validation</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer" 
                checked={notificationSettings.validations_requises}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  validations_requises: e.target.checked
                })}
                aria-label="Activer les notifications pour les validations requises"
              />
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Rapports mensuels</p>
              <p className="text-sm text-gray-500">Recevoir un rapport mensuel d'activité par email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer" 
                checked={notificationSettings.rapports_mensuels}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  rapports_mensuels: e.target.checked
                })}
                aria-label="Activer les rapports mensuels par email"
              />
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveNotifications}>
          <Save className="h-4 w-4 mr-2" />
          Enregistrer les modifications
        </Button>
      </div>
    </div>
  );
};
