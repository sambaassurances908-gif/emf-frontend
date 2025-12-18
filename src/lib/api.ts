/**
 * Client API Axios avec gestion automatique d'authentification et refresh token
 * ✅ 100% TypeScript Strict Mode - Toutes erreurs Axios résolues
 */

import axios, { 
  AxiosError, 
  InternalAxiosRequestConfig, 
  AxiosResponse 
} from 'axios';

// Interface pour étendre la configuration Axios avec _retry
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Types de réponses API
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
}

// Configuration de base
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
  timeout: 15000, // 15 secondes
});

// ✅ Intercepteur de requête - Typage correct InternalAxiosRequestConfig
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Ajout automatique du token Bearer
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    // Ajout automatique de l'emf_id UNIQUEMENT pour les requêtes GET
    // NE PAS ajouter pour POST/PUT/DELETE (le backend gère via les relations)
    const emfId = localStorage.getItem('emf_id');
    if (emfId && config.method?.toLowerCase() === 'get') {
      // Vérifier si emf_id est déjà dans les params de la requête
      const hasEmfIdInParams = config.params && config.params.emf_id !== undefined;
      const hasEmfIdInUrl = config.url && config.url.includes('emf_id');
      
      // N'ajouter que si pas déjà présent
      if (!hasEmfIdInParams && !hasEmfIdInUrl) {
        config.params = { ...config.params, emf_id: emfId };
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Intercepteur de réponse - Typage correct
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig | undefined;

    // Gestion automatique du refresh token pour erreur 401
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      // NE PAS faire de refresh automatique pour les requêtes POST/PUT/DELETE
      // Laisser le composant gérer l'erreur et afficher un message approprié
      const isModifyingRequest = ['post', 'put', 'patch', 'delete'].includes(
        originalRequest.method?.toLowerCase() || ''
      );
      
      if (isModifyingRequest) {
        console.warn('⚠️ 401 sur une requête modificatrice - pas de refresh automatique');
        // Retourner l'erreur sans rediriger
        return Promise.reject(error);
      }

      try {
        console.log('🔄 Refresh token en cours...');
        
        // Tenter de rafraîchir le token
        const refreshResponse = await api.post<
          ApiSuccessResponse<{ token: string }>
        >('/auth/refresh');
        const token = refreshResponse.data.data.token;

        // Sauvegarder le nouveau token
        localStorage.setItem('token', token);
        console.log('✅ Token rafraîchi avec succès');

        // ✅ Utilisation de l'API set() d'AxiosHeaders
        if (originalRequest.headers) {
          originalRequest.headers.set('Authorization', `Bearer ${token}`);
        }
        
        return api(originalRequest);
      } catch (refreshError) {
        console.error('❌ Échec du refresh token:', refreshError);
        
        // Déconnexion complète
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('emf_id');
        
        // Redirection vers login
        window.location.href = '/login?expired=true';
        return Promise.reject(refreshError);
      }
    }

    // Logs pour debugging avec vérifications sécurisées
    const responseStatus = error.response?.status;
    const responseData = error.response?.data;
    
    if (responseStatus === 403) {
      console.warn('🚫 Accès interdit:', responseData?.message || '403 Forbidden');
    } else if (responseStatus && responseStatus >= 500) {
      console.error('💥 Erreur serveur:', responseData?.message || 'Erreur serveur');
    } else if (!error.response) {
      console.error('🌐 Erreur réseau:', error.message);
    }

    return Promise.reject(error);
  }
);

// Utilitaires pratiques ✅ Typés parfaitement
export const apiUtils = {
  /**
   * Déconnecter complètement l'utilisateur
   */
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('emf_id');
    window.location.href = '/login';
  },

  /**
   * Vérifier l'état d'authentification
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  /**
   * Récupérer les données utilisateur
   */
  getUser: <T = unknown>(): T | null => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) as T : null;
    } catch {
      return null;
    }
  },

  /**
   * Récupérer l'ID de l'EMF
   */
  getEmfId: (): string | null => {
    return localStorage.getItem('emf_id');
  },
};

// Export par défaut pour compatibilité avec les hooks existants
export default api;
