import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { ComptableSidebar } from './ComptableSidebar';
import { useAuthStore } from '@/store/authStore';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

/**
 * Layout dédié à l'espace comptable
 * Accessible uniquement par les utilisateurs avec le rôle "comptable"
 */
export const ComptableLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // Vérification du rôle comptable
  const isComptable = user?.role === 'comptable';

  useEffect(() => {
    // Si non authentifié, rediriger vers login
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Si l'utilisateur n'est pas comptable, afficher un message d'accès refusé
  if (!isComptable) {
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
            Cette section est réservée aux comptables de SAMB'A Assurances.
            Veuillez contacter l'administrateur si vous pensez qu'il s'agit d'une erreur.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/dashboard')} 
              className="w-full"
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

  return (
    <div className="min-h-screen bg-slate-50">
      <ComptableSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? 'ml-72' : 'ml-20'
        }`}
      >
        {/* Header simple pour comptable */}
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
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-emerald-600">Comptable</p>
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
