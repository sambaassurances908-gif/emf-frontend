// src/lib/axios.ts
import axios, { AxiosError } from 'axios'

// Adapter ici si ton backend n'est pas sur 127.0.0.1:8000
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

const instance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // utile si tu utilises Laravel Sanctum
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

// Ajout automatique du token (si tu utilises un token Bearer)
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Gestion globale des erreurs (401, 419, etc.)
instance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status

      // Non authentifié / token expiré
      if (status === 401 || status === 419) {
        localStorage.removeItem('token')
        // Optionnel : nettoyer aussi l'utilisateur si tu as un store
        // window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  },
)

export default instance
