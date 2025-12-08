import { Link, useLocation } from 'react-router-dom';
import { 
  Home, FileText, AlertCircle, Users, Building2, 
  Settings, ChevronLeft, BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

type MenuItem = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  emfPath?: string; // Chemin spécifique pour les utilisateurs EMF
  adminOnly?: boolean;
};

// Mapping des EMF vers leurs slugs de route
const EMF_SLUGS: Record<number, string> = {
  1: 'bamboo',
  2: 'cofidec',
  3: 'bceg',
  4: 'edg',
  5: 'sodec',
};

export const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const location = useLocation();
  const { user, isAdmin } = useAuthStore();

  // Déterminer le slug EMF de l'utilisateur
  const userEmfId = user?.emf_id;
  const userEmfSlug = userEmfId ? EMF_SLUGS[userEmfId] : null;
  const isEmfUser = !!userEmfSlug && !isAdmin();

  // Fonction pour obtenir le chemin approprié selon l'utilisateur
  const getPath = (item: MenuItem): string => {
    if (isEmfUser && item.emfPath) {
      return item.emfPath.replace('{emf}', userEmfSlug!);
    }
    return item.path;
  };

  const menuItems: MenuItem[] = [
    { 
      icon: Home, 
      label: 'Dashboard', 
      path: '/dashboard',
      emfPath: '/dashboard/{emf}'
    },
    { 
      icon: FileText, 
      label: 'Contrats', 
      path: '/contrats',
      emfPath: '/contrats/{emf}'
    },
    { 
      icon: AlertCircle, 
      label: 'Sinistres', 
      path: '/sinistres',
      emfPath: '/sinistres/{emf}'
    },
    { icon: Building2, label: 'EMFs/Banques', path: '/emfs', adminOnly: true },
    { icon: Users, label: 'Utilisateurs', path: '/users', adminOnly: true },
    { 
      icon: BarChart3, 
      label: 'Statistiques', 
      path: '/statistiques',
      emfPath: '/statistiques/{emf}'
    },
    { icon: Settings, label: 'Paramètres', path: '/settings', adminOnly: true },
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    // Tant que user n’est pas chargé, afficher tous les menus génériques, pas les adminOnly
    if (!user) {
      return !item.adminOnly;
    }
    if (item.adminOnly) {
      return isAdmin();
    }
    return true;
  });

  const isActive = (path: string, emfPath?: string) => {
    const actualPath = isEmfUser && emfPath ? emfPath.replace('{emf}', userEmfSlug!) : path;
    return location.pathname === actualPath || location.pathname.startsWith(actualPath + '/');
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-40',
        isOpen ? 'w-64' : 'w-20'
      )}
      aria-label="Menu principal"
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 h-16">
        {isOpen && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SA</span>
            </div>
            <span className="font-bold text-lg text-gray-900">SAMBA</span>
          </div>
        )}
        <button
          type="button"
          onClick={onToggle}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label={isOpen ? 'Réduire le menu' : 'Développer le menu'}
        >
          <ChevronLeft
            className={cn(
              'h-5 w-5 transition-transform',
              !isOpen && 'rotate-180'
            )}
          />
        </button>
      </div>

      <nav className="p-4 space-y-1">
        {filteredMenuItems.map((item) => {
          const active = isActive(item.path, item.emfPath);
          const linkPath = getPath(item);

          return (
            <Link
              key={item.path}
              to={linkPath}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                active
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100',
                !isOpen && 'justify-center'
              )}
              aria-label={isOpen ? undefined : item.label}
              aria-current={active ? 'page' : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {isOpen && <span className="font-medium text-sm">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {isOpen && user && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate capitalize">
                {user.emf?.sigle || user.role || 'Utilisateur'}
              </p>
            </div>
          </div>
        </div>
      )}

      {isOpen && !user && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 text-center text-gray-400">
          Chargement...
        </div>
      )}
    </aside>
  );
};
