import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  History, 
  FileBarChart,
  ChevronLeft,
  HelpCircle,
  LogOut,
  Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import logoSamba from '@/assets/logo-samba.png';

interface ComptableSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

type MenuItem = {
  icon: React.ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;
  label: string;
  path: string;
  description?: string;
};

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active = false, 
  collapsed = false,
  to,
  description
}: { 
  icon: React.ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  to: string;
  description?: string;
}) => (
  <Link
    to={to}
    className={cn(
      'flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-200 group',
      active 
        ? 'bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/30' 
        : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700',
      collapsed && 'justify-center px-3'
    )}
    title={collapsed ? label : undefined}
  >
    <Icon size={20} strokeWidth={active ? 2.5 : 2} className="flex-shrink-0" />
    {!collapsed && (
      <div className="flex flex-col">
        <span className={cn('text-sm', active ? 'font-bold tracking-wide' : 'font-semibold')}>
          {label}
        </span>
        {description && !active && (
          <span className="text-xs text-gray-400 group-hover:text-emerald-500">
            {description}
          </span>
        )}
      </div>
    )}
  </Link>
);

export const ComptableSidebar = ({ isOpen, onToggle }: ComptableSidebarProps) => {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const menuItems: MenuItem[] = [
    { 
      icon: LayoutDashboard, 
      label: 'Tableau de bord', 
      path: '/comptable',
      description: 'Vue d\'ensemble financière'
    },
    { 
      icon: Receipt, 
      label: 'Quittances', 
      path: '/comptable/quittances',
      description: 'Gestion des paiements'
    },
    { 
      icon: History, 
      label: 'Historique', 
      path: '/comptable/historique',
      description: 'Paiements effectués'
    },
    { 
      icon: FileBarChart, 
      label: 'Rapports', 
      path: '/comptable/rapport',
      description: 'Rapports financiers'
    },
  ];

  const isActive = (path: string) => {
    if (path === '/comptable') {
      return location.pathname === '/comptable';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-white flex flex-col transition-all duration-300 z-40 shadow-md border-r border-gray-100',
        isOpen ? 'w-72' : 'w-20'
      )}
    >
      {/* Logo Section */}
      <div className={cn(
        'flex items-center p-6 border-b border-gray-100',
        isOpen ? 'justify-between' : 'justify-center'
      )}>
        {isOpen ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <img src={logoSamba} alt="SAMB'A" className="h-8 w-auto" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">SAMB'A</span>
              <p className="text-[10px] text-emerald-600 font-semibold -mt-0.5">ESPACE COMPTABLE</p>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
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

      {/* Label Section Finance */}
      {isOpen && (
        <div className="px-6 py-4">
          <div className="flex items-center gap-2 text-emerald-600">
            <Wallet size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Gestion Financière</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            active={isActive(item.path)}
            collapsed={!isOpen}
            to={item.path}
            description={item.description}
          />
        ))}
      </nav>

      {/* Aide */}
      {isOpen && (
        <div className="mx-4 mb-4">
          <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle size={18} className="text-emerald-600" />
              <h4 className="font-bold text-gray-900">Besoin d'aide ?</h4>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Consultez la documentation ou contactez le support.
            </p>
            <a 
              href="https://wa.me/241060086262" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full bg-emerald-600 text-white text-xs font-bold py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
            >
              Contacter le support
            </a>
          </div>
        </div>
      )}

      {/* User Profile */}
      {user && (
        <div className={cn('p-4 border-t border-gray-100 bg-gray-50/50', !isOpen && 'flex flex-col items-center gap-2')}>
          {isOpen ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20">
                  {user.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-emerald-600 font-medium">Comptable</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Déconnexion"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20">
                {user.name?.charAt(0)}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Déconnexion"
              >
                <LogOut size={16} />
              </button>
            </>
          )}
        </div>
      )}
    </aside>
  );
};
