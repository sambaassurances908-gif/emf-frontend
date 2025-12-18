import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  History, 
  FileBarChart,
  ChevronLeft,
  HelpCircle,
  LogOut,
  AlertTriangle,
  FileCheck,
  CheckSquare,
  Shield,
  BarChart3,
  Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import logoSamba from '@/assets/logo-samba.png';

interface FpdgSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

type MenuItem = {
  icon: React.ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;
  label: string;
  path: string;
  description?: string;
  badge?: number;
};

type MenuSection = {
  title: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  items: MenuItem[];
};

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active = false, 
  collapsed = false,
  to,
  description,
  badge
}: { 
  icon: React.ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  to: string;
  description?: string;
  badge?: number;
}) => (
  <Link
    to={to}
    className={cn(
      'flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-200 group relative',
      active 
        ? 'bg-amber-500 text-white font-bold shadow-lg shadow-amber-500/20' 
        : 'text-gray-600 hover:bg-amber-50 hover:text-amber-700',
      collapsed && 'justify-center px-3'
    )}
    title={collapsed ? label : undefined}
  >
    <Icon size={20} strokeWidth={active ? 2.5 : 2} className="flex-shrink-0" />
    {!collapsed && (
      <div className="flex flex-col flex-1">
        <span className={cn('text-sm', active ? 'font-bold tracking-wide' : 'font-semibold')}>
          {label}
        </span>
        {description && !active && (
          <span className="text-xs text-gray-400 group-hover:text-amber-500">
            {description}
          </span>
        )}
      </div>
    )}
    {badge !== undefined && badge > 0 && (
      <span className={cn(
        'absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs font-bold rounded-full',
        active ? 'bg-white text-amber-600' : 'bg-red-500 text-white'
      )}>
        {badge}
      </span>
    )}
  </Link>
);

export const FpdgSidebar = ({ isOpen, onToggle }: FpdgSidebarProps) => {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const menuSections: MenuSection[] = [
    {
      title: 'Tableau de bord',
      icon: LayoutDashboard,
      items: [
        { 
          icon: LayoutDashboard, 
          label: 'Vue d\'ensemble', 
          path: '/fpdg',
          description: 'Dashboard exécutif'
        },
        { 
          icon: BarChart3, 
          label: 'Statistiques', 
          path: '/fpdg/statistiques',
          description: 'Indicateurs clés'
        },
      ]
    },
    {
      title: 'Sinistres',
      icon: AlertTriangle,
      items: [
        { 
          icon: AlertTriangle, 
          label: 'Tous les sinistres', 
          path: '/fpdg/sinistres',
          description: 'Liste complète'
        },
        { 
          icon: FileCheck, 
          label: 'À valider', 
          path: '/fpdg/sinistres/validation',
          description: 'Quittances en attente'
        },
        { 
          icon: CheckSquare, 
          label: 'À clôturer', 
          path: '/fpdg/sinistres/cloture',
          description: 'Sinistres à finaliser'
        },
      ]
    },
    {
      title: 'Finance',
      icon: Wallet,
      items: [
        { 
          icon: Receipt, 
          label: 'Quittances', 
          path: '/fpdg/quittances',
          description: 'Validation & paiement'
        },
        { 
          icon: History, 
          label: 'Historique', 
          path: '/fpdg/historique',
          description: 'Paiements effectués'
        },
        { 
          icon: FileBarChart, 
          label: 'Rapports', 
          path: '/fpdg/rapports',
          description: 'Rapports financiers'
        },
      ]
    },
  ];

  const isActive = (path: string) => {
    if (path === '/fpdg') {
      return location.pathname === '/fpdg';
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
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <img src={logoSamba} alt="SAMB'A" className="h-8 w-auto" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">SAMB'A</span>
              <p className="text-[10px] text-amber-600 font-semibold -mt-0.5">ESPACE FPDG</p>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
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
      <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
        {menuSections.map((section) => (
          <div key={section.title}>
            {isOpen && (
              <div className="flex items-center gap-2 text-amber-600 mb-3 px-2">
                <section.icon size={14} />
                <span className="text-xs font-bold uppercase tracking-wider">{section.title}</span>
              </div>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <SidebarItem
                  key={item.path}
                  icon={item.icon}
                  label={item.label}
                  active={isActive(item.path)}
                  collapsed={!isOpen}
                  to={item.path}
                  description={item.description}
                  badge={item.badge}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Aide */}
      {isOpen && (
        <div className="mx-4 mb-4">
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle size={16} className="text-gray-500" />
              <h4 className="font-semibold text-gray-700 text-sm">Support</h4>
            </div>
            <a 
              href="https://wa.me/241060086262" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full bg-amber-500 text-white text-xs font-bold py-2.5 rounded-xl shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
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
                <div className="w-11 h-11 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-amber-500/20">
                  {user.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-amber-600 font-medium">Fondateur Président Directeur Général</p>
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
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-amber-500/20">
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
