import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import logoSamba from '@/assets/logo-samba.png'

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Minimum 6 caractères'),
})

type LoginFormData = z.infer<typeof loginSchema>

export const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, isLoading: authLoading, getDashboardPath, user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false) // Flag pour éviter double redirection

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  // Redirection si déjà authentifié (mais PAS pendant la soumission du formulaire)
  useEffect(() => {
    // Ne pas rediriger pendant la soumission - laisser onSubmit gérer la redirection
    if (isSubmitting) {
      console.log('⏳ [LoginPage useEffect] Soumission en cours, skip redirection')
      return
    }

    if (!authLoading && isAuthenticated && user) {
      // Pour admin, emf_id doit être null
      const emfId = user.role === 'admin' ? null : (user.emf_id || null)
      
      console.log('🔍 [LoginPage useEffect] User:', user.name, '| Role:', user.role, '| emf_id:', emfId)
      
      // Nettoyer ou stocker emf_id dans localStorage
      if (emfId && emfId > 0) {
        localStorage.setItem('emf_id', emfId.toString())
      } else {
        localStorage.removeItem('emf_id') // Nettoyer pour les admins
      }

      // IMPORTANT: Ne pas utiliser 'from' si c'est un dashboard EMF pour un admin
      let targetPath = getDashboardPath()
      if (from && user.role !== 'admin') {
        targetPath = from
      }
      
      console.log('🚀 [LoginPage useEffect] Redirection vers:', targetPath)
      
      navigate(targetPath, { 
        replace: true,
        state: { emf_id: emfId }
      })
    }
  }, [isAuthenticated, authLoading, user, navigate, from, getDashboardPath, isSubmitting])

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setIsSubmitting(true) // Empêcher le useEffect de rediriger
    
    try {
      await login(data)
      
      // Récupérer immédiatement le user et rediriger
      const { user: currentUser, getDashboardPath: getPath } = useAuthStore.getState()
      
      // Pour admin, emf_id doit être null
      const emfId = currentUser?.role === 'admin' ? null : (currentUser?.emf_id || null)
      
      console.log('🔍 [onSubmit] User:', currentUser?.name, '| Role:', currentUser?.role, '| emf_id:', emfId)
      
      // Nettoyer ou stocker emf_id dans localStorage
      if (emfId && emfId > 0) {
        localStorage.setItem('emf_id', emfId.toString())
      } else {
        localStorage.removeItem('emf_id') // Nettoyer pour les admins
      }

      const dashboardPath = getPath()
      console.log('✅ [onSubmit] Login réussi, redirection vers:', dashboardPath)
      
      // Naviguer immédiatement
      navigate(dashboardPath, { 
        replace: true,
        state: { emf_id: emfId }
      })
    } catch (error) {
      console.error('❌ Erreur login:', error)
      setIsSubmitting(false) // Réactiver le useEffect en cas d'erreur
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-orange-50 to-amber-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F48232] mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-amber-50 flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-200">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img src={logoSamba} alt="SAMB'A Assurances" className="h-20 w-auto" />
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Bienvenue
              </h1>
              <p className="text-gray-500">
                Connectez-vous à SAMB'A Assurances
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Adresse email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="nom@exemple.com"
                    className={`w-full bg-gray-50 border ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    } rounded-full py-3.5 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#F48232] focus:ring-2 focus:ring-[#F48232]/20 transition-all`}
                    {...register('email')}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 pl-4">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`w-full bg-gray-50 border ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    } rounded-full py-3.5 pl-12 pr-12 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#F48232] focus:ring-2 focus:ring-[#F48232]/20 transition-all`}
                    {...register('password')}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1 pl-4">{errors.password.message}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 bg-gray-50 text-[#F48232] focus:ring-[#F48232] focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-gray-500 group-hover:text-gray-700 transition-colors">
                    Se souvenir de moi
                  </span>
                </label>
                <a
                  href="#"
                  className="text-gray-500 hover:text-[#F48232] underline underline-offset-2 transition-colors"
                >
                  Mot de passe oublié ?
                </a>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#F48232] hover:bg-[#e0742a] text-white font-bold py-3.5 rounded-full text-base transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-[#F48232]/30"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Connexion...</span>
                  </div>
                ) : (
                  'Se connecter'
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-gray-400 text-sm">ou</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Demo Access Hint */}
            <div className="text-center">
              <p className="text-gray-500 text-sm">
                Besoin d'aide pour vous connecter ?
              </p>
              <a
                href="#"
                className="text-[#F48232] hover:text-[#e0742a] text-sm font-semibold underline underline-offset-2 transition-colors"
              >
                Contactez l'administrateur
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-gray-400 text-xs">
              © 2024 SAMB'A Assurances Gabon S.A. - Tous droits réservés
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
