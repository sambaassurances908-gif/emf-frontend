import { Bell, Search, LogOut, User, ChevronDown, Settings } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';

export const Header = () => {
  const { user, logout, isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Déterminer le nom de l'EMF de manière fiable
  const getEmfName = () => {
    if (user?.emf?.sigle) return user.emf.sigle;
    const emfId = user?.emf_id;
    if (emfId === 1) return 'BAMBOO';
    if (emfId === 2) return 'COFIDEC';
    if (emfId === 3) return 'BCEG';
    if (emfId === 4) return 'EDG';
    if (emfId === 5) return 'SODEC';
    return user?.role || 'Utilisateur';
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 h-16 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Search */}
      <div className="flex-1 max-w-lg">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="Rechercher un contrat, client..."
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all text-sm"
            aria-label="Rechercher"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Search Button (Mobile) */}
        <button 
          type="button"
          className="md:hidden w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          aria-label="Rechercher"
        >
          <Search className="h-5 w-5 text-gray-600" />
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" aria-hidden="true"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-card border border-gray-100 py-2 z-50 animate-fade-in">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Notifications</h3>
                <p className="text-xs text-gray-500">Vous avez 3 nouvelles notifications</p>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Bell className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">Nouveau sinistre déclaré</p>
                        <p className="text-xs text-gray-500 truncate">Un nouveau sinistre a été déclaré...</p>
                        <p className="text-xs text-gray-400 mt-1">Il y a {i} heure{i > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-gray-100">
                <button className="w-full text-center text-sm font-semibold text-emerald-500 hover:text-emerald-600 transition-colors">
                  Voir toutes les notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-200 mx-1"></div>

        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-1.5 hover:bg-gray-100 rounded-xl transition-colors"
            aria-label="Menu utilisateur"
            aria-expanded={showUserMenu ? 'true' : 'false'}
            aria-haspopup="true"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20">
              {user?.name?.charAt(0)}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-bold text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{getEmfName()}</p>
            </div>
            <ChevronDown className={`h-4 w-4 text-gray-400 hidden md:block transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {showUserMenu && (
            <div 
              className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-card border border-gray-100 py-2 z-50 animate-fade-in"
              role="menu"
              aria-orientation="vertical"
            >
              {/* User Info Header */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    navigate('/profile');
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  role="menuitem"
                >
                  <User className="h-4 w-4 text-gray-400" />
                  Mon profil
                </button>
                
                {isAdmin() && (
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    role="menuitem"
                  >
                    <Settings className="h-4 w-4 text-gray-400" />
                    Paramètres
                  </button>
                )}
              </div>

              <div className="border-t border-gray-100 pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  role="menuitem"
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
