import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
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
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-500 border-t-transparent mx-auto mb-3"></div>
          <p className="text-gray-400 text-sm">Chargement...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <img src={logoSamba} alt="SAMB'A" className="h-20 w-auto" />
          </div>
          
          <div className="space-y-6">
            <h1 className="text-5xl font-bold text-white leading-tight">
              Gérez vos<br />
              assurances<br />
              <span className="text-white/80">simplement.</span>
            </h1>
            <p className="text-white/70 text-lg max-w-md">
              Plateforme de gestion des contrats d'assurance emprunteur pour les EMF du Gabon.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-white text-xs font-medium">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <p className="text-white/70 text-sm">
              <span className="text-white font-semibold">5+ EMF</span> nous font confiance
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="bg-white p-4 rounded-xl">
              <img src={logoSamba} alt="SAMB'A" className="h-16 w-auto" />
            </div>
          </div>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">
              Connexion
            </h2>
            <p className="text-gray-500 text-sm">
              Entrez vos identifiants pour continuer
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Email
              </label>
              <div className="relative mt-1.5">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="email"
                  placeholder="vous@exemple.com"
                  className={`w-full bg-[#1a1a1a] border ${
                    errors.email ? 'border-red-500' : 'border-[#2a2a2a]'
                  } rounded-lg py-2.5 pl-10 pr-4 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all`}
                  {...register('email')}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Mot de passe
              </label>
              <div className="relative mt-1.5">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full bg-[#1a1a1a] border ${
                    errors.password ? 'border-red-500' : 'border-[#2a2a2a]'
                  } rounded-lg py-2.5 pl-10 pr-10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all`}
                  {...register('password')}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Options Row */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 rounded border-[#2a2a2a] bg-[#1a1a1a] text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 focus:ring-offset-[#0f0f0f]"
                />
                <span className="text-gray-500 text-xs">Se souvenir</span>
              </label>
              <a href="#" className="text-emerald-500 hover:text-emerald-400 text-xs font-medium transition-colors">
                Mot de passe oublié ?
              </a>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg shadow-emerald-500/25"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Connexion...</span>
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Se connecter
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          {/* Help */}
          <div className="mt-6 pt-6 border-t border-[#1a1a1a]">
            <p className="text-gray-600 text-xs text-center">
              Problème de connexion ?{' '}
              <a href="#" className="text-emerald-500 hover:text-emerald-400 hover:underline">
                Contactez le support
              </a>
            </p>
          </div>

          {/* Footer */}
          <p className="text-gray-700 text-[10px] text-center mt-8">
            © 2024 SAMB'A Assurances Gabon S.A.
          </p>
        </div>
      </div>
    </div>
  )
}
