import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { FpdgSidebar } from './FpdgSidebar';
import { useAuthStore } from '@/store/authStore';
import { AlertTriangle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';

/**
 * Layout dédié à l'espace FPDG (Fondateur Président Délégué Général)
 * Accessible par les utilisateurs avec le rôle "fpdg" ou "admin"
 * 
 * Le FPDG est un super-utilisateur avec tous les droits après l'Admin:
 * - Voir/créer/modifier sinistres
 * - Valider quittances
 * - Payer quittances  
 * - Clôturer sinistres
 * - Accès complet au dashboard comptable
 */
export const FpdgLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // Vérification du rôle FPDG ou Admin
  const hasAccess = user?.role === 'fpdg' || user?.role === 'admin';

  useEffect(() => {
    // Si non authentifié, rediriger vers login
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Si l'utilisateur n'a pas accès, afficher un message
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Accès refusé
          </h1>
          <p className="text-gray-600 mb-6">
            Cette section est réservée au <strong>Fondateur Président Délégué Général</strong> de SAMB'A Assurances.
            Seuls les utilisateurs avec le rôle FPDG ou Admin peuvent y accéder.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/dashboard')} 
              className="w-full bg-amber-500 hover:bg-amber-600"
            >
              Retour au tableau de bord
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Se connecter avec un autre compte
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-6">
            Rôle actuel : <span className="font-medium">{user?.role || 'Non défini'}</span>
          </p>
        </div>
      </div>
    );
  }

  const getRoleLabel = () => {
    if (user?.role === 'admin') return 'Administrateur';
    if (user?.role === 'fpdg') return 'Fondateur Président Délégué Général';
    return user?.role;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <FpdgSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? 'ml-72' : 'ml-20'
        }`}
      >
        {/* Header FPDG */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Badge privilèges */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-200">
                <Shield size={14} className="text-amber-600" />
                <span className="text-xs font-semibold text-amber-700">Super-utilisateur</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-amber-600">{getRoleLabel()}</p>
              </div>
            </div>
          </div>
        </header>
        
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
