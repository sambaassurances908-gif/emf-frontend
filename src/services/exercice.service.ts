import api from '../lib/api';
import {
    Exercice,
    CreateExercicePayload,
    UpdateExercicePayload,
    CloturerExercicePayload,
    ReouvrirExercicePayload,
    ExerciceComparaison
} from '@/types/exercice.types';

export const exerciceService = {
    // 1. Dashboard et Stats
    getDashboard: async () => {
        const response = await api.get('/exercices/dashboard');
        return response.data; // Expected to return ExerciceDashboardStats
    },

    getCourant: async () => {
        const response = await api.get('/exercices/courant');
        return response.data;
    },

    comparer: async (annees: number[]) => {
        const response = await api.post<ExerciceComparaison[]>('/exercices/comparaison', { annees });
        return response.data;
    },

    // 2. Gestion (CRUD)
    getAll: async (params?: { statut?: string; annee?: number; page?: number; per_page?: number }) => {
        const response = await api.get<{ data: Exercice[]; meta: any }>('/exercices', { params });
        // Handle potentially wrapped response
        const rawData = response.data;
        if ((rawData as any).data) return (rawData as any).data;
        return rawData;
    },

    create: async (data: CreateExercicePayload) => {
        const response = await api.post<Exercice>('/exercices', data);
        const rawData = response.data;
        return (rawData as any).data || rawData;
    },

    getById: async (id: number) => {
        const response = await api.get<Exercice>(`/exercices/${id}`);
        const rawData = response.data;
        return (rawData as any).data || rawData;
    },

    update: async (id: number, data: UpdateExercicePayload) => {
        const response = await api.put<Exercice>(`/exercices/${id}`, data);
        const rawData = response.data;
        return (rawData as any).data || rawData;
    },

    // 3. Actions Spécifiques
    cloturer: async (id: number, data: CloturerExercicePayload) => {
        const response = await api.put<Exercice>(`/exercices/${id}/cloturer`, data);
        const rawData = response.data;
        return (rawData as any).data || rawData;
    },

    reouvrir: async (id: number, data: ReouvrirExercicePayload) => {
        const response = await api.put<Exercice>(`/exercices/${id}/reouvrir`, data);
        const rawData = response.data;
        return (rawData as any).data || rawData;
    },

    recalculer: async (id: number) => {
        const response = await api.post(`/exercices/${id}/recalculer`);
        return response.data;
    },

    getRapport: async (id: number) => {
        const response = await api.get(`/exercices/${id}/rapport`);
        const rawData = response.data;
        // The rapport endpoint might return { data: { ... } } or just { ... }
        return (rawData as any).data || rawData;
    },
};
