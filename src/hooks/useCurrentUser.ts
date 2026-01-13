import { useAuthStore } from '@/store/authStore'

export const useCurrentUser = () => {
    const { user, isAuthenticated, isLoading } = useAuthStore()

    return {
        user,
        userEmfId: user?.emf_id,
        userEmfSigle: user?.emf?.sigle,
        isAuthenticated,
        isLoading,
        role: user?.role
    }
}
