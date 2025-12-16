import { Link, useLocation } from 'react-router-dom';
import { 
  Home, FileText, AlertCircle, Users, Building2, 
  Settings, ChevronLeft, BarChart3, HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import logoSamba from '@/assets/logo-samba.png';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

type MenuItem = {
  icon: React.ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;
  label: string;
  path: string;
  emfPath?: string;
  adminOnly?: boolean;
  roles?: string[];  // Rôles autorisés (si défini, restreint l'accès)
};

const EMF_SLUGS: Record<number, string> = {
  1: 'bamboo',
  2: 'cofidec',
  3: 'bceg',
  4: 'edg',
  5: 'sodec',
};

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active = false, 
  collapsed = false,
  to 
}: { 
  icon: React.ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  to: string;
}) => (
  <Link
    to={to}
    className={cn(
      'flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-200',
      active 
        ? 'bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20' 
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
      collapsed && 'justify-center px-3'
    )}
    aria-current={active ? 'page' : undefined}
  >
    <Icon size={20} strokeWidth={active ? 2.5 : 2} className="flex-shrink-0" />
    {!collapsed && <span className={cn('text-sm', active ? 'font-bold tracking-wide' : 'font-semibold')}>{label}</span>}
  </Link>
);

export const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const location = useLocation();
  const { user, isAdmin } = useAuthStore();

  const userEmfId = user?.emf_id;
  const userEmfSlug = (userEmfId && userEmfId > 0) ? EMF_SLUGS[userEmfId] : null;
  const isEmfUser = !!userEmfSlug && !isAdmin();

  const getPath = (item: MenuItem): string => {
    if (isEmfUser && item.emfPath) {
      return item.emfPath.replace('{emf}', userEmfSlug!);
    }
    return item.path;
  };

  const menuItems: MenuItem[] = [
    { icon: Home, label: 'Dashboard', path: '/dashboard', emfPath: '/dashboard/{emf}' },
    { icon: FileText, label: 'Contrats', path: '/contrats', emfPath: '/contrats/{emf}' },
    { icon: AlertCircle, label: 'Sinistres', path: '/sinistres', emfPath: '/sinistres/{emf}' },
    { icon: Building2, label: 'EMFs/Banques', path: '/emfs', adminOnly: true },
    { icon: Users, label: 'Utilisateurs', path: '/users', adminOnly: true },
    { icon: BarChart3, label: 'Statistiques', path: '/statistiques', emfPath: '/statistiques/{emf}' },
    { icon: Settings, label: 'Paramètres', path: '/settings', adminOnly: true },
    { icon: HelpCircle, label: 'Aide', path: '/help' },
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    if (!user) return !item.adminOnly && !item.roles;
    if (item.adminOnly) return isAdmin();
    if (item.roles) {
      const userRole = user.role || '';
      return isAdmin() || item.roles.includes(userRole);
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
        'fixed left-0 top-0 h-full bg-white flex flex-col transition-all duration-300 z-40 shadow-sm border-r border-gray-100',
        isOpen ? 'w-64' : 'w-20'
      )}
      aria-label="Menu principal"
    >
      {/* Logo Section */}
      <div className={cn(
        'flex items-center p-6 border-b border-gray-100',
        isOpen ? 'justify-between' : 'justify-center'
      )}>
        {isOpen ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <img src={logoSamba} alt="SAMB'A" className="h-8 w-auto" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">SAMB'A</span>
              <p className="text-[10px] text-gray-400 font-medium -mt-0.5">ASSURANCES</p>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <img src={logoSamba} alt="SAMB'A" className="h-7 w-auto" />
          </div>
        )}
        
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            'p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600',
            !isOpen && 'absolute -right-3 top-7 bg-white border border-gray-200 shadow-sm'
          )}
          aria-label={isOpen ? 'Réduire le menu' : 'Développer le menu'}
        >
          <ChevronLeft className={cn('h-4 w-4 transition-transform duration-300', !isOpen && 'rotate-180')} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {filteredMenuItems.map((item) => (
          <SidebarItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            active={isActive(item.path, item.emfPath)}
            collapsed={!isOpen}
            to={getPath(item)}
          />
        ))}
      </nav>

      {/* Contact WhatsApp Card */}
      {isOpen && (
        <div className="mx-4 mb-4">
          <div className="bg-gradient-to-br from-gray-50 to-green-50 rounded-2xl p-5 relative overflow-hidden border border-green-100">
            <div className="relative z-10">
              <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                <svg className="h-4 w-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Contactez-nous
              </h4>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                Contactez le bureau direct de SAMB'A Assurances.
              </p>
              <a 
                href="https://wa.me/241060086262" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full bg-green-500 text-white text-xs font-bold py-3 rounded-xl shadow-lg shadow-green-500/20 hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            </div>
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-green-500/10 rounded-full"></div>
            <div className="absolute top-10 -left-10 w-20 h-20 bg-green-500/5 rounded-full"></div>
          </div>
        </div>
      )}

      {/* User Profile */}
      {user && (
        <div className={cn('p-4 border-t border-gray-100 bg-gray-50/50', !isOpen && 'flex justify-center')}>
          {isOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20">
                {user.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate capitalize">
                  {user.emf?.sigle || (user.emf_id === 1 ? 'BAMBOO' : user.emf_id === 2 ? 'COFIDEC' : user.emf_id === 3 ? 'BCEG' : user.emf_id === 4 ? 'EDG' : user.emf_id === 5 ? 'SODEC' : user.role || 'Utilisateur')}
                </p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20">
              {user.name?.charAt(0)}
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
